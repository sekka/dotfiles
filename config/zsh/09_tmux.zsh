# コマンドが存在するかどうかを確認する関数
function is_exists() { type "$1" >/dev/null 2>&1; return $?; }

# 現在のOSがmacOSかどうかを確認する関数
function is_osx() { [[ $OSTYPE == darwin* ]]; }

# 現在GNU Screenが実行中かどうかを確認する関数
function is_screen_running() { [ ! -z "$STY" ]; }

# 現在tmuxが実行中かどうかを確認する関数
function is_tmux_runnning() { [ ! -z "$TMUX" ]; }

# GNU Screenまたはtmuxが実行中かどうかを確認する関数
function is_screen_or_tmux_running() { is_screen_running || is_tmux_runnning; }

# シェルが対話的に開始されたかどうかを確認する関数
function shell_has_started_interactively() { [ ! -z "$PS1" ]; }

# SSH経由でセッションが実行されているかどうかを確認する関数
function is_ssh_running() { [ ! -z "$SSH_CONNECTION" ]; }

# tmuxセッションを自動的にアタッチする関数
function tmux_automatically_attach_session()
{
    # Screenまたはtmuxが既に実行中の場合
    if is_screen_or_tmux_running; then
        # tmuxがインストールされていなければ終了
        ! is_exists 'tmux' && return 1

        if is_tmux_runnning; then
            # tmuxが実行中の場合
            echo :beer: :relaxed: | emojify
        elif is_screen_running; then
            # GNU Screenが実行中の場合
            echo "This is on screen."
        fi
    else
        # Screenやtmuxが実行中でない場合
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
                read
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
                # macOS用の設定で新しいtmuxセッションを開始
                tmux_config=$(cat $HOME/.tmux.conf <(echo 'set-option -g default-command "reattach-to-user-namespace -l $SHELL"'))
                tmux -f <(echo "$tmux_config") new-session \; source $HOME/dotfiles/.tmux/new-session && echo "$(tmux -V) created new session supported OS X"
            else
                # 通常の方法で新しいtmuxセッションを開始
                tmux new-session && echo "tmux created new session"
            fi
        fi
    fi
}
tmux_automatically_attach_session