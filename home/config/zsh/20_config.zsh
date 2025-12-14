# --------------------------------------
# Zsh Configuration
# --------------------------------------
# options, history, promptを統合

# ======================
# Zsh Options
# ======================

# === 基本設定 ===
setopt print_eight_bit        # 日本語ファイル名を表示可能にする
setopt no_beep                # beep を無効にする
setopt correct                # 入力しているコマンド名が間違っている場合にもしかして：を出す
setopt prompt_subst           # 色を使う
setopt ignore_eof             # ^Dでログアウトしない
setopt no_flow_control        # ^Q/^Sのフローコントロールを無効にする
setopt notify                 # バックグラウンドジョブが終了したらすぐに知らせる
setopt interactive_comments   # '#' 以降をコメントとして扱う

# === ディレクトリ操作 ===
setopt auto_cd                # ディレクトリ名だけでcdする
setopt auto_pushd             # cd したら自動的にpushdする
setopt pushd_ignore_dups      # 重複したディレクトリを追加しない
setopt pushd_silent           # pushdとpopdでディレクトリスタックを表示しない
setopt pushd_to_home          # 引数なしのpushdで$HOMEに移動
setopt auto_name_dirs         # 絶対パスの変数を自動的にディレクトリ名として使用

# === 補完機能 ===
setopt list_packed            # 補完候補リストを詰めて表示
setopt list_types             # 補完候補にファイルの種類も表示する
setopt auto_param_keys        # カッコの対応などを自動的に補完する
setopt magic_equal_subst      # = の後はパス名として補完する
setopt auto_menu              # 補完候補が複数あるときに自動的に一覧表示する
setopt auto_list              # 曖昧な補完で自動的に選択肢を一覧表示
setopt complete_in_word       # 単語の途中でも補完可能
setopt always_to_end          # 補完時にカーソルを単語の末尾に移動
setopt glob_complete          # globパターンから補完候補を生成

# === グロブとパターンマッチ ===
setopt extended_glob          # 高機能なワイルドカード展開を使用する
setopt numeric_glob_sort      # 数値を含むファイル名を数値順でソート
setopt glob_dots              # ドットファイルもグロブ対象に含める（明示的に指定時）
setopt nonomatch              # グロブパターンにマッチしない場合もエラーにしない

# === パス検索 ===
setopt path_dirs              # スラッシュを含むコマンド名でもパス検索を実行

# === ジョブ制御 ===
setopt long_list_jobs         # ジョブの詳細情報を表示
setopt check_jobs             # ログアウト時に実行中のジョブを確認

# === コマンドライン編集 ===
setopt combining_chars        # 結合文字を正しく表示

# === セキュリティ強化 ===
setopt no_clobber             # リダイレクト(>)での既存ファイル上書きを防止
setopt rm_star_wait           # rm * 実行時に10秒間の確認待機
setopt hist_ignore_space      # スペースで始まるコマンドを履歴に残さない
setopt no_all_export          # 変数の自動エクスポートを防止
setopt no_global_export       # 関数の自動エクスポートを防止
setopt pipe_fail              # パイプラインの右側のエラーを全体のエラーとする

# === パフォーマンス強化 ===
setopt no_bg_nice             # バックグラウンドジョブの優先度を下げない
setopt no_hup                 # シェル終了時にジョブにHUPシグナルを送らない
setopt no_check_jobs          # シェル終了時にジョブの確認をスキップ（高速化）

# ======================
# History Configuration
# ======================

# 履歴を保存するファイルを指定（XDG準拠）
HISTFILE="${XDG_STATE_HOME:-$HOME/.local/state}/zsh/history"
# 履歴ディレクトリが存在しない場合は作成
[[ ! -d "${HISTFILE:h}" ]] && mkdir -p "${HISTFILE:h}"

# メモリ上に保存される履歴の数（最適化: 10万件）
# 約3-6ヶ月分の履歴を保持でき、実用上十分な量
HISTSIZE=100000

# ファイルに保存される履歴の数（最適化: 10万件）
# 約10-20MBのファイルサイズとなり、起動時の読み込みも高速
SAVEHIST=100000

# 履歴の重複除去とパフォーマンス最適化
setopt HIST_IGNORE_ALL_DUPS     # 同じコマンドをヒストリに追加しない
setopt HIST_EXPIRE_DUPS_FIRST   # 履歴がサイズ上限に達したら重複から削除
setopt HIST_FIND_NO_DUPS        # 履歴検索中に重複を表示しない
setopt HIST_SAVE_NO_DUPS        # 重複したコマンドを保存しない

# 履歴の共有と動作設定
setopt SHARE_HISTORY            # 端末間の履歴を共有
setopt INC_APPEND_HISTORY       # コマンド実行時に即座に履歴ファイルに追加
setopt HIST_VERIFY              # 履歴展開時に一度編集状態にする

# 履歴の品質向上
setopt HIST_REDUCE_BLANKS       # 余分な空白は詰める
setopt EXTENDED_HISTORY         # 実行時間とタイムスタンプを記録

# ヒストリ展開
setopt BANG_HIST                # !を使ったヒストリ展開を行う

# ======================
# Prompt Configuration
# ======================

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
SPROMPT="%{$fg[red]%}%{$suggest%}(*'~'%)? < もしかして %B%r%b %{$fg[red]%}? \
[そう!(y), 違う!(n),a,e]:${reset_color} "

# 単語選択スタイル設定
autoload -Uz select-word-style
select-word-style default
zstyle ':zle:*' word-chars " /=;@:{},|"
zstyle ':zle:*' word-style unspecified
