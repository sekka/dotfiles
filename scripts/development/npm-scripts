#!/usr/bin/env bash
# --------------------------------------
# npm-scripts
# --------------------------------------
# package.jsonのscriptsセクションからスクリプト名を一覧表示する
#
# Usage:
#   npm-scripts              # カレントディレクトリのpackage.jsonを読む
#   npm run $(npm-scripts | fzf)  # fzfで選択して実行

set -euo pipefail

if [[ ! -f package.json ]]; then
    echo "Error: package.json not found in current directory" >&2
    exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
    echo "Error: jq is not installed" >&2
    exit 1
fi

jq -r '.scripts | keys[]' package.json
