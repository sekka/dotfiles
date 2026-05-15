from pathlib import Path
from lib.yaml_io import load_pmo_yaml, save_pmo_yaml, update_task_field, add_task, PmoYaml, ColumnSpec

FIXTURE = Path(__file__).parent / "fixtures" / "sample_pmo.yaml"


def test_load_pmo_yaml_parses_project():
    pmo = load_pmo_yaml(FIXTURE)
    assert pmo.project["name"] == "Sample"
    assert pmo.project["slug"] == "sample"


def test_load_pmo_yaml_parses_excel_config():
    pmo = load_pmo_yaml(FIXTURE)
    assert pmo.excel.file == "WBS.xlsx"
    assert pmo.excel.sheet == "WBS"
    assert pmo.excel.header_row == 4
    assert pmo.excel.data_start_row == 6
    assert pmo.excel.id_column == "A"


def test_load_pmo_yaml_parses_columns():
    pmo = load_pmo_yaml(FIXTURE)
    assert len(pmo.excel.columns) == 10
    cols_by_field = {c.field: c for c in pmo.excel.columns}
    assert cols_by_field["id"].col == "A"
    assert cols_by_field["id"].readonly is False
    assert cols_by_field["status"].readonly is False
    assert cols_by_field["start_date"].readonly is True
    assert cols_by_field["end_date"].readonly is True


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


def test_save_pmo_yaml_preserves_comments(tmp_path):
    """Comments in the YAML source must survive a load → save round-trip."""
    src = tmp_path / "commented.yaml"
    src.write_text(
        "project:\n"
        "  name: 'Test'\n"
        "  slug: 'test'\n"
        "  start: '2026-01-01'\n"
        "  end: '2026-12-31'\n"
        "\n"
        "excel:\n"
        "  file: 'WBS.xlsx'\n"
        "  sheet: 'WBS'\n"
        "  header_row: 1\n"
        "  data_start_row: 2\n"
        "  id_column: A\n"
        "  columns:\n"
        "    - { col: A, field: id }\n"
        "\n"
        "tasks:\n"
        "  # 重要な仕事\n"
        "  - id: T-001\n"
        "    name: foo\n"
        "    status: null\n",
        encoding="utf-8",
    )

    pmo = load_pmo_yaml(src)
    out = tmp_path / "out.yaml"
    save_pmo_yaml(pmo, out)

    saved_text = out.read_text(encoding="utf-8")
    assert "# 重要な仕事" in saved_text


_NEW_ROW = {
    "id": "T-999",
    "phase_l1": "テスト",
    "phase_l2": "単体",
    "name": "test task",
    "assignee": "Dev",
    "est_hours": 2,
    "start_date": None,
    "end_date": None,
    "status": None,
}


def test_add_task_appends_to_tasks_list():
    pmo = load_pmo_yaml(FIXTURE)
    add_task(pmo, _NEW_ROW)
    assert any(t.get("id") == "T-999" for t in pmo.tasks)


def test_add_task_appends_to_raw():
    pmo = load_pmo_yaml(FIXTURE)
    add_task(pmo, _NEW_ROW)
    last = pmo._raw["tasks"][-1]
    assert last.get("id") == "T-999"
    assert last.get("name") == "test task"


def test_add_task_survives_round_trip(tmp_path):
    pmo = load_pmo_yaml(FIXTURE)
    add_task(pmo, _NEW_ROW)
    out = tmp_path / "out.yaml"
    save_pmo_yaml(pmo, out)
    reloaded = load_pmo_yaml(out)
    ids = [t.get("id") for t in reloaded.tasks]
    assert "T-999" in ids


def test_add_task_preserves_field_order(tmp_path):
    pmo = load_pmo_yaml(FIXTURE)
    add_task(pmo, _NEW_ROW)
    out = tmp_path / "out.yaml"
    save_pmo_yaml(pmo, out)
    reloaded = load_pmo_yaml(out)
    last = reloaded._raw["tasks"][-1]
    keys = list(last.keys())
    assert keys.index("id") < keys.index("name")
    assert keys.index("name") < keys.index("status")
