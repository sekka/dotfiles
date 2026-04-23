#!/bin/bash
# PreToolUse:Read|Edit|Write hook: 機密ファイルへのアクセスをブロックする
#
# permissions.deny の静的なグロブでは表現できないパターンを補う第二の防衛線。
# 以下をブロックする:
#   - .p12 / .pfx（秘密鍵を含む証明書ファイル）
#   - .git/ 内部への直接書き込み
#   - ファイルパスに ../ を含むパストラバーサル
#   - シンボリックリンクの解決先が保護対象になっている書き込み
#
# permissions.deny だけでは不十分な理由: 静的グロブはシンボリックリンクや
# 動的なパスパターンを検出できないため、このフックで補完している。

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // .file_path // empty')
tool_name=$(echo "$input" | jq -r '.tool_name // empty')

if [ -z "$file_path" ]; then
  exit 0
fi

is_protected() {
  case "$1" in
  *.p12 | *.pfx) return 0 ;;
  *) return 1 ;;
  esac
}

if is_protected "$file_path"; then
  echo "{\"decision\": \"block\", \"reason\": \"Access to protected file blocked: $file_path\"}" >&2
  exit 2
fi

# .git/ ディレクトリへの書き込みブロック（Read以外）
if [[ $tool_name == "Write" || $tool_name == "Edit" ]]; then
  if [[ $file_path == *"/.git/"* || $file_path == ".git/"* ]]; then
    echo '{"decision": "block", "reason": "Direct write to .git/ directory is blocked for safety."}' >&2
    exit 2
  fi
fi

# パストラバーサル検出
if [[ $file_path == *"../"* ]]; then
  echo '{"decision": "block", "reason": "Path traversal detected: ../ is not allowed."}' >&2
  exit 2
fi

# シンボリックリンク解決後の再チェック（Write/Edit時のみ）
if [[ $tool_name == "Write" || $tool_name == "Edit" ]] && [ -e "$file_path" ]; then
  resolved=$(realpath "$file_path" 2>/dev/null)
  if [ -n "$resolved" ] && [ "$resolved" != "$file_path" ] && is_protected "$resolved"; then
    echo "{\"decision\": \"block\", \"reason\": \"Symlink resolves to protected path: $resolved\"}" >&2
    exit 2
  fi
fi

exit 0
