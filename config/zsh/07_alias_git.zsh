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
