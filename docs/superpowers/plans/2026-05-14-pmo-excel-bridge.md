# PMO Excel ⇄ YAML 双方向同期 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** WBS シート 1 枚を対象に、`pmo.yaml` と `WBS.xlsm` を列所有権モデルで双方向同期する CLI を Python + openpyxl で実装し、`/user-pmo-excel` スキルから呼べるようにする。

**Architecture:** `scripts/pmo/` 配下に独立した Python パッケージを置き、uv で openpyxl と ruamel.yaml を管理。CLI (`sync.py`) が `lib/` 配下のモジュール（yaml_io / excel_io / ownership / reconcile / snapshot）を呼ぶ。VBA マクロは `keep_vba=True` で round-trip し、ガントチャート部は触らない。

**Tech Stack:** Python 3.13, uv, openpyxl 3.x, ruamel.yaml, pytest, argparse (stdlib)

**Spec:** `docs/superpowers/specs/2026-05-14-pmo-excel-bridge-design.md`

---

## File Structure

新規作成:

- `scripts/pmo/pyproject.toml` — uv プロジェクト定義
- `scripts/pmo/sync.py` — CLI エントリポイント（argparse、サブコマンド: sync/pull/push/doctor）
- `scripts/pmo/lib/__init__.py` — パッケージマーカー
- `scripts/pmo/lib/yaml_io.py` — `pmo.yaml` 読み書き＋スキーマ検証（ruamel.yaml）
- `scripts/pmo/lib/excel_io.py` — xlsm 読み書き（openpyxl, keep_vba=True）
- `scripts/pmo/lib/ownership.py` — 列所有権ルール解決
- `scripts/pmo/lib/reconcile.py` — 行マッチングと列所有権ベースのマージ
- `scripts/pmo/lib/snapshot.py` — `.pmo/last-sync.json` 管理
- `scripts/pmo/tests/__init__.py` — パッケージマーカー
- `scripts/pmo/tests/test_yaml_io.py` — yaml_io 単体テスト
- `scripts/pmo/tests/test_ownership.py` — 列所有権解決テスト
- `scripts/pmo/tests/test_reconcile.py` — 行マッチングとマージのテスト
- `scripts/pmo/tests/fixtures/sample_pmo.yaml` — テスト用 yaml
- `scripts/pmo/tests/fixtures/sample_wbs.xlsx` — テスト用 Excel（テスト中に動的生成）
- `scripts/pmo/README.md` — 使い方と手動テスト手順
- `home/.claude/skills/user-pmo-excel/SKILL.md` — Claude スキル定義

修正:

- `mise.toml` — `pmo:sync` 等のタスクを追加（任意）

---

## Task 1: Python プロジェクトのブートストラップ

**Files:**

- Create: `scripts/pmo/pyproject.toml`
- Create: `scripts/pmo/lib/__init__.py`
- Create: `scripts/pmo/tests/__init__.py`

- [ ] **Step 1: pyproject.toml を作成**

```toml
[project]
name = "pmo-sync"
version = "0.1.0"
description = "PMO Excel ⇄ YAML bidirectional sync"
requires-python = ">=3.13"
dependencies = [
  "openpyxl>=3.1.0",
  "ruamel.yaml>=0.18.0",
]

[dependency-groups]
dev = [
  "pytest>=8.0.0",
]

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["."]
```

- [ ] **Step 2: 空の **init**.py を作成**

`scripts/pmo/lib/__init__.py` と `scripts/pmo/tests/__init__.py` を空ファイルで作成。

- [ ] **Step 3: 依存をインストールして検証**

Run:

```bash
cd scripts/pmo && uv sync
uv run python -c "import openpyxl; from ruamel.yaml import YAML; print('OK')"
```

Expected: `OK` と表示される。エラーなし。

- [ ] **Step 4: pytest が動くことを確認**

Run:

```bash
cd scripts/pmo && uv run pytest --collect-only
```

Expected: テストが 0 件で正常終了（exit 0）。

- [ ] **Step 5: Commit**

```bash
git add scripts/pmo/pyproject.toml scripts/pmo/uv.lock scripts/pmo/lib/__init__.py scripts/pmo/tests/__init__.py
git commit -m "feat: PMO 同期スクリプトの Python プロジェクトを初期化"
```

---

## Task 2: yaml_io — データクラス定義

**Files:**

- Create: `scripts/pmo/lib/yaml_io.py`
- Create: `scripts/pmo/tests/test_yaml_io.py`
- Create: `scripts/pmo/tests/fixtures/sample_pmo.yaml`

- [ ] **Step 1: フィクスチャ yaml を作成**

`scripts/pmo/tests/fixtures/sample_pmo.yaml`:

```yaml
project:
  name: "Sample"
  slug: "sample"
  start: "2026-04-15"
  end: "2026-06-30"

excel:
  file: "WBS.xlsx"
  sheet: "WBS"
  header_row: 6
  data_start_row: 7
  id_column: A
  columns:
    - { col: A, field: id, owner: yaml }
    - { col: B, field: phase_l1, owner: yaml }
    - { col: C, field: phase_l2, owner: yaml }
    - { col: D, field: name, owner: yaml }
    - { col: E, field: assignee, owner: yaml }
    - { col: F, field: est_hours, owner: yaml }
    - { col: G, field: start_date, owner: excel }
    - { col: H, field: end_date, owner: excel }
    - { col: I, field: status, owner: excel }

tasks:
  - id: T-001
    phase_l1: "現状把握"
    phase_l2: "事前ヒアリング"
    name: "ヒアリング対象者選定"
    assignee: "PM"
    est_hours: 1
    start_date: null
    end_date: null
    status: null
```

- [ ] **Step 2: 失敗するテストを書く**

`scripts/pmo/tests/test_yaml_io.py`:

```python
from pathlib import Path
from lib.yaml_io import load_pmo_yaml, PmoYaml, ColumnSpec

FIXTURE = Path(__file__).parent / "fixtures" / "sample_pmo.yaml"


def test_load_pmo_yaml_parses_project():
    pmo = load_pmo_yaml(FIXTURE)
    assert pmo.project["name"] == "Sample"
    assert pmo.project["slug"] == "sample"


def test_load_pmo_yaml_parses_excel_config():
    pmo = load_pmo_yaml(FIXTURE)
    assert pmo.excel.file == "WBS.xlsx"
    assert pmo.excel.sheet == "WBS"
    assert pmo.excel.header_row == 6
    assert pmo.excel.data_start_row == 7
    assert pmo.excel.id_column == "A"


def test_load_pmo_yaml_parses_columns():
    pmo = load_pmo_yaml(FIXTURE)
    assert len(pmo.excel.columns) == 9
    cols_by_field = {c.field: c for c in pmo.excel.columns}
    assert cols_by_field["id"].col == "A"
    assert cols_by_field["id"].owner == "yaml"
    assert cols_by_field["status"].owner == "excel"


def test_load_pmo_yaml_parses_tasks():
    pmo = load_pmo_yaml(FIXTURE)
    assert len(pmo.tasks) == 1
    t = pmo.tasks[0]
    assert t["id"] == "T-001"
    assert t["phase_l1"] == "現状把握"
    assert t["assignee"] == "PM"
    assert t["start_date"] is None
```

