# FAILURES.md — Failure Buffer

Personal-local buffer for Claude Code failures. Accumulates raw failure entries until a pattern reaches the 3-strike threshold defined in `escalation-ladder.md`, at which point it gets promoted to a rule / skill / hook / memory.

## Location

`~/.claude/FAILURES.md` (NOT in the dotfiles repo — machine-local, never committed).

## When to append

- The user explicitly says "またやった" / "また間違えた" / "失敗した" / "the same mistake"
- A rule violation occurs and the user provides correction
- A session-summary detects a "Repeated pattern" or "Approach switch" Contribution candidate
- Any time the agent itself notices it just repeated a prior error

## When NOT to append

- One-off bug fixes (the fix lives in code, no pattern to abstract)
- Successful operations (this is a failure log, not an activity log)
- User-side environment issues (network, auth) not under agent control

## Entry format

Each entry is a top-level `##` block. Append at the bottom. Never reorder.

Normalize the `pattern` field to "verb + object" form:
- ❌ "sed を使ってしまった" → ✅ "use sed instead of Edit tool"
- ❌ "git add -A した" → ✅ "use git add -A instead of explicit paths"
- ❌ "console.log 残した" → ✅ "leave console.log in production code"

~~~markdown

## YYYY-MM-DD HH:MM — <branch-or-repo> / category:<category>

- pattern: <one-line description of what went wrong, normalized to "verb + object">
- category: <rule-violation | skill-gap | knowledge-miss | dangerous-operation | style-tooling>
- fix_applied: <what was done immediately to recover>
- promote_target: <OPEN | rules/foo.md | skills/bar | memory/baz.md | hooks/qux>
- status: <OPEN | PROMOTED | TIL>
- related: <optional: links to prior similar entries by date>

~~~

## Category → promote target mapping

| Category              | Typical promote target                        |
| --------------------- | --------------------------------------------- |
| `rule-violation`      | `home/.claude/rules/*.md`                     |
| `skill-gap`           | `home/.claude/skills/*/SKILL.md`              |
| `knowledge-miss`      | `~/.claude/projects/*/memory/feedback_*.md`   |
| `dangerous-operation` | `home/.claude/hooks/` (new hook) or deny list |
| `style-tooling`       | hook, dprint config, oxlint rule              |

## Promotion criteria

See `escalation-ladder.md` for the authoritative 3-strike rule and level definitions.

Single occurrence with high impact (security, data loss, auth) → immediate promotion (skip 3-count, follow escalation-ladder.md "Immediate L3+" rule).

## Status field lifecycle

- `OPEN` — new entry, not yet promoted
- `PROMOTED` — promoted to a durable artifact; add link in `promote_target`
- `TIL` — one-off, decided not to promote (record-only)

## Relationship with other systems

- **escalation-ladder.md** — defines WHEN to escalate (3-strike, level definitions)
- **FAILURES.md** — provides WHAT to escalate (concrete entries with counts)
- **memory/feedback_*.md** — stores one-off learnings that bypass FAILURES.md entirely; `knowledge-miss` entries here are candidates to promote to memory/rule only after 3 repetitions via the normal buffer flow
- **session-summary.md** — Contribution candidates section flags entries for FAILURES.md

## Why personal-local, not dotfiles-managed?

dotfiles is a public GitHub repo. Failure logs may contain repo names, paths, and context the user does not want public. Keeping FAILURES.md outside the repo keeps the failure log private while the rules (this file) remain shareable.

## Maintenance

- When the file exceeds **200 lines**, move all `PROMOTED` and `TIL` entries to `~/.claude/FAILURES.archive.md` to keep the active buffer lean.
- Any `OPEN` entry that is **90+ days old** without a matching repeat should be downgraded to `TIL` — it did not become a pattern.
