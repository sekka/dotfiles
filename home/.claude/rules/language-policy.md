# Language Policy

Write all harness files in English. This includes:
- Rules (`rules/*.md`)
- Skills (`skills/*/SKILL.md`)
- Agent definitions (`agents/*.md`)
- Memory files (`memory/*.md`)
- CLAUDE.md

Also write in English:
- Commit messages
- Code comments
- Hook output messages (reason strings, error messages)

Use Japanese only for direct conversation with the user (chat responses, AskUserQuestion).

## Why

English keeps harness files consistent and readable by any LLM regardless of language settings. Japanese in conversation respects the user's preference.
