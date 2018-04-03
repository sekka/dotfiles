echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# Homebrew CaskでGUIツールをインストール\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

echo "\033[0;34m==Dockerをインストール==\033[0;39m"
brew cask install docker

echo "\033[0;34m==各GUIツールをインストール==\033[0;39m"
brew cask install 0xed
brew cask install adobe-creative-cloud
brew cask install alfred
brew cask install android-studio
brew cask install appcleaner
brew cask install atom
brew cask install blender
brew cask install charles
brew cask install couleurs
brew cask install crunch
brew cask install dash
brew cask install discord
brew cask install dropbox
brew cask install droplr
brew cask install firefox
brew cask install fontexplorer-x-pro
brew cask install glyphs
brew cask install google-backup-and-sync
brew cask install google-chrome
brew cask install caskroom/versions/google-chrome-canary
brew cask install google-nik-collection
brew cask install gyazo
brew cask install imagealpha
brew cask install imageoptim
brew cask install intellij-idea
brew cask install iterm2
brew cask install karabiner-elements
brew cask install ksdiff
brew cask install keyboard-maestro
brew cask install night-owl
brew cask install maczip4win
brew cask install onyx
brew cask install openframeworks
brew cask install origami
brew cask install paw
brew cask install pngyu
brew cask install processing
brew cask install psequel
brew cask install p5
brew cask install qlcolorcode qlstephen qlmarkdown quicklook-json qlprettypatch quicklook-csv betterzipql qlimagesize webpquicklook suspicious-package
brew cask install reggy
brew cask install sequel-pro
brew cask install shupapan
brew cask install sketch
brew cask install skyfonts
brew cask install skype
brew cask install slack
brew cask install sourcetree
breq cask install spotify
brew cask install svgcleaner
brew cask install transmit
brew cask install the-unarchiver
brew cask install vlc
brew cask install visual-studio-code
brew cask install webponize
brew cask install wordpresscom
brew cask install xld
brew cask install xquartz

echo "\033[0;34m==メンテナンス==\033[0;39m"
brew cask cleanup
brew cask doctor
