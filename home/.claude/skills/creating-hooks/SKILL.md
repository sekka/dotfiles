---
name: creating-hooks
description: Claude Codeのイベント駆動型自動化とバリデーション用のhooksを作成します。tool呼び出し、ユーザーメッセージ、コミット前チェックなどのイベントに反応するhooksを実装します。自動化ワークフロー、バリデーション、イベント駆動処理が必要な場合に使用してください。
extends: shared/template-generator
template_type: hook
model: haiku
---

<objective>
Hooks are event-driven automation for Claude Code that execute shell commands or LLM prompts in response to tool usage, session events, and user interactions. Hooks provide programmatic control over Claude's behavior for validation, automation, logging, and workflow customization.
</objective>

## About This Skill

This skill extends **shared/template-generator** which handles common configuration workflows.

**Hook-specific focus**: Event types, hook anatomy, matchers, and examples.

## Hook Configuration

Hooks are configured in `.claude/hooks.json` (project) or `~/.claude/hooks.json` (user):

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command|prompt",
            "command": "...",
            "timeout": 30000
          }
        ]
      }
    ]
  }
}
```

## Hook Events

| Event | When it fires | Can block? |
|-------|---------------|------------|
| **PreToolUse** | Before tool execution | Yes |
| **PostToolUse** | After tool execution | No |
| **UserPromptSubmit** | User submits prompt | Yes |
| **Stop** | Claude attempts to stop | Yes |
| **SessionStart** | Session begins | No |
| **SessionEnd** | Session ends | No |

See [references/hook-types.md](references/hook-types.md) for all events and detailed use cases.

## Hook Types

**Command hooks** - Execute shell commands:
- Use for: Logging, validation, external tools, notifications
- Input: JSON via stdin
- Output: JSON (optional)

```json
{
  "type": "command",
  "command": "/path/to/script.sh",
  "timeout": 30000
}
```

**Prompt hooks** - LLM evaluates a prompt:
- Use for: Complex logic, natural language validation, reasoning
- Input: Prompt with `#$ARGUMENTS` placeholder
- Output: JSON with `decision` and `reason`

```json
{
  "type": "prompt",
  "prompt": "Evaluate: #$ARGUMENTS\n\nReturn: {\"decision\": \"approve|block\", \"reason\": \"...\"}"
}
```

## Matchers

Matchers filter which tools trigger the hook:

```json
{
  "matcher": "Bash",           // Exact match
  "matcher": "Write|Edit",     // Multiple tools (regex)
  "matcher": "mcp__.*",        // All MCP tools
  "matcher": "mcp__memory__.*" // Specific MCP server
}
```

Omit matcher to fire for all tools.

## Common Patterns

**Desktop notification:**
```json
{
  "hooks": {
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude needs input\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

**Block destructive commands:**
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Is this safe? Block if contains: 'git push --force', 'rm -rf'\n\n#$ARGUMENTS\n\nReturn: {\"decision\": \"approve|block\", \"reason\": \"...\"}"
          }
        ]
      }
    ]
  }
}
```

**Auto-format after edits:**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "prettier --write $CLAUDE_PROJECT_DIR",
            "timeout": 10000
          }
        ]
      }
    ]
  }
}
```

**Inject context at session start:**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"hookSpecificOutput\": {\"hookEventName\": \"SessionStart\", \"additionalContext\": \"Current sprint: Sprint 23\"}}'"
          }
        ]
      }
    ]
  }
}
```

## Environment Variables

Available in hook commands:

| Variable | Value |
|----------|-------|
| `$CLAUDE_PROJECT_DIR` | Project root directory |
| `${CLAUDE_PLUGIN_ROOT}` | Plugin directory |
| `#$ARGUMENTS` | Hook input JSON (prompt hooks) |

## Input/Output

**Blocking hooks output**:
```json
{
  "decision": "approve|block",
  "reason": "Why this decision"
}
```

See [references/input-output-schemas.md](references/input-output-schemas.md) for complete schemas.

## Testing & Debugging

Always test with debug flag:
```bash
claude --debug
```

This shows matched hooks, command execution, and output.

Validate JSON configuration:
```bash
jq . .claude/hooks.json
```

See [references/troubleshooting.md](references/troubleshooting.md) for common issues.

## Security Requirements

- **Infinite loops**: Check `stop_hook_active` flag in Stop hooks
- **Timeouts**: Set reasonable timeouts (default: 60s)
- **Permissions**: Ensure hook scripts are executable (`chmod +x`)
- **Paths**: Use absolute paths with `$CLAUDE_PROJECT_DIR`
- **JSON validation**: Validate config with `jq` before use
- **Selective blocking**: Be conservative with blocking to avoid disruption

## Reference Guides

- [hook-types.md](references/hook-types.md) - Events and schemas
- [command-vs-prompt.md](references/command-vs-prompt.md) - Decision tree and examples
- [matchers.md](references/matchers.md) - Tool matching patterns
- [input-output-schemas.md](references/input-output-schemas.md) - Complete schemas
- [examples.md](references/examples.md) - Real-world patterns
- [troubleshooting.md](references/troubleshooting.md) - Debugging guide
