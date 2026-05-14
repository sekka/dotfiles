import datetime

import pytest

from lib.reconcile import (
    _normalize_for_compare,
    match_rows,
    RowMatch,
    merge_matched,
    build_excel_appends,
    build_yaml_appends,
    excel_rows_to_id_keyed,
)
from lib.yaml_io import ColumnSpec


def cols(*specs):
    """Helper: (col_letter, field_name) or (col_letter, field_name, readonly)."""
    result = []
    for s in specs:
        if len(s) == 2:
            result.append(ColumnSpec(col=s[0], field=s[1]))
        else:
            result.append(ColumnSpec(col=s[0], field=s[1], readonly=s[2]))
    return result


# ---------------------------------------------------------------------------
# match_rows
# ---------------------------------------------------------------------------


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
    excel_rows = [{"row": 7, "A": "T-001"}, {"row": 8, "A": "T-999"}]
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


# ---------------------------------------------------------------------------
# merge_matched (direction-driven, no ownership)
# ---------------------------------------------------------------------------


def test_merge_push_emits_excel_updates():
    matched = {"T-001": RowMatch(
        task_id="T-001",
        yaml_task={"id": "T-001", "name": "新", "status": "完了"},
        excel_row=7,
        excel_data={"row": 7, "A": "T-001", "D": "古", "I": "進行中"},
    )}
    columns = cols(("A", "id"), ("D", "name"), ("I", "status"))
    result = merge_matched(matched, columns, direction="push")
    assert sorted(result.excel_updates) == sorted([(7, "D", "新"), (7, "I", "完了")])
    assert result.yaml_updates == []


def test_merge_pull_emits_yaml_updates():
    matched = {"T-001": RowMatch(
        task_id="T-001",
        yaml_task={"id": "T-001", "name": "新", "status": "完了"},
        excel_row=7,
        excel_data={"row": 7, "A": "T-001", "D": "古", "I": "進行中"},
    )}
    columns = cols(("A", "id"), ("D", "name"), ("I", "status"))
    result = merge_matched(matched, columns, direction="pull")
    assert sorted(result.yaml_updates) == sorted([
        ("T-001", "name", "古"),
        ("T-001", "status", "進行中"),
    ])
    assert result.excel_updates == []


def test_merge_no_change_when_values_equal():
    matched = {"T-001": RowMatch(
        task_id="T-001",
        yaml_task={"id": "T-001", "name": "同じ", "status": "進行中"},
        excel_row=7,
        excel_data={"row": 7, "A": "T-001", "D": "同じ", "I": "進行中"},
    )}
    columns = cols(("A", "id"), ("D", "name"), ("I", "status"))
    assert merge_matched(matched, columns, direction="push").excel_updates == []
    assert merge_matched(matched, columns, direction="pull").yaml_updates == []


def test_merge_skips_readonly_columns():
    """Formula columns marked readonly must never be written in either direction."""
    matched = {"T-001": RowMatch(
        task_id="T-001",
        yaml_task={"id": "T-001", "start_date": datetime.date(2026, 1, 1)},
        excel_row=7,
        excel_data={"row": 7, "A": "T-001", "G": datetime.date(2026, 6, 1)},
    )}
    columns = cols(("A", "id"), ("G", "start_date", True))
    assert merge_matched(matched, columns, direction="push").excel_updates == []
    assert merge_matched(matched, columns, direction="pull").yaml_updates == []


def test_merge_skips_id_field():
    matched = {"T-001": RowMatch(
        task_id="T-001",
        yaml_task={"id": "T-001"},
        excel_row=7,
        excel_data={"row": 7, "A": "T-001"},
    )}
    columns = cols(("A", "id"), ("D", "name"))
    assert merge_matched(matched, columns, direction="push").excel_updates == []


def test_merge_invalid_direction_raises():
    with pytest.raises(ValueError, match="invalid direction"):
        merge_matched({}, [], direction="sync")


