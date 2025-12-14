# --------------------------------------
# Environment & PATH Management
# --------------------------------------
# helpers, platform, environmentを統合

# ======================
# Helper Functions
# ======================

# Function to add a directory to PATH only if it exists and is not already in PATH
add_to_path() {
    local dir="$1"
    local position="${2:-prepend}"  # prepend or append

    # Check if directory exists
    if [[ ! -d "$dir" ]]; then
        return 1
    fi

    # Check if already in PATH
    case ":$PATH:" in
        *":$dir:"*) return 0 ;;  # Already in PATH
    esac

    # Add to PATH
    if [[ "$position" == "append" ]]; then
        export PATH="$PATH:$dir"
    else
        export PATH="$dir:$PATH"
    fi
}

# Function to add a directory to fpath only if it exists and is not already in fpath
add_to_fpath() {
    local dir="$1"

    # Check if directory exists
    if [[ ! -d "$dir" ]]; then
        return 1
    fi

    # Check if already in fpath using zsh array subscript (more robust)
    if [[ -z "${fpath[(r)${dir}]}" ]]; then
        fpath=("$dir" $fpath)
    fi
}

# ======================
# Platform-specific Settings
# ======================

# OS別設定
case ${OSTYPE} in
    darwin*)
        # macOS用設定
        export CLICOLOR=1
        # Note: ls alias moved to main aliases.zsh with eza
        ;;
    linux*)
        # Linux用設定
        # 必要に応じて設定を追加
        ;;
    *)
        # その他のOS用設定
        ;;
esac

# ======================
# Centralized PATH Management
# ======================
# すべてのPATH設定を一元管理する
# 重複を防ぐため、add_to_path関数を使用してパスを追加する

# === 基本システムパス ===
add_to_path "/usr/local/bin"
add_to_path "/usr/local/sbin"

# === dotfiles関連 ===
add_to_path "$HOME/dotfiles/scripts/development"
add_to_path "$HOME/dotfiles/scripts/git"
add_to_path "$HOME/dotfiles/scripts/media"
add_to_path "$HOME/dotfiles/scripts/setup"
add_to_path "$HOME/dotfiles/scripts/system"
add_to_path "$HOME/dotfiles/scripts/tmux"

# === Homebrew ===
# 環境変数は.zshenvで設定済み
if [[ -n "$HOMEBREW_PREFIX" ]]; then
    add_to_path "$HOMEBREW_PREFIX/bin"
    add_to_path "$HOMEBREW_PREFIX/sbin"
fi

# === プログラミング言語関連 ===

# Go
export GOPATH="${GOPATH:-$HOME/go}"
add_to_path "$GOPATH/bin" append

# Rust
if [[ -d "$HOME/.cargo/bin" ]]; then
    add_to_path "$HOME/.cargo/bin" append
fi

# === 開発ツール ===

# Docker Desktop
add_to_path "/Applications/Docker.app/Contents/Resources/bin" append

# Docker CLI completions
add_to_fpath "$HOME/.docker/completions"

# VS Code
add_to_path "/Applications/Visual Studio Code.app/Contents/Resources/app/bin" append

# JetBrains Toolbox
add_to_path "$HOME/Library/Application Support/JetBrains/Toolbox/scripts" append

# Antigravity
add_to_path "$HOME/.antigravity/antigravity/bin" append

# === アプリケーション固有 ===

# Rancher Desktop
if [[ -d "$HOME/.rd/bin" ]]; then
    add_to_path "$HOME/.rd/bin" append
fi

# === クラウドツール ===

# Google Cloud SDK
if [[ -d "$HOME/google-cloud-sdk/bin" ]]; then
    add_to_path "$HOME/google-cloud-sdk/bin" append
fi

# AWS CLI
if [[ -d "$HOME/.local/aws-cli/v2/current/bin" ]]; then
    add_to_path "$HOME/.local/aws-cli/v2/current/bin" append
fi

# ======================
# Core Functions
# ======================

# ディレクトリ変更時自動実行
# add-zsh-hookを使用して他のプラグインとの競合を回避
autoload -Uz add-zsh-hook

function _chpwd_list_directory() {
    pwd
    local file_count=$(ls -1A 2>/dev/null | wc -l)
    if [[ $file_count -lt 500 ]] && command -v eza >/dev/null 2>&1; then
        eza --long --all --binary --bytes --group --header --links --inode \
            --modified --created --changed --git --git-repos --time-style long-iso
    else
        ls
    fi
}

add-zsh-hook chpwd _chpwd_list_directory

# PATH表示関数
function path_show() { echo -e ${PATH//:/'\n'} }

# ======================
# PATH Management Utilities
# ======================

# デバッグ用：重複したPATHエントリを表示
check_path_duplicates() {
    echo "=== PATH Entries ==="
    echo "$PATH" | tr ':' '\n' | nl
    echo
    echo "=== Duplicates ==="
    echo "$PATH" | tr ':' '\n' | sort | uniq -d
}

# 重複を削除してPATHを最適化
optimize_path() {
    # zshのpath配列を使用してより安全に重複削除
    local -a old_path_array
    old_path_array=("${path[@]}")
    local old_count=${#old_path_array}

    # typeset -U で重複を削除（zsh組み込み機能）
    typeset -U path

    local new_count=${#path}
    echo "PATH optimized. Removed $(( old_count - new_count )) duplicate entries."
}
