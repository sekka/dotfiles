# ===========================================
# .zprofile - ログインシェル専用の設定
# ===========================================
# このファイルはログインシェルでのみ読み込まれる
# 重い初期化処理はここに配置すること

# ===========================================
# PATH ヘルパー関数の読み込み（未読み込みの場合のみ）
# ===========================================
if ! typeset -f add_to_path > /dev/null; then
    source "$HOME/dotfiles/home/config/zsh/00_environment.zsh"
fi

# ===========================================
# エディタ設定
# ===========================================
# デフォルトのテキストエディタと ビジュアルエディタ
export EDITOR="${EDITOR:-vim}"
export VISUAL="${VISUAL:-$EDITOR}"

# ===========================================
# 言語環境設定
# ===========================================
export LANG="${LANG:-en_US.UTF-8}"
export LC_CTYPE="${LC_CTYPE:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"

# ===========================================
# XDG Base Directory 仕様
# ===========================================
# アプリケーション設定ファイルの標準的な配置場所を定義
export XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-$HOME/.cache}"
export XDG_DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
export XDG_STATE_HOME="${XDG_STATE_HOME:-$HOME/.local/state}"

# ===========================================
# 開発環境の初期化（重い処理）
# ===========================================

# direnv - ディレクトリごとの環境変数管理（重い処理）
if command -v direnv >/dev/null 2>&1; then
    eval "$(direnv hook zsh)"
fi

# Rust/Cargo 環境
if [[ -f "$HOME/.cargo/env" ]]; then
    source "$HOME/.cargo/env"
fi
