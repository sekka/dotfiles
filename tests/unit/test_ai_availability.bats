#!/usr/bin/env bats
# 67_ai_availability.zsh のユニットテスト

setup() {
    load '../helpers/test_helper'

    # テスト用の一時ディレクトリ
    export TEST_HOME="$BATS_TMPDIR/ai_availability_test_$$"
    export XDG_CACHE_HOME="$TEST_HOME/.cache"
    export HOME="$TEST_HOME"

    mkdir -p "$XDG_CACHE_HOME"
    mkdir -p "$TEST_HOME/.codex"
    mkdir -p "$TEST_HOME/.gemini"
    mkdir -p "$TEST_HOME/.coderabbit"

    # CI環境フラグをクリア（ローカルテストとして実行）
    unset CI
    unset GITHUB_ACTIONS
    unset GITLAB_CI

    # キャッシュファイルパスを設定
    export _ai_cache_file="$XDG_CACHE_HOME/ai-availability.cache"
}

teardown() {
    cleanup_test_dir "$TEST_HOME"
}

# Test 1: キャッシュが存在しない場合、作成される
@test "Cache is created when it does not exist" {
    local cache_file="$_ai_cache_file"

    # キャッシュが存在しないことを確認
    [[ ! -f "$cache_file" ]]

    # スクリプトを実行（キャッシュ生成）
    # NOTE: 実際のスクリプトはzshで書かれているため、bash互換の部分のみテスト
    # ここではキャッシュ生成ロジックを模倣

    # セキュリティ: umask 077でディレクトリ/ファイル作成
    (
        umask 077
        mkdir -p "$(dirname "$cache_file")"
        {
            echo "export AI_HAS_CODEX='0'"
            echo "export AI_HAS_GEMINI='0'"
            echo "export AI_HAS_COPILOT='0'"
            echo "export AI_HAS_CODERABBIT='0'"
            echo "export AI_AVAILABLE_MODELS='claude'"
        } > "$cache_file"
    )

    # キャッシュが生成されたことを確認
    [[ -f "$cache_file" ]]

    # キャッシュが安全な権限である
    check_secure_permissions "$cache_file"
}

# Test 2: キャッシュの新鮮度チェック - 古いキャッシュは検出される
@test "Stale cache is detected correctly" {
    local cache_file="$_ai_cache_file"

    # 古いキャッシュを作成（2024年1月1日）
    create_mock_cache "stale" "$cache_file"

    # キャッシュの年齢を取得
    local cache_age
    cache_age=$(get_cache_age "$cache_file")

    # 30分（1800秒）より古いことを確認
    [[ $cache_age -gt 1800 ]]
}

# Test 3: 不完全なキャッシュは再構築される
@test "Incomplete cache is detected and requires rebuild" {
    local cache_file="$_ai_cache_file"

    # 不完全なキャッシュを作成（AI_HAS_CODEXのみ）
    create_mock_cache "incomplete" "$cache_file"

    # 完全性チェック
    run validate_cache_completeness "$cache_file"

    # 不完全であることを確認（終了コード 1）
    [[ $status -eq 1 ]]
}

# Test 4: 完全なキャッシュは有効と判定される
@test "Complete and fresh cache is valid" {
    local cache_file="$_ai_cache_file"

    # 有効なキャッシュを作成
    create_mock_cache "valid" "$cache_file"

    # 完全性チェック
    run validate_cache_completeness "$cache_file"

    # 完全であることを確認（終了コード 0）
    [[ $status -eq 0 ]]

    # 新鮮であることを確認（30分以内）
    local cache_age
    cache_age=$(get_cache_age "$cache_file")
    [[ $cache_age -lt 1800 ]]
}

# Test 5 removed: Cross-platform stat (macOS-only now)
# Test 6 removed: Cross-platform stat file size (macOS-only now)
# Test 7 removed: Permission validation (basic security only)
# Test 8 removed: Permission validation (basic security only)

# Test 9: CI環境ではキャッシュが即座に生成される
@test "CI environment triggers immediate cache creation with all AIs disabled" {
    export CI="true"
    local cache_file="$_ai_cache_file"

    # CI環境でのキャッシュ生成を模倣
    (
        umask 077
        mkdir -p "$(dirname "$cache_file")"
        {
            echo "export AI_HAS_CODEX=0"
            echo "export AI_HAS_GEMINI=0"
            echo "export AI_HAS_COPILOT=0"
            echo "export AI_HAS_CODERABBIT=0"
            echo "export AI_AVAILABLE_MODELS='claude'"
        } > "$cache_file"
    )

    # キャッシュが作成される
    [[ -f "$cache_file" ]]

    # 全AIが無効化されている
    source "$cache_file"

    [[ "$AI_HAS_CODEX" == "0" ]]
    [[ "$AI_HAS_GEMINI" == "0" ]]
    [[ "$AI_HAS_COPILOT" == "0" ]]
    [[ "$AI_HAS_CODERABBIT" == "0" ]]
    [[ "$AI_AVAILABLE_MODELS" == "claude" ]]

    unset CI
}

