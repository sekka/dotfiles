# プロンプト初期化と色設定
autoload -Uz colors; colors
autoload -U promptinit; promptinit

# Git情報表示設定（vcs_info）
autoload -Uz vcs_info

# ディレクトリ履歴機能（cdr）を有効化
autoload -Uz chpwd_recent_dirs cdr add-zsh-hook
add-zsh-hook chpwd chpwd_recent_dirs

# vcs_info設定
zstyle ":vcs_info:*" max-exports 6

zstyle ":vcs_info:git:*" check-for-changes true
zstyle ":vcs_info:git:*" formats "%b %c%u"
zstyle ":vcs_info:git:*" actionformats "%b|%a %c%u"
zstyle ":vcs_info:git:*" stagedstr "+"
zstyle ":vcs_info:git:*" unstagedstr "*"

# プロンプト更新処理
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

PROMPT=""
PROMPT+="
"
PROMPT+="%(?.%F{green}$OK%f.%F{red}$NG%f)"
PROMPT+=" "
PROMPT+="%F{black}%*%f"
PROMPT+=" "
PROMPT+="%F{blue}%B%~%b%f"
PROMPT+=" "
PROMPT+="%1(v|%F{red}%1v%f|)"
PROMPT+="
"
PROMPT+="%B%(?.%F{green}❯❯%f.%F{red}❯❯%f)%b"
PROMPT+="%B❯❯%b"
PROMPT+=" "

# スペルミス修正時のプロンプト
SPROMPT="%{$fg[red]%}%{$suggest%}(*'~'%)? < もしかして %B%r%b %{$fg[red]%}? [そう!(y), 違う!(n),a,e]:${reset_color} "

# 単語選択スタイル設定
autoload -Uz select-word-style
select-word-style default
zstyle ':zle:*' word-chars " /=;@:{},|"
zstyle ':zle:*' word-style unspecified
