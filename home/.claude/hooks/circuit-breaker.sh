#!/bin/bash
# Circuit breaker PostToolUse hook
# Tracks consecutive Bash failures and warns Claude after 3 in a row.
# After warning, resets counter to encourage a fresh approach.

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
