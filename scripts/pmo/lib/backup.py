"""Backup utilities for xlsm/xlsx files before write operations."""
from __future__ import annotations

import datetime
import shutil
from pathlib import Path


def backup_excel(excel_path: Path, project_dir: Path) -> Path | None:
    """Copy excel_path to {project_dir}/.pmo/backups/{stem}_{YYYYMMDDTHHmmss}{ext}.

    Returns the destination Path on success, or None if the source does not exist.
    Raises OSError / shutil.Error on IO failure.
    """
    if not excel_path.exists():
        return None

    backup_dir = project_dir / ".pmo" / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)

    ts = datetime.datetime.now().strftime("%Y%m%dT%H%M%S")
    dest = backup_dir / f"{excel_path.stem}_{ts}{excel_path.suffix}"
    shutil.copy2(excel_path, dest)
    return dest


def prune_backups(project_dir: Path, *, keep: int = 10) -> int:
    """Delete oldest backup files, keeping only the latest `keep` copies.

    Returns the number of files deleted.
    If .pmo/backups/ does not exist, returns 0.
    """
    backup_dir = project_dir / ".pmo" / "backups"
    if not backup_dir.exists():
        return 0

    all_backups = sorted(backup_dir.iterdir())
    excess = len(all_backups) - keep
    if excess <= 0:
        return 0

    for p in all_backups[:excess]:
        p.unlink()
    return excess
