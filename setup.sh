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
brew install homebrew/boneyard/pyenv-pip-rehash

echo "\033[0;34m==pecoをインストール==\033[0;39m"
brew install peco

echo "\033[0;34m==各CUIツールをインストール==\033[0;39m"
brew install ag
brew install android-platform-tools
brew install --with-openssl curl & brew link curl --force
brew install devd
brew install direnv
brew install --use-clang --HEAD ffmpeg --with-faac --with-fdk-aac --with-ffplay --with-fontconfig --with-freetype --with-frei0r --with-libass --with-libbluray --with-libcaca --with-libquvi --with-libsoxr --with-libvidstab --with-libvorbis --with-libvpx --with-opencore-amr --with-openjpeg --with-openssl --with-opus --with-rtmpdump --with-speex --with-theora --with-tools --with-x265 --enable-libx264 --enable-gpl --enable-libxvid --enable-shared
brew install fpp
brew install ghq
brew install gibo
brew install git
brew install go
brew install hub
brew install hugo
brew install httpie
brew install ImageMagick
brew install jq
brew install nodebrew
brew install argon/mas/mas
brew install mycli
brew install m-cli
brew install openssl & brew link openssl --force
brew install knqyf263/pet/pet
brew install Code-Hex/pget/pget
brew install pt
brew install pstree
brew install reattach-to-user-namespace
brew install redis
brew install tig
brew install tmux
brew install tree
brew install vim
brew install wget
brew install yarn
brew install youtube-dl
brew install zsh


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# zsh環境を整える\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

brew install zplug


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# fontを導入する\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

brew tap caskroom/fonts
brew cask install font-fontawesome
brew cask install font-ricty-diminished
brew cask install font-source-han-code-jp
brew cask install font-fira-code


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# nodeを導入する\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

nodebrew selfupdate
nodebrew install-binary 4.x.x
nodebrew install-binary 5.x.x
nodebrew install-binary 6.x.x
nodebrew install-binary 7.x.x
nodebrew install-binary stable
nodebrew install-binary latest
nodebrew ls-all
nodebrew use 6.x.x


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# npmで色々インストール\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

echo "\033[0;34m==インストール==\033[0;39m"
npm install -g npm
npm install -g yarn
npm install -g gulp
npm install -g caniuse-cmd
npm install -g npm-check
npm install -g npm-check-updates
npm install -g yo
npm install -g coffee-script
npm install -g generator-hubot
npm install -g grunt-cli
npm install -g bower
npm install -g fixpack

echo "\033[0;34m==メンテナンス==\033[0;39m"
npm cache clean
npm update
npm upgrade
npm list -g --depth=0


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# Rubyを導入する\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

echo "\033[0;34m==最新版を確認==\033[0;39m"
brew upgrade ruby-build --HEAD

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
#pyenv install -s 3.4.3
#pyenv versions

echo "\033[0;34m==グローバルで使用するバージョンを設定してリンク更新==\033[0;39m"
#pyenv global 3.4.3
#pyenv rehash
#python -V
#pip -V
#pyenv which python

echo "\033[0;34m==必須のパッケージをインストール==\033[0;39m"
#pip install virtualenv


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# Dockerを導入する\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

docker version
docker-machine version
docker-compose version
docker images
docker ps -a


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# Goで色々インストール\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

go get -u github.com/davecheney/httpstat


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# Homebrewをメンテナンス\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

brew cleanup
brew doctor
gibo -u
tmux source-file ~/.tmux.conf

