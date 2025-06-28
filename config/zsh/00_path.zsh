# --------------------------------------
# Centralized PATH Management
# --------------------------------------
# このファイルですべてのPATH設定を一元管理する
# 重複を防ぐため、add_to_path関数を使用してパスを追加する

# === 基本システムパス ===
add_to_path "/usr/local/bin"
add_to_path "/usr/local/sbin"

# === dotfiles関連 ===
add_to_path "$HOME/dotfiles/bin"

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

# Node.js / Yarn
add_to_path "$HOME/.yarn/bin" append
add_to_path "$HOME/.config/yarn/global/node_modules/.bin" append

# Python
if [[ -d "$HOME/.local/bin" ]]; then
    add_to_path "$HOME/.local/bin" append
fi

# Ruby
if [[ -d "$HOME/.rbenv/bin" ]]; then
    add_to_path "$HOME/.rbenv/bin"
fi

# === バージョンマネージャー ===

# anyenv
if [[ -d "$HOME/.anyenv/bin" ]]; then
    add_to_path "$HOME/.anyenv/bin"
fi

# volta
if [[ -d "$HOME/.volta/bin" ]]; then
    add_to_path "$HOME/.volta/bin"
fi

# === 開発ツール ===

# Docker Desktop
add_to_path "/Applications/Docker.app/Contents/Resources/bin" append

# VS Code
add_to_path "/Applications/Visual Studio Code.app/Contents/Resources/app/bin" append

# JetBrains Toolbox
add_to_path "$HOME/Library/Application Support/JetBrains/Toolbox/scripts" append

# === アプリケーション固有 ===

# LM Studio
add_to_path "$HOME/.lmstudio/bin" append

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

# === PATH重複チェック機能 ===
# デバッグ用：重複したPATHエントリを表示
check_path_duplicates() {
    echo "=== PATH Entries ==="
    echo "$PATH" | tr ':' '\n' | nl
    echo
    echo "=== Duplicates ==="
    echo "$PATH" | tr ':' '\n' | sort | uniq -d
}

# === PATH最適化機能 ===
# 重複を削除してPATHを最適化
optimize_path() {
    local new_path=""
    local IFS=':'
    local seen=()
    
    for dir in $PATH; do
        if [[ ! " ${seen[@]} " =~ " ${dir} " ]]; then
            seen+=("$dir")
            if [[ -z "$new_path" ]]; then
                new_path="$dir"
            else
                new_path="$new_path:$dir"
            fi
        fi
    done
    
    export PATH="$new_path"
    echo "PATH optimized. Removed $(( $(echo "$PATH" | tr ':' '\n' | wc -l) - $(echo "$new_path" | tr ':' '\n' | wc -l) )) duplicate entries."
}