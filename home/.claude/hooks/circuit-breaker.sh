#!/bin/bash
# PostToolUse:Bash hook: 連続失敗を検知してアプローチ変更を促す
#
# セッションごとに Bash ツールの連続失敗回数を /tmp に記録する。
# 3回連続で失敗すると additionalContext に警告を注入し、
# 同じコマンドを繰り返すのではなく別の方法を試すよう Claude に伝える。
# 成功時、または警告を出した直後にカウンターをリセットする。
#
# 狙い: オプション誤りやツール未インストールなど、同じ原因で
# 失敗し続けるリトライループを断ち切り、トークンの無駄遣いを防ぐ。

input=$(cat)
exit_code=$(echo "$input" | jq -r '.tool_response.exit_code // 0')
session_id=$(echo "$input" | jq -r '.session_id // "default"')

state_file="/tmp/claude-circuit-breaker-${session_id}"

if [ "$exit_code" != "0" ]; then
  # Read current count, default to 0
  count=0
  if [ -f "$state_file" ]; then
    count=$(cat "$state_file")
  fi

  count=$((count + 1))

  if [ "$count" -ge 3 ]; then
    command=$(echo "$input" | jq -r '.tool_input.command // "(unknown)"')
    echo '{"additionalContext": "[circuit-breaker] 3 consecutive Bash failures detected. Consider a different approach instead of retrying the same command."}' >&2
    # Reset so the next attempt starts fresh
    rm -f "$state_file"
  else
    echo "$count" >"$state_file"
  fi
else
  # Success: reset counter
  rm -f "$state_file"
fi

exit 0
