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


from lib.reconcile import merge_matched, MergeResult
from lib.ownership import Ownership


def make_ownership(yaml_fields, excel_fields, column_of):
    o = Ownership()
    o.yaml_fields = set(yaml_fields)
    o.excel_fields = set(excel_fields)
    o.column_of = column_of
    return o


def test_merge_yaml_fields_overwrite_excel():
    matched = {"T-001": RowMatch(
        task_id="T-001",
        yaml_task={"id": "T-001", "name": "新", "status": "完了"},
        excel_row=7,
        excel_data={"row": 7, "A": "T-001", "D": "古", "I": "進行中"},
    )}
    ownership = make_ownership(
        yaml_fields={"id", "name"},
        excel_fields={"status"},
        column_of={"id": "A", "name": "D", "status": "I"},
    )
    result = merge_matched(matched, ownership)
    assert result.excel_updates == [(7, "D", "新")]
    assert result.yaml_updates == [("T-001", "status", "進行中")]


def test_merge_no_change_when_values_equal():
    matched = {"T-001": RowMatch(
        task_id="T-001",
        yaml_task={"id": "T-001", "name": "同じ", "status": "進行中"},
        excel_row=7,
        excel_data={"row": 7, "A": "T-001", "D": "同じ", "I": "進行中"},
    )}
    ownership = make_ownership(
        yaml_fields={"id", "name"},
        excel_fields={"status"},
        column_of={"id": "A", "name": "D", "status": "I"},
    )
    result = merge_matched(matched, ownership)
    assert result.excel_updates == []
    assert result.yaml_updates == []


def test_merge_excel_field_with_none_yaml_value():
    matched = {"T-001": RowMatch(
        task_id="T-001",
        yaml_task={"id": "T-001", "status": None},
        excel_row=7,
        excel_data={"row": 7, "A": "T-001", "I": "進行中"},
    )}
    ownership = make_ownership(
        yaml_fields={"id"},
        excel_fields={"status"},
        column_of={"id": "A", "status": "I"},
    )
    result = merge_matched(matched, ownership)
    assert result.yaml_updates == [("T-001", "status", "進行中")]
