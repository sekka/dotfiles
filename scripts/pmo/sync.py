#!/usr/bin/env python3
"""PMO Excel ⇄ YAML sync CLI."""
from __future__ import annotations
import argparse
import sys
from pathlib import Path

import json

from lib.yaml_io import load_pmo_yaml, save_pmo_yaml, update_task_field
from lib.excel_io import read_rows, write_cells, append_row
from lib.ownership import resolve_ownership
from lib.reconcile import match_rows, merge_matched, build_excel_appends, build_yaml_appends, classify_unmatched
from lib.snapshot import load_snapshot, save_snapshot, Snapshot
from lib.backup import backup_excel, prune_backups


def load_deleted_ids(pdir: Path) -> dict[str, set[str]]:
    path = pdir / ".pmo" / "deleted-ids.json"
    if not path.exists():
        return {"excel": set(), "yaml": set()}
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return {
        "excel": set(data.get("excel", [])),
        "yaml": set(data.get("yaml", [])),
    }


def save_deleted_ids(pdir: Path, deleted: dict[str, set[str]]) -> None:
    path = pdir / ".pmo" / "deleted-ids.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(
            {"excel": sorted(deleted["excel"]), "yaml": sorted(deleted["yaml"])},
            f,
            ensure_ascii=False,
            indent=2,
        )


def project_dir(slug: str) -> Path:
    base = Path.home() / "prj" / slug
    if not base.exists():
        print(f"error: project not found: {base}", file=sys.stderr)
        sys.exit(2)
    return base


def cmd_doctor(args: argparse.Namespace) -> int:
    pdir = project_dir(args.project)
    pmo_path = pdir / "pmo.yaml"
    pmo = load_pmo_yaml(pmo_path)
    issues: list[str] = []
    ids: list[str] = []
    for t in pmo.tasks:
        if "id" not in t or not t["id"]:
            issues.append(f"task missing id: {t}")
        else:
            ids.append(t["id"])
    seen: set[str] = set()
    for tid in ids:
        if tid in seen:
            issues.append(f"duplicate id: {tid}")
        seen.add(tid)
    try:
        resolve_ownership(pmo.excel.columns)
    except ValueError as e:
        issues.append(str(e))
    if issues:
        for line in issues:
            print(f"⚠️  {line}")
        return 1
    print(f"✅ {len(ids)} tasks, no issues found")
    return 0


def make_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="sync.py", description="PMO Excel ⇄ YAML sync")
    sub = p.add_subparsers(dest="command", required=True)
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--project", required=True, help="project slug (~/prj/<slug>/)")

    sp = sub.add_parser("doctor", parents=[common], help="validate pmo.yaml")
    sp.set_defaults(func=cmd_doctor)

    sp = sub.add_parser("sync", parents=[common], help="bidirectional sync")
    sp.add_argument("sheet", choices=["wbs"], help="sheet to sync")
    sp.set_defaults(func=lambda a: cmd_sync(a, mode="sync"))

    sp = sub.add_parser("pull", parents=[common], help="Excel → YAML only")
    sp.add_argument("sheet", choices=["wbs"])
    sp.set_defaults(func=lambda a: cmd_sync(a, mode="pull"))

    sp = sub.add_parser("push", parents=[common], help="YAML → Excel only")
    sp.add_argument("sheet", choices=["wbs"])
    sp.set_defaults(func=lambda a: cmd_sync(a, mode="push"))
    return p


def main(argv: list[str] | None = None) -> int:
    parser = make_parser()
    args = parser.parse_args(argv)
    return args.func(args)


