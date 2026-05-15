"""Atomic YAML read/write helpers for WBS.yaml.

Pull-only design: callers read the existing config (project block, excel.file),
mutate the tasks list, and write back atomically.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

from ruamel.yaml import YAML

from lib.atomic_io import atomic_write_path

_yaml = YAML(typ="rt")
_yaml.preserve_quotes = True
_yaml.width = 4096


def load_yaml(path: Path) -> Any:
    """Load a YAML document, preserving comments and structure for round-trip."""
    with path.open("r", encoding="utf-8") as f:
        return _yaml.load(f)


def save_yaml(data: Any, path: Path) -> None:
    """Atomically write YAML so a mid-dump exception cannot truncate the destination."""
    with atomic_write_path(path) as tmp:
        with tmp.open("w", encoding="utf-8") as f:
            _yaml.dump(data, f)
