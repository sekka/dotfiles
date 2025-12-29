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

echo "🔗 dotfiles のシンボリックリンクを作成します..."

# ========================================
# ホームディレクトリ配下のdotfiles
# ========================================

echo ""
echo "📁 ホームディレクトリにシンボリックリンクを作成..."

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

created=0
skipped=0

for file in "${DOT_FILES[@]}"; do
  source_file="$HOME/dotfiles/home/$file"
  target_file="$HOME/$file"

  if [[ -L $target_file ]]; then
    # シンボリックリンクの場合、リンク先を確認
    current_target=$(readlink "$target_file")
    if [[ $current_target == "$source_file" ]]; then
      echo -e "${YELLOW}⏭️  スキップ:${NC} $file (既に正しくリンクされています)"
      ((skipped++))
    else
      echo -e "${GREEN}🔄 更新:${NC} $file (リンク先: $current_target → $source_file)"
      rm "$target_file"
      ln -s "$source_file" "$target_file"
      ((created++))
    fi
  elif [[ -e $target_file ]]; then
    # 実体ファイル/ディレクトリの場合
    echo -e "${RED}⚠️  警告:${NC} $file は実体として存在します。手動で確認してください。"
  else
    # 存在しない場合、新規作成
    ln -s "$source_file" "$target_file"
    echo -e "${GREEN}✅ 作成:${NC} $file"
    ((created++))
  fi
done

# ========================================
# .config ディレクトリ配下
# ========================================

echo ""
echo "📁 .config/ ディレクトリにシンボリックリンクを作成..."

# .config ディレクトリが存在しない場合は作成
if [[ ! -d "$HOME/.config" ]]; then
  mkdir -p "$HOME/.config"
  echo -e "${BLUE}📁 ディレクトリを作成:${NC} .config"
fi

CONFIG_DIRS=(
  ghostty
  lazygit
  mise
  sheldon
)

for dirs in "${CONFIG_DIRS[@]}"; do
  source_dir="$HOME/dotfiles/home/config/$dirs"
  target_dir="$HOME/.config/$dirs"

  if [[ -L $target_dir ]]; then
    # シンボリックリンクの場合、リンク先を確認
    current_target=$(readlink "$target_dir")
    if [[ $current_target == "$source_dir" ]]; then
      echo -e "${YELLOW}⏭️  スキップ:${NC} $dirs (既に正しくリンクされています)"
      ((skipped++))
    else
      echo -e "${GREEN}🔄 更新:${NC} $dirs (リンク先: $current_target → $source_dir)"
      rm "$target_dir"
      ln -s "$source_dir" "$target_dir"
      ((created++))
    fi
  elif [[ -e $target_dir ]]; then
    # 実体ディレクトリの場合
    echo -e "${RED}⚠️  警告:${NC} $dirs は実体ディレクトリとして存在します。手動で確認してください。"
  else
    # 存在しない場合、新規作成
    ln -s "$source_dir" "$target_dir"
    echo -e "${GREEN}✅ 作成:${NC} $dirs"
    ((created++))
  fi
done

# ========================================
# Claude 設定
# ========================================

echo ""
echo "🤖 Claude 設定のシンボリックリンクを作成..."

# .claude ディレクトリが存在しない場合は作成
if [[ ! -d "$HOME/.claude" ]]; then
  mkdir -p "$HOME/.claude"
  echo -e "${BLUE}📁 ディレクトリを作成:${NC} .claude"
fi

DOTFILES_CLAUDE_DIR="$HOME/dotfiles/home/.claude"
HOME_CLAUDE_DIR="$HOME/.claude"

# Claude設定ファイル
CLAUDE_FILES=(
  CLAUDE.md
  settings.json
  statusline.ts
)

