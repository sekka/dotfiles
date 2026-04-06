---
name: user-quality-loop
description: format・lint・typecheckを自動ループで通す品質チェック。「品質ループ」「lint通して」「フォーマット＆チェック」「コード整形」で起動。
allowed-tools: Bash, Read, Edit, Glob
---

# Quality Loop

format → lint → typecheck を自動で実行し、失敗時は修正して再実行するループ。

## Iron Law

1. 自動修正で既存ロジックを変更しない

## フロー

```
コマンド検出 → 実行 → 全パス？ → Yes → 完了報告
                         ↓ No
                    自動修正 → 再実行（最大3回）
                         ↓ 同じエラー2回連続
                    打ち切り → 問題報告
```

## Phase 1: コマンド検出

プロジェクトルートから利用可能な品質チェックコマンドを特定する。

### 検出順序
1. `mise.toml` — `[tasks]` セクションから lint/format/check 系タスクを探す
2. `package.json` — `scripts` から lint/format/typecheck 系を探す
3. `Makefile` — lint/format/check ターゲットを探す
4. 直接コマンド — dprint, oxlint, eslint, prettier, shfmt, shellcheck, tsc, pyright

### よくあるパターン
| プロジェクト | コマンド |
|-------------|---------|
| このdotfilesリポジトリ | `bun scripts/development/lint-format.ts` |
| Node.js プロジェクト | `npm run lint && npm run format` |
| mise管理プロジェクト | `mise run lint`, `mise run format` |

## Phase 2: 実行

以下の順序で実行する（存在するもののみ）:

1. **Formatter**（dprint, prettier, shfmt 等）— 自動修正モードで実行
2. **Linter**（oxlint, eslint, shellcheck 等）— --fix オプション付きで実行
3. **Type Checker**（tsc, pyright 等）— チェックのみ

各ステップの結果（成功/失敗、エラー数）を記録する。

## Phase 3: リトライループ

### ループ条件
- **最大3回**まで再実行（無限ループ防止）
- **同じエラーが2回連続**で出たら即打ち切り（自動修正不可と判断）

### 各ループで行うこと
1. エラー内容を解析
2. 自動修正可能 → Edit ツールで修正 → Phase 2 を再実行
3. 自動修正不可 → ループを打ち切り、Phase 4 で未解決として報告
4. 全パス or 上限到達まで繰り返す

### 自動修正の対象
- import順序の修正
- 未使用変数の削除
- フォーマットの適用（formatter再実行）
- 簡単な型エラー（明らかな修正のみ）

### 自動修正しないもの
- ロジックの変更が必要なエラー
- 設計判断が必要な型エラー
- セキュリティ関連の警告

## Phase 4: 報告

```markdown
## 品質チェック結果

- **実行回数:** N回（初回 + リトライM回）
- **Formatter:** PASS / FAIL（詳細）
- **Linter:** PASS / FAIL（残N件）
- **Type Check:** PASS / FAIL / SKIP

### 自動修正した項目
- [ファイル:行] 修正内容

### 未解決の問題（手動対応が必要）
- [ファイル:行] エラー内容
```
