# --------------------------------------
# Development Tools Integration
# --------------------------------------
# mise, zplug, fzf, git, tmuxを統合

# ======================
# mise - 開発環境管理ツール
# ======================

# mise activation
# miseコマンドが利用可能な場合のみ有効化
if command -v mise >/dev/null 2>&1; then
    eval "$(mise activate zsh)"
fi

# ======================
# zplug - Plugin Manager
# ======================

# zplug初期化
# HOMEBREW_PREFIXは.zshenvで設定済み
if [[ -n "$HOMEBREW_PREFIX" ]] && [[ -d "$HOMEBREW_PREFIX/opt/zplug" ]]; then
    export ZPLUG_HOME="$HOMEBREW_PREFIX/opt/zplug"
fi

if [[ -n "$ZPLUG_HOME" ]] && [[ -f "$ZPLUG_HOME/init.zsh" ]]; then
    source "$ZPLUG_HOME/init.zsh"

    # コアプラグイン（即座に読み込み）
    zplug "zsh-users/zsh-syntax-highlighting"       # シンタックスハイライト
    zplug "zsh-users/zsh-autosuggestions"           # 入力サジェスト
    zplug "zsh-users/zsh-completions"               # 入力補完

    # 条件付き読み込み（コマンドが利用可能な場合のみ）
    zplug "zsh-users/zsh-history-substring-search", defer:1
    zplug "mollifier/anyframe", if:"command -v fzf"
    zplug "b4b4r07/easy-oneliner", if:"command -v fzf"
    zplug "b4b4r07/enhancd", use:init.sh, if:"command -v fzf"

    # 使用頻度の低いプラグイン（遅延読み込み）
    zplug "b4b4r07/emoji-cli", defer:2, if:"command -v fzf"
    zplug "arks22/tmuximum", as:command, defer:2, if:"command -v tmux"

    # プラグイン自動インストール
    if ! zplug check; then
        echo "Installing missing zplug plugins..."
        zplug install
    fi

    zplug load
else
    echo "Warning: zplug not found. Please install via 'brew install zplug'"
    # zplugが利用不可の場合でも、他のツール（fzf, tmux）の初期化は継続
fi

# プラグイン設定
export ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=0'
# enhancdのフィルター設定
export ENHANCD_FILTER=fzf
export EMOJI_CLI_FILTER=fzf

# FZF共通設定
export FZF_DEFAULT_OPTS='--height 40% --layout=reverse --border --info=inline'
export FZF_CTRL_T_COMMAND='rg --files --hidden --follow --glob "!.git/*"'
export FZF_CTRL_T_OPTS='--preview "bat --color=always --style=header,grid --line-range :100 {} 2>/dev/null || cat {}"'
export FZF_ALT_C_OPTS='--preview "ls -la {}" --preview-window=right:40%:wrap'

# fzf関数定義
# 使用例: Ctrl+Rを押すと履歴検索が開始される
function fzf-select-history() {
    # fzfが利用可能かチェック
    if ! command -v fzf >/dev/null 2>&1; then
        echo "Error: fzf is not installed"
        return 1
    fi

    local selected
    # 履歴の取得と選択（エラーハンドリング付き）
    # tacコマンドの検出（より安全な方法でevalを使わない）
    if command -v tac >/dev/null 2>&1; then
        selected=$(history -n 1 | tac | fzf --query "$LBUFFER") || return
    elif command -v tail >/dev/null 2>&1; then
        selected=$(history -n 1 | tail -r | fzf --query "$LBUFFER") || return
    else
        echo "Error: Neither 'tac' nor 'tail' command available"
        return 1
    fi

    if [[ -n "$selected" ]]; then
        BUFFER="$selected"
        CURSOR=$#BUFFER
    fi
    zle clear-screen
}
zle -N fzf-select-history
bindkey '^r' fzf-select-history

# ghqで管理されているリポジトリをfzfで選択して移動
# 使用例: Ctrl+]を押すとリポジトリ選択画面が開く
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
        # スペースを含むパスに対応するためクォート
        BUFFER="cd -- ${(qq)selected_dir}"
        zle accept-line
    else
        echo "Error: Invalid directory selected"
        return 1
    fi
    zle clear-screen
}
zle -N fzf-src
bindkey '^]' fzf-src

