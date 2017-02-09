echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# Homebrew CaskでGUIツールをインストール\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

echo "\033[0;34m==Vagrantをインストール==\033[0;39m"
brew cask install vagrant
brew cask install vagrant-manager
##brew cask install chefdk

echo "\033[0;34m==Dockerをインストール==\033[0;39m"
brew cask install dockertoolbox
##brew cask install docker

echo "\033[0;34m==各GUIツールをインストール==\033[0;39m"
brew cask install 0xed
brew cask install adobe-creative-cloud
brew cask install alfred
brew cask install appcleaner
brew cask install arduino
##brew cask install atom
##brew cask install androidtool
brew cask install blender
##brew cask install blisk
##brew cask install cactus
##brew cask install ccleaner
brew cask install charles
brew cask install chatwork
##brew cask install coccinellida
##brew cask install coteditor
brew cask install cmd-eikana
##brew cask install cookie
brew cask install cooviewer
brew cask install couleurs
brew cask install dash
brew cask install discord
brew cask install dropbox
brew cask install droplr
brew cask install electrum
brew cask install firefox
brew cask install fontexplorer-x-pro
##brew cask install franz
##brew cask install github-desktop
brew cask install glyphs
brew cask install google-chrome
brew cask install google-nik-collection
brew cask install gyazo
##brew cask install heroku-toolbelt
brew cask install hyper
brew cask install iconjar
brew cask install imagealpha
brew cask install imageoptim
brew cask install intellij-idea
brew cask install iterm2
brew cask install ksdiff
brew cask install keyboard-maestro
##brew cask install limechat
brew cask install night-owl
##brew cask install numi
##brew cask install mplayerx
brew cask install onyx
brew cask install openframeworks
brew cask install origami
brew cask install paw
##brew cask install pingendo
##brew cask install pixate-studio
brew cask install pngyu
brew cask install processing
brew cask install psequel
brew cask install p5
brew cask install qlcolorcode qlstephen qlmarkdown quicklook-json qlprettypatch quicklook-csv betterzipql qlimagesize webpquicklook suspicious-package
brew cask install quicktime-player7
brew cask install reggy
brew cask install rightfont
brew cask install safari-technology-preview
brew cask install sequel-pro
brew cask install shupapan
brew cask install sketch
brew cask install sketch-tool
brew cask install skyfonts
brew cask install skype
brew cask install slack
brew cask install spotify
##brew cask install soundnode
brew cask install sourcetree
breq cask install spotify
##brew cask install caskroom/versions/sublime-text3
brew cask install transmit
brew cask install the-unarchiver
brew cask install vlc
brew cask install visual-studio-code
brew cask install vivaldi
brew cask install wordpresscom
brew cask install xld
brew cask install xquartz

echo "\033[0;34m==メンテナンス==\033[0;39m"
brew cask cleanup
brew cask doctor
