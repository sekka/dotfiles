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

# path: php
# export PATH=/usr/local/opt/php/bin:$PATH
# export PATH=/usr/local/opt/php/sbin:$PATH

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
