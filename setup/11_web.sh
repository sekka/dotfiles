#!/bin/bash
# Web development tools setup script

gh extension install him0/gh-sync     # https://zenn.dev/him0/articles/b5e555d98e79ee
gh extension install dlvhdr/gh-dash   # https://zenn.dev/yuta28/articles/gh-dash-introduction
gh extension install mislav/gh-branch # https://github.com/mislav/gh-branch

gibo update                           # .gitignoreテンプレートを最新に更新

# CotEditorのシンボリックリンクを作成
COT_SOURCE="/Applications/CotEditor.app/Contents/SharedSupport/bin/cot"
COT_TARGET="/usr/local/bin/cot"

if [[ -f "$COT_SOURCE" ]]; then
  if [[ ! -L "$COT_TARGET" ]]; then
    echo "Creating Cot symlink..."
    sudo ln -s "$COT_SOURCE" "$COT_TARGET"
    echo "Cot symlink created."
  else
    echo "Cot already installed."
  fi
else
  echo "Warning: CotEditor not found at $COT_SOURCE"
fi
