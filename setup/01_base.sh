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

echo "# brew doctor"
brew doctor
# echo insecure >> ~/.curlrc


echo "# ======================================================================================="
echo "# Rustを導入する"

if [ ! -f $HOME/.cargo/bin/rustc ]
    then
       echo "Installing Rust..."
       curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    else
       echo "Rust already installed."
fi


echo "# ======================================================================================="
echo "# zshを導入する"

brew install zsh

ETC_SHELLS=$(tail -1 /etc/shells)
echo $ETC_SHELLS
WHICH_ZSH="$(which zsh)"
echo $WHICH_ZSH

echo "# zshをshellリストに追加する"
if [ ! $ETC_SHELLS = $WHICH_ZSH ]
    then
        echo "Adding zsh..."
        # /etc/shells の末尾に /opt/homebrew/bin/zsh を追記
        sudo sh -c 'echo $(which zsh) >> /etc/shells'
    else
        echo "zsh already added."
fi

echo "# デフォルトシェルをzshに変更する"
if [ ! $SHELL = $WHICH_ZSH ]
    then
        echo "Changing default Shell..."
        chsh -s /opt/homebrew/bin/zsh
    else
        echo "zsh already default shell."
fi


echo "# ======================================================================================="
echo "# dotdilesにシンボリックリンクを貼る"

DOT_FILES=(\
    .gitconfig \
    .gitcommit_template \
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


echo "# =========================================================="
echo "# .config/にシンボリックリンクを貼る"

CONFIG_DIRS=(\
   zellij \
)

for dirs in ${CONFIG_DIRS[@]}

do
   if [ -a $HOME/.config/$dirs ]; then
       echo "フォルダが存在するのでシンボリックリンクを貼りませんでした: $dirs"
   else
       ln -s $HOME/dotfiles/config/$dirs $HOME/.config/$dirs
       echo "シンボリックリンクを貼りました: $dirs"
   fi
done


echo "# ======================================================================================="
echo "# SHELLの再起動"

exec $SHELL -l
