# --------------------------------------
# env/path
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

# path: go
export GOPATH=$HOME/go
PATH=$PATH:$GOPATH/bin

# path: yarn
export PATH=$HOME/.yarn/bin:$PATH
export PATH=$HOME/.config/yarn/global/node_modules/.bin:$PATH

# path: dotfiles bin
export PATH=$HOME/dotfiles/bin:$PATH

# path: ZDOTDIR
# export ZDOTDIR=$HOME/dotfiles/zsh/

# path: zplug
export ZPLUG_HOME=/opt/homebrew/opt/zplug
source $ZPLUG_HOME/init.zsh

# env: direnv
eval "$(direnv hook zsh)"
. "$HOME/.cargo/env"

# env: cargo
source "$HOME/.cargo/env"

# env/path: volta
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"

# 重複する要素を自動的に削除
# https://zenn.dev/ress/articles/069baf1c305523dfca3d
#typeset -U path cdpath fpath manpath
typeset -U path PATH
path=(
    /opt/homebrew/bin(N-/)
	/usr/local/bin(N-/)
	$path
)
