# PMO Excel ⇄ YAML Sync

PMO の `WBS.yaml` と Excel WBS (`*.xlsm`) を snapshot ベースの一方向同期で連携する CLI。

## 使い方

```bash
cd scripts/pmo
uv sync                                                              # 初回のみ
uv run python sync.py init --project <slug>                          # WBS.yaml スケルトンを作成
uv run python sync.py init --project <slug> --file WBS.xlsm         # Excel ファイル名を指定
uv run python sync.py doctor --project <slug>                        # 検証
uv run python sync.py pull wbs --project <slug>                      # Excel → YAML
uv run python sync.py push wbs --project <slug>                      # YAML → Excel
uv run python sync.py pull wbs --project <slug> --force              # snapshot ガード bypass
uv run python sync.py push wbs --project <slug> --force              # snapshot ガード bypass
uv run python sync.py migrate-ids wbs --project <slug>               # 空 id 列を自動採番
uv run python sync.py migrate-ids wbs --project <slug> --dry-run     # 採番プレビュー（書き戻しなし）
```

## ブートストラップ

新規プロジェクトを開始する場合は `init` で WBS.yaml スケルトンを作成する。

```bash
uv run python sync.py init --project <slug>
```

作成される `~/prj/<slug>/WBS.yaml`:

```yaml
project:
  name: "<slug>"
  slug: "<slug>"

excel:
  file: "WBS.xlsm"

tasks: []
```

WBS の Excel カラム構成は `lib/schema.py` の `WBS_SCHEMA` として baked in されている。`WBS.yaml` の `excel:` セクションには `file` のみ記載すればよい。`sheet / header_row / columns` などのレイアウト情報は一切不要。

## 動作前提

- `~/prj/<slug>/WBS.yaml` に `excel.file` が設定されている（`init` コマンドで生成）
- `excel.file` で指定した Excel が同ディレクトリに存在する
- Excel ファイルが他プロセスで開かれていない（PermissionError 対応）
- WBS の Excel レイアウトは canonical schema (`lib/schema.py`) に準拠していること

## Canonical Schema

WBS シートのカラム構成は `lib/schema.py` の `WBS_SCHEMA` が正規情報源:

| 列 | フィールド | 備考                    |
| -- | ---------- | ----------------------- |
| A  | id         |                         |
| B  | phase_l1   |                         |
| C  | phase_l2   |                         |
| D  | name       |                         |
| E  | assignee   |                         |
| F  | est_days   |                         |
| G  | start_date |                         |
| H  | end_date   | readonly (WORKDAY 数式) |
| I  | status     |                         |

ヘッダ行: 6、データ開始行: 7。WBS レイアウトを変更する場合は `lib/schema.py` を更新する。

## 同期モデル

方向は常に明示的:

- **pull** (Excel → YAML): Excel を真実として YAML を更新
- **push** (YAML → Excel): YAML を真実として Excel を更新

双方向 sync は廃止。誤上書き防止のため snapshot ガードを使う。

### snapshot ガード

`.pmo/last-sync.json` に前回同期時の YAML / Excel 両側の状態を保存する。次回実行時、書き換え対象側 (destination) に未取込変更があれば exit code 2 で abort する:

- pull 実行時: YAML に snapshot 以降の変更があれば abort
- push 実行時: Excel に snapshot 以降の変更があれば abort

abort 時は「件数」「具体的な差分」「3 つの選択肢 (push first / --force / manual resolve)」を表示する。`--force` で guard を bypass 可能。

### readonly 列

`lib/schema.py` で `readonly=True` と指定された列 (H: end_date) は同期対象から除外される。WORKDAY などの数式列を保護する用途。

### Excel バックアップ

push 実行時のみ `.pmo/backups/` にタイムスタンプ付きバックアップを作成 (直近 10 件まで保持)。

ガントチャート部（日付列）はスクリプトの対象外。VBA に任せる。

## 手動テスト手順

詳細は `docs/superpowers/specs/2026-05-14-pmo-excel-bridge-design.md` を参照。
