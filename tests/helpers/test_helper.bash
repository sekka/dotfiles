#!/usr/bin/env bash
# 共通テストヘルパー関数

# モック認証ファイルを作成
create_mock_auth_file() {
  local ai="$1" auth_file="$2"

  case "$ai" in
  codex)
    echo '{"OPENAI_API_KEY":"sk-mock-key-12345"}' >"$auth_file"
    ;;
  gemini)
    echo '{"client_id":"mock-client-id","client_secret":"mock-secret"}' >"$auth_file"
    ;;
  coderabbit)
    echo '{"token":"coderabbit-mock-token"}' >"$auth_file"
    ;;
  esac

  chmod 600 "$auth_file"
}

# モックキャッシュを作成
create_mock_cache() {
  local cache_type="$1" cache_file="$2"

  case "$cache_type" in
  valid)
    cat >"$cache_file" <<'EOF'
export AI_HAS_CODEX='1'
export AI_HAS_GEMINI='0'
export AI_HAS_COPILOT='1'
export AI_HAS_CODERABBIT='0'
export AI_AVAILABLE_MODELS='claude,codex,copilot'
EOF
    ;;
  stale)
    create_mock_cache "valid" "$cache_file"
    # macOS専用タイムスタンプ設定
    touch -t 202401010000 "$cache_file"
    ;;
  corrupted)
    echo "export AI_HAS_CODEX='1'" >"$cache_file"
    # 他の必須変数が欠けている（不完全なキャッシュ）
    ;;
  incomplete)
    cat >"$cache_file" <<'EOF'
export AI_HAS_CODEX='1'
export AI_HAS_GEMINI='0'
EOF
    # AI_HAS_COPILOT, AI_HAS_CODERABBIT, AI_AVAILABLE_MODELS が欠けている
    ;;
  esac
}

# デバッグ出力（bats -t で表示）
debug_output() {
  echo "# DEBUG: $*" >&3
}

# セキュアなパーミッション検証
check_secure_permissions() {
  local file="$1"
  local perm

  # macOS専用パーミッション取得
  perm=$(stat -f%A "$file")

  # 最後の3桁を取得（ファイル権限部分）
  perm="${perm: -3}"

  [[ $perm == "600" ]]
}

# キャッシュ年齢取得（秒単位）
get_cache_age() {
  local cache_file="$1"
  local mtime current_time

  # macOS専用mtime取得
  mtime=$(stat -f%m "$cache_file")
  current_time=$(date +%s)

  echo $((current_time - mtime))
}

# 必須変数がキャッシュに含まれているか検証
validate_cache_completeness() {
  local cache_file="$1"
  local required_vars=("AI_HAS_CODEX" "AI_HAS_GEMINI" "AI_HAS_COPILOT" "AI_HAS_CODERABBIT" "AI_AVAILABLE_MODELS")

  for var in "${required_vars[@]}"; do
    if ! grep -qF "export ${var}=" "$cache_file" 2>/dev/null; then
      return 1 # 不完全
    fi
  done

  return 0 # 完全
}

# JSON injection テスト用の危険な入力
get_malicious_inputs() {
  cat <<'EOF'
'; rm -rf /tmp/test; echo '
$(whoami)
`id`
\"; malicious_code(); echo \"
{"key": "value\"}
EOF
}

# ログファイルのJSON形式検証
validate_log_json() {
  local log_file="$1"

  # 各行がJSONとして有効か検証（jqを使用）
  if ! command -v jq >/dev/null 2>&1; then
    echo "WARNING: jq not found, skipping JSON validation" >&2
    return 0
  fi

  while IFS= read -r line; do
    if ! echo "$line" | jq empty 2>/dev/null; then
      echo "Invalid JSON: $line" >&2
      return 1
    fi
  done <"$log_file"

  return 0
}

# テスト用の一時ディレクトリをクリーンアップ
cleanup_test_dir() {
  local test_dir="$1"

  if [[ -d $test_dir ]]; then
    rm -rf "$test_dir"
  fi
}
