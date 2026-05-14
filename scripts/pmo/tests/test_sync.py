"""Tests for snapshot guard in cmd_pull / cmd_push (pull=Excel→YAML, push=YAML→Excel)."""
from __future__ import annotations

import sys
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from lib.snapshot import Snapshot, save_snapshot


SAMPLE_PMO_YAML_TMPL = """\
project:
  name: "Test Project"
  slug: "{slug}"
  start: "2026-01-01"
  end: "2026-12-31"

excel:
  file: "WBS.xlsx"
  sheet: "WBS"
  header_row: 1
  data_start_row: 2
  id_column: A
  columns:
    - {{col: A, field: id}}
    - {{col: B, field: name}}
    - {{col: C, field: status}}

tasks:
{tasks}
"""


def _task_block(tasks: list[dict[str, Any]]) -> str:
    lines = []
    for t in tasks:
        lines.append(f"  - id: {t['id']}")
        for k, v in t.items():
            if k == "id":
                continue
            val = f'"{v}"' if v is not None else "null"
            lines.append(f"    {k}: {val}")
    return "\n".join(lines)


def setup_project(
    pdir: Path,
    tasks: list[dict[str, Any]],
    snapshot_tasks: list[dict[str, Any]] | None = None,
    *,
    yaml_snapshot: list[dict[str, Any]] | None = None,
    excel_snapshot: list[dict[str, Any]] | None = None,
) -> Path:
    """Create a minimal project dir.

    - snapshot_tasks: convenience — applies the same task list to both
      yaml and excel sides of the snapshot.
    - yaml_snapshot / excel_snapshot: explicit per-side override, used when
      the two sides legitimately differ (e.g. excel_only rows post-push).
    """
    pdir.mkdir(parents=True, exist_ok=True)
    slug = pdir.name
    pmo_path = pdir / "pmo.yaml"
    pmo_path.write_text(
        SAMPLE_PMO_YAML_TMPL.format(slug=slug, tasks=_task_block(tasks)),
        encoding="utf-8",
    )
    (pdir / "WBS.xlsx").write_bytes(b"")
    if snapshot_tasks is not None or yaml_snapshot is not None or excel_snapshot is not None:
        y = yaml_snapshot if yaml_snapshot is not None else (snapshot_tasks or [])
        e = excel_snapshot if excel_snapshot is not None else (snapshot_tasks or [])
        snap = Snapshot(
            yaml={t["id"]: {k: v for k, v in t.items() if k != "id"} for t in y},
            excel={t["id"]: {k: v for k, v in t.items() if k != "id"} for t in e},
        )
        save_snapshot(snap, pdir / ".pmo" / "last-sync.json")
    return pdir


def make_args(mode: str, *, force: bool = False) -> SimpleNamespace:
    return SimpleNamespace(sheet="wbs", command=mode, project="proj", force=force)


