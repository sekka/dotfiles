from pathlib import Path
from typing import Any
import openpyxl
from openpyxl.worksheet.worksheet import Worksheet
from openpyxl.utils import column_index_from_string

from lib import xlsm_writer as _xlsm_writer


def _keep_vba(path: Path) -> bool:
    return path.suffix.lower() == ".xlsm"


def _resolve_value(structural: Any, computed: Any) -> Any:
    """Return the appropriate cell value, preferring computed over formula strings.

    - If structural is a formula string (starts with '='), return computed
      (which may be None when the formula has not been evaluated yet).
    - Otherwise return structural as-is.
    """
    if isinstance(structural, str) and structural.startswith("="):
        return computed
    return structural


def read_rows(
    workbook_path: Path,
    *,
    sheet: str,
    data_start_row: int,
    columns: list[str],
    id_column: str = "A",
) -> list[dict[str, Any]]:
    keep_vba = _keep_vba(workbook_path)
    # Pass 1: structural workbook — drives row iteration and gives raw/formula values
    wb_struct = openpyxl.load_workbook(workbook_path, keep_vba=keep_vba, data_only=False)
    ws_struct = wb_struct[sheet]
    # Pass 2: computed workbook — provides cached calculation results
    wb_calc = openpyxl.load_workbook(workbook_path, data_only=True)
    ws_calc = wb_calc[sheet]
    id_idx = column_index_from_string(id_column)
    rows: list[dict[str, Any]] = []
    row = data_start_row
    while True:
        id_value = ws_struct.cell(row=row, column=id_idx).value
        if id_value is None or id_value == "":
            break
        row_data: dict[str, Any] = {}
        for col in columns:
            col_idx = column_index_from_string(col)
            structural = ws_struct.cell(row=row, column=col_idx).value
            computed = ws_calc.cell(row=row, column=col_idx).value
            row_data[col] = _resolve_value(structural, computed)
        rows.append(row_data)
        row += 1
    return rows


def write_cells(
    workbook_path: Path,
    *,
    sheet: str,
    updates: list[tuple[int, str, Any]],
) -> None:
    _xlsm_writer.write_cells(workbook_path, sheet, updates)


def append_rows(ws: Worksheet, rows: list[list[Any]]) -> None:
    for row in rows:
        ws.append(row)


def batch_append_rows(
    workbook_path: Path,
    *,
    sheet: str,
    data_start_row: int,
    id_column: str,
    rows: list[dict[str, Any]],
) -> None:
    if not rows:
        return
    keep_vba = _keep_vba(workbook_path)
    wb = openpyxl.load_workbook(workbook_path, keep_vba=keep_vba, data_only=True)
    ws = wb[sheet]
    id_idx = column_index_from_string(id_column)
    row_num = data_start_row
    while ws.cell(row=row_num, column=id_idx).value not in (None, ""):
        row_num += 1
    _xlsm_writer.append_rows(workbook_path, sheet, rows, start_row=row_num)


def append_row(
    workbook_path: Path,
    *,
    sheet: str,
    data_start_row: int,
    id_column: str,
    values: dict[str, Any],
) -> int:
    keep_vba = _keep_vba(workbook_path)
    wb = openpyxl.load_workbook(workbook_path, keep_vba=keep_vba, data_only=True)
    ws = wb[sheet]
    id_idx = column_index_from_string(id_column)
    row = data_start_row
    while ws.cell(row=row, column=id_idx).value not in (None, ""):
        row += 1
    _xlsm_writer.append_rows(workbook_path, sheet, [values], start_row=row)
    return row