- [ ] **Step 3: 実行して失敗を確認**

Run: `cd scripts/pmo && uv run pytest tests/test_yaml_io.py -v`
Expected: ImportError (`lib.yaml_io` が存在しない) で FAIL。

- [ ] **Step 4: 最小実装**

`scripts/pmo/lib/yaml_io.py`:

```python
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from ruamel.yaml import YAML

_yaml = YAML(typ="rt")
_yaml.preserve_quotes = True
_yaml.width = 4096


@dataclass
class ColumnSpec:
    col: str
    field: str
    owner: str


@dataclass
class ExcelConfig:
    file: str
    sheet: str
    header_row: int
    data_start_row: int
    id_column: str
    columns: list[ColumnSpec] = field(default_factory=list)


@dataclass
class PmoYaml:
    project: dict[str, Any]
    excel: ExcelConfig
    tasks: list[dict[str, Any]]
    _raw: Any = None


def load_pmo_yaml(path: Path) -> PmoYaml:
    with path.open("r", encoding="utf-8") as f:
        data = _yaml.load(f)
    excel_raw = data["excel"]
    columns = [
        ColumnSpec(col=str(c["col"]), field=c["field"], owner=c["owner"])
        for c in excel_raw["columns"]
    ]
    excel = ExcelConfig(
        file=excel_raw["file"],
        sheet=excel_raw["sheet"],
        header_row=int(excel_raw["header_row"]),
        data_start_row=int(excel_raw["data_start_row"]),
        id_column=str(excel_raw["id_column"]),
        columns=columns,
    )
    return PmoYaml(
        project=dict(data["project"]),
        excel=excel,
        tasks=[dict(t) for t in data.get("tasks", [])],
        _raw=data,
    )
```

- [ ] **Step 5: テストが通ることを確認**

Run: `cd scripts/pmo && uv run pytest tests/test_yaml_io.py -v`
Expected: 4 件すべて PASS。

- [ ] **Step 6: Commit**

```bash
git add scripts/pmo/lib/yaml_io.py scripts/pmo/tests/test_yaml_io.py scripts/pmo/tests/fixtures/sample_pmo.yaml
git commit -m "feat: yaml_io でデータクラスとロード関数を追加"
```

---

## Task 3: yaml_io — タスク更新と保存（ラウンドトリップ）

**Files:**

- Modify: `scripts/pmo/lib/yaml_io.py`
- Modify: `scripts/pmo/tests/test_yaml_io.py`

- [ ] **Step 1: 失敗するテストを追加**

`scripts/pmo/tests/test_yaml_io.py` の末尾に追加:

```python
def test_save_pmo_yaml_round_trip(tmp_path):
    pmo = load_pmo_yaml(FIXTURE)
    out = tmp_path / "out.yaml"
    save_pmo_yaml(pmo, out)
    reloaded = load_pmo_yaml(out)
    assert reloaded.project == pmo.project
    assert reloaded.tasks == pmo.tasks


def test_update_task_field_writes_back(tmp_path):
    pmo = load_pmo_yaml(FIXTURE)
    update_task_field(pmo, task_id="T-001", field="status", value="進行中")
    out = tmp_path / "out.yaml"
    save_pmo_yaml(pmo, out)
    reloaded = load_pmo_yaml(out)
    assert reloaded.tasks[0]["status"] == "進行中"


def test_update_task_field_missing_id_raises():
    import pytest
    pmo = load_pmo_yaml(FIXTURE)
    with pytest.raises(KeyError, match="T-999"):
        update_task_field(pmo, task_id="T-999", field="status", value="x")
```

インポート行を更新: `from lib.yaml_io import load_pmo_yaml, save_pmo_yaml, update_task_field, PmoYaml, ColumnSpec`

- [ ] **Step 2: 実行して失敗を確認**

Run: `cd scripts/pmo && uv run pytest tests/test_yaml_io.py -v`
Expected: 新規 3 件が ImportError で FAIL（`save_pmo_yaml`, `update_task_field` 未定義）。

- [ ] **Step 3: 実装を追加**

`scripts/pmo/lib/yaml_io.py` の末尾に追加:

```python
def save_pmo_yaml(pmo: PmoYaml, path: Path) -> None:
    data = pmo._raw
    data["project"] = pmo.project
    raw_tasks = []
    for t in pmo.tasks:
        raw_tasks.append(t)
    data["tasks"] = raw_tasks
    with path.open("w", encoding="utf-8") as f:
        _yaml.dump(data, f)


def update_task_field(pmo: PmoYaml, *, task_id: str, field: str, value: Any) -> None:
    for t in pmo.tasks:
        if t.get("id") == task_id:
            t[field] = value
            return
    raise KeyError(f"task id not found: {task_id}")
```

- [ ] **Step 4: テストが通ることを確認**

Run: `cd scripts/pmo && uv run pytest tests/test_yaml_io.py -v`
Expected: 7 件すべて PASS。

- [ ] **Step 5: Commit**

```bash
git add scripts/pmo/lib/yaml_io.py scripts/pmo/tests/test_yaml_io.py
git commit -m "feat: yaml_io にラウンドトリップ保存とタスク更新を追加"
```

---

## Task 4: ownership — 列所有権の解決

**Files:**

- Create: `scripts/pmo/lib/ownership.py`
- Create: `scripts/pmo/tests/test_ownership.py`

- [ ] **Step 1: 失敗するテストを書く**

`scripts/pmo/tests/test_ownership.py`:

