# 参考:
# https://gist.github.com/mollifier/4979906
# http://webtech-walker.com/archive/2008/12/15101251.html


# --------------------------------------
# --------------------------------------

# SSHで接続した先で日本語が使えるようにする
export LC_CTYPE=en_US.UTF-8
export LC_ALL=en_US.UTF-8


# --------------------------------------
# ヒストリの設定
# --------------------------------------

# 履歴を保存するファイルを指定
HISTFILE=~/.zsh_history

# メモリ上に保存される履歴の数
HISTSIZE=1000000

# HISTFILEで指定したファイルに保存される履歴の数
SAVEHIST=1000000

# 同じコマンドをヒストリに追加しない
setopt HIST_IGNORE_ALL_DUPS

# 端末間の履歴を共有
setopt SHARE_HISTORY

# cd で移動した場所を記録して後で呼び出せるようにする
setopt AUTO_PUSHD

# 重複している移動履歴を記録しない
setopt PUSHD_IGNORE_DUPS

# 余分な空白は詰める
setopt HIST_REDUCE_BLANKS

# !を使ったヒストリ展開を行う
setopt bang_hist

# スペースから始まるコマンド行はヒストリに残さない
setopt HIST_IGNORE_SPACE


# --------------------------------------
# プロンプト
# --------------------------------------

# 色を使用出来るようにする
autoload -Uz colors; colors
autoload -U promptinit; promptinit

# vcs_info
# vcs_info宣言
autoload -Uz vcs_info

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
precmd () {
    psvar=()
    LANG=en_US.UTF-8 vcs_info
    [[ -n "$vcs_info_msg_0_" ]] && psvar[1]="$vcs_info_msg_0_"
}

# プロンプト表示設定
OK=" [*'-'] "
NG=" [*;-;] "

PROMPT=""									# デフォルトのパス表示を消す
PROMPT+="%F{magenta}[%1~]%f"				# パス
PROMPT+="%(?.%F{green}$OK%f.%F{red}$NG%f)"	# OK/NGの顔文字
PROMPT+="%% "								# コマンド入力待ち
RPROMPT="%1(v|%F{red}%1v%f|) %F{green}%*"	# GIT+カスタム時刻表示

# もしかして時のプロンプト指定
SPROMPT="%{$fg[red]%}%{$suggest%}(*'~'%)? < もしかして %B%r%b %{$fg[red]%}? [そう!(y), 違う!(n),a,e]:${reset_color} "

# 単語の区切り文字を指定する
autoload -Uz select-word-style
select-word-style default

# ここで指定した文字は単語区切りとみなされる
# / も区切りと扱うので、^W でディレクトリ１つ分を削除できる
zstyle ':zle:*' word-chars " /=;@:{},|"
zstyle ':zle:*' word-style unspecified


# --------------------------------------
# 補完
# --------------------------------------

# for zsh-completions
fpath=(/usr/local/share/zsh-completions $fpath)

# 補完機能を有効にする
autoload -Uz compinit
compinit -u

# 色付きで補完する
zstyle ':completion:*' list-colors di=34 fi=0

# メニュー選択モード
zstyle ':completion:*:default' menu select=2

# 補完で小文字でも大文字にマッチさせる
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Z}'

# ../ の後は今いるディレクトリを補完しない
zstyle ':completion:*' ignore-parents parent pwd ..

# sudo の後ろでコマンド名を補完する
zstyle ':completion:*:sudo:*' command-path /usr/local/sbin /usr/local/bin \
                   /usr/sbin /usr/bin /sbin /bin /usr/X11R6/bin

# ps コマンドのプロセス名補完
zstyle ':completion:*:processes' command 'ps x -o pid,s,args'


# --------------------------------------
# オプション
# --------------------------------------

# 日本語ファイル名を表示可能にする
setopt print_eight_bit

# beep を無効にする
setopt no_beep

# 入力しているコマンド名が間違っている場合にもしかして：を出す。
setopt correct

# 色を使う
setopt prompt_subst

# ^Dでログアウトしない
setopt ignore_eof

# ^Q/^Sのフローコントロールを無効にする
setopt no_flow_control

# バックグラウンドジョブが終了したらすぐに知らせる
setopt no_tify

# '#' 以降をコメントとして扱う
setopt interactive_comments

# ディレクトリ名だけでcdする
setopt auto_cd

# cd したら自動的にpushdする
setopt auto_pushd

# 重複したディレクトリを追加しない
setopt pushd_ignore_dups

# 補完候補リストを詰めて表示
setopt list_packed

# 補完候補にファイルの種類も表示する
setopt list_types

# カッコの対応などを自動的に補完する
setopt auto_param_keys

# = の後はパス名として補完する
setopt magic_equal_subst

# 同時に起動したzshの間でヒストリを共有する
setopt share_history

# 同じコマンドをヒストリに残さない
setopt hist_ignore_all_dups

# ヒストリファイルに保存するとき、すでに重複したコマンドがあったら古い方を削除する
setopt hist_save_nodups

# スペースから始まるコマンド行はヒストリに残さない
setopt hist_ignore_space

