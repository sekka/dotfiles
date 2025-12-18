#!/usr/bin/env bash
# --------------------------------------
# git-fzf-show
# --------------------------------------
# Gitコミットログをfzfで閲覧・選択する
#
# Usage:
#   git-fzf-show           # コミット一覧を表示
#   git-fzf-show --all     # 全ブランチのコミットを表示
#
# Keys:
#   Enter   - 選択したコミットの詳細を表示
#   Ctrl+S  - ソート切り替え

set -euo pipefail

git log \
    --graph \
    --color=always \
    --format="%C(auto)%h%d %s %C(black)%C(bold)%cr" "$@" |
fzf --ansi \
    --no-sort \
    --reverse \
    --tiebreak=index \
    --bind=ctrl-s:toggle-sort \
    --bind "ctrl-m:execute:
                (grep -o '[a-f0-9]\{7\}' | head -1 |
                xargs -I % sh -c 'git show --color=always % | less -R') << 'FZF-EOF'
                {}
FZF-EOF"
