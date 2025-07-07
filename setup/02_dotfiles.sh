#!/bin/bash

# dotfiles シンボリックリンク作成スクリプト
# 初回環境構築時のみ実行

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔗 dotfiles のシンボリックリンクを作成します..."

# ホームディレクトリにシンボリックリンクを貼るファイル
DOT_FILES=(
  .gitconfig
  .gitignore_global
  .tmux.conf
  .vimrc
  .zprofile
  .zshenv
  .zshrc
)

echo ""
echo "📁 ホームディレクトリにシンボリックリンクを作成..."

created=0
skipped=0

for file in "${DOT_FILES[@]}"; do
  if [ -a "$HOME/$file" ]; then
    echo -e "${YELLOW}⏭️  スキップ:${NC} $file (既に存在)"
    ((skipped++))
  else
    ln -s "$HOME/dotfiles/$file" "$HOME/$file"
    echo -e "${GREEN}✅ 作成:${NC} $file"
    ((created++))
  fi
done

echo ""
echo "📁 .config/ ディレクトリにシンボリックリンクを作成..."

CONFIG_DIRS=(
  mise
  zellij
)

# .config ディレクトリが存在しない場合は作成
if [ ! -d "$HOME/.config" ]; then
  mkdir -p "$HOME/.config"
  echo "📁 .config ディレクトリを作成しました"
fi

for dirs in "${CONFIG_DIRS[@]}"; do
  if [ -a "$HOME/.config/$dirs" ]; then
    echo -e "${YELLOW}⏭️  スキップ:${NC} $dirs (既に存在)"
    ((skipped++))
  else
    ln -s "$HOME/dotfiles/config/$dirs" "$HOME/.config/$dirs"
    echo -e "${GREEN}✅ 作成:${NC} $dirs"
    ((created++))
  fi
done

# サマリー表示
echo ""
echo "📊 シンボリックリンク作成完了:"
echo "   ✅ 新規作成: $created"
echo "   ⏭️ スキップ: $skipped"

echo ""
echo "✨ dotfiles のセットアップが完了しました！"
echo "💡 今後の設定変更は dotfiles/ ディレクトリで行ってください"

