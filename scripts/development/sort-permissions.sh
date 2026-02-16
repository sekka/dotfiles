#!/usr/bin/env bash
# Sort permissions in .claude/settings.local.json files
# Reduces 259-line TypeScript to ~40 lines bash/jq

set -euo pipefail

file_path=""

# Parse command line arguments or read from stdin
if [[ $# -gt 0 && $1 == "--file" ]]; then
  file_path="$2"
elif [[ $# -gt 0 && $1 == --file=* ]]; then
  file_path="${1#--file=}"
elif [[ ! -t 0 ]]; then
  # Try to read from stdin (hook input)
  input=$(cat 2>/dev/null || echo "")
  if [[ -n $input ]]; then
    file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")
  fi
fi

# Skip if no file path
if [[ -z $file_path ]]; then
  exit 0
fi

# Validate that the file is .claude/settings.json or .claude/settings.local.json
if ! [[ $file_path =~ \.claude/settings(\.local)?\.json$ ]]; then
  exit 0 # Not a target file, skip silently
fi

# Check if file exists
if [[ ! -f $file_path ]]; then
  exit 0
fi

# Create temp file for comparison
temp_file=$(mktemp)
trap 'rm -f -- "$temp_file"' EXIT

# Sort permissions using jq (use >| to override noclobber)
# Only sort arrays that exist (skip if null/missing)
if ! jq '
  .permissions.allow |= sort |
  if .permissions.deny then .permissions.deny |= sort else . end |
  if .permissions.ask then .permissions.ask |= sort else . end
' "$file_path" >|"$temp_file" 2>/dev/null; then
  exit 1
fi

# Only write if changed
if ! diff -q "$file_path" "$temp_file" >/dev/null 2>&1; then
  # Use 'command mv' to bypass alias and -f to force overwrite
  if ! command mv -f "$temp_file" "$file_path" 2>/dev/null; then
    echo "✗ Failed to update $file_path" >&2
    exit 1
  fi
  echo "✓ Sorted permissions in $file_path"
else
  echo "✓ Already sorted: $file_path"
fi

exit 0
