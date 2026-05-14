import json
import datetime
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


class _DateTimeEncoder(json.JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o, (datetime.datetime, datetime.date)):
            return o.isoformat()
        return super().default(o)


@dataclass
class Snapshot:
    """Dual-state snapshot tracking both YAML and Excel sides post-sync.

    yaml:  {task_id: {field: value, ...}}  — destination state when last sync
                                              wrote YAML (i.e. last pull) or the
                                              YAML state we read on the last push.
    excel: {task_id: {field: value, ...}}  — analogous for the Excel side.

    Two-sided storage lets the guard compare current dest-side state against
    the same side from last sync regardless of whether the previous sync was
    pull or push, eliminating mode-switch false positives.
    """
    yaml: dict[str, dict[str, Any]] = field(default_factory=dict)
    excel: dict[str, dict[str, Any]] = field(default_factory=dict)

    def is_empty(self) -> bool:
        return not self.yaml and not self.excel

    def known_ids(self) -> set[str]:
        """Union of IDs ever seen on either side at last sync."""
        return set(self.yaml.keys()) | set(self.excel.keys())


def save_snapshot(snap: Snapshot, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(
            {"yaml": snap.yaml, "excel": snap.excel},
            f,
            ensure_ascii=False,
            indent=2,
            cls=_DateTimeEncoder,
        )


def load_snapshot(path: Path) -> Snapshot:
    if not path.exists():
        return Snapshot()
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    # Backward-compat: older snapshots stored a single "rows" dict. Treat it
    # as identical for both sides so the next sync rebuilds them properly.
    if "rows" in data and "yaml" not in data and "excel" not in data:
        legacy = data.get("rows", {})
        return Snapshot(yaml=dict(legacy), excel=dict(legacy))
    return Snapshot(
        yaml=data.get("yaml", {}),
        excel=data.get("excel", {}),
    )


def _normalize_value(value: Any) -> Any:
    """Normalize values for comparison (e.g., midnight datetime → date, isoformat string → date)."""
    if isinstance(value, datetime.datetime):
        if value.time() == datetime.time(0, 0):
            return value.date()
        return value
    if isinstance(value, str):
        # snapshot stores dates as isoformat strings; normalize for comparison
        try:
            return datetime.date.fromisoformat(value)
        except (ValueError, TypeError):
            pass
    return value


@dataclass
class SnapshotDiff:
    """Result of comparing current state against a snapshot side.

    modified: {task_id: {field: (old_value, new_value)}}
    added:    list of task_ids present in current but not in snapshot
    removed:  list of task_ids present in snapshot but not in current
    """
    modified: dict[str, dict[str, tuple[Any, Any]]] = field(default_factory=dict)
    added: list[str] = field(default_factory=list)
    removed: list[str] = field(default_factory=list)

    def has_changes(self) -> bool:
        return bool(self.modified or self.added or self.removed)


def diff_against_snapshot(
    snap_rows: dict[str, dict[str, Any]],
    current_tasks: list[dict[str, Any]],
) -> SnapshotDiff:
    """Compare current_tasks against the rows of one side of a snapshot.

    If snap_rows is empty (first run for that side), returns an empty diff.
    current_tasks must be a list of dicts each having an "id" key.
    """
    if not snap_rows:
        return SnapshotDiff()

    diff = SnapshotDiff()
    current_by_id = {t["id"]: t for t in current_tasks if "id" in t}
    snap_ids = set(snap_rows.keys())
    current_ids = set(current_by_id.keys())

    # added: in current, not in snapshot
    diff.added = sorted(current_ids - snap_ids)

    # removed: in snapshot, not in current
    diff.removed = sorted(snap_ids - current_ids)

    # modified: in both, but field values differ
    for tid in snap_ids & current_ids:
        snap_row = snap_rows[tid]
        curr_row = current_by_id[tid]
        field_diffs: dict[str, tuple[Any, Any]] = {}
        all_keys = set(snap_row.keys()) | set(k for k in curr_row if k != "id")
        for fname in all_keys:
            snap_val = _normalize_value(snap_row.get(fname))
            curr_val = _normalize_value(curr_row.get(fname))
            if snap_val != curr_val:
                field_diffs[fname] = (snap_row.get(fname), curr_row.get(fname))
        if field_diffs:
            diff.modified[tid] = field_diffs

    return diff
