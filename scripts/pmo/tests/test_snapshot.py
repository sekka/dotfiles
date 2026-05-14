from pathlib import Path
from lib.snapshot import save_snapshot, load_snapshot, Snapshot


def test_save_and_load_snapshot_round_trip(tmp_path):
    snap = Snapshot(rows={
        "T-001": {"status": "進行中", "start_date": "2026-04-15"},
        "T-002": {"status": None, "start_date": None},
    })
    path = tmp_path / ".pmo" / "last-sync.json"
    save_snapshot(snap, path)
    loaded = load_snapshot(path)
    assert loaded.rows == snap.rows


def test_load_snapshot_missing_file_returns_empty(tmp_path):
    loaded = load_snapshot(tmp_path / "missing.json")
    assert loaded.rows == {}
    assert loaded.is_empty()


def test_save_snapshot_creates_parent_dir(tmp_path):
    snap = Snapshot(rows={"T-001": {"status": "完了"}})
    path = tmp_path / "deep" / "nested" / "last-sync.json"
    save_snapshot(snap, path)
    assert path.exists()


def test_save_snapshot_with_datetime_values(tmp_path):
    import datetime
    snap = Snapshot(rows={
        "T-001": {
            "status": "完了",
            "start_date": datetime.datetime(2026, 4, 15, 0, 0),
            "end_date": datetime.date(2026, 4, 30),
        }
    })
    path = tmp_path / ".pmo" / "last-sync.json"
    save_snapshot(snap, path)
    import json
    with path.open() as f:
        data = json.load(f)
    assert data["rows"]["T-001"]["start_date"] == "2026-04-15T00:00:00"
    assert data["rows"]["T-001"]["end_date"] == "2026-04-30"