class TestPullSnapshotGuard:
    def test_pull_aborts_when_yaml_modified(self, tmp_path, monkeypatch):
        pdir = setup_project(
            tmp_path / "proj",
            tasks=[{"id": "T-001", "name": "new", "status": None}],
            snapshot_tasks=[{"id": "T-001", "name": "old", "status": None}],
        )
        import sync as sync_mod
        monkeypatch.setattr(sync_mod, "project_dir", lambda *a, **kw: pdir)
        monkeypatch.setattr(sync_mod, "read_rows", lambda *a, **kw: [])

        rc = sync_mod.cmd_sync(make_args("pull"), mode="pull")
        assert rc == 2

    def test_pull_aborts_when_yaml_has_added_task(self, tmp_path, monkeypatch):
        pdir = setup_project(
            tmp_path / "proj",
            tasks=[
                {"id": "T-001", "name": "foo", "status": None},
                {"id": "T-002", "name": "bar", "status": None},
            ],
            snapshot_tasks=[{"id": "T-001", "name": "foo", "status": None}],
        )
        import sync as sync_mod
        monkeypatch.setattr(sync_mod, "project_dir", lambda *a, **kw: pdir)
        monkeypatch.setattr(sync_mod, "read_rows", lambda *a, **kw: [])

        rc = sync_mod.cmd_sync(make_args("pull"), mode="pull")
        assert rc == 2

    def test_pull_proceeds_on_first_run_no_snapshot(self, tmp_path, monkeypatch):
        pdir = setup_project(
            tmp_path / "proj",
            tasks=[{"id": "T-001", "name": "foo", "status": None}],
            snapshot_tasks=None,
        )
        import sync as sync_mod
        monkeypatch.setattr(sync_mod, "project_dir", lambda *a, **kw: pdir)
        monkeypatch.setattr(sync_mod, "read_rows", lambda *a, **kw: [])

        rc = sync_mod.cmd_sync(make_args("pull"), mode="pull")
        assert rc == 0

    def test_pull_proceeds_when_yaml_unchanged(self, tmp_path, monkeypatch):
        tasks = [{"id": "T-001", "name": "foo", "status": None}]
        pdir = setup_project(tmp_path / "proj", tasks, snapshot_tasks=tasks)
        import sync as sync_mod
        monkeypatch.setattr(sync_mod, "project_dir", lambda *a, **kw: pdir)
        monkeypatch.setattr(sync_mod, "read_rows", lambda *a, **kw: [])

        rc = sync_mod.cmd_sync(make_args("pull"), mode="pull")
        assert rc == 0

    def test_pull_force_skips_guard(self, tmp_path, monkeypatch):
        pdir = setup_project(
            tmp_path / "proj",
            tasks=[{"id": "T-001", "name": "new", "status": None}],
            snapshot_tasks=[{"id": "T-001", "name": "old", "status": None}],
        )
        import sync as sync_mod
        monkeypatch.setattr(sync_mod, "project_dir", lambda *a, **kw: pdir)
        monkeypatch.setattr(sync_mod, "read_rows", lambda *a, **kw: [])

        rc = sync_mod.cmd_sync(make_args("pull", force=True), mode="pull")
        assert rc == 0


class TestPushSnapshotGuard:
    def test_push_aborts_when_excel_modified(self, tmp_path, monkeypatch):
        snap_tasks = [{"id": "T-001", "name": "foo", "status": None}]
        yaml_tasks = [{"id": "T-001", "name": "foo", "status": None}]
        pdir = setup_project(tmp_path / "proj", yaml_tasks, snap_tasks)
        import sync as sync_mod
        monkeypatch.setattr(sync_mod, "project_dir", lambda *a, **kw: pdir)
        monkeypatch.setattr(
            sync_mod,
            "read_rows",
            lambda *a, **kw: [{"A": "T-001", "B": "foo", "C": "完了", "row": 2}],
        )

        rc = sync_mod.cmd_sync(make_args("push"), mode="push")
        assert rc == 2

    def test_push_proceeds_on_first_run_no_snapshot(self, tmp_path, monkeypatch):
        yaml_tasks = [{"id": "T-001", "name": "foo", "status": None}]
        pdir = setup_project(tmp_path / "proj", yaml_tasks, snapshot_tasks=None)
        import sync as sync_mod
        monkeypatch.setattr(sync_mod, "project_dir", lambda *a, **kw: pdir)
        monkeypatch.setattr(sync_mod, "read_rows", lambda *a, **kw: [])
        monkeypatch.setattr(sync_mod, "write_cells", lambda *a, **kw: None)
        monkeypatch.setattr(sync_mod, "batch_append_rows", lambda *a, **kw: None)
        monkeypatch.setattr(sync_mod, "backup_excel", lambda *a, **kw: None)

        rc = sync_mod.cmd_sync(make_args("push"), mode="push")
        assert rc == 0

    def test_push_force_skips_guard(self, tmp_path, monkeypatch):
        snap_tasks = [{"id": "T-001", "name": "foo", "status": None}]
        yaml_tasks = [{"id": "T-001", "name": "foo", "status": None}]
        pdir = setup_project(tmp_path / "proj", yaml_tasks, snap_tasks)
        import sync as sync_mod
        monkeypatch.setattr(sync_mod, "project_dir", lambda *a, **kw: pdir)
        monkeypatch.setattr(
            sync_mod,
            "read_rows",
            lambda *a, **kw: [{"A": "T-001", "B": "foo", "C": "完了", "row": 2}],
        )
        monkeypatch.setattr(sync_mod, "write_cells", lambda *a, **kw: None)
        monkeypatch.setattr(sync_mod, "backup_excel", lambda *a, **kw: None)

        rc = sync_mod.cmd_sync(make_args("push", force=True), mode="push")
        assert rc == 0


