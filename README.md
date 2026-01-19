# dotfiles

個人用の dotfiles 管理リポジトリです。macOS 環境での開発環境セットアップを自動化します。

## 🚀 クイックスタート

### 初回セットアップ

```bash
# 1. システム基盤のセットアップ
./setup/01_setup_base.sh

# 2. 全設定ファイルのシンボリックリンク作成
# (dotfiles, .config, Claude, Serena等すべて含む)
./setup/02_setup_home.sh

# 3. Homebrewアプリのインストール
./setup/10_homebrew.sh
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
- 新規ファイル追加時は `./setup/02_setup_home.sh` を再実行

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

### Claude Code プラグイン

各環境でマーケットプレイスの追加とプラグインのインストールが必要です：

```bash
# skill-creator（スキル作成スキル）
claude plugin marketplace add anthropics/skills
claude plugin install example-skills@anthropic-agent-skills

# claude-mem（セッション間メモリ）
claude plugin marketplace add thedotmack/claude-mem
claude plugin install claude-mem@thedotmack

# claude-mem-japanese（claude-mem日本語対応）
claude plugin marketplace add Chachamaru127/claude-mem-jp
claude plugin install claude-mem-japanese@claude-mem-jp

# claude-code-harness（コード管理ツール）
claude plugin marketplace add Chachamaru127/claude-code-harness
claude plugin install claude-code-harness@claude-code-harness-marketplace

# Asking（AI同士の相談）
claude plugin marketplace add hiroro-work/claude-plugins
claude plugin install ask-claude@hiropon-plugins
claude plugin install ask-codex@hiropon-plugins
claude plugin install ask-gemini@hiropon-plugins
claude plugin install peer@hiropon-plugins
```

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
