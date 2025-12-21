#!/bin/bash

# 開発ツール設定セットアップ・同期スクリプト
# Claude, Serena, sheldon などの設定ファイルのシンボリックリンクを作成
# 初回セットアップと日常的な同期の両方に対応
# .envrcにより、dotfilesディレクトリ移動時に自動実行される

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔧 開発ツール設定のセットアップ・同期を開始します..."

# ディレクトリの定義
DOTFILES_CLAUDE_DIR="${HOME}/dotfiles/home/.claude"
HOME_CLAUDE_DIR="${HOME}/.claude"
COMMANDS_SOURCE_DIR="${DOTFILES_CLAUDE_DIR}/commands"
COMMANDS_TARGET_DIR="${HOME_CLAUDE_DIR}/commands"
AGENTS_SOURCE_DIR="${DOTFILES_CLAUDE_DIR}/agents"
AGENTS_TARGET_DIR="${HOME_CLAUDE_DIR}/agents"
SKILLS_SOURCE_DIR="${DOTFILES_CLAUDE_DIR}/skills"
SKILLS_TARGET_DIR="${HOME_CLAUDE_DIR}/skills"
RULES_SOURCE_DIR="${DOTFILES_CLAUDE_DIR}/rules"
RULES_TARGET_DIR="${HOME_CLAUDE_DIR}/rules"

# .claude ディレクトリが存在しない場合は作成
if [[ ! -d $HOME_CLAUDE_DIR ]]; then
  printf "%b\n" "${BLUE}📁 ディレクトリを作成:${NC} $HOME_CLAUDE_DIR"
  mkdir -p "$HOME_CLAUDE_DIR"
fi

echo ""
echo "🔗 Claude設定ファイルのシンボリックリンクを作成..."

# Claude設定ファイル
CLAUDE_FILES=(
  "CLAUDE.md"
  "settings.json"
  "statusline.js"
)

created=0
skipped=0

for file in "${CLAUDE_FILES[@]}"; do
  source_file="$DOTFILES_CLAUDE_DIR/$file"
  target_file="$HOME_CLAUDE_DIR/$file"

  # ソースファイルが存在するかチェック
  if [[ ! -f $source_file ]]; then
    printf "%b\n" "${YELLOW}⚠️  警告:${NC} $file がソースディレクトリに見つかりません"
    continue
  fi

  if [[ -L $target_file ]]; then
    current_target=$(readlink "$target_file")
    if [[ $current_target == "$source_file" ]]; then
      printf "%b\n" "${YELLOW}⏭️  スキップ:${NC} $file (既に正しくリンクされています)"
      ((skipped++))
    else
      printf "%b\n" "${GREEN}🔄 更新:${NC} $file"
      rm "$target_file"
      ln -s "$source_file" "$target_file"
      ((created++))
    fi
  elif [[ -f $target_file ]]; then
    printf "%b\n" "${RED}⚠️  警告:${NC} $file は通常のファイルとして存在します。手動で確認してください。"
  else
    printf "%b\n" "${GREEN}✅ 作成:${NC} $file"
    ln -s "$source_file" "$target_file"
    ((created++))
  fi
done

# フォルダ単位でシンボリックリンクを作成
link_folder() {
  local label="$1"
  local source_dir="$2"
  local target_dir="$3"

  echo ""
  echo "📋 ${label} のシンボリックリンクを作成..."

  if [[ ! -d $source_dir ]]; then
    printf "%b\n" "${YELLOW}⚠️  警告:${NC} $source_dir が見つかりません"
    return
  fi

  if [[ -L $target_dir ]]; then
    current_target=$(readlink "$target_dir")
    if [[ $current_target == "$source_dir" ]]; then
      printf "%b\n" "${YELLOW}⏭️  スキップ:${NC} $label (既に正しくリンクされています)"
    else
      printf "%b\n" "${GREEN}🔄 更新:${NC} $label"
      rm "$target_dir"
      ln -s "$source_dir" "$target_dir"
    fi
  elif [[ -d $target_dir ]]; then
    printf "%b\n" "${RED}⚠️  警告:${NC} $target_dir は通常のディレクトリとして存在します。手動で確認してください。"
  else
    printf "%b\n" "${GREEN}✅ 作成:${NC} $label"
    ln -s "$source_dir" "$target_dir"
  fi
}

