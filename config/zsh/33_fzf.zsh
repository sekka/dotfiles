export FZF_CTRL_T_COMMAND='rg --files --hidden --follow --glob "!.git/*"'
export FZF_CTRL_T_OPTS='--preview "bat --color=always --style=header,grid --line-range :100 {}"'

# コマンド履歴を出して検索・絞り込みするやつ
function fzf-select-history() {
    local tac
    if which tac > /dev/null; then
        tac="tac"
    else
        tac="tail -r"
    fi
    BUFFER=$(\history -n 1 | \
        eval $tac | \
        fzf --query "$LBUFFER")
    CURSOR=$#BUFFER
    zle clear-screen
}
zle -N fzf-select-history
bindkey '^r' fzf-select-history

# ghqでクローンしてきたリポジトリへの移動が捗る
function fzf-src() {
    local selected_dir=$(ghq list -p | fzf --query "$LBUFFER" --preview "bat --color=always --style=header,grid --line-range :80 {}/README.*")
    if [ -n "$selected_dir" ]; then
        BUFFER="cd ${selected_dir}"
        zle accept-line
    fi
    zle clear-screen
}
zle -N fzf-src
bindkey '^]' fzf-src

# checkout git branch with preview
function fzf-checkout-branch() {
    local branches branch
    branches=$(git branch | sed -e 's/\(^\* \|^  \)//g' | cut -d " " -f 1) &&
    branch=$(echo "$branches" | fzf --preview "git show --color=always {}") &&
    git checkout $(echo "$branch")
}
zle -N fzf-checkout-branch
bindkey "^b" fzf-checkout-branch

# fcd - cd to selected directory
function fcd() {
    local dir
    dir=$(find ${1:-.} \
        -path '*/\.*' \
        -prune \
        -o \
        -type d \
        -print 2> /dev/null | fzf +m) &&
    cd "$dir"
}

# fbr - checkout git branch
function fbr() {
    local branches branch
    branches=$(git branch -vv) &&
    branch=$(echo "$branches" | fzf +m) &&
    git checkout $(echo "$branch" | awk '{print $1}' | sed "s/.* //")
}

# fbrm - checkout git branch (including remote branches)
function fbrm() {
    local branches branch
    branches=$(git branch --all | grep -v HEAD) &&
    branch=$(echo "$branches" | fzf-tmux -d $(( 2 + $(wc -l <<< "$branches") )) +m) &&
    git checkout $(echo "$branch" | sed "s/.* //" | sed "s#remotes/[^/]*/##")
}

# fshow - git commit browser
function fshow() {
    git log \
        --graph \
        --color=always \
        --format="%C(auto)%h%d %s %C(black)%C(bold)%cr" "$@" |
    fzf --ansi \
        --no-sort \
        --reverse \
        --tiebreak=index \
        --bind=ctrl-s:toggle-sort \
        --bind "ctrl-m:execute:
                    (grep -o '[a-f0-9]\{7\}' | head -1 |
                    xargs -I % sh -c 'git show --color=always % | less -R') << 'FZF-EOF'
                    {}
    FZF-EOF"
}

# fadd - git add browser
function fadd() {
    local out q n addfiles
    while out=$(
            git status --short |
            awk '{if (substr($0,2,1) !~ / /) print $2}' |
            fzf-tmux --multi --exit-0 --expect=ctrl-d); do
        q=$(head -1 <<< "$out")
        n=$[$(wc -l <<< "$out") - 1]
        addfiles=(`echo $(tail "-$n" <<< "$out")`)
        [[ -z "$addfiles" ]] && continue
        if [ "$q" = ctrl-d ]; then
            git diff --color=always $addfiles | less -R
        else
            git add $addfiles
        fi
    done
}

# fssh - ssh browser
function fssh() {
    local sshLoginHost
    sshLoginHost=`cat ~/.ssh/config | grep -i ^host | awk '{print $2}' | fzf`

    if [ "$sshLoginHost" = "" ]; then
        # ex) Ctrl-C.
        return 1
    fi

    ssh ${sshLoginHost}
}
