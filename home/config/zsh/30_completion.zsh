# --------------------------------------
# Completion & Keybindings
# --------------------------------------
# completion, keybindを統合

# ======================
# Completion Configuration
# ======================

# zsh-completions設定
local zsh_completions_dir="/usr/local/share/zsh-completions"
add_to_fpath "$zsh_completions_dir"

# 補完キャッシュディレクトリの設定
ZSH_CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/zsh"
[[ ! -d "$ZSH_CACHE_DIR" ]] && mkdir -p "$ZSH_CACHE_DIR"

# 補完機能の初期化（高速化版）
autoload -U compinit
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

# sudoコマンド補完設定
local system_paths=(
    /usr/local/sbin /usr/local/bin
    /usr/sbin /usr/bin
    /sbin /bin
    /usr/X11R6/bin
)
zstyle ':completion:*:sudo:*' command-path "${system_paths[@]}"

# ps コマンドのプロセス名補完
zstyle ':completion:*:processes' command 'ps x -o pid,s,args'

# 補完パフォーマンス最適化
zstyle ':completion:*' accept-exact '*(N)'
zstyle ':completion:*' use-compctl false
zstyle ':completion:*' verbose true

# プロセス補完の詳細設定
zstyle ':completion:*:*:kill:*:processes' \
    list-colors '=(#b) #([0-9]#) ([0-9a-z-]#)*=01;34=0=01'
zstyle ':completion:*:*:*:*:processes' \
    command "ps -u $USER -o pid,user,comm -w -w"

# 追加の補完最適化設定
zstyle ':completion:*' group-name ''              # 補完候補をタイプ別にグループ化
zstyle ':completion:*' squeeze-slashes true       # 重複するスラッシュを削除
zstyle ':completion:*' special-dirs true          # . と .. ディレクトリも補完対象に含める

# ======================
# Keybindings
# ======================

# Emacsキーバインド設定
bindkey -e

# 親ディレクトリ移動関数
function cdup() {
   echo
   cd ..
   zle reset-prompt
}
zle -N cdup
