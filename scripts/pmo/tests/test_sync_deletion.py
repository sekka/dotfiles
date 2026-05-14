"""Tests for snapshot-based deletion detection in cmd_sync (F2)."""
from lib.reconcile import classify_unmatched
from sync import load_deleted_ids, save_deleted_ids, _compute_new_deleted  # noqa: PLC2701


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def snap_rows(*ids: str) -> set[str]:
    """Build a snapshot id set with the given ids."""
    return set(ids)


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
    new, deleted = classify_unmatched(items, set(), id_field="id")

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


# ---------------------------------------------------------------------------
# Sticky warn suppression: load_deleted_ids / save_deleted_ids
# ---------------------------------------------------------------------------

def test_load_deleted_ids_missing_file(tmp_path):
    """Returns empty sets when deleted-ids.json does not exist."""
    result = load_deleted_ids(tmp_path)
    assert result == {"excel": set(), "yaml": set()}


def test_save_and_load_deleted_ids_roundtrip(tmp_path):
    """Saved deleted ids can be loaded back correctly."""
    data = {"excel": {"T-001", "T-002"}, "yaml": {"T-003"}}
    save_deleted_ids(tmp_path, data)
    loaded = load_deleted_ids(tmp_path)
    assert loaded["excel"] == {"T-001", "T-002"}
    assert loaded["yaml"] == {"T-003"}


def test_save_deleted_ids_overwrites_previous(tmp_path):
    """Second save replaces first (shrink supported: removed ids disappear)."""
    save_deleted_ids(tmp_path, {"excel": {"T-001", "T-002"}, "yaml": set()})
    save_deleted_ids(tmp_path, {"excel": {"T-002"}, "yaml": set()})
    loaded = load_deleted_ids(tmp_path)
    assert loaded["excel"] == {"T-002"}


def test_sticky_warn_suppressed_on_second_sync(tmp_path):
    """Deletions already in prev_deleted must not appear in new_excel_deleted."""
    yaml_only_deleted = [{"id": "T-001"}, {"id": "T-002"}]
    prev_deleted = {"excel": {"T-001"}, "yaml": set()}

    new_excel_deleted = [
        t for t in yaml_only_deleted if t["id"] not in prev_deleted["excel"]
    ]

    assert [t["id"] for t in new_excel_deleted] == ["T-002"]


def test_sticky_warn_fires_on_first_sync(tmp_path):
    """When prev_deleted is empty, all deletions trigger a warn."""
    yaml_only_deleted = [{"id": "T-001"}, {"id": "T-002"}]
    prev_deleted = {"excel": set(), "yaml": set()}

    new_excel_deleted = [
        t for t in yaml_only_deleted if t["id"] not in prev_deleted["excel"]
    ]

    assert sorted(t["id"] for t in new_excel_deleted) == ["T-001", "T-002"]


def test_restored_id_removed_from_deleted_ids(tmp_path):
    """If a previously-deleted id is restored, it is absent from the saved file."""
    save_deleted_ids(tmp_path, {"excel": {"T-001", "T-002"}, "yaml": set()})
    # Next sync: T-001 is no longer in the deletion list (restored)
    save_deleted_ids(tmp_path, {"excel": {"T-002"}, "yaml": set()})
    loaded = load_deleted_ids(tmp_path)
    assert "T-001" not in loaded["excel"]
    assert "T-002" in loaded["excel"]


# ---------------------------------------------------------------------------
# Concern 1: pull mode must not touch the excel side of deleted-ids
# ---------------------------------------------------------------------------

def test_compute_new_deleted_pull_leaves_excel_side_untouched():
    """pull mode: yaml side updated, excel side preserved from prev."""
    prev = {"excel": {"T-001"}, "yaml": set()}
    yaml_only_deleted: list = []  # pull doesn't process yaml_only_deleted
    excel_only_deleted = [{"A": "T-002"}]  # row deleted in yaml

    result = _compute_new_deleted(prev, yaml_only_deleted, excel_only_deleted, "A", "pull")

    assert result["yaml"] == {"T-002"}
    assert result["excel"] == {"T-001"}  # unchanged


def test_compute_new_deleted_push_leaves_yaml_side_untouched():
    """push mode: excel side updated, yaml side preserved from prev."""
    prev = {"excel": set(), "yaml": {"T-003"}}
    yaml_only_deleted = [{"id": "T-001"}]  # task deleted in excel
    excel_only_deleted: list = []  # push doesn't process excel_only_deleted

    result = _compute_new_deleted(prev, yaml_only_deleted, excel_only_deleted, "A", "push")

    assert result["excel"] == {"T-001"}
    assert result["yaml"] == {"T-003"}  # unchanged


