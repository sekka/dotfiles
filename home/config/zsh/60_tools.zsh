# --------------------------------------
# Development Tools Integration
# --------------------------------------
# mise, zplug, fzf, git, peco, tmuxを統合

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
    zplug "mollifier/anyframe", if:"command -v peco || command -v fzf"
    zplug "b4b4r07/easy-oneliner", if:"command -v fzf"
    zplug "b4b4r07/enhancd", use:init.sh, if:"command -v peco || command -v fzf"

    # 使用頻度の低いプラグイン（遅延読み込み）
    zplug "b4b4r07/emoji-cli", defer:2, if:"command -v fzf"
    zplug "b4b4r07/history", defer:2
    zplug "arks22/tmuximum", as:command, defer:2, if:"command -v tmux"

    # プラグイン自動インストール
    if ! zplug check; then
        echo "Installing missing zplug plugins..."
        zplug install
    fi

    zplug load
else
    echo "Warning: zplug not found. Please install via 'brew install zplug'"
    # zplugが利用不可の場合でも、他のツール（fzf, peco, tmux）の初期化は継続
fi

# プラグイン設定
export ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=0'
# enhancdのフィルター設定（fzf優先、なければpeco）
if command -v fzf >/dev/null 2>&1; then
    export ENHANCD_FILTER=fzf
elif command -v peco >/dev/null 2>&1; then
    export ENHANCD_FILTER=peco
fi
export EMOJI_CLI_FILTER=fzf
export ZSH_HISTORY_KEYBIND_GET='^r'
export ZSH_HISTORY_FILTER_OPTIONS='--filter-branch --filter-dir'
export ZSH_HISTORY_KEYBIND_ARROW_UP='^p'
export ZSH_HISTORY_KEYBIND_ARROW_DOWN='^n'

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

# Gitブランチをfzfで選択してチェックアウト
# 使用例: fbrまたはCtrl+Bでローカルブランチ、fbrmでリモートブランチも含む
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

# Gitコミットログをfzfで閲覧・選択
# 使用例: fshowでコミット一覧を表示、Enterで詳細表示
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

# Gitの変更ファイルをfzfで選択してadd
# 使用例: faddで変更ファイル一覧から選択、Tabで複数選択可能
function fadd() {
    # gitリポジトリ内かチェック
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "Not a git repository"
        return 1
    fi

    local files
    # NUL区切りで安全にファイル名を処理（スペース・改行対応）
    files=$(git diff -z --name-only --diff-filter=ACMRU | fzf \
        --read0 \
        --print0 \
        --multi \
        --preview "git diff --color=always {} 2>/dev/null || cat {}" \
        --preview-window=right:60%:wrap \
        --header "Select files to add (Tab: multi-select, Ctrl-d: diff)" \
        --bind "ctrl-d:execute(git diff --color=always {} | less -R)"
    )

    if [[ -n "$files" ]]; then
        echo "$files" | xargs -0 git add
        echo "Added files:"
        echo "$files" | tr '\0' '\n'
    fi
}

# SSH接続先をfzfで選択して接続
# 使用例: fsshで~/.ssh/configに定義されたホスト一覧から選択
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

# ======================
# Git Utilities
# ======================

