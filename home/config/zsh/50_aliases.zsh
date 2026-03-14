# --------------------------------------
# Aliases
# --------------------------------------
# alias, alias_gitを統合

# ======================
# File Operations
# ======================

alias l="eza"
alias lsa="eza --long --all --binary --bytes --header --changed --git --git-repos --icons auto --time-style long-iso --sort name --group-directories-first --hyperlink -F always"

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

# ======================
# qmd フロントエンドナレッジ検索
# ======================

alias qmd-fe='INDEX_PATH="$QMD_FRONTEND_INDEX" qmd'

# ======================
# Semantic Search (grepai)
# ======================

alias gai="grepai"
alias gais="grepai search"
alias gait="grepai trace"
alias gaiw="grepai watch"

# ======================
# Static Analysis (fossil-mcp)
# ======================

alias fsl="fossil-mcp"
alias fsls="fossil-mcp scan"
alias fsld="fossil-mcp dead-code"
alias fslc="fossil-mcp clones"

# mise/npm/yarnスクリプト実行用関数
# シェルインジェクションを防ぐため、関数として定義しクォート処理

# aliasとの競合を防ぐため、関数定義前に既存のaliasを削除
unalias prun 2>/dev/null
prun() {
  local script
  script=$(npm-scripts.ts | _fzf_cmd -p 90%,90% --) || return 1
  [ -n "$script" ] && ni run "$script"
}

unalias mrun 2>/dev/null
mrun() {
  local task
  task=$(mise tasks ls --no-header 2>/dev/null | _fzf_cmd -p 90%,90% -- --with-nth=1 --delimiter=' ' --preview 'echo {}' --preview-window=top:3:wrap) || return 1
  # 最初の列（タスク名）を抽出
  local task_name=$(echo "$task" | awk '{print $1}')
  [ -n "$task_name" ] && mise run "$task_name"
}

# ======================
# Session Management
# ======================

alias t="tmux"
alias td="tmux detach"
alias tm="tmuximum"  # セッション選択・作成・アタッチを対話的に実行

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
alias -g T="| tspin -f"
alias -g G="| grep"

alias grep="grep --color -n -I --exclude='*.svn-*' --exclude='entries' --exclude='*/cache/*'"

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

# fzf連携（scripts/に移動済み、Bun/TypeScript）
alias fshow="git-fzf-show.ts"
alias fadd="git-fzf-add.ts"
alias fssh="fzf-ssh.ts"

# ======================
# 新規ツール
# ======================

# === Diff / ページャ ===
alias dn="diffnav"       # delta連携diff ナビゲータ

# === ファイルマネージャ ===
alias sf="spf"           # TUI ファイルマネージャ（superfile）

# === コード共有 ===
alias sc="silicon --font 'UDEV Gothic 35LG' --theme 'Dracula' --pad-horiz 40 --pad-vert 40"

# walk - 選択したディレクトリに移動
function wk {
  local dir
  dir=$(walk --icons "$@") && cd "$dir"
}
