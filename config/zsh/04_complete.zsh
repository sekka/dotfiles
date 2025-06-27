# パス変数の定義（保守性向上）
local zsh_completions_dir="/usr/local/share/zsh-completions"

# for zsh-completions
add_to_fpath "$zsh_completions_dir"

# 補完キャッシュディレクトリの設定
ZSH_CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/zsh"
[[ ! -d "$ZSH_CACHE_DIR" ]] && mkdir -p "$ZSH_CACHE_DIR"

# 補完機能を有効にする (最適化版)
autoload -U compinit
# 24時間以内に.zcompdumpが更新されていない場合のみフルチェック実行
# それ以外は高速起動のため-Cオプション（セキュリティチェックをスキップ）を使用
if [[ -n ${ZDOTDIR:-$HOME}/.zcompdump(#qN.mh+24) ]]; then
    compinit
else
    compinit -C
fi

# 補完キャッシュの設定
zstyle ':completion:*' use-cache yes
zstyle ':completion:*' cache-path "$ZSH_CACHE_DIR"

# 色付きで補完する
zstyle ':completion:*' list-colors di=34 fi=0

# メニュー選択モード
zstyle ':completion:*:default' menu select=2

# 補完で小文字でも大文字にマッチさせる
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Z}'

# ../ の後は今いるディレクトリを補完しない
zstyle ':completion:*' ignore-parents parent pwd ..

# システムパス変数の定義
local system_paths=(
    /usr/local/sbin /usr/local/bin
    /usr/sbin /usr/bin
    /sbin /bin
    /usr/X11R6/bin
)

# sudo の後ろでコマンド名を補完する
zstyle ':completion:*:sudo:*' command-path "${system_paths[@]}"

# ps コマンドのプロセス名補完
zstyle ':completion:*:processes' command 'ps x -o pid,s,args'

# パフォーマンス向上のための追加設定
zstyle ':completion:*' accept-exact '*(N)'
zstyle ':completion:*' use-compctl false
zstyle ':completion:*' verbose true

# 頻繁に使用される補完のキャッシュ設定
zstyle ':completion:*:*:kill:*:processes' list-colors '=(#b) #([0-9]#) ([0-9a-z-]#)*=01;34=0=01'
zstyle ':completion:*:*:*:*:processes' command "ps -u $USER -o pid,user,comm -w -w"
