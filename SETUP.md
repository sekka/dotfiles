# dotfiles セットアップガイド

## 🚀 初回環境構築

新しいマシンでの初回セットアップ手順です。

### 1. システム基盤のセットアップ

```bash
# Homebrew、Xcode、基本ツールのインストール
./setup/01_setup_base.sh
```

### 2. 全設定ファイルのシンボリックリンク作成

```bash
# home/ ディレクトリから全設定のシンボリックリンクを一括作成
./setup/02_setup_home.sh
```

作成される設定：

**ホームディレクトリ直下:**

- `.zshrc`, `.zshenv`, `.zprofile` - zsh 設定
- `.gitconfig`, `.gitignore_global` - Git 設定
- `.tmux.conf`, `.vimrc` - その他の設定

**~/.config/ 配下:**

- `ghostty/` - ターミナル設定
- `lazygit/` - Git TUI 設定
- `mise/` - ツールバージョン管理
- `sheldon/` - zsh プラグイン管理

**AI 開発支援ツール:**

- `~/.claude/` - Claude 設定（CLAUDE.md, settings.json, commands 等）
- `~/.serena/` - Serena 設定（セマンティックコーディング）

### 3. アプリケーションのインストール

```bash
# Homebrewからアプリをインストール（Brewfile使用）
./setup/10_homebrew.sh
```

---

## ⚡ 自動化機能

### direnv による自動実行

`dotfiles/` ディレクトリに移動するたびに以下が自動実行されます：

- Git hooks のセットアップ（commit 前の lint/format チェック）

```bash
# direnv が正常に動作しているか確認
direnv status

# 手動で再読み込み
direnv reload
```

**注**: 設定ファイルのシンボリックリンクは初回セットアップ時のみ必要です。`02_setup_home.sh` 実行後は、設定ファイルの編集が自動的に反映されます。

### Git hooks の設定

```bash
# commit前のlint/formatチェックを自動化
./scripts/setup/setup-git-hooks.ts
```

---

## 📁 現在のディレクトリ構造

```text
dotfiles/
├── home/                           # 個人設定ファイル
│   ├── .zshrc                      # zshメイン設定
│   ├── .zshenv                     # zsh環境変数
│   ├── .zprofile                   # zshログイン設定
│   ├── .gitconfig                  # Git設定
│   ├── .tmux.conf                  # tmux設定
│   ├── .tmux/                      # tmux追加設定
│   ├── .vimrc                      # vim設定
│   ├── .claude/                    # Claude AI設定
│   │   ├── CLAUDE.md               # Claude共通設定・作業ルール
│   │   ├── settings.json           # Claude設定
│   │   ├── commands/               # カスタムコマンド
│   │   ├── agents/                 # エージェント定義
│   │   ├── skills/                 # スキル定義
│   │   └── rules/                  # ルール定義
│   ├── .serena/                    # Serena設定
│   │   └── serena_config.yml       # Serena設定ファイル
│   ├── .mcp.json                   # MCP設定（各種MCPサーバー統合）
│   └── config/                     # .config/用設定
│       ├── ghostty/                # ターミナル設定
│       ├── lazygit/                # Git TUI設定
│       ├── mise/                   # ツールバージョン管理
│       ├── sheldon/                # zshプラグインマネージャー
│       ├── terminal/               # ターミナル設定
│       └── zsh/                    # zsh設定ファイル群
├── scripts/                        # 実行用スクリプト
│   ├── development/                # 開発関連ツール
│   │   ├── lighthouse-analyzer.ts  # Lighthouse分析
│   │   └── compare-dirs.ts         # ディレクトリ比較
│   ├── git/                        # Git関連ツール
│   ├── media/                      # メディア変換ツール
│   │   ├── convert-img2webp.ts     # 画像WebP変換
│   │   └── convert-m3u8ts2mp4.ts   # 動画変換
│   ├── setup/                      # セットアップ関連
│   │   └── setup-git-hooks.ts      # Git hooks設定
│   └── system/                     # システム関連ツール
│       ├── export-diff-zip.ts      # 差分アーカイブ
│       └── zipr.ts                 # 圧縮ツール
├── setup/                          # 初回セットアップ用
│   ├── 01_setup_base.sh            # システム基盤セットアップ
│   ├── 02_setup_home.sh            # 全設定ファイルのシンボリックリンク作成
│   ├── 10_homebrew.sh              # Homebrewアプリインストール
│   ├── 11_web.sh                   # Web開発ツール
│   └── Brewfile                    # Homebrew設定
├── .envrc                          # direnv設定（Git hooks自動セットアップ）
├── .gitignore                      # Git除外設定
└── README.md, SETUP.md             # ドキュメント
```

---

## 🔄 日常的な作業

### 設定ファイルの編集

```bash
# 設定ファイルを直接編集（シンボリックリンクで自動反映）
vim ~/dotfiles/home/.zshrc
vim ~/dotfiles/home/.gitconfig

# 新しい設定ファイルを追加した場合
./setup/02_setup_home.sh  # 再実行でシンボリックリンク作成
```

### Claude 設定の管理

```bash
# Claudeコマンドやスキルを追加
echo "# 新しいコマンド" > ~/dotfiles/home/.claude/commands/new-command.md

# シンボリックリンクにより自動的に反映される
# 再リンクが必要な場合のみ以下を実行
./setup/02_setup_home.sh
```

### Claude Code プラグイン

各環境でマーケットプレイスの追加とプラグインのインストールが必要です：

```bash
# skill-creator（スキル作成スキル）
claude /plugin marketplace add anthropics/skills
claude /plugin install example-skills@anthropic-agent-skills

# claude-mem（セッション間メモリ）
claude /plugin marketplace add thedotmack/claude-mem
claude /plugin install claude-mem@thedotmack

# claude-mem-japanese（claude-mem日本語対応）
claude /plugin marketplace add Chachamaru127/claude-mem-jp
claude /plugin install claude-mem-japanese@claude-mem-jp

# claude-code-harness（コード管理ツール）
claude /plugin marketplace add Chachamaru127/claude-code-harness
claude /plugin install claude-code-harness@claude-code-harness-marketplace
```

プラグインのインストール後は Claude Code の再起動が必要です。

### コード品質チェック

```bash
# 手動でlint/format実行
mise run lint        # Markdown, YAML, TOMLのlint
mise run lint-sh     # シェルスクリプトのlint
mise run format      # ファイル整形
mise run format-sh   # シェルスクリプト整形

# LLM関連タスク
mise run llm-serena  # serena-mcp-serverを起動

# Git hooks設定済みの場合、commit時に自動実行
git commit -m "変更内容"
```
