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

# ======================
# Plugin Configuration
# ======================

# プラグイン設定
export ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=0'
export ENHANCD_FILTER=fzf
export EMOJI_CLI_FILTER=fzf

# zsh-auto-notify設定
# 実行時間がこの秒数を超えたコマンドは通知を表示
export AUTO_NOTIFY_THRESHOLD=30  # デフォルト: 30秒
export AUTO_NOTIFY_TITLE="Command Completed"
export AUTO_NOTIFY_BODY="Finished in %elapsed seconds"

# zsh-you-should-use設定
# エイリアス提案メッセージの表示位置（before: コマンド実行前、after: 実行後）
export YSU_MESSAGE_POSITION="after"
# 提案を無視するコマンド（スペース区切り）
export YSU_IGNORED_ALIASES=("g")  # 短すぎるエイリアスは無視

# ======================
# FZF Configuration
# ======================

# FZF共通設定
export FZF_DEFAULT_OPTS='--height 40% --layout=reverse --border --info=inline'
export FZF_CTRL_T_COMMAND='rg --files --hidden --follow --glob "!.git/*"'
export FZF_CTRL_T_OPTS='--preview "bat --color=always --style=header,grid --line-range :100 {} 2>/dev/null || cat {}"'
export FZF_ALT_C_OPTS='--preview "ls -la {}" --preview-window=right:40%:wrap'

# ======================
# Helper Functions
# ======================

# gitリポジトリ内かチェックするヘルパー関数
function _is_git_repo() {
    git rev-parse --git-dir >/dev/null 2>&1
}

# ======================
# FZF Interactive Functions
# ======================

