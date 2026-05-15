#!/usr/bin/env python3
"""PMO Excel ⇄ YAML sync CLI."""
from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path

from lib.yaml_io import load_pmo_yaml, save_pmo_yaml, update_task_field, add_task
from lib.excel_io import read_rows, write_cells, batch_append_rows
from lib.reconcile import (
    match_rows,
    merge_matched,
    build_excel_appends,
    build_yaml_appends,
    classify_unmatched,
    excel_rows_to_id_keyed,
)
from lib.snapshot import load_snapshot, save_snapshot, Snapshot, diff_against_snapshot, SnapshotDiff
from lib.backup import backup_excel, prune_backups
from lib.migrate import compute_id_assignments, scan_rows, write_id_cells


def load_deleted_ids(pdir: Path) -> dict[str, set[str]]:
    path = pdir / ".pmo" / "deleted-ids.json"
    if not path.exists():
        return {"excel": set(), "yaml": set()}
    try:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError) as exc:
        print(f"warn: deleted-ids.json unreadable ({exc}), starting fresh", file=sys.stderr)
        return {"excel": set(), "yaml": set()}
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


def _compute_new_deleted(
    prev: dict[str, set[str]],
    yaml_only_deleted: list[dict],
    excel_only_deleted: list[dict],
    excel_id_column: str,
    mode: str,
    *,
    matched_ids: set[str] | None = None,
) -> dict[str, set[str]]:
    """Compute the new deleted-id state after a sync.

    - The "active" side (matching the current mode) is set from this run's deletions.
    - The "other" side is preserved from prev, but ids that have been restored
      (i.e. now appear in matched_ids) are pruned so the next sync stops treating
      them as deleted.
    """
    result = dict(prev)
    matched = matched_ids or set()
    if mode == "pull":
        result["yaml"] = {t[excel_id_column] for t in excel_only_deleted}
        # restoration on excel side: anything matched now is no longer excel-deleted
        result["excel"] = set(prev.get("excel", set())) - matched
    elif mode == "push":
        result["excel"] = {t["id"] for t in yaml_only_deleted}
        result["yaml"] = set(prev.get("yaml", set())) - matched
    return result


def project_dir(slug: str | None, *, override: Path | None = None) -> Path:
    if override is not None:
        return override
    if slug is None:
        print("error: --project is required when --pdir is not given", file=sys.stderr)
        sys.exit(2)
    base = Path.home() / "prj" / slug
    if not base.exists():
        print(f"error: project not found: {base}", file=sys.stderr)
        sys.exit(2)
    return base


def _format_guard_error(direction: str, diff: SnapshotDiff) -> str:
    """Format a multi-line abort message describing what changed since last sync."""
    if direction == "pull":
        dest, src = "YAML", "Excel"
        force_hint = "Run 'push' first to commit YAML → Excel"
    else:  # push
        dest, src = "Excel", "YAML"
        force_hint = "Run 'pull' first to commit Excel → YAML"
    total = len(diff.modified) + len(diff.added) + len(diff.removed)
    lines = [
        f"❌ Cannot {direction}: {dest} has {total} uncommitted change(s) since last sync:",
    ]
    for tid, fields in list(diff.modified.items())[:10]:
        for fname, (old, new) in fields.items():
            lines.append(f"   - {tid}.{fname}: {old!r} → {new!r}")
    if len(diff.modified) > 10:
        lines.append(f"   (... +{len(diff.modified) - 10} more modified)")
    if diff.added:
        lines.append(f"   - added: {', '.join(diff.added[:10])}{' ...' if len(diff.added) > 10 else ''}")
    if diff.removed:
        lines.append(f"   - removed: {', '.join(diff.removed[:10])}{' ...' if len(diff.removed) > 10 else ''}")
    lines.extend([
        "",
        "Options:",
        f"  1. {force_hint}",
        f"  2. Re-run with --force to discard {dest} changes",
        f"  3. Manually resolve in {dest}, then retry {direction}",
    ])
    return "\n".join(lines)


def cmd_doctor(args: argparse.Namespace) -> int:
    pdir = project_dir(args.project, override=getattr(args, "pdir", None))
    pmo_path = pdir / "WBS.yaml"
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
    if issues:
        for line in issues:
            print(f"⚠️  {line}")
        return 1
    print(f"✅ {len(ids)} tasks, no issues found")
    return 0


