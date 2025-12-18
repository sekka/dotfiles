# --------------------------------------
# Aliases
# --------------------------------------
# alias, alias_gitを統合

# ======================
# File Operations
# ======================

alias l="eza"
alias lsa="eza --long --all --binary --bytes --group --header --links --inode \
    --modified --created --changed --git --git-repos --time-style long-iso"

alias tree="tree -NC"
alias rm="rm -i"
alias cp="cp -i"
alias mv="mv -i"
alias mkdir="mkdir -p"

# ======================
# Development
# ======================

alias be="bundle exec"
alias sudo="sudo "

# ======================
# Search
# ======================

alias ag="ag --smart-case --stats --pager \"less -F -R\""
alias agh="ag --hidden --smart-case --stats --pager \"less -F -R\""

alias rg="rg --smart-case --stats --pretty"
alias vp="vim +PlugInstall +qall"
alias nrun="npm run \$(commands | fzf)"
alias yrun="yarn \$(commands | fzf)"
alias mrun="mise run"

# ======================
# Session Management
# ======================

alias t="tmux"
alias td="tmux detach"
alias ta="tmux attach"
alias tat="tmux attach -t"
alias tm="tmuximum"

# ======================
# Directory Navigation
# ======================

alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."

# ======================
# Global Aliases (for pipes)
# ======================

alias -g L="| less -F -R"
alias -g H="| head"
alias -g T="| tail -F -R"
alias -g G="| grep"

alias grep="grep --color -n -I --exclude='*.svn-*' \
    --exclude='entries' --exclude='*/cache/*'"

# ======================
# Clipboard Integration
# ======================

# macOS用（pbcopy）
alias -g C="| pbcopy"

# ======================
# Git Aliases
# ======================

# 基本操作
alias gft="git fetch"
alias gpl="git pull"
alias gco="git checkout"
alias gst="git status"
alias gcm="git commit -a"
alias gbr="git branch"
alias gba="git branch -a"
alias gbm="git branch --merged"
alias gbn="git branch --no-merge"

# サブモジュール
alias smu="git submodule foreach 'git checkout master; git pull'"

# 差分表示
alias gstt="git status -uno"
alias gdiff="git diff --word-diff"
