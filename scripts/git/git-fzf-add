#!/usr/bin/env bash
# --------------------------------------
# git-fzf-add
# --------------------------------------
# Gitの変更ファイルをfzfで選択してステージングする
#
# Usage:
#   git-fzf-add
#
# Keys:
#   Tab     - 複数選択
#   Ctrl+D  - 選択ファイルのdiffを表示

set -euo pipefail

# gitリポジトリ内かチェック
if ! git rev-parse --git-dir >/dev/null 2>&1; then
    echo "Not a git repository" >&2
    exit 1
fi

# NUL区切りで安全にファイル名を処理（スペース・改行対応）
files=$(git diff -z --name-only --diff-filter=ACMRU | fzf \
    --read0 \
    --print0 \
    --multi \
    --preview "git diff --color=always {} 2>/dev/null || cat {}" \
    --preview-window=right:60%:wrap \
    --header "Select files to add (Tab: multi-select, Ctrl-d: diff)" \
    --bind "ctrl-d:execute(git diff --color=always {} | less -R)"
) || exit 0

if [[ -n "$files" ]]; then
    echo "$files" | xargs -0 git add
    echo "Added files:"
    echo "$files" | tr '\0' '\n'
fi
