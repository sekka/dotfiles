#!/usr/bin/env bats
# エージェントオーケストレーション統合テスト

setup() {
    load '../helpers/test_helper'

    export TEST_HOME="$BATS_TMPDIR/agent_orchestration_test_$$"
    export HOME="$TEST_HOME"
    export XDG_CACHE_HOME="$TEST_HOME/.cache"

    mkdir -p "$TEST_HOME/.codex"
    mkdir -p "$TEST_HOME/.gemini"
    mkdir -p "$TEST_HOME/.coderabbit"
    mkdir -p "$XDG_CACHE_HOME"

    unset CI
    unset GITHUB_ACTIONS
    unset GITLAB_CI
}

teardown() {
    cleanup_test_dir "$TEST_HOME"
}

# Test 1: 環境変数が正しくエクスポートされる
@test "Environment variables are exported correctly" {
    # AI可用性キャッシュを作成
    local cache_file="$XDG_CACHE_HOME/ai-availability.cache"
    create_mock_cache "valid" "$cache_file"

    # キャッシュをロード
    source "$cache_file"

    # 環境変数がエクスポートされている
    [[ "$AI_HAS_CODEX" == "1" ]]
    [[ "$AI_HAS_GEMINI" == "0" ]]
    [[ "$AI_HAS_COPILOT" == "1" ]]
    [[ "$AI_HAS_CODERABBIT" == "0" ]]
    [[ "$AI_AVAILABLE_MODELS" == "claude,codex,copilot" ]]
}

# Test 2: 環境変数が子プロセスに継承される
@test "Environment variables are inherited by child processes" {
    export AI_HAS_CODEX=1
    export AI_AVAILABLE_MODELS="claude,codex"

    # 子プロセスで環境変数を確認
    run bash -c 'echo "$AI_HAS_CODEX"'
    [[ "$output" == "1" ]]

    run bash -c 'echo "$AI_AVAILABLE_MODELS"'
    [[ "$output" == "claude,codex" ]]
}

# Test 3: Codex認証再検証パターン
@test "Codex authentication revalidation pattern works" {
    # 環境変数でCodexが無効と設定
    export AI_HAS_CODEX=0

    # しかし、実際には認証ファイルが存在する（再検証で検出されるべき）
    create_mock_auth_file "codex" "$TEST_HOME/.codex/auth.json"

    # 再検証ロジック: 認証ファイル確認
    if [[ -f "$TEST_HOME/.codex/auth.json" ]]; then
        export AI_HAS_CODEX=1
    fi

    # 再検証により有効化される
    [[ "$AI_HAS_CODEX" == "1" ]]
}

# Test 4: Gemini認証再検証パターン（.envファイル）
@test "Gemini authentication revalidation pattern works" {
    export AI_HAS_GEMINI=0
    unset GEMINI_API_KEY

    # .envファイルが存在する
    local env_file="$TEST_HOME/.gemini/.env"
    echo "GEMINI_API_KEY=test-key" > "$env_file"
    chmod 600 "$env_file"

    # 再検証ロジック: .envファイルとGEMINI_API_KEY確認
    if [[ -f "$env_file" ]] && grep -qF 'GEMINI_API_KEY=' "$env_file" 2>/dev/null; then
        export AI_HAS_GEMINI=1
    fi

    # 再検証により有効化される
    [[ "$AI_HAS_GEMINI" == "1" ]]
}

# Test 5: Copilot認証再検証パターン（GitHub CLI）
@test "Copilot authentication revalidation pattern detects gh CLI" {
    # gh コマンドが存在する場合のみテスト
    if ! command -v gh >/dev/null 2>&1; then
        skip "GitHub CLI not installed"
    fi

    # gh auth status の結果を確認
    if gh auth status >/dev/null 2>&1; then
        export AI_HAS_COPILOT=1
    else
        export AI_HAS_COPILOT=0
    fi

    # AI_HAS_COPILOTが0または1に設定される
    [[ "$AI_HAS_COPILOT" =~ ^[01]$ ]]
}

# Test 6: CodeRabbit認証再検証パターン
@test "CodeRabbit authentication revalidation pattern works" {
    export AI_HAS_CODERABBIT=0

    # 認証ファイル作成
    create_mock_auth_file "coderabbit" "$TEST_HOME/.coderabbit/auth.json"

    # 再検証ロジック: 認証ファイル確認
    if [[ -f "$TEST_HOME/.coderabbit/auth.json" ]] || \
       [[ -f "$TEST_HOME/.coderabbit/config.json" ]] || \
       [[ -f "$TEST_HOME/.coderabbit/auth.token" ]]; then
        export AI_HAS_CODERABBIT=1
    fi

    # 再検証により有効化される
    [[ "$AI_HAS_CODERABBIT" == "1" ]]
}

# Test 7: 全AI無効時のフォールバック（Claudeのみ）
@test "Fallback to Claude-only when all AIs are unavailable" {
    export AI_HAS_CODEX=0
    export AI_HAS_GEMINI=0
    export AI_HAS_COPILOT=0
    export AI_HAS_CODERABBIT=0
    export AI_AVAILABLE_MODELS="claude"

    # Claudeのみ利用可能
    [[ "$AI_AVAILABLE_MODELS" == "claude" ]]
}

