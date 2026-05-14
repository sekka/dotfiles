from lib.reconcile import match_rows, RowMatch


def test_match_rows_all_matched():
    yaml_tasks = [{"id": "T-001", "name": "A"}, {"id": "T-002", "name": "B"}]
    excel_rows = [
        {"row": 7, "A": "T-001", "D": "A"},
        {"row": 8, "A": "T-002", "D": "B"},
    ]
    result = match_rows(yaml_tasks, excel_rows, id_column="A")
    assert len(result.matched) == 2
    assert result.matched["T-001"].excel_row == 7
    assert result.matched["T-002"].excel_row == 8
    assert result.yaml_only == []
    assert result.excel_only == []


def test_match_rows_yaml_only_when_id_missing_in_excel():
    yaml_tasks = [{"id": "T-001"}, {"id": "T-002"}, {"id": "T-003"}]
    excel_rows = [{"row": 7, "A": "T-001"}, {"row": 8, "A": "T-002"}]
    result = match_rows(yaml_tasks, excel_rows, id_column="A")
    assert [t["id"] for t in result.yaml_only] == ["T-003"]


def test_match_rows_excel_only_when_id_missing_in_yaml():
    yaml_tasks = [{"id": "T-001"}]
    excel_rows = [
        {"row": 7, "A": "T-001"},
        {"row": 8, "A": "T-999"},
    ]
    result = match_rows(yaml_tasks, excel_rows, id_column="A")
    assert [r["A"] for r in result.excel_only] == ["T-999"]


def test_match_rows_preserves_yaml_order():
    yaml_tasks = [{"id": "T-003"}, {"id": "T-001"}, {"id": "T-002"}]
    excel_rows = [
        {"row": 7, "A": "T-001"},
        {"row": 8, "A": "T-002"},
        {"row": 9, "A": "T-003"},
    ]
    result = match_rows(yaml_tasks, excel_rows, id_column="A")
    assert list(result.matched.keys()) == ["T-003", "T-001", "T-002"]
