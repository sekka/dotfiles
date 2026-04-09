# Semantic Code Analysis with sem

sem provides entity-level code intelligence (functions, classes, methods) instead of line-level diffs. Use it automatically in the following situations.

## When to Use

| Situation | Tool | Why |
|-----------|------|-----|
| Reviewing a diff or PR | `mcp__sem__sem_diff` | Entity-level changes, catches renames/moves |
| Understanding blast radius | `mcp__sem__sem_impact` | Cross-file dependencies and affected tests |
| Building LLM context for a function | `mcp__sem__sem_context` | Token-budgeted context with dependencies |
| Checking who changed an entity | `mcp__sem__sem_blame` | Entity-level blame |
| Tracing entity evolution | `mcp__sem__sem_log` | Function/class change history |
| Listing entities in a file | `mcp__sem__sem_entities` | Quick structural overview |

## Automatic Usage Rules

1. **Code review skill or PR review**: When using the code-review skill, difit-review skill, or reviewing a PR, run `sem_diff` first for entity-level view. Use alongside line-level diffs.
2. **Impact check on request**: Run `sem_impact` when the user asks about blast radius or downstream effects of a change.
3. **Context gathering**: When analyzing a specific function and its dependencies, prefer `sem_context` over manually reading multiple files.

## Do NOT Use When

- Trivial changes (README typos, comment-only edits)
- Files sem cannot parse (binary, images)
- User explicitly asks for line-level diffs only

## Relationship with Existing Tools

- **delta / diffnav**: Complementary. delta for line-level rendering, sem for entity-level analysis.
- **difit-review**: Run `sem_diff` first to understand entity-level changes, then pass findings as difit comments.
- **Do NOT run `sem setup`**: It sets `diff.external` globally which breaks delta/diffnav.
