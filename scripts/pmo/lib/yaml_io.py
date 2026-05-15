from dataclasses import dataclass
from pathlib import Path
from typing import Any
from ruamel.yaml import YAML
from ruamel.yaml.comments import CommentedMap

from lib.schema import ColumnSpec, WBS_SCHEMA  # noqa: F401 — re-exported for callers

_yaml = YAML(typ="rt")
_yaml.preserve_quotes = True
_yaml.width = 4096


@dataclass
class ExcelConfig:
    """Excel layout config.

    Post-refactor: only ``file`` is read from pmo.yaml.  All layout fields
    (sheet, header_row, data_start_row, id_column, columns) are filled from
    the canonical WBS_SCHEMA.  Any ``excel.*`` keys beyond ``file`` present in
    a legacy pmo.yaml are silently ignored.
    """

    file: str
    sheet: str
    header_row: int
    data_start_row: int
    id_column: str
    columns: list[ColumnSpec]


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
    # Only the file name is read from pmo.yaml; all layout comes from canonical.
    excel = ExcelConfig(
        file=str(excel_raw["file"]),
        sheet=WBS_SCHEMA["sheet"],
        header_row=WBS_SCHEMA["header_row"],
        data_start_row=WBS_SCHEMA["data_start_row"],
        id_column=WBS_SCHEMA["id_column"],
        columns=list(WBS_SCHEMA["columns"]),
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
