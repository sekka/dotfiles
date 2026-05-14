from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from ruamel.yaml import YAML
from ruamel.yaml.comments import CommentedMap

_yaml = YAML(typ="rt")
_yaml.preserve_quotes = True
_yaml.width = 4096


@dataclass
class ColumnSpec:
    col: str
    field: str
    readonly: bool = False


@dataclass
class ExcelConfig:
    file: str
    sheet: str
    header_row: int
    data_start_row: int
    id_column: str
    columns: list[ColumnSpec] = field(default_factory=list)


@dataclass
class PmoYaml:
    project: dict[str, Any]
    excel: ExcelConfig
    tasks: list[dict[str, Any]]
    _raw: Any = None


def load_pmo_yaml(path: Path) -> PmoYaml:
    with path.open("r", encoding="utf-8") as f:
        data = _yaml.load(f)
    excel_raw = data["excel"]
    columns = [
        ColumnSpec(
            col=str(c["col"]),
            field=c["field"],
            readonly=bool(c.get("readonly", False)),
        )
        for c in excel_raw["columns"]
    ]
    excel = ExcelConfig(
        file=excel_raw["file"],
        sheet=excel_raw["sheet"],
        header_row=int(excel_raw["header_row"]),
        data_start_row=int(excel_raw["data_start_row"]),
        id_column=str(excel_raw["id_column"]),
        columns=columns,
    )
    return PmoYaml(
        project=data["project"],
        excel=excel,
        tasks=list(data.get("tasks", [])),
        _raw=data,
    )


def save_pmo_yaml(pmo: PmoYaml, path: Path) -> None:
    with path.open("w", encoding="utf-8") as f:
        _yaml.dump(pmo._raw, f)


def add_task(pmo: PmoYaml, row: dict[str, Any]) -> None:
    """Append a new task row to both internal representations atomically."""
    cm = CommentedMap(row)
    pmo._raw["tasks"].append(cm)
    pmo.tasks.append(cm)


def update_task_field(pmo: PmoYaml, *, task_id: str, field: str, value: Any) -> None:
    for t in pmo.tasks:
        if t.get("id") == task_id:
            t[field] = value
            return
    raise KeyError(f"task id not found: {task_id}")
