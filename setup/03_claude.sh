#!/bin/bash

# Claude Commands 初回セットアップスクリプト
# 初回環境構築時のみ実行

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🤖 Claude Commands の初回セットアップを開始します..."

# ディレクトリの定義
DOTFILES_CLAUDE_DIR="${HOME}/dotfiles/.claude"
HOME_CLAUDE_DIR="${HOME}/.claude"
COMMANDS_SOURCE_DIR="${DOTFILES_CLAUDE_DIR}/commands"
COMMANDS_TARGET_DIR="${HOME_CLAUDE_DIR}/commands"

# .claude ディレクトリが存在しない場合は作成
if [ ! -d "$HOME_CLAUDE_DIR" ]; then
  echo -e "${BLUE}📁 ディレクトリを作成:${NC} $HOME_CLAUDE_DIR"
  mkdir -p "$HOME_CLAUDE_DIR"
fi

# commands ディレクトリが存在しない場合は作成
if [ ! -d "$COMMANDS_TARGET_DIR" ]; then
  echo -e "${BLUE}📁 ディレクトリを作成:${NC} $COMMANDS_TARGET_DIR"
  mkdir -p "$COMMANDS_TARGET_DIR"
fi

echo ""
echo "🔗 Claude設定ファイルのシンボリックリンクを作成..."

# Claude設定ファイル
CLAUDE_FILES=(
  "CLAUDE.md"
  "settings.json"
  "settings.local.json"
)

created=0
skipped=0

for file in "${CLAUDE_FILES[@]}"; do
  source_file="$DOTFILES_CLAUDE_DIR/$file"
  target_file="$HOME_CLAUDE_DIR/$file"

  # ソースファイルが存在するかチェック
  if [ ! -f "$source_file" ]; then
    echo -e "${YELLOW}⚠️  警告:${NC} $file がソースディレクトリに見つかりません"
    continue
  fi

  if [ -L "$target_file" ]; then
    current_target=$(readlink "$target_file")
    if [ "$current_target" = "$source_file" ]; then
      echo -e "${YELLOW}⏭️  スキップ:${NC} $file (既に正しくリンクされています)"
      ((skipped++))
    else
      echo -e "${GREEN}🔄 更新:${NC} $file"
      rm "$target_file"
      ln -s "$source_file" "$target_file"
      ((created++))
    fi
  elif [ -f "$target_file" ]; then
    echo -e "${RED}⚠️  警告:${NC} $file は通常のファイルとして存在します。手動で確認してください。"
  else
    echo -e "${GREEN}✅ 作成:${NC} $file"
    ln -s "$source_file" "$target_file"
    ((created++))
  fi
done

echo ""
echo "📋 Claude Commands のシンボリックリンクを作成..."

# commands ディレクトリ内のファイルをリンク
commands_created=0
commands_skipped=0

if [ -d "$COMMANDS_SOURCE_DIR" ]; then
  for file in "$COMMANDS_SOURCE_DIR"/*.md; do
    [ -e "$file" ] || continue

    filename=$(basename "$file")
    target_link="$COMMANDS_TARGET_DIR/$filename"

    if [ -L "$target_link" ]; then
      current_target=$(readlink "$target_link")
      if [ "$current_target" = "$file" ]; then
        echo -e "${YELLOW}⏭️  スキップ:${NC} $filename (既に正しくリンクされています)"
        ((commands_skipped++))
      else
        echo -e "${GREEN}🔄 更新:${NC} $filename"
        rm "$target_link"
        ln -s "$file" "$target_link"
        ((commands_created++))
      fi
    elif [ -e "$target_link" ]; then
      echo -e "${RED}⚠️  警告:${NC} $filename は通常のファイルとして存在します。手動で確認してください。"
    else
      echo -e "${GREEN}✅ 作成:${NC} $filename"
      ln -s "$file" "$target_link"
      ((commands_created++))
    fi
  done
else
  echo -e "${YELLOW}⚠️  警告:${NC} $COMMANDS_SOURCE_DIR が見つかりません"
fi

# サマリー表示
echo ""
echo "📊 Claude セットアップ完了:"
echo "   📄 設定ファイル:"
echo "      ✅ 新規作成: $created"
echo "      ⏭️ スキップ: $skipped"
echo "   📋 Commands:"
echo "      ✅ 新規作成: $commands_created"
echo "      ⏭️ スキップ: $commands_skipped"

echo ""
echo "✨ Claude Commands の初回セットアップが完了しました！"
echo "💡 今後の Commands 同期は scripts/sync-claude-commands.sh を使用してください"
