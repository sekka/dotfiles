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
