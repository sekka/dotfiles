#!/usr/bin/env bats
# ai-interface.md の _log_ai_event 関数テスト

setup() {
    load '../helpers/test_helper'

    # テスト用の一時ディレクトリ
    export TEST_HOME="$BATS_TMPDIR/ai_interface_test_$$"
    export XDG_DATA_HOME="$TEST_HOME/.local/share"
    mkdir -p "$XDG_DATA_HOME/claude"

    # _log_ai_event 関数をロード（ai-interface.mdから）
    _log_ai_event() {
        local level="$1" service="$2" event="$3"
        local log_dir="${XDG_DATA_HOME:-$HOME/.local/share}/claude"

        # セキュリティ: ログディレクトリを安全な権限で作成
        if [[ ! -d "$log_dir" ]]; then
            (umask 077; mkdir -p "$log_dir")
        fi
        [[ -d "$log_dir" ]] && chmod 700 "$log_dir"

        local log_file="$log_dir/ai-dispatch.log"

        # JSON生成（jq使用 - 自動エスケープ）
        local json_log
        if command -v jq >/dev/null 2>&1; then
            json_log=$(jq -n -c \
                --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
                --arg lv "$level" \
                --arg svc "$service" \
                --arg evt "$event" \
                --arg usr "$USER" \
                '{timestamp: $ts, level: $lv, service: $svc, event: $evt, user: $usr}')
        else
            # jq未インストール時のフォールバック: 手動エスケープ
            local ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
            local safe_level="${level//\"/\\\"}"
            local safe_service="${service//\"/\\\"}"
            local safe_event="${event//\"/\\\"}"
            local safe_user="${USER//\"/\\\"}"

            json_log="{\"timestamp\":\"$ts\",\"level\":\"$safe_level\",\"service\":\"$safe_service\",\"event\":\"$safe_event\",\"user\":\"$safe_user\"}"
        fi

        # セキュリティ: ログファイル初回作成時に安全な権限で作成
        if [[ ! -f "$log_file" ]]; then
            (umask 077; touch "$log_file")
        fi

        echo "$json_log" >> "$log_file"
        chmod 600 "$log_file"

        # ログローテーション: 1MB超過時にタイムスタンプ付きアーカイブ
        if [[ -f "$log_file" ]] && (( $(stat -f%z "$log_file" 2>/dev/null || stat -c%s "$log_file" 2>/dev/null || echo 0) > 1048576 )); then
            local timestamp=$(date +%Y%m%d_%H%M%S)
            mv "$log_file" "$log_file.$timestamp"
            chmod 600 "$log_file.$timestamp"

            # 7日以上前のログを削除
            find "$log_dir" -name "ai-dispatch.log.*" -type f -mtime +7 -delete 2>/dev/null || true
        fi
    }
}

teardown() {
    cleanup_test_dir "$TEST_HOME"
}

# Test 1: ログファイルが安全な権限で作成される
@test "Log file is created with secure permissions (600)" {
    _log_ai_event "INFO" "codex" "agent_start"

    local log_file="$XDG_DATA_HOME/claude/ai-dispatch.log"

    # ログファイルが存在する
    [[ -f "$log_file" ]]

    # パーミッションが600である
    check_secure_permissions "$log_file"
}

# Test 2: ログディレクトリが安全な権限で作成される
@test "Log directory is created with secure permissions (700)" {
    _log_ai_event "INFO" "gemini" "research_start"

    local log_dir="$XDG_DATA_HOME/claude"

    # ディレクトリが存在する
    [[ -d "$log_dir" ]]

    # パーミッションが700である
    local perm
    perm=$(stat -f%A "$log_dir" 2>/dev/null || stat -c%a "$log_dir" 2>/dev/null)
    perm="${perm: -3}"
    [[ "$perm" == "700" ]]
}

# Test 3: JSON injection 防止 - 適切にエスケープされる
@test "Malicious input is properly escaped to prevent JSON injection" {
    # 危険な入力（ダブルクォートを含む）
    local malicious_level='INFO"malicious'
    local malicious_service='test"service'
    local malicious_event='event"with"quotes'

    _log_ai_event "$malicious_level" "$malicious_service" "$malicious_event"

    local log_file="$XDG_DATA_HOME/claude/ai-dispatch.log"

    # ログが有効なJSONとして記録される（jqでパース可能）
    validate_log_json "$log_file"

    # jqで値を取得して、元の文字列が保持されていることを確認
    local level_in_log
    level_in_log=$(jq -r '.level' "$log_file")

    # jqを使用する場合は元の値が保持される
    # jq未使用の場合はエスケープされた形式になる
    if command -v jq >/dev/null 2>&1; then
        [[ "$level_in_log" == "$malicious_level" ]]
    fi
}