```python
from lib.ownership import resolve_ownership, OwnerSide
from lib.yaml_io import ColumnSpec


def make_cols(*specs):
    return [ColumnSpec(col=c, field=f, owner=o) for c, f, o in specs]


def test_resolve_ownership_yaml_columns():
    cols = make_cols(("A", "id", "yaml"), ("B", "name", "yaml"))
    result = resolve_ownership(cols)
    assert result.yaml_fields == {"id", "name"}
    assert result.excel_fields == set()


def test_resolve_ownership_mixed():
    cols = make_cols(
        ("A", "id", "yaml"),
        ("B", "name", "yaml"),
        ("C", "status", "excel"),
        ("D", "note", "excel"),
    )
    result = resolve_ownership(cols)
    assert result.yaml_fields == {"id", "name"}
    assert result.excel_fields == {"status", "note"}


def test_resolve_ownership_invalid_owner_raises():
    import pytest
    cols = make_cols(("A", "id", "both"))
    with pytest.raises(ValueError, match="invalid owner"):
        resolve_ownership(cols)


def test_resolve_ownership_field_to_column_map():
    cols = make_cols(("A", "id", "yaml"), ("C", "status", "excel"))
    result = resolve_ownership(cols)
    assert result.column_of["id"] == "A"
    assert result.column_of["status"] == "C"


def test_resolve_ownership_owner_side_enum():
    assert OwnerSide.YAML.value == "yaml"
    assert OwnerSide.EXCEL.value == "excel"
```

- [ ] **Step 2: 実行して失敗を確認**

Run: `cd scripts/pmo && uv run pytest tests/test_ownership.py -v`
Expected: ImportError で FAIL。

- [ ] **Step 3: 実装**

`scripts/pmo/lib/ownership.py`:

```python
from dataclasses import dataclass, field
from enum import Enum
from typing import Iterable
from lib.yaml_io import ColumnSpec


class OwnerSide(str, Enum):
    YAML = "yaml"
    EXCEL = "excel"


@dataclass
class Ownership:
    yaml_fields: set[str] = field(default_factory=set)
    excel_fields: set[str] = field(default_factory=set)
    column_of: dict[str, str] = field(default_factory=dict)


def resolve_ownership(columns: Iterable[ColumnSpec]) -> Ownership:
    result = Ownership()
    for c in columns:
        if c.owner not in (OwnerSide.YAML.value, OwnerSide.EXCEL.value):
            raise ValueError(f"invalid owner: {c.owner} for field {c.field}")
        result.column_of[c.field] = c.col
        if c.owner == OwnerSide.YAML.value:
            result.yaml_fields.add(c.field)
        else:
            result.excel_fields.add(c.field)
    return result
```

- [ ] **Step 4: テストが通ることを確認**

Run: `cd scripts/pmo && uv run pytest tests/test_ownership.py -v`
Expected: 5 件すべて PASS。

- [ ] **Step 5: Commit**

```bash
git add scripts/pmo/lib/ownership.py scripts/pmo/tests/test_ownership.py
git commit -m "feat: ownership で列所有権の解決ロジックを実装"
```

---

## Task 5: excel_io — シート読み込み

**Files:**

- Create: `scripts/pmo/lib/excel_io.py`
- Create: `scripts/pmo/tests/test_excel_io.py`（最低限のスポット）

- [ ] **Step 1: テスト用 xlsx を生成するヘルパーとテストを書く**

`scripts/pmo/tests/test_excel_io.py`:

```python
from pathlib import Path
import openpyxl
from lib.excel_io import read_rows


def make_workbook(path: Path) -> None:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "WBS"
    # header row 6
    headers = ["id", "phase_l1", "phase_l2", "name", "assignee",
               "est_hours", "start_date", "end_date", "status"]
    for col_idx, h in enumerate(headers, start=1):
        ws.cell(row=6, column=col_idx, value=h)
    # data rows from row 7
    ws.cell(row=7, column=1, value="T-001")
    ws.cell(row=7, column=2, value="現状把握")
    ws.cell(row=7, column=4, value="ヒアリング")
    ws.cell(row=7, column=9, value="進行中")
    ws.cell(row=8, column=1, value="T-002")
    ws.cell(row=8, column=4, value="次タスク")
    wb.save(path)


def test_read_rows_returns_dicts_keyed_by_column_letter(tmp_path):
    xlsx = tmp_path / "wbs.xlsx"
    make_workbook(xlsx)
    rows = read_rows(xlsx, sheet="WBS", data_start_row=7,
                     columns=["A", "B", "C", "D", "E", "F", "G", "H", "I"])
    assert len(rows) == 2
    assert rows[0]["A"] == "T-001"
    assert rows[0]["B"] == "現状把握"
    assert rows[0]["I"] == "進行中"
    assert rows[1]["A"] == "T-002"
    assert rows[1]["D"] == "次タスク"


def test_read_rows_stops_at_first_empty_id(tmp_path):
    xlsx = tmp_path / "wbs.xlsx"
    make_workbook(xlsx)
    # row 9 left empty, row 10 has data → should stop at row 9
    wb = openpyxl.load_workbook(xlsx)
    ws = wb["WBS"]
    ws.cell(row=10, column=1, value="T-003")
    wb.save(xlsx)
    rows = read_rows(xlsx, sheet="WBS", data_start_row=7,
                     columns=["A", "B", "C", "D", "E", "F", "G", "H", "I"],
                     id_column="A")
    assert len(rows) == 2
```

- [ ] **Step 2: 実行して失敗を確認**

Run: `cd scripts/pmo && uv run pytest tests/test_excel_io.py -v`
Expected: ImportError で FAIL。

- [ ] **Step 3: 実装**

`scripts/pmo/lib/excel_io.py`:

```python
from pathlib import Path
from typing import Any
import openpyxl
from openpyxl.utils import column_index_from_string


def read_rows(
    workbook_path: Path,
    *,
    sheet: str,
    data_start_row: int,
    columns: list[str],
    id_column: str = "A",
) -> list[dict[str, Any]]:
    keep_vba = workbook_path.suffix.lower() == ".xlsm"
    wb = openpyxl.load_workbook(workbook_path, keep_vba=keep_vba, data_only=False)
    ws = wb[sheet]
    id_idx = column_index_from_string(id_column)
    rows: list[dict[str, Any]] = []
    row = data_start_row
    while True:
        id_value = ws.cell(row=row, column=id_idx).value
        if id_value is None or id_value == "":
            break
        row_data: dict[str, Any] = {}
        for col in columns:
            row_data[col] = ws.cell(row=row, column=column_index_from_string(col)).value
        rows.append(row_data)
        row += 1
    return rows
```

- [ ] **Step 4: テストが通ることを確認**

Run: `cd scripts/pmo && uv run pytest tests/test_excel_io.py -v`
Expected: 2 件すべて PASS。

- [ ] **Step 5: Commit**

