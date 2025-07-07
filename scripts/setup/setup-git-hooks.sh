#!/bin/bash

# Git hooks セットアップスクリプト
# .githooks/ ディレクトリのhookを.git/hooks/にコピー

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔧 Git hooks をセットアップしています..."

# .git ディレクトリの存在確認
if [ ! -d ".git" ]; then
  echo -e "${RED}❌ .git ディレクトリが見つかりません。Gitリポジトリのルートで実行してください。${NC}"
  exit 1
fi

# .githooks ディレクトリの存在確認
if [ ! -d ".githooks" ]; then
  echo -e "${RED}❌ .githooks ディレクトリが見つかりません。${NC}"
  exit 1
fi

# .git/hooks ディレクトリの作成
mkdir -p .git/hooks

# hooks のコピー
copied=0
for hook in .githooks/*; do
  if [ -f "$hook" ]; then
    hook_name=$(basename "$hook")
    target=".git/hooks/$hook_name"

    cp "$hook" "$target"
    chmod +x "$target"
    echo -e "${GREEN}✅ コピー完了: $hook_name${NC}"
    ((copied++))
  fi
done

echo ""
echo -e "${GREEN}📊 Git hooks セットアップ完了: $copied個のhookがコピーされました${NC}"
echo -e "${YELLOW}💡 これで commit前に自動的にlint/formatチェックが実行されます${NC}"
