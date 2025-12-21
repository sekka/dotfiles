# --------------------------------------
# Development Tools Integration
# --------------------------------------
# mise, sheldon, fzf, git, tmuxを統合

# ======================
# mise - 開発環境管理ツール
# ======================

# mise activation
# miseコマンドが利用可能な場合のみ有効化
if command -v mise >/dev/null 2>&1; then
    eval "$(mise activate zsh)"
fi

# ======================
# sheldon - Plugin Manager
# ======================

if command -v sheldon >/dev/null 2>&1; then
    # プラグインをロード（自動でインストール・更新）
    eval "$(sheldon source)"

    # tmuximumの実行権限を付与（上流が権限未設定のため）
    TMUXIMUM_PATH="${HOME}/.local/share/sheldon/repos/github.com/arks22/tmuximum/tmuximum"
    if [[ -f "$TMUXIMUM_PATH" ]] && [[ ! -x "$TMUXIMUM_PATH" ]]; then
        chmod +x "$TMUXIMUM_PATH" 2>/dev/null
    fi
else
    echo "Warning: sheldon not found. Install via 'brew install sheldon'"
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
# 使用例: fbrまたはCtrl+Gでローカルブランチ、fbrmでリモートブランチも含む
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
bindkey "^g" fzf-git-branch
alias fbr='fzf-git-branch'
alias fbrm='fzf-git-branch -r'
alias fgco='fzf-git-branch'
alias fgcor='fzf-git-branch -r'

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
# ログインシェルでtmuximumを起動し、セッション管理を行う
# tmuximum: セッション選択・作成・アタッチを対話的に実行

if [[ -o login ]]; then
    # tmux未実行 & 対話シェル & 非SSH接続時のみ起動
    if [[ -z "$TMUX" ]] && [[ -n "$PS1" ]] && [[ -z "$SSH_CONNECTION" ]]; then
        command -v tmuximum >/dev/null 2>&1 && tmuximum
    fi
fi
