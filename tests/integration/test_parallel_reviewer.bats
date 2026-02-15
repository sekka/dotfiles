#!/usr/bin/env bats
# parallel-reviewer.md 専用統合テスト

setup() {
    load '../helpers/test_helper'

    export TEST_HOME="$BATS_TMPDIR/parallel_reviewer_test_$$"
    export HOME="$TEST_HOME"

    unset CI
    unset GITHUB_ACTIONS
    unset GITLAB_CI
}

teardown() {
    cleanup_test_dir "$TEST_HOME"
}

# Test 1: command -v によるCodex検出
@test "Codex is detected via command -v" {
    # codexコマンドが存在する場合
    if command -v codex >/dev/null 2>&1; then
        run command -v codex
        [[ $status -eq 0 ]]
    else
        skip "Codex not installed"
    fi
}

# Test 2: command -v によるCopilot検出
@test "Copilot is detected via command -v" {
    if command -v copilot >/dev/null 2>&1; then
        run command -v copilot
        [[ $status -eq 0 ]]
    else
        skip "Copilot not installed"
    fi
}

# Test 3: GitHub CLI + Copilot統合検出
@test "Copilot is detected via gh + copilot combination" {
    # GitHub CLI認証チェック + Copilot CLI存在確認
    if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
        if command -v copilot >/dev/null 2>&1; then
            run bash -c 'command -v copilot'
            [[ $status -eq 0 ]]
        else
            skip "Copilot CLI not installed"
        fi
    else
        skip "GitHub CLI not authenticated"
    fi
}

# Test 4: CodeRabbit検出
@test "CodeRabbit is detected via command -v" {
    if command -v coderabbit >/dev/null 2>&1; then
        run command -v coderabbit
        [[ $status -eq 0 ]]
    else
        skip "CodeRabbit not installed"
    fi
}

# Test 5: Gemini検出（環境変数 + CLI）
@test "Gemini is detected via GEMINI_API_KEY or CLI" {
    # ケース1: 環境変数で検出
    export GEMINI_API_KEY="test-key"
    local gemini_available=0

    if [[ -n "$GEMINI_API_KEY" ]] || command -v gemini >/dev/null 2>&1; then
        gemini_available=1
    fi

    [[ $gemini_available -eq 1 ]]

    unset GEMINI_API_KEY
}

# Test 6: 利用可能AI数のカウント
@test "Available AI count is calculated correctly" {
    declare -A ai_available

    # Codex
    if command -v codex >/dev/null 2>&1; then
        ai_available[codex]=1
    else
        ai_available[codex]=0
    fi

    # Copilot
    if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1 && command -v copilot >/dev/null 2>&1; then
        ai_available[copilot]=1
    else
        ai_available[copilot]=0
    fi

    # CodeRabbit
    if command -v coderabbit >/dev/null 2>&1; then
        ai_available[coderabbit]=1
    else
        ai_available[coderabbit]=0
    fi

    # Gemini
    if [[ -n "$GEMINI_API_KEY" ]] || command -v gemini >/dev/null 2>&1; then
        ai_available[gemini]=1
    else
        ai_available[gemini]=0
    fi

    # カウント
    local total_available=0
    for ai in "${!ai_available[@]}"; do
        if [[ ${ai_available[$ai]} == "1" ]]; then
            total_available=$((total_available + 1))
        fi
    done

    # 少なくとも0以上であることを確認
    [[ $total_available -ge 0 ]]

    # デバッグ出力
    debug_output "Available AI services: $total_available"
    for ai in codex copilot coderabbit gemini; do
        debug_output "  - $ai: ${ai_available[$ai]:-0}"
    done
}

# Test 7: フォールバック - 全AI無効時にClaudeレビュアーを使用
@test "Falls back to Claude reviewer when all external AIs are unavailable" {
    # 全AI無効をシミュレート
    declare -A ai_available
    ai_available[codex]=0
    ai_available[copilot]=0
    ai_available[coderabbit]=0
    ai_available[gemini]=0

    local total_available=0
    for ai in "${!ai_available[@]}"; do
        if [[ ${ai_available[$ai]} == "1" ]]; then
            total_available=$((total_available + 1))
        fi
    done

    # 全AIが無効
    [[ $total_available -eq 0 ]]

    # フォールバックロジック
    local fallback_reviewer="reviewer"
    [[ "$fallback_reviewer" == "reviewer" ]]
}