# ヒストリに保存するときに余分なスペースを削除する
setopt hist_reduce_blanks

# 補完候補が複数あるときに自動的に一覧表示する
setopt auto_menu

# 高機能なワイルドカード展開を使用する
setopt extended_glob


# --------------------------------------
# キーバインド
# --------------------------------------

# emacs 風キーバインドにする
bindkey -e

# ^R で履歴検索をするときに * でワイルドカードを使用出来るようにする
# bindkey '^R' history-incremental-pattern-search-backward

function cdup() {
   echo
   cd ..
   zle reset-prompt
}
zle -N cdup
bindkey '^K' cdup


# --------------------------------------
# エイリアス
# --------------------------------------

# ls
alias ls="ls -G" # color for darwin
alias l="ls -la"
alias la="ls -la"
alias lsa="ls -la"
alias l1="ls -1"

# tree
# N: 文字化け対策, C:色をつける
alias tree="tree -NC"

# rm
alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'

# mkdir
alias mkdir='mkdir -p'

# bundler
alias be='bundle exec'

# sudo の後のコマンドでエイリアスを有効にする
alias sudo='sudo '

# tmux
alias t='tmux'
alias td='tmux detach'
alias ta='tmux attach'
alias tat='tmux attach -t'

# git
alias gft="git fetch"
alias gpl="git pull"
alias gco="git checkout"
alias gst="git status"
alias gcm="git commit -a"
alias gbr="git branch"
alias gbr="git branch -a"
alias gbm="git branch --merged"
alias gbn="git branch --no-merge"
# submoduleアップデート
alias smu="git submodule foreach 'git checkout master; git pull'"
# Untracked filesを表示せず，not stagedと，stagedだけの状態を出力する
alias gstt="git status -uno"
# 行ごとの差分ではなく単語レベルでの差分を色付きで表示する
alias gdifff="git diff --word-diff"
# いい感じのグラフでログを表示
alias log0="git log --graph --all --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(bold white)― %an%C(reset)%C(bold yellow)%d%C(reset)' --abbrev-commit --date=relative"
alias log1="git log --pretty='format:%C(yellow)%h%Creset %C(magenta)%cd%Creset %s %Cgreen(%an)%Creset %Cred%d%Creset%C(black bold)%ar%Creset' --date=iso"
alias log2="git log --graph --all --format=format:'%C(bold blue)%h%C(reset) - %C(bold cyan)%aD%C(reset) %C(bold green)(%ar)%C(reset)%C(bold yellow)%d%C(reset)%n''          %C(white)%s%C(reset) %C(bold white)― %an%C(reset)' --abbrev-commit"
alias log3="git log --graph --date-order -C -M --pretty=format:'<%h> %ad [%an] %Cgreen%d%Creset %s' --all --date=short"
alias log4="git log --graph --pretty='format:%C(yellow)%h%Cblue%d%Creset %s %C(black bold)%an, %ar%Creset'"
alias log5="git log --graph --date=short --decorate=short --pretty=format:'%Cgreen%h %Creset%cd %Cblue%cn %Cred%d %Creset%s'"
alias log6="git log --graph --pretty=format:'%Cred%h%Creset - %s%C(yellow)%d%Creset %Cgreen(%cr:%cd) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative"
alias log7="git log --graph --pretty=format:'%Cred%h%Creset - %s%C(yellow)%d%Creset %Cgreen(%cr:%cd) %C(bold blue)<%an>%Creset' --abbrev-commit --date=iso"
alias log8="git log --graph --all --decorate"
alias log9="git !'git lg --all'"
# hub + pecoでリポジトリをブラウザで開く
alias hbr='hub browse $(ghq list | peco | cut -d "/" -f 2,3)'

# cd
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# グローバルエイリアス
alias -g L='| less'
alias -g H='| head'
alias -g T='| tail'
alias -g G='| grep'
alias -g CL='| color'

# -n 行数表示, -I バイナリファイル無視, svn関係のファイルを無視
alias grep="grep --color -n -I --exclude='*.svn-*' --exclude='entries' --exclude='*/cache/*'"

# C で標準出力をクリップボードにコピーする
# mollifier delta blog : http://mollifier.hatenablog.com/entry/20100317/p1
if which pbcopy >/dev/null 2>&1 ; then
    # Mac
    alias -g C='| pbcopy'
elif which xsel >/dev/null 2>&1 ; then
    # Linux
    alias -g C='| xsel --input --clipboard'
elif which putclip >/dev/null 2>&1 ; then
    # Cygwin
    alias -g C='| putclip'
fi


# -------------------------------------
# peco
# -------------------------------------

# コマンド履歴を出して検索・絞り込みするやつ
function peco-select-history() {
    local tac
    if which tac > /dev/null; then
        tac="tac"
    else
        tac="tail -r"
    fi
    BUFFER=$(\history -n 1 | \
        eval $tac | \
        peco --query "$LBUFFER")
    CURSOR=$#BUFFER
    zle clear-screen
}
zle -N peco-select-history
bindkey '^r' peco-select-history

