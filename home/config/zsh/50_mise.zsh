# --------------------------------------
# mise - 開発環境管理ツール
# --------------------------------------

# mise activation
# miseコマンドが利用可能な場合のみ有効化
if command -v mise >/dev/null 2>&1; then
    eval "$(mise activate zsh)"
fi
