# peco関数定義
function peco-select-history() {
    local tac
    if which tac > /dev/null; then
        tac="tac"
    else
        tac="tail -r"
    fi
    BUFFER=$(\history -n 1 | \
        eval $tac | \
        peco --query "$LBUFFER")
    CURSOR=$#BUFFER
    zle clear-screen
}
# 無効化（fzfを使用）
# zle -N peco-select-history
# bindkey '^r' peco-select-history
function peco-src () {
    local selected_dir=$(ghq list -p | peco --query "$LBUFFER")
    if [ -n "$selected_dir" ]; then
        BUFFER="cd ${selected_dir}"
        zle accept-line
    fi
    zle clear-screen
}
# 無効化（fzfを使用）
# zle -N peco-src
# bindkey '^]' peco-src
function commands () {
    cat package.json | jq -r '.scripts | keys[]'
}

# anyframe
bindkey '^h' anyframe-widget-select-widget
bindkey '^j' anyframe-widget-insert-git-branch
bindkey '^k' anyframe-widget-checkout-git-branch