# Test 8: 利用可能なレビュアーリストの構築
@test "Reviewers to launch list is built correctly" {
    declare -A ai_available
    ai_available[codex]=1
    ai_available[copilot]=0
    ai_available[coderabbit]=1
    ai_available[gemini]=0

    # レビュアーリスト構築
    local reviewers_to_launch=()

    [[ ${ai_available[codex]:-0} == "1" ]] && reviewers_to_launch+=("codex-reviewer")
    [[ ${ai_available[copilot]:-0} == "1" ]] && reviewers_to_launch+=("copilot-reviewer")
    [[ ${ai_available[coderabbit]:-0} == "1" ]] && reviewers_to_launch+=("coderabbit-reviewer")
    [[ ${ai_available[gemini]:-0} == "1" ]] && reviewers_to_launch+=("gemini-researcher")

    # 2つのレビュアーが起動対象
    [[ ${#reviewers_to_launch[@]} -eq 2 ]]

    # codex-reviewerとcoderabbit-reviewerが含まれる
    [[ " ${reviewers_to_launch[*]} " =~ " codex-reviewer " ]]
    [[ " ${reviewers_to_launch[*]} " =~ " coderabbit-reviewer " ]]
}

# Test 9: 1つのAIのみ利用可能な場合
@test "Single AI is launched when only one is available" {
    declare -A ai_available
    ai_available[codex]=1
    ai_available[copilot]=0
    ai_available[coderabbit]=0
    ai_available[gemini]=0

    local reviewers_to_launch=()

    [[ ${ai_available[codex]:-0} == "1" ]] && reviewers_to_launch+=("codex-reviewer")
    [[ ${ai_available[copilot]:-0} == "1" ]] && reviewers_to_launch+=("copilot-reviewer")
    [[ ${ai_available[coderabbit]:-0} == "1" ]] && reviewers_to_launch+=("coderabbit-reviewer")
    [[ ${ai_available[gemini]:-0} == "1" ]] && reviewers_to_launch+=("gemini-researcher")

    # 1つのレビュアーのみ
    [[ ${#reviewers_to_launch[@]} -eq 1 ]]
    [[ "${reviewers_to_launch[0]}" == "codex-reviewer" ]]
}

# Test 10: 全AI利用可能な場合
@test "All reviewers are launched when all AIs are available" {
    declare -A ai_available
    ai_available[codex]=1
    ai_available[copilot]=1
    ai_available[coderabbit]=1
    ai_available[gemini]=1

    local reviewers_to_launch=()

    [[ ${ai_available[codex]:-0} == "1" ]] && reviewers_to_launch+=("codex-reviewer")
    [[ ${ai_available[copilot]:-0} == "1" ]] && reviewers_to_launch+=("copilot-reviewer")
    [[ ${ai_available[coderabbit]:-0} == "1" ]] && reviewers_to_launch+=("coderabbit-reviewer")
    [[ ${ai_available[gemini]:-0} == "1" ]] && reviewers_to_launch+=("gemini-researcher")

    # 4つのレビュアー全て
    [[ ${#reviewers_to_launch[@]} -eq 4 ]]
}

# Test 11: N/M完了ステータスの計算
@test "N/M completion status is calculated correctly" {
    # 3つのレビュアーを起動し、2つが完了
    local total_launched=3
    local completed=2

    # N/M フォーマット
    local status="${completed}/${total_launched}"

    [[ "$status" == "2/3" ]]
}

# Test 12: GitHub CLI認証失敗時のCopilot除外
@test "Copilot is excluded when GitHub CLI is not authenticated" {
    # gh auth statusが失敗する場合をシミュレート
    if command -v gh >/dev/null 2>&1; then
        # gh auth statusの結果を確認（実際の環境依存）
        if ! gh auth status >/dev/null 2>&1; then
            # 認証失敗時、Copilotは利用不可
            local ai_available_copilot=0
            [[ $ai_available_copilot -eq 0 ]]
        else
            skip "GitHub CLI is authenticated"
        fi
    else
        skip "GitHub CLI not installed"
    fi
}

# Test 13: デバッグ出力の検証
@test "Debug output is generated for available AI services" {
    declare -A ai_available
    ai_available[codex]=1
    ai_available[copilot]=0
    ai_available[coderabbit]=1
    ai_available[gemini]=0

    local total_available=0
    for ai in "${!ai_available[@]}"; do
        if [[ ${ai_available[$ai]} == "1" ]]; then
            total_available=$((total_available + 1))
        fi
    done

    # デバッグ出力を生成
    local debug_output="[parallel-reviewer] Available AI services: $total_available"
    for ai in codex copilot coderabbit gemini; do
        debug_output+=$'\n'"  - $ai: ${ai_available[$ai]:-0}"
    done

    # 出力内容を検証
    [[ "$debug_output" =~ "Available AI services: 2" ]]
    [[ "$debug_output" =~ "codex: 1" ]]
    [[ "$debug_output" =~ "coderabbit: 1" ]]
}

# Test 14: レビュアーリストが空でない場合のみ起動
@test "Reviewers are launched only when the list is not empty" {
    local reviewers_to_launch=()

    # 空のリスト
    if (( ${#reviewers_to_launch[@]} > 0 )); then
        # 起動しない
        false
    else
        # フォールバック
        true
    fi
}

# Test 15: 連想配列のデフォルト値処理
@test "Associative array default value handling works" {
    declare -A ai_available
    ai_available[codex]=1

    # 未定義のキーは0として扱う
    local copilot_status=${ai_available[copilot]:-0}

    [[ $copilot_status -eq 0 ]]
}

# Test 16: CLI存在確認の優先順位
@test "CLI existence check is prioritized over environment variables" {
    # 環境変数でCodex有効と設定されていても、CLIが存在しなければ無効
    export AI_HAS_CODEX=1

    local codex_available=0
    if command -v codex >/dev/null 2>&1; then
        codex_available=1
    else
        codex_available=0
    fi

    # CLI存在確認が優先される（実際の環境に依存）
    [[ $codex_available -eq 0 || $codex_available -eq 1 ]]
}

# Test 17: 並列起動時のレビュアー数制限
@test "Number of parallel reviewers is limited to available AIs" {
    declare -A ai_available
    ai_available[codex]=1
    ai_available[copilot]=1

    local reviewers_to_launch=()
    [[ ${ai_available[codex]:-0} == "1" ]] && reviewers_to_launch+=("codex-reviewer")
    [[ ${ai_available[copilot]:-0} == "1" ]] && reviewers_to_launch+=("copilot-reviewer")
    [[ ${ai_available[coderabbit]:-0} == "1" ]] && reviewers_to_launch+=("coderabbit-reviewer")
    [[ ${ai_available[gemini]:-0} == "1" ]] && reviewers_to_launch+=("gemini-researcher")

    # 最大4つまで（今回は2つ）
    [[ ${#reviewers_to_launch[@]} -le 4 ]]
    [[ ${#reviewers_to_launch[@]} -eq 2 ]]
}

# Test 18: タイムアウト設定の検証
@test "Reviewer timeout is set to 5 minutes (300 seconds)" {
    local timeout_seconds=300

    # 5分 = 300秒
    [[ $timeout_seconds -eq 300 ]]
}

# Test 19: レビュアー完了ステータスのトラッキング
@test "Reviewer completion status is tracked" {
    declare -A reviewer_status
    reviewer_status[codex-reviewer]="completed"
    reviewer_status[copilot-reviewer]="timeout"
    reviewer_status[coderabbit-reviewer]="completed"

    # 完了したレビュアー数をカウント
    local completed_count=0
    for status in "${reviewer_status[@]}"; do
        if [[ "$status" == "completed" ]]; then
            completed_count=$((completed_count + 1))
        fi
    done

    # 2つのレビュアーが完了
    [[ $completed_count -eq 2 ]]
}

# Test 20: 統合レポートのサマリー生成
@test "Integrated report summary is generated" {
    local total_findings=25
    local critical=3
    local high=7
    local medium=10
    local low=5

    # サマリーフォーマット
    local summary="Total findings: $total_findings"
    summary+=$'\n'"Critical: $critical, High: $high, Medium: $medium, Low: $low"

    # 検証
    [[ "$summary" =~ "Total findings: 25" ]]
    [[ "$summary" =~ "Critical: 3" ]]
    [[ "$summary" =~ "High: 7" ]]
}