def cmd_migrate_ids(args: argparse.Namespace) -> int:
    """Bootstrap empty id cells in the WBS sheet with T-NNN assignments."""
    pdir = project_dir(args.project, override=getattr(args, "pdir", None))
    pmo_path = pdir / "WBS.yaml"
    pmo = load_pmo_yaml(pmo_path)
    excel_path = pdir / pmo.excel.file
    if not excel_path.exists():
        print(f"error: excel file not found: {excel_path}", file=sys.stderr)
        return 2

    all_columns = [c.col for c in pmo.excel.columns]
    rows = scan_rows(
        excel_path,
        sheet=pmo.excel.sheet,
        data_start_row=pmo.excel.data_start_row,
        id_column=pmo.excel.id_column,
        all_columns=all_columns,
    )

    ids = [r[pmo.excel.id_column] for r in rows]
    assignments = compute_id_assignments(ids)

    if not assignments:
        print("migrated 0 rows")
        return 0

    if args.dry_run:
        for idx, new_id in assignments:
            row_num = rows[idx]["row"]
            print(f"  row {row_num}: {new_id}")
        print(f"dry-run: would migrate {len(assignments)} rows")
        return 0

    try:
        dest = backup_excel(excel_path, pdir)
        if dest is not None:
            print(f"  backup: {dest}")
    except OSError as exc:
        print(f"error: backup failed: {exc}", file=sys.stderr)
        return 4

    row_map = [r["row"] for r in rows]
    try:
        write_id_cells(
            excel_path,
            sheet=pmo.excel.sheet,
            id_column=pmo.excel.id_column,
            assignments=assignments,
            row_map=row_map,
        )
    except PermissionError:
        print(f"error: cannot write {excel_path}. Close Excel and retry.", file=sys.stderr)
        return 3

    prune_backups(pdir)
    print(f"migrated {len(assignments)} rows")
    return 0


def cmd_init(args: argparse.Namespace) -> int:
    """Create a minimal WBS.yaml skeleton for a new project."""
    from ruamel.yaml import YAML
    from ruamel.yaml.comments import CommentedMap

    yaml_rt = YAML(typ="rt")
    yaml_rt.preserve_quotes = True
    yaml_rt.width = 4096

    slug = args.project
    file_name = args.file if args.file else "WBS.xlsm"
    pdir = Path.home() / "prj" / slug
    pdir.mkdir(parents=True, exist_ok=True)
    pmo_path = pdir / "WBS.yaml"

    if pmo_path.exists() and not args.force:
        print(
            f"error: {pmo_path} already exists. Use --force to overwrite.",
            file=sys.stderr,
        )
        return 1

    doc = CommentedMap()
    project_section = CommentedMap()
    project_section["name"] = slug
    project_section["slug"] = slug
    doc["project"] = project_section

    excel_section = CommentedMap()
    excel_section["file"] = file_name
    doc["excel"] = excel_section

    doc["tasks"] = []

    with pmo_path.open("w", encoding="utf-8") as f:
        yaml_rt.dump(doc, f)

    print(f"created {pmo_path}")
    return 0


def make_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="sync.py", description="PMO Excel ⇄ YAML sync")
    sub = p.add_subparsers(dest="command", required=True)
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--project", required=False, help="project slug (~/prj/<slug>/)")
    common.add_argument("--pdir", type=Path, default=None, help="explicit project dir (overrides --project)")

    sp = sub.add_parser("doctor", parents=[common], help="validate WBS.yaml")
    sp.set_defaults(func=cmd_doctor)

    sp = sub.add_parser("pull", parents=[common], help="Excel → YAML (one-way)")
    sp.add_argument("sheet", choices=["wbs"])
    sp.add_argument("--force", action="store_true", help="skip snapshot guard")
    sp.set_defaults(func=lambda a: cmd_sync(a, mode="pull"))

    sp = sub.add_parser("push", parents=[common], help="YAML → Excel (one-way)")
    sp.add_argument("sheet", choices=["wbs"])
    sp.add_argument("--force", action="store_true", help="skip snapshot guard")
    sp.set_defaults(func=lambda a: cmd_sync(a, mode="push"))

    mig = sub.add_parser("migrate-ids", parents=[common], help="既存 xlsm の空 id 列を自動採番")
    mig.add_argument("kind", choices=["wbs"])
    mig.add_argument("--dry-run", action="store_true")
    mig.set_defaults(func=cmd_migrate_ids)

    init = sub.add_parser("init", help="新規プロジェクトの WBS.yaml スケルトンを作成")
    init.add_argument("--project", required=True, help="project slug (~/prj/<slug>/)")
    init.add_argument("--file", default=None, help="Excel ファイル名 (default: WBS.xlsm)")
    init.add_argument("--force", action="store_true", help="既存 WBS.yaml を上書き")
    init.set_defaults(func=cmd_init)
    return p


