---
name: user-preflight
description: コミット前の統合チェック。lint/型チェック/変更レビュー/機密情報チェック/コミットメッセージ案を1コマンドで実行。「preflight」「コミット前チェック」「プリフライト」で起動。
allowed-tools: Bash, Read, Grep, Glob
---

# Preflight

コミット前の統合チェックを1コマンドで実行する。

## Iron Law

1. チェック結果を改ざん・省略しない
2. 失敗したチェックを無視してDONEを返さない

## フロー

```
変更検出 → lint/format → 型チェック → 変更レビュー → 機密情報チェック → コミットメッセージ案 → 結果サマリー
```

## Phase 1: 変更検出

```bash
git status
git diff --cached --name-only  # ステージ済み
git diff --name-only           # 未ステージ
```

変更がなければ「変更なし」と報告してDONEで終了。

## Phase 2: lint/format チェック

プロジェクトのlintコマンドを検出して実行する。

### 検出順序

1. `package.json` scripts — `lint`, `format:check` 等
2. `mise.toml` — `[tasks]` から lint/format 系タスクを探す
3. `Makefile` — lint/format ターゲット
4. 直接コマンド — dprint, oxlint, eslint, shfmt, shellcheck

見つからなければSKIPとして記録する。

## Phase 3: 型チェック

型チェッカーがあれば実行する。

| 言語 | コマンド |
|------|---------|
| TypeScript | `tsc --noEmit` |
| Python | `pyright` または `mypy` |

見つからなければSKIPとして記録する。

## Phase 4: 変更レビュー（簡易）

`git diff --cached`（ステージ済み）または `git diff`（未ステージ）を読んで以下を確認する。

### チェック観点（grepベース）

- **デバッグコード残留**: `console.log`, `debugger`, `print(`, `TODO`, `FIXME`
- **意図しない変更**: 関係ないファイルが含まれていないか（ファイル一覧で確認）

問題があればWARNINGとして件数を記録する。詳細なレビューは `/review-and-improve` に委譲。

## Phase 5: 機密情報チェック

ステージされたファイルに以下が含まれないかGrepで確認する。

```bash
git diff --cached
```

### チェック対象パターン

- `.env` ファイルのステージング
- `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD` 等のキーワード（代入形式）
- 秘密鍵ファイル（`-----BEGIN`, `.pem`, `.key`）

検出したらWARNINGで報告する（ブロックはしない）。

## Phase 6: コミットメッセージ案

```bash
git log --oneline -5
```

既存のコミットスタイルを参照し、変更内容から1-2案を提案する。

### よくあるプレフィックス

`feat:`, `fix:`, `config:`, `refactor:`, `docs:`, `chore:`

## Phase 7: 結果サマリー

```markdown
## Preflight Results

| チェック | 結果 |
|---------|------|
| lint/format | PASS / FAIL / SKIP |
| 型チェック | PASS / FAIL / SKIP |
| 変更レビュー | OK / WARNING(n件) |
| 機密情報 | OK / WARNING(n件) |

### コミットメッセージ案
- `feat: ...`
- `fix: ...`

## Status: DONE
```

FAILが1つでもあれば Status は `DONE_WITH_CONCERNS` とする。
