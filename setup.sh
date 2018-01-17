echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# CUIツールをインストール\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

curl -L https://github.com/takaaki-kasai/git-foresta/raw/master/git-foresta -o /usr/local/bin/git-foresta && chmod 755 /usr/local/bin/git-foresta


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# HomebrewでCUIツールをインストール\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

echo "\033[0;34m==Homebrewをアップデート＆アップグレード==\033[0;39m"
brew update
brew upgrade

echo "\033[0;34m==anyenvをインストール==\033[0;39m"
git clone https://github.com/riywo/anyenv ~/.anyenv
anyenv install ndenv
anyenv version

mkdir -p $(anyenv root)/plugins
git clone https://github.com/znz/anyenv-update.git $(anyenv root)/plugins/anyenv-update
git clone https://github.com/aereal/anyenv-exec.git $(anyenv root)/plugins/anyenv-exec
git clone https://github.com/znz/anyenv-git.git $(anyenv root)/plugins/anyenv-git
anyenv update

ndenv install v5.12.0
ndenv install v6.12.3
ndenv install v7.10.1
ndenv install v8.9.4
ndenv install v9.3.0
ndenv global v7.7.4
ndenv rehash
node -v
which node

echo "\033[0;34m==pecoをインストール==\033[0;39m"
brew install peco

echo "\033[0;34m==fzfをインストール==\033[0;39m"
brew install fzf

echo "\033[0;34m==各CUIツールをインストール==\033[0;39m"
brew install ag
brew install --with-openssl curl & brew link curl --force
brew install devd
brew install direnv
brew install emojify
brew install --use-clang --HEAD ffmpeg --with-faac --with-fdk-aac --with-ffplay --with-fontconfig --with-freetype --with-frei0r --with-libass --with-libbluray --with-libcaca --with-libquvi --with-libsoxr --with-libvidstab --with-libvorbis --with-libvpx --with-opencore-amr --with-openjpeg --with-openssl --with-opus --with-rtmpdump --with-speex --with-theora --with-tools --with-x265 --enable-libx264 --enable-gpl --enable-libxvid --enable-shared
brew install fpp
brew install ghq
brew install gibo
brew install git
brew install hub
brew install hugo
brew install htop
brew install httpie
brew install ImageMagick
brew install jq
brew install argon/mas/mas
brew install mycli
brew install m-cli
brew install neovim
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
brew cask install font-meslo-lg


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# npmで色々インストール\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

echo "\033[0;34m==インストール==\033[0;39m"
npm install -g npm
npm install -g gulp
npm install -g caniuse-cmd
npm install -g npm-check
npm install -g npm-check-updates
npm install -g fixpack
npm install -g gtop
npm install -g coinmon
npm install -g botkit

echo "\033[0;34m==メンテナンス==\033[0;39m"
npm cache clean
npm update
npm upgrade
npm list -g --depth=0


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
echo "\033[0;31m# Homebrewをメンテナンス\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

brew cleanup
brew doctor
gibo -u
tmux source-file ~/.tmux.conf