class TestSnapshotConsistencyAcrossSyncs:
    """Regression tests for back-to-back sync correctness.

    These exercise the snapshot construction logic to make sure:
      1. push does NOT abort when Excel contains rows not present in YAML
         (excel_only is a legitimate state, not "uncommitted changes").
      2. pull → next-pull does not resurrect tasks that were deleted from YAML
         (the prev_deleted ledger must keep classifying them as deleted).
      3. push snapshot reflects the post-write Excel state, not YAML, so the
         very next push of the same content is a no-op.
    """

    def test_push_does_not_abort_when_excel_has_unmanaged_rows(self, tmp_path, monkeypatch):
        """After a push that captured an excel_only row in the snapshot, a
        subsequent push of the same state must NOT trip the guard. This is the
        canonical "snapshot was built from YAML state, then push compared
        Excel-shape against YAML-shape and saw spurious added rows" bug."""
        yaml_tasks = [{"id": "T-001", "name": "foo", "status": None}]
        # Realistic post-push state: yaml side only knows T-001; excel side
        # captures both rows.
        pdir = setup_project(
            tmp_path / "proj",
            yaml_tasks,
            yaml_snapshot=[{"id": "T-001", "name": "foo", "status": None}],
            excel_snapshot=[
                {"id": "T-001", "name": "foo", "status": None},
                {"id": "X-999", "name": "manual entry", "status": None},
            ],
        )
        import sync as sync_mod
        monkeypatch.setattr(sync_mod, "project_dir", lambda *a, **kw: pdir)
        monkeypatch.setattr(
            sync_mod,
            "read_rows",
            lambda *a, **kw: [
                {"A": "T-001", "B": "foo", "C": None, "row": 2},
                {"A": "X-999", "B": "manual entry", "C": None, "row": 3},
            ],
        )
        monkeypatch.setattr(sync_mod, "write_cells", lambda *a, **kw: None)
        monkeypatch.setattr(sync_mod, "backup_excel", lambda *a, **kw: None)
        monkeypatch.setattr(sync_mod, "batch_append_rows", lambda *a, **kw: None)

        rc = sync_mod.cmd_sync(make_args("push"), mode="push")
        assert rc == 0, "push should not abort when Excel matches snapshot incl. excel_only rows"

    def test_back_to_back_push_is_noop(self, tmp_path, monkeypatch):
        """Two consecutive pushes against the same state: second push must not
        fire the guard. This is the canonical "did the snapshot get saved in the
        right shape" test."""
        yaml_tasks = [{"id": "T-001", "name": "foo", "status": None}]
        pdir = setup_project(tmp_path / "proj", yaml_tasks, snapshot_tasks=None)
        import sync as sync_mod
        monkeypatch.setattr(sync_mod, "project_dir", lambda *a, **kw: pdir)
        excel_state = [
            {"A": "T-001", "B": "foo", "C": None, "row": 2},
            {"A": "X-999", "B": "kept", "C": None, "row": 3},
        ]
        monkeypatch.setattr(sync_mod, "read_rows", lambda *a, **kw: list(excel_state))
        monkeypatch.setattr(sync_mod, "write_cells", lambda *a, **kw: None)
        monkeypatch.setattr(sync_mod, "backup_excel", lambda *a, **kw: None)
        monkeypatch.setattr(sync_mod, "batch_append_rows", lambda *a, **kw: None)

        rc1 = sync_mod.cmd_sync(make_args("push"), mode="push")
        assert rc1 == 0
        rc2 = sync_mod.cmd_sync(make_args("push"), mode="push")
        assert rc2 == 0, "second push of the same state must not trip the guard"

    def test_pull_then_pull_does_not_resurrect_yaml_deletion(self, tmp_path, monkeypatch):
        """After a pull that classified T-002 as 'deleted from yaml' (kept in
        Excel), the snapshot drops T-002 but prev_deleted retains it. The next
        pull MUST NOT resurrect T-002 — classify_unmatched needs to consult
        prev_deleted to know T-002 was a previously-seen id."""
        # Setup: this state represents "post first pull where T-002 was kept-
        # deleted-from-yaml". Snapshot reflects yaml (no T-002). deleted-ids
        # retains T-002 on the yaml side.
        from lib.snapshot import Snapshot, save_snapshot

        yaml_tasks = [{"id": "T-001", "name": "alpha", "status": None}]
        pdir = setup_project(tmp_path / "proj", yaml_tasks, snapshot_tasks=None)
        # After the prior pull: yaml has only T-001; excel still has both
        # (T-002 was kept-deleted-from-yaml). Snapshot reflects that asymmetry.
        save_snapshot(
            Snapshot(
                yaml={"T-001": {"name": "alpha", "status": None}},
                excel={
                    "T-001": {"B": "alpha", "C": None},
                    "T-002": {"B": "beta", "C": None},
                },
            ),
            pdir / ".pmo" / "last-sync.json",
        )
        # deleted-ids carries T-002 as kept-deleted-from-yaml
        import json
        (pdir / ".pmo").mkdir(exist_ok=True)
        with (pdir / ".pmo" / "deleted-ids.json").open("w") as f:
            json.dump({"excel": [], "yaml": ["T-002"]}, f)

        import sync as sync_mod
        monkeypatch.setattr(sync_mod, "project_dir", lambda *a, **kw: pdir)
        # Excel still has both rows (T-002 was kept on excel side).
        monkeypatch.setattr(
            sync_mod,
            "read_rows",
            lambda *a, **kw: [
                {"A": "T-001", "B": "alpha", "C": None, "row": 2},
                {"A": "T-002", "B": "beta", "C": None, "row": 3},
            ],
        )

        rc = sync_mod.cmd_sync(make_args("pull"), mode="pull")
        assert rc == 0

        from lib.yaml_io import load_pmo_yaml
        pmo_after = load_pmo_yaml(pdir / "pmo.yaml")
        ids_after = [t["id"] for t in pmo_after.tasks]
        assert "T-002" not in ids_after, "T-002 was resurrected — prev_deleted not consulted"

        # deleted-ids must still contain T-002 (stable across syncs as long as
        # T-002 remains absent from YAML).
        with (pdir / ".pmo" / "deleted-ids.json").open() as f:
            saved = json.load(f)
        assert "T-002" in saved["yaml"], "T-002 should remain in deleted-ids after pull"

    def test_push_snapshot_reflects_excel_not_yaml(self, tmp_path, monkeypatch):
        """After push, the snapshot file must contain Excel-shape rows. Verify
        by inspecting the saved snapshot — its rows must include the excel_only
        ID even though it never appeared in YAML."""
        yaml_tasks = [{"id": "T-001", "name": "foo", "status": None}]
        pdir = setup_project(tmp_path / "proj", yaml_tasks, snapshot_tasks=None)
        import sync as sync_mod
        monkeypatch.setattr(sync_mod, "project_dir", lambda *a, **kw: pdir)
        monkeypatch.setattr(
            sync_mod,
            "read_rows",
            lambda *a, **kw: [
                {"A": "T-001", "B": "foo", "C": None, "row": 2},
                {"A": "X-999", "B": "manual", "C": None, "row": 3},
            ],
        )
        monkeypatch.setattr(sync_mod, "write_cells", lambda *a, **kw: None)
        monkeypatch.setattr(sync_mod, "backup_excel", lambda *a, **kw: None)
        monkeypatch.setattr(sync_mod, "batch_append_rows", lambda *a, **kw: None)

        rc = sync_mod.cmd_sync(make_args("push"), mode="push")
        assert rc == 0

        from lib.snapshot import load_snapshot
        snap = load_snapshot(pdir / ".pmo" / "last-sync.json")
        assert "T-001" in snap.excel
        assert "X-999" in snap.excel, "push snapshot must include excel_only rows on the excel side"
        # And the yaml side reflects pmo.tasks (no X-999).
        assert "T-001" in snap.yaml
        assert "X-999" not in snap.yaml, "yaml side must NOT contain excel_only rows"

    def test_push_then_pull_does_not_trip_guard(self, tmp_path, monkeypatch):
        """Cross-mode regression: a push captures excel_only rows on the excel
        side of the snapshot. A subsequent pull (no edits anywhere) compares
        current YAML against snap.yaml — which does NOT contain the excel_only
        IDs — so the guard must not see them as 'removed from YAML'."""
        yaml_tasks = [{"id": "T-001", "name": "foo", "status": None}]
        pdir = setup_project(tmp_path / "proj", yaml_tasks, snapshot_tasks=None)
        excel_state = [
            {"A": "T-001", "B": "foo", "C": None, "row": 2},
            {"A": "X-999", "B": "kept", "C": None, "row": 3},
        ]
        import sync as sync_mod
        monkeypatch.setattr(sync_mod, "project_dir", lambda *a, **kw: pdir)
        # Return a fresh list each read so cmd_sync's in-place mutation of
        # "row" sentinels doesn't pollute subsequent reads.
        monkeypatch.setattr(
            sync_mod, "read_rows", lambda *a, **kw: [dict(r) for r in excel_state]
        )
        monkeypatch.setattr(sync_mod, "write_cells", lambda *a, **kw: None)
        monkeypatch.setattr(sync_mod, "backup_excel", lambda *a, **kw: None)
        monkeypatch.setattr(sync_mod, "batch_append_rows", lambda *a, **kw: None)

        rc_push = sync_mod.cmd_sync(make_args("push"), mode="push")
        assert rc_push == 0, "first push should succeed"
        rc_pull = sync_mod.cmd_sync(make_args("pull"), mode="pull")
        assert rc_pull == 0, "pull right after push must not trip the cross-mode guard"

    def test_pull_ignores_readonly_values_in_snapshot(self, tmp_path, monkeypatch):
        """Snapshots may contain values for a readonly column — either because
        the snapshot was written under the legacy ``{"rows": ...}`` format
        (where readonly didn't exist), or because the column was promoted to
        ``readonly: true`` after a sync. The pull guard must filter those
        readonly values out of the snapshot side so they don't surface as
        spurious diffs against the readonly-stripped current YAML."""
        pdir = tmp_path / "proj"
        pdir.mkdir()
        (pdir / "pmo.yaml").write_text(
            """project:
  name: "Test"
  slug: "proj"
  start: "2026-01-01"
  end: "2026-12-31"
excel:
  file: "WBS.xlsx"
  sheet: "WBS"
  header_row: 1
  data_start_row: 2
  id_column: A
  columns:
    - {col: A, field: id}
    - {col: B, field: name}
    - {col: C, field: start_date, readonly: true}
tasks:
  - id: T-001
    name: foo
    start_date: null
""",
            encoding="utf-8",
        )
        (pdir / "WBS.xlsx").write_bytes(b"")
        # Snapshot retains a readonly field value (e.g. legacy format).
        # The current YAML has start_date: null, so without filtering the
        # snapshot side, diff would report "T-001.start_date changed".
        snap = Snapshot(
            yaml={"T-001": {"name": "foo", "start_date": "2026-04-15T00:00:00"}},
            excel={"T-001": {"name": "foo", "start_date": "2026-04-15T00:00:00"}},
        )
        save_snapshot(snap, pdir / ".pmo" / "last-sync.json")

        import sync as sync_mod
        monkeypatch.setattr(sync_mod, "project_dir", lambda *a, **kw: pdir)
        monkeypatch.setattr(
            sync_mod, "read_rows", lambda *a, **kw: [
                {"A": "T-001", "B": "foo", "C": None, "row": 2}
            ]
        )
        monkeypatch.setattr(sync_mod, "write_cells", lambda *a, **kw: None)
        monkeypatch.setattr(sync_mod, "backup_excel", lambda *a, **kw: None)
        monkeypatch.setattr(sync_mod, "batch_append_rows", lambda *a, **kw: None)

        rc = sync_mod.cmd_sync(make_args("pull"), mode="pull")
        assert rc == 0, "readonly-only diffs in snapshot must not trip the pull guard"
