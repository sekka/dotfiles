#!/usr/bin/env bash
# Stop hook: Claude Code 終了時にコミット漏れを警告する
#
# Stop イベントで起動し、git status を確認してコミットされていない変更があれば警告を出す。
# 狙い: セッションを閉じる前にコミットを促し、作業中の変更を失うのを防ぐ。

# Read stdin to avoid hook hanging
read -r -d '' _ </dev/stdin 2>/dev/null || true

changes=$(git status --porcelain 2>/dev/null)

if [[ -n $changes ]]; then
  echo "⚠️ Uncommitted changes detected:"
  echo "$changes"
fi

exit 0
