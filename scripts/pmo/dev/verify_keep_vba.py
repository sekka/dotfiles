"""
verify_keep_vba.py — Verify openpyxl keep_vba=True round-trip behavior.

Checks which ZIP parts are preserved / lost when an xlsm is loaded with
openpyxl (keep_vba=True) and saved back to a temporary file.

Usage:
    uv run python dev/verify_keep_vba.py [path_to.xlsm]

Default input: ~/prj/_oaks-test/WBS.xlsm
Exit code:
    0  VBA preserved (expected losses OK)
    1  vbaProject.bin missing after round-trip (NG)
"""

import sys
import tempfile
import zipfile
from pathlib import Path


def get_parts_with_sizes(zip_path: Path) -> dict[str, int]:
    """Return {name: uncompressed_size} for all entries in a ZIP."""
    with zipfile.ZipFile(zip_path, "r") as zf:
        return {info.filename: info.file_size for info in zf.infolist()}


def main(xlsm_path: Path) -> int:
    print(f"Input: {xlsm_path}")

    if not xlsm_path.exists():
        print(f"ERROR: File not found: {xlsm_path}")
        return 1

    # -- a. Snapshot before parts --
    before = get_parts_with_sizes(xlsm_path)
    before_names = set(before)
    print(f"\nBefore round-trip: {len(before_names)} parts")

    # -- b. Round-trip via openpyxl --
    import openpyxl  # noqa: PLC0415 — import here so error is obvious

    wb = openpyxl.load_workbook(str(xlsm_path), keep_vba=True, data_only=False)

    with tempfile.NamedTemporaryFile(suffix=".xlsm", delete=False) as tmp:
        tmp_path = Path(tmp.name)

    try:
        wb.save(str(tmp_path))
        print(f"Saved round-trip copy to: {tmp_path}")

        # -- c. Snapshot after parts --
        after = get_parts_with_sizes(tmp_path)
        after_names = set(after)
        print(f"After  round-trip: {len(after_names)} parts")

        # -- d. Assert vbaProject.bin --
        vba_before = any("vbaProject.bin" in n for n in before_names)
        vba_after = any("vbaProject.bin" in n for n in after_names)

        print(f"\nvbaProject.bin in before: {vba_before}")
        print(f"vbaProject.bin in after : {vba_after}")

        # -- e. Diff --
        lost = sorted(before_names - after_names)
        added = sorted(after_names - before_names)

        print(f"\n{'='*60}")
        print(f"LOST parts ({len(lost)}):")
        if lost:
            lost_size = sum(before.get(p, 0) for p in lost)
            for p in lost:
                size = before.get(p, 0)
                print(f"  - {p}  ({size:,} bytes)")
            print(f"  Total lost size: {lost_size:,} bytes")
        else:
            print("  (none)")

        print(f"\nADDED parts ({len(added)}):")
        if added:
            for p in added:
                size = after.get(p, 0)
                print(f"  + {p}  ({size:,} bytes)")
        else:
            print("  (none)")

        # -- f. Summary --
        retained = len(before_names & after_names)
        print(f"\n{'='*60}")
        print(f"Summary:")
        print(f"  Before      : {len(before_names)} parts")
        print(f"  Retained    : {retained} parts")
        print(f"  Lost        : {len(lost)} parts")
        print(f"  Added (new) : {len(added)} parts")
        print(f"  After total : {len(after_names)} parts")

        # -- Status --
        print(f"\n{'='*60}")
        if not vba_after:
            print("STATUS: NG (vbaProject.bin missing after round-trip)")
            return 1

        print("STATUS: OK (expected loss observed)" if lost else "STATUS: OK (no parts lost)")
        return 0

    finally:
        tmp_path.unlink(missing_ok=True)


if __name__ == "__main__":
    default_path = Path.home() / "prj" / "_oaks-test" / "WBS.xlsm"
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else default_path
    sys.exit(main(target))
