# ===========================================
# 51_safe_rm.zsh - ホワイトリスト方式の安全な rm
# ===========================================
# AI エージェントとユーザー両方の誤削除を防止
# エスケープハッチ: command rm で関数をバイパス可能

function rm {
  local safe_patterns=(
    # システム
    '.DS_Store' '._*'
    # 一時ファイル / キャッシュ
    '/tmp/*' "${TMPDIR:-/tmp}/*" '.cache' '*.zwc'
    # Node.js
    'node_modules' '.next' '.nuxt' '.turbo' '.parcel-cache' 'dist'
    # Python
    '__pycache__' '.pytest_cache' '.mypy_cache' '.ruff_cache'
    # Rust
    'target/debug' 'target/release'
    # 環境
    '.direnv' '_gen'
    # エディタ
    '*.swp' '*.swo' '*~'
  )

  local arg past_options=false
  for arg in "$@"; do
    # -- 以降はすべてファイル名として扱う
    if [[ "$arg" == "--" ]]; then
      past_options=true
      continue
    fi
    # オプション引数はスキップ（-- 前のみ）
    if ! $past_options && [[ "$arg" == -* ]]; then
      continue
    fi

    local target=$(basename "$arg")
    local abs_path="${arg:a}"  # zsh の :a で絶対パスに展開（symlink 未解決）
    local is_safe=false

    local pat
    for pat in "${safe_patterns[@]}"; do
      # パス全体でマッチ（/tmp/* 等）またはベースネームでマッチ
      if [[ "$abs_path" == ${~pat} || "$target" == ${~pat} ]]; then
        is_safe=true
        break
      fi
    done

    if ! $is_safe; then
      echo "rm: '$arg' は安全な削除対象ではありません" >&2
      echo "  許可されたパターン: ${(j:, :)safe_patterns}" >&2
      echo "  意図的に削除する場合: command rm $@" >&2
      return 1
    fi
  done

  command rm "$@"
}
