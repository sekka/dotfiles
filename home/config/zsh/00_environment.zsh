# ===========================================
# 環境変数と PATH 管理
# ===========================================
# helpers、platform、environment を統合

# ===========================================
# ヘルパー関数
# ===========================================

# PATH にディレクトリを追加（重複チェック付き）
# 使用法: add_to_path "/path/to/dir" [prepend|append]
add_to_path() {
    local dir="$1"
    local position="${2:-prepend}"  # デフォルトは先頭に追加

    # ディレクトリが存在しない場合はスキップ
    if [[ ! -d "$dir" ]]; then
        return 1
    fi

    # PATH に既に含まれている場合はスキップ
    case ":$PATH:" in
        *":$dir:"*) return 0 ;;
    esac

    # PATH に追加
    if [[ "$position" == "append" ]]; then
        export PATH="$PATH:$dir"
    else
        export PATH="$dir:$PATH"
    fi
}

# fpath にディレクトリを追加（重複チェック付き）
# 使用法: add_to_fpath "/path/to/dir"
add_to_fpath() {
    local dir="$1"

    # ディレクトリが存在しない場合はスキップ
    if [[ ! -d "$dir" ]]; then
        return 1
    fi

    # fpath に既に含まれている場合はスキップ（zsh の配列添字を使用）
    if [[ -z "${fpath[(r)${dir}]}" ]]; then
        fpath=("$dir" $fpath)
    fi
}

# ===========================================
# プラットフォーム固有設定
# ===========================================

case ${OSTYPE} in
    darwin*)
        # macOS 用設定
        export CLICOLOR=1
        # ls エイリアスは 50_aliases.zsh で eza を使用
        ;;
esac

# ===========================================
# PATH 管理（一元化）
# ===========================================
# すべての PATH 設定をここで一元管理
# add_to_path 関数で重複を自動的に防止

# --- 基本システムパス ---
add_to_path "/usr/local/bin"
add_to_path "/usr/local/sbin"

# --- dotfiles スクリプト ---
add_to_path "$HOME/dotfiles/scripts/development"
add_to_path "$HOME/dotfiles/scripts/git"
add_to_path "$HOME/dotfiles/scripts/media"
add_to_path "$HOME/dotfiles/scripts/setup"
add_to_path "$HOME/dotfiles/scripts/system"

# --- Homebrew ---
# 環境変数は .zshenv で設定済み
if [[ -n "$HOMEBREW_PREFIX" ]]; then
    add_to_path "$HOMEBREW_PREFIX/bin"
    add_to_path "$HOMEBREW_PREFIX/sbin"
fi

# --- GNU awk ---
# macOS 互換性のため、GNU awk の gnubin を PATH に追加
# tmux-sessionx などが期待する構文に対応
add_to_path "$HOMEBREW_PREFIX/opt/gawk/libexec/gnubin"

# --- プログラミング言語 ---

# Go
export GOPATH="${GOPATH:-$HOME/go}"
add_to_path "$GOPATH/bin" append

# Rust
add_to_path "$HOME/.cargo/bin" append

# Local binaries (Claude Code, fossil-mcp etc.)
add_to_path "$HOME/.local/bin" append

# --- 開発ツール ---

# Docker Desktop
add_to_path "/Applications/Docker.app/Contents/Resources/bin" append

# Docker CLI 補完
add_to_fpath "$HOME/.docker/completions"

# VS Code
add_to_path "/Applications/Visual Studio Code.app/Contents/Resources/app/bin" append

# JetBrains Toolbox
add_to_path "$HOME/Library/Application Support/JetBrains/Toolbox/scripts" append

# Antigravity
add_to_path "$HOME/.antigravity/antigravity/bin" append

# --- アプリケーション ---

# Rancher Desktop
if [[ -d "$HOME/.rd/bin" ]]; then
    add_to_path "$HOME/.rd/bin" append
fi

# --- クラウドツール ---

# Google Cloud SDK
if [[ -d "$HOME/google-cloud-sdk/bin" ]]; then
    add_to_path "$HOME/google-cloud-sdk/bin" append
fi

# AWS CLI
if [[ -d "$HOME/.local/aws-cli/v2/current/bin" ]]; then
    add_to_path "$HOME/.local/aws-cli/v2/current/bin" append
fi

# ===========================================
# コア機能
# ===========================================

# ディレクトリ変更時の自動実行
# add-zsh-hook で他のプラグインとの競合を回避
autoload -Uz add-zsh-hook

function _chpwd_list_directory() {
    pwd
    local file_count=$(ls -1A 2>/dev/null | wc -l)
    # ファイル数が 500 未満で eza が利用可能なら詳細表示
    if [[ $file_count -lt 500 ]] && command -v eza >/dev/null 2>&1; then
        eza --long --all --binary --bytes --header --changed --git --git-repos --icons auto --time-style long-iso --sort name --group-directories-first --hyperlink -F always
    else
        ls
    fi
}

add-zsh-hook chpwd _chpwd_list_directory

# PATH 表示関数
function path_show() { echo -e ${PATH//:/'\n'} }

# ===========================================
# PATH 管理ユーティリティ
# ===========================================

# デバッグ用: PATH の重複エントリを表示
# 使用方法: check_path_duplicates
check_path_duplicates() {
    echo "=== PATH エントリ ==="
    echo "$PATH" | tr ':' '\n' | nl
    echo
    echo "=== 重複 ==="
    echo "$PATH" | tr ':' '\n' | sort | uniq -d
}

# PATH から重複を削除して最適化
# 使用方法: optimize_path
# 注意: これは手動実行用のユーティリティ関数
#       自動起動時には実行されない
optimize_path() {
    # zsh の path 配列を使用して安全に重複削除
    local -a old_path_array
    old_path_array=("${path[@]}")
    local old_count=${#old_path_array}

    # typeset -U で重複を削除（zsh 組み込み機能）
    typeset -U path

    local new_count=${#path}
    echo "PATH を最適化しました。$(( old_count - new_count )) 個の重複エントリを削除。"
}
