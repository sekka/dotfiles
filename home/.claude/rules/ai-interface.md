# AI Interface Specification

Claude Code ↔ 各AI間の標準化された入出力契約。

## 入力（Claude Code → 外部AI）

各エージェントがCLI呼び出し時に構成するプロンプトテンプレート:

```
[TASK_TYPE]: implement | review | research | analyze
[CONTEXT]:
  - Files: <対象ファイルパス>
  - Git diff: <差分（該当時）>
  - Summary: <コードベース構造要約>
[CONSTRAINTS]:
  - Scope: <対象範囲>
  - Exclusions: <除外対象>
[SUCCESS_CRITERIA]:
  - <具体的な成功条件>
```

## 出力（外部AI → Claude Code）

各エージェントがCLI出力をパースして返す標準フォーマット:

```markdown
## [AI名] [タスクタイプ] Results

### Status: success | partial | failure

### Findings
#### [severity: critical|high|medium|low] [file:line] 説明
- **Category**: security | performance | code_quality | architecture | test
- **Detail**: ...
- **Suggestion**: ...

### Summary
- Total: N, Critical: N, High: N, Medium: N, Low: N
```

## CLI呼び出しマッピング

| AI | 実装 | レビュー | 調査 |
|----|------|---------|------|
| Codex | `codex --full-auto "<prompt>"` | `codex review --uncommitted` | - |
| Gemini | - | `gemini "<prompt>"` | `gemini "<prompt>"` |
| Copilot | - | `copilot -p "<prompt>"` | - |
| CodeRabbit | - | `coderabbit review --prompt-only` | - |

**セキュリティ注意:**
- `--yolo`, `--allow-all-tools` などのセーフガード無効化フラグは使用しない
- 各CLIのデフォルト安全設定を尊重

## エラー処理仕様

| 項目 | 仕様 |
|------|------|
| タイムアウト | 各AI実行5分 |
| リトライ | 指数バックオフ (1s, 2s, 4s, 8s max) |
| フォールバック | Claude内蔵エージェントに自動切替 |
| ログ | `~/.local/share/claude/ai-dispatch.log` |
| ユーザー通知 | `[AI-DISPATCH] Fallback triggered: <reason>` を stderr出力 |

## ログ記録関数

全エージェントで共通使用する `_log_ai_event` 関数:

```bash
# ~/.local/share/claude/ai-dispatch.log にイベント記録
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
        # SECURITY: バックスラッシュを最初にエスケープ（JSON injection防止）
        local ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
        local safe_level="${level//\\/\\\\}"
        safe_level="${safe_level//\"/\\\"}"
        local safe_service="${service//\\/\\\\}"
        safe_service="${safe_service//\"/\\\"}"
        local safe_event="${event//\\/\\\\}"
        safe_event="${safe_event//\"/\\\"}"
        local safe_user="${USER//\\/\\\\}"
        safe_user="${safe_user//\"/\\\"}"

        json_log="{\"timestamp\":\"$ts\",\"level\":\"$safe_level\",\"service\":\"$safe_service\",\"event\":\"$safe_event\",\"user\":\"$safe_user\"}"
    fi

    # セキュリティ: ログファイル初回作成時に安全な権限で作成
    if [[ ! -f "$log_file" ]]; then
        (umask 077; touch "$log_file")
    fi

    echo "$json_log" >> "$log_file"
    chmod 600 "$log_file"

    # ログローテーション: 1MB超過時にタイムスタンプ付きアーカイブ
    # SECURITY: PID + RANDOM でファイル名衝突防止（並列実行対策）
    if [[ -f "$log_file" ]] && (( $(stat -f%z "$log_file" 2>/dev/null || stat -c%s "$log_file" 2>/dev/null || echo 0) > 1048576 )); then
        local rotated_file="$log_file.$(date -u +%Y%m%d%H%M%S).$$.$RANDOM"
        mv "$log_file" "$rotated_file"
        chmod 600 "$rotated_file" 2>/dev/null || true

        # 7日以上前のログを削除
        find "$log_dir" -name "ai-dispatch.log.*" -type f -mtime +7 -delete 2>/dev/null || true
    fi
}

# 使用例
_log_ai_event "INFO" "codex" "agent_start"
_log_ai_event "ERROR" "gemini" "auth_failed"
_log_ai_event "WARN" "copilot" "timeout"
```

