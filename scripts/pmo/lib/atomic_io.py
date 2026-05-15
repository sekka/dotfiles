"""Atomic file-write helper.

Write to a `.tmp` sibling first, then `os.replace` onto the destination.
On failure, the tmp file is removed and the destination is left untouched —
this prevents a half-written or 0-byte file from replacing a good one.
"""
from __future__ import annotations

import os
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator


@contextmanager
def atomic_write_path(path: Path) -> Iterator[Path]:
    """Yield a sibling tmp Path; on successful exit, replace path with it.

    Caller opens / writes to the yielded path however it likes (text, binary,
    zipfile, etc.). On exception the tmp is removed; on success it is renamed
    onto path via os.replace (atomic on POSIX).
    """
    tmp = path.with_suffix(path.suffix + ".tmp")
    try:
        yield tmp
        os.replace(tmp, path)
    except Exception:
        tmp.unlink(missing_ok=True)
        raise
