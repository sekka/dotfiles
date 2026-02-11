#!/bin/sh
pane_id="$1"
[ -z "$pane_id" ] && exit 1

tmp=$(mktemp -t yazi-cwd.XXXXXX)
yazi --cwd-file="$tmp"

if cwd=$(cat -- "$tmp") && [ -n "$cwd" ] && [ "$cwd" != "$PWD" ]; then
  tmux send-keys -t "$pane_id" " cd \"$cwd\"" Enter
fi

rm -f -- "$tmp"
