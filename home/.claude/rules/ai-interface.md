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

各エージェントは `~/.claude/lib/check-ai-auth.sh` を呼び出す:

```bash
if ! "$HOME/.claude/lib/check-ai-auth.sh" <ai-name>; then
    exit 1
fi
```

実装詳細: `home/.claude/lib/check-ai-auth.sh` を参照。

### 各AIの検証フロー

| AI | 環境変数 | 認証確認 | CLI存在確認 | 応答性確認 |
|----|----------|---------|------------|----------|
| codex | `AI_HAS_CODEX` | `~/.codex/auth.json` | `command -v codex` | `gtimeout 2 codex --version` (fallback: no timeout) |
| gemini | `AI_HAS_GEMINI` | `GEMINI_API_KEY` or `~/.gemini/.env` | - | - |
| copilot | `AI_HAS_COPILOT` | `gh auth status` | `command -v copilot` | `gtimeout 2 copilot --version` (fallback: no timeout) |
| coderabbit | `AI_HAS_CODERABBIT` | `~/.coderabbit/config.json` or `auth.token` | `command -v coderabbit` | - |
