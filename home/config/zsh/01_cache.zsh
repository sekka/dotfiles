# ===========================================
# 01_cache.zsh - Zsh 起動高速化キャッシュ
# ===========================================
# Layer 1: zcompile（.zwc 自動生成）
# Layer 2: eval_cache（コマンド出力キャッシュ）

# ===========================================
# Layer 1: zcompile - .zwc 自動コンパイル
# ===========================================

# ensure_zcompiled: ファイルが .zwc より新しければ再コンパイル
function ensure_zcompiled {
  local compiled="$1.zwc"
  if [[ ! -r "$compiled" || "$1" -nt "$compiled" ]]; then
    zcompile "$1" 2>/dev/null
  fi
}

# source 関数オーバーライド: 自動 zcompile 付き
function source {
  ensure_zcompiled "$1"
  builtin source "$@"
}

# 初回起動時: 全 .zsh ファイルを一括コンパイル
() {
  local f
  local zshhome="${ZSHHOME:-$HOME/dotfiles/home/config/zsh}"
  for f in ${zshhome}/*.zsh(N); do
    ensure_zcompiled "$f"
  done
  for f in ~/.zshrc ~/.zshenv ~/.zprofile(N); do
    ensure_zcompiled "$f"
  done
}

# ===========================================
# Layer 2: eval_cache - コマンド出力キャッシュ
# ===========================================

# eval_cache: コマンド出力をファイルキャッシュし、zcompile して source
# Usage: eval_cache <command> [args...]
# Cache: ~/.cache/zsh/eval/<basename>.zsh
# 注意: TTL なし。ツールのバージョンアップ後は zsh-cache-clear を実行すること
function eval_cache {
  local cmd="$1"
  local cache_name=$(basename "${cmd}")
  local cache_dir="${XDG_CACHE_HOME:-$HOME/.cache}/zsh/eval"
  local cache_file="${cache_dir}/${cache_name}.zsh"

  if [[ ! -f "$cache_file" ]]; then
    [[ -d "$cache_dir" ]] || mkdir -p "$cache_dir"
    if ! eval "$@" > "$cache_file"; then
      command rm -f "$cache_file"
      return 1
    fi
    zcompile "$cache_file"
  fi

  builtin source "$cache_file"
}

# ===========================================
# キャッシュクリア
# ===========================================

# zsh-cache-clear: 全キャッシュを削除（次回起動時に再生成）
# 使用タイミング: mise/zoxide/direnv/sheldon をアップデートした後
function zsh-cache-clear {
  # Layer 1: .zwc ファイル
  local zshhome="${ZSHHOME:-$HOME/dotfiles/home/config/zsh}"
  command rm -f ${zshhome}/*.zwc(N)
  command rm -f ~/.zshrc.zwc ~/.zshenv.zwc ~/.zprofile.zwc 2>/dev/null
  # Layer 2: eval キャッシュ
  command rm -rf "${XDG_CACHE_HOME:-$HOME/.cache}/zsh/eval"
  # Layer 3: sheldon キャッシュ
  command rm -f "${XDG_CONFIG_HOME:-$HOME/.config}/sheldon/sheldon.zsh"{,.zwc} 2>/dev/null
  echo "All zsh caches cleared. Restart shell to regenerate."
}
