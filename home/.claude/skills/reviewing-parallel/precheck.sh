#!/usr/bin/env bash
# precheck.sh — reviewing-parallel 前提条件チェック
# Usage: bash ~/.claude/skills/reviewing-parallel/precheck.sh
# Exit: 0 = OK (at least 1 reviewer available), 1 = fatal error
# Stdout: available reviewer names (one per line)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUTH_CHECK="$HOME/.claude/lib/check-ai-auth.sh"

available_reviewers=()

# 1. Python 3.8+ check
echo "🔍 Python環境を確認中..." >&2
if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ Python 3 が見つかりません。parallel-review-merge.py に必要です。" >&2
  exit 1
fi

python_version=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
python_major=$(echo "$python_version" | cut -d. -f1)
python_minor=$(echo "$python_version" | cut -d. -f2)

if [[ $python_major -lt 3 ]] || { [[ $python_major -eq 3 ]] && [[ $python_minor -lt 8 ]]; }; then
  echo "❌ Python 3.8+ が必要です（現在: $python_version）" >&2
  exit 1
fi
echo "✅ Python $python_version" >&2

# 2. Codex check
echo "🔍 Codex を確認中..." >&2
if "$AUTH_CHECK" codex 2>/dev/null; then
  available_reviewers+=("codex")
  echo "✅ Codex: 利用可能" >&2
else
  echo "⚠️  Codex: 利用不可（スキップ）" >&2
fi

# 3. Gemini check
echo "🔍 Gemini を確認中..." >&2
if "$AUTH_CHECK" gemini 2>/dev/null; then
  available_reviewers+=("gemini")
  echo "✅ Gemini: 利用可能" >&2
else
  echo "⚠️  Gemini: 利用不可（スキップ）" >&2
fi

# 4. At least one reviewer required
if [[ ${#available_reviewers[@]} -eq 0 ]]; then
  echo "" >&2
  echo "❌ 利用可能なレビュアーがありません。" >&2
  echo "   少なくとも1つのAI（Codex または Gemini）の認証が必要です。" >&2
  echo "   詳細: bash ~/.claude/lib/check-ai-auth.sh codex" >&2
  echo "         bash ~/.claude/lib/check-ai-auth.sh gemini" >&2
  exit 1
fi

# 5. Summary
echo "" >&2
echo "📋 利用可能なレビュアー: ${available_reviewers[*]} (${#available_reviewers[@]}/2)" >&2

# Output to stdout (for downstream consumption)
for reviewer in "${available_reviewers[@]}"; do
  echo "$reviewer"
done