# ghqでクローンしてきたリポジトリへの移動が捗る
function peco-src () {
  local selected_dir=$(ghq list -p | peco --query "$LBUFFER")
  if [ -n "$selected_dir" ]; then
    BUFFER="cd ${selected_dir}"
    zle accept-line
  fi
  zle clear-screen
}
zle -N peco-src
bindkey '^]' peco-src


# --------------------------------------
# その他
# --------------------------------------

# cdしたあとで、自動的に pwd と ls -la する
function chpwd() { pwd; ls -la }


# --------------------------------------
# OS 別の設定
# --------------------------------------

case ${OSTYPE} in
    darwin*)
        #Mac用の設定
        export CLICOLOR=1
        alias ls='ls -G -F'
        ;;
    linux*)
        #Linux用の設定
        ;;
esac

# vim:set ft=zsh:


# --------------------------------------
# tmux
# --------------------------------------

function is_exists() { type "$1" >/dev/null 2>&1; return $?; }
function is_osx() { [[ $OSTYPE == darwin* ]]; }
function is_screen_running() { [ ! -z "$STY" ]; }
function is_tmux_runnning() { [ ! -z "$TMUX" ]; }
function is_screen_or_tmux_running() { is_screen_running || is_tmux_runnning; }
function shell_has_started_interactively() { [ ! -z "$PS1" ]; }
function is_ssh_running() { [ ! -z "$SSH_CONECTION" ]; }

function tmux_automatically_attach_session()
{
    if is_screen_or_tmux_running; then
        ! is_exists 'tmux' && return 1

        if is_tmux_runnning; then
            echo ""
            echo "${fg_bold[blue]}  _____ __  __ _   ___  __ ${reset_color}"
            echo "${fg_bold[blue]} |_   _|  \/  | | | \ \/ / ${reset_color}"
            echo "${fg_bold[blue]}   | | | |\/| | | | |\  /  ${reset_color}"
            echo "${fg_bold[blue]}   | | | |  | | |_| |/  \  ${reset_color}"
            echo "${fg_bold[blue]}   |_| |_|  |_|\___//_/\_\ ${reset_color}"
            echo ""
        elif is_screen_running; then
            echo "This is on screen."
        fi
    else
        if shell_has_started_interactively && ! is_ssh_running; then
            if ! is_exists 'tmux'; then
                echo 'Error: tmux command not found' 2>&1
                return 1
            fi

            if tmux has-session >/dev/null 2>&1 && tmux list-sessions | grep -qE '.*]$'; then
                # detached session exists
                tmux list-sessions
                echo -n "Tmux: attach? (y/N/num) "
                read
                if [[ "$REPLY" =~ ^[Yy]$ ]] || [[ "$REPLY" == '' ]]; then
                    tmux attach-session
                    if [ $? -eq 0 ]; then
                        echo "$(tmux -V) attached session"
                        return 0
                    fi
                elif [[ "$REPLY" =~ ^[0-9]+$ ]]; then
                    tmux attach -t "$REPLY"
                    if [ $? -eq 0 ]; then
                        echo "$(tmux -V) attached session"
                        return 0
                    fi
                fi
            fi

            if is_osx && is_exists 'reattach-to-user-namespace'; then
                # on OS X force tmux's default command
                # to spawn a shell in the user's namespace
                tmux_config=$(cat $HOME/.tmux.conf <(echo 'set-option -g default-command "reattach-to-user-namespace -l $SHELL"'))
                tmux -f <(echo "$tmux_config") new-session \; source $HOME/dotfiles/.tmux/new-session && echo "$(tmux -V) created new session supported OS X"
            else
                tmux new-session && echo "tmux created new session"
            fi
        fi
    fi
}
tmux_automatically_attach_session


# --------------------------------------
# path
# --------------------------------------

# Homebrew
export PATH=/usr/local/sbin:$PATH
export PATH=/usr/local/bin:$PATH
# export HOMEBREW_CASK_OPTS="--appdir=/Applications"

# nodebrew (install by Homebrew)
export PATH=$HOME/.nodebrew/current/bin:$PATH

# rbenv (install by Homebrew)
export PATH="$HOME/.rbenv/bin:$PATH"
export PATH="$HOME/.rbenv/shims:$PATH"
eval "$(rbenv init -)"

# pyenv (install by Homebrew)
export PYENV_ROOT="$HOME/.pyenv"
export PATH=$PYENV_ROOT/bin:$PATH
eval "$(pyenv init -)"

# PostgreSQL
export PGDATA=/usr/local/var/postgres

# golang
export GOPATH="$HOME/.go"
export GOROOT=/usr/local/opt/go/libexec
export PATH=$GOPATH/bin:$GOROOT/bin:$PATH

# direnv
eval "$(direnv hook zsh)"

# 重複する要素を自動的に削除
typeset -U path cdpath fpath manpath

# export
export PATH=$HOME/dotfiles/bin:$PATH

path=(
    $HOME/bin(N-/)
    /usr/local/bin(N-/)
    /usr/local/sbin(N-/)
    $path
)
