# --------------------------------------
# env/path
# --------------------------------------

# Load PATH helper functions
source "$HOME/dotfiles/config/zsh/00_path_helper.zsh"

# Essential paths
add_to_path "/usr/local/bin"

# to avoid overwritten PATH via /usr/libexec/path_helper
# refs. https://github.com/Homebrew/homebrew-core/pull/32074#issuecomment-421381869
# refs. https://this.aereal.org/entry/zsh-path-helper
unsetopt GLOBAL_RCS

# path: Homebrew
if [[ -x "/opt/homebrew/bin/brew" ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
elif [[ -x "/usr/local/bin/brew" ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
fi

# path: anyenv
if [[ -d "$HOME/.anyenv" ]]; then
    add_to_path "$HOME/.anyenv/bin"
    eval "$(anyenv init -)"
fi

# path: go
export GOPATH="${GOPATH:-$HOME/go}"
add_to_path "$GOPATH/bin" append

# path: yarn
add_to_path "$HOME/.yarn/bin"
add_to_path "$HOME/.config/yarn/global/node_modules/.bin"

# path: dotfiles bin
add_to_path "$HOME/dotfiles/bin"

# path: ZDOTDIR
# export ZDOTDIR=$HOME/dotfiles/zsh/

# env: direnv
eval "$(direnv hook zsh)"

# env: cargo
source "$HOME/.cargo/env"

# env/path: volta
if [[ -d "$HOME/.volta" ]]; then
    export VOLTA_HOME="$HOME/.volta"
    add_to_path "$VOLTA_HOME/bin"
fi