# gitリポジトリ内かチェックするヘルパー関数
function _is_git_repo() {
    git rev-parse --git-dir >/dev/null 2>&1
}

# Gitブランチをfzfで選択してチェックアウト
# 使用例: fbrまたはCtrl+Bでローカルブランチ、fbrmでリモートブランチも含む
function fzf-git-branch() {
    if ! _is_git_repo; then
        echo "Not a git repository"
        return 1
    fi

    local branches branch

    # -rオプションでリモートブランチも含める
    # command grepでエイリアス（-n等）を回避
    if [[ "$1" == "-r" ]]; then
        branches=$(git branch --all | command grep -v HEAD | sed 's/^[* ] //' | sed 's#remotes/##')
    else
        branches=$(git branch | sed 's/^[* ] //')
    fi

    branch=$(echo "$branches" | fzf \
        --preview "git show --color=always --stat {}" \
        --preview-window=right:60%:wrap \
        --header "Select branch to checkout" \
        --bind "ctrl-r:reload(git branch --all | command grep -v HEAD | sed 's/^[* ] //' | sed 's#remotes/##')" \
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
# ディレクトリをインタラクティブに選択して移動
# 使用例: fcdまたはfcd ~/projectsで指定ディレクトリ以下を検索
function fcd() {
    local dir
    # スペースを含むパスに対応するためクォート
    dir=$(find "${1:-.}" -type d \
        -not -path '*/\.*' \
        -not -path '*/node_modules/*' \
        -not -path '*/target/*' \
        2>/dev/null | fzf \
        --preview "ls -la {}" \
        --preview-window=right:40%:wrap \
        --header "Select directory to cd"
    ) && cd "$dir"
}

# anyframe
bindkey '^h' anyframe-widget-select-widget
bindkey '^j' anyframe-widget-insert-git-branch

# --------------------------------------
# Tmux自動起動機能
# --------------------------------------
# このスクリプトはzshシェル起動時にtmuxセッションを自動的に管理する。
# 既存セッションがあれば選択してアタッチ、なければ新規作成する。
# SSH接続時は自動起動しない。

function is_tmux_running() { [[ -n "$TMUX" ]]; }
function is_interactive_shell() { [[ -n "$PS1" ]]; }
function is_ssh_session() { [[ -n "$SSH_CONNECTION" ]]; }
function tmux_automatically_attach_session()
{
    # tmuxがインストールされていなければ終了
    if ! command -v tmux >/dev/null 2>&1; then
        return 1
    fi

    # tmuxが既に実行中の場合
    if is_tmux_running; then
        return 0
    fi

    # 非対話シェルまたはSSH接続時は自動起動しない
    if ! is_interactive_shell || is_ssh_session; then
        return 0
    fi

    # tmuxセッションが存在し、未接続のセッションがある場合
    if tmux has-session >/dev/null 2>&1 && tmux list-sessions | grep -qE '.*]$'; then
        tmux list-sessions
        echo -n "tmux: attach? (y/N/num) "
        read -r
        # y、Y、または空の入力であればセッションにアタッチ
        if [[ "$REPLY" =~ ^[Yy]$ || -z "$REPLY" ]]; then
            if tmux attach-session; then
                echo "$(tmux -V) attached session"
                return 0
            fi
        # 数字が入力された場合、指定された番号のセッションにアタッチ
        elif [[ "$REPLY" =~ ^[0-9]+$ ]]; then
            if tmux attach -t "$REPLY"; then
                echo "$(tmux -V) attached session"
                return 0
            fi
        fi
    fi

    # 新規セッション作成
    tmux new-session && echo "tmux created new session"
}

# ログインシェルでのみtmux自動起動を実行
# $SHLVLが1の場合は最初のシェル（ログインシェル）
if [[ -o login ]] || [[ "$SHLVL" -eq 1 ]]; then
    tmux_automatically_attach_session
fi
