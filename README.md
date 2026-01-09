# dotfiles

個人用の dotfiles 管理リポジトリです。macOS 環境での開発環境セットアップを自動化します。

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
    ├── 01_setup_base.sh            # システム基盤セットアップ
    ├── 02_setup_home.sh            # 全設定ファイルのシンボリックリンク作成
    ├── 10_homebrew.sh              # Homebrewアプリインストール
    ├── 11_web.sh                   # Web開発ツール
    └── Brewfile                    # Homebrew設定
```

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
- **Claude Code**: AI 支援開発環境（CLAUDE.md、MCP 設定）
- **Code Quality**: lint/format 自動チェック（pre-commit 統合）
- **Python**: uv によるモダンな環境管理

### メディア・システムツール

- 画像・動画変換スクリプト
- システム情報取得ツール
- tmux 用ステータス表示スクリプト
- ディレクトリ比較ツール（compare_dirs.sh）

## 📋 要件

- macOS (Apple Silicon / Intel 対応)
- Homebrew
- direnv

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

## 🎯 Claude Code 設定

この dotfiles は Claude Code の開発環境統合をサポートしています。

### 依存ツール

- **GNU Awk** (gawk): tmux-sessionx プレビュー表示に必要
  - macOS のデフォルト BSD Awk の代わりに GNU Awk を使用
  - 自動インストール: `./setup/10_homebrew.sh` で自動導入

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

### セットアップ手順

1. **Homebrew で必要ツールをインストール**

   ```bash
   ./setup/10_homebrew.sh
   ```

   これにより以下がインストールされます：

   - gawk (GNU Awk)
   - tmux と関連プラグイン
   - その他の開発ツール

2. **Claude Code が自動実行する機能**

   - ファイル編集後に自動チェックが実行されます
   - エラーが発生した場合、ターミナルに警告メッセージが表示されます

3. **テスト実行（オプション）**

   ```bash
   bun test scripts/development/sort-permissions.test.ts
   ```

### トラブルシューティング

#### tmux-sessionx プレビューが空白

```bash
# GNU Awk がインストールされているか確認
which gawk

# PATH に gnubin が含まれているか確認
echo $PATH | tr ':' '\n' | grep gnubin
```

#### Permissions ソートが実行されない

```bash
# Hook が正しく登録されているか確認
cat ~/.claude/settings.json | jq '.hooks.PostToolUse'

# 手動実行でテスト
bun scripts/development/sort-permissions.ts --file=.claude/settings.local.json
```

## 📖 詳細情報

- [セットアップガイド](SETUP.md) - 詳細な環境構築手順
- [mise 設定](home/config/mise/config.toml) - タスクとツール管理
- [Claude 設定](home/.claude/) - AI 支援開発設定
