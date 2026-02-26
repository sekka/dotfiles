#!/bin/bash
# macOS開発環境の基礎セットアップスクリプト
# Xcode Command Line Tools、Homebrew、zshの初期導入を行います
# 参考: https://qiita.com/ko1nksm/items/e73e343f609c071e6a8c

# set -e
cd ~ || exit

# Install Xcode and the Xcode Command Line Tools
sudo xcode-select --install

# Agree to Xcode license
sudo xcodebuild -license

# Install the Rosetta2
softwareupdate --install-rosetta

echo "# ======================================================================================="
echo "# Homebrewを導入する"

if [[ ! -f /opt/homebrew/bin/brew ]]; then
  echo "Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
else
  echo "Homebrew already installed."
fi

echo "# brew doctor"
brew doctor
# echo insecure >> ~/.curlrc

echo "# ======================================================================================="
echo "# zshを導入する"

brew install zsh

WHICH_ZSH="$(which zsh)"
echo "$WHICH_ZSH"

echo "# zshをshellリストに追加する"
if ! grep -qF "$WHICH_ZSH" /etc/shells; then
  echo "Adding zsh..."
  # /etc/shells の末尾に /opt/homebrew/bin/zsh を追記
  sudo sh -c 'echo $(which zsh) >> /etc/shells'
else
  echo "zsh already added."
fi

echo "# デフォルトシェルをzshに変更する"
if [[ $SHELL != "$WHICH_ZSH" ]]; then
  echo "Changing default Shell..."
  chsh -s "$WHICH_ZSH"
else
  echo "zsh already default shell."
fi

echo "# ======================================================================================="
echo "# SHELLの再起動"

exec "$SHELL" -l
