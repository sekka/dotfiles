# ls
alias ls="ls -G" # color for darwin
alias l="ls -la"
alias la="ls -la"
alias lsa="ls -la"
alias l1="ls -1"

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

# coinmon
alias cm='coinmon -c jpy -f btc,bch,mona,dash'

# npm run
alias nrun='npm run $(commands | peco)'

# tmux
alias t='tmux'
alias td='tmux detach'
alias ta='tmux attach'
alias tat='tmux attach -t'
alias tm="tmuximum"

# git
alias gft="git fetch"
alias gpl="git pull"
alias gco="git checkout"
alias gst="git status"
alias gcm="git commit -a"
alias gbr="git branch"
alias gba="git branch -a"
alias gbm="git branch --merged"
alias gbn="git branch --no-merge"
# submoduleアップデート
alias smu="git submodule foreach 'git checkout master; git pull'"
# Untracked filesを表示せず，not stagedと，stagedだけの状態を出力する
alias gstt="git status -uno"
# 行ごとの差分ではなく単語レベルでの差分を色付きで表示する
alias gdifff="git diff --word-diff"
# いい感じのグラフでログを表示
alias log="log9"
alias log0="git log --graph --all --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(bold white)― %an%C(reset)%C(bold yellow)%d%C(reset)' --abbrev-commit --date=relative"
alias log1="git log --pretty='format:%C(yellow)%h%Creset %C(magenta)%cd%Creset %s %Cgreen(%an)%Creset %Cred%d%Creset%C(black bold)%ar%Creset' --date=iso"
alias log2="git log --graph --all --format=format:'%C(bold blue)%h%C(reset) - %C(bold cyan)%aD%C(reset) %C(bold green)(%ar)%C(reset)%C(bold yellow)%d%C(reset)%n''          %C(white)%s%C(reset) %C(bold white)― %an%C(reset)' --abbrev-commit"
alias log3="git log --graph --date-order -C -M --pretty=format:'<%h> %ad [%an] %Cgreen%d%Creset %s' --all --date=short"
alias log4="git log --graph --pretty='format:%C(yellow)%h%Cblue%d%Creset %s %C(black bold)%an, %ar%Creset'"
alias log5="git log --graph --date=short --decorate=short --pretty=format:'%Cgreen%h %Creset%cd %Cblue%cn %Cred%d %Creset%s'"
alias log6="git log --graph --pretty=format:'%Cred%h%Creset - %s%C(yellow)%d%Creset %Cgreen(%cr:%cd) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative"
alias log7="git log --graph --pretty=format:'%Cred%h%Creset - %s%C(yellow)%d%Creset %Cgreen(%cr:%cd) %C(bold blue)<%an>%Creset' --abbrev-commit --date=iso"
alias log8="git log --graph --all --decorate"
alias log9="git log --graph --all --date=iso --date-order -C -M --pretty='format:%C(magenta)%cd%Creset %C(yellow)%h%Creset %Cgreen(%an)%Creset %Cred%d%Creset %s'"
# hub + pecoでリポジトリをブラウザで開く
alias hbr='hub browse $(ghq list | peco | cut -d "/" -f 2,3)'

# cd
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# グローバルエイリアス
alias -g L='| less'
alias -g H='| head'
alias -g T='| tail'
alias -g G='| grep'
alias -g CL='| color'

# -n 行数表示, -I バイナリファイル無視, svn関係のファイルを無視
alias grep="grep --color -n -I --exclude='*.svn-*' --exclude='entries' --exclude='*/cache/*'"

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
