# emacs 風キーバインドにする
bindkey -e

# ^R で履歴検索をするときに * でワイルドカードを使用出来るようにする
# bindkey '^R' history-incremental-pattern-search-backward

function cdup() {
   echo
   cd ..
   zle reset-prompt
}
zle -N cdup
# bindkey '^K' cdup
