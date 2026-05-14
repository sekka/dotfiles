from pathlib import Path
from lib.yaml_io import load_pmo_yaml, PmoYaml, ColumnSpec

FIXTURE = Path(__file__).parent / "fixtures" / "sample_pmo.yaml"


def test_load_pmo_yaml_parses_project():
    pmo = load_pmo_yaml(FIXTURE)
    assert pmo.project["name"] == "Sample"
    assert pmo.project["slug"] == "sample"


def test_load_pmo_yaml_parses_excel_config():
    pmo = load_pmo_yaml(FIXTURE)
    assert pmo.excel.file == "WBS.xlsx"
    assert pmo.excel.sheet == "WBS"
    assert pmo.excel.header_row == 6
    assert pmo.excel.data_start_row == 7
    assert pmo.excel.id_column == "A"


def test_load_pmo_yaml_parses_columns():
    pmo = load_pmo_yaml(FIXTURE)
    assert len(pmo.excel.columns) == 9
    cols_by_field = {c.field: c for c in pmo.excel.columns}
    assert cols_by_field["id"].col == "A"
    assert cols_by_field["id"].owner == "yaml"
    assert cols_by_field["status"].owner == "excel"


def test_load_pmo_yaml_parses_tasks():
    pmo = load_pmo_yaml(FIXTURE)
    assert len(pmo.tasks) == 1
    t = pmo.tasks[0]
    assert t["id"] == "T-001"
    assert t["phase_l1"] == "現状把握"
    assert t["assignee"] == "PM"
    assert t["start_date"] is None
