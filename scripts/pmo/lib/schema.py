"""Canonical WBS schema — single source of truth for all column layout."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ColumnSpec:
    col: str
    field: str
    readonly: bool = False


# WBS sheet canonical schema — update here when WBS layout changes.
WBS_SCHEMA: dict = {
    "sheet": "WBS",
    "header_row": 4,
    "data_start_row": 6,
    "id_column": "A",
    "columns": [
        ColumnSpec(col="A", field="id"),
        ColumnSpec(col="B", field="phase_l1"),
        ColumnSpec(col="C", field="phase_l2"),
        ColumnSpec(col="D", field="name"),
        ColumnSpec(col="E", field="assignee"),
        ColumnSpec(col="F", field="est_hours"),
        ColumnSpec(col="G", field="start_date", readonly=True),
        ColumnSpec(col="H", field="end_date", readonly=True),
        ColumnSpec(col="I", field="notes"),
        ColumnSpec(col="J", field="status"),
    ],
}


def get_schema(name: str = "wbs") -> dict:
    """Return the canonical schema for the given sheet type.

    Future sheet types (e.g. 'issues') can be added here.
    """
    if name == "wbs":
        return WBS_SCHEMA
    raise ValueError(f"unknown schema: {name}")


def sync_columns() -> list[ColumnSpec]:
    """Return columns that are written during sync (non-readonly)."""
    return [c for c in WBS_SCHEMA["columns"] if not c.readonly]
