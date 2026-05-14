"""Tests for snapshot-based deletion detection in cmd_sync (F2)."""
from lib.reconcile import classify_unmatched


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def snap_rows(*ids: str) -> dict:
    """Build a simple snapshot rows dict with the given ids."""
    return {tid: {"id": tid} for tid in ids}


# ---------------------------------------------------------------------------
# excel_only classification (yaml_only in Excel = deleted from Excel side)
# ---------------------------------------------------------------------------

def test_excel_only_id_in_snapshot_is_deletion():
    """A task present in YAML but absent in Excel AND known to snapshot → deleted in Excel."""
    yaml_only = [{"id": "T-001"}, {"id": "T-002"}]
    snapshot_rows = snap_rows("T-001")  # T-001 was known, T-002 is new

    new, deleted = classify_unmatched(yaml_only, snapshot_rows, id_field="id")

    assert [t["id"] for t in deleted] == ["T-001"]
    assert [t["id"] for t in new] == ["T-002"]


def test_excel_only_id_not_in_snapshot_is_new():
    """A task in YAML not in Excel and NOT in snapshot → brand new YAML task."""
    yaml_only = [{"id": "T-003"}]
    snapshot_rows = snap_rows("T-001", "T-002")  # T-003 not known

    new, deleted = classify_unmatched(yaml_only, snapshot_rows, id_field="id")

    assert [t["id"] for t in new] == ["T-003"]
    assert deleted == []


def test_yaml_only_id_in_snapshot_is_deletion():
    """A row present in Excel but absent in YAML AND known to snapshot → deleted in YAML."""
    excel_only = [{"id": "E-001"}, {"id": "E-002"}]
    snapshot_rows = snap_rows("E-002")  # E-002 was known, E-001 is new

    new, deleted = classify_unmatched(excel_only, snapshot_rows, id_field="id")

    assert [t["id"] for t in deleted] == ["E-002"]
    assert [t["id"] for t in new] == ["E-001"]


def test_yaml_only_id_not_in_snapshot_is_new():
    """A row in Excel not in YAML and NOT in snapshot → new row added in Excel."""
    excel_only = [{"id": "E-099"}]
    snapshot_rows = snap_rows()  # empty snapshot

    new, deleted = classify_unmatched(excel_only, snapshot_rows, id_field="id")

    assert [t["id"] for t in new] == ["E-099"]
    assert deleted == []


def test_empty_snapshot_all_new():
    """When snapshot is empty (first run), every unmatched item is new."""
    items = [{"id": "T-001"}, {"id": "T-002"}, {"id": "T-003"}]
    new, deleted = classify_unmatched(items, {}, id_field="id")

    assert len(new) == 3
    assert deleted == []


def test_classify_unmatched_empty_items():
    """Empty input list → both lists empty."""
    new, deleted = classify_unmatched([], snap_rows("T-001"), id_field="id")
    assert new == []
    assert deleted == []


def test_classify_unmatched_all_deleted():
    """All items known in snapshot → all classified as deleted."""
    items = [{"id": "T-001"}, {"id": "T-002"}]
    new, deleted = classify_unmatched(items, snap_rows("T-001", "T-002"), id_field="id")

    assert new == []
    assert sorted(t["id"] for t in deleted) == ["T-001", "T-002"]
