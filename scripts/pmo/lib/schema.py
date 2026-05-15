"""Canonical WBS schema — single source of truth for column layout.

Pull-only design: Excel is the source of truth, YAML is regenerated each
pull. Per-column write metadata (readonly) is no longer needed.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ColumnSpec:
    col: str
    field: str


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
        ColumnSpec(col="F", field="est_days"),
        ColumnSpec(col="G", field="start_date"),
        ColumnSpec(col="H", field="end_date"),
        ColumnSpec(col="I", field="notes"),
        ColumnSpec(col="J", field="status"),
    ],
}
