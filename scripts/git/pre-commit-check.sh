#!/bin/bash
set -euo pipefail

# commit前のlint/formatチェックスクリプト
# 全てのタスクが成功した場合のみcommitを許可

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 commit前のチェックを実行しています..."

# AI署名チェック
echo -e "${YELLOW}▶ AI署名チェック${NC}"
if git diff-index --cached HEAD 2>/dev/null | grep -q "^:"; then
  # ステージされたファイルがある場合
  commit_msg=""

  # COMMIT_EDITMSGファイルがあればそれを確認
  if [[ -n ${GIT_DIR:-} ]] && [[ -f "$GIT_DIR/COMMIT_EDITMSG" ]]; then
    commit_msg=$(cat "$GIT_DIR/COMMIT_EDITMSG")
  fi

  # commit_msgが空の場合、git diff-indexから取得を試みる
  if [[ -z $commit_msg ]]; then
    commit_msg=$(git diff-index --cached --format=%B HEAD 2>/dev/null || echo "")
  fi

  # AI署名パターンをチェック（セキュアな実装）
  # パターンをシングルクォートで囲んでコマンドインジェクション対策
  if [[ -n $commit_msg ]] && echo "$commit_msg" | grep -qE '🤖 Generated with Claude Code|Co-Authored-By: Claude' 2>/dev/null; then
    echo -e "${RED}❌ AI署名チェック 失敗${NC}"
    echo -e "${RED}コミットメッセージにAI署名が含まれています。${NC}"
    echo -e "${RED}以下のパターンは削除してください：${NC}"
    echo -e "${RED}  - 🤖 Generated with Claude Code${NC}"
    echo -e "${RED}  - Co-Authored-By: Claude${NC}"
    echo ""
    exit 1
  fi
fi
echo -e "${GREEN}✅ AI署名チェック 成功${NC}"
echo ""

# 各種チェックの実行（統合スクリプト使用）
tasks=("lint")
failed_tasks=()

for task in "${tasks[@]}"; do
  echo -e "${YELLOW}▶ mise run $task${NC}"
  if mise run "$task"; then
    echo -e "${GREEN}✅ $task 成功${NC}"
  else
    echo -e "${RED}❌ $task 失敗${NC}"
    failed_tasks+=("$task")
  fi
  echo ""
done

# 結果の確認
if [[ ${#failed_tasks[@]} -eq 0 ]]; then
  echo -e "${GREEN}✨ 全てのチェックが成功しました！commitを続行できます。${NC}"
  exit 0
else
  echo -e "${RED}❌ 以下のチェックが失敗しました:${NC}"
  for task in "${failed_tasks[@]}"; do
    echo -e "${RED}  - $task${NC}"
  done
  echo -e "${RED}エラーを修正してからcommitしてください。${NC}"
  exit 1
fi
