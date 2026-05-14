#!/usr/bin/env python3
"""PMO Excel ⇄ YAML sync CLI."""
from __future__ import annotations
import argparse
import sys
from pathlib import Path

from lib.yaml_io import load_pmo_yaml, save_pmo_yaml, update_task_field
from lib.excel_io import read_rows, write_cells, append_row
from lib.ownership import resolve_ownership
from lib.reconcile import match_rows, merge_matched, build_excel_appends, build_yaml_appends
from lib.snapshot import load_snapshot, save_snapshot, Snapshot


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
    # stub - implemented in Task 13
    print(f"[stub] mode={mode} project={args.project} sheet={args.sheet}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
