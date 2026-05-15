#!/usr/bin/env python3
"""PMO Excel → YAML one-way regeneration CLI.

Excel is the source of truth. Each `pull` reads the WBS sheet and rewrites
the `tasks` section of WBS.yaml atomically; the project/excel header blocks
are preserved.
"""
from __future__ import annotations

import argparse
import sys
import warnings
from pathlib import Path
from typing import Any

# openpyxl warns on every load that it cannot round-trip Conditional Formatting
# or Data Validation extensions. Pull is read-only, so the warnings are noise.
warnings.filterwarnings(
    "ignore",
    message=r".*extension is not supported and will be removed",
    category=UserWarning,
    module=r"openpyxl\..*",
)

from ruamel.yaml.comments import CommentedMap

from lib.excel_io import read_rows
from lib.schema import WBS_SCHEMA
from lib.yaml_io import load_yaml, save_yaml


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


def _row_to_task(row: dict[str, Any], columns: list) -> CommentedMap:
    """Convert a col-letter-keyed Excel row to a field-keyed task in schema order."""
    task = CommentedMap()
    for spec in columns:
        task[spec.field] = row.get(spec.col)
    return task


def cmd_init(args: argparse.Namespace) -> int:
    slug = args.project
    pdir = Path.home() / "prj" / slug
    pdir.mkdir(parents=True, exist_ok=True)
    pmo_path = pdir / "WBS.yaml"

    if pmo_path.exists() and not args.force:
        print(f"error: {pmo_path} already exists. Use --force to overwrite.", file=sys.stderr)
        return 1

    doc = CommentedMap()
    proj = CommentedMap()
    proj["name"] = slug
    proj["slug"] = slug
    doc["project"] = proj

    excel = CommentedMap()
    excel["file"] = args.file if args.file else "WBS.xlsx"
    doc["excel"] = excel

    doc["tasks"] = []

    save_yaml(doc, pmo_path)
    print(f"created {pmo_path}")
    return 0


def cmd_doctor(args: argparse.Namespace) -> int:
    pdir = project_dir(args.project, override=getattr(args, "pdir", None))
    pmo_path = pdir / "WBS.yaml"
    if not pmo_path.exists():
        print(f"error: {pmo_path} not found. Run 'init' first.", file=sys.stderr)
        return 2
    doc = load_yaml(pmo_path)
    tasks = doc.get("tasks") or []
    issues: list[str] = []
    seen: set[str] = set()
    for t in tasks:
        tid = t.get("id") if isinstance(t, dict) else None
        if not tid:
            issues.append(f"task missing id: {t}")
            continue
        if tid in seen:
            issues.append(f"duplicate id: {tid}")
        seen.add(tid)
    if issues:
        for line in issues:
            print(f"⚠️  {line}")
        return 1
    print(f"✅ {len(seen)} tasks, no issues found")
    return 0


def cmd_pull(args: argparse.Namespace) -> int:
    pdir = project_dir(args.project, override=getattr(args, "pdir", None))
    pmo_path = pdir / "WBS.yaml"
    if not pmo_path.exists():
        print(f"error: {pmo_path} not found. Run 'init' first.", file=sys.stderr)
        return 2

    doc = load_yaml(pmo_path)
    excel_file = doc.get("excel", {}).get("file")
    if not excel_file:
        print(f"error: {pmo_path} has no 'excel.file' field", file=sys.stderr)
        return 2

    excel_path = pdir / excel_file
    if not excel_path.exists():
        print(f"error: excel file not found: {excel_path}", file=sys.stderr)
        return 2

    schema = WBS_SCHEMA
    try:
        rows = read_rows(
            excel_path,
            sheet=schema["sheet"],
            data_start_row=schema["data_start_row"],
            columns=[c.col for c in schema["columns"]],
            id_column=schema["id_column"],
        )
    except PermissionError:
        print(f"error: cannot read {excel_path}. Close Excel and retry.", file=sys.stderr)
        return 3

    tasks = [_row_to_task(r, schema["columns"]) for r in rows]
    doc["tasks"] = tasks
    save_yaml(doc, pmo_path)

    print(f"pulled {len(tasks)} tasks from {excel_path.name}")
    return 0


def make_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="sync.py", description="PMO Excel → YAML one-way pull")
    sub = p.add_subparsers(dest="command", required=True)

    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--project", required=False, help="project slug (~/prj/<slug>/)")
    common.add_argument("--pdir", type=Path, default=None, help="explicit project dir (overrides --project)")

    sp = sub.add_parser("doctor", parents=[common], help="validate WBS.yaml")
    sp.set_defaults(func=cmd_doctor)

    sp = sub.add_parser("pull", parents=[common], help="regenerate WBS.yaml from Excel")
    sp.set_defaults(func=cmd_pull)

    init = sub.add_parser("init", help="create a new WBS.yaml skeleton")
    init.add_argument("--project", required=True, help="project slug (~/prj/<slug>/)")
    init.add_argument("--file", default=None, help="Excel filename (default: WBS.xlsx)")
    init.add_argument("--force", action="store_true", help="overwrite existing WBS.yaml")
    init.set_defaults(func=cmd_init)

    return p


def main(argv: list[str] | None = None) -> int:
    parser = make_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
