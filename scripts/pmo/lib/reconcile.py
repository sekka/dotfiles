import datetime
from dataclasses import dataclass, field
from typing import Any, Iterable

from lib.yaml_io import ColumnSpec


@dataclass
class RowMatch:
    task_id: str
    yaml_task: dict[str, Any]
    excel_row: int
    excel_data: dict[str, Any]


@dataclass
class MatchResult:
    matched: dict[str, RowMatch] = field(default_factory=dict)
    yaml_only: list[dict[str, Any]] = field(default_factory=list)
    excel_only: list[dict[str, Any]] = field(default_factory=list)


def _normalize_for_compare(value: Any) -> Any:
    # NOTE: keep in sync with snapshot._normalize_value (snapshot also handles str ISO parsing
    # for values round-tripped through JSON; omitted here since inputs are live YAML/Excel values)
    if isinstance(value, datetime.datetime):
        if value.time() == datetime.time(0, 0):
            return value.date()
    return value


def match_rows(
    yaml_tasks: list[dict[str, Any]],
    excel_rows: list[dict[str, Any]],
    *,
    id_column: str,
) -> MatchResult:
    excel_by_id = {r[id_column]: r for r in excel_rows if r.get(id_column)}
    yaml_ids = {t["id"] for t in yaml_tasks}
    result = MatchResult()
    for t in yaml_tasks:
        tid = t["id"]
        if tid in excel_by_id:
            er = excel_by_id[tid]
            result.matched[tid] = RowMatch(
                task_id=tid,
                yaml_task=t,
                excel_row=er["row"],
                excel_data=er,
            )
        else:
            result.yaml_only.append(t)
    for er in excel_rows:
        if er.get(id_column) and er[id_column] not in yaml_ids:
            result.excel_only.append(er)
    return result


@dataclass
class MergeResult:
    excel_updates: list[tuple[int, str, Any]] = field(default_factory=list)
    yaml_updates: list[tuple[str, str, Any]] = field(default_factory=list)


def merge_matched(
    matched: dict[str, RowMatch],
    columns: Iterable[ColumnSpec],
    *,
    direction: str,
) -> MergeResult:
    """One-way merge based on the requested direction.

    direction="push": YAML → Excel. For each non-readonly, non-id column whose
    YAML value differs from Excel, emit an excel_update.
    direction="pull": Excel → YAML. For each non-readonly, non-id column whose
    Excel value differs from YAML, emit a yaml_update.
    """
    if direction not in ("pull", "push"):
        raise ValueError(f"invalid direction: {direction!r} (expected 'pull' or 'push')")
    cols = list(columns)
    result = MergeResult()
    for tid, m in matched.items():
        for c in cols:
            if c.field == "id" or c.readonly:
                continue
            yaml_val = m.yaml_task.get(c.field)
            excel_val = m.excel_data.get(c.col)
            if _normalize_for_compare(yaml_val) == _normalize_for_compare(excel_val):
                continue
            if direction == "push":
                result.excel_updates.append((m.excel_row, c.col, yaml_val))
            else:  # pull
                result.yaml_updates.append((tid, c.field, excel_val))
    return result


def build_excel_appends(
    yaml_only: list[dict[str, Any]],
    columns: Iterable[ColumnSpec],
) -> list[dict[str, Any]]:
    """Excel rows to append for YAML-only tasks. Skips readonly columns."""
    cols = list(columns)
    appends: list[dict[str, Any]] = []
    for t in yaml_only:
        row_values: dict[str, Any] = {}
        for c in cols:
            if c.readonly:
                continue
            if c.field in t:
                row_values[c.col] = t[c.field]
        appends.append(row_values)
    return appends


def build_yaml_appends(
    excel_only: list[dict[str, Any]],
    columns: Iterable[ColumnSpec],
    *,
    id_column: str,
) -> list[dict[str, Any]]:
    """YAML tasks to append for Excel-only rows. Includes readonly fields so the
    next sync sees the same value on both sides (convergence)."""
    cols = list(columns)
    appends: list[dict[str, Any]] = []
    for er in excel_only:
        task: dict[str, Any] = {"id": er[id_column]}
        for c in cols:
            if c.field == "id":
                continue
            task[c.field] = er.get(c.col)
        appends.append(task)
    return appends


def excel_rows_to_id_keyed(
    excel_rows: list[dict[str, Any]],
    columns: Iterable[ColumnSpec],
    *,
    id_column: str,
) -> list[dict[str, Any]]:
    """Convert Excel rows (column-letter keyed) to id-keyed task dicts.

    Used by the push snapshot guard so the diff against the snapshot operates
    on the same shape as YAML tasks.
    """
    cols = list(columns)
    out: list[dict[str, Any]] = []
    for er in excel_rows:
        tid = er.get(id_column)
        if not tid:
            continue
        task: dict[str, Any] = {"id": tid}
        for c in cols:
            if c.field == "id":
                continue
            task[c.field] = er.get(c.col)
        out.append(task)
    return out


def classify_unmatched(
    items: list[dict[str, Any]],
    snapshot_rows: set[str],
    *,
    id_field: str = "id",
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    new_items: list[dict[str, Any]] = []
    deleted_remote: list[dict[str, Any]] = []
    for item in items:
        tid = item.get(id_field)
        if tid is not None and tid in snapshot_rows:
            deleted_remote.append(item)
        else:
            new_items.append(item)
    return new_items, deleted_remote
