# dotfiles セットアップガイド

## 🚀 初回環境構築

新しいマシンでの初回セットアップ手順です。

### 1. システム基盤のセットアップ

```bash
# Homebrew、Xcode、基本ツールのインストール
./setup/01_base.sh
```

### 2. 全設定ファイルのシンボリックリンク作成

```bash
# home/ ディレクトリから全設定のシンボリックリンクを一括作成
./setup/02_dotfiles.sh
```

作成される設定：

**ホームディレクトリ直下:**
- `.zshrc`, `.zshenv`, `.zprofile` - zsh設定
- `.gitconfig`, `.gitignore_global` - Git設定
- `.tmux.conf`, `.vimrc` - その他の設定

**~/.config/ 配下:**
- `ghostty/` - ターミナル設定
- `mise/` - ツールバージョン管理
- `sheldon/` - zshプラグイン管理

**AI開発支援ツール:**
- `~/.claude/` - Claude設定（CLAUDE.md, settings.json, commands等）
- `~/.serena/` - Serena設定（セマンティックコーディング）

### 3. アプリケーションのインストール

```bash
# Homebrewからアプリをインストール（Brewfile使用）
./setup/10_homebrew.sh
```

---

## ⚡ 自動化機能

### direnv による自動実行

`dotfiles/` ディレクトリに移動するたびに以下が自動実行されます：

- Git hooks のセットアップ（commit前のlint/formatチェック）

```bash
# direnv が正常に動作しているか確認
direnv status

# 手動で再読み込み
direnv reload
```

**注**: 設定ファイルのシンボリックリンクは初回セットアップ時のみ必要です。`02_dotfiles.sh` 実行後は、設定ファイルの編集が自動的に反映されます。

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
│   ├── 01_base.sh                  # システム基盤セットアップ
│   ├── 02_dotfiles.sh              # 全設定ファイルのシンボリックリンク作成
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
./setup/02_dotfiles.sh  # 再実行でシンボリックリンク作成
```

### Claude設定の管理

```bash
# Claudeコマンドやスキルを追加
echo "# 新しいコマンド" > ~/dotfiles/home/.claude/commands/new-command.md

# シンボリックリンクにより自動的に反映される
# 再リンクが必要な場合のみ以下を実行
./setup/02_dotfiles.sh
```

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

### Claude設定の確認

```bash
# Claude設定のシンボリックリンク状態確認
ls -la ~/.claude/

# シンボリックリンクの再作成が必要な場合
./setup/02_dotfiles.sh
```

---

## ⚠️ 重要な変更点

### 最近の主な変更

#### 2025年12月

1. **セットアップスクリプトの統合**
   - `03_dev_configs.sh` を `02_dotfiles.sh` に統合
   - 全ての設定ファイルのシンボリックリンク作成を一元化
   - 初回セットアップが2ステップで完了（01→02のみ）
   - direnvによる自動同期は不要に（Git hooksのみ自動実行）

#### 2025年1月

1. **Python環境管理の変更**
   - pyenvからuvへ移行
   - より高速でモダンな環境管理

2. **シェル環境の改善**
   - PATHに個別スクリプトディレクトリを追加
   - .local環境変数の読み込み追加

3. **開発ツールの強化**
   - compare_dirs.shスクリプトの大幅改善
   - mise設定にLLMタスク（serena-mcp-server）追加

4. **Claude設定の最適化**
   - CLAUDE.mdのAI署名ルール明確化
   - settings.jsonのシンプル化

### 移行時の注意事項

- 既存のシンボリックリンクは自動的にスキップされます
- 設定ファイルのパス参照が `home/` ディレクトリに変更されています
- シンボリックリンクは初回セットアップ時のみ作成が必要です
