# --------------------------------------
# .zshenv - Essential environment for ALL zsh invocations
# --------------------------------------
# This file is sourced for ALL zsh sessions (interactive, non-interactive, scripts)
# Only put absolutely essential environment variables here

# Load PATH helper functions (lightweight)
source "$HOME/dotfiles/home/config/zsh/00_helpers.zsh"

# PATH management is now centralized in config/zsh/00_path.zsh

# Prevent macOS /usr/libexec/path_helper from reordering PATH
# macOSでは/etc/zprofileで/usr/libexec/path_helperが実行され、
# 独自に設定したPATHの順序が変更されてしまう問題がある。
# GLOBAL_RCSを無効にすることで、/etc/zprofileなどのグローバル設定ファイルの
# 読み込みをスキップし、PATH順序を保持する。
# refs. https://github.com/Homebrew/homebrew-core/pull/32074#issuecomment-421381869
# refs. https://this.aereal.org/entry/zsh-path-helper
unsetopt GLOBAL_RCS

# Homebrew - set environment variables once (used by multiple files)
if [[ -x "/opt/homebrew/bin/brew" ]]; then
    # Apple Silicon Mac
    export HOMEBREW_PREFIX="/opt/homebrew"
    export HOMEBREW_CELLAR="/opt/homebrew/Cellar"
    export HOMEBREW_REPOSITORY="/opt/homebrew"
elif [[ -x "/usr/local/bin/brew" ]]; then
    # Intel Mac
    export HOMEBREW_PREFIX="/usr/local"
    export HOMEBREW_CELLAR="/usr/local/Cellar"
    export HOMEBREW_REPOSITORY="/usr/local/Homebrew"
fi

# Language-specific paths are managed in config/zsh/00_path.zsh

# NOTE: Heavy operations (direnv, cargo) moved to .zprofile
# They will only run in login shells, not for every script execution
