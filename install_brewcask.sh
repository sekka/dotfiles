echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# Homebrew CaskでGUIツールをインストール\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

echo "\033[0;34m==Dockerをインストール==\033[0;39m"
brew cask install docker

echo "\033[0;34m==各GUIツールをインストール==\033[0;39m"
brew cask install 1password
#brew cask install 0xed
brew cask install adobe-creative-cloud
brew cask install alfred
brew cask install appcleaner
#brew cask install background-music
brew cask install blender
brew cask install charles
brew cask install daisydisk
brew cask install dash
brew cask install discord
brew cask install dropbox
brew cask install firefox
brew cask install glyphs
brew cask install google-backup-and-sync
brew cask install google-chrome
#brew cask install google-nik-collection
brew cask install hyperswitch
brew cask install iconjar
brew cask install imagealpha
brew cask install imageoptim
brew cask install iterm2
brew cask install jetbrains-toolbox
brew cask install karabiner-elements
brew cask install ksdiff
brew cask install keyboard-maestro
#brew cask install maczip4win
brew cask install magicalvoxel
brew cask install onyx
brew cask install openframeworks
brew cask install paw
brew cask install pngyu
brew cask install processing
brew cask install p5
brew cask install qlcolorcode qlstephen qlmarkdown quicklook-json qlprettypatch quicklook-csv betterzipql qlimagesize webpquicklook suspicious-package
#brew cask install reggy
brew cask install rightfont
brew cask install skyfonts
#brew cask install skype
brew cask install slack
brew cask install sonic-pi
brew cask install sourcetree
brew cask install spotify
brew cask install steam
brew cask install svgcleaner
brew cask install touchdesigner
brew cask install transmit
brew cask install the-unarchiver
brew cask install unity-hub
#brew cask install unshaky
brew cask install vlc
brew cask install visual-studio-code
brew cask install webponize
brew cask install xld

echo "\033[0;34m==メンテナンス==\033[0;39m"
brew cask cleanup
brew cask doctor