```bash
git add scripts/pmo/lib/excel_io.py scripts/pmo/tests/test_excel_io.py
git commit -m "feat: excel_io で xlsm シート読み込みを実装"
```

---

## Task 6: excel_io — セル単位の書き込み

**Files:**

- Modify: `scripts/pmo/lib/excel_io.py`
- Modify: `scripts/pmo/tests/test_excel_io.py`

- [ ] **Step 1: 失敗するテストを追加**

`scripts/pmo/tests/test_excel_io.py` の末尾に追加:

```python
from lib.excel_io import write_cells


def test_write_cells_updates_existing_cells(tmp_path):
    xlsx = tmp_path / "wbs.xlsx"
    make_workbook(xlsx)
    write_cells(xlsx, sheet="WBS", updates=[
        (7, "I", "完了"),
        (7, "G", "2026-04-15"),
    ])
    wb = openpyxl.load_workbook(xlsx)
    ws = wb["WBS"]
    assert ws["I7"].value == "完了"
    assert ws["G7"].value == "2026-04-15"


def test_write_cells_preserves_other_cells(tmp_path):
    xlsx = tmp_path / "wbs.xlsx"
    make_workbook(xlsx)
    write_cells(xlsx, sheet="WBS", updates=[(7, "I", "完了")])
    wb = openpyxl.load_workbook(xlsx)
    ws = wb["WBS"]
    assert ws["A7"].value == "T-001"
    assert ws["D7"].value == "ヒアリング"
    assert ws["A8"].value == "T-002"
```

- [ ] **Step 2: 実行して失敗を確認**

Run: `cd scripts/pmo && uv run pytest tests/test_excel_io.py -v`
Expected: ImportError で FAIL。

- [ ] **Step 3: 実装**

`scripts/pmo/lib/excel_io.py` の末尾に追加:

```python
def write_cells(
    workbook_path: Path,
    *,
    sheet: str,
    updates: list[tuple[int, str, Any]],
) -> None:
    keep_vba = workbook_path.suffix.lower() == ".xlsm"
    wb = openpyxl.load_workbook(workbook_path, keep_vba=keep_vba)
    ws = wb[sheet]
    for row, col_letter, value in updates:
        col_idx = column_index_from_string(col_letter)
        ws.cell(row=row, column=col_idx, value=value)
    wb.save(workbook_path)
```

- [ ] **Step 4: テストが通ることを確認**

Run: `cd scripts/pmo && uv run pytest tests/test_excel_io.py -v`
Expected: 4 件すべて PASS。

- [ ] **Step 5: Commit**

```bash
git add scripts/pmo/lib/excel_io.py scripts/pmo/tests/test_excel_io.py
git commit -m "feat: excel_io にセル書き込みを追加"
```

---

## Task 7: excel_io — 新規行追加

**Files:**

- Modify: `scripts/pmo/lib/excel_io.py`
- Modify: `scripts/pmo/tests/test_excel_io.py`

- [ ] **Step 1: 失敗するテストを追加**

`scripts/pmo/tests/test_excel_io.py` の末尾に追加:

```python
from lib.excel_io import append_row


def test_append_row_inserts_at_next_empty_row(tmp_path):
    xlsx = tmp_path / "wbs.xlsx"
    make_workbook(xlsx)
    # 既存: row 7 と row 8 にデータ。row 9 が空。
    append_row(xlsx, sheet="WBS", data_start_row=7, id_column="A",
               values={"A": "T-003", "D": "新規タスク"})
    wb = openpyxl.load_workbook(xlsx)
    ws = wb["WBS"]
    assert ws["A9"].value == "T-003"
    assert ws["D9"].value == "新規タスク"
    assert ws["A7"].value == "T-001"  # 既存維持
```

- [ ] **Step 2: 実行して失敗を確認**

Run: `cd scripts/pmo && uv run pytest tests/test_excel_io.py -v`
Expected: ImportError で FAIL。

- [ ] **Step 3: 実装**

`scripts/pmo/lib/excel_io.py` の末尾に追加:

```python
def append_row(
    workbook_path: Path,
    *,
    sheet: str,
    data_start_row: int,
    id_column: str,
    values: dict[str, Any],
) -> int:
    keep_vba = workbook_path.suffix.lower() == ".xlsm"
    wb = openpyxl.load_workbook(workbook_path, keep_vba=keep_vba)
    ws = wb[sheet]
    id_idx = column_index_from_string(id_column)
    row = data_start_row
    while ws.cell(row=row, column=id_idx).value not in (None, ""):
        row += 1
    for col_letter, value in values.items():
        ws.cell(row=row, column=column_index_from_string(col_letter), value=value)
    wb.save(workbook_path)
    return row
```

- [ ] **Step 4: テストが通ることを確認**

Run: `cd scripts/pmo && uv run pytest tests/test_excel_io.py -v`
Expected: 5 件すべて PASS。

- [ ] **Step 5: Commit**

```bash
git add scripts/pmo/lib/excel_io.py scripts/pmo/tests/test_excel_io.py
git commit -m "feat: excel_io に新規行追加を実装"
```

---

## Task 8: snapshot — last-sync.json の保存・復元

**Files:**

- Create: `scripts/pmo/lib/snapshot.py`
- Create: `scripts/pmo/tests/test_snapshot.py`

- [ ] **Step 1: 失敗するテストを書く**

`scripts/pmo/tests/test_snapshot.py`:

```python
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
```

- [ ] **Step 2: 実行して失敗を確認**

Run: `cd scripts/pmo && uv run pytest tests/test_snapshot.py -v`
Expected: ImportError で FAIL。

- [ ] **Step 3: 実装**

`scripts/pmo/lib/snapshot.py`:

```python
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class Snapshot:
    rows: dict[str, dict[str, Any]] = field(default_factory=dict)

    def is_empty(self) -> bool:
        return not self.rows


def save_snapshot(snap: Snapshot, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump({"rows": snap.rows}, f, ensure_ascii=False, indent=2)


def load_snapshot(path: Path) -> Snapshot:
    if not path.exists():
        return Snapshot()
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return Snapshot(rows=data.get("rows", {}))
```

- [ ] **Step 4: テストが通ることを確認**

Run: `cd scripts/pmo && uv run pytest tests/test_snapshot.py -v`
Expected: 3 件すべて PASS。

- [ ] **Step 5: Commit**

```bash
git add scripts/pmo/lib/snapshot.py scripts/pmo/tests/test_snapshot.py
git commit -m "feat: snapshot で last-sync.json の保存と復元を実装"
```

---

## Task 9: reconcile — 行マッチング

