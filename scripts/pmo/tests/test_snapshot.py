import datetime
import json

from lib.snapshot import save_snapshot, load_snapshot, Snapshot, diff_against_snapshot


def test_save_and_load_snapshot_round_trip(tmp_path):
    snap = Snapshot(
        yaml={
            "T-001": {"status": "進行中", "start_date": "2026-04-15"},
            "T-002": {"status": None, "start_date": None},
        },
        excel={
            "T-001": {"status": "進行中"},
        },
    )
    path = tmp_path / ".pmo" / "last-sync.json"
    save_snapshot(snap, path)
    loaded = load_snapshot(path)
    assert loaded.yaml == snap.yaml
    assert loaded.excel == snap.excel


def test_load_snapshot_missing_file_returns_empty(tmp_path):
    loaded = load_snapshot(tmp_path / "missing.json")
    assert loaded.yaml == {}
    assert loaded.excel == {}
    assert loaded.is_empty()


def test_save_snapshot_creates_parent_dir(tmp_path):
    snap = Snapshot(yaml={"T-001": {"status": "完了"}})
    path = tmp_path / "deep" / "nested" / "last-sync.json"
    save_snapshot(snap, path)
    assert path.exists()


def test_save_snapshot_with_datetime_values(tmp_path):
    snap = Snapshot(
        yaml={
            "T-001": {
                "status": "完了",
                "start_date": datetime.datetime(2026, 4, 15, 0, 0),
                "end_date": datetime.date(2026, 4, 30),
            }
        },
        excel={
            "T-001": {
                "status": "完了",
                "start_date": datetime.date(2026, 4, 15),
            }
        },
    )
    path = tmp_path / ".pmo" / "last-sync.json"
    save_snapshot(snap, path)
    with path.open() as f:
        data = json.load(f)
    assert data["yaml"]["T-001"]["start_date"] == "2026-04-15T00:00:00"
    assert data["yaml"]["T-001"]["end_date"] == "2026-04-30"
    assert data["excel"]["T-001"]["start_date"] == "2026-04-15"


def test_load_snapshot_legacy_rows_format_backward_compat(tmp_path):
    """Old snapshots stored a single 'rows' dict. Loader must treat it as
    identical for both yaml and excel sides so the next sync regenerates them."""
    path = tmp_path / ".pmo" / "last-sync.json"
    path.parent.mkdir(parents=True)
    with path.open("w") as f:
        json.dump({"rows": {"T-001": {"name": "foo"}}}, f)
    loaded = load_snapshot(path)
    assert loaded.yaml == {"T-001": {"name": "foo"}}
    assert loaded.excel == {"T-001": {"name": "foo"}}


def test_known_ids_unions_both_sides():
    snap = Snapshot(
        yaml={"T-001": {}, "T-002": {}},
        excel={"T-002": {}, "X-999": {}},
    )
    assert snap.known_ids() == {"T-001", "T-002", "X-999"}


# ---------------------------------------------------------------------------
# diff_against_snapshot tests
# ---------------------------------------------------------------------------

def test_diff_against_snapshot_no_changes():
    snap_rows = {
        "T-001": {"name": "foo", "status": "完了"},
        "T-002": {"name": "bar", "status": "進行中"},
    }
    current = [
        {"id": "T-001", "name": "foo", "status": "完了"},
        {"id": "T-002", "name": "bar", "status": "進行中"},
    ]
    diff = diff_against_snapshot(snap_rows, current)
    assert diff.modified == {}
    assert diff.added == []
    assert diff.removed == []
    assert not diff.has_changes()


def test_diff_against_snapshot_modified_field():
    snap_rows = {"T-001": {"name": "foo", "status": "進行中"}}
    current = [{"id": "T-001", "name": "bar", "status": "進行中"}]
    diff = diff_against_snapshot(snap_rows, current)
    assert "T-001" in diff.modified
    assert diff.modified["T-001"] == {"name": ("foo", "bar")}
    assert diff.added == []
    assert diff.removed == []
    assert diff.has_changes()


def test_diff_against_snapshot_added_task():
    snap_rows = {"T-001": {"name": "foo"}}
    current = [{"id": "T-001", "name": "foo"}, {"id": "T-002", "name": "bar"}]
    diff = diff_against_snapshot(snap_rows, current)
    assert diff.added == ["T-002"]
    assert diff.modified == {}
    assert diff.removed == []
    assert diff.has_changes()


def test_diff_against_snapshot_removed_task():
    snap_rows = {"T-001": {"name": "foo"}, "T-002": {"name": "bar"}}
    current = [{"id": "T-001", "name": "foo"}]
    diff = diff_against_snapshot(snap_rows, current)
    assert diff.removed == ["T-002"]
    assert diff.modified == {}
    assert diff.added == []
    assert diff.has_changes()


def test_diff_against_snapshot_empty_snapshot_all_added():
    snap_rows: dict = {}
    current = [{"id": "T-001", "name": "foo"}]
    diff = diff_against_snapshot(snap_rows, current)
    # empty snapshot = first run, no changes detected
    assert not diff.has_changes()


def test_diff_against_snapshot_datetime_vs_date_no_change():
    """midnight datetime and date should compare equal (no spurious diff)."""
    snap_rows = {"T-001": {"start_date": "2026-04-15"}}
    current = [{"id": "T-001", "start_date": datetime.date(2026, 4, 15)}]
    diff = diff_against_snapshot(snap_rows, current)
    assert not diff.has_changes()


def test_diff_against_snapshot_iso_datetime_string_vs_midnight_datetime_no_change():
    """Snapshot serializes datetime as 'YYYY-MM-DDTHH:MM:SS'. After load the
    snapshot side holds the string while the current side holds a datetime
    object — these must compare equal at the date level."""
    snap_rows = {"T-001": {"start_date": "2026-06-10T00:00:00"}}
    current = [{"id": "T-001", "start_date": datetime.datetime(2026, 6, 10, 0, 0)}]
    diff = diff_against_snapshot(snap_rows, current)
    assert not diff.has_changes()


def test_diff_against_snapshot_multiple_changes():
    snap_rows = {
        "T-001": {"name": "設計", "assignee": "佐藤"},
        "T-002": {"name": "実装", "assignee": "田中"},
        "T-003": {"name": "テスト", "assignee": "鈴木"},
    }
    current = [
        {"id": "T-001", "name": "基本設計", "assignee": "佐藤"},   # modified
        {"id": "T-002", "name": "実装", "assignee": "田中"},        # unchanged
        # T-003 removed
        {"id": "T-004", "name": "レビュー", "assignee": "山田"},    # added
    ]
    diff = diff_against_snapshot(snap_rows, current)
    assert "T-001" in diff.modified
    assert diff.modified["T-001"] == {"name": ("設計", "基本設計")}
    assert diff.added == ["T-004"]
    assert diff.removed == ["T-003"]
    assert diff.has_changes()

