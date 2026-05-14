# PMO Excel ⇄ YAML 双方向同期設計

- 日付: 2026-05-14
- 対象: PMO 用 WBS / 課題 / 進捗ドキュメントの Excel ⇄ YAML 双方向化
- ステータス: 設計確定（PoC 実装前）

## 背景

現状、PMO ドキュメント（ガントチャート/WBS、進捗レポート、課題管理、工数管理）を Excel (xlsm) で管理している。Excel の利点（視覚的わかりやすさ、誰でも開ける）は維持したいが、以下の課題がある：

- バージョン管理がしにくい（バイナリ差分）
- AI（Claude 等）による分析・編集の連携が重い

実物 `【PJ管理・WBS】オークスモビリティ様_AUX_Compass_マーケツール制作.xlsm` の調査から、以下が判明している：

- WBS は 3 階層（大項目 / 中項目 / 小項目）
- ガントチャート部（80+ 日付列）の進捗バー描画は VBA マクロが担当
- シート 4 枚: WBS / 工数集計 / 課題管理 / マスタ（祝日・担当者・ステータス定義）
- 入力規則・条件付き書式がマスタシートを参照

## ゴール

- Excel フォーマット（書式・グラフ・マクロ）を完全維持する
- 計画情報（タスク構造・見積等）は YAML を真実とし、git でバージョン管理できる
- 実績情報・クライアント記入欄は Excel を真実とし、YAML へ取り込める
- AI（Claude）は YAML/CSV を介して安全にプロジェクト状態を読み書きできる
- 同期はオンデマンド（手動コマンド実行）から開始し、将来定常運用に組み込み可能

## 非ゴール（PoC 段階）

- 課題管理シートの同期（拡張で対応）
- マスタシートの同期と入力規則の自動更新（拡張で対応）
- 工数集計シート（永続的に対象外、VBA に任せる）
- スクリプト側でのガントチャート描画（VBA に任せる）
- 自動同期（git hook / fswatch / 保存連動）
- CSV エクスポート（YAML から後で派生可能）

## 設計原則

### 1. シート単位で戦略を変える

実物の構造を踏まえ、シートごとに同期戦略を定義する：

| シート   | 戦略                  | 同期方向                | 触る範囲                                                           |
| -------- | --------------------- | ----------------------- | ------------------------------------------------------------------ |
| WBS      | 列所有権モデル        | 双方向                  | A〜I 列のメタデータのみ。J 列以降のガント部は VBA に任せて触らない |
| 工数集計 | 完全に Excel/VBA 任せ | 同期対象外              | スクリプトは触らない                                               |
| 課題管理 | 全列双方向同期        | 双方向（拡張）          | `issues.yaml` と 1:1 対応                                          |
| マスタ   | YAML から一方向生成   | YAML→Excel のみ（拡張） | 担当者・ステータス・祝日リスト                                     |

### 2. 列所有権モデル

同期競合を原理的に発生させないため、各列を YAML または Excel のいずれかに排他的に所有させる。

WBS シート（PoC 対象）の所有権マップ：

| 列     | フィールド | 所有     | 役割                       |
| ------ | ---------- | -------- | -------------------------- |
| A      | id         | YAML     | 行特定キー（隠し列でも可） |
| B      | phase_l1   | YAML     | 大項目                     |
| C      | phase_l2   | YAML     | 中項目                     |
| D      | name       | YAML     | 小項目（タスク名）         |
| E      | assignee   | YAML     | 主担当                     |
| F      | est_hours  | YAML     | 見積工数                   |
| G      | start_date | Excel    | 実績開始日                 |
| H      | end_date   | Excel    | 実績完了日                 |
| I      | status     | Excel    | ステータス                 |
| J 以降 | （ガント） | 触らない | VBA が描画                 |

`note`（備考列）は所有方針に揺れがあるため、PoC では Excel 所有とする。

### 3. ガントチャート部は VBA に任せる

