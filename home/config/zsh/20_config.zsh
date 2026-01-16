# ===========================================
# Zsh 基本設定
# ===========================================
# options、history、prompt を統合

# ===========================================
# Zsh オプション
# ===========================================

# --- 基本設定 ---
setopt print_eight_bit        # 日本語ファイル名を表示可能にする
setopt no_beep                # ビープ音を無効にする
setopt correct                # コマンド名の入力ミスを修正候補として表示
setopt prompt_subst           # プロンプトで変数展開・コマンド置換を有効化
setopt ignore_eof             # Ctrl+D でログアウトしない
setopt no_flow_control        # Ctrl+Q/Ctrl+S のフロー制御を無効化
setopt notify                 # バックグラウンドジョブ終了を即座に通知
setopt interactive_comments   # '#' 以降をコメントとして扱う

# --- ディレクトリ操作 ---
setopt auto_cd                # ディレクトリ名のみで cd を実行
setopt auto_pushd             # cd 時に自動的に pushd を実行
setopt pushd_ignore_dups      # ディレクトリスタックに重複を追加しない
setopt pushd_silent           # pushd/popd 時にディレクトリスタックを表示しない
setopt pushd_to_home          # 引数なしの pushd で $HOME に移動
setopt auto_name_dirs         # 絶対パスの変数をディレクトリ名として使用

# --- 補完機能 ---
setopt list_packed            # 補完候補リストを詰めて表示
setopt list_types             # 補完候補にファイルの種類も表示
setopt auto_param_keys        # カッコの対応などを自動補完
setopt magic_equal_subst      # '=' の後をパス名として補完
setopt auto_menu              # 補完候補が複数ある時に自動で一覧表示
setopt auto_list              # 曖昧な補完で自動的に選択肢を一覧表示
setopt complete_in_word       # 単語の途中でも補完可能
setopt always_to_end          # 補完時にカーソルを単語の末尾に移動
setopt glob_complete          # glob パターンから補完候補を生成

# --- グロブとパターンマッチ ---
setopt extended_glob          # 高機能なワイルドカード展開を使用
setopt numeric_glob_sort      # 数値を含むファイル名を数値順でソート
setopt glob_dots              # ドットファイルも glob 対象に含める
setopt nonomatch              # glob パターンにマッチしない場合もエラーにしない

# --- パス検索 ---
setopt path_dirs              # スラッシュを含むコマンド名でもパス検索を実行

# --- ジョブ制御 ---
setopt long_list_jobs         # ジョブの詳細情報を表示
setopt check_jobs             # ログアウト時に実行中のジョブを確認

# --- コマンドライン編集 ---
setopt combining_chars        # 結合文字を正しく表示

# --- セキュリティ強化 ---
setopt no_clobber             # リダイレクト (>) での既存ファイル上書きを防止
setopt rm_star_wait           # 'rm *' 実行時に 10 秒間の確認待機
setopt hist_ignore_space      # スペースで始まるコマンドを履歴に残さない
setopt no_all_export          # 変数の自動エクスポートを防止
setopt no_global_export       # 関数の自動エクスポートを防止
setopt pipe_fail              # パイプラインの右側のエラーを全体のエラーとする

# --- パフォーマンス強化 ---
setopt no_bg_nice             # バックグラウンドジョブの優先度を下げない
setopt no_hup                 # シェル終了時にジョブに HUP シグナルを送らない
# 注意: check_jobs を優先し、セキュリティを重視

# ===========================================
# コマンド履歴設定
# ===========================================

# 履歴ファイルの場所（XDG Base Directory 準拠）
HISTFILE="${XDG_STATE_HOME:-$HOME/.local/state}/zsh/history"
# 履歴ディレクトリが存在しない場合は作成
[[ ! -d "${HISTFILE:h}" ]] && mkdir -p "${HISTFILE:h}"

