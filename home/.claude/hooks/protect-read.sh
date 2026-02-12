#!/bin/bash
# 機密ファイル保護hook（Read用）
# Read時に機密ファイルへのアクセスを阻止

# stdin経由でJSONを読み取る
input=$(cat)

# jqでfile_pathを抽出
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
  # ワイルドカード付きパターンの場合は glob パターンとして扱う
  if [[ "$pattern" == *"*"* ]]; then
    if [[ "$file_path" == $pattern ]]; then
      echo "{\"decision\": \"block\", \"reason\": \"Read access to protected file blocked: $file_path. This file contains sensitive information and cannot be read by Claude Code.\"}" >&2
      exit 1
    fi
  else
    # 通常の部分文字列マッチング
    if [[ "$file_path" == *"$pattern"* ]]; then
      echo "{\"decision\": \"block\", \"reason\": \"Read access to protected file blocked: $file_path. This file contains sensitive information and cannot be read by Claude Code.\"}" >&2
      exit 1
    fi
  fi
done

exit 0