link_folder "Commands" "$COMMANDS_SOURCE_DIR" "$COMMANDS_TARGET_DIR"
link_folder "Agents" "$AGENTS_SOURCE_DIR" "$AGENTS_TARGET_DIR"
link_folder "Skills" "$SKILLS_SOURCE_DIR" "$SKILLS_TARGET_DIR"
link_folder "Rules" "$RULES_SOURCE_DIR" "$RULES_TARGET_DIR"

# サマリー表示
echo ""
echo "📊 Claude セットアップ完了:"
echo "   📄 設定ファイル: 新規作成 $created / スキップ $skipped"
echo "   📁 Commands, Agents, Skills, Rules: フォルダ単位でリンク済み"

# ========================================
# Serena セットアップ
# ========================================

echo ""
echo "🔧 Serena のセットアップ..."

DOTFILES_SERENA_DIR="${HOME}/dotfiles/home/.serena"
HOME_SERENA_DIR="${HOME}/.serena"

# .serena ディレクトリが存在しない場合は作成
if [[ ! -d $HOME_SERENA_DIR ]]; then
  printf "%b\n" "${BLUE}📁 ディレクトリを作成:${NC} $HOME_SERENA_DIR"
  mkdir -p "$HOME_SERENA_DIR"
fi

# Serena設定ファイル
SERENA_FILES=(
  "serena_config.yml"
)

serena_created=0
serena_skipped=0

for file in "${SERENA_FILES[@]}"; do
  source_file="$DOTFILES_SERENA_DIR/$file"
  target_file="$HOME_SERENA_DIR/$file"

  if [[ ! -f $source_file ]]; then
    printf "%b\n" "${YELLOW}⚠️  警告:${NC} $file がソースディレクトリに見つかりません"
    continue
  fi

  if [[ -L $target_file ]]; then
    current_target=$(readlink "$target_file")
    if [[ $current_target == "$source_file" ]]; then
      printf "%b\n" "${YELLOW}⏭️  スキップ:${NC} $file (既に正しくリンクされています)"
      ((serena_skipped++))
    else
      printf "%b\n" "${GREEN}🔄 更新:${NC} $file"
      rm "$target_file"
      ln -s "$source_file" "$target_file"
      ((serena_created++))
    fi
  elif [[ -f $target_file ]]; then
    printf "%b\n" "${RED}⚠️  警告:${NC} $file は通常のファイルとして存在します。手動で確認してください。"
  else
    printf "%b\n" "${GREEN}✅ 作成:${NC} $file"
    ln -s "$source_file" "$target_file"
    ((serena_created++))
  fi
done

echo ""
echo "📊 Serena セットアップ完了:"
echo "   📄 設定ファイル: 新規作成 $serena_created / スキップ $serena_skipped"

# ========================================
# sheldon セットアップ
# ========================================

echo ""
echo "🐚 sheldon のセットアップ..."

DOTFILES_SHELDON_DIR="${HOME}/dotfiles/home/config/sheldon"
CONFIG_SHELDON_DIR="${HOME}/.config/sheldon"

# .config ディレクトリが存在しない場合は作成
if [[ ! -d "${HOME}/.config" ]]; then
  printf "%b\n" "${BLUE}📁 ディレクトリを作成:${NC} ${HOME}/.config"
  mkdir -p "${HOME}/.config"
fi

link_folder "sheldon" "$DOTFILES_SHELDON_DIR" "$CONFIG_SHELDON_DIR"

echo ""
echo "✨ 開発ツール設定のセットアップ・同期が完了しました！"
echo "   🤖 Claude (AI開発支援)"
echo "   🔧 Serena (セマンティックコーディング)"
echo "   🐚 sheldon (zshプラグインマネージャー)"
echo ""
echo "💡 このスクリプトは .envrc により dotfiles ディレクトリ移動時に自動実行されます"
