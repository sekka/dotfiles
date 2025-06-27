# --------------------------------------
# Aliases - System and Development
# --------------------------------------

# ファイル操作系エイリアス
alias l="eza"
alias lsa="eza --long --all --binary --bytes --group --header --links --inode --modified --created --changed --extended --git --git-repos --time-style long-iso"

alias tree="tree -NC"
alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'
alias mkdir='mkdir -p'

# 開発系エイリアス
alias be='bundle exec'
alias sudo='sudo '

# 検索系エイリアス
alias ag='ag --smart-case --stats --pager "less -F -R"'
alias agh='ag --hidden --smart-case --stats --pager "less -F -R"'
alias rg='rg --smart-case --stats --pretty'
alias vp='vim +PlugInstall +qall'
alias nrun='npm run $(commands | peco)'
alias yrun='yarn $(commands | peco)'

# セッション管理エイリアス
alias t='tmux'
alias td='tmux detach'
alias ta='tmux attach'
alias tat='tmux attach -t'
alias tm="tmuximum"

# ディレクトリ移動エイリアス
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# パイプ用グローバルエイリアス
alias -g L='| less -F -R'
alias -g H='| head'
alias -g T='| tail -F -R'
alias -g G='| grep'
alias -g CL='| color'

alias grep="grep --color -n -I --exclude='*.svn-*' --exclude='entries' --exclude='*/cache/*'"

# システム系エイリアス
alias envpath='envpath1'
alias envpath1="echo $PATH | sed 's/:/\\n/g'"
alias envpath2="echo $PATH | sed 's/:/\n/g'"

# クリップボード連携
if which pbcopy >/dev/null 2>&1 ; then
    # Mac
    alias -g C='| pbcopy'
elif which xsel >/dev/null 2>&1 ; then
    alias -g C='| xsel --input --clipboard'
elif which putclip >/dev/null 2>&1 ; then
    alias -g C='| putclip'
fi
alias shreboot='exec $SHELL -l'

# --------------------------------------
# Git Aliases
# --------------------------------------

# Git基本操作エイリアス
alias gft="git fetch"
alias gpl="git pull"
alias gco="git checkout"
alias gst="git status"
alias gcm="git commit -a"
alias gbr="git branch"
alias gba="git branch -a"
alias gbm="git branch --merged"
alias gbn="git branch --no-merge"

alias smu="git submodule foreach 'git checkout master; git pull'"
alias gstt="git status -uno"
alias gdiff="git diff --word-diff"

# Git log表示エイリアス
alias log="log9"

alias log0="git log \
    --graph \
    --all \
    --abbrev-commit \
    --date=relative \
    --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(bold white)― %an%C(reset)%C(bold yellow)%d%C(reset)'"
alias log1="git log \
    --date=iso \
    --pretty='format:%C(yellow)%h%Creset %C(magenta)%cd%Creset %s %Cgreen(%an)%Creset %Cred%d%Creset%C(black bold)%ar%Creset'"
alias log2="git log \
    --graph \
    --all \
    --abbrev-commit \
    --format=format:'%C(bold blue)%h%C(reset) - %C(bold cyan)%aD%C(reset) %C(bold green)(%ar)%C(reset)%C(bold yellow)%d%C(reset)%n''          %C(white)%s%C(reset) %C(bold white)― %an%C(reset)'"
alias log3="git log \
    --graph \
    --date-order \
    --all \
    --date=short \
    -C -M \
    --pretty=format:'<%h> %ad [%an] %Cgreen%d%Creset %s'"
alias log4="git log \
    --graph \
    --pretty='format:%C(yellow)%h%Cblue%d%Creset %s %C(black bold)%an, %ar%Creset'"
alias log5="git log \
    --graph \
    --date=short \
    --decorate=short \
    --pretty=format:'%Cgreen%h %Creset%cd %Cblue%cn %Cred%d %Creset%s'"
alias log6="git log \
    --graph \
    --abbrev-commit \
    --date=relative \
    --pretty=format:'%Cred%h%Creset - %s%C(yellow)%d%Creset %Cgreen(%cr:%cd) %C(bold blue)<%an>%Creset'"
alias log7="git log \
    --graph \
    --abbrev-commit \
    --date=iso \
    --pretty=format:'%Cred%h%Creset - %s%C(yellow)%d%Creset %Cgreen(%cr:%cd) %C(bold blue)<%an>%Creset'"
alias log8="git log \
    --graph  \
    --all  \
    --decorate"
alias log9="git log \
    --graph  \
    --all  \
    --date=iso  \
    --date-order  \
    -C -M  \
    --pretty='format:%C(magenta)%cd%Creset %C(yellow)%h%Creset %Cgreen(%an)%Creset %Cred%d%Creset %s'"

# その他Git関連ツール
alias hbr='hub browse $(ghq list | peco | cut -d "/" -f 2,3)'
alias tiga='tig --all'