**Files:**

- Create: `scripts/pmo/lib/reconcile.py`
- Create: `scripts/pmo/tests/test_reconcile.py`

- [ ] **Step 1: 失敗するテストを書く**

`scripts/pmo/tests/test_reconcile.py`:

```python
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
```

- [ ] **Step 2: 実行して失敗を確認**

Run: `cd scripts/pmo && uv run pytest tests/test_reconcile.py -v`
Expected: ImportError で FAIL。

- [ ] **Step 3: 実装**

`scripts/pmo/lib/reconcile.py`:

```python
from dataclasses import dataclass, field
from typing import Any


@dataclass
class RowMatch:
    task_id: str
    yaml_task: dict[str, Any]
    excel_row: int
    excel_data: dict[str, Any]


@dataclass
class MatchResult:
    matched: dict[str, RowMatch] = field(default_factory=dict)
    yaml_only: list[dict[str, Any]] = field(default_factory=list)
    excel_only: list[dict[str, Any]] = field(default_factory=list)


def match_rows(
    yaml_tasks: list[dict[str, Any]],
    excel_rows: list[dict[str, Any]],
    *,
    id_column: str,
) -> MatchResult:
    excel_by_id = {r[id_column]: r for r in excel_rows if r.get(id_column)}
    yaml_ids = {t["id"] for t in yaml_tasks}
    result = MatchResult()
    for t in yaml_tasks:
        tid = t["id"]
        if tid in excel_by_id:
            er = excel_by_id[tid]
            result.matched[tid] = RowMatch(
                task_id=tid,
                yaml_task=t,
                excel_row=er["row"],
                excel_data=er,
            )
        else:
            result.yaml_only.append(t)
    for er in excel_rows:
        if er.get(id_column) and er[id_column] not in yaml_ids:
            result.excel_only.append(er)
    return result
```

- [ ] **Step 4: テストが通ることを確認**

Run: `cd scripts/pmo && uv run pytest tests/test_reconcile.py -v`
Expected: 4 件すべて PASS。

- [ ] **Step 5: Commit**

```bash
git add scripts/pmo/lib/reconcile.py scripts/pmo/tests/test_reconcile.py
git commit -m "feat: reconcile に id ベースの行マッチングを実装"
```

---

## Task 10: reconcile — 列所有権ベースのマージ

**Files:**

- Modify: `scripts/pmo/lib/reconcile.py`
- Modify: `scripts/pmo/tests/test_reconcile.py`

- [ ] **Step 1: 失敗するテストを追加**

`scripts/pmo/tests/test_reconcile.py` の末尾に追加:

```python
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
```

- [ ] **Step 2: 実行して失敗を確認**

Run: `cd scripts/pmo && uv run pytest tests/test_reconcile.py -v`
Expected: ImportError で FAIL。

- [ ] **Step 3: 実装**

`scripts/pmo/lib/reconcile.py` の末尾に追加:

```python
@dataclass
class MergeResult:
    excel_updates: list[tuple[int, str, Any]] = field(default_factory=list)
    yaml_updates: list[tuple[str, str, Any]] = field(default_factory=list)


def merge_matched(
    matched: dict[str, RowMatch],
    ownership: "Ownership",
) -> MergeResult:
    from lib.ownership import Ownership  # avoid circular at module import
    result = MergeResult()
    for tid, m in matched.items():
        for fname in ownership.yaml_fields:
            if fname == "id":
                continue
            col = ownership.column_of[fname]
            yaml_val = m.yaml_task.get(fname)
            excel_val = m.excel_data.get(col)
            if yaml_val != excel_val:
                result.excel_updates.append((m.excel_row, col, yaml_val))
        for fname in ownership.excel_fields:
            col = ownership.column_of[fname]
            yaml_val = m.yaml_task.get(fname)
            excel_val = m.excel_data.get(col)
            if yaml_val != excel_val:
                result.yaml_updates.append((tid, fname, excel_val))
    return result
```

- [ ] **Step 4: テストが通ることを確認**

Run: `cd scripts/pmo && uv run pytest tests/test_reconcile.py -v`
Expected: 7 件すべて PASS。

- [ ] **Step 5: Commit**

```bash
git add scripts/pmo/lib/reconcile.py scripts/pmo/tests/test_reconcile.py
git commit -m "feat: reconcile に列所有権ベースのマージを実装"
```

---

## Task 11: reconcile — 新規行と削除のハンドリング

**Files:**

- Modify: `scripts/pmo/lib/reconcile.py`
- Modify: `scripts/pmo/tests/test_reconcile.py`

- [ ] **Step 1: 失敗するテストを追加**

`scripts/pmo/tests/test_reconcile.py` の末尾に追加:

```python
from lib.reconcile import build_excel_appends, build_yaml_appends


def test_build_excel_appends_from_yaml_only():
    yaml_only = [
        {"id": "T-003", "phase_l1": "新規", "name": "追加タスク"},
    ]
    ownership = make_ownership(
        yaml_fields={"id", "phase_l1", "name"},
        excel_fields=set(),
        column_of={"id": "A", "phase_l1": "B", "name": "D"},
    )
    appends = build_excel_appends(yaml_only, ownership)
    assert appends == [{"A": "T-003", "B": "新規", "D": "追加タスク"}]


def test_build_yaml_appends_from_excel_only():
    excel_only = [
        {"row": 9, "A": "T-999", "I": "進行中"},
    ]
    ownership = make_ownership(
        yaml_fields={"id"},
        excel_fields={"status"},
        column_of={"id": "A", "status": "I"},
    )
    appends = build_yaml_appends(excel_only, ownership)
    assert appends == [{"id": "T-999", "status": "進行中"}]
```

- [ ] **Step 2: 実行して失敗を確認**

Run: `cd scripts/pmo && uv run pytest tests/test_reconcile.py -v`
Expected: ImportError で FAIL。

- [ ] **Step 3: 実装**

`scripts/pmo/lib/reconcile.py` の末尾に追加:

```python
def build_excel_appends(
    yaml_only: list[dict[str, Any]],
    ownership,
) -> list[dict[str, Any]]:
    appends = []
    for t in yaml_only:
        row_values: dict[str, Any] = {}
        for fname in ownership.yaml_fields:
            col = ownership.column_of[fname]
            if fname in t:
                row_values[col] = t[fname]
        appends.append(row_values)
    return appends


def build_yaml_appends(
    excel_only: list[dict[str, Any]],
    ownership,
) -> list[dict[str, Any]]:
    appends = []
    for er in excel_only:
        task: dict[str, Any] = {}
        id_col = ownership.column_of["id"]
        task["id"] = er[id_col]
        for fname in ownership.excel_fields:
            col = ownership.column_of[fname]
            task[fname] = er.get(col)
        appends.append(task)
    return appends
```

