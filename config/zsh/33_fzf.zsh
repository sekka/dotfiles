# FZF共通設定
export FZF_DEFAULT_OPTS='--height 40% --layout=reverse --border --info=inline'
export FZF_CTRL_T_COMMAND='rg --files --hidden --follow --glob "!.git/*"'
export FZF_CTRL_T_OPTS='--preview "bat --color=always --style=header,grid --line-range :100 {} 2>/dev/null || cat {}"'
export FZF_ALT_C_OPTS='--preview "ls -la {}" --preview-window=right:40%:wrap'

# fzf関数定義
function fzf-select-history() {
    # fzfが利用可能かチェック
    if ! command -v fzf >/dev/null 2>&1; then
        echo "Error: fzf is not installed"
        return 1
    fi
    
    local tac selected
    # tacコマンドの検出（よりポータブルな方法）
    if command -v tac >/dev/null 2>&1; then
        tac="tac"
    elif command -v tail >/dev/null 2>&1; then
        tac="tail -r"
    else
        echo "Error: Neither 'tac' nor 'tail' command available"
        return 1
    fi
    
    # 履歴の取得と選択（エラーハンドリング付き）
    selected=$(history -n 1 | eval "$tac" | fzf --query "$LBUFFER") || return
    
    if [[ -n "$selected" ]]; then
        BUFFER="$selected"
        CURSOR=$#BUFFER
    fi
    zle clear-screen
}
zle -N fzf-select-history
bindkey '^r' fzf-select-history

function fzf-src() {
    # 必要なコマンドの存在チェック
    if ! command -v ghq >/dev/null 2>&1; then
        echo "Error: ghq is not installed"
        return 1
    fi
    if ! command -v fzf >/dev/null 2>&1; then
        echo "Error: fzf is not installed"  
        return 1
    fi
    
    local selected_dir
    selected_dir=$(ghq list -p 2>/dev/null | fzf --query "$LBUFFER" --preview "bat --color=always --style=header,grid --line-range :80 {}/README.* 2>/dev/null || ls -la {}") || return
    
    if [[ -n "$selected_dir" ]] && [[ -d "$selected_dir" ]]; then
        BUFFER="cd ${selected_dir}"
        zle accept-line
    else
        echo "Error: Invalid directory selected"
        return 1
    fi
    zle clear-screen
}
zle -N fzf-src
bindkey '^]' fzf-src

function fzf-git-branch() {
    # gitリポジトリ内かチェック
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "Not a git repository"
        return 1
    fi
    
    local branches branch include_remote=false
    
    # -rオプションでリモートブランチも含める
    if [[ "$1" == "-r" ]]; then
        include_remote=true
        branches=$(git branch --all | grep -v HEAD | sed 's/^[* ] //' | sed 's#remotes/##')
    else
        branches=$(git branch | sed 's/^[* ] //')
    fi
    
    branch=$(echo "$branches" | fzf \
        --preview "git show --color=always --stat {}" \
        --preview-window=right:60%:wrap \
        --header "Select branch to checkout" \
        --bind "ctrl-r:reload(git branch --all | grep -v HEAD | sed 's/^[* ] //' | sed 's#remotes/##')" \
        --bind "ctrl-l:reload(git branch | sed 's/^[* ] //')"
    )
    
    if [[ -n "$branch" ]]; then
        # リモートブランチの場合はorigin/を削除
        branch=$(echo "$branch" | sed 's#^origin/##')
        git checkout "$branch"
    fi
}

zle -N fzf-git-branch
bindkey "^b" fzf-git-branch
alias fbr='fzf-git-branch'
alias fbrm='fzf-git-branch -r'

# 追加fzf関数
function fcd() {
    local dir
    dir=$(find ${1:-.} -type d \
        -not -path '*/\.*' \
        -not -path '*/node_modules/*' \
        -not -path '*/target/*' \
        2>/dev/null | fzf \
        --preview "ls -la {}" \
        --preview-window=right:40%:wrap \
        --header "Select directory to cd"
    ) && cd "$dir"
}

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

function fadd() {
    # gitリポジトリ内かチェック
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "Not a git repository"
        return 1
    fi
    
    local files
    files=$(git status --porcelain | awk '{print $2}' | fzf \
        --multi \
        --preview "git diff --color=always {} 2>/dev/null || cat {}" \
        --preview-window=right:60%:wrap \
        --header "Select files to add (Tab: multi-select, Ctrl-d: diff)" \
        --bind "ctrl-d:execute(git diff --color=always {} | less -R)"
    )
    
    if [[ -n "$files" ]]; then
        echo "$files" | xargs git add
        echo "Added files:"
        echo "$files"
    fi
}

function fssh() {
    if [[ ! -f ~/.ssh/config ]]; then
        echo "SSH config file not found"
        return 1
    fi
    
    local host
    host=$(awk '/^Host / {print $2}' ~/.ssh/config | grep -v '*' | fzf \
        --preview "grep -A 10 '^Host {}' ~/.ssh/config" \
        --preview-window=right:40%:wrap \
        --header "Select SSH host"
    )
    
    if [[ -n "$host" ]]; then
        ssh "$host"
    fi
}
