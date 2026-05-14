from pathlib import Path
import openpyxl
from lib.excel_io import read_rows, write_cells, append_row, append_rows, batch_append_rows, _resolve_value


def make_workbook(path: Path) -> None:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "WBS"
    # header row 6
    headers = ["id", "phase_l1", "phase_l2", "name", "assignee",
               "est_hours", "start_date", "end_date", "status"]
    for col_idx, h in enumerate(headers, start=1):
        ws.cell(row=6, column=col_idx, value=h)
    # data rows from row 7
    ws.cell(row=7, column=1, value="T-001")
    ws.cell(row=7, column=2, value="現状把握")
    ws.cell(row=7, column=4, value="ヒアリング")
    ws.cell(row=7, column=9, value="進行中")
    ws.cell(row=8, column=1, value="T-002")
    ws.cell(row=8, column=4, value="次タスク")
    wb.save(path)


def test_resolve_value_formula_with_computed_result():
    """数式セルで計算結果がある場合は computed を返す"""
    assert _resolve_value("=WORKDAY(A1,5)", "2026-05-20") == "2026-05-20"


def test_resolve_value_formula_with_no_computed_result():
    """数式セルで計算結果が None なら None を返す（数式文字列は絶対に返さない）"""
    assert _resolve_value("=IF(G6=\"\",WORKDAY(B1,5),G6)", None) is None


def test_resolve_value_plain_value_uses_structural():
    """数式でない通常値は structural をそのまま返す"""
    assert _resolve_value("T-001", None) == "T-001"
    assert _resolve_value(None, None) is None
    assert _resolve_value(42, None) == 42


def test_read_rows_returns_dicts_keyed_by_column_letter(tmp_path):
    xlsx = tmp_path / "wbs.xlsx"
    make_workbook(xlsx)
    rows = read_rows(xlsx, sheet="WBS", data_start_row=7,
                     columns=["A", "B", "C", "D", "E", "F", "G", "H", "I"])
    assert len(rows) == 2
    assert rows[0]["A"] == "T-001"
    assert rows[0]["B"] == "現状把握"
    assert rows[0]["I"] == "進行中"
    assert rows[1]["A"] == "T-002"
    assert rows[1]["D"] == "次タスク"


def test_read_rows_stops_at_first_empty_id(tmp_path):
    xlsx = tmp_path / "wbs.xlsx"
    make_workbook(xlsx)
    # row 9 left empty, row 10 has data → should stop at row 9
    wb = openpyxl.load_workbook(xlsx)
    ws = wb["WBS"]
    ws.cell(row=10, column=1, value="T-003")
    wb.save(xlsx)
    rows = read_rows(xlsx, sheet="WBS", data_start_row=7,
                     columns=["A", "B", "C", "D", "E", "F", "G", "H", "I"],
                     id_column="A")
    assert len(rows) == 2


def test_write_cells_updates_existing_cells(tmp_path):
    xlsx = tmp_path / "wbs.xlsx"
    make_workbook(xlsx)
    write_cells(xlsx, sheet="WBS", updates=[
        (7, "I", "完了"),
        (7, "G", "2026-04-15"),
    ])
    wb = openpyxl.load_workbook(xlsx)
    ws = wb["WBS"]
    assert ws["I7"].value == "完了"
    assert ws["G7"].value == "2026-04-15"


def test_write_cells_preserves_other_cells(tmp_path):
    xlsx = tmp_path / "wbs.xlsx"
    make_workbook(xlsx)
    write_cells(xlsx, sheet="WBS", updates=[(7, "I", "完了")])
    wb = openpyxl.load_workbook(xlsx)
    ws = wb["WBS"]
    assert ws["A7"].value == "T-001"
    assert ws["D7"].value == "ヒアリング"
    assert ws["A8"].value == "T-002"


def test_append_rows_writes_rows_in_order():
    wb = openpyxl.Workbook()
    ws = wb.active
    append_rows(ws, [["A", "B"], ["C", "D"]])
    assert ws.cell(row=1, column=1).value == "A"
    assert ws.cell(row=1, column=2).value == "B"
    assert ws.cell(row=2, column=1).value == "C"
    assert ws.cell(row=2, column=2).value == "D"


def test_append_rows_empty_list_does_not_raise():
    wb = openpyxl.Workbook()
    ws = wb.active
    max_row_before = ws.max_row
    append_rows(ws, [])
    assert ws.max_row == max_row_before


def test_batch_append_rows_inserts_multiple_rows(tmp_path):
    xlsx = tmp_path / "wbs.xlsx"
    make_workbook(xlsx)
    batch_append_rows(xlsx, sheet="WBS", data_start_row=7, id_column="A",
                      rows=[{"A": "T-003", "D": "タスク3"}, {"A": "T-004", "D": "タスク4"}])
    wb = openpyxl.load_workbook(xlsx)
    ws = wb["WBS"]
    assert ws["A9"].value == "T-003"
    assert ws["D9"].value == "タスク3"
    assert ws["A10"].value == "T-004"
    assert ws["D10"].value == "タスク4"
    assert ws["A7"].value == "T-001"


def test_batch_append_rows_empty_list_does_not_modify(tmp_path):
    xlsx = tmp_path / "wbs.xlsx"
    make_workbook(xlsx)
    mtime_before = xlsx.stat().st_mtime
    batch_append_rows(xlsx, sheet="WBS", data_start_row=7, id_column="A", rows=[])
    assert xlsx.stat().st_mtime == mtime_before


def test_append_row_inserts_at_next_empty_row(tmp_path):
    xlsx = tmp_path / "wbs.xlsx"
    make_workbook(xlsx)
    # 既存: row 7 と row 8 にデータ。row 9 が空。
    append_row(xlsx, sheet="WBS", data_start_row=7, id_column="A",
               values={"A": "T-003", "D": "新規タスク"})
    wb = openpyxl.load_workbook(xlsx)
    ws = wb["WBS"]
    assert ws["A9"].value == "T-003"
    assert ws["D9"].value == "新規タスク"
    assert ws["A7"].value == "T-001"  # 既存維持