# Test 4: 複数のログエントリが正しく記録される
@test "Multiple log entries are recorded correctly" {
    _log_ai_event "INFO" "codex" "agent_start"
    _log_ai_event "WARN" "gemini" "timeout"
    _log_ai_event "ERROR" "copilot" "auth_failed"

    local log_file="$XDG_DATA_HOME/claude/ai-dispatch.log"

    # ログが有効なJSONである
    validate_log_json "$log_file"

    # 3行のログが記録されている
    local line_count
    line_count=$(wc -l < "$log_file" | tr -d ' ')
    [[ "$line_count" == "3" ]]
}

# Test 5: タイムスタンプがISO 8601形式である
@test "Timestamp is in ISO 8601 format" {
    _log_ai_event "INFO" "codex" "test_event"

    local log_file="$XDG_DATA_HOME/claude/ai-dispatch.log"

    # タイムスタンプがISO 8601形式（YYYY-MM-DDTHH:MM:SSZ）である
    local timestamp
    timestamp=$(jq -r '.timestamp' "$log_file")

    [[ "$timestamp" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$ ]]
}

# Test 6: ログローテーション - 1MB超過時にタイムスタンプ付きアーカイブが作成される
@test "Log rotation occurs when file exceeds 1MB" {
    local log_file="$XDG_DATA_HOME/claude/ai-dispatch.log"

    # 1MB以上のログファイルを作成（ダミーデータ）
    # 実際のログエントリを大量生成すると時間がかかるため、ddコマンドで直接作成
    mkdir -p "$XDG_DATA_HOME/claude"
    dd if=/dev/zero of="$log_file" bs=1024 count=1025 2>/dev/null  # 1025KB = 約1MB

    chmod 600 "$log_file"

    # ログイベントを追加（ローテーション発生）
    _log_ai_event "INFO" "codex" "rotation_test"

    # タイムスタンプ付きアーカイブファイルが作成される（ai-dispatch.log.YYYYMMDD_HHMMSS形式）
    local archive_count
    archive_count=$(find "$XDG_DATA_HOME/claude" -name "ai-dispatch.log.*" -type f | wc -l)
    [[ "$archive_count" -ge 1 ]]

    # アーカイブファイルも安全な権限である
    local archive_file
    archive_file=$(find "$XDG_DATA_HOME/claude" -name "ai-dispatch.log.*" -type f | head -1)
    if [[ -n "$archive_file" ]]; then
        check_secure_permissions "$archive_file"
    fi
}

# Test 7: ログにユーザー名が含まれる
@test "Log entry includes user name" {
    _log_ai_event "INFO" "codex" "user_test"

    local log_file="$XDG_DATA_HOME/claude/ai-dispatch.log"

    # ユーザー名が含まれる
    local user_in_log
    user_in_log=$(jq -r '.user' "$log_file")

    [[ -n "$user_in_log" ]]

    # ユーザー名が$USERと一致する
    [[ "$user_in_log" == "$USER" ]]
}

# Test 8: 空の入力でもクラッシュしない
@test "Empty input does not crash the function" {
    _log_ai_event "" "" ""

    local log_file="$XDG_DATA_HOME/claude/ai-dispatch.log"

    # ログファイルが作成される
    [[ -f "$log_file" ]]

    # 有効なJSONである
    validate_log_json "$log_file"
}

# Test 9: XDG_DATA_HOME未設定時のフォールバック
@test "Falls back to HOME/.local/share when XDG_DATA_HOME is unset" {
    unset XDG_DATA_HOME
    export HOME="$TEST_HOME"

    _log_ai_event "INFO" "codex" "fallback_test"

    local expected_log_file="$HOME/.local/share/claude/ai-dispatch.log"

    # ログファイルがHOME配下に作成される
    [[ -f "$expected_log_file" ]]
}

# Test 10: 並行書き込みでも競合しない（基本的なテスト）
@test "Concurrent writes do not corrupt the log file" {
    # 5つの並行ログイベントを発行
    for i in {1..5}; do
        _log_ai_event "INFO" "codex" "concurrent_$i" &
    done

    wait  # 全プロセスが完了するまで待機

    local log_file="$XDG_DATA_HOME/claude/ai-dispatch.log"

    # ログが有効なJSONである
    validate_log_json "$log_file"

    # 5行のログが記録されている
    local line_count
    line_count=$(wc -l < "$log_file" | tr -d ' ')
    [[ "$line_count" == "5" ]]
}
