# dotfiles

個人用のdotfiles管理リポジトリです。macOS環境での開発環境セットアップを自動化します。

## 📁 ディレクトリ構造

```text
dotfiles/
├── home/                           # 個人設定ファイル（ホームディレクトリにシンボリックリンク）
│   ├── .zshrc, .gitconfig など     # シェル・Git設定
│   ├── .claude/                    # Claude AI設定
│   │   ├── CLAUDE.md               # 作業ルール・設定
│   │   ├── settings.json           # Claude設定
│   │   ├── commands/               # カスタムコマンド
│   │   ├── agents/                 # エージェント定義
│   │   ├── skills/                 # スキル定義
│   │   └── rules/                  # ルール定義
│   ├── .serena/                    # Serena設定
│   ├── .tmux/                      # tmux追加設定
│   └── config/                     # アプリケーション設定（.config/にリンク）
│       ├── ghostty/                # ターミナル設定
│       ├── mise/                   # ツールバージョン管理
│       ├── sheldon/                # zshプラグインマネージャー
│       ├── terminal/               # ターミナル設定
│       └── zsh/                    # zsh設定ファイル群
├── scripts/                        # 実行用スクリプト
│   ├── development/                # 開発関連ツール
│   ├── git/                        # Git関連ツール
│   ├── media/                      # メディア変換ツール
│   ├── setup/                      # セットアップ関連
│   └── system/                     # システム関連ツール
└── setup/                          # 初回セットアップ用スクリプト
    ├── 01_base.sh                  # システム基盤セットアップ
    ├── 02_dotfiles.sh              # 全設定ファイルのシンボリックリンク作成
    ├── 10_homebrew.sh              # Homebrewアプリインストール
    ├── 11_web.sh                   # Web開発ツール
    └── Brewfile                    # Homebrew設定
```

## 🚀 クイックスタート

### 初回セットアップ

```bash
# 1. システム基盤のセットアップ
./setup/01_base.sh

# 2. 全設定ファイルのシンボリックリンク作成
# (dotfiles, .config, Claude, Serena等すべて含む)
./setup/02_dotfiles.sh

# 3. Homebrewアプリのインストール
./setup/10_homebrew.sh
```

詳細なセットアップ手順は [SETUP.md](SETUP.md) を参照してください。

## ⚡ 自動機能

このリポジトリは **direnv** を使用した自動化機能を提供します：

- `dotfiles/` ディレクトリに移動するたびに Git hooks が自動セットアップ
- `.envrc` によりプロジェクト固有のコマンドがグローバルに利用可能

## 🛠️ 主要機能

### 設定管理

- **zsh**: プロンプト、エイリアス、補完設定
- **tmux**: ステータスバー、ペイン管理
- **Git**: コミットテンプレート、グローバル設定
- **vim**: 基本的なエディタ設定

### 開発ツール

- **mise**: 言語バージョン管理とタスク定義
- **Claude Code**: AI支援開発環境（CLAUDE.md、MCP設定）
- **Code Quality**: lint/format自動チェック（pre-commit統合）
- **Python**: uvによるモダンな環境管理

### メディア・システムツール

- 画像・動画変換スクリプト
- システム情報取得ツール
- tmux用ステータス表示スクリプト
- ディレクトリ比較ツール（compare_dirs.sh）

## 📋 要件

- macOS (Apple Silicon / Intel 対応)
- Homebrew
- direnv

## 🔧 メンテナンス

### Git hooks

自動でlint/formatチェックが実行されます：

```bash
# Git hooks設定
./scripts/setup/setup-git-hooks.ts

# 手動チェック実行
mise run lint      # Markdown, YAML, TOMLのlint
mise run lint-sh   # シェルスクリプトのlint
mise run format    # ファイル整形
```

### 設定の追加・変更

- `home/` 内のファイルを直接編集
- シンボリックリンクにより自動反映
- 新規ファイル追加時は `./setup/02_dotfiles.sh` を再実行

## 📖 詳細情報

- [セットアップガイド](SETUP.md) - 詳細な環境構築手順
- [mise設定](home/config/mise/config.toml) - タスクとツール管理
- [Claude設定](home/.claude/) - AI支援開発設定
