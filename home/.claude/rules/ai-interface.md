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

各エージェントがCLI出力をパースして返すフォーマット参考例:

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
| Codex | `codex exec --sandbox workspace-write --ask-for-approval never "<prompt>"` | `codex review --uncommitted` | - |
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
| ユーザー通知 | `[AI-DISPATCH] Fallback triggered: <reason>` を stderr出力 |

## 認証再検証パターン

各エージェントで使用する共通ガードパターン:

### 共通パターン

macOS専用環境のため、`gtimeout`を使用した応答性チェック:

```bash
# macOS専用: gtimeout を使用
_timeout_cmd=$(command -v gtimeout || echo "")
if [[ -n "$_timeout_cmd" ]] && ! $_timeout_cmd 2 <CLI_NAME> --version >/dev/null 2>&1; then
    echo "WARNING: <CLI_NAME> CLI not responding" >&2
    exit 1
elif [[ -z "$_timeout_cmd" ]] && ! <CLI_NAME> --version >/dev/null 2>&1; then
    echo "WARNING: <CLI_NAME> CLI not responding" >&2
    exit 1
fi
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

# CLI応答性確認（macOS専用: gtimeout）
_timeout_cmd=$(command -v gtimeout || echo "")
if [[ -n "$_timeout_cmd" ]] && ! $_timeout_cmd 2 codex --version >/dev/null 2>&1; then
    echo "WARNING: Codex CLI not responding" >&2
    exit 1
elif [[ -z "$_timeout_cmd" ]] && ! codex --version >/dev/null 2>&1; then
    echo "WARNING: Codex CLI not responding" >&2
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

# CLI応答性確認（macOS専用: gtimeout）
_timeout_cmd=$(command -v gtimeout || echo "")
if [[ -n "$_timeout_cmd" ]] && ! $_timeout_cmd 2 copilot --version >/dev/null 2>&1; then
    echo "WARNING: Copilot CLI not responding" >&2
    exit 1
elif [[ -z "$_timeout_cmd" ]] && ! copilot --version >/dev/null 2>&1; then
    echo "WARNING: Copilot CLI not responding" >&2
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