スクリプトは start_date / end_date の値だけ書き換える。Excel を開いた瞬間（または手動ボタンで）VBA がガント描画を再実行する前提。

これにより：

- 条件付き書式、セル塗り、祝日マスタ参照などのロジックを Python 側で再実装する必要がない
- マクロ資産が劣化しない（`keep_vba=True` で xlsm を round-trip）
- 実装難度が一桁下がる

### 4. id 列ベースの行マッチング

WBS の各行を一意に識別する `id` を YAML と Excel の両方に持たせる。これが双方向マージのキー。

- 既存 xlsm に id 列が無い場合、初回 import 時に振る（移行スクリプトを別途）
- id は `T-001` 形式（既存 pmo.yaml 慣習に従う）

## アーキテクチャ

```
~/dotfiles/scripts/pmo/                Python パッケージ
├── pyproject.toml                     uv 管理 (openpyxl, pyyaml)
├── sync.py                            CLI エントリポイント
├── lib/
│   ├── yaml_io.py                     pmo.yaml 読み書きとスキーマ検証
│   ├── excel_io.py                    xlsm 読み書き (keep_vba=True)
│   ├── ownership.py                   列所有権ルールの解決
│   ├── reconcile.py                   双方向マージロジック
│   └── snapshot.py                    last-sync.json 管理
└── tests/
    ├── test_ownership.py
    ├── test_reconcile.py
    └── test_yaml_io.py

~/.claude/skills/user-pmo-excel/       新規スキル
└── SKILL.md                           uv run sync.py をラップ

~/prj/{slug}/
├── pmo.yaml                           既存 + excel: セクション拡張
├── WBS.xlsm                           ユーザーのテンプレ
└── .pmo/last-sync.json                競合検出スナップショット
```

## YAML スキーマ拡張

既存 `pmo.yaml` を 3 階層対応＋ Excel 同期設定で拡張する：

```yaml
project:
  name: "オークスモビリティ AUX Compass"
  slug: "oaks-aux-compass"
  start: "2026-04-15"
  end: "2026-06-30"

excel:
  file: "WBS.xlsm"
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
    name: "ヒアリング対象者選定・日程調整"
    assignee: "SI&C大嶋"
    est_hours: 1
    start_date: null
    end_date: null
    status: null
```

## CLI 仕様

```
uv run sync.py sync wbs --project oaks-aux-compass
  → pmo.yaml と WBS.xlsm を双方向同期

uv run sync.py pull wbs --project oaks-aux-compass
  → Excel の所有列だけ YAML へ取り込む（push しない）

uv run sync.py push wbs --project oaks-aux-compass
  → YAML の所有列だけ Excel へ反映する（pull しない）

uv run sync.py doctor --project oaks-aux-compass
  → id 重複・スキーマ違反・所有権の食い違いを検出
```

スキル `user-pmo-excel` 経由では `/user-pmo-excel sync` といった形でラップする。

## データフロー: `sync.py sync wbs`

1. `pmo.yaml` を読む（yaml_io）
2. `WBS.xlsm` を読む（excel_io, keep_vba=True）
3. `.pmo/last-sync.json` を読む（snapshot）
4. 行マッピング: id 列で YAML と Excel の行を対応付け
   - 新規（YAML 側に id 追加） → Excel に新規行挿入
   - 削除（YAML 側で id 消失） → Excel 該当行に🚩マーク（削除はしない）
   - 行順変更 → YAML の順を採用し、Excel を並び替え
5. 列所有権でマージ:
   - `owner: yaml` の列 → YAML の値で Excel を更新
   - `owner: excel` の列 → Excel の値で YAML を更新
6. `WBS.xlsm` を書き出し（keep_vba=True）
7. `pmo.yaml` を書き出し
8. `last-sync.json` を更新
9. 変更サマリーを表示

## エラーハンドリング

