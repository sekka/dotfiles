# dotfiles

個人用のdotfiles管理リポジトリです。macOS環境での開発環境セットアップを自動化します。

## 📁 ディレクトリ構造

```text
dotfiles/
├── home/                           # 個人設定ファイル（ホームディレクトリにシンボリックリンク）
│   ├── .zshrc, .gitconfig など     # シェル・Git設定
│   ├── .claude/                    # Claude設定
│   ├── .gemini/                    # Gemini設定
│   └── config/                     # アプリケーション設定（.config/にリンク）
│       ├── mise/                   # mise設定
│       ├── zsh/                    # zsh設定ファイル群
│       └── iterm/                  # iTerm2設定
├── scripts/                        # 実行用スクリプト
│   ├── development/                # 開発関連ツール
│   ├── media/                      # メディア変換ツール
│   ├── setup/                      # セットアップ関連
│   ├── system/                     # システム関連ツール
│   └── tmux/                       # tmux関連スクリプト
└── setup/                          # 初回セットアップ用スクリプト
    ├── 01_base.sh                  # システム基盤セットアップ
    ├── 02_dotfiles.sh              # dotfilesシンボリックリンク作成
    ├── 03_claude.sh                # Claude設定セットアップ
    ├── Brewfile                    # Homebrew設定
    └── ...                         # 言語別セットアップ
```

## 🚀 クイックスタート

### 初回セットアップ

```bash
# 1. システム基盤のセットアップ
./setup/01_base.sh

# 2. dotfilesのシンボリックリンク作成
./setup/02_dotfiles.sh

# 3. Claude設定のセットアップ
./setup/03_claude.sh

# 4. Homebrewアプリのインストール
./setup/20_homebrew.sh
```

詳細なセットアップ手順は [SETUP.md](SETUP.md) を参照してください。

## ⚡ 自動同期機能

このリポジトリは **direnv** を使用して自動同期機能を提供します：

- `dotfiles/` ディレクトリに移動するたびに Claude Commands が自動同期
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
