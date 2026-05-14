from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from ruamel.yaml import YAML

_yaml = YAML(typ="rt")
_yaml.preserve_quotes = True
_yaml.width = 4096


@dataclass
class ColumnSpec:
    col: str
    field: str
    owner: str


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
        ColumnSpec(col=str(c["col"]), field=c["field"], owner=c["owner"])
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
        project=dict(data["project"]),
        excel=excel,
        tasks=[dict(t) for t in data.get("tasks", [])],
        _raw=data,
    )
