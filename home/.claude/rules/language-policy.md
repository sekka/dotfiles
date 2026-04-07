# Language Policy

Write everything in English by default. This includes:
- Rules (`rules/*.md`)
- Skills (`skills/*/SKILL.md`)
- Agent definitions (`agents/*.md`)
- Memory files (`memory/*.md`)
- CLAUDE.md
- Code comments
- Hook output messages (reason strings, error messages)

Exceptions — use Japanese for:
- Direct conversation with the user (chat responses, AskUserQuestion)
- Commit messages (following existing repository convention)

## Why

English keeps harness files consistent and readable by any LLM regardless of language settings. Japanese in conversation and commits respects the user's preference and existing conventions.
