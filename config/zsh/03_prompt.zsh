# 色を使用出来るようにする
autoload -Uz colors; colors
autoload -U promptinit; promptinit

# vcs_info
# vcs_info宣言
autoload -Uz vcs_info

# cdrを有効にする
autoload -Uz chpwd_recent_dirs cdr add-zsh-hook
add-zsh-hook chpwd chpwd_recent_dirs

# 下のformatsの値をそれぞれの変数に入れてくれる機能の、変数の数の最大値
zstyle ":vcs_info:*" max-exports 6

# commitしていないファイルをチェック
zstyle ":vcs_info:git:*" check-for-changes true

# $vcs_info_msg_0_で表示する内容を指定
zstyle ":vcs_info:git:*" formats "%b %c%u"

# rebase途中、mergeコンフリクトなど特別な状況で表示する内容を指定
zstyle ":vcs_info:git:*" actionformats "%b|%a %c%u"

# %c で表示する文字列
zstyle ":vcs_info:git:*" stagedstr "+"

# %u で表示する文字列
zstyle ":vcs_info:git:*" unstagedstr "*"

# vcs_info呼び出し
# tmuxステータス表示
precmd () {
    psvar=()
    LANG=en_US.UTF-8 vcs_info
    [[ -n "$vcs_info_msg_0_" ]] && psvar[1]="$vcs_info_msg_0_"

    if [ ! -z $TMUX ]; then
        tmux refresh-client -S
    fi
}

# プロンプト表示設定
OK="[*'-']"
NG="[*;-;]"

PROMPT=""                                      # デフォルトのパス表示を消す
PROMPT+="
"                                              # 改行

PROMPT+="%(?.%F{green}$OK%f.%F{red}$NG%f)"     # OK/NGの顔文字
PROMPT+=" "                                    #

#PROMPT+="%F{black}%D%f"                       # 日付
#PROMPT+=" "                                   #

PROMPT+="%F{black}%*%f"                        # 時刻
PROMPT+=" "                                    #

#PROMPT+="%F{magenta}[%1~]%f"                  # カレントディレクトリ
PROMPT+="%F{blue}%B%~%b%f"                     # パス
PROMPT+=" "                                    #

PROMPT+="%1(v|%F{red}%1v%f|)"                  # git status

PROMPT+="
"                                              # 改行

PROMPT+="%B%(?.%F{green}❯❯%f.%F{red}❯❯%f)%b"   # コマンド入力待ち
PROMPT+="%B❯❯%b"                               # コマンド入力待ち
PROMPT+=" "                                    #

# もしかして時のプロンプト指定
SPROMPT="%{$fg[red]%}%{$suggest%}(*'~'%)? < もしかして %B%r%b %{$fg[red]%}? [そう!(y), 違う!(n),a,e]:${reset_color} "

# 単語の区切り文字を指定する
autoload -Uz select-word-style
select-word-style default

# ここで指定した文字は単語区切りとみなされる
# / も区切りと扱うので、^W でディレクトリ１つ分を削除できる
zstyle ':zle:*' word-chars " /=;@:{},|"
zstyle ':zle:*' word-style unspecified
