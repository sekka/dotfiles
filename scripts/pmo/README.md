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
