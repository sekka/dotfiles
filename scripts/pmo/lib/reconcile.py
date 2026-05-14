from dataclasses import dataclass, field
from typing import Any


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
    matched: dict[str, "RowMatch"],
    ownership: "Any",
) -> MergeResult:
    from lib.ownership import Ownership  # avoid circular at module import
    result = MergeResult()
    for tid, m in matched.items():
        for fname in ownership.yaml_fields:
            if fname == "id":
                continue
            col = ownership.column_of[fname]
            yaml_val = m.yaml_task.get(fname)
            excel_val = m.excel_data.get(col)
            if yaml_val != excel_val:
                result.excel_updates.append((m.excel_row, col, yaml_val))
        for fname in ownership.excel_fields:
            col = ownership.column_of[fname]
            yaml_val = m.yaml_task.get(fname)
            excel_val = m.excel_data.get(col)
            if yaml_val != excel_val:
                result.yaml_updates.append((tid, fname, excel_val))
    return result


def build_excel_appends(
    yaml_only: list[dict[str, Any]],
    ownership,
) -> list[dict[str, Any]]:
    appends = []
    for t in yaml_only:
        row_values: dict[str, Any] = {}
        for fname in ownership.yaml_fields:
            col = ownership.column_of[fname]
            if fname in t:
                row_values[col] = t[fname]
        appends.append(row_values)
    return appends


def build_yaml_appends(
    excel_only: list[dict[str, Any]],
    ownership,
) -> list[dict[str, Any]]:
    appends = []
    for er in excel_only:
        task: dict[str, Any] = {}
        id_col = ownership.column_of["id"]
        task["id"] = er[id_col]
        for fname in ownership.yaml_fields | ownership.excel_fields:
            if fname == "id":
                continue
            col = ownership.column_of[fname]
            task[fname] = er.get(col)
        appends.append(task)
    return appends


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