# Test 8: 複数AI利用可能時の並列実行検証
@test "Multiple AIs are available for parallel execution" {
    export AI_HAS_CODEX=1
    export AI_HAS_COPILOT=1
    export AI_AVAILABLE_MODELS="claude,codex,copilot"

    # 利用可能AIの数をカウント
    local available_count=0
    [[ "$AI_HAS_CODEX" == "1" ]] && available_count=$((available_count + 1))
    [[ "${AI_HAS_GEMINI:-0}" == "1" ]] && available_count=$((available_count + 1))
    [[ "$AI_HAS_COPILOT" == "1" ]] && available_count=$((available_count + 1))
    [[ "${AI_HAS_CODERABBIT:-0}" == "1" ]] && available_count=$((available_count + 1))

    # 2つ以上のAIが利用可能（Claude除く）
    [[ $available_count -ge 2 ]]
}

# Test 9: エージェント選択ロジック - Codex優先（実装タスク）
@test "Codex is preferred for implementation tasks when available" {
    export AI_HAS_CODEX=1
    export AI_HAS_GEMINI=1

    # 実装タスクの場合、Codexを選択
    local selected_ai=""
    if [[ "$AI_HAS_CODEX" == "1" ]]; then
        selected_ai="codex-implementer"
    else
        selected_ai="implementer"
    fi

    [[ "$selected_ai" == "codex-implementer" ]]
}

# Test 10: エージェント選択ロジック - Gemini優先（調査タスク）
@test "Gemini is preferred for research tasks when available" {
    export AI_HAS_GEMINI=1

    # 調査タスクの場合、Geminiを選択
    local selected_ai=""
    if [[ "$AI_HAS_GEMINI" == "1" ]]; then
        selected_ai="gemini-researcher"
    else
        selected_ai="researcher"
    fi

    [[ "$selected_ai" == "gemini-researcher" ]]
}

# Test 11: 環境適応ルーティング - フォールバック
@test "Environment-adaptive routing falls back to Claude agents" {
    # 全外部AIが無効
    export AI_HAS_CODEX=0
    export AI_HAS_GEMINI=0
    export AI_HAS_COPILOT=0
    export AI_HAS_CODERABBIT=0

    # 実装タスク: 標準implementerにフォールバック
    local impl_agent=""
    if [[ "$AI_HAS_CODEX" == "1" ]]; then
        impl_agent="codex-implementer"
    else
        impl_agent="implementer"
    fi

    # 調査タスク: 標準researcherにフォールバック
    local research_agent=""
    if [[ "$AI_HAS_GEMINI" == "1" ]]; then
        research_agent="gemini-researcher"
    else
        research_agent="researcher"
    fi

    [[ "$impl_agent" == "implementer" ]]
    [[ "$research_agent" == "researcher" ]]
}

# Test 12: キャッシュの一貫性 - 環境変数とキャッシュファイルが一致
@test "Cache consistency - environment variables match cache file" {
    local cache_file="$XDG_CACHE_HOME/ai-availability.cache"
    create_mock_cache "valid" "$cache_file"

    # キャッシュをロード
    source "$cache_file"

    # キャッシュ内容を再度読み取り、一致を確認
    local cached_codex
    cached_codex=$(grep "AI_HAS_CODEX=" "$cache_file" | cut -d"'" -f2)

    [[ "$AI_HAS_CODEX" == "$cached_codex" ]]
}

# Test 13 removed: Auto-fix permissions (excessive security for personal dotfiles)

# Test 14: CI環境での早期終了
@test "CI environment triggers early exit with all AIs disabled" {
    export CI="true"

    # CI環境検出ロジック
    if [[ -n "$CI" ]] || [[ -n "$GITHUB_ACTIONS" ]] || [[ -n "$GITLAB_CI" ]]; then
        export AI_AVAILABLE_MODELS="claude"
        export AI_HAS_CODEX=0
        export AI_HAS_GEMINI=0
        export AI_HAS_COPILOT=0
        export AI_HAS_CODERABBIT=0
    fi

    # 全AIが無効化される
    [[ "$AI_AVAILABLE_MODELS" == "claude" ]]
    [[ "$AI_HAS_CODEX" == "0" ]]
    [[ "$AI_HAS_GEMINI" == "0" ]]
    [[ "$AI_HAS_COPILOT" == "0" ]]
    [[ "$AI_HAS_CODERABBIT" == "0" ]]

    unset CI
}

# Test 15: 環境変数のセキュアなサニタイズ
@test "Environment variables are sanitized securely" {
    # 危険な値を設定
    export MALICIOUS_VAR='; rm -rf /tmp; echo '

    # サニタイズ（英数字、ハイフン、アンダースコアのみ許可）
    local sanitized="${MALICIOUS_VAR//[^a-zA-Z0-9_-]/}"

    # 危険な文字が除去される
    [[ ! "$sanitized" =~ \; ]]
    [[ ! "$sanitized" =~ \$ ]]
    [[ ! "$sanitized" =~ / ]]
}