# メモリ上の履歴数（10万件 = 約 3〜6 ヶ月分）
HISTSIZE=100000

# ファイルに保存される履歴数（10万件 = 約 10〜20MB）
SAVEHIST=100000

# 履歴の重複除去とパフォーマンス最適化
setopt HIST_IGNORE_ALL_DUPS     # 同じコマンドを履歴に追加しない
setopt HIST_EXPIRE_DUPS_FIRST   # 履歴がサイズ上限に達したら重複から削除
setopt HIST_FIND_NO_DUPS        # 履歴検索中に重複を表示しない
setopt HIST_SAVE_NO_DUPS        # 重複したコマンドを保存しない

# 履歴の共有と動作設定
setopt SHARE_HISTORY            # 端末間の履歴を共有
setopt INC_APPEND_HISTORY       # コマンド実行時に即座に履歴ファイルに追加
setopt HIST_VERIFY              # 履歴展開時に一度編集状態にする

# 履歴の品質向上
setopt HIST_REDUCE_BLANKS       # 余分な空白を詰める
setopt EXTENDED_HISTORY         # 実行時間とタイムスタンプを記録

# 履歴展開
setopt BANG_HIST                # '!' を使った履歴展開を行う

# ===========================================
# プロンプト設定
# ===========================================

# プロンプト初期化と色設定
autoload -Uz colors; colors
autoload -U promptinit; promptinit

# Git 情報表示設定（vcs_info）
autoload -Uz vcs_info

# ディレクトリ履歴機能（cdr）を有効化
autoload -Uz chpwd_recent_dirs cdr add-zsh-hook
add-zsh-hook chpwd chpwd_recent_dirs

# vcs_info 設定
zstyle ":vcs_info:*" max-exports 6

zstyle ":vcs_info:git:*" check-for-changes true
zstyle ":vcs_info:git:*" formats "%b %c%u"
zstyle ":vcs_info:git:*" actionformats "%b|%a %c%u"
zstyle ":vcs_info:git:*" stagedstr "+"
zstyle ":vcs_info:git:*" unstagedstr "*"

# プロンプト更新処理
function _update_prompt() {
    psvar=()
    LANG=en_US.UTF-8 vcs_info
    [[ -n "$vcs_info_msg_0_" ]] && psvar[1]="$vcs_info_msg_0_"

    # tmux セッション内ならステータスバーを更新
    if [[ -n "$TMUX" ]]; then
        tmux refresh-client -S
    fi
}

# add-zsh-hook で他のプラグインとの競合を回避
add-zsh-hook precmd _update_prompt

# プロンプト表示設定
OK="[*'-']"  # 成功時の顔文字
NG="[*;-;]"  # 失敗時の顔文字

PROMPT=""
PROMPT+="
"
PROMPT+="%(?.%F{green}$OK%f.%F{red}$NG%f)"  # 前回コマンドの実行結果
PROMPT+=" "
PROMPT+="%F{black}%*%f"                      # 現在時刻
PROMPT+=" "
PROMPT+="%F{blue}%B%~%b%f"                   # カレントディレクトリ
PROMPT+=" "
PROMPT+="%1(v|%F{red}%1v%f|)"                # Git ブランチ情報
PROMPT+="
"
PROMPT+="%B%(?.%F{green}❯❯%f.%F{red}❯❯%f)%b"  # プロンプト記号（結果により色分け）
PROMPT+="%B❯❯%b"                                 # プロンプト記号
PROMPT+=" "

# スペルミス修正時のプロンプト
SPROMPT=$'%{\e[31m%}(*\'~\'%)? < もしかして %B%r%b %{\e[31m%}?\n[そう!(y), 違う!(n),a,e]:%{\e[0m%} '

# 単語選択スタイル設定
autoload -Uz select-word-style
select-word-style default
zstyle ':zle:*' word-chars " /=;@:{},|"
zstyle ':zle:*' word-style unspecified
