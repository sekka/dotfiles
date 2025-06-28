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

# Git log表示エイリアス（厳選版）

# シンプルなワンライン表示（デフォルト）
alias glog="git log \
    --graph \
    --date=short \
    --pretty='format:%C(yellow)%h%C(reset) %C(green)%ad%C(reset) %C(blue)%an%C(reset)%C(red)%d%C(reset) %s'"

# 詳細表示（相対時間、全ブランチ）
alias glogd="git log \
    --graph \
    --all \
    --date=relative \
    --pretty='format:%C(yellow)%h%C(reset) %C(green)(%ar)%C(reset) %C(blue)%an%C(reset)%C(red)%d%C(reset) %s'"

# 統計情報付き詳細表示（変更ファイル数表示）
alias glogs="git log \
    --graph \
    --stat \
    --date=iso \
    --pretty='format:%C(yellow)commit %H%C(reset)%C(red)%d%C(reset)%nAuthor: %C(blue)%an <%ae>%C(reset)%nDate:   %C(green)%ad%C(reset)%n%n    %s%n'"

# 旧エイリアスから移行用
alias log="glog"

# その他Git関連ツール
alias hbr='hub browse $(ghq list | peco | cut -d "/" -f 2,3)'
alias tiga='tig --all'
