# --------------------------------------
# .zshenv - Essential environment for ALL zsh invocations
# --------------------------------------
# This file is sourced for ALL zsh sessions (interactive, non-interactive, scripts)
# Only put absolutely essential environment variables here

# Load PATH helper functions (lightweight)
source "$HOME/dotfiles/config/zsh/helpers.zsh"

# Essential paths that all shells need
add_to_path "/usr/local/bin"
add_to_path "$HOME/dotfiles/bin"

# Prevent macOS /usr/libexec/path_helper from reordering PATH
# refs. https://github.com/Homebrew/homebrew-core/pull/32074#issuecomment-421381869
# refs. https://this.aereal.org/entry/zsh-path-helper
unsetopt GLOBAL_RCS

# Homebrew - only set essential paths, avoid heavy eval for non-interactive shells
if [[ -x "/opt/homebrew/bin/brew" ]]; then
    export HOMEBREW_PREFIX="/opt/homebrew"
    export HOMEBREW_CELLAR="/opt/homebrew/Cellar"
    export HOMEBREW_REPOSITORY="/opt/homebrew"
    add_to_path "/opt/homebrew/bin"
    add_to_path "/opt/homebrew/sbin"
elif [[ -x "/usr/local/bin/brew" ]]; then
    export HOMEBREW_PREFIX="/usr/local"
    export HOMEBREW_CELLAR="/usr/local/Cellar"
    export HOMEBREW_REPOSITORY="/usr/local/Homebrew"
    add_to_path "/usr/local/bin"
    add_to_path "/usr/local/sbin"
fi

# Go - lightweight path setup
export GOPATH="${GOPATH:-$HOME/go}"
add_to_path "$GOPATH/bin" append

# Yarn - only if directory exists
add_to_path "$HOME/.yarn/bin"
add_to_path "$HOME/.config/yarn/global/node_modules/.bin"

# NOTE: Heavy operations (anyenv, direnv, cargo, volta) moved to .zprofile
# They will only run in login shells, not for every script execution