def test_merge_no_change_when_yaml_date_equals_excel_midnight_datetime():
    matched = {"T-001": RowMatch(
        task_id="T-001",
        yaml_task={"id": "T-001", "due_date": datetime.date(2026, 4, 15)},
        excel_row=7,
        excel_data={"row": 7, "A": "T-001", "E": datetime.datetime(2026, 4, 15, 0, 0)},
    )}
    columns = cols(("A", "id"), ("E", "due_date"))
    assert merge_matched(matched, columns, direction="push").excel_updates == []
    assert merge_matched(matched, columns, direction="pull").yaml_updates == []


# ---------------------------------------------------------------------------
# build_excel_appends / build_yaml_appends
# ---------------------------------------------------------------------------


def test_build_excel_appends():
    yaml_only = [{"id": "T-003", "phase_l1": "新規", "name": "追加タスク"}]
    columns = cols(("A", "id"), ("B", "phase_l1"), ("D", "name"))
    appends = build_excel_appends(yaml_only, columns)
    assert appends == [{"A": "T-003", "B": "新規", "D": "追加タスク"}]


def test_build_excel_appends_skips_readonly():
    yaml_only = [{"id": "T-003", "name": "x", "start_date": datetime.date(2026, 1, 1)}]
    columns = cols(("A", "id"), ("D", "name"), ("G", "start_date", True))
    appends = build_excel_appends(yaml_only, columns)
    assert appends == [{"A": "T-003", "D": "x"}]


def test_build_yaml_appends_includes_all_fields():
    """Excel-only rows are converted to YAML tasks including every declared field."""
    excel_only = [{"row": 8, "A": "T-002", "D": "次タスク", "B": "新規", "I": "進行中"}]
    columns = cols(("A", "id"), ("B", "phase_l1"), ("D", "name"), ("I", "status"))
    appends = build_yaml_appends(excel_only, columns, id_column="A")
    assert appends == [{
        "id": "T-002",
        "phase_l1": "新規",
        "name": "次タスク",
        "status": "進行中",
    }]


def test_build_yaml_appends_includes_readonly_fields_for_convergence():
    """Readonly columns are included so next pull doesn't see a phantom diff."""
    excel_only = [{"row": 8, "A": "T-002", "G": datetime.date(2026, 6, 1)}]
    columns = cols(("A", "id"), ("G", "start_date", True))
    appends = build_yaml_appends(excel_only, columns, id_column="A")
    assert appends == [{"id": "T-002", "start_date": datetime.date(2026, 6, 1)}]


# ---------------------------------------------------------------------------
# excel_rows_to_id_keyed (used by push snapshot guard)
# ---------------------------------------------------------------------------


def test_excel_rows_to_id_keyed_basic():
    excel_rows = [
        {"row": 7, "A": "T-001", "D": "名前", "I": "進行中"},
        {"row": 8, "A": "T-002", "D": "次", "I": "完了"},
    ]
    columns = cols(("A", "id"), ("D", "name"), ("I", "status"))
    result = excel_rows_to_id_keyed(excel_rows, columns, id_column="A")
    assert result == [
        {"id": "T-001", "name": "名前", "status": "進行中"},
        {"id": "T-002", "name": "次", "status": "完了"},
    ]


def test_excel_rows_to_id_keyed_skips_rows_with_no_id():
    excel_rows = [
        {"row": 7, "A": "T-001", "D": "x"},
        {"row": 8, "A": None, "D": "skip me"},
    ]
    columns = cols(("A", "id"), ("D", "name"))
    result = excel_rows_to_id_keyed(excel_rows, columns, id_column="A")
    assert result == [{"id": "T-001", "name": "x"}]


# ---------------------------------------------------------------------------
# _normalize_for_compare
# ---------------------------------------------------------------------------


def test_normalize_midnight_datetime_returns_date():
    assert _normalize_for_compare(datetime.datetime(2026, 4, 15, 0, 0)) == datetime.date(2026, 4, 15)


def test_normalize_datetime_with_time_unchanged():
    dt = datetime.datetime(2026, 4, 15, 10, 30)
    assert _normalize_for_compare(dt) == dt


def test_normalize_date_unchanged():
    d = datetime.date(2026, 4, 15)
    assert _normalize_for_compare(d) == d
