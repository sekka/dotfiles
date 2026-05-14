import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class Snapshot:
    rows: dict[str, dict[str, Any]] = field(default_factory=dict)

    def is_empty(self) -> bool:
        return not self.rows


def save_snapshot(snap: Snapshot, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump({"rows": snap.rows}, f, ensure_ascii=False, indent=2)


def load_snapshot(path: Path) -> Snapshot:
    if not path.exists():
        return Snapshot()
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return Snapshot(rows=data.get("rows", {}))