def main(argv: list[str] | None = None) -> int:
    parser = make_parser()
    args = parser.parse_args(argv)
    return args.func(args)


def cmd_sync(args: argparse.Namespace, *, mode: str) -> int:
    pdir = project_dir(args.project, override=getattr(args, "pdir", None))
    pmo_path = pdir / "WBS.yaml"
    pmo = load_pmo_yaml(pmo_path)
    excel_path = pdir / pmo.excel.file
    if not excel_path.exists():
        print(f"error: excel file not found: {excel_path}", file=sys.stderr)
        return 2

    prev_snapshot = load_snapshot(pdir / ".pmo" / "last-sync.json")
    prev_deleted = load_deleted_ids(pdir)

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

    # ------------------------------------------------------------------
    # Snapshot guard: abort if the destination side has changes since last sync.
    # Readonly fields are excluded from the comparison so formula columns
    # (whose values differ between pull-shape and push-shape representations)
    # never trigger spurious diffs.
    # ------------------------------------------------------------------
    readonly_fields = {c.field for c in pmo.excel.columns if c.readonly}
    non_readonly_cols = [c for c in pmo.excel.columns if not c.readonly]
    force = getattr(args, "force", False)
    if not force and not prev_snapshot.is_empty():
        if mode == "pull":
            # destination = YAML; compare current YAML against the YAML side
            # of the snapshot (regardless of whether last sync was pull or push)
            dest_state = [
                {k: v for k, v in t.items() if k not in readonly_fields}
                for t in pmo.tasks
            ]
            snap_side = prev_snapshot.yaml
        else:  # push
            # destination = Excel; compare current Excel against the Excel side
            # of the snapshot (regardless of whether last sync was pull or push)
            dest_state = excel_rows_to_id_keyed(
                excel_rows, non_readonly_cols, id_column=pmo.excel.id_column
            )
            snap_side = prev_snapshot.excel
        # Filter readonly fields from snap_side too: legacy snapshots (or
        # snapshots saved before a column was marked readonly) may still
        # carry those values, which would surface as spurious diffs since
        # dest_state already excludes them.
        snap_side_filtered = {
            tid: {k: v for k, v in row.items() if k not in readonly_fields}
            for tid, row in snap_side.items()
        }
        guard_diff = diff_against_snapshot(snap_side_filtered, dest_state)
        if guard_diff.has_changes():
            print(_format_guard_error(mode, guard_diff), file=sys.stderr)
            return 2

    match = match_rows(pmo.tasks, excel_rows, id_column=pmo.excel.id_column)
    merge = merge_matched(match.matched, pmo.excel.columns, direction=mode)

    excel_updates = list(merge.excel_updates)
    yaml_updates = list(merge.yaml_updates)

    # snapshot_ids is the "known IDs" set used by classify_unmatched to
    # distinguish brand-new rows from rows that were intentionally left
    # un-mirrored on the other side at a previous sync (so they don't get
    # resurrected as new). We union prev_snapshot's known IDs (both sides)
    # with prev_deleted because the latter tracks ghost ids that survive
    # across syncs.
    snapshot_ids = (
        prev_snapshot.known_ids()
        | prev_deleted.get("excel", set())
        | prev_deleted.get("yaml", set())
    )

    yaml_only_new, yaml_only_deleted = classify_unmatched(
        match.yaml_only, snapshot_ids, id_field="id"
    )
    excel_only_new, excel_only_deleted = classify_unmatched(
        match.excel_only, snapshot_ids, id_field=pmo.excel.id_column
    )

    excel_appends = build_excel_appends(yaml_only_new, pmo.excel.columns) if mode == "push" else []
    yaml_appends = (
        build_yaml_appends(excel_only_new, pmo.excel.columns, id_column=pmo.excel.id_column)
        if mode == "pull"
        else []
    )

    # backup Excel before any write (push only)
    if mode == "push" and (excel_updates or excel_appends):
        try:
            dest = backup_excel(excel_path, pdir)
            if dest is not None:
                print(f"  backup: {dest}")
        except OSError as exc:
            print(f"error: backup failed: {exc}", file=sys.stderr)
            return 4

    # apply Excel changes (push only)
    if excel_updates:
        try:
            write_cells(excel_path, sheet=pmo.excel.sheet, updates=excel_updates)
        except PermissionError:
            print(f"error: cannot write {excel_path}. Close Excel and retry.", file=sys.stderr)
            return 3
    if excel_appends:
        batch_append_rows(
            excel_path,
            sheet=pmo.excel.sheet,
            data_start_row=pmo.excel.data_start_row,
            id_column=pmo.excel.id_column,
            rows=excel_appends,
        )

    # apply YAML changes (pull only)
    for tid, field, value in yaml_updates:
        update_task_field(pmo, task_id=tid, field=field, value=value)
    for new_task in yaml_appends:
        add_task(pmo, new_task)
    if yaml_updates or yaml_appends:
        save_pmo_yaml(pmo, pmo_path)

    # ------------------------------------------------------------------
    # Take a dual-state snapshot of post-sync state.
    # yaml side  = current pmo.tasks (after any pull-side writes), id-keyed
    # excel side = post-write Excel state, id-keyed via non-readonly cols
    # Readonly fields are filtered out so the shape is invariant across modes.
    # ------------------------------------------------------------------
    snap_yaml: dict[str, dict] = {}
    for t in pmo.tasks:
        tid = t.get("id")
        if not tid:
            continue
        snap_yaml[tid] = {
            k: v for k, v in t.items() if k != "id" and k not in readonly_fields
        }

    if mode == "pull":
        # Excel is untouched by pull — use what we read at the start.
        post_excel_rows = excel_rows
    else:  # push: apply the writes we just performed in-memory.
        by_row = {er["row"]: dict(er) for er in excel_rows}
        for excel_row, col, new_val in excel_updates:
            if excel_row in by_row:
                by_row[excel_row][col] = new_val
        post_excel_rows = list(by_row.values())
        # Append synthetic rows for newly-appended Excel rows so they appear
        # in the snapshot (non-readonly columns only).
        for t in yaml_only_new:
            synth: dict = {"row": -1}
            for c in non_readonly_cols:
                if c.field in t:
                    synth[c.col] = t[c.field]
            post_excel_rows.append(synth)
    keyed = excel_rows_to_id_keyed(
        post_excel_rows, non_readonly_cols, id_column=pmo.excel.id_column
    )
    snap_excel = {t["id"]: {k: v for k, v in t.items() if k != "id"} for t in keyed}

    snap = Snapshot(yaml=snap_yaml, excel=snap_excel)
    save_snapshot(snap, pdir / ".pmo" / "last-sync.json")

    if mode == "push":
        prune_backups(pdir)

    matched_ids = set(match.matched.keys())
    new_deleted = _compute_new_deleted(
        prev_deleted,
        yaml_only_deleted,
        excel_only_deleted,
        pmo.excel.id_column,
        mode,
        matched_ids=matched_ids,
    )
    save_deleted_ids(pdir, new_deleted)

    print(f"mode={mode}")
    print(f"  Excel updates: {len(excel_updates)} cells, {len(excel_appends)} new rows")
    print(f"  YAML updates: {len(yaml_updates)} fields, {len(yaml_appends)} new tasks")
    if match.excel_only and mode == "push":
        print(f"  ⚠️  {len(match.excel_only)} rows in Excel not in YAML (push mode, kept)")
    if match.yaml_only and mode == "pull":
        print(f"  ⚠️  {len(match.yaml_only)} tasks in YAML not in Excel (pull mode, kept)")
    if yaml_only_deleted and mode == "push":
        new_excel_deleted = [t for t in yaml_only_deleted if t["id"] not in prev_deleted["excel"]]
        if new_excel_deleted:
            ids = ", ".join(t["id"] for t in new_excel_deleted)
            print(f"  ⚠️  deleted in excel (kept in yaml): {ids}")
    if excel_only_deleted and mode == "pull":
        new_yaml_deleted = [t for t in excel_only_deleted if t[pmo.excel.id_column] not in prev_deleted["yaml"]]
        if new_yaml_deleted:
            ids = ", ".join(t[pmo.excel.id_column] for t in new_yaml_deleted)
            print(f"  ⚠️  deleted in yaml (kept in excel): {ids}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