- [ ] **Step 4: テストが通ることを確認**

Run: `cd scripts/pmo && uv run pytest tests/test_reconcile.py -v`
Expected: 9 件すべて PASS。

- [ ] **Step 5: Commit**

```bash
git add scripts/pmo/lib/reconcile.py scripts/pmo/tests/test_reconcile.py
git commit -m "feat: reconcile に新規行と削除のハンドリングを追加"
```

---

## Task 12: sync.py — CLI スケルトンと doctor サブコマンド

**Files:**

- Create: `scripts/pmo/sync.py`

- [ ] **Step 1: 実装（手動検証メイン、TDD はスキップ）**

`scripts/pmo/sync.py`:

```python
#!/usr/bin/env python3
"""PMO Excel ⇄ YAML sync CLI."""
from __future__ import annotations
import argparse
import sys
from pathlib import Path

from lib.yaml_io import load_pmo_yaml, save_pmo_yaml, update_task_field
from lib.excel_io import read_rows, write_cells, append_row
from lib.ownership import resolve_ownership
from lib.reconcile import match_rows, merge_matched, build_excel_appends, build_yaml_appends
from lib.snapshot import load_snapshot, save_snapshot, Snapshot


def project_dir(slug: str) -> Path:
    base = Path.home() / "prj" / slug
    if not base.exists():
        print(f"error: project not found: {base}", file=sys.stderr)
        sys.exit(2)
    return base


def cmd_doctor(args: argparse.Namespace) -> int:
    pdir = project_dir(args.project)
    pmo_path = pdir / "pmo.yaml"
    pmo = load_pmo_yaml(pmo_path)
    issues: list[str] = []
    ids: list[str] = []
    for t in pmo.tasks:
        if "id" not in t or not t["id"]:
            issues.append(f"task missing id: {t}")
        else:
            ids.append(t["id"])
    seen: set[str] = set()
    for tid in ids:
        if tid in seen:
            issues.append(f"duplicate id: {tid}")
        seen.add(tid)
    try:
        resolve_ownership(pmo.excel.columns)
    except ValueError as e:
        issues.append(str(e))
    if issues:
        for line in issues:
            print(f"⚠️  {line}")
        return 1
    print(f"✅ {len(ids)} tasks, no issues found")
    return 0


def make_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="sync.py", description="PMO Excel ⇄ YAML sync")
    sub = p.add_subparsers(dest="command", required=True)
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--project", required=True, help="project slug (~/prj/<slug>/)")

    sp = sub.add_parser("doctor", parents=[common], help="validate pmo.yaml")
    sp.set_defaults(func=cmd_doctor)

    sp = sub.add_parser("sync", parents=[common], help="bidirectional sync")
    sp.add_argument("sheet", choices=["wbs"], help="sheet to sync")
    sp.set_defaults(func=lambda a: cmd_sync(a, mode="sync"))

    sp = sub.add_parser("pull", parents=[common], help="Excel → YAML only")
    sp.add_argument("sheet", choices=["wbs"])
    sp.set_defaults(func=lambda a: cmd_sync(a, mode="pull"))

    sp = sub.add_parser("push", parents=[common], help="YAML → Excel only")
    sp.add_argument("sheet", choices=["wbs"])
    sp.set_defaults(func=lambda a: cmd_sync(a, mode="push"))
    return p


def main(argv: list[str] | None = None) -> int:
    parser = make_parser()
    args = parser.parse_args(argv)
    return args.func(args)


def cmd_sync(args: argparse.Namespace, *, mode: str) -> int:
    # stub - implemented in Task 13
    print(f"[stub] mode={mode} project={args.project} sheet={args.sheet}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 2: doctor を手動検証**

Run（事前に Task 2 のフィクスチャを使う）:

```bash
mkdir -p ~/prj/_test
cp scripts/pmo/tests/fixtures/sample_pmo.yaml ~/prj/_test/pmo.yaml
cd scripts/pmo && uv run python sync.py doctor --project _test
```

Expected: `✅ 1 tasks, no issues found`

- [ ] **Step 3: 重複 id で警告されることを確認**

`~/prj/_test/pmo.yaml` の tasks に `id: T-001` をもう 1 件追加して再実行。
Expected: `⚠️  duplicate id: T-001` と exit code 1。確認後ファイルを元に戻す。

- [ ] **Step 4: Commit**

```bash
git add scripts/pmo/sync.py
git commit -m "feat: sync.py の CLI スケルトンと doctor を実装"
```

---

## Task 13: sync.py — sync/pull/push コマンドの実装

**Files:**

- Modify: `scripts/pmo/sync.py`

- [ ] **Step 1: cmd_sync の本実装**

`scripts/pmo/sync.py` の `cmd_sync` を以下で置き換える:

```python
def cmd_sync(args: argparse.Namespace, *, mode: str) -> int:
    pdir = project_dir(args.project)
    pmo_path = pdir / "pmo.yaml"
    pmo = load_pmo_yaml(pmo_path)
    excel_path = pdir / pmo.excel.file
    if not excel_path.exists():
        print(f"error: excel file not found: {excel_path}", file=sys.stderr)
        return 2

    ownership = resolve_ownership(pmo.excel.columns)
    column_letters = [c.col for c in pmo.excel.columns]

    try:
        excel_rows_raw = read_rows(
            excel_path,
            sheet=pmo.excel.sheet,
            data_start_row=pmo.excel.data_start_row,
            columns=column_letters,
            id_column=pmo.excel.id_column,
        )
    except PermissionError:
        print(
            f"error: cannot read {excel_path}. Close Excel and retry.",
            file=sys.stderr,
        )
        return 3

    excel_rows = []
    for idx, raw in enumerate(excel_rows_raw):
        row_num = pmo.excel.data_start_row + idx
        raw["row"] = row_num
        excel_rows.append(raw)

    match = match_rows(pmo.tasks, excel_rows, id_column=pmo.excel.id_column)
    merge = merge_matched(match.matched, ownership)

    excel_updates = list(merge.excel_updates)
    yaml_updates = list(merge.yaml_updates)
    excel_appends = build_excel_appends(match.yaml_only, ownership) if mode != "pull" else []
    yaml_appends = build_yaml_appends(match.excel_only, ownership) if mode != "push" else []

    if mode == "pull":
        excel_updates = []
    if mode == "push":
        yaml_updates = []

    # apply Excel changes
    if excel_updates:
        try:
            write_cells(excel_path, sheet=pmo.excel.sheet, updates=excel_updates)
        except PermissionError:
            print(f"error: cannot write {excel_path}. Close Excel and retry.", file=sys.stderr)
            return 3
    for row_values in excel_appends:
        append_row(
            excel_path,
            sheet=pmo.excel.sheet,
            data_start_row=pmo.excel.data_start_row,
            id_column=pmo.excel.id_column,
            values=row_values,
        )

    # apply YAML changes
    for tid, field, value in yaml_updates:
        update_task_field(pmo, task_id=tid, field=field, value=value)
    for new_task in yaml_appends:
        pmo.tasks.append(new_task)
    if yaml_updates or yaml_appends:
        save_pmo_yaml(pmo, pmo_path)

    # snapshot
    snap = Snapshot(rows={t["id"]: dict(t) for t in pmo.tasks if "id" in t})
    save_snapshot(snap, pdir / ".pmo" / "last-sync.json")

    # summary
    print(f"mode={mode}")
    print(f"  Excel updates: {len(excel_updates)} cells, {len(excel_appends)} new rows")
    print(f"  YAML updates: {len(yaml_updates)} fields, {len(yaml_appends)} new tasks")
    if match.excel_only and mode == "push":
        print(f"  ⚠️  {len(match.excel_only)} rows in Excel not in YAML (push mode, kept)")
    if match.yaml_only and mode == "pull":
        print(f"  ⚠️  {len(match.yaml_only)} tasks in YAML not in Excel (pull mode, kept)")
    return 0
