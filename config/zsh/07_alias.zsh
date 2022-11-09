# ls
alias l="exa"
alias lsa="exa --long --all --binary --bytes --group --header --links --inode --modified --blocks --extended --git --time-style long-iso"

# tree
# N: 文字化け対策, C:色をつける
alias tree="tree -NC"

# rm
alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'

# mkdir
alias mkdir='mkdir -p'

# bundler
alias be='bundle exec'

# sudo の後のコマンドでエイリアスを有効にする
alias sudo='sudo '

# ag
alias ag='ag --smart-case --stats --pager "less -F -R"'
alias agh='ag --hidden --smart-case --stats --pager "less -F -R"'

# rg
alias rg='rg --smart-case --stats --pretty'

# vim
alias vp='vim +PlugInstall +qall'

# npm run
alias nrun='npm run $(commands | peco)'

# yarn run
alias yrun='yarn $(commands | peco)'

# tmux
alias t='tmux'
alias td='tmux detach'
alias ta='tmux attach'
alias tat='tmux attach -t'
alias tm="tmuximum"

# cd
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# グローバルエイリアス
alias -g L='| less -F -R'
alias -g H='| head'
alias -g T='| tail -F -R'
alias -g G='| grep'
alias -g CL='| color'

# -n 行数表示, -I バイナリファイル無視, svn関係のファイルを無視
alias grep="grep --color -n -I --exclude='*.svn-*' --exclude='entries' --exclude='*/cache/*'"

# env整形表示
alias envpath='envpath1'
alias envpath1="echo $PATH | sed 's/:/\\n/g'"
alias envpath2="echo $PATH | sed 's/:/\n/g'"

# C で標準出力をクリップボードにコピーする
# mollifier delta blog : http://mollifier.hatenablog.com/entry/20100317/p1
if which pbcopy >/dev/null 2>&1 ; then
    # Mac
    alias -g C='| pbcopy'
elif which xsel >/dev/null 2>&1 ; then
    # Linux
    alias -g C='| xsel --input --clipboard'
elif which putclip >/dev/null 2>&1 ; then
    # Cygwin
    alias -g C='| putclip'
fi

# シェル再起動
# https://qiita.com/yusabana/items/c4de582c6f85a42817d8
alias shreboot='exec $SHELL -l'
