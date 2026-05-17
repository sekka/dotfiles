from pathlib import Path

import pytest

from lib.yaml_io import load_yaml, save_yaml

FIXTURE = Path(__file__).parent / "fixtures" / "sample_wbs.yaml"


def test_load_yaml_parses_project():
    doc = load_yaml(FIXTURE)
    assert doc["project"]["name"] == "Sample"
    assert doc["project"]["slug"] == "sample"


def test_load_yaml_parses_excel_file():
    doc = load_yaml(FIXTURE)
    assert doc["excel"]["file"] == "WBS.xlsx"


def test_load_yaml_parses_tasks():
    doc = load_yaml(FIXTURE)
    tasks = doc["tasks"]
    assert len(tasks) == 1
    assert tasks[0]["id"] == "T-001"
    assert tasks[0]["assignee"] == "PM"
    assert tasks[0]["start_date"] is None


def test_save_yaml_round_trip(tmp_path):
    doc = load_yaml(FIXTURE)
    out = tmp_path / "out.yaml"
    save_yaml(doc, out)
    reloaded = load_yaml(out)
    assert reloaded["project"] == doc["project"]
    assert list(reloaded["tasks"]) == list(doc["tasks"])


def test_save_yaml_preserves_comments(tmp_path):
    src = tmp_path / "commented.yaml"
    src.write_text(
        "project:\n"
        "  name: 'Test'\n"
        "  slug: 'test'\n"
        "\n"
        "excel:\n"
        "  file: 'WBS.xlsx'\n"
        "\n"
        "tasks:\n"
        "  # 重要な仕事\n"
        "  - id: T-001\n"
        "    name: foo\n"
        "    status: null\n",
        encoding="utf-8",
    )
    doc = load_yaml(src)
    out = tmp_path / "out.yaml"
    save_yaml(doc, out)
    assert "# 重要な仕事" in out.read_text(encoding="utf-8")


def test_save_yaml_atomic_on_dump_error(tmp_path):
    """Regression for 2026-05-15 incident: non-serializable values must NOT
    truncate an existing destination file. Atomic write (tmp + os.replace)
    preserves the prior content when dump raises."""
    doc = load_yaml(FIXTURE)
    out = tmp_path / "existing.yaml"
    save_yaml(doc, out)
    original = out.read_bytes()
    assert len(original) > 0

    class _Unrepresentable:
        pass

    doc["tasks"].append({"id": "T-BAD", "name": _Unrepresentable()})
    with pytest.raises(Exception):
        save_yaml(doc, out)

    assert out.read_bytes() == original
    assert not (tmp_path / "existing.yaml.tmp").exists()
