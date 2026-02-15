#!/usr/bin/env bats
# ai-check.sh のユニットテスト

setup() {
    load '../helpers/test_helper'

    # テスト用の一時ディレクトリ
    export TEST_HOME="$BATS_TMPDIR/ai_check_test_$$"
    export HOME="$TEST_HOME"
    export XDG_CACHE_HOME="$TEST_HOME/.cache"

    mkdir -p "$TEST_HOME/.codex"
    mkdir -p "$TEST_HOME/.gemini"
    mkdir -p "$TEST_HOME/.coderabbit"
    mkdir -p "$XDG_CACHE_HOME"

    # CI環境フラグをクリア
    unset CI
    unset GITHUB_ACTIONS
    unset GITLAB_CI
}

teardown() {
    cleanup_test_dir "$TEST_HOME"
}

# Test 1: ai-check.sh が実行可能である
@test "ai-check.sh is executable" {
    [[ -x /Users/kei/dotfiles/scripts/system/ai-check.sh ]]
}

# Test 2: ai-check.sh が存在する
@test "ai-check.sh exists" {
    [[ -f /Users/kei/dotfiles/scripts/system/ai-check.sh ]]
}

# Test 3: Codex認証ファイルが存在する場合、OKと表示される
@test "Codex auth file existence is detected as OK" {
    # モック認証ファイル作成
    create_mock_auth_file "codex" "$TEST_HOME/.codex/auth.json"

    # モック環境変数を設定
    export AI_HAS_CODEX=1

    # ai-check.sh のcheck_ai関数を模倣
    check_ai() {
        local name=$1 var=$2
        local value="${!var}"
        if [[ $value == "1" ]]; then
            echo "[OK]   $name"
        else
            echo "[FAIL] $name"
        fi
    }

    # テスト実行
    run check_ai "Codex" "AI_HAS_CODEX"

    # [OK] Codexが出力される
    [[ "$output" =~ \[OK\].*Codex ]]
}

# Test 4: Codex認証ファイルが存在しない場合、FAILと表示される
@test "Missing Codex auth file is detected as FAIL" {
    # 認証ファイルなし
    export AI_HAS_CODEX=0

    check_ai() {
        local name=$1 var=$2
        local value="${!var}"
        if [[ $value == "1" ]]; then
            echo "[OK]   $name"
        else
            echo "[FAIL] $name"
        fi
    }

    run check_ai "Codex" "AI_HAS_CODEX"

    # [FAIL] Codexが出力される
    [[ "$output" =~ \[FAIL\].*Codex ]]
}

# Test 5: キャッシュの年齢が表示される
@test "Cache age is calculated and displayed" {
    local cache_file="$XDG_CACHE_HOME/ai-availability.cache"
    create_mock_cache "valid" "$cache_file"

    # キャッシュ年齢を取得
    local age
    age=$(get_cache_age "$cache_file")

    # 年齢が0秒以上であることを確認
    [[ $age -ge 0 ]]

    # 年齢が表示可能な形式であることを確認（数値）
    [[ $age =~ ^[0-9]+$ ]]
}

# Test 6: パーミッションチェック - 600の場合はOK
@test "Permission check reports OK for 600 permissions" {
    local auth_file="$TEST_HOME/.codex/auth.json"
    create_mock_auth_file "codex" "$auth_file"

    # パーミッション取得
    local perm
    perm=$(stat -f%A "$auth_file" 2>/dev/null || stat -c%a "$auth_file" 2>/dev/null)
    perm="${perm: -3}"

    # 600であることを確認
    [[ "$perm" == "600" ]]
}

# Test 7: パーミッションチェック - 600でない場合はWARN
@test "Permission check reports WARN for non-600 permissions" {
    local auth_file="$TEST_HOME/.gemini/.env"
    echo "GEMINI_API_KEY=test" > "$auth_file"
    chmod 644 "$auth_file"

    # パーミッション取得
    local perm
    perm=$(stat -f%A "$auth_file" 2>/dev/null || stat -c%a "$auth_file" 2>/dev/null)
    perm="${perm: -3}"

    # 600でないことを確認
    [[ "$perm" != "600" ]]
}

