from pathlib import Path
from lib.yaml_io import load_pmo_yaml, save_pmo_yaml, update_task_field, PmoYaml, ColumnSpec

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


def test_save_pmo_yaml_round_trip(tmp_path):
    pmo = load_pmo_yaml(FIXTURE)
    out = tmp_path / "out.yaml"
    save_pmo_yaml(pmo, out)
    reloaded = load_pmo_yaml(out)
    assert reloaded.project == pmo.project
    assert reloaded.tasks == pmo.tasks


def test_update_task_field_writes_back(tmp_path):
    pmo = load_pmo_yaml(FIXTURE)
    update_task_field(pmo, task_id="T-001", field="status", value="進行中")
    out = tmp_path / "out.yaml"
    save_pmo_yaml(pmo, out)
    reloaded = load_pmo_yaml(out)
    assert reloaded.tasks[0]["status"] == "進行中"


def test_update_task_field_missing_id_raises():
    import pytest
    pmo = load_pmo_yaml(FIXTURE)
    with pytest.raises(KeyError, match="T-999"):
        update_task_field(pmo, task_id="T-999", field="status", value="x")
