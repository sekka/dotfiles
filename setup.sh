echo "# =========================================================="
echo "#"
echo "# Homebrewを導入する"
echo "#"
echo "# =========================================================="

ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"


echo "# =========================================================="
echo "#"
echo "# zshを導入する"
echo "#"
echo "# =========================================================="

brew install zsh

# デフォルトのShellをzshにする
# /etc/shells の末尾に /usr/local/bin/zsh を追記
sudo sh -c 'echo $(which zsh) >> /etc/shells'

# ユーザのデフォルトシェルを変更
chsh -s /usr/local/bin/zsh


echo "# =========================================================="
echo "#"
echo "# Homebrewで色々入れる"
echo "#"
echo "# =========================================================="

brew update
brew upgrade

brew install vim
brew install rbenv
brew install ruby-build
brew install tmux
brew install tree
brew install wget
brew install node
brew install pstree
brew install git
brew install tig
brew install wget
brew install curl
brew install reattach-to-user-namespace
brew install hugo
brew install mycli
brew install ffmpeg
brew install youtube-dl


echo "# =========================================================="
echo "#"
echo "# HomebrewでGUIアプリも色々入れる"
echo "#"
echo "# =========================================================="

brew install caskroom/cask/brew-cask
brew cask update

brew cask install virtualbox4330101610
brew cask install vagrant
brew cask install vagrant-manager
brew cask install chefdk
brew cask install alfred
brew cask install appcleaner
brew cask install androidtool
brew cask install blender
brew cask install cactus
brew cask install ccleaner
brew cask install charles
brew cask install coteditor
brew cask install couleurs
#brew cask install dash
brew cask install dropbox
#brew cask install firefox
brew cask install fontexplorer-x-pro
#brew cask install google-chrome
brew cask install iconjar
brew cask install imagealpha
brew cask install imageoptim
brew cask install intellij-idea
brew cask install iterm2
#brew cask install kaleidoscope
brew cask install ksdiff
brew cask install numi
brew cask install onyx
#brew cask install opera
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
echo "# dotdilesにシンボリックリンクを貼る"
echo "#"
echo "# =========================================================="

DOT_FILES=(.gitignore .gitignore_global .tigrc .tmux.conf .zshrc .vimrc)

for file in ${DOT_FILES[@]}

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
brew install docker
brew install boot2docker
#brew cask install kitematic
boot2docker init
boot2docker up
boot2docker status


echo "# =========================================================="
echo "#"
echo "# Homebrewをメンテナンス"
echo "#"
echo "# =========================================================="

brew cleanup
brew doctor


echo "# =========================================================="
echo "#"
echo "# npmで色々入れる"
echo "#"
echo "# =========================================================="

npm install -g tmux-cpu
npm install -g tmux-mem
npm install -g electron-packager
npm install -g electron-prebuild
npm install -g gulp
npm install -g caniuse-cmd

