# ===========================================
# sheldon - プラグインマネージャー
# ===========================================

if command -v sheldon >/dev/null 2>&1; then
    # プラグインをロード（自動でインストール・更新）
    eval "$(sheldon source)"

    # tmuximum の実行権限を付与（上流が権限未設定のため）
    TMUXIMUM_PATH="${HOME}/.local/share/sheldon/repos/github.com/arks22/tmuximum/tmuximum"
    if [[ -f "$TMUXIMUM_PATH" ]] && [[ ! -x "$TMUXIMUM_PATH" ]]; then
        chmod +x "$TMUXIMUM_PATH" 2>/dev/null
    fi
else
    echo "Warning: sheldon not found. Install via 'brew install sheldon'"
fi

# ===========================================
# zoxide - スマートディレクトリジャンプ
# ===========================================
# cd コマンドを zoxide で置き換え
# 使用方法:
#   cd         - インタラクティブに選択（tmux内ならpopup表示）
#   cd foo     - "foo" を含むディレクトリにジャンプ
#   cd foo bar - "foo" と "bar" を含むディレクトリにジャンプ
#   cdi        - fzf でインタラクティブに選択
if command -v zoxide >/dev/null 2>&1; then
    # 除外ディレクトリ設定（空=全てのディレクトリを追跡、$HOMEも含める）
    export _ZO_EXCLUDE_DIRS=""

    # zoxide初期化（cd,cdiコマンド生成）
    eval "$(zoxide init zsh --cmd cd)"

    # tmux popup対応
    if [[ -n "$TMUX" ]]; then
        export _ZO_FZF_OPTS="--tmux 90%,90%"
    fi

    # 引数なしcdでインタラクティブ選択
    function cd() {
        if [[ $# -eq 0 ]]; then
            __zoxide_zi
        else
            __zoxide_z "$@"
        fi
    }
fi

# ===========================================
# プラグイン設定
# ===========================================

# プラグイン設定
export ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=0'

# emoji-cli - 絵文字選択（tmux内ならpopup表示）
if [[ -n "$TMUX" ]]; then
    export EMOJI_CLI_FILTER="fzf-tmux -p 90%,90% --"
else
    export EMOJI_CLI_FILTER="fzf"
fi

# forgit - Git操作をfzfで強化（popup対応）
export FORGIT_FZF_DEFAULT_OPTS="
--tmux 90%,90%
--bind='ctrl-e:execute(echo {} | pbcopy)'
"

# zsh-auto-notify設定
# 実行時間がこの秒数を超えたコマンドは通知を表示
export ZSH_AUTO_NOTIFY_THRESHOLD=30  # デフォルト: 30秒
export ZSH_AUTO_NOTIFY_TITLE="Command Completed"
export ZSH_AUTO_NOTIFY_BODY="Finished in %elapsed seconds"

# zsh-you-should-use設定
# エイリアス提案メッセージの表示位置（before: コマンド実行前、after: 実行後）
export YSU_MESSAGE_POSITION="after"
# 提案を無視するコマンド（スペース区切り）
export YSU_IGNORED_ALIASES=("g")  # 短すぎるエイリアスは無視

# ===========================================
# FZF 設定
# ===========================================

# FZF 共通設定
export FZF_DEFAULT_OPTS='--height 40% --layout=reverse --border --info=inline'
export FZF_CTRL_T_COMMAND='rg --files --hidden --follow --glob "!.git/*"'
export FZF_CTRL_T_OPTS='--preview "bat --color=always --style=header,grid --line-range :100 {} 2>/dev/null || cat {}"'
export FZF_ALT_C_OPTS='--preview "ls -la {}" --preview-window=right:40%:wrap'

# tmux popup 設定（tmux 3.2 以上が必要）
# tmux セッション内で fzf を自動的に popup で表示
export FZF_TMUX=1
export FZF_TMUX_OPTS="-p 90%,90%"  # 画面の90%サイズで中央表示

# fzfデフォルトキーバインド読み込み
# Ctrl+T: ファイル選択、Alt+C: ディレクトリ移動
if [[ -f "$(brew --prefix)/opt/fzf/shell/key-bindings.zsh" ]]; then
    source "$(brew --prefix)/opt/fzf/shell/key-bindings.zsh"
fi

# ===========================================
# anyframe プラグイン
# ===========================================

# anyframe 設定（tmux 内なら popup 表示）
if [[ -n "$TMUX" ]]; then
    export ANYFRAME_SELECTOR="fzf-tmux -p 90%,90% --"
else
    export ANYFRAME_SELECTOR="fzf"
fi

# anyframe keybindings
bindkey '^h' anyframe-widget-select-widget
bindkey '^j' anyframe-widget-insert-git-branch