| ケース                                              | 動作                                                                                                                                                  |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Excel が他プロセスで開かれている                    | PermissionError を捕捉、「Excel を閉じてから再実行してください」                                                                                      |
| keep_vba=True でも VBA バイナリのハッシュが変わった | warn ログを出して継続。バックアップは Excel への書き込みが発生する run ごとに `.pmo/backups/{stem}_{YYYYMMDDTHHmmss}{ext}` を残し、最新 10 件のみ保持 |
| id 列に重複                                         | エラー停止、`doctor` で重複箇所をレポート                                                                                                             |
| id 列に欠損（Excel 側で行追加）                     | 新規 id 自動採番＋警告                                                                                                                                |
| YAML スキーマ違反                                   | pydantic 等で検証、エラー詳細を出力                                                                                                                   |
| `last-sync.json` 不在                               | 「初回 sync です。YAML を信頼してよいですか？」と対話確認                                                                                             |
| 両側で同じ id を削除                                | 差分なしとして成功                                                                                                                                    |
| 片側で削除、片側で更新                              | 警告して両方残す（YAML 側に🚩残置）                                                                                                                   |

## テスト

dotfiles のテスト方針（純粋関数のスポット単体テスト）に合わせる。

含めるテスト：

- `test_ownership.py` — 列所有権の解決ロジック
- `test_reconcile.py` — 双方向マージの分岐（新規 / 削除 / 更新 / 衝突）
- `test_yaml_io.py` — YAML 拡張スキーマの検証

含めないテスト：

- `excel_io.py` 自体（openpyxl ラッパー、I/O のみで実ロジック薄い）
- VBA マクロの動作（手動確認）
- 統合テスト（手動: テスト用プロジェクト 1 件で round-trip を確認）

手動テスト手順（skill のドキュメントに含める）：

1. テスト用 `pmo.yaml` + `WBS.xlsm` テンプレを `~/prj/_test/` に置く
2. `sync.py sync wbs --project _test` を実行
3. Excel を開いて VBA がガント描画していることを目視
4. Excel で実績日を書き換えて閉じる
5. もう一度 `sync.py sync wbs --project _test`
6. `pmo.yaml` が更新されたことを確認

## 実装言語の選定理由

Python + openpyxl を選定。理由：

- xlsm マクロ保持の確実性が最優先（ユーザーの VBA 資産が既に動いている）
- openpyxl は `load_workbook(path, keep_vba=True)` でマクロを round-trip 可能
- 依存は openpyxl と pyyaml のみで軽量
- `uv` で dotfiles のメイン Bun 環境と切り離して管理（`scripts/pmo/` 配下にローカル pyproject.toml）

Bun + exceljs を見送った理由：xlsm マクロの round-trip サポートが不安定で、VBA バイナリの破損事例が報告されている。PoC でこれを引いた場合の手戻りコストが大きい。

## PoC スコープ

✅ やる:

- WBS シート 1 枚の双方向同期（A〜I 列のメタデータのみ）
- 列所有権ルールを `pmo.yaml` に埋め込む
- id 列ベースの行マッチング
- 新規行追加 / 削除フラグ
- 衝突検出ログ
- スキル `user-pmo-excel` から呼べる CLI
- 手動テスト用のサンプルプロジェクト

❌ やらない（PoC 後の拡張）:

- 課題管理シート同期
- マスタシート同期（入力規則の更新含む）
- 工数集計シート（永続的に対象外）
- ガントチャートのスクリプト側描画
- 自動同期（git hook / fswatch）
- CSV エクスポート

## 拡張ロードマップ

PoC が動いたら段階的に拡張する：

1. **第 2 弾**: 課題管理シート同期（`issues.yaml`）
2. **第 3 弾**: マスタシート一方向反映（`master.yaml`）と入力規則の自動更新
3. **第 4 弾**: CSV エクスポート（pmo.yaml → flat csv、AI 分析向け）
4. **第 5 弾**: 進捗レポート生成（pmo.yaml + Excel 実績 → 週次レポート md）
5. **第 6 弾**: 自動同期（git pre-commit hook で Excel 変更検出→ pull）
