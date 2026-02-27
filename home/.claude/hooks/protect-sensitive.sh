#!/bin/bash
# 機密ファイル保護hook
# 機密ファイルへのアクセスを阻止（Read/Edit/Write）

# stdin経由でJSONを読み取る
input=$(cat)

# jqでfile_pathとtool_nameを抽出
file_path=$(echo "$input" | jq -r '.tool_input.file_path // .file_path // empty')
tool_name=$(echo "$input" | jq -r '.tool_name // empty')

# ファイルパスが空の場合は何もしない
if [ -z "$file_path" ]; then
  exit 0
fi

# 保護対象パターン
PROTECTED_PATTERNS=(
  ".env"
  ".env."
  "secrets/"
  "*.pem"
  "*.key"
  "id_rsa"
  "id_ed25519"
  "*.p12"
  "*.pfx"
)

# パターンマッチング
for pattern in "${PROTECTED_PATTERNS[@]}"; do
  # Glob パターンマッチング（*や?を含む場合）
  if [[ $pattern == *"*"* ]] || [[ $pattern == *"?"* ]]; then
    case "$file_path" in
    $pattern)
      echo "{\"decision\": \"block\", \"reason\": \"Access to protected file blocked: $file_path. This file contains sensitive information.\"}" >&2
      exit 1
      ;;
    esac
  else
    # リテラル部分文字列マッチング
    if [[ $file_path == *"$pattern"* ]]; then
      echo "{\"decision\": \"block\", \"reason\": \"Access to protected file blocked: $file_path. This file contains sensitive information.\"}" >&2
      exit 1
    fi
  fi
done

# === 追加チェック ===

# 1. .git/ ディレクトリへの書き込みブロック（Read以外）
if [[ $tool_name == "Write" || $tool_name == "Edit" ]]; then
  if [[ $file_path == *"/.git/"* || $file_path == ".git/"* ]]; then
    echo '{"decision": "block", "reason": "Direct write to .git/ directory is blocked for safety."}' >&2
    exit 1
  fi
fi

# 2. パストラバーサル検出
if [[ $file_path == *"../"* ]]; then
  echo '{"decision": "block", "reason": "Path traversal detected: ../ is not allowed."}' >&2
  exit 1
fi

# 3. シンボリックリンク解決後の再チェック（Write/Edit時のみ）
if [[ $tool_name == "Write" || $tool_name == "Edit" ]] && [ -e "$file_path" ]; then
  resolved=$(realpath "$file_path" 2>/dev/null)
  if [ -n "$resolved" ] && [ "$resolved" != "$file_path" ]; then
    for pattern in "${PROTECTED_PATTERNS[@]}"; do
      if [[ $pattern == *"*"* ]] || [[ $pattern == *"?"* ]]; then
        case "$resolved" in $pattern)
          echo "{\"decision\": \"block\", \"reason\": \"Symlink resolves to protected path: $resolved\"}" >&2
          exit 1
          ;;
        esac
      else
        if [[ $resolved == *"$pattern"* ]]; then
          echo "{\"decision\": \"block\", \"reason\": \"Symlink resolves to protected path: $resolved\"}" >&2
          exit 1
        fi
      fi
    done
  fi
fi

exit 0
