# Initialize zplug if available
if [[ -n "$ZPLUG_HOME" ]] && [[ -f "$ZPLUG_HOME/init.zsh" ]]; then
    source "$ZPLUG_HOME/init.zsh"
elif [[ -d "/opt/homebrew/opt/zplug" ]]; then
    export ZPLUG_HOME="/opt/homebrew/opt/zplug"
    source "$ZPLUG_HOME/init.zsh"
elif [[ -d "/usr/local/opt/zplug" ]]; then
    export ZPLUG_HOME="/usr/local/opt/zplug"
    source "$ZPLUG_HOME/init.zsh"
else
    echo "Warning: zplug not found. Please install via 'brew install zplug'"
    return
fi

zplug "zsh-users/zsh-syntax-highlighting"       # https://github.com/zsh-users/zsh-syntax-highlighting      # シンタックスハイライト
zplug "zsh-users/zsh-history-substring-search"  # https://github.com/zsh-users/zsh-history-substring-search # 入力履歴検索
zplug "zsh-users/zsh-completions"               # https://github.com/zsh-users/zsh-completions              # 入力補完
zplug "zsh-users/zsh-autosuggestions"           # https://github.com/zsh-users/zsh-autosuggestions          # 入力サジェスト
zplug "mollifier/anyframe"                      # https://github.com/mollifier/anyframe                     # peco/fzfなどのラッパー
zplug "b4b4r07/easy-oneliner", if:"which fzf"   # https://github.com/b4b4r07/easy-oneliner                  #
zplug "b4b4r07/enhancd", use:init.sh            # https://github.com/b4b4r07/enhancd                        # インタラクティブフィルタ
zplug "b4b4r07/emoji-cli"                       # https://github.com/b4b4r07/emoji-cli                      # 絵文字
zplug "b4b4r07/history"                         # https://github.com/b4b4r07/history                        # 履歴強化
zplug "arks22/tmuximum", as:command             # https://github.com/arks22/tmuximum                        # tmux選択UIのインタラクティブ化

# check コマンドで未インストール項目があるかどうか verbose にチェックし
# false のとき（つまり未インストール項目がある）y/N プロンプトで
# インストールする
if ! zplug check --verbose; then
    printf "Install? [y/N]: "
    if read -q; then
        echo; zplug install
    fi
fi

# プラグインを読み込み、コマンドにパスを通す
zplug load

# メンテナンス
#zplug clear
#zplug update
#zplug status

# 補完の色を変更する
export ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=0'

# enhancdで使用するフィルタリングツールを指定する
export ENHANCD_FILTER=peco

# emoji-cliで使用するフィルタリングツールを設定する
export EMOJI_CLI_FILTER=fzf

# historyの設定
export ZSH_HISTORY_KEYBIND_GET='^r'
export ZSH_HISTORY_FILTER_OPTIONS='--filter-branch --filter-dir'
export ZSH_HISTORY_KEYBIND_ARROW_UP='^p'
export ZSH_HISTORY_KEYBIND_ARROW_DOWN='^n'