def cmd_sync(args: argparse.Namespace, *, mode: str) -> int:
    pdir = project_dir(args.project)
    pmo_path = pdir / "pmo.yaml"
    pmo = load_pmo_yaml(pmo_path)
    excel_path = pdir / pmo.excel.file
    if not excel_path.exists():
        print(f"error: excel file not found: {excel_path}", file=sys.stderr)
        return 2

    # load snapshot from previous run (empty on first run)
    prev_snapshot = load_snapshot(pdir / ".pmo" / "last-sync.json")
    prev_deleted = load_deleted_ids(pdir)

    ownership = resolve_ownership(pmo.excel.columns)
    column_letters = [c.col for c in pmo.excel.columns]

    try:
        excel_rows_raw = read_rows(
            excel_path,
            sheet=pmo.excel.sheet,
            data_start_row=pmo.excel.data_start_row,
            columns=column_letters,
            id_column=pmo.excel.id_column,
        )
    except PermissionError:
        print(
            f"error: cannot read {excel_path}. Close Excel and retry.",
            file=sys.stderr,
        )
        return 3

    excel_rows = []
    for idx, raw in enumerate(excel_rows_raw):
        row_num = pmo.excel.data_start_row + idx
        raw["row"] = row_num
        excel_rows.append(raw)

    match = match_rows(pmo.tasks, excel_rows, id_column=pmo.excel.id_column)
    merge = merge_matched(match.matched, ownership)

    excel_updates = list(merge.excel_updates)
    yaml_updates = list(merge.yaml_updates)

    snapshot_ids = set(prev_snapshot.rows)

    # classify yaml_only: tasks in YAML missing from Excel
    #   id_field = "id" (yaml task dict key)
    yaml_only_new, yaml_only_deleted = classify_unmatched(
        match.yaml_only, snapshot_ids, id_field="id"
    )

    # classify excel_only: rows in Excel missing from YAML
    #   id_field = pmo.excel.id_column (column letter, e.g. "A")
    excel_only_new, excel_only_deleted = classify_unmatched(
        match.excel_only, snapshot_ids, id_field=pmo.excel.id_column
    )

    # build appends using only the *new* items (not deletions)
    excel_appends = build_excel_appends(yaml_only_new, ownership) if mode != "pull" else []
    yaml_appends = build_yaml_appends(excel_only_new, ownership) if mode != "push" else []

    if mode == "pull":
        excel_updates = []
    if mode == "push":
        yaml_updates = []

    # backup Excel before any write (sync/push only, skip when nothing to write)
    if mode != "pull" and (excel_updates or excel_appends):
        try:
            dest = backup_excel(excel_path, pdir)
            if dest is not None:
                print(f"  backup: {dest}")
        except OSError as exc:
            print(f"error: backup failed: {exc}", file=sys.stderr)
            return 4

    # apply Excel changes
    if excel_updates:
        try:
            write_cells(excel_path, sheet=pmo.excel.sheet, updates=excel_updates)
        except PermissionError:
            print(f"error: cannot write {excel_path}. Close Excel and retry.", file=sys.stderr)
            return 3
    for row_values in excel_appends:
        append_row(
            excel_path,
            sheet=pmo.excel.sheet,
            data_start_row=pmo.excel.data_start_row,
            id_column=pmo.excel.id_column,
            values=row_values,
        )

    # apply YAML changes
    for tid, field, value in yaml_updates:
        update_task_field(pmo, task_id=tid, field=field, value=value)
    for new_task in yaml_appends:
        pmo.tasks.append(new_task)
        pmo._raw["tasks"].append(new_task)
    if yaml_updates or yaml_appends:
        save_pmo_yaml(pmo, pmo_path)

    # snapshot
    snap = Snapshot(rows={t["id"]: dict(t) for t in pmo.tasks if "id" in t})
    save_snapshot(snap, pdir / ".pmo" / "last-sync.json")

    # prune old backups (sync/push only)
    if mode != "pull":
        prune_backups(pdir)

    # compute current full deletion sets (rewritten each run so restorations are tracked)
    current_excel_deleted = {t["id"] for t in yaml_only_deleted}
    current_yaml_deleted = {t[pmo.excel.id_column] for t in excel_only_deleted}
    save_deleted_ids(pdir, {"excel": current_excel_deleted, "yaml": current_yaml_deleted})

    # summary
    print(f"mode={mode}")
    print(f"  Excel updates: {len(excel_updates)} cells, {len(excel_appends)} new rows")
    print(f"  YAML updates: {len(yaml_updates)} fields, {len(yaml_appends)} new tasks")
    if match.excel_only and mode == "push":
        print(f"  ⚠️  {len(match.excel_only)} rows in Excel not in YAML (push mode, kept)")
    if match.yaml_only and mode == "pull":
        print(f"  ⚠️  {len(match.yaml_only)} tasks in YAML not in Excel (pull mode, kept)")
    # deletion warnings (snapshot-based, suppress already-warned ids)
    if yaml_only_deleted and mode in ("sync", "push"):
        new_excel_deleted = [t for t in yaml_only_deleted if t["id"] not in prev_deleted["excel"]]
        if new_excel_deleted:
            ids = ", ".join(t["id"] for t in new_excel_deleted)
            print(f"  ⚠️  deleted in excel (kept in yaml): {ids}")
    if excel_only_deleted and mode in ("sync", "pull"):
        new_yaml_deleted = [t for t in excel_only_deleted if t[pmo.excel.id_column] not in prev_deleted["yaml"]]
        if new_yaml_deleted:
            ids = ", ".join(t[pmo.excel.id_column] for t in new_yaml_deleted)
            print(f"  ⚠️  deleted in yaml (kept in excel): {ids}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
