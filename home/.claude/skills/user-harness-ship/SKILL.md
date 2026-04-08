---
name: user-harness-ship
description: >
  Ship harness changes (.claude/ skills, rules, memory, CLAUDE.md, etc.)
  through branch creation → commit → merge/PR → return to master, all in one command.
  Supports `local` argument for local merge without push/PR.
  Triggered by "harness-ship", "ハーネスシップ", "harness PR", "harness をshipして", "harness-ship local".
allowed-tools: Bash
---

# Harness Ship

Ship harness changes through branch → commit → merge in a single command.

## Modes

| Mode | Trigger | Flow |
|------|---------|------|
| **Remote** | `/harness-ship remote` | branch → commit → push → PR → squash merge |
| **Local** | `/harness-ship local` | branch → commit → local merge → delete branch |
| **No argument** | `/harness-ship` | Ask the user: "Local merge or PR?" before proceeding |

## Iron Law

1. Never commit non-harness files
2. Never stage application code without explicit user confirmation

## Flow

```
Phase 1: Detect changes
    ↓ no harness changes → exit with "no changes"
Phase 2: Create branch (config/YYYY-MM-DD-{summary})
    ↓
Phase 3: Stage + commit (config: prefix)
    ↓
    ├─ Remote mode ─→ Phase 4a: Push + create PR
    │                     ↓
    │                 Phase 5a: Squash merge + delete branch + return to master
    │
    └─ Local mode ──→ Phase 4b: Checkout master + merge + delete branch
    ↓
Phase 6: Report
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

Naming: `config/YYYY-MM-DD-{kebab-case-summary}`

Auto-generate summary:
- Skills only → `add-{skill-name}` (multiple: `add-skills`)
- Rules only → `update-{rule-name}`
- Mixed categories → `update-skills-and-rules` / `update-harness`
- CLAUDE.md only → `update-claude-md`

If branch name already exists, append `-2`, `-3`, etc. When not on master, branch from the current branch (do not force master base).

```bash
git checkout -b config/YYYY-MM-DD-{summary}
```

## Phase 3: Stage + Commit

Stage only harness files detected in Phase 1 using individual `git add` commands.

Commit message format: `config: {description}` (fixed prefix)

Example: `config: user-harness-ship スキルを追加`

## Phase 4a: Push + Create PR (Remote mode)

```bash
git push -u origin {branch-name}
```

On push failure: report error and stop. Local branch and commit remain intact.
On gh CLI auth failure: show `gh auth status` output and stop.

```bash
gh pr create --title "config: {same as commit message}" --body "$(cat <<'EOF'
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

## Phase 5a: Merge + Cleanup (Remote mode)

```bash
gh pr merge --squash --delete-branch
git checkout master
git pull origin master
```

## Phase 4b: Local Merge (Local mode)

Save the current branch name for return, then merge into master.

```bash
original_branch=$(git branch --show-current)  # save for return
git checkout master
git merge --no-ff {branch-name}
git branch -d {branch-name}
```

If not on master before Phase 2, return to the original branch after merge:

```bash
git checkout {original_branch}
```

On merge conflict: abort merge, report conflict, and stop.

## Phase 6: Report

### Remote mode

```
PR: https://github.com/.../pull/NNN
Branch: config/YYYY-MM-DD-{summary} → squash merged into master

Changed files:
  [skills]  home/.claude/skills/user-harness-ship/SKILL.md
  [rules]   home/.claude/rules/bar.md
```

### Local mode

```
Branch: config/YYYY-MM-DD-{summary} → merged into master (local)

Changed files:
  [skills]  home/.claude/skills/user-harness-ship/SKILL.md
  [rules]   home/.claude/rules/bar.md
```

## Edge Cases

| Situation | Action |
|-----------|--------|
| No argument | Ask "Local merge or PR?" before proceeding |
| No harness changes | Exit with "no harness changes" |
| Harness + app code mixed | Confirm, then harness only or abort |
| Push failure (remote) | Report error and stop; branch/commit remain local |
| gh CLI not authenticated (remote) | Show `gh auth status` and stop |
| Merge conflict (local) | Abort merge, report conflict, and stop |
| Branch name collision | Append `-2` suffix and retry |
| Not on master | Branch from current branch; return to original branch after merge |

## Status

```
## Status: DONE
```

On error:

```
## Status: BLOCKED
{reason: push failure / gh not authenticated / etc.}
```
