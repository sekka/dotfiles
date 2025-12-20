#!/bin/bash
# Web development tools setup script

gh extension install him0/gh-sync     # https://zenn.dev/him0/articles/b5e555d98e79ee
gh extension install dlvhdr/gh-dash   # https://zenn.dev/yuta28/articles/gh-dash-introduction
gh extension install mislav/gh-branch # https://github.com/mislav/gh-branch

gibo update                           # .gitignoreテンプレートを最新に更新

echo "# copy cot"
if [[ ! -f "/usr/local/bin/cot" ]]; then
  echo "Copying Cot..."
  sudo ln -s /Applications/CotEditor.app/Contents/SharedSupport/bin/cot /usr/local/bin/cot
else
  echo "Cot already installed."
fi
