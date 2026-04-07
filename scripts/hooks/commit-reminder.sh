#!/usr/bin/env bash

# Read stdin to avoid hook hanging
read -r -d '' _ </dev/stdin 2>/dev/null || true

changes=$(git status --porcelain 2>/dev/null)

if [[ -n $changes ]]; then
  echo "⚠️ Uncommitted changes detected:"
  echo "$changes"
fi

exit 0
