# dotfiles

個人用の dotfiles 管理リポジトリです。macOS 環境での開発環境セットアップを自動化します。

## 🚀 クイックスタート

### 初回セットアップ

```bash
# 1. システム基盤のセットアップ
./setup/01_base.sh

# 2. Homebrewパッケージのインストール
./setup/02_brew.sh

# 3. 全設定ファイルのシンボリックリンク作成
# (dotfiles, .config, Claude等すべて含む)
./setup/04_symlinks.sh

# 4. Claude Code公式版のインストール
./setup/06_claude.sh
```

## ⚡ 自動機能

このリポジトリは **direnv** と **Git hooks** を使用した自動化機能を提供します：

- `.githooks/pre-commit` により commit 前に lint/format チェックが自動実行
- `.envrc` によりプロジェクト固有のコマンドがグローバルに利用可能

## 🔧 メンテナンス

### Git hooks

`.githooks/pre-commit` により、commit 前に自動で lint/format チェックが実行されます。

手動でチェックを実行する場合：

```bash
# チェックのみ（修正なし）
bun scripts/development/lint-format.ts --mode=check

# 自動修正
bun scripts/development/lint-format.ts --mode=fix
```

### Lint & Format ツールチェーン

統合 lint/format スクリプト `scripts/development/lint-format.ts` が以下を実行します：

- **oxlint + oxfmt**: TypeScript/JavaScript/JSON (oxc ecosystem)
- **dprint**: Markdown/YAML/TOML
- **shfmt + shellcheck**: シェルスクリプト

詳細は `scripts/development/lint-format.ts` を参照してください。

### 設定の追加・変更

- `home/` 内のファイルを直接編集
- シンボリックリンクにより自動反映
- 新規ファイル追加時は `./setup/04_symlinks.sh` を再実行

## 🍎 macOS設定管理

macOSの設定を`defaults`コマンドでコード化して管理できます。

### 現在の設定をチェック

```bash
# デフォルトから変更されている設定を確認
mise run macos:check
```

### 今後の設定変更を追跡

システム環境設定で行った変更をスクリプト化できます：

```bash
# 1. 変更前のスナップショットを取得
mise run macos:snapshot-before

# 2. システム環境設定で設定を変更

# 3. 変更後のスナップショットを取得して差分を生成
mise run macos:snapshot-after
```

デスクトップに`macos_settings_diff_*.sh`が生成されます。

**pdefツールのインストール（推奨）**:

```bash
git clone https://github.com/yammerjp/pdef.git
cd pdef && make && sudo cp bin/pdef /usr/local/bin/
```

pdefを使用すると、`defaults write`コマンドが自動生成されます。

## 🎯 Claude Code 設定

この dotfiles は Claude Code の開発環境統合をサポートしています。

### インストール

Claude Code は公式推奨の方法でインストールされます：

```bash
# セットアップスクリプトで自動インストール
./setup/06_claude.sh
```

### 環境変数の設定

Claude Code プラグインやMCPサーバーで使用するAPIキーを設定します：

```bash
# 1. サンプルファイルをコピー
cp home/.env_sample ~/.env

# 2. 必要なAPIキーを設定
# ANTHROPIC_API_KEY: Claude API キー（必須）
# GREPTILE_API_KEY: Greptile AI コード検索・分析（オプション）
# CONTEXT7_API_KEY: Context7 ドキュメント検索（オプション）
# GITHUB_TOKEN: GitHub 連携（オプション）
# BRAVE_API_KEY: Brave Search MCP サーバー（オプション）

vi ~/.env
```

**重要:** `.env` ファイルは機密情報を含むため、絶対にバージョン管理に含めないでください。

### 自動フック機能

Claude Code は以下のファイル編集時に自動でツールを実行します：

#### Lint & Format (oxc Ecosystem)

- **TypeScript/JavaScript/JSON**: oxlint (linting) + oxfmt (formatting)
  - Rust ベースの高速ツール（oxc ecosystem）を使用
- **Markdown/YAML/TOML**: dprint で統合フォーマット
- **シェルスクリプト**: shfmt (formatting) + shellcheck (linting)

#### Permissions 自動ソート

- `.claude/settings.local.json` 編集時に permissions 配列を自動的にアルファベット順にソート
- スクリプト: `scripts/development/sort-permissions.ts`
- 実行タイミング: ファイル保存時（PostToolUse フック）

### コード品質チェック

```bash
# 手動でlint/format実行
bun scripts/development/lint-format.ts --mode=check  # チェックのみ
bun scripts/development/lint-format.ts --mode=fix    # 自動修正

# Git hooks設定済みの場合、commit時に自動実行
git commit -m "変更内容"
```