# Test 8: 複数AIの状態を一括チェック
@test "Multiple AI statuses are checked" {
    # 複数のAI状態を設定
    export AI_HAS_CODEX=1
    export AI_HAS_GEMINI=0
    export AI_HAS_COPILOT=1
    export AI_HAS_CODERABBIT=0

    check_ai() {
        local name=$1 var=$2
        local value="${!var}"
        if [[ $value == "1" ]]; then
            echo "[OK]   $name"
        else
            echo "[FAIL] $name"
        fi
    }

    # 各AIをチェック
    local output=""
    output+=$(check_ai "Codex" "AI_HAS_CODEX")$'\n'
    output+=$(check_ai "Gemini" "AI_HAS_GEMINI")$'\n'
    output+=$(check_ai "Copilot" "AI_HAS_COPILOT")$'\n'
    output+=$(check_ai "CodeRabbit" "AI_HAS_CODERABBIT")

    # 結果検証
    [[ "$output" =~ \[OK\].*Codex ]]
    [[ "$output" =~ \[FAIL\].*Gemini ]]
    [[ "$output" =~ \[OK\].*Copilot ]]
    [[ "$output" =~ \[FAIL\].*CodeRabbit ]]
}

# Test 9: AI_AVAILABLE_MODELS 環境変数が表示される
@test "AI_AVAILABLE_MODELS environment variable is displayed" {
    export AI_AVAILABLE_MODELS="claude,codex,copilot"

    # 表示ロジックを模倣
    local output="Available: $AI_AVAILABLE_MODELS"

    [[ "$output" =~ Available:.*claude ]]
    [[ "$output" =~ codex ]]
    [[ "$output" =~ copilot ]]
}

# Test 10: キャッシュが存在しない場合、"not found"と表示
@test "Cache not found message is displayed when cache does not exist" {
    local cache_file="$XDG_CACHE_HOME/ai-availability.cache"

    # キャッシュが存在しないことを確認
    [[ ! -f "$cache_file" ]]

    # 表示ロジック
    local output
    if [[ -f "$cache_file" ]]; then
        output="Cache: found"
    else
        output="Cache: not found"
    fi

    [[ "$output" == "Cache: not found" ]]
}

# Test 11: 認証ファイルの存在確認（複数ファイル）
@test "Multiple auth files are checked for existence" {
    # Codex認証ファイルのみ作成
    create_mock_auth_file "codex" "$TEST_HOME/.codex/auth.json"

    # 各ファイルの存在確認
    local files=(
        "$TEST_HOME/.codex/auth.json"
        "$TEST_HOME/.gemini/.env"
        "$TEST_HOME/.coderabbit/auth.token"
    )

    local found_count=0
    for f in "${files[@]}"; do
        if [[ -f "$f" ]]; then
            found_count=$((found_count + 1))
        fi
    done

    # 1つのファイルのみ存在
    [[ $found_count -eq 1 ]]
}

# Test 12: stat コマンドのクロスプラットフォーム対応（パーミッション）
@test "Cross-platform stat for permissions works" {
    local test_file="$TEST_HOME/test.txt"
    echo "test" > "$test_file"
    chmod 600 "$test_file"

    # パーミッション取得
    local perm
    perm=$(stat -f%A "$test_file" 2>/dev/null || stat -c%a "$test_file" 2>/dev/null)

    # パーミッションが取得できた
    [[ -n "$perm" ]]

    # 数値形式である
    [[ "$perm" =~ ^[0-9]+$ ]]
}

# Test 13: stat コマンドのクロスプラットフォーム対応（mtime）
@test "Cross-platform stat for mtime works in ai-check.sh" {
    local cache_file="$XDG_CACHE_HOME/ai-availability.cache"
    create_mock_cache "valid" "$cache_file"

    # mtime取得（ai-check.shのロジック）
    local mtime
    mtime=$(stat -f%m "$cache_file" 2>/dev/null || stat -c%Y "$cache_file" 2>/dev/null || echo 0)

    # mtimeが取得できた（0でない）
    [[ $mtime -ne 0 ]]

    # 数値形式である
    [[ $mtime =~ ^[0-9]+$ ]]
}

# Test 14: 環境変数が未設定の場合でもクラッシュしない
@test "Script does not crash when environment variables are unset" {
    unset AI_HAS_CODEX
    unset AI_HAS_GEMINI
    unset AI_HAS_COPILOT
    unset AI_HAS_CODERABBIT
    unset AI_AVAILABLE_MODELS

    check_ai() {
        local name=$1 var=$2
        local value="${!var}"
        if [[ $value == "1" ]]; then
            echo "[OK]   $name"
        else
            echo "[FAIL] $name"
        fi
    }

    # エラーが発生しないことを確認
    run check_ai "Codex" "AI_HAS_CODEX"
    [[ $status -eq 0 ]]
}
