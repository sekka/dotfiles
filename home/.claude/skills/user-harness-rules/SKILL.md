---
name: user-harness-rules
description: >
  Keep the harness (CLAUDE.md, rules, skills, memory) fresh and consistent.
  Detect gaps between the codebase and documentation, then propose updates.
  Apply changes only after user approval.
  Use when asked to "update rules", "check CLAUDE.md", "clean up memory",
  "check if docs are stale", "maintain rule files", or "review settings".
effort: medium
---

# Rules Maintainer

Compare the harness against the actual implementation. Detect outdated content and propose fixes.
Apply fixes only after user approval.

## Iron Law

1. Do not change rule files without user approval — rules shape AI behavior globally; silent edits can introduce unintended behavior that is hard to trace

## Flow

```
Phases 1-3 are independent and can run in parallel

Phase 1: Check rule files (CLAUDE.md, rules)
Phase 2: Check skill descriptions (skills/*/SKILL.md)
Phase 3: Clean up memory (memory/)
    ↓
Phase 4: Escalation proposal (evaluate repeated violations for level upgrade)
    ↓
Structured report output → User approval → Apply fixes
```

## Phase 1: Check Rule Files

Targets: `.claude/CLAUDE.md`, `home/.claude/CLAUDE.md`, `home/.claude/rules/*.md`
Skip files that do not exist.

### Check Points

1. **Directory structure** — Use Glob to verify that paths inside code blocks actually exist
2. **Commands** — Check that file paths in bash blocks exist (do not run them)
3. **Toolchain** — Use `which` to confirm that listed tools are installed
4. **References** — Check that references to harness-related paths (`.claude/`, `home/.claude/`, `docs/`) are valid. Exclude references inside code examples and comments.
5. **Conflicts** — Check for contradictions on the same topic between global and project-specific CLAUDE.md

## Phase 2: Check Skill Descriptions

Targets: Extract and analyze frontmatter from `home/.claude/skills/*/SKILL.md`.
Read the full file only for skills that need a description gap check.

### Check Points

1. **Gap between description and content** — Do the trigger conditions and features in the description match the workflow?
2. **Invalid references** — Are allowed-tools and file paths valid?
3. **Duplicate skills** — Report only pairs that have completely overlapping functionality

## Phase 3: Clean Up Memory

Target: `~/.claude/projects/-Users-kei-dotfiles/memory/`
If the directory is empty, report "memory not used" and skip.

### Check Points

1. **Outdated** — Do file paths and setting names in memory still exist in the current codebase?
2. **Duplicates** — Items that record the same information in different wording
3. **MEMORY.md consistency** — 1:1 match between the index and actual files
4. **Classification validity** — Does the type (user/feedback/project/reference) match the content?

## Report Output

```markdown
## Phase N: [Phase Name] Results

| # | Type | Target File | Problem | Suggestion |
|---|------|-----------|------|------|
| 1 | Outdated | .claude/CLAUDE.md:45 | `scripts/foo.sh` does not exist | Delete the line |

No issues: ✅ [check item name]
```

Phases with zero problems are reported in one line: "✅ All items OK".

## Applying Fixes

1. Show a diff of "current text" vs "proposed text"
2. Confirm whether to apply all at once or select individually (AskUserQuestion)
3. Apply only approved fixes

**Do not apply fixes without user approval.**

## Phase 4: Escalation Proposal

When repeated violation patterns are detected in Phases 1-3, propose escalation based on the escalation ladder (`.claude/rules/escalation-ladder.md`).

### Check Points

1. **Feedback records in memory** — Has the same violation been recorded multiple times?
2. **Current level assessment** — Is the violation at L1 (documentation) / L2 (AI verification) / L3 (tool verification) / L4 (structural block)?
3. **Escalation proposal** — If 3+ repetitions are found, include a level upgrade recommendation in the report

## Out of Scope

- Code quality review (→ `/user-dev-review`)
- Proposing new rules (this skill only checks existing consistency)
- Validating Nix / Brewfile content (only checks that tools exist)
- Creating new memory entries (only cleanup)

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — all phases complete, report delivered, approved fixes applied
- `## Status: DONE_WITH_CONCERNS` — report delivered, fixes proposed but awaiting user approval (list each proposed fix)
- `## Status: BLOCKED` — cannot read rule files or skill directory (list the unreadable paths)
- `## Status: NEEDS_CONTEXT` — scope not specified; clarify which harness components to check (rules / skills / memory / all)