# ------------------------------
# 履歴検索: fzf-select-history
# ------------------------------
# 機能: コマンド履歴をfzfでインタラクティブに検索・選択
#
# キーバインド:
#   Ctrl+R  - この関数を起動
#
# fzf内のキー操作:
#   Enter   - 選択したコマンドを実行
#   Esc     - キャンセル
#
# 依存:
#   - fzf
#   - tac または tail (履歴の逆順表示用)
function fzf-select-history() {
    if ! command -v fzf >/dev/null 2>&1; then
        echo "Error: fzf is not installed"
        return 1
    fi

    local selected
    # 履歴の取得と選択（新しい順）
    if command -v tac >/dev/null 2>&1; then
        selected=$(history -n 1 | tac | fzf \
            --query "$LBUFFER" \
            --header "📜 Command History | Enter: Execute | Esc: Cancel" \
            --preview "echo {}" \
            --preview-window=up:3:wrap
        ) || return
    elif command -v tail >/dev/null 2>&1; then
        selected=$(history -n 1 | tail -r | fzf \
            --query "$LBUFFER" \
            --header "📜 Command History | Enter: Execute | Esc: Cancel" \
            --preview "echo {}" \
            --preview-window=up:3:wrap
        ) || return
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

# ------------------------------
# リポジトリ移動: fzf-src
# ------------------------------
# 機能: ghqで管理されているリポジトリをfzfで選択して移動
#
# キーバインド:
#   Ctrl+]  - この関数を起動
#
# fzf内のキー操作:
#   Enter   - 選択したリポジトリに移動
#   Esc     - キャンセル
#
# プレビュー内容:
#   - READMEファイル（存在する場合）
#   - gitステータス
#   - 最終コミット情報
#   - ディレクトリ一覧
#
# 依存:
#   - ghq
#   - fzf
#   - bat (プレビュー強化用、オプション)
#   - eza (プレビュー強化用、オプション)
function fzf-src() {
    if ! command -v ghq >/dev/null 2>&1; then
        echo "Error: ghq is not installed"
        return 1
    fi
    if ! command -v fzf >/dev/null 2>&1; then
        echo "Error: fzf is not installed"
        return 1
    fi

    local selected_dir
    # プレビューコマンドを構築（利用可能なツールに応じて最適化）
    local preview_cmd="
        echo '📁 Directory: {}' && echo '' &&
        if [[ -d {}/.git ]]; then
            echo '🔀 Git Status:' &&
            git -C {} status -sb 2>/dev/null &&
            echo '' &&
            echo '📝 Latest Commit:' &&
            git -C {} log -1 --oneline --color=always 2>/dev/null &&
            echo ''
        fi &&
        if [[ -f {}/README.md ]]; then
            echo '📖 README:' &&
            bat --color=always --style=plain --line-range :30 {}/README.md 2>/dev/null ||
            cat {}/README.md 2>/dev/null | head -30
        elif [[ -f {}/README ]]; then
            echo '📖 README:' &&
            bat --color=always --style=plain --line-range :30 {}/README 2>/dev/null ||
            cat {}/README 2>/dev/null | head -30
        else
            echo '📂 Files:' &&
            if command -v eza >/dev/null 2>&1; then
                eza -la --git --color=always {} 2>/dev/null
            else
                ls -la {} 2>/dev/null
            fi
        fi
    "

    selected_dir=$(ghq list -p 2>/dev/null | fzf \
        --query "$LBUFFER" \
        --header "🔍 Select Repository | Enter: cd | Esc: Cancel" \
        --preview "$preview_cmd" \
        --preview-window=right:60%:wrap
    ) || return

    if [[ -n "$selected_dir" ]] && [[ -d "$selected_dir" ]]; then
        BUFFER="cd -- ${(qq)selected_dir}"
        zle accept-line
    else
        echo "Error: Invalid directory selected"
        return 1
    fi
    zle clear-screen
}

# ------------------------------
# ディレクトリ移動: fcd
# ------------------------------
# 機能: ディレクトリをfzfでインタラクティブに選択して移動
#
# 使用例:
#   fcd              - カレントディレクトリ以下を検索
#   fcd ~/projects   - 指定ディレクトリ以下を検索
#
# fzf内のキー操作:
#   Enter   - 選択したディレクトリに移動
#   Esc     - キャンセル
#
# プレビュー内容:
#   - ディレクトリ内のファイル一覧（eza優先、なければls）
#
# 除外パターン:
#   - 隠しディレクトリ（.から始まる）
#   - node_modules
#   - target
#
# 依存:
#   - fzf
#   - fd (推奨、なければfindを使用)
#   - eza (プレビュー強化用、オプション)
function fcd() {
    if ! command -v fzf >/dev/null 2>&1; then
        echo "Error: fzf is not installed"
        return 1
    fi

    local dir
    local base_dir="${1:-.}"

    # プレビューコマンドを構築
    local preview_cmd
    if command -v eza >/dev/null 2>&1; then
        preview_cmd="eza -la --git --color=always --group-directories-first {} 2>/dev/null"
    else
        preview_cmd="ls -la --color=always {} 2>/dev/null"
    fi

    # ディレクトリ検索（fdが利用可能ならfdを使用、なければfind）
    if command -v fd >/dev/null 2>&1; then
        dir=$(fd --type d \
            --hidden \
            --exclude .git \
            --exclude node_modules \
            --exclude target \
            . "$base_dir" 2>/dev/null | fzf \
            --header "📁 Select Directory | Enter: cd | Esc: Cancel" \
            --preview "$preview_cmd" \
            --preview-window=right:50%:wrap
        )
    else
        dir=$(find "$base_dir" -type d \
            -not -path '*/\.*' \
            -not -path '*/node_modules/*' \
            -not -path '*/target/*' \
            2>/dev/null | fzf \
            --header "📁 Select Directory | Enter: cd | Esc: Cancel" \
            --preview "$preview_cmd" \
            --preview-window=right:50%:wrap
        )
    fi

    # ディレクトリが選択されたら移動
    [[ -n "$dir" ]] && cd "$dir"
}

# ------------------------------
# Gitブランチ切り替え: fzf-git-branch
# ------------------------------
# 機能: Gitブランチをfzfでインタラクティブに選択してチェックアウト
#
# キーバインド:
#   Ctrl+G  - この関数を起動（ローカルブランチのみ）
#
# エイリアス:
#   fbr     - ローカルブランチのみ表示
#   fbrm    - リモートブランチも含めて表示
#   fgco    - fbr と同じ
#   fgcor   - fbrm と同じ
#
# fzf内のキー操作:
#   Enter   - 選択したブランチにチェックアウト
#   Ctrl+R  - リモートブランチも含めて再読み込み
#   Ctrl+L  - ローカルブランチのみに切り替え
#   Esc     - キャンセル
#
# プレビュー内容:
#   - ブランチの最新コミット（統計情報付き）
#
# 依存:
#   - git
#   - fzf
function fzf-git-branch() {
    if ! _is_git_repo; then
        echo "Error: Not a git repository"
        return 1
    fi

    local branches branch
    local branch_type="${1:--l}"  # デフォルトはローカルのみ

    # ブランチ一覧を取得
    if [[ "$1" == "-r" ]]; then
        # リモートブランチも含める
        branches=$(git branch --all | command grep -v HEAD | sed 's/^[* ] //' | sed 's#remotes/##')
    else
        # ローカルブランチのみ
        branches=$(git branch | sed 's/^[* ] //')
    fi

    # ブランチが存在しない場合
    if [[ -z "$branches" ]]; then
        echo "Error: No branches found"
        return 1
    fi

    # fzfでブランチ選択
    branch=$(echo "$branches" | fzf \
        --header "🌿 Git Branches | Enter: Checkout | Ctrl+R: +Remote | Ctrl+L: Local | Esc: Cancel" \
        --preview "git show --color=always --stat {} 2>/dev/null || echo 'No commits yet'" \
        --preview-window=right:60%:wrap \
        --bind "ctrl-r:reload(git branch --all | command grep -v HEAD | sed 's/^[* ] //' | sed 's#remotes/##')+change-header(🌿 Git Branches (All) | Enter: Checkout | Ctrl+L: Local | Esc: Cancel)" \
        --bind "ctrl-l:reload(git branch | sed 's/^[* ] //')+change-header(🌿 Git Branches (Local) | Enter: Checkout | Ctrl+R: +Remote | Esc: Cancel)"
    )

    # ブランチが選択されたらチェックアウト
    if [[ -n "$branch" ]]; then
        # リモートブランチの場合はorigin/を削除
        branch=$(echo "$branch" | sed 's#^origin/##')
        git checkout "$branch"
    fi
}

# ======================
# Key Bindings
# ======================

# fzf関数のzle登録とキーバインド設定
zle -N fzf-select-history
zle -N fzf-src
zle -N fzf-git-branch

bindkey '^r' fzf-select-history  # Ctrl+R: 履歴検索
bindkey '^]' fzf-src             # Ctrl+]: リポジトリ移動
bindkey '^g' fzf-git-branch      # Ctrl+G: ブランチ切り替え

# エイリアス設定
alias fbr='fzf-git-branch'       # ローカルブランチ
alias fbrm='fzf-git-branch -r'   # リモート含む全ブランチ
alias fgco='fzf-git-branch'      # git checkout のエイリアス
alias fgcor='fzf-git-branch -r'  # git checkout (remote) のエイリアス

# ======================
# anyframe Plugin
# ======================

# anyframe keybindings
bindkey '^h' anyframe-widget-select-widget
bindkey '^j' anyframe-widget-insert-git-branch

# ======================
# Tmux Auto Start
# ======================

# ログインシェルでtmuximumを起動し、セッション管理を行う
# tmuximum: セッション選択・作成・アタッチを対話的に実行
if [[ -o login ]]; then
    # tmux未実行 & 対話シェル & 非SSH接続時のみ起動
    if [[ -z "$TMUX" ]] && [[ -n "$PS1" ]] && [[ -z "$SSH_CONNECTION" ]]; then
        command -v tmuximum >/dev/null 2>&1 && tmuximum
    fi
fi
