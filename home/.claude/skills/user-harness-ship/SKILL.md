---
name: user-harness-ship
description: >
  Ship harness changes (.claude/ skills, rules, memory, CLAUDE.md, etc.)
  through branch creation → commit → push → PR → squash merge → return to master, all in one command.
  Triggered by "harness-ship", "ハーネスシップ", "harness PR", "harness をshipして".
allowed-tools: Bash
---

# Harness Ship

Ship harness changes through branch → PR → squash merge in a single command.

## Iron Law

1. Never commit non-harness files
2. Never stage application code without explicit user confirmation

## Flow

```
Phase 1: Detect changes
    ↓ no harness changes → exit with "no changes"
Phase 2: Create branch (harness/YYYY-MM-DD-{summary})
    ↓
Phase 3: Stage + commit (harness: prefix)
    ↓
Phase 4: Push + create PR
    ↓
Phase 5: Squash merge + delete branch + return to master
    ↓
Phase 6: Report (PR URL + file list)
```

## Phase 1: Detect Changes

```bash
git diff --name-only
git diff --cached --name-only
git status --porcelain | awk '{print $2}'
```

**Harness target paths:**
- `home/.claude/` (skills, rules, agents, hooks, CLAUDE.md, RTK.md)
- `.claude/CLAUDE.md` (project root)

| State | Action |
|-------|--------|
| No harness changes | Exit immediately with "no harness changes" |
| Harness only | Proceed to Phase 2 |
| Harness + app code mixed | Ask "Stage harness changes only?" → Yes: harness only / No: abort |

## Phase 2: Create Branch

Naming: `harness/YYYY-MM-DD-{kebab-case-summary}`

Auto-generate summary:
- Skills only → `add-{skill-name}` (multiple: `add-skills`)
- Rules only → `update-{rule-name}`
- Mixed categories → `update-skills-and-rules` / `update-harness`
- CLAUDE.md only → `update-claude-md`

If branch name already exists, append `-2`, `-3`, etc. When not on master, branch from the current branch (do not force master base).

```bash
git checkout -b harness/YYYY-MM-DD-{summary}
```

## Phase 3: Stage + Commit

Stage only harness files detected in Phase 1 using individual `git add` commands.

Commit message format: `harness: {description}` (fixed prefix)

Example: `harness: add user-harness-ship skill`

## Phase 4: Push + Create PR

```bash
git push -u origin {branch-name}
```

On push failure: report error and stop. Local branch and commit remain intact.
On gh CLI auth failure: show `gh auth status` output and stop.

```bash
gh pr create --title "harness: {same as commit message}" --body "$(cat <<'EOF'
## Summary

### Skills
- `home/.claude/skills/foo/SKILL.md` — added: ...

### Rules
- `home/.claude/rules/bar.md` — updated: ...

## Changed files
{List files by category: skills / rules / agents / memory / config}
EOF
)"
```

## Phase 5: Merge + Cleanup

```bash
gh pr merge --squash --delete-branch
git checkout master
git pull origin master
```

## Phase 6: Report

```
PR: https://github.com/.../pull/NNN
Branch: harness/YYYY-MM-DD-{summary} → squash merged into master

Changed files:
  [skills]  home/.claude/skills/user-harness-ship/SKILL.md
  [rules]   home/.claude/rules/bar.md
```

## Edge Cases

| Situation | Action |
|-----------|--------|
| No harness changes | Exit with "no harness changes" |
| Harness + app code mixed | Confirm, then harness only or abort |
| Push failure | Report error and stop; branch/commit remain local |
| gh CLI not authenticated | Show `gh auth status` and stop |
| Branch name collision | Append `-2` suffix and retry |
| Not on master | Branch from current branch (no master enforcement) |

## Status

```
## Status: DONE
```

On error:

```
## Status: BLOCKED
{reason: push failure / gh not authenticated / etc.}
```
