#!/bin/bash

# Claude Commands セットアップ・同期スクリプト
# 初回セットアップと日常的な同期の両方に対応
# .envrcにより、dotfilesディレクトリ移動時に自動実行される

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🤖 Claude Commands のセットアップ・同期を開始します..."

# ディレクトリの定義
DOTFILES_CLAUDE_DIR="${HOME}/dotfiles/home/.claude"
HOME_CLAUDE_DIR="${HOME}/.claude"
COMMANDS_SOURCE_DIR="${DOTFILES_CLAUDE_DIR}/commands"
COMMANDS_TARGET_DIR="${HOME_CLAUDE_DIR}/commands"
AGENTS_SOURCE_DIR="${DOTFILES_CLAUDE_DIR}/agents"
AGENTS_TARGET_DIR="${HOME_CLAUDE_DIR}/agents"
SKILLS_SOURCE_DIR="${DOTFILES_CLAUDE_DIR}/skills"
SKILLS_TARGET_DIR="${HOME_CLAUDE_DIR}/skills"

# .claude ディレクトリが存在しない場合は作成
if [ ! -d "$HOME_CLAUDE_DIR" ]; then
  printf "%b\n" "${BLUE}📁 ディレクトリを作成:${NC} $HOME_CLAUDE_DIR"
  mkdir -p "$HOME_CLAUDE_DIR"
fi

for dir in "$COMMANDS_TARGET_DIR" "$AGENTS_TARGET_DIR" "$SKILLS_TARGET_DIR"; do
  if [ ! -d "$dir" ]; then
    printf "%b\n" "${BLUE}📁 ディレクトリを作成:${NC} $dir"
    mkdir -p "$dir"
  fi
done

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
  if [ ! -f "$source_file" ]; then
    printf "%b\n" "${YELLOW}⚠️  警告:${NC} $file がソースディレクトリに見つかりません"
    continue
  fi

  if [ -L "$target_file" ]; then
    current_target=$(readlink "$target_file")
    if [ "$current_target" = "$source_file" ]; then
      printf "%b\n" "${YELLOW}⏭️  スキップ:${NC} $file (既に正しくリンクされています)"
      ((skipped++))
    else
      printf "%b\n" "${GREEN}🔄 更新:${NC} $file"
      rm "$target_file"
      ln -s "$source_file" "$target_file"
      ((created++))
    fi
  elif [ -f "$target_file" ]; then
    printf "%b\n" "${RED}⚠️  警告:${NC} $file は通常のファイルとして存在します。手動で確認してください。"
  else
    printf "%b\n" "${GREEN}✅ 作成:${NC} $file"
    ln -s "$source_file" "$target_file"
    ((created++))
  fi
done

link_dir() {
  local label="$1"
  local source_dir="$2"
  local target_dir="$3"
  local created_var="$4"
  local skipped_var="$5"
  local create_cnt=0
  local skip_cnt=0

  echo ""
  echo "📋 ${label} のシンボリックリンクを作成..."

  if [ -d "$source_dir" ]; then
    for file in "$source_dir"/*.md; do
      [ -e "$file" ] || continue

      local filename target_link current_target
      filename=$(basename "$file")
      target_link="$target_dir/$filename"

      if [ -L "$target_link" ]; then
        current_target=$(readlink "$target_link")
        if [ "$current_target" = "$file" ]; then
          printf "%b\n" "${YELLOW}⏭️  スキップ:${NC} $filename (既に正しくリンクされています)"
          ((skip_cnt++))
        else
          printf "%b\n" "${GREEN}🔄 更新:${NC} $filename"
          rm "$target_link"
          ln -s "$file" "$target_link"
          ((create_cnt++))
        fi
      elif [ -e "$target_link" ]; then
        printf "%b\n" "${RED}⚠️  警告:${NC} $filename は通常のファイルとして存在します。手動で確認してください。"
      else
        printf "%b\n" "${GREEN}✅ 作成:${NC} $filename"
        ln -s "$file" "$target_link"
        ((create_cnt++))
      fi
    done
  else
    printf "%b\n" "${YELLOW}⚠️  警告:${NC} $source_dir が見つかりません"
  fi

  printf -v "$created_var" "%s" "$create_cnt"
  printf -v "$skipped_var" "%s" "$skip_cnt"
}

commands_created=0
commands_skipped=0
agents_created=0
agents_skipped=0
skills_created=0
skills_skipped=0

link_dir "Commands" "$COMMANDS_SOURCE_DIR" "$COMMANDS_TARGET_DIR" commands_created commands_skipped
link_dir "Agents" "$AGENTS_SOURCE_DIR" "$AGENTS_TARGET_DIR" agents_created agents_skipped
link_dir "Skills" "$SKILLS_SOURCE_DIR" "$SKILLS_TARGET_DIR" skills_created skills_skipped

# サマリー表示
echo ""
echo "📊 Claude セットアップ完了:"
echo "   📄 設定ファイル:"
echo "      ✅ 新規作成: $created"
echo "      ⏭️ スキップ: $skipped"
echo "   📋 Commands:"
echo "      ✅ 新規作成: $commands_created"
echo "      ⏭️ スキップ: $commands_skipped"
echo "   📋 Agents:"
echo "      ✅ 新規作成: $agents_created"
echo "      ⏭️ スキップ: $agents_skipped"
echo "   📋 Skills:"
echo "      ✅ 新規作成: $skills_created"
echo "      ⏭️ スキップ: $skills_skipped"

echo ""
echo "✨ Claude Commands のセットアップ・同期が完了しました！"
echo "💡 このスクリプトは .envrc により dotfiles ディレクトリ移動時に自動実行されます"
