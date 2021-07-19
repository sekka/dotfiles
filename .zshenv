# --------------------------------------
# path
# --------------------------------------

# to avoid overwritten PATH via /usr/libexec/path_helper
# refs. https://github.com/Homebrew/homebrew-core/pull/32074#issuecomment-421381869
unsetopt GLOBAL_RCS

# curl
# export PATH=/usr/local/opt/curl/bin:$PATH

# Homebrew
export PATH=/usr/local/bin:$PATH
export PATH=/usr/local/sbin:$PATH
export PATH=/opt/homebrew/bin:$PATH

# anyenv
export PATH=$HOME/.anyenv/bin:$PATH
eval "$(anyenv init -)"

# yarn
export PATH=$HOME/.yarn/bin:$PATH
export PATH=$HOME/.config/yarn/global/node_modules/.bin:$PATH

# dotfiles bin
export PATH=$HOME/dotfiles/bin:$PATH

# 重複する要素を自動的に削除
typeset -U path cdpath fpath manpath

path=(
    $path
    /usr/local/sbin(N-/)
    /usr/local/bin(N-/)
    /usr/sbin
    /usr/bin
)

# ZDOTDIR
# export ZDOTDIR=$HOME/dotfiles/zsh/

# zplug
export ZPLUG_HOME=/usr/local/opt/zplug
source $ZPLUG_HOME/init.zsh

# NeoVim
export XDG_CONFIG_HOME=$HOME/.config

# direnv
eval "$(direnv hook zsh)"
