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
# home/ ディレクトリからホームディレクトリへシンボリックリンクを作成
./setup/02_dotfiles.sh
```

対象ファイル：

- `.zshrc`, `.zshenv`, `.zprofile` - zsh設定
- `.gitconfig`, `.gitignore_global` - Git設定
- `.tmux.conf` - tmux設定
- `.vimrc` - vim設定
- `.claude`, `.gemini` - AI設定ディレクトリ
- その他の個人設定ファイル

### 3. Claude Commands のセットアップ

```bash
# Claude設定ファイルとCommandsのシンボリックリンクを作成
./setup/03_claude.sh
```

このスクリプトは以降 `.envrc` により自動実行されます。

### 4. アプリケーションのインストール

```bash
# Homebrewからアプリをインストール（Brewfile使用）
./setup/20_homebrew.sh

# 言語環境のセットアップ（オプション）
./setup/10_anyenv.sh    # 言語環境管理
./setup/11_nodejs.sh    # Node.js
./setup/12_python.sh    # Python
./setup/13_golang.sh    # Go
./setup/16_rust.sh      # Rust
```

---

## ⚡ 自動同期機能

### direnv による自動実行

`dotfiles/` ディレクトリに移動するたびに以下が自動実行されます：

- Claude Commands の同期（`setup/03_claude.sh`）
- 新しいコマンドファイルの自動リンク作成

```bash
# direnv が正常に動作しているか確認
direnv status

# 手動で再読み込み
direnv reload
```

### Git hooks の設定

```bash
# commit前のlint/formatチェックを自動化
./scripts/setup/setup-git-hooks.sh
```

---

## 📁 現在のディレクトリ構造

```
dotfiles/
├── home/                           # 個人設定ファイル
│   ├── .zshrc                      # zshメイン設定
│   ├── .zshenv                     # zsh環境変数
│   ├── .zprofile                   # zshログイン設定
│   ├── .gitconfig                  # Git設定
│   ├── .tmux.conf                  # tmux設定
│   ├── .vimrc                      # vim設定
│   ├── .claude/                    # Claude設定
│   │   ├── CLAUDE.md               # Claude共通設定
│   │   ├── settings.json           # Claude設定
│   │   └── commands/               # Claudeコマンド
│   ├── .gemini/                    # Gemini設定
│   ├── .mcp.json                   # MCP設定
│   └── config/                     # .config/用設定
│       ├── mise/config.toml        # mise設定（タスク・ツール管理）
│       ├── zsh/                    # zsh設定ファイル群
│       └── iterm/                  # iTerm2設定
├── scripts/                        # 実行用スクリプト
│   ├── development/                # 開発関連ツール
│   │   ├── lighthouse-analyzer.sh  # Lighthouse分析
│   │   └── compare_dirs.sh         # ディレクトリ比較
│   ├── media/                      # メディア変換ツール
│   │   ├── convert_img2webp.sh     # 画像WebP変換
│   │   └── convert_m3u8ts2mp4.sh   # 動画変換
│   ├── setup/                      # セットアップ関連
│   │   └── setup-git-hooks.sh      # Git hooks設定
│   ├── system/                     # システム関連ツール
│   │   ├── connect_airpods.sh      # AirPods接続
│   │   ├── export_diff_zip.sh      # 差分アーカイブ
│   │   └── zipr.sh                 # 圧縮ツール
│   └── tmux/                       # tmux関連スクリプト
│       ├── get_battery_tmux.sh     # バッテリー情報
│       ├── get_cpu_tmux.sh         # CPU使用率
│       └── get_*_tmux.sh           # その他システム情報
├── setup/                          # 初回セットアップ用
│   ├── 01_base.sh                  # システム基盤セットアップ
│   ├── 02_dotfiles.sh              # シンボリックリンク作成
│   ├── 03_claude.sh                # Claude設定セットアップ・同期
│   ├── Brewfile                    # Homebrew設定
│   ├── 10_anyenv.sh                # 言語環境管理
│   ├── 20_homebrew.sh              # Homebrewアプリ
│   └── [11-23]_*.sh                # 各言語・ツールセットアップ
├── .envrc                          # direnv設定（自動同期）
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
./setup/02_dotfiles.sh  # 再実行でシンボリックリンク作成
```

### Claude Commands の管理

```bash
# 新しいコマンドファイルを追加
echo "# 新しいコマンド" > ~/dotfiles/home/.claude/commands/new-command.md

# direnv により自動同期される（または手動実行）
./setup/03_claude.sh
```

### コード品質チェック

```bash
# 手動でlint/format実行
mise run lint        # Markdown, YAML, TOMLのlint
mise run lint-sh     # シェルスクリプトのlint
mise run format      # ファイル整形
mise run format-sh   # シェルスクリプト整形

# Git hooks設定済みの場合、commit時に自動実行
git commit -m "変更内容"
```

---

## 🔧 トラブルシューティング

### シンボリックリンクの確認

```bash
# シンボリックリンクの状態確認
ls -la ~ | grep dotfiles

# .config/ ディレクトリのリンク確認
ls -la ~/.config/
```

### direnv の確認

```bash
# direnv の状態確認
direnv status

# .envrc の再許可
direnv allow

# 動作テスト
cd .. && cd ~/dotfiles  # ディレクトリ再入で実行確認
```

### Claude Commands の確認

```bash
# Claude Commands の同期状態確認
ls -la ~/.claude/commands/

# 手動同期実行
./setup/03_claude.sh
```

---

## ⚠️ 重要な変更点

### v2.0での主な変更

1. **ディレクトリ構造の整理**
   - 個人設定ファイルを `home/` に集約
   - リポジトリ管理用ファイルと明確に分離

2. **自動同期機能の強化**
   - direnv による Claude Commands 自動同期
   - 重複スクリプトの統合

3. **セットアップスクリプトの最適化**
   - `setup/03_claude.sh` が初回と日常の両方を担当
   - `setup/02_dotfiles.sh` のパス修正

### 移行時の注意事項

- 既存のシンボリックリンクは自動的にスキップされます
- 設定ファイルのパス参照が `home/` ディレクトリに変更されています
- Claude Commands の同期は direnv により自動化されています
