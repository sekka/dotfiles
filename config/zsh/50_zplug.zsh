# zplug初期化
# HOMEBREW_PREFIXは.zshenvで設定済み
if [[ -n "$HOMEBREW_PREFIX" ]] && [[ -d "$HOMEBREW_PREFIX/opt/zplug" ]]; then
    export ZPLUG_HOME="$HOMEBREW_PREFIX/opt/zplug"
fi

if [[ -n "$ZPLUG_HOME" ]] && [[ -f "$ZPLUG_HOME/init.zsh" ]]; then
    source "$ZPLUG_HOME/init.zsh"
else
    echo "Warning: zplug not found. Please install via 'brew install zplug'"
    return
fi

# コアプラグイン（即座に読み込み）
zplug "zsh-users/zsh-syntax-highlighting"       # https://github.com/zsh-users/zsh-syntax-highlighting # シンタックスハイライト
zplug "zsh-users/zsh-autosuggestions"           # https://github.com/zsh-users/zsh-autosuggestions     # 入力サジェスト
zplug "zsh-users/zsh-completions"               # https://github.com/zsh-users/zsh-completions         # 入力補完

# 条件付き読み込み（コマンドが利用可能な場合のみ）
zplug "zsh-users/zsh-history-substring-search", defer:1                       # https://github.com/zsh-users/zsh-history-substring-search # 入力履歴検索
zplug "mollifier/anyframe", if:"command -v peco || command -v fzf"            # https://github.com/mollifier/anyframe                     # peco/fzfなどのラッパー
zplug "b4b4r07/easy-oneliner", if:"command -v fzf"                            # https://github.com/b4b4r07/easy-oneliner                  #
zplug "b4b4r07/enhancd", use:init.sh, if:"command -v peco || command -v fzf"  # https://github.com/b4b4r07/enhancd                        # インタラクティブフィルタ

# 使用頻度の低いプラグイン（遅延読み込み）
zplug "b4b4r07/emoji-cli", defer:2, if:"command -v fzf"             # https://github.com/b4b4r07/emoji-cli # 絵文字
zplug "b4b4r07/history", defer:2                                    # https://github.com/b4b4r07/history   # 履歴強化
zplug "arks22/tmuximum", as:command, defer:2, if:"command -v tmux"  # https://github.com/arks22/tmuximum   # tmux選択UIのインタラクティブ化

# プラグイン自動インストール
if ! zplug check; then
    echo "Installing missing zplug plugins..."
    zplug install
fi

zplug load

# プラグイン設定
export ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=0'
export ENHANCD_FILTER=peco
export EMOJI_CLI_FILTER=fzf
export ZSH_HISTORY_KEYBIND_GET='^r'
export ZSH_HISTORY_FILTER_OPTIONS='--filter-branch --filter-dir'
export ZSH_HISTORY_KEYBIND_ARROW_UP='^p'
export ZSH_HISTORY_KEYBIND_ARROW_DOWN='^n'
