# Brewfileからパッケージをインストール
echo "# ======================================================================================="
echo "# brew bundle --file=setup/Brewfile"
brew bundle --file="$(dirname "$0")/Brewfile"

echo "# ======================================================================================="
echo "# brew outdated"
brew outdated

echo "# ======================================================================================="
echo "# brew update"
brew update

echo "# ======================================================================================="
echo "# brew upgrade"
brew upgrade

#echo "# ======================================================================================="
#echo "# brew upgrade --cask --greedy"
#brew upgrade --cask --greedy

echo "# ======================================================================================="
echo "# brew cleanup"
brew cleanup

echo "# ======================================================================================="
echo "# brew doctor"
brew doctor

echo "# ======================================================================================="
echo "# brew autoremove"
brew autoremove

#echo "# ======================================================================================="
#echo "# gibo update"
#gibo update

echo "# ======================================================================================="
echo "# copy cot"
if [ ! -f /usr/local/bin/cot ]; then
  echo "Copying Cot..."
  sudo ln -s /Applications/CotEditor.app/Contents/SharedSupport/bin/cot /usr/local/bin/cot
else
  echo "Cot already installed."
fi
