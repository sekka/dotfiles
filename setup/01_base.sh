echo "# =========================================================="
echo "#"
echo "# Homebrewを導入する"
echo "#"
echo "# =========================================================="

xcode-select --install
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
brew doctor
echo insecure >> ~/.curlrc


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
echo "# dotdilesにシンボリックリンクを貼る"
echo "#"
echo "# =========================================================="

DOT_FILES=(.gitconfig .gitcommit_template .gitignore .gitignore_global .tigrc .tmux.conf .zshrc .zshenv .vimrc .hyper.js .agignore)

for file in ${DOT_FILES[@]}

do
	if [ -a $HOME/$file ]; then
			echo "ファイルが存在するのでシンボリックリンクを貼りませんでした: $file"
	else
		ln -s $HOME/dotfiles/$file $HOME/$file
			echo "シンボリックリンクを貼りました: $file"
	fi
done


PET_FILES=(config.toml snippet.toml)

for file in ${PET_FILES[@]}

do
	if [ -a $HOME/.config/pet/$file ]; then
			echo "ファイルが存在するのでシンボリックリンクを貼りませんでした: $file"
	else
		ln -s $HOME/dotfiles/config/pet/$file $HOME/.config/pet/$file
			echo "シンボリックリンクを貼りました: $file"
	fi
done


NEOVIM_FILES=(init.vim)

for file in ${NEOVIM_FILES[@]}

do
	if [ -a $HOME/.config/nvim/$file ]; then
			echo "ファイルが存在するのでシンボリックリンクを貼りませんでした: $file"
	else
		ln -s $HOME/dotfiles/config/nvim/$file $HOME/.config/nvim/$file
			echo "シンボリックリンクを貼りました: $file"
	fi
done