## 認証再検証パターン

各エージェントで使用する共通ガードパターン:

### 共通関数

各AI別スクリプトで使用する共通ヘルパー関数:

```bash
# timeout/gtimeout フォールバック検証
_check_cli_responsiveness() {
    local cli_name="$1"
    local timeout_seconds="${2:-2}"
    local _timeout_cmd=$(command -v timeout || command -v gtimeout || echo "")

    if [[ -n "$_timeout_cmd" ]] && ! $_timeout_cmd "$timeout_seconds" "$cli_name" --version >/dev/null 2>&1; then
        echo "WARNING: $cli_name CLI not responding" >&2
        return 1
    elif [[ -z "$_timeout_cmd" ]] && ! "$cli_name" --version >/dev/null 2>&1; then
        echo "WARNING: $cli_name CLI not responding" >&2
        return 1
    fi
    return 0
}
```

### Codex系エージェント

```bash
# 環境変数チェック（高速パス）
if [[ "$AI_HAS_CODEX" != "1" ]]; then
    # 再検証: 認証ファイル確認（環境変数が陳腐化している可能性）
    if ! [[ -f ~/.codex/auth.json ]]; then
        if ! command -v codex >/dev/null 2>&1; then
            echo "ERROR: Codex CLI not installed" >&2
            echo "  Install: npm install -g @openai/codex" >&2
        else
            echo "ERROR: Codex not authenticated" >&2
            echo "  Run: codex login" >&2
        fi
        echo "Recommendation: Use standard implementer agent instead" >&2
        exit 1
    fi
fi

# CLI応答性確認（共通関数使用）
if ! _check_cli_responsiveness "codex" 2; then
    exit 1
fi
```

### Gemini系エージェント

```bash
if [[ "$AI_HAS_GEMINI" != "1" ]]; then
    # 再検証（-F でリテラル検索: regex injection防止）
    if [[ -z "$GEMINI_API_KEY" ]] && ! ( [[ -f ~/.gemini/.env ]] && grep -qF 'GEMINI_API_KEY=' ~/.gemini/.env 2>/dev/null ); then
        echo "ERROR: Gemini not authenticated" >&2
        echo "  Set GEMINI_API_KEY environment variable or create ~/.gemini/.env" >&2
        echo "Recommendation: Use standard researcher agent instead" >&2
        exit 1
    fi
fi
```

### Copilot系エージェント

```bash
if [[ "$AI_HAS_COPILOT" != "1" ]]; then
    # 再検証（GitHub CLI + API疎通）
    if ! gh auth status >/dev/null 2>&1; then
        if ! command -v gh >/dev/null 2>&1; then
            echo "ERROR: GitHub CLI not installed" >&2
            echo "  Install: brew install gh" >&2
        else
            echo "ERROR: GitHub not authenticated" >&2
            echo "  Run: gh auth login" >&2
        fi
        echo "Recommendation: Use standard reviewer agent instead" >&2
        exit 1
    fi
fi

# Copilot CLI自体の存在確認
if ! command -v copilot >/dev/null 2>&1; then
    echo "ERROR: Copilot CLI not installed" >&2
    echo "  Install: gh extension install github/gh-copilot" >&2
    exit 1
fi

# CLI応答性確認（共通関数使用）
if ! _check_cli_responsiveness "copilot" 2; then
    exit 1
fi
```

### CodeRabbit系エージェント

```bash
if [[ "$AI_HAS_CODERABBIT" != "1" ]]; then
    # 再検証
    if ! [[ -f ~/.coderabbit/config.json || -f ~/.coderabbit/auth.token ]]; then
        if ! command -v coderabbit >/dev/null 2>&1; then
            echo "ERROR: CodeRabbit CLI not installed" >&2
        else
            echo "ERROR: CodeRabbit not configured" >&2
            echo "  Run: coderabbit auth login" >&2
        fi
        echo "Recommendation: Use standard reviewer agent instead" >&2
        exit 1
    fi
fi
```
