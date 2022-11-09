# --------------------------------------
# path
# --------------------------------------

# to avoid overwritten PATH via /usr/libexec/path_helper
# refs. https://github.com/Homebrew/homebrew-core/pull/32074#issuecomment-421381869
# refs. https://this.aereal.org/entry/zsh-path-helper
unsetopt GLOBAL_RCS

# path: Homebrew
eval "$(/opt/homebrew/bin/brew shellenv)"

# path: anyenv
export PATH=$HOME/.anyenv/bin:$PATH
eval "$(anyenv init -)"

# path: yarn
export PATH=$HOME/.yarn/bin:$PATH
export PATH=$HOME/.config/yarn/global/node_modules/.bin:$PATH

# path: dotfiles bin
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

# path: ZDOTDIR
# export ZDOTDIR=$HOME/dotfiles/zsh/

# path: zplug
export ZPLUG_HOME=/usr/local/opt/zplug
source $ZPLUG_HOME/init.zsh

# path: direnv
eval "$(direnv hook zsh)"
