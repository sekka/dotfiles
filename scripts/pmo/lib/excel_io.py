from pathlib import Path
from typing import Any
import openpyxl
from openpyxl.utils import column_index_from_string


def read_rows(
    workbook_path: Path,
    *,
    sheet: str,
    data_start_row: int,
    columns: list[str],
    id_column: str = "A",
) -> list[dict[str, Any]]:
    keep_vba = workbook_path.suffix.lower() == ".xlsm"
    wb = openpyxl.load_workbook(workbook_path, keep_vba=keep_vba, data_only=False)
    ws = wb[sheet]
    id_idx = column_index_from_string(id_column)
    rows: list[dict[str, Any]] = []
    row = data_start_row
    while True:
        id_value = ws.cell(row=row, column=id_idx).value
        if id_value is None or id_value == "":
            break
        row_data: dict[str, Any] = {}
        for col in columns:
            row_data[col] = ws.cell(row=row, column=column_index_from_string(col)).value
        rows.append(row_data)
        row += 1
    return rows


def write_cells(
    workbook_path: Path,
    *,
    sheet: str,
    updates: list[tuple[int, str, Any]],
) -> None:
    keep_vba = workbook_path.suffix.lower() == ".xlsm"
    wb = openpyxl.load_workbook(workbook_path, keep_vba=keep_vba)
    ws = wb[sheet]
    for row, col_letter, value in updates:
        col_idx = column_index_from_string(col_letter)
        ws.cell(row=row, column=col_idx, value=value)
    wb.save(workbook_path)