for file in "${CLAUDE_FILES[@]}"; do
  source_file="$DOTFILES_CLAUDE_DIR/$file"
  target_file="$HOME_CLAUDE_DIR/$file"

  # ソースファイルが存在するかチェック
  if [[ ! -f $source_file ]]; then
    echo -e "${YELLOW}⚠️  警告:${NC} $file がソースディレクトリに見つかりません"
    continue
  fi

  if [[ -L $target_file ]]; then
    current_target=$(readlink "$target_file")
    if [[ $current_target == "$source_file" ]]; then
      echo -e "${YELLOW}⏭️  スキップ:${NC} $file (既に正しくリンクされています)"
      ((skipped++))
    else
      echo -e "${GREEN}🔄 更新:${NC} $file"
      rm "$target_file"
      ln -s "$source_file" "$target_file"
      ((created++))
    fi
  elif [[ -f $target_file ]]; then
    echo -e "${RED}⚠️  警告:${NC} $file は通常のファイルとして存在します。手動で確認してください。"
  else
    echo -e "${GREEN}✅ 作成:${NC} $file"
    ln -s "$source_file" "$target_file"
    ((created++))
  fi
done

# Claudeフォルダ単位でシンボリックリンクを作成
CLAUDE_FOLDERS=(
  "commands:Commands"
  "agents:Agents"
  "skills:Skills"
  "rules:Rules"
)

for folder_pair in "${CLAUDE_FOLDERS[@]}"; do
  folder="${folder_pair%%:*}"
  label="${folder_pair##*:}"
  source_dir="$DOTFILES_CLAUDE_DIR/$folder"
  target_dir="$HOME_CLAUDE_DIR/$folder"

  if [[ ! -d $source_dir ]]; then
    echo -e "${YELLOW}⚠️  警告:${NC} $source_dir が見つかりません"
    continue
  fi

  if [[ -L $target_dir ]]; then
    current_target=$(readlink "$target_dir")
    if [[ $current_target == "$source_dir" ]]; then
      echo -e "${YELLOW}⏭️  スキップ:${NC} $label (既に正しくリンクされています)"
      ((skipped++))
    else
      echo -e "${GREEN}🔄 更新:${NC} $label"
      rm "$target_dir"
      ln -s "$source_dir" "$target_dir"
      ((created++))
    fi
  elif [[ -d $target_dir ]]; then
    echo -e "${RED}⚠️  警告:${NC} $target_dir は通常のディレクトリとして存在します。手動で確認してください。"
  else
    echo -e "${GREEN}✅ 作成:${NC} $label"
    ln -s "$source_dir" "$target_dir"
    ((created++))
  fi
done

# ========================================
# Serena 設定
# ========================================

echo ""
echo "🔧 Serena 設定のシンボリックリンクを作成..."

# .serena ディレクトリが存在しない場合は作成
if [[ ! -d "$HOME/.serena" ]]; then
  mkdir -p "$HOME/.serena"
  echo -e "${BLUE}📁 ディレクトリを作成:${NC} .serena"
fi

DOTFILES_SERENA_DIR="$HOME/dotfiles/home/.serena"
HOME_SERENA_DIR="$HOME/.serena"

# Serena設定ファイル
SERENA_FILES=(
  serena_config.yml
)

for file in "${SERENA_FILES[@]}"; do
  source_file="$DOTFILES_SERENA_DIR/$file"
  target_file="$HOME_SERENA_DIR/$file"

  if [[ ! -f $source_file ]]; then
    echo -e "${YELLOW}⚠️  警告:${NC} $file がソースディレクトリに見つかりません"
    continue
  fi

  if [[ -L $target_file ]]; then
    current_target=$(readlink "$target_file")
    if [[ $current_target == "$source_file" ]]; then
      echo -e "${YELLOW}⏭️  スキップ:${NC} $file (既に正しくリンクされています)"
      ((skipped++))
    else
      echo -e "${GREEN}🔄 更新:${NC} $file"
      rm "$target_file"
      ln -s "$source_file" "$target_file"
      ((created++))
    fi
  elif [[ -f $target_file ]]; then
    echo -e "${RED}⚠️  警告:${NC} $file は通常のファイルとして存在します。手動で確認してください。"
  else
    echo -e "${GREEN}✅ 作成:${NC} $file"
    ln -s "$source_file" "$target_file"
    ((created++))
  fi
done

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
echo ""
echo "💡 今後の設定変更は dotfiles/ ディレクトリで行ってください"
