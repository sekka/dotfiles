---
name: visual-regression-test
description: コード変更前後のスクリーンショットを複数ビューポートで撮影しImageMagickで画像diffを取るビジュアル回帰テスト。「ビジュアル確認」「レイアウト確認」「VRT」「スクショ比較」「見た目が崩れていないか」で起動。
---

# Visual Regression Test (VRT)

マークアップ・CSS・レイアウトに影響する変更の前後でスクリーンショットを撮影し、ピクセル単位で差分を検出する。

## Iron Law

1. 変更前スクリーンショットなしに比較しない

## 進捗報告ルール（必須）

各Phase開始時・完了時にユーザーに進捗を報告すること。報告フォーマット:

```
[VRT Phase N/5] {Phase名} — {状態}
  完了: X/Y ページ × Z ビューポート
  次: {次のアクション}
```

エラー発生時は即座に報告し、止まらずに代替手段を試す。

## 実行ルール（必須）

- **VRTスクリプトの実行は常にサブエージェント（implementer）に委譲する。** メインエージェントのコンテキストを消費しない。
- サブエージェントにはスクリプトパス、URL一覧パス、期待する結果を明示して渡す。
- サブエージェント完了後、メインエージェントはレポートのスクリーンショットを撮影してユーザーに見せる。
- **テスト実行時は対象を絞る:** 動作確認目的なら1ページ×1ビューポートで十分。フル実行は検証時のみ。

## 前提条件

- ImageMagick (`magick`) がインストール済み
- Node.js がインストール済み（Playwright を npm install して使用）
- プロジェクトに `scripts/vrt-urls.txt` が存在する（対象URL一覧）

`scripts/vrt-urls.txt` が存在しない場合、ユーザーに対象URLを確認して作成する。

## ワークフロー

vrt.sh が以下を全て自動処理する。AIが手動で各フェーズのスクリプトを書く必要はない。

### Phase 1: セットアップ

`vrt.sh` を呼び出すだけで以下が自動実行される:

- stash残留チェック（前回の `vrt-auto` stashが残っている場合はエラーで停止）
- Playwright のインストール（`/tmp/vrt-work/` に隔離）
- URLsファイルの退避（git stash で消えないように `/tmp/vrt-work/` にコピー）

### Phase 2: ベースライン取得

vrt.sh が自動処理:

- `git add -A && git stash push -m "vrt-auto"` でコード変更を退避
- 3ビューポート（1440px → 768px → 375px）を逐次撮影
- stash後は EXIT trap が有効なため、スクリプトが途中終了しても `git stash pop` が自動実行される

既存ベースライン（`/tmp/vrt-baseline/`）がある場合はスキップ。`VRT_FORCE_BASELINE=1` で強制再撮影。

### Phase 3: コード変更を実施

（スキルのスコープ外。変更完了後に vrt.sh を実行する）

### Phase 4: After撮影 + diff（ビューポート逐次・fail-fast）

vrt.sh が自動処理（`git stash pop` は After撮影前に1回だけ実行）:

```
for each viewport in (1440, 768, 375):
  1. After撮影（そのVPのみ）
  2. diff算出（そのVPのみ）
  3. FAILがあれば → レポート生成して即 exit 1（残りのVPはスキップ）
```

fail-fast により、最初の問題ビューポートで即座に停止してレポートを出す。

### Phase 5: レポート確認

生成先: `/tmp/vrt-report/index.html`（macOS では自動でブラウザが開く）

レポートの構成:
- ページタイトル行に **PASS/WARN/FAIL** とパーセンテージを表示
- 3列: BEFORE / AFTER / DIFF の画像
- フィルターボタン（Status / Page / Viewport）

## 判定基準

| 状態 | 差分率（fuzz 2%後） | アクション |
|------|---------------------|-----------|
| PASS | < 0.5% | 問題なし |
| WARN | 0.5% ～ 2.0% | ユーザーにdiff画像を見せて確認 |
| FAIL | >= 2.0% | レイアウト崩れの可能性。原因調査必須 |

## レンダリングノイズについて

写真領域はアンチエイリアシングで毎回微差が出る。fuzz 2% で吸収している。
それでも FAIL になる場合は `magick compare -metric SSIM` も参照すること。

## 実行コマンド

```bash
# 通常実行（ベースラインから全自動）
bash ~/.claude/skills/visual-regression-test/vrt.sh scripts/vrt-urls.txt

# ベースライン強制再撮影
VRT_FORCE_BASELINE=1 bash ~/.claude/skills/visual-regression-test/vrt.sh scripts/vrt-urls.txt

# ベースラインのみ撮影（git stash なし、diff なし）
# 現在の表示状態をそのままベースラインとして保存する。
# 変更前にベースラインだけ先に取りたい場合に使う。
VRT_BASELINE_ONLY=1 bash ~/.claude/skills/visual-regression-test/vrt.sh scripts/vrt-urls.txt
```
