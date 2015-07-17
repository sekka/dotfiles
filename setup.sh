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
