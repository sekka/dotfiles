# Hooks & Lint システムアーキテクチャ

## 概要

このドキュメントでは、dotfilesプロジェクトにおけるHooksとLintシステムの3層アーキテクチャについて説明します。

## 3層構造

### Layer 1: Claude Code Hooks（リアルタイム）

**トリガー:** ファイル編集直後（ツール実行後）

**処理内容:**

- 編集されたファイルのみを自動修正
- 個別ファイル単位での軽量な検査

**実行時機:** PostToolUse フック（Edit/Write後）

**設定ファイル:** `home/.claude/settings.json` (行24, 28)

**実装スクリプト:**

- `/scripts/development/lint-format.ts` - lint/format処理
- `/scripts/development/sort-permissions.ts` - パーミッション整理

**特徴:**

- 迅速なフィードバック（リアルタイム）
- 個別ファイルの品質保証
- エラー発生時は警告を表示するが、処理を継続

### Layer 2: Git Hooks（コミット前）

**トリガー:** `git commit` 実行時

**処理内容:**

- 全ファイルのlintチェック
- コミットメッセージの検証
- コミットが許可される前の最終ゲート

**実行フロー:**

1. `commit-msg` フック → コミットメッセージの検証（AI署名、CWE-78パターン検出）
2. `pre-commit` フック → 全ファイルのlint/formatチェック

**設定ファイル:** `.githooks/` ディレクトリ

**実装スクリプト:**

- `pre-commit` → `scripts/git/pre-commit-check.sh`
- `commit-msg` → `scripts/git/hooks/validate-commit.ts`
- `scripts/git/validate-commit-message.ts` - 検証ロジック

**特徴:**

- 包括的なチェック（全ファイル）
- セキュリティ重視（AI署名検出、コマンドインジェクション対策）
- チェック失敗時はコミットをブロック

### Layer 3: mise Tasks（手動）

**トリガー:** `mise run lint` / `mise run format` の手動実行

**処理内容:**

- 全ファイルのlint/formatチェック
- 開発者が明示的に実行するメンテナンスタスク

**設定ファイル:** `home/config/mise/config.toml`

**実装スクリプト:**

- `scripts/development/lint-format.ts` - 共通実装

**特徴:**

- オンデマンド実行
- 開発者による明示的な制御
- CI/CDパイプラインでの使用

## エラーメッセージフォーマット

すべてのHooksで統一されたエラーメッセージフォーマットを使用：

```
[レベル] [コンポーネント] メッセージ
```

### フォーマット例

| レベル    | コンポーネント       | 用途                     |
| --------- | -------------------- | ------------------------ |
| `SUCCESS` | `[Claude Hook]`      | Claude Code Hooks成功時  |
| `ERROR`   | `[Claude Hook:Lint]` | lint自動修正失敗時       |
| `ERROR`   | `[Claude Hook:Sort]` | パーミッション整理失敗時 |
| `SUCCESS` | `[Git Hook]`         | Git Hook成功時           |
| `ERROR`   | `[Git Hook]`         | Git Hook失敗時           |
| `ERROR`   | `[Lint:oxlint]`      | 各ツール実行時のエラー   |
| `ERROR`   | `[Lint:dprint]`      | 各ツール実行時のエラー   |

### 実装例

**Claude Code Hook (settings.json):**

```json
"command": "... || echo \"ERROR [Claude Hook:Lint] Failed for: $file_path\" >&2"
```

**Git Hook (pre-commit-check.sh):**

```bash
echo -e "${RED}ERROR [Git Hook] $task failed${NC}"
```

**Lint Script (lint-format.ts):**

```typescript
console.error(`ERROR [Lint:${result.tool}] Failed to check/fix`);
```

## セキュリティ層別の責務

### AI署名検出（Defense-in-Depth）

AI生成コンテンツの誤った送信を防ぐため、複数の検証層を実装：

1. **インストラクション層:** `scripts/git/commit.md`にAI署名除去ガイダンス
2. **技術検証層:** `validate-commit-message.ts`で正規表現マッチング
3. **複数トリガー:** commit-msgとpre-commit両方で検証

### コマンドインジェクション対策（CWE-78）

`validate-commit-message.ts` で7層の検出パターン：

1. `shellCommands` - 危険なシェルコマンド（改行直後）
2. `commandSubstitution` - コマンド置換構文 `$()` や `` ` ``
3. `commandChaining` - メタキャラクタ後の危険なコマンド
4. `dangerousVarExpansion` - evalと変数展開の危険な組み合わせ
5. メッセージサイズ制限（DoS対策）
6. タイトル行の長さ制限（Gitコンベンション）
7. 空メッセージ検出

## 冗長性の設計根拠

### Lint処理の二重実行

Layer 1（Claude Hook）と Layer 2（Git Hook）でlint実行が二重になるのは、以下の理由から**意図的な設計**：

- **Layer 1:** 即座のフィードバック（開発中）
- **Layer 2:** 最終ゲート（コミット時）
- **効果:** 開発効率と品質保証のバランス

### AI署名検証の複数層

インストラクション、技術検証、複数トリガーによる**多層防御**：

- ユーザーガイダンスで事前防止
- 技術的検証で強制実装
- 複数実行タイミングで確実性向上

## トラブルシューティング

### CLaude Code Hook が実行されない

1. `home/.claude/settings.json` の `PostToolUse` セクションを確認
2. `lint-format.ts` スクリプトの存在確認
3. `bun` ランタイムの確認: `command -v bun`

### Git Hook が実行されない

1. `.git/hooks/` に実行権限があるか確認: `ls -la .git/hooks/`
2. 自動セットアップを実行: `bun scripts/setup/setup-git-hooks.ts`
3. `direnv` が有効か確認: `direnv status`

### エラーメッセージが表示されない

1. 標準エラー出力が正しくリダイレクトされているか確認
2. シェルコマンドの `>&2` リダイレクトを確認
3. ログファイルを確認（存在する場合）

## 関連ファイル一覧

| ファイル                                  | 目的                           | 層            |
| ----------------------------------------- | ------------------------------ | ------------- |
| `home/.claude/settings.json`              | Claude Code Hooks設定          | Layer 1       |
| `.githooks/pre-commit`                    | Git pre-commitフック源         | Layer 2       |
| `.githooks/commit-msg`                    | Git commit-msgフック源         | Layer 2       |
| `scripts/git/pre-commit-check.sh`         | pre-commit委譲スクリプト       | Layer 2       |
| `scripts/git/hooks/validate-commit.ts`    | コミットメッセージ検証エントリ | Layer 2       |
| `scripts/git/validate-commit-message.ts`  | 検証ロジック実装               | Layer 2       |
| `scripts/development/lint-format.ts`      | lint/format統合実装            | Layer 1, 2, 3 |
| `scripts/development/sort-permissions.ts` | パーミッション整理             | Layer 1       |
| `scripts/setup/setup-git-hooks.ts`        | Git Hook自動セットアップ       | セットアップ  |
| `.envrc`                                  | direnv設定（自動セットアップ） | セットアップ  |

## 参考

- **Conventional Commits:** コミットメッセージの規約に従う
- **OWASP Top 10:** セキュリティ脆弱性対策
- **Git Hooks:** https://git-scm.com/docs/githooks
