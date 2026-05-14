from __future__ import annotations

import shutil
import zipfile
from pathlib import Path

from lib.excel_io import read_rows, write_cells

FIXTURE = Path(__file__).parent / "fixtures" / "minimal.xlsm"
DUMMY_VBA = b"\x01CONST_TEST_VBA_"


def test_keep_vba_round_trip_preserves_vba_binary(tmp_path: Path) -> None:
    dst = tmp_path / "out.xlsm"
    shutil.copy(FIXTURE, dst)

    write_cells(dst, sheet="Sheet1", updates=[(1, "B", "modified")])

    with zipfile.ZipFile(FIXTURE) as src_zip:
        src_vba = src_zip.read("xl/vbaProject.bin")
    with zipfile.ZipFile(dst) as dst_zip:
        dst_vba = dst_zip.read("xl/vbaProject.bin")

    assert src_vba == DUMMY_VBA
    assert dst_vba == DUMMY_VBA
    assert src_vba == dst_vba


def test_keep_vba_round_trip_preserves_sheets(tmp_path: Path) -> None:
    dst = tmp_path / "out.xlsm"
    shutil.copy(FIXTURE, dst)

    write_cells(dst, sheet="Sheet1", updates=[(1, "B", "updated")])

    rows = read_rows(dst, sheet="Sheet1", data_start_row=1, columns=["A", "B"])

    assert rows[0]["A"] == "T-001"
    assert rows[0]["B"] == "updated"
    assert rows[1]["A"] == "T-002"
    assert rows[1]["B"] == "beta"
