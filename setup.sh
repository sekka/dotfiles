# ==========================================================
# 
# homebrewを導入する
# 
# ==========================================================

ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"


# ==========================================================
# 
# zshを導入する
# 
# ==========================================================

brew install zsh

# デフォルトのShellをzshにする
# /etc/shells の末尾に /usr/local/bin/zsh を追記
sudo sh -c 'echo $(which zsh) >> /etc/shells'

# ユーザのデフォルトシェルを変更
chsh -s /usr/local/bin/zsh


# ==========================================================
# 
# homebrewで色々入れる
# 
# ==========================================================

brew install vim
brew install rbenv
brew install ruby-build
brew install tmux
brew install tree
brew install wget
brew install node


# ==========================================================
# 
# nodebrewとnode.jsを導入する
# 
# ==========================================================

# brew install nodebrew
# nodebrew install-binary stable


# ==========================================================
# 
# pecoを導入する
# 
# ==========================================================

brew tap peco/peco
brew install peco


# ==========================================================
# 
# dotdilesにシンボリックリンクを貼る
# 
# ==========================================================

DOT_FILES=(.gitignore .gitignore_global .tmux.conf .zshrc .vimrc)

for file in ${DOT_FILES[@]}

do
	if [ -a $HOME/$file ]; then
			echo "ファイルが存在するのでシンボリックリンクを貼りませんでした: $file"
	else
		ln -s $HOME/dotfiles/$file $HOME/$file
			echo "シンボリックリンクを貼りました: $file"
	fi
done
