# Skill Completion Status Protocol

Add a unified status at the end of all skill (slash command) outputs.

## Status definitions

| Status | Meaning |
|---|---|
| `DONE` | Completed normally. No concerns |
| `DONE_WITH_CONCERNS` | Completed, but there are points to note |
| `BLOCKED` | A problem occurred that prevents continuation |
| `NEEDS_CONTEXT` | Not enough information to make a decision |

## Output format

Add the following at the end of skill output:

```
## Status: DONE
```

For anything other than `DONE`, add the reason:

```
## Status: DONE_WITH_CONCERNS
- Concern 1
- Concern 2
```

```
## Status: BLOCKED
{Reason why continuation is not possible}
```

```
## Status: NEEDS_CONTEXT
{Information or confirmation needed}
```

## Scope

Apply to all skill files under `~/.claude/skills/`.
