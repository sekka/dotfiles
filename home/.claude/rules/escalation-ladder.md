# Escalation Ladder

Guidelines for responding to rule violations in graduated steps.
When the same violation repeats, escalate it one level up.

## Level Definitions

| Level | Method | When | Example |
|-------|--------|------|---------|
| L1 | Documentation | First violation | Record the pattern in CLAUDE.md / rules/ |
| L2 | AI verification | Same violation 3rd time | Add to review skill checklist |
| L3 | Tool verification | Bypasses AI verification | Add lint rule or hook |
| L4 | Structural block | Business-critical | deny list, validate-command pattern |

## Operating Rules

- **3-strike rule**: Escalate to the next level after the same violation pattern occurs 3 times
- **Immediate L3+**: Security-related violations start at L3 or above from the first occurrence
- **No downgrade**: Once escalated, the level is never lowered (to prevent recurrence)

## Detection Mechanism

The 3-strike trigger is **mechanically detected** via `FAILURES.md`. See `failures-md.md` for the buffer format.

- Append failure entries to `~/.claude/FAILURES.md` as they occur
- When the same `pattern` field appears 3+ times, propose escalation to the next level
- `user-harness-rules` skill Phase 4 reads this buffer to surface promotion candidates

Without FAILURES.md, 3-strike detection relies on memory and is unreliable. Always append to the buffer first; promote second.

## Escalation Criteria

1. Can the violation pattern be clearly defined? (L3+ requires pattern matching)
2. Cost of automated detection vs. impact of the violation
3. Impact of additional hooks on response latency

## Examples

| Violation | Current Level | Escalate To |
|-----------|--------------|-------------|
| Using sed/awk | L4 (denied by validate-command) | — |
| git add -A | L4 (denied by validate-command) | — |
| Leftover console.log | L1 (documented in CLAUDE.md) | L3 (lint rule) if repeated |
| Reading/writing sensitive files | L4 (protect-sensitive.sh + deny list) | — |
