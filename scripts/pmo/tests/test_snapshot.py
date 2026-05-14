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
