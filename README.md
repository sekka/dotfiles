# dotfiles

個人用の dotfiles 管理リポジトリです。macOS 環境での開発環境セットアップを自動化します。

## 🚀 クイックスタート

### 初回セットアップ

```bash
# 1. システム基盤のセットアップ
./setup/01_base.sh

# 2. 全設定ファイルのシンボリックリンク作成
# (dotfiles, .config, Claude, Serena等すべて含む)
./setup/02_home.sh

# 3. Homebrewアプリのインストール
./setup/04_homebrew.sh

# 4. Claude Code公式版のインストール
./setup/06_claude_code.sh
```

## ⚡ 自動機能

このリポジトリは **direnv** を使用した自動化機能を提供します：

- `dotfiles/` ディレクトリに移動するたびに Git hooks が自動セットアップ
- `.envrc` によりプロジェクト固有のコマンドがグローバルに利用可能

## 🔧 メンテナンス

### Git hooks

自動で lint/format チェックが実行されます：

```bash
# Git hooks設定
./scripts/setup/setup-git-hooks.ts

# 手動チェック実行
mise run lint      # 全ファイル形式のチェック（oxlint, dprint, shellcheck）
mise run format    # 全ファイル形式の整形（oxfmt, dprint, shfmt）
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
- 新規ファイル追加時は `./setup/02_home.sh` を再実行

## 🍎 macOS設定管理

macOSの設定を`defaults`コマンドでコード化して管理できます。

### 現在の設定をチェック

```bash
# デフォルトから変更されている設定を確認
mise run macos:check
```

### メジャーな設定を適用

一般的によく使われるmacOS設定をまとめて適用します：

```bash
# 設定を適用（実行前にバックアップが自動作成されます）
mise run macos:apply
```

含まれる設定：

- **Finder**: 拡張子表示、隠しファイル表示、パスバー表示
- **Dock**: 自動非表示、アニメーション高速化
- **キーボード**: キーリピート速度、自動修正無効化
- **トラックパッド**: タップでクリック、速度調整
- **スクリーンショット**: 形式、影の有無
- **Safari**: 開発メニュー、完全URL表示

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
./setup/06_claude_code.sh
```

### 環境変数の設定

Claude Code プラグインやMCPサーバーで使用するAPIキーを設定します：

```bash
# 1. サンプルファイルをコピー
cp home/.env_sample ~/.env

# 2. 必要なAPIキーを設定
# ANTHROPIC_API_KEY: claude-mem プラグインで必須
# CONTEXT7_API_KEY: Context7 ドキュメント検索（オプション）
# GITHUB_TOKEN: GitHub 連携（オプション）
# BRAVE_API_KEY: Brave Search MCP サーバー（オプション）
# GREPTILE_API_KEY: Greptile AI コード検索・分析（オプション）
# CLAUDE_MEM_GEMINI_API_KEY: claude-mem の Gemini LLM バックエンド（オプション）
# CLAUDE_MEM_OPENROUTER_API_KEY: claude-mem の OpenRouter LLM バックエンド（オプション）

vi ~/.env
```

**重要:** `.env` ファイルは機密情報を含むため、絶対にバージョン管理に含めないでください。

### 自動ホック機能

Claude Code は以下のファイル編集時に自動でツールを実行します：

#### Lint & Format (oxc Ecosystem)

- **TypeScript/JavaScript/JSON**: oxlint (linting) + oxfmt (formatting)
  - Biome から oxc ecosystem への移行により、Rust ベースの高速ツールを使用
  - 並列実行により処理時間を短縮
- **Markdown/YAML/TOML**: dprint で統合フォーマット
- **シェルスクリプト**: shfmt (formatting) + shellcheck (linting)

#### Permissions 自動ソート

- `.claude/settings.local.json` 編集時に permissions 配列を自動的にアルファベット順にソート
- スクリプト: `scripts/development/sort-permissions.ts`
- 実行タイミング: ファイル保存時（PostToolUse フック）

### コード品質チェック

```bash
# 手動でlint/format実行
mise run lint        # 全ファイル形式のチェック
mise run format      # 全ファイル形式の整形

# LLM関連タスク
mise run llm-serena  # serena-mcp-serverを起動

# Git hooks設定済みの場合、commit時に自動実行
git commit -m "変更内容"
```
