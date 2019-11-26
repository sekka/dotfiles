# --------------------------------------
# path
# --------------------------------------

# ZDOTDIR
# export ZDOTDIR=$HOME/dotfiles/zsh/

# curl
# export PATH=/usr/local/opt/curl/bin:$PATH

# bin/
export PATH=$HOME/dotfiles/bin:$PATH

# zplug
export ZPLUG_HOME=/usr/local/opt/zplug
source $ZPLUG_HOME/init.zsh

# Homebrew
export PATH=/usr/local/sbin:$PATH
export PATH=/usr/local/bin:$PATH

# anyenv
export PATH=$HOME/.anyenv/bin:$PATH
eval "$(anyenv init -)"

# direnv
eval "$(direnv hook zsh)"

# NeoVim
export XDG_CONFIG_HOME=$HOME/.config

# yarn
export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"

# 重複する要素を自動的に削除
typeset -U path cdpath fpath manpath

path=(
    $path
    $HOME/bin(N-/)
    /usr/local/bin(N-/)
    /usr/local/sbin(N-/)
)
