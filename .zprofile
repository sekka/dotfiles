# --------------------------------------
# .zprofile - Login shell configuration
# --------------------------------------
# This file is sourced only for login shells
# Heavy initialization operations should go here

# Load PATH helper functions (if not already loaded)
if ! typeset -f add_to_path > /dev/null; then
    source "$HOME/dotfiles/config/zsh/00_path_helper.zsh"
fi

# Set default editor and visual editor
export EDITOR="${EDITOR:-vim}"
export VISUAL="${VISUAL:-$EDITOR}"

# Set language environment
export LANG="${LANG:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"

# XDG Base Directory specification
export XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-$HOME/.cache}"
export XDG_DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
export XDG_STATE_HOME="${XDG_STATE_HOME:-$HOME/.local/state}"

# --------------------------------------
# Development environment initialization
# --------------------------------------

# anyenv - unified version manager (heavy operation)
if [[ -d "$HOME/.anyenv" ]] && ! command -v anyenv >/dev/null 2>&1; then
    add_to_path "$HOME/.anyenv/bin"
    eval "$(anyenv init -)"
fi

# direnv - per-directory environment variables (heavy operation)
if command -v direnv >/dev/null 2>&1; then
    eval "$(direnv hook zsh)"
fi

# Rust/Cargo environment
if [[ -f "$HOME/.cargo/env" ]]; then
    source "$HOME/.cargo/env"
fi

# volta - Node.js version manager
if [[ -d "$HOME/.volta" ]]; then
    export VOLTA_HOME="$HOME/.volta"
    add_to_path "$VOLTA_HOME/bin"
fi

# zplug path setup (for 08_zplug.zsh)
if [[ -d "/opt/homebrew/opt/zplug" ]]; then
    export ZPLUG_HOME="/opt/homebrew/opt/zplug"
elif [[ -d "/usr/local/opt/zplug" ]]; then
    export ZPLUG_HOME="/usr/local/opt/zplug"
fi