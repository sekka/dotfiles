#!/bin/bash
# 機密ファイル保護hook
# 機密ファイルへのアクセスを阻止（Read/Edit/Write）

# stdin経由でJSONを読み取る
input=$(cat)

# jqでfile_pathを抽出（tool_inputまたはfile_pathのいずれかから）
file_path=$(echo "$input" | jq -r '.tool_input.file_path // .file_path // empty')

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
  if [[ "$pattern" == *"*"* ]] || [[ "$pattern" == *"?"* ]]; then
    case "$file_path" in
      $pattern)
        echo "{\"decision\": \"block\", \"reason\": \"Access to protected file blocked: $file_path. This file contains sensitive information.\"}" >&2
        exit 1
        ;;
    esac
  else
    # リテラル部分文字列マッチング
    if [[ "$file_path" == *"$pattern"* ]]; then
      echo "{\"decision\": \"block\", \"reason\": \"Access to protected file blocked: $file_path. This file contains sensitive information.\"}" >&2
      exit 1
    fi
  fi
done

exit 0
