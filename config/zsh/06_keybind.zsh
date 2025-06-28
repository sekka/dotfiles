# Emacsキーバインド設定
bindkey -e

# 親ディレクトリ移動関数
function cdup() {
   echo
   cd ..
   zle reset-prompt
}
zle -N cdup
