# dotfiles セットアップガイド

## 🚀 初回環境構築

新しいマシンでの初回セットアップ手順です。

### 1. システム基盤のセットアップ
```bash
# Homebrew、Xcode、基本ツールのインストール
./setup/01_base.sh
```

### 2. dotfiles のシンボリックリンク作成
```bash
# .zshrc, .gitconfig, .tmux.conf などのシンボリックリンクを作成
./setup/02_dotfiles.sh
```

### 3. Claude Commands のセットアップ
```bash
# Claude設定ファイルとCommandsのシンボリックリンクを作成
./setup/03_claude.sh
```

### 4. アプリケーションのインストール（オプション）
```bash
# 各種アプリケーションのインストール
./setup/10_anyenv.sh    # 言語環境管理
./setup/20_homebrew.sh  # Homebrewアプリ
# その他の setup/ スクリプトを必要に応じて実行
```

---

## 🔄 日常的な同期作業

設定ファイルを変更した後の同期作業です。

### Claude Commands の同期
```bash
# 新しいコマンドファイルを追加/更新した場合
./scripts/sync-claude-commands.sh
```

### その他の設定ファイル
- dotfiles 内のファイルを直接編集すれば、自動的にシンボリックリンク経由で反映されます
- 新しいファイルを追加した場合のみ `./setup/02_dotfiles.sh` を再実行

---

## 📁 ディレクトリ構造

```
dotfiles/
├── setup/                      # 初回セットアップ用
│   ├── 01_base.sh              # システム基盤のセットアップ
│   ├── 02_dotfiles.sh          # dotfiles シンボリックリンク作成
│   ├── 03_claude.sh            # Claude Commands 初回セットアップ
│   ├── 10_anyenv.sh            # 言語環境管理
│   ├── 20_homebrew.sh          # Homebrewアプリ
│   └── ...                     # その他のセットアップスクリプト
├── scripts/                    # 日常的な作業用
│   ├── sync-claude-commands.sh # Claude Commands 同期
│   └── tmux/                   # tmux関連スクリプト
├── config/                     # .config/ ディレクトリ用設定
│   ├── mise/
│   └── zellij/
├── .claude/                    # Claude関連設定
│   ├── commands/               # Claudeコマンドファイル
│   ├── CLAUDE.md              # Claude設定
│   └── settings.json          # Claude設定
└── .[dotfiles]                 # 各種設定ファイル
    ├── .zshrc
    ├── .gitconfig
    ├── .tmux.conf
    └── ...
```

---

## 🔧 使い分けのガイドライン

### 初回セットアップ時
- **setup/** ディレクトリのスクリプトを番号順に実行
  - `01_base.sh` → `02_dotfiles.sh` → `03_claude.sh` → その他
- 一度だけ実行すれば完了

### 日常作業時
- **scripts/** ディレクトリのスクリプトを必要に応じて実行
- 設定を追加/変更した時のみ

### ファイル編集時
- dotfiles 内のファイルを直接編集
- シンボリックリンクにより自動的に反映される

---

## ⚠️ 注意事項

- 初回セットアップと日常的な同期作業を明確に分離
- `setup/` のスクリプトは初回のみ実行
- `scripts/` のスクリプトは必要に応じて実行
- 既存ファイルがある場合は自動的にスキップされます