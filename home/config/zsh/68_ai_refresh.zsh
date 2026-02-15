# AI可用性キャッシュ手動更新関数
# codex login や gh auth logout 後に実行してキャッシュを即座に更新

ai-refresh() {
    rm -f "${XDG_CACHE_HOME:-$HOME/.cache}/ai-availability.cache"
    # ZSHHOME が未定義の場合のフォールバック（通常は .zshrc で定義済み）
    source "${ZSHHOME:-$HOME/dotfiles/home/config/zsh}/67_ai_availability.zsh"
    echo "AI availability refreshed: $AI_AVAILABLE_MODELS"
}
