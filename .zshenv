# --------------------------------------
# path
# --------------------------------------

# Homebrew
export PATH=/usr/local/sbin:$PATH
export PATH=/usr/local/bin:$PATH

# anyenv
export PATH="$HOME/.anyenv/bin:$PATH"
eval "$(anyenv init -)"

# zplug
export ZPLUG_HOME=/usr/local/opt/zplug
source $ZPLUG_HOME/init.zsh

# direnv
eval "$(direnv hook zsh)"

# 重複する要素を自動的に削除
typeset -U path cdpath fpath manpath

# export
export PATH=$HOME/dotfiles/bin:$PATH

path=(
    $path
    $HOME/bin(N-/)
    /usr/local/bin(N-/)
    /usr/local/sbin(N-/)
)
