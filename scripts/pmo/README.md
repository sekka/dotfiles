# PMO Excel → YAML Pull

PMO の Excel WBS (`*.xlsx`) を AI が読み書きしやすい `WBS.yaml` に変換する一方向 CLI。Excel が常に真実、YAML は派生物。

## 使い方

```bash
cd scripts/pmo
uv sync                                                       # 初回のみ
uv run python sync.py init --project <slug>                   # WBS.yaml スケルトンを作成
uv run python sync.py init --project <slug> --file WBS.xlsx  # Excel ファイル名を指定
uv run python sync.py doctor --project <slug>                 # 検証 (id 重複・欠落チェック)
uv run python sync.py pull --project <slug>                   # Excel → WBS.yaml を再生成
```

## ブートストラップ

新規プロジェクト用に `WBS.yaml` スケルトンを生成する:

```bash
uv run python sync.py init --project <slug>
```

作成される `~/prj/<slug>/WBS.yaml`:

```yaml
project:
  name: "<slug>"
  slug: "<slug>"

excel:
  file: "WBS.xlsx"

tasks: []
```

WBS の Excel カラム構成は `lib/schema.py` の `WBS_SCHEMA` として baked in されている。`WBS.yaml` の `excel:` には `file` のみ書けばよい。

## 動作前提

- `~/prj/<slug>/WBS.yaml` に `excel.file` が設定されている (`init` で生成)
- 指定 Excel が同ディレクトリに存在する
- Excel ファイルが他プロセスで開かれていない (PermissionError 対応)
- WBS の Excel レイアウトは canonical schema (`lib/schema.py`) に準拠していること

## Canonical Schema

WBS シートのカラム構成は `lib/schema.py` の `WBS_SCHEMA` が正規情報源:

| 列 | フィールド |
| -- | ---------- |
| A  | id         |
| B  | phase_l1   |
| C  | phase_l2   |
| D  | name       |
| E  | assignee   |
| F  | est_days   |
| G  | start_date |
| H  | end_date   |
| I  | notes      |
| J  | status     |

ヘッダ行 4・データ開始行 6。WBS レイアウトを変更する場合は `lib/schema.py` を更新する。

## 同期モデル

**一方向 (Excel → YAML)**。

- Excel が真実。YAML は pull のたびに丸ごと再生成される。
- `tasks` セクションは pull で置換される。`project` / `excel` ヘッダブロックは保持される。
- YAML 側だけの編集は無視される (次回 pull で上書きされる)。
- 旧 push / snapshot / backup / deleted-ids 等の双方向同期機構は撤廃。

ガントチャート部 (日付列) は pull 対象外。

## 原子的書き込み

`lib/atomic_io.py` が `tmp + os.replace` で書き込みを行うため、ダンプ中の例外で WBS.yaml が 0 byte に切り詰められることはない。

## 終了コード

| code | 意味                                      |
| ---- | ----------------------------------------- |
| 0    | 成功                                      |
| 1    | doctor で問題検出 / init で WBS.yaml 既存 |
| 2    | WBS.yaml / Excel が見つからない           |
| 3    | Excel が他プロセスで開かれている          |