```

- [ ] **Step 2: 手動 round-trip テストの準備**

```bash
# テスト用 Excel を作成 (Task 5 のヘルパーを再利用)
cd scripts/pmo
uv run python -c "
import openpyxl
from pathlib import Path
import sys; sys.path.insert(0, 'tests')
from test_excel_io import make_workbook
make_workbook(Path.home() / 'prj' / '_test' / 'WBS.xlsx')
print('created')
"
```

`~/prj/_test/pmo.yaml` の `excel.file` を `WBS.xlsx` に変更しておく。

- [ ] **Step 3: push を実行**

Run:

```bash
cd scripts/pmo && uv run python sync.py push wbs --project _test
```

Expected:

- `mode=push`
- 「YAML updates: 0 fields, 0 new tasks」
- Excel updates にいくらかセル更新が出る（id, phase_l1 など）

- [ ] **Step 4: pull を実行**

Run:

```bash
cd scripts/pmo && uv run python sync.py pull wbs --project _test
```

Expected:

- `mode=pull`
- Excel 側に存在し YAML に無い T-002 が `yaml_appends` として 1 件追加される
- `~/prj/_test/pmo.yaml` を開くと T-002 タスクが追記されている

- [ ] **Step 5: sync を実行（冪等性確認）**

Run:

```bash
cd scripts/pmo && uv run python sync.py sync wbs --project _test
cd scripts/pmo && uv run python sync.py sync wbs --project _test
```

Expected: 2 回目は Excel/YAML 両方とも 0 更新（収束済み）。

- [ ] **Step 6: Commit**

```bash
git add scripts/pmo/sync.py
git commit -m "feat: sync.py の sync/pull/push を実装"
```

---

## Task 14: README とエラーケースの手動検証

**Files:**

- Create: `scripts/pmo/README.md`

- [ ] **Step 1: README を書く**

`scripts/pmo/README.md`:

````markdown
# PMO Excel ⇄ YAML Sync

PMO の `pmo.yaml` と Excel WBS (`*.xlsm`) を列所有権モデルで双方向同期する CLI。

## 使い方

```bash
cd scripts/pmo
uv sync                                          # 初回のみ
uv run python sync.py doctor --project <slug>    # 検証
uv run python sync.py sync wbs --project <slug>  # 双方向同期
uv run python sync.py push wbs --project <slug>  # YAML → Excel のみ
uv run python sync.py pull wbs --project <slug>  # Excel → YAML のみ
```
````

## 動作前提

- `~/prj/<slug>/pmo.yaml` に `excel:` セクションがある
- `excel.file` で指定した Excel が同ディレクトリに存在する
- Excel ファイルが他プロセスで開かれていない（PermissionError 対応）

## 列所有権

`pmo.yaml` の `excel.columns[].owner` で列ごとに `yaml` または `excel` を指定。

- `owner: yaml` の列 → YAML が真実。Excel を上書き
- `owner: excel` の列 → Excel が真実。YAML を更新

ガントチャート部（日付列）はスクリプトの対象外。VBA に任せる。

## 手動テスト手順

詳細は `docs/superpowers/specs/2026-05-14-pmo-excel-bridge-design.md` を参照。

````
- [ ] **Step 2: Excel ロック時のエラーを手動検証**

`~/prj/_test/WBS.xlsx` を Excel.app で開いた状態で:
```bash
cd scripts/pmo && uv run python sync.py push wbs --project _test
````

Expected: `error: cannot write ... Close Excel and retry.` exit code 3。

- [ ] **Step 3: 不正な owner の検出を手動検証**

`~/prj/_test/pmo.yaml` の `excel.columns` のどれか 1 件の `owner` を `both` に変更:

```bash
cd scripts/pmo && uv run python sync.py doctor --project _test
```

Expected: `⚠️  invalid owner: both for field ...` exit code 1。確認後 `yaml` か `excel` に戻す。

- [ ] **Step 4: Commit**

```bash
git add scripts/pmo/README.md
git commit -m "docs: scripts/pmo の README を追加"
```

---

## Task 15: Claude スキル user-pmo-excel

**Files:**

- Create: `home/.claude/skills/user-pmo-excel/SKILL.md`

- [ ] **Step 1: SKILL.md を書く**

`home/.claude/skills/user-pmo-excel/SKILL.md`:

````markdown
---
name: user-pmo-excel
description: >
  Sync ~/prj/{slug}/pmo.yaml with the project's WBS Excel (.xlsm) using a
  column-ownership model. YAML owns the plan (task structure, estimates),
  Excel owns the actuals (start/end dates, status, client comments). The Gantt
  chart area is left to VBA macros. Triggered by "Excel sync", "WBS 同期",
  "pmo excel", or whenever a user asks to push plan changes to Excel or pull
  actuals from Excel.
effort: low
---

# PMO Excel ⇄ YAML Sync

Run the Python sync CLI located at `~/dotfiles/scripts/pmo/sync.py`.

