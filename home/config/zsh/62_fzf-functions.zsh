# ===========================================
# FZF インタラクティブ関数
# ===========================================

# ===========================================
# ヘルパー関数
# ===========================================

# Git リポジトリ内かチェックするヘルパー関数
function _is_git_repo() {
    git rev-parse --git-dir >/dev/null 2>&1
}

# ===========================================
# FZF インタラクティブ関数
# ===========================================

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
        if [[ -n "$TMUX" ]]; then
            selected=$(history -n 1 | tac | fzf-tmux -p 90%,90% -- \
                --query "$LBUFFER" \
                --header "📜 Command History | Enter: Execute | Esc: Cancel" \
                --preview "echo {}" \
                --preview-window=right:60%:wrap
            ) || return
        else
            selected=$(history -n 1 | tac | fzf \
                --query "$LBUFFER" \
                --header "📜 Command History | Enter: Execute | Esc: Cancel" \
                --preview "echo {}" \
                --preview-window=right:60%:wrap
            ) || return
        fi
    elif command -v tail >/dev/null 2>&1; then
        if [[ -n "$TMUX" ]]; then
            selected=$(history -n 1 | tail -r | fzf-tmux -p 90%,90% -- \
                --query "$LBUFFER" \
                --header "📜 Command History | Enter: Execute | Esc: Cancel" \
                --preview "echo {}" \
                --preview-window=right:60%:wrap
            ) || return
        else
            selected=$(history -n 1 | tail -r | fzf \
                --query "$LBUFFER" \
                --header "📜 Command History | Enter: Execute | Esc: Cancel" \
                --preview "echo {}" \
                --preview-window=right:60%:wrap
            ) || return
        fi
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

    if [[ -n "$TMUX" ]]; then
        selected_dir=$(ghq list -p 2>/dev/null | fzf-tmux -p 90%,90% -- \
            --query "$LBUFFER" \
            --header "🔍 Select Repository | Enter: cd | Esc: Cancel" \
            --preview "$preview_cmd" \
            --preview-window=right:60%:wrap
        ) || return
    else
        selected_dir=$(ghq list -p 2>/dev/null | fzf \
            --query "$LBUFFER" \
            --header "🔍 Select Repository | Enter: cd | Esc: Cancel" \
            --preview "$preview_cmd" \
            --preview-window=right:60%:wrap
        ) || return
    fi

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
        # macOS/BSD互換性のため、OSに応じてカラーオプションを変更
        if [[ "$(uname)" == "Darwin" ]]; then
            preview_cmd="ls -laG {} 2>/dev/null"
        else
            preview_cmd="ls -la --color=always {} 2>/dev/null"
        fi
    fi

    # ディレクトリ検索（fdが利用可能ならfdを使用、なければfind）
    if [[ -n "$TMUX" ]]; then
        if command -v fd >/dev/null 2>&1; then
            dir=$(fd --type d \
                --hidden \
                --exclude .git \
                --exclude node_modules \
                --exclude target \
                . "$base_dir" 2>/dev/null | fzf-tmux -p 90%,90% -- \
                --header "📁 Select Directory | Enter: cd | Esc: Cancel" \
                --preview "$preview_cmd" \
                --preview-window=right:50%:wrap
            )
        else
            dir=$(find "$base_dir" -type d \
                -not -path '*/\.*' \
                -not -path '*/node_modules/*' \
                -not -path '*/target/*' \
                2>/dev/null | fzf-tmux -p 90%,90% -- \
                --header "📁 Select Directory | Enter: cd | Esc: Cancel" \
                --preview "$preview_cmd" \
                --preview-window=right:50%:wrap
            )
        fi
    else
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

    # fzfでブランチ選択（tmux内ならpopup表示）
    if [[ -n "$TMUX" ]]; then
        branch=$(echo "$branches" | fzf-tmux -p 90%,90% -- \
            --header "🌿 Git Branches | Enter: Checkout | Ctrl+R: +Remote | Ctrl+L: Local | Esc: Cancel" \
            --preview "git show --color=always --stat {} 2>/dev/null || echo 'No commits yet'" \
            --preview-window=right:60%:wrap \
            --bind "ctrl-r:reload(git branch --all | command grep -v HEAD | sed 's/^[* ] //' | sed 's#remotes/##')+change-header(🌿 Git Branches (All) | Enter: Checkout | Ctrl+L: Local | Esc: Cancel)" \
            --bind "ctrl-l:reload(git branch | sed 's/^[* ] //')+change-header(🌿 Git Branches (Local) | Enter: Checkout | Ctrl+R: +Remote | Esc: Cancel)"
        )
    else
        branch=$(echo "$branches" | fzf \
            --header "🌿 Git Branches | Enter: Checkout | Ctrl+R: +Remote | Ctrl+L: Local | Esc: Cancel" \
            --preview "git show --color=always --stat {} 2>/dev/null || echo 'No commits yet'" \
            --preview-window=right:60%:wrap \
            --bind "ctrl-r:reload(git branch --all | command grep -v HEAD | sed 's/^[* ] //' | sed 's#remotes/##')+change-header(🌿 Git Branches (All) | Enter: Checkout | Ctrl+L: Local | Esc: Cancel)" \
            --bind "ctrl-l:reload(git branch | sed 's/^[* ] //')+change-header(🌿 Git Branches (Local) | Enter: Checkout | Ctrl+R: +Remote | Esc: Cancel)"
        )
    fi

    # ブランチが選択されたらチェックアウト
    if [[ -n "$branch" ]]; then
        # リモートブランチの場合はorigin/を削除
        branch=$(echo "$branch" | sed 's#^origin/##')
        git checkout "$branch"
    fi
}

