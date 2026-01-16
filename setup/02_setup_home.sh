#!/bin/bash

# dotfiles シンボリックリンク作成スクリプト
# 初回環境構築時のみ実行
# 全ての設定ファイル・ディレクトリのシンボリックリンクを作成

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ========================================
# ヘルパー関数
# ========================================

# ファイルのシンボリックリンクを作成
# Usage: link_file <source> <target> [label]
link_file() {
  local source_file="$1"
  local target_file="$2"
  local label="${3:-$(basename "$target_file")}"

  if [[ ! -f $source_file ]]; then
    echo -e "${YELLOW}⚠️  警告:${NC} $label がソースに見つかりません"
    return 1
  fi

  if [[ -L $target_file ]]; then
    local current
    current=$(readlink "$target_file")
    if [[ $current == "$source_file" ]]; then
      echo -e "${YELLOW}⏭️  スキップ:${NC} $label (既に正しくリンク)"
      ((skipped++))
    else
      echo -e "${GREEN}🔄 更新:${NC} $label"
      rm "$target_file"
      ln -s "$source_file" "$target_file"
      ((created++))
    fi
  elif [[ -f $target_file ]]; then
    echo -e "${RED}⚠️  警告:${NC} $label は実体ファイルです。手動確認してください。"
  else
    echo -e "${GREEN}✅ 作成:${NC} $label"
    ln -s "$source_file" "$target_file"
    ((created++))
  fi
}

# ディレクトリのシンボリックリンクを作成
# Usage: link_dir <source> <target> [label]
link_dir() {
  local source_dir="$1"
  local target_dir="$2"
  local label="${3:-$(basename "$target_dir")}"

  if [[ ! -d $source_dir ]]; then
    echo -e "${YELLOW}⚠️  警告:${NC} $label がソースに見つかりません"
    return 1
  fi

  if [[ -L $target_dir ]]; then
    local current
    current=$(readlink "$target_dir")
    if [[ $current == "$source_dir" ]]; then
      echo -e "${YELLOW}⏭️  スキップ:${NC} $label (既に正しくリンク)"
      ((skipped++))
    else
      echo -e "${GREEN}🔄 更新:${NC} $label"
      rm "$target_dir"
      ln -s "$source_dir" "$target_dir"
      ((created++))
    fi
  elif [[ -d $target_dir ]]; then
    echo -e "${RED}⚠️  警告:${NC} $label は実体ディレクトリです。手動確認してください。"
  else
    echo -e "${GREEN}✅ 作成:${NC} $label"
    ln -s "$source_dir" "$target_dir"
    ((created++))
  fi
}

# 親ディレクトリを必要に応じて作成
# Usage: ensure_dir <path>
ensure_dir() {
  local dir="$1"
  if [[ ! -d $dir ]]; then
    mkdir -p "$dir"
    echo -e "${BLUE}📁 ディレクトリを作成:${NC} $(basename "$dir")"
  fi
}

echo "🔗 dotfiles のシンボリックリンクを作成します..."

# ========================================
# ホームディレクトリ配下のdotfiles
# ========================================

echo ""
echo "📁 ホームディレクトリにシンボリックリンクを作成..."

created=0
skipped=0

# ホームディレクトリにシンボリックリンクを貼るファイル
DOT_FILES=(
  .agignore
  .gitcommit_template
  .gitconfig
  .gitconfig_private
  .gitignore_global
  .mcp.json
  .tigrc
  .tmux.conf
  .vimrc
  .zprofile
  .zshenv
  .zshrc
)

for file in "${DOT_FILES[@]}"; do
  link_file "$HOME/dotfiles/home/$file" "$HOME/$file" "$file"
done

# ========================================
# .config ディレクトリ配下
# ========================================

echo ""
echo "📁 .config/ ディレクトリにシンボリックリンクを作成..."

ensure_dir "$HOME/.config"

CONFIG_DIRS=(
  ghostty
  gwq
  lazygit
  mise
  sheldon
)

for dir in "${CONFIG_DIRS[@]}"; do
  link_dir "$HOME/dotfiles/home/config/$dir" "$HOME/.config/$dir" "$dir"
done

# ========================================
# Claude 設定
# ========================================

echo ""
echo "🤖 Claude 設定のシンボリックリンクを作成..."

ensure_dir "$HOME/.claude"

DOTFILES_CLAUDE_DIR="$HOME/dotfiles/home/.claude"
HOME_CLAUDE_DIR="$HOME/.claude"

# Claude設定ファイル
CLAUDE_FILES=(
  CLAUDE.md
  settings.json
  statusline.ts
)

for file in "${CLAUDE_FILES[@]}"; do
  link_file "$DOTFILES_CLAUDE_DIR/$file" "$HOME_CLAUDE_DIR/$file" "$file"
done

# Claudeフォルダ
CLAUDE_FOLDERS=(
  "commands:Commands"
  "agents:Agents"
  "skills:Skills"
  "plans:Plans"
)

for folder_pair in "${CLAUDE_FOLDERS[@]}"; do
  folder="${folder_pair%%:*}"
  label="${folder_pair##*:}"
  link_dir "$DOTFILES_CLAUDE_DIR/$folder" "$HOME_CLAUDE_DIR/$folder" "$label"
done

# ========================================
# Serena 設定
# ========================================

echo ""
echo "🔧 Serena 設定のシンボリックリンクを作成..."

ensure_dir "$HOME/.serena"
link_file "$HOME/dotfiles/home/.serena/serena_config.yml" "$HOME/.serena/serena_config.yml" "serena_config.yml"

# ========================================
# claude-mem 設定
# ========================================

echo ""
echo "🧠 claude-mem 設定のシンボリックリンクを作成..."

ensure_dir "$HOME/.claude-mem"
link_file "$HOME/dotfiles/home/.claude-mem/settings.json" "$HOME/.claude-mem/settings.json" "settings.json"

# ========================================
# サマリー表示
# ========================================

echo ""
echo "📊 シンボリックリンク作成完了:"
echo "   ✅ 新規作成: $created"
echo "   ⏭️  スキップ: $skipped"

echo ""
echo "✨ dotfiles のセットアップが完了しました！"
echo "   📄 ホームディレクトリ: zsh, git, vim等の設定"
echo "   📁 .config/: ghostty, mise, sheldon"
echo "   🤖 .claude/: AI開発支援ツール設定"
echo "   🔧 .serena/: セマンティックコーディング設定"
echo "   🧠 .claude-mem/: Claude メモリ設定"
echo ""
echo "💡 今後の設定変更は dotfiles/ ディレクトリで行ってください"