## Iron Law

1. Never edit Excel files directly — always go through `sync.py`
2. Never modify columns owned by Excel from the YAML side (and vice versa)
3. Close Excel before running sync (PermissionError otherwise)
4. The Gantt chart area (J column onward in WBS) is off-limits — VBA owns it

## Trigger

Use when the user wants to:

- Push WBS plan changes (task additions, estimate updates) to Excel
- Pull Excel actuals (start/end dates, status) into pmo.yaml
- Validate pmo.yaml schema and id uniqueness

## Arguments

- `project-slug`: project directory name under `~/prj/`. Ask if not provided.
- `mode`: one of `sync` (default), `pull`, `push`, `doctor`. Ask only if ambiguous.

## Process

1. If `project-slug` is missing, ask with AskUserQuestion
2. Verify `~/prj/{slug}/pmo.yaml` exists and has an `excel:` section. If not, tell the user to set it up first (point to the spec doc)
3. Run the appropriate sub-command:
   ```bash
   cd ~/dotfiles/scripts/pmo
   uv run python sync.py <mode> wbs --project <slug>
   ```
````

For `doctor`, omit the `wbs` argument.
4. Relay the output. If exit code is non-zero, explain the cause (Excel still open, schema error, etc.)
5. If `sync` produced new rows on either side, summarize what changed

## Notes

- The sync CLI is designed for the WBS sheet only. Issues / master sync is a future extension.
- For the first sync on a new project, run `sync.py doctor` first to validate the YAML structure.

## Status: DONE

````
- [ ] **Step 2: スキルが認識されることを手動確認**

新規シェルで Claude Code を起動し、「Excel sync で _test プロジェクトを同期して」と打って、`user-pmo-excel` が起動するかを確認。直接ファイル配置で見える場合があるので、`ls ~/.claude/skills/user-pmo-excel/` でリンクされていることを確認。

- [ ] **Step 3: Commit**

```bash
git add home/.claude/skills/user-pmo-excel/SKILL.md
git commit -m "feat: user-pmo-excel スキルを追加して sync CLI をラップ"
````

---

## Task 16: 完全な round-trip 統合テスト

**Files:** なし（手動検証のみ）

- [ ] **Step 1: 実物 xlsm のサニタイズコピーを準備**

ユーザーの実物ファイル `/Users/kei/Downloads/【PJ管理・WBS】オークスモビリティ様_AUX_Compass_マーケツール制作.xlsm` を `~/prj/_test/WBS.xlsm` にコピー（または、別のテストプロジェクトを用意）。

```bash
mkdir -p ~/prj/_oaks-test
cp "/Users/kei/Downloads/【PJ管理・WBS】オークスモビリティ様_AUX_Compass_マーケツール制作.xlsm" ~/prj/_oaks-test/WBS.xlsm
```

- [ ] **Step 2: 実物に合わせた pmo.yaml を作成**

実物の WBS シートの列構造に合わせて `~/prj/_oaks-test/pmo.yaml` を書く（`excel.header_row` と `excel.data_start_row` は実物に合わせて調整。実物では header_row=6, data_start_row=7 の想定）。

最初は tasks セクションを空 `tasks: []` にして、`pull` で取り込めるかを試す。

- [ ] **Step 3: doctor を実行**

```bash
cd ~/dotfiles/scripts/pmo && uv run python sync.py doctor --project _oaks-test
```

Expected: スキーマエラーなし。0 tasks 表示。

- [ ] **Step 4: pull で Excel から YAML に取り込む**

```bash
uv run python sync.py pull wbs --project _oaks-test
```

Expected: 「YAML updates: 0 fields, N new tasks」(N = Excel の小項目数)。`~/prj/_oaks-test/pmo.yaml` に tasks が追記されている。

- [ ] **Step 5: Excel をマクロ込みで開く**

Excel.app で `~/prj/_oaks-test/WBS.xlsm` を開く。

確認項目:

- VBA マクロが有効化される（警告が出たら「有効化」を選択）
- ガントチャートが正しく描画されている
- 条件付き書式（祝日色付け）が動いている
- 入力規則（ドロップダウン）が動いている

ファイルを閉じる。

- [ ] **Step 6: Excel で 1 行更新して保存**

Excel で実績ステータスを「進行中」に変更して保存・閉じる。

- [ ] **Step 7: pull で取り込む**

```bash
uv run python sync.py pull wbs --project _oaks-test
```

Expected: 「YAML updates: 1 fields, 0 new tasks」。yaml の該当タスクの status が「進行中」に。

- [ ] **Step 8: ロードマップを spec から拾ってチェック**

`docs/superpowers/specs/2026-05-14-pmo-excel-bridge-design.md` の「拡張ロードマップ」を再確認。PoC が動いたことで次のステップ（issues.yaml 同期、master 同期）に進める状態か判定。

- [ ] **Step 9: 結果を `~/.claude/sessions/` または会話で要約報告**

何が動いて何が動かなかったか、VBA マクロ保持の状態、書式の劣化の有無、を 5-10 行でまとめる。

---

## Self-Review

このプランを書いた後の振り返り（チェック済み）:

**1. Spec coverage:**

- 列所有権モデル → Task 4 + Task 10 でカバー
- ガント部は VBA 任せ → Task 5/6/7 で日付列以外のみ書き込む方針を反映
- id 列ベース行マッチング → Task 9 でカバー
- last-sync.json による衝突検出 → Task 8 でカバー（実際の活用はサマリー表示のみ。PoC スコープに合う）
- 4 つのエラーケース（Excel 開いている / id 重複 / id 欠損 / yaml 違反） → Task 12 (doctor) + Task 13 (sync) + Task 14 (手動検証) でカバー
- 拡張は明示的に PoC 外（課題管理・マスタ・工数集計）

**2. Placeholder scan:**

- 「Task N と同じ」のような参照なし。すべて完全なコードを再掲
- 「TODO」「TBD」なし
- 「適切なエラー処理を追加」のような曖昧表現なし

**3. Type consistency:**

- `Ownership`, `RowMatch`, `MatchResult`, `MergeResult` の型名は全 Task で統一
- `match_rows`, `merge_matched`, `build_excel_appends`, `build_yaml_appends` の関数名・引数も統一
- `PmoYaml.excel.columns` の型は `list[ColumnSpec]` で一貫
- `excel_data` の dict キーは「列レター」(`A`, `B`, ...) で統一、`yaml_task` の dict キーは「フィールド名」(`id`, `phase_l1`, ...) で統一

修正済み事項なし。プランはこのまま実行可能。