# Git差分アーカイブ作成関数
function git_diff_archive() {
  local h="HEAD"
  local files=()

  if [ $# -eq 1 ]; then
    # 数値チェック（exprの代わりに正規表現を使用）
    if [[ "$1" =~ ^[0-9]+$ ]]; then
      # コマンドインジェクションを防ぐため、evalを使わずに配列で処理
      files=(${(f)"$(git diff --diff-filter=d --name-only HEAD~${1} HEAD)"})
    else
      files=(${(f)"$(git diff --diff-filter=d --name-only ${1} HEAD)"})
    fi
  elif [ $# -eq 2 ]; then
    h="$1"
    files=(${(f)"$(git diff --diff-filter=d --name-only ${2} ${1})"})
  fi

  if [ ${#files[@]} -gt 0 ]; then
    git archive --format=zip --prefix=root/ "$h" "${files[@]}" -o archive.zip
  else
    # ファイルがない場合は空のアーカイブを作成
    git archive --format=zip --prefix=root/ "$h" -o archive.zip
  fi
}

# ======================
# peco Functions
# ======================

function peco-select-history() {
    # evalを使わずに条件分岐で直接実行（セキュリティ向上）
    if command -v tac >/dev/null 2>&1; then
        BUFFER=$(\history -n 1 | tac | peco --query "$LBUFFER")
    elif command -v tail >/dev/null 2>&1; then
        BUFFER=$(\history -n 1 | tail -r | peco --query "$LBUFFER")
    else
        echo "Error: Neither 'tac' nor 'tail' command available"
        return 1
    fi
    CURSOR=$#BUFFER
    zle clear-screen
}
# 無効化（fzfを使用）
# fzfの方が高速で、プレビュー機能やより豊富なオプションを提供するため移行
# zle -N peco-select-history
# bindkey '^r' peco-select-history

function peco-src () {
    local selected_dir=$(ghq list -p | peco --query "$LBUFFER")
    if [ -n "$selected_dir" ]; then
        BUFFER="cd ${selected_dir}"
        zle accept-line
    fi
    zle clear-screen
}
# 無効化（fzfを使用）
# fzfの方がファイルプレビュー機能があり、リポジトリの内容を確認しながら選択できるため移行
# zle -N peco-src
# bindkey '^]' peco-src

function commands () {
    # package.jsonとjqの存在確認
    if [[ ! -f package.json ]]; then
        echo "Error: package.json not found in current directory" >&2
        return 1
    fi
    if ! command -v jq >/dev/null 2>&1; then
        echo "Error: jq is not installed" >&2
        return 1
    fi
    jq -r '.scripts | keys[]' package.json
}

# anyframe
bindkey '^h' anyframe-widget-select-widget
bindkey '^j' anyframe-widget-insert-git-branch
bindkey '^k' anyframe-widget-checkout-git-branch

# --------------------------------------
# Tmux自動起動機能
# --------------------------------------
# このスクリプトはzshシェル起動時にtmuxセッションを自動的に管理する。
# 既存セッションがあれば選択してアタッチ、なければ新規作成する。
# SSH接続時は自動起動しない。

function is_exists() { type "$1" >/dev/null 2>&1; return $?; }

function is_osx() { [[ $OSTYPE == darwin* ]]; }
function is_tmux_runnning() { [ ! -z "$TMUX" ]; }
function shell_has_started_interactively() { [ ! -z "$PS1" ]; }
function is_ssh_running() { [ ! -z "$SSH_CONNECTION" ]; }
function tmux_automatically_attach_session()
{
    # tmuxが既に実行中の場合
    if is_tmux_runnning; then
        # tmuxがインストールされていなければ終了
        ! is_exists 'tmux' && return 1

        if is_exists 'emojify'; then
            echo :beer: :relaxed: | emojify
        else
            echo "tmux is running."
        fi
    else
        # tmuxが実行中でない場合
        if shell_has_started_interactively && ! is_ssh_running; then
            # 対話的なシェルであり、SSH経由でない場合
            if ! is_exists 'tmux'; then
                echo 'Error: tmux command not found' 2>&1
                return 1
            fi

            # tmuxセッションが存在し、未接続のセッションがある場合
            if tmux has-session >/dev/null 2>&1 && tmux list-sessions | grep -qE '.*]$'; then
                tmux list-sessions
                echo -n "tmux: attach? (y/N/num) "
                read -r
                # y、Y、または空の入力であればセッションにアタッチ
                if [[ "$REPLY" =~ ^[Yy]$ ]] || [[ "$REPLY" == '' ]]; then
                    tmux attach-session
                    if [ $? -eq 0 ]; then
                        echo "$(tmux -V) attached session"
                        return 0
                    fi
                # 数字が入力された場合、指定された番号のセッションにアタッチ
                elif [[ "$REPLY" =~ ^[0-9]+$ ]]; then
                    tmux attach -t "$REPLY"
                    if [ $? -eq 0 ]; then
                        echo "$(tmux -V) attached session"
                        return 0
                    fi
                fi
            fi

            # macOSであり、reattach-to-user-namespaceがインストールされている場合
            if is_osx && is_exists 'reattach-to-user-namespace'; then
                # パス変数の定義（XDG準拠）
                local tmux_config_file="${XDG_CONFIG_HOME:-$HOME/.config}/tmux/tmux.conf"
                local dotfiles_dir="${HOME}/dotfiles"
                local tmux_session_script="$dotfiles_dir/home/.tmux/new-session"

                # フォールバック: 従来の設定ファイルパス
                [[ ! -f "$tmux_config_file" ]] && tmux_config_file="$HOME/.tmux.conf"

                # 設定ファイルの存在確認
                if [[ ! -f "$tmux_config_file" ]]; then
                    echo "Error: tmux config file not found" >&2
                    return 1
                fi

                # ヒアドキュメントを使用して設定を作成
                tmux -f <(cat <<EOF
$(cat "$tmux_config_file")
set-option -g default-command "reattach-to-user-namespace -l $SHELL"
EOF
                ) new-session \; source "$tmux_session_script" && echo "$(tmux -V) created new session supported OS X"
            else
                tmux new-session && echo "tmux created new session"
            fi
        fi
    fi
}

# ログインシェルでのみtmux自動起動を実行
# $SHLVLが1の場合は最初のシェル（ログインシェル）
if [[ -o login ]] || [[ "$SHLVL" -eq 1 ]]; then
    tmux_automatically_attach_session
fi
