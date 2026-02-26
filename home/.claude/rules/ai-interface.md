# AI Interface Specification

## 認証確認

各エージェントは `~/.claude/lib/check-ai-auth.sh` を呼び出す:

```bash
if ! "$HOME/.claude/lib/check-ai-auth.sh" <ai-name>; then exit 1; fi
```

## 各AIの検証フロー

| AI | 環境変数 | 認証確認 | CLI存在確認 | 応答性確認 |
|----|----------|---------|------------|----------|
| codex | `AI_HAS_CODEX` | `~/.codex/auth.json` | `command -v codex` | `gtimeout 2 codex --version` (fallback: no timeout) |
| gemini | `AI_HAS_GEMINI` | `GEMINI_API_KEY` or `~/.gemini/.env` | - | - |
| copilot | `AI_HAS_COPILOT` | `gh auth status` | `command -v copilot` | `gtimeout 2 copilot --version` (fallback: no timeout) |
| coderabbit | `AI_HAS_CODERABBIT` | `~/.coderabbit/config.json` or `auth.token` | `command -v coderabbit` | - |
