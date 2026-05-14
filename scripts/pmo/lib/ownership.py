from dataclasses import dataclass, field
from enum import Enum
from typing import Iterable
from lib.yaml_io import ColumnSpec


class OwnerSide(str, Enum):
    YAML = "yaml"
    EXCEL = "excel"


@dataclass
class Ownership:
    yaml_fields: set[str] = field(default_factory=set)
    excel_fields: set[str] = field(default_factory=set)
    column_of: dict[str, str] = field(default_factory=dict)


def resolve_ownership(columns: Iterable[ColumnSpec]) -> Ownership:
    result = Ownership()
    for c in columns:
        if c.owner not in (OwnerSide.YAML.value, OwnerSide.EXCEL.value):
            raise ValueError(f"invalid owner: {c.owner} for field {c.field}")
        result.column_of[c.field] = c.col
        if c.owner == OwnerSide.YAML.value:
            result.yaml_fields.add(c.field)
        else:
            result.excel_fields.add(c.field)
    return result