# ------------------------------
# gifit - difitとfzfの連携
# ------------------------------
#
# 用途:
#   コミット範囲を対話的に選択してdifitで差分を確認する
#
# 使い方:
#   gifit
#
# 操作手順:
#   1. 開始コミット（FROM）を選択
#   2. 終了コミット（TO）を選択
#   3. difitで差分を表示
#
# キー操作:
#   Enter   - コミットを選択
#   Esc     - キャンセル
#
# プレビュー内容:
#   - 選択中のコミット情報
#
# 依存:
#   - git
#   - fzf
#   - difit (bunx経由またはmiseでインストール)
#
# 参考:
#   https://zenn.dev/whatasoda/articles/6e7b921bfbc968
function gifit() {
    if ! _is_git_repo; then
        echo "Error: Not a git repository"
        return 1
    fi

    local from_commit to_commit from_hash to_hash

    # 開始コミット（FROM）を選択
    if [[ -n "$TMUX" ]]; then
        from_commit=$(git log --oneline --decorate -100 --color=always | \
            fzf-tmux -p 90%,90% -- \
                --ansi \
                --header "> difit \$TO \$FROM~1" \
                --prompt "Select \$FROM>" \
                --preview 'git log --oneline --decorate --color=always -1 {1}' \
                --preview-window=top:3:wrap
        ) || return
    else
        from_commit=$(git log --oneline --decorate -100 --color=always | \
            fzf \
                --ansi \
                --header "> difit \$TO \$FROM~1" \
                --prompt "Select \$FROM>" \
                --preview 'git log --oneline --decorate --color=always -1 {1}' \
                --preview-window=top:3:wrap
        ) || return
    fi
    from_hash="${from_commit%% *}"

    # 終了コミット（TO）を選択
    if [[ -n "$TMUX" ]]; then
        to_commit=$(git log --oneline --decorate -100 --color=always $from_hash~1.. | \
            fzf-tmux -p 90%,90% -- \
                --ansi \
                --header "> difit \$TO $from_hash~1" \
                --prompt "Select \$TO>" \
                --preview 'git log --oneline --decorate --color=always -1 {1}' \
                --preview-window=top:3:wrap
        ) || return
    else
        to_commit=$(git log --oneline --decorate -100 --color=always $from_hash~1.. | \
            fzf \
                --ansi \
                --header "> difit \$TO $from_hash~1" \
                --prompt "Select \$TO>" \
                --preview 'git log --oneline --decorate --color=always -1 {1}' \
                --preview-window=top:3:wrap
        ) || return
    fi
    to_hash="${to_commit%% *}"

    # difitを実行
    difit "$to_hash" "$from_hash~1"
}

# ===========================================
# キーバインド
# ===========================================

# fzf 関数の zle 登録とキーバインド設定
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
