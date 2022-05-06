# https://qiita.com/ko1nksm/items/e73e343f609c071e6a8c
# set -e
cd ~

# Install Xcode and the Xcode Command Line Tools
sudo xcode-select --install

# Agree to Xcode license
sudo xcodebuild -license

# Install the Rosetta2
softwareupdate --install-rosetta


echo "# ======================================================================================="
echo "# Homebrewを導入する"

if [ ! -f /opt/homebrew/bin/brew ]
   then
      echo "Installing Homebrew..."
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
   else
      echo "Homebrew already installed."
fi

brew doctor
# echo insecure >> ~/.curlrc


echo "# ======================================================================================="
echo "# Rustを導入する"

if [ ! -f $HOME/.cargo/bin/rustc ]
   then
      echo "Installing Rust..."
      curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
   else
      echo "Rust already installed."
fi


echo "# ======================================================================================="
echo "# zshを導入する"

# brew install zsh

# デフォルトのShellをzshにする
# /etc/shells の末尾に /usr/local/bin/zsh を追記
# sudo sh -c 'echo $(which zsh) >> /etc/shells'

# ユーザのデフォルトシェルを変更
# chsh -s /usr/local/bin/zsh


echo "# ======================================================================================="
echo "# dotdilesにシンボリックリンクを貼る"

DOT_FILES=(\
    .gitconfig \
    gitcommit_template \
    .gitignore \
    .gitignore_global \
    .tigrc \
    .zshrc \
    .zshenv \
    .zprofile \
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


echo "# ======================================================================================="
echo "# SHELLの再起動"

exec $SHELL -l
