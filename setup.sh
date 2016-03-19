echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# HomebrewでCUIツールをインストール\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

echo "\033[0;34m==Homebrewをアップデート＆アップグレード==\033[0;39m"
brew update
brew upgrade

echo "\033[0;34m==Ruby環境をインストール==\033[0;39m"
brew install rbenv
brew install ruby-build

echo "\033[0;34m==Python環境をインストール==\033[0;39m"
brew install pyenv
#brew install pyenv-virtualenv
brew install homebrew/boneyard/pyenv-pip-rehash

echo "\033[0;34m==pecoをインストール==\033[0;39m"
brew tap peco/peco
brew install peco

echo "\033[0;34m==各CUIツールをインストール==\033[0;39m"
brew install ag
brew install android-platform-tools
brew install curl
brew install devd
brew install direnv
brew install ffmpeg
brew install fpp
brew install ghq
brew install gibo
brew install git
brew install go
brew install hub
brew install hugo
brew install httpie
brew install node
brew install --with-bundle --HEAD mpv
brew install mycli
brew install pt
brew install pstree
brew install reattach-to-user-namespace
brew install redis
brew install tig
brew install tmux
brew install tree
brew install vim
brew install wget
brew install xhyve
brew install youtube-dl
brew install zsh


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# Homebrew CaskでGUIツールをインストール\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

echo "\033[0;34m==brew caskを導入==\033[0;39m"
brew tap caskroom/cask
brew cask update

echo "\033[0;34m==Vagrantをインストール==\033[0;39m"
brew cask install vagrant
brew cask install vagrant-manager
brew cask install chefdk

echo "\033[0;34m==Dockerをインストール==\033[0;39m"
brew tap homebrew/binary
brew cask install dockertoolbox

echo "\033[0;34m==各GUIツールをインストール==\033[0;39m"
brew cask install alfred
brew cask install appcleaner
brew cask install atom
brew cask install androidtool
brew cask install blender
##brew cask install cactus
brew cask install ccleaner
brew cask install charles
##brew cask install coccinellida
brew cask install coteditor
brew cask install cookie
brew cask install couleurs
brew cask install dropbox
brew cask install droplr
brew cask install fontexplorer-x-pro
##brew cask install github-desktop
brew cask install glyphs
brew cask install gyazo
brew cask install heroku-toolbelt
brew cask install iconjar
brew cask install imagealpha
brew cask install imageoptim
brew cask install intellij-idea
brew cask install iterm2
brew cask install ksdiff
##brew cask install limechat
brew cask install night-owl
##brew cask install numi
brew cask install mplayerx
brew cask install onyx
##brew cask install pingendo
brew cask install pixate-studio
brew cask install pngyu
brew cask install processing
brew cask install psequel
brew cask install p5
brew cask install quicktime-player7
brew cask install reggy
brew cask install rightfont
brew cask install sequel-pro
brew cask install shupapan
brew cask install sketch
brew cask install sketch-tool
brew cask install skype
brew cask install slack
##brew cask install soundnode
brew cask install sourcetree
##brew cask install caskroom/versions/sublime-text3
brew cask install transmit
brew cask install the-unarchiver
brew cask install vlc
brew cask install visual-studio-code
brew cask install wordpresscom
brew cask install xld
brew cask install xquartz

##echo "\033[0;34m==Alfredの検索対象にいれる==\033[0;39m"
##brew cask alfred link

echo "\033[0;34m==メンテナンス==\033[0;39m"
brew cask cleanup
brew cask doctor


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# npmで色々インストール\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

echo "\033[0;34m==インストール==\033[0;39m"
npm install -g npm
npm install -g tmux-cpu
npm install -g tmux-mem
npm install -g gulp
npm install -g caniuse-cmd
npm install -g npm-check-updates
npm install -g yo
npm install -g coffee-script
npm install -g generator-hubot
npm install -g grunt-cli
npm install -g bower

echo "\033[0;34m==メンテナンス==\033[0;39m"
npm cache clean
npm update
npm upgrade


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# Rubyを導入する\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

echo "\033[0;34m==最新版を確認==\033[0;39m"
brew upgrade ruby-build --HEAD
#rbenv install -l

echo "\033[0;34m==インストール==\033[0;39m"
rbenv install -s 2.2.2
rbenv versions

echo "\033[0;34m==グローバルで使用するバージョンを設定してリンク更新==\033[0;39m"
rbenv global 2.2.2
rbenv rehash
ruby -v
rbenv which ruby
rbenv which gem

echo "\033[0;34m==必須のgemをインストール==\033[0;39m"
gem update --system
gem install bundler
gem install rbenv-rehash
gem update


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# Pythonを導入する\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

# 最新版を確認
#pyenv install -l

echo "\033[0;34m==インストール==\033[0;39m"
pyenv install -s 3.4.3
pyenv versions

echo "\033[0;34m==グローバルで使用するバージョンを設定してリンク更新==\033[0;39m"
pyenv global 3.4.3
pyenv rehash
python -V
pip -V
pyenv which python

echo "\033[0;34m==必須のパッケージをインストール==\033[0;39m"
pip install virtualenv


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# Dockerを導入する\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

##echo "\033[0;34m==Dockor Machineで仮想マシンを作成する==\033[0;39m"
##docker-machine create --driver virtualbox default
#docker-machine upgrade default

##echo "\033[0;34m==作成した仮想マシンをリストアップする==\033[0;39m"
##docker-machine ls

##echo "\033[0;34m==作成した仮想マシンを起動する==\033[0;39m"
##docker-machine start default

##echo "\033[0;34m==起動した仮想マシンのIPアドレスを確認する==\033[0;39m"
##docker-machine ip default

##echo "\033[0;34m==起動した仮想マシンの各種環境変数を確認する==\033[0;39m"
##docker-machine env default

##echo "\033[0;34m==envコマンドで得られる環境変数をexport==\033[0;39m"
##eval "$(docker-machine env default)"

docker version
##docker images
##docker ps -a

echo "\033[0;34m==関連ツールをインストール==\033[0;39m"
go get github.com/pottava/docker-webui


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# Homebrewをメンテナンス\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

brew cleanup
brew doctor
gibo -u
