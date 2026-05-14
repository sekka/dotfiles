"""Tests for lib/backup.py — xlsm backup mechanism."""
from pathlib import Path
import re

import pytest

from lib.backup import backup_excel, prune_backups


def make_fake_xlsm(path: Path, content: bytes = b"\x50\x4b\x03\x04fake") -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content)
    return path


# ---------------------------------------------------------------------------
# backup_excel
# ---------------------------------------------------------------------------


def test_backup_excel_creates_timestamped_copy(tmp_path):
    src = make_fake_xlsm(tmp_path / "WBS.xlsm")
    dest = backup_excel(src, tmp_path)

    assert dest is not None
    assert dest.exists()
    # bytes identical
    assert dest.read_bytes() == src.read_bytes()
    # filename contains ISO 8601 basic timestamp (YYYYMMDDTHHmmss)
    assert re.search(r"WBS_\d{8}T\d{6}", dest.name), f"unexpected name: {dest.name}"


def test_backup_excel_copy_stored_in_pmo_backups(tmp_path):
    src = make_fake_xlsm(tmp_path / "WBS.xlsm")
    dest = backup_excel(src, tmp_path)

    assert dest is not None
    expected_parent = tmp_path / ".pmo" / "backups"
    assert dest.parent == expected_parent


def test_backup_excel_returns_none_when_source_missing(tmp_path):
    src = tmp_path / "nonexistent.xlsm"
    result = backup_excel(src, tmp_path)
    assert result is None


def test_backup_excel_preserves_extension(tmp_path):
    src = make_fake_xlsm(tmp_path / "Report.xlsx", content=b"xlsx_fake")
    dest = backup_excel(src, tmp_path)
    assert dest is not None
    assert dest.suffix == ".xlsx"


# ---------------------------------------------------------------------------
# prune_backups
# ---------------------------------------------------------------------------


def test_prune_backups_keeps_latest_n(tmp_path):
    backup_dir = tmp_path / ".pmo" / "backups"
    backup_dir.mkdir(parents=True)
    # Create 12 fake backups with lexicographically sortable names (May 01..12)
    for i in range(12):
        ts = f"202605{i + 1:02d}T120000"
        (backup_dir / f"WBS_{ts}.xlsm").write_bytes(b"x")

    deleted = prune_backups(tmp_path, keep=10)

    remaining = list(backup_dir.glob("*.xlsm"))
    assert deleted == 2
    assert len(remaining) == 10


def test_prune_backups_returns_zero_when_count_le_keep(tmp_path):
    backup_dir = tmp_path / ".pmo" / "backups"
    backup_dir.mkdir(parents=True)
    for i in range(5):
        (backup_dir / f"WBS_202605{i + 1:02d}T120000.xlsm").write_bytes(b"x")

    deleted = prune_backups(tmp_path, keep=10)
    assert deleted == 0


def test_prune_backups_empty_dir_returns_zero(tmp_path):
    # .pmo/backups does not exist at all
    deleted = prune_backups(tmp_path, keep=10)
    assert deleted == 0


def test_prune_backups_ignores_non_excel_files(tmp_path):
    backup_dir = tmp_path / ".pmo" / "backups"
    backup_dir.mkdir(parents=True)
    (backup_dir / ".DS_Store").write_bytes(b"junk")
    (backup_dir / "notes.txt").write_text("scratch")
    for i in range(12):
        (backup_dir / f"WBS_202605{i + 1:02d}T120000.xlsm").write_bytes(b"x")

    deleted = prune_backups(tmp_path, keep=10)

    assert deleted == 2
    assert (backup_dir / ".DS_Store").exists()
    assert (backup_dir / "notes.txt").exists()


def test_prune_backups_removes_oldest(tmp_path):
    backup_dir = tmp_path / ".pmo" / "backups"
    backup_dir.mkdir(parents=True)
    names = [f"WBS_202605{i + 1:02d}T120000.xlsm" for i in range(3)]
    for n in names:
        (backup_dir / n).write_bytes(b"x")

    prune_backups(tmp_path, keep=2)

    remaining = sorted(p.name for p in backup_dir.glob("*.xlsm"))
    # oldest (index 0) should be gone, newest 2 remain
    assert names[0] not in remaining
    assert names[1] in remaining
    assert names[2] in remaining
