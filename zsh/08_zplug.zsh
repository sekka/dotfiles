zplug "zsh-users/zsh-syntax-highlighting"
zplug "zsh-users/zsh-history-substring-search"
zplug "zsh-users/zsh-completions"
zplug "zsh-users/zsh-autosuggestions"
zplug "mollifier/anyframe"
zplug "b4b4r07/easy-oneliner", if:"which fzf"
zplug "b4b4r07/enhancd", use:init.sh
zplug "b4b4r07/emoji-cli"
zplug "b4b4r07/history"
zplug "arks22/tmuximum", as:command

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
zplug clear
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
