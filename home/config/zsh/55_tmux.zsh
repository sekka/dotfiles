# --------------------------------------
# Tmux自動起動機能
# --------------------------------------
# このスクリプトはzshシェル起動時にtmuxセッションを自動的に管理する。
# 既存セッションがあれば選択してアタッチ、なければ新規作成する。
# SSH接続時は自動起動しない。

function is_exists() { type "$1" >/dev/null 2>&1; return $?; }

function is_osx() { [[ $OSTYPE == darwin* ]]; }
function is_screen_running() { [ ! -z "$STY" ]; }
function is_tmux_runnning() { [ ! -z "$TMUX" ]; }
function is_screen_or_tmux_running() { is_screen_running || is_tmux_runnning; }
function shell_has_started_interactively() { [ ! -z "$PS1" ]; }
function is_ssh_running() { [ ! -z "$SSH_CONNECTION" ]; }
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
                # パス変数の定義（XDG準拠）
                local tmux_config_file="${XDG_CONFIG_HOME:-$HOME/.config}/tmux/tmux.conf"
                local dotfiles_dir="${HOME}/dotfiles"
                local tmux_session_script="$dotfiles_dir/home/.tmux/new-session"

                # フォールバック: 従来の設定ファイルパス
                [[ ! -f "$tmux_config_file" ]] && tmux_config_file="$HOME/.tmux.conf"

                # ヒアドキュメントを使用して設定を作成
                tmux -f <(cat <<EOF
$(cat "$tmux_config_file")
set-option -g default-command "reattach-to-user-namespace -l $SHELL"
EOF
                ) new-session \; source "$tmux_session_script" && echo "$(tmux -V) created new session supported OS X"
            else
                tmux new-session && echo "tmux created new session"
            fi
        fi
    fi
}

# ログインシェルでのみtmux自動起動を実行
# $SHLVLが1の場合は最初のシェル（ログインシェル）
if [[ -o login ]] || [[ "$SHLVL" -eq 1 ]]; then
    tmux_automatically_attach_session
fi
