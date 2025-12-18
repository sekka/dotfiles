#!/usr/bin/env bash
# --------------------------------------
# fzf-ssh
# --------------------------------------
# SSH接続先をfzfで選択して接続する
#
# Usage:
#   fzf-ssh

set -euo pipefail

if [[ ! -f ~/.ssh/config ]]; then
    echo "SSH config file not found" >&2
    exit 1
fi

host=$(awk '/^Host / {print $2}' ~/.ssh/config | grep -v '*' | fzf \
    --preview "grep -A 10 '^Host {}' ~/.ssh/config" \
    --preview-window=right:40%:wrap \
    --header "Select SSH host"
) || exit 0

if [[ -n "$host" ]]; then
    exec ssh "$host"
fi