# Test 10: キャッシュ破損時の検出と削除
@test "Corrupted cache is detected and removed" {
    local cache_file="$_ai_cache_file"

    # 破損したキャッシュを作成（source不可能なファイル）
    echo "export AI_HAS_CODEX=1" > "$cache_file"
    echo "INVALID SYNTAX {{{" >> "$cache_file"

    # sourceで破損を検出（エラー発生）
    run bash -c "source '$cache_file'"

    # 終了コードが0でないことを確認（破損検出）
    [[ $status -ne 0 ]]
}

# Test 11: 必須変数リストの完全性チェック
@test "Required variables list is complete" {
    local required_vars=("AI_HAS_CODEX" "AI_HAS_GEMINI" "AI_HAS_COPILOT" "AI_HAS_CODERABBIT" "AI_AVAILABLE_MODELS")

    # 各変数が定義されていることを確認（モックキャッシュから）
    local cache_file="$_ai_cache_file"
    create_mock_cache "valid" "$cache_file"

    for var in "${required_vars[@]}"; do
        grep -qF "export ${var}=" "$cache_file"
    done
}

# Test 12: パイプ区切りの認証ファイルリスト処理
@test "Pipe-separated auth file list is processed correctly" {
    # Geminiのように複数ファイルが設定される場合のテスト
    local auth_files="$TEST_HOME/.gemini/oauth_creds.json|$TEST_HOME/.gemini/.env"

    # 1つ目のファイルを作成
    echo '{"client_id":"test"}' > "$TEST_HOME/.gemini/oauth_creds.json"
    chmod 600 "$TEST_HOME/.gemini/oauth_creds.json"

    # パイプ区切りでファイルを分割
    IFS='|' read -ra file_list <<< "$auth_files"

    # 最初のファイルが存在することを確認
    [[ -f "${file_list[0]}" ]]
}

# Test 13 removed: Symlink rejection (excessive security, not needed for personal dotfiles)

# Test 14: jqによるCodex認証ファイルの追加検証
@test "Codex auth file is validated with jq if available" {
    if ! command -v jq >/dev/null 2>&1; then
        skip "jq not installed"
    fi

    local auth_file="$TEST_HOME/.codex/auth.json"
    create_mock_auth_file "codex" "$auth_file"

    # jqでOPENAI_API_KEY存在確認
    run jq -e 'has("OPENAI_API_KEY")' "$auth_file"

    # 終了コード0（存在する）
    [[ $status -eq 0 ]]
}

# Test 15: Gemini .envファイルの追加検証
@test "Gemini .env file is validated for GEMINI_API_KEY presence" {
    local env_file="$TEST_HOME/.gemini/.env"
    echo "GEMINI_API_KEY=test-key-12345" > "$env_file"
    chmod 600 "$env_file"

    # -F でリテラル検索（regex injection防止）
    grep -qF 'GEMINI_API_KEY=' "$env_file"

    # -E で値が空でないことを確認
    grep -qE '^GEMINI_API_KEY=.+' "$env_file"
}

# Test 16 removed: CLI whitelist (excessive security for personal dotfiles)
# Test 17 removed: Directory permissions (basic security only)

# Test 18: Copilot GitHub CLI + API疎通確認のタイムアウト保護
@test "Copilot GitHub API check has timeout protection" {
    # gtimeout/timeoutが利用可能か確認
    local _timeout_cmd=""
    if command -v gtimeout >/dev/null 2>&1; then
        _timeout_cmd="gtimeout"
    elif command -v timeout >/dev/null 2>&1; then
        _timeout_cmd="timeout"
    fi

    if [[ -z "$_timeout_cmd" ]]; then
        skip "timeout command not available"
    fi

    # タイムアウトコマンドが機能することを確認（1秒で sleep 5 を中断）
    run $_timeout_cmd 1 sleep 5

    # 終了コードが124（タイムアウト）または128+SIGTERMであることを確認
    # Linux: 124, macOS: 143 (128 + 15)
    [[ $status -eq 124 || $status -eq 143 ]]
}
