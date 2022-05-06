echo "# =========================================================="
echo "#"
echo "# Homebrewを導入する"
echo "#"
echo "# =========================================================="

# Install Xcode and the Xcode Command Line Tools
sudo xcode-select --install

# Agree to Xcode license
sudo xcodebuild -license

# Install the Rosetta2
softwareupdate --install-rosetta

# ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
# brew doctor
# echo insecure >> ~/.curlrc


echo "# =========================================================="
echo "#"
echo "# zshを導入する"
echo "#"
echo "# =========================================================="

# brew install zsh

# デフォルトのShellをzshにする
# /etc/shells の末尾に /usr/local/bin/zsh を追記
# sudo sh -c 'echo $(which zsh) >> /etc/shells'

# ユーザのデフォルトシェルを変更
# chsh -s /usr/local/bin/zsh


echo "# =========================================================="
echo "#"
echo "# dotdilesにシンボリックリンクを貼る"
echo "#"
echo "# =========================================================="

DOT_FILES=(\
    .gitconfig \
    gitcommit_template \
    .gitignore \
    .gitignore_global \
    .tigrc \
    .tmux.conf \
    .zshrc \
    .zshenv \
    .vimrc \
    .agignore \
)

for file in ${DOT_FILES[@]}

do
    if [ -a $HOME/$file ]; then
        echo "ファイルが存在するのでシンボリックリンクを貼りませんでした: $file"
    else
        ln -s $HOME/dotfiles/$file $HOME/$file
            echo "シンボリックリンクを貼りました: $file"
    fi
done
