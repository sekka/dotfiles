echo "# =========================================================="
echo "#"
echo "# HomebrewでCUIツールを導入する"
echo "#"
echo "# =========================================================="

brew update
brew upgrade

brew install vim
brew install rbenv
brew install ruby-build
brew install pyenv
#brew install pyenv-virtualenv
brew install homebrew/boneyard/pyenv-pip-rehash
brew install tmux
brew install tree
brew install wget
brew install node
brew install pstree
brew install git
brew install hub
brew install tig
brew install wget
brew install curl
brew install reattach-to-user-namespace
brew install xhyve
brew install hugo
brew install mycli
brew install ffmpeg
brew install youtube-dl


echo "# =========================================================="
echo "#"
echo "# Homebrew CaskでGUIツールを導入する"
echo "#"
echo "# =========================================================="

brew install caskroom/cask/brew-cask
brew tap caskroom/versions
brew cask update

brew cask install alfred
brew cask install appcleaner
brew cask install androidtool
brew cask install blender
brew cask install cactus
brew cask install ccleaner
brew cask install charles
brew cask install coccinellida
brew cask install coteditor
brew cask install cookie
brew cask install couleurs
brew cask install dropbox
brew cask install droplr
brew cask install fontexplorer-x-pro
brew cask install github-desktop
brew cask install glyphs
brew cask install gyazo
brew cask install iconjar
brew cask install imagealpha
brew cask install imageoptim
brew cask install intellij-idea
brew cask install iterm2
brew cask install ksdiff
brew cask install limechat
brew cask install night-owl
brew cask install numi
brew cask install mplayerx
brew cask install onyx
brew cask install pingendo
brew cask install pixate-studio
brew cask install processing
brew cask install psequel
brew cask install p5
brew cask install quicktime-player7
brew cask install reggy
brew cask install rightfont
brew cask install sequel-pro
brew cask install shupapan
brew cask install skype
brew cask install slack
brew cask install sourcetree
brew cask install caskroom/versions/sublime-text3
brew cask install transmit
brew cask install the-unarchiver
brew cask install vlc

# Alfredの検索対象にいれる
brew cask alfred link

brew cask cleanup
brew cask doctor


echo "# =========================================================="
echo "#"
echo "# pecoを導入する"
echo "#"
echo "# =========================================================="

brew tap peco/peco
brew install peco


echo "# =========================================================="
echo "#"
echo "# Rubyを導入する"
echo "#"
echo "# =========================================================="

# 最新版を確認
brew upgrade ruby-build --HEAD
#rbenv install -l

# インストール
rbenv install -s 2.2.2
rbenv versions

# グローバルで使用するバージョンを設定してリンク更新
rbenv global 2.2.2
rbenv rehash
ruby -v
rbenv which ruby
rbenv which gem

# 必須のgemをインストール
gem update --system
gem install bundler
gem install rbenv-rehash
gem update 


echo "# =========================================================="
echo "#"
echo "# Pythonを導入する"
echo "#"
echo "# =========================================================="

# 最新版を確認
#pyenv install -l

# インストール
pyenv install -s 3.4.3
pyenv versions

# グローバルで使用するバージョンを設定してリンク更新
pyenv global 3.4.3
pyenv rehash
python -V
pip -V
pyenv which python

# 必須のパッケージをインストール
pip install virtualenv


echo "# =========================================================="
echo "#"
echo "# rainbowstreamを導入する"
echo "#"
echo "# =========================================================="

#cd ~
#mkdir .rainbowstream
#virtualenv venv
#source venv/bin/activate
#pip install rainbowstream
#rainbowstream
#deactivate
pip install rainbowstream

RAINBOW_CONFIG=(.rainbow_config.json)

for file in ${RAINBOW_CONFIG[@]}

do
	if [ -a $HOME/$file ]; then
			echo "ファイルが存在するのでシンボリックリンクを貼りませんでした: $file"
	else
		ln -s $HOME/dotfiles/$file $HOME/$file
			echo "シンボリックリンクを貼りました: $file"
	fi
done


echo "# =========================================================="
echo "#"
echo "# Dockerを導入する"
echo "#"
echo "# =========================================================="

brew tap homebrew/binary
brew cask install dockertoolbox
docker-machine create --driver virtualbox default
#docker-machine upgrade default
docker-machine ls
docker-machine start default
docker-machine ip default
docker version
docker images
docker ps -a


echo "# =========================================================="
echo "#"
echo "# Vagrantを導入する"
echo "#"
echo "# =========================================================="

brew cask install vagrant
brew cask install vagrant-manager
brew cask install chefdk


echo "# =========================================================="
echo "#"
echo "# Homebrewをメンテナンス"
echo "#"
echo "# =========================================================="

brew cleanup
brew doctor


echo "# =========================================================="
echo "#"
echo "# npmで色々導入する"
echo "#"
echo "# =========================================================="

npm install -g tmux-cpu
npm install -g tmux-mem
npm install -g electron-packager
npm install -g electron-prebuild
npm install -g gulp
npm install -g caniuse-cmd
npm install -g npm-check-updates


echo "# =========================================================="
echo "#"
echo "# Sublime Text 3を設定する"
echo "#"
echo "# =========================================================="

# 設定ファイルにシンボリックリンクを貼る
SETTING_FILES=("Package Control.sublime-settings" Preferences.sublime-settings)

for file in "${SETTING_FILES[@]}"

do
	if [ -a $HOME/Library/Application\ Support/Sublime\ Text\ 3/Packages/User/"$file" ]; then
		echo "ファイルが存在するのでシンボリックリンクを貼りませんでした: $file"
	else
		ln -s $HOME/dotfiles/"$file" $HOME/Library/Application\ Support/Sublime\ Text\ 3/Packages/User/"$file"
		echo "シンボリックリンクを貼りました: $file"
	fi
done


# sublにシンボリックリンクを貼る
if [ -a /usr/local/bin/subl ]; then
	echo "ファイルが存在するのでシンボリックリンクを貼りませんでした: subl"
else
	ln -s $HOME/Applications/Sublime\ Text.app/Contents/SharedSupport/bin/subl /usr/local/bin/subl
	echo "シンボリックリンクを貼りました: subl"
fi

