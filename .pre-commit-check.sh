#!/bin/bash

# commit前のlint/formatチェックスクリプト
# 全てのタスクが成功した場合のみcommitを許可

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 commit前のチェックを実行しています..."

# 各種チェックの実行
tasks=("shell-script-lint" "shell-script-lint-sh" "shell-script-format" "shell-script-format-sh")
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
if [ ${#failed_tasks[@]} -eq 0 ]; then
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
