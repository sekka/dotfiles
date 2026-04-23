---
name: user-dev-commit
description: >
  Creates git commits following project conventions: conventional commit format, Japanese commit messages,
  one-commit-per-logical-change rule. Use this skill whenever the user says "commit", "コミット",
  "git commit", "commit this", "save my changes", "check in", "commit and push", or asks you to record
  their work in git. Also use proactively after completing a feature, fix, or refactor when the user
  hasn't explicitly asked to commit yet — offer to commit the changes.
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git log:*), Bash(git reset:*)
model: haiku
effort: low
---

Analyze the changes by logical unit and commit related changes together.

## Iron Law

1. **[critical]** Do not stage files that contain sensitive information (API keys, passwords, tokens, secrets)

## Step 1: Review Changes

1. Check changed files with `git status`
2. Check all change details with `git diff HEAD`
3. Check recent commit style with `git log --oneline -10`
4. **Files to exclude**:
   - Exclude debug logs, temporary code, and commented-out code
   - Exclude sensitive information (API keys, passwords, tokens, secrets)
   - Exclude files covered by `.gitignore`
5. **Untracked files**: Include them if they are clearly part of the same logical change; skip if purpose is unclear.
6. **Sensitive data action**: If a file contains sensitive data (e.g., `sk-proj-...`, `ghp_...`, hardcoded passwords):
   - Do NOT stage that file
   - Stage and commit the remaining safe files (partial commit is correct)
   - Report the excluded file(s) in the Status response using `## Status: DONE_WITH_CONCERNS`

## Step 2: Commit

### Commit Message Format

- **Prefix** (English): choose from `feat` `fix` `refactor` `perf` `style` `docs` `test` `build` `chore` `config` `ui` `a11y` `security` `hotfix` `revert`
- **Body** (Japanese): 1st line ≤ 72 chars, present tense, state what and why
- Add details after a blank line if needed

**How to pick prefix:**
- New capability → `feat`
- Config/settings change → `config`
- Bug fix → `fix`
- Code restructure (no behavior change) → `refactor`
- Docs only → `docs`
- Maintenance / cleanup → `chore`
- Performance improvement → `perf`
- Code formatting / lint → `style`
- Adding or updating tests → `test`
- Build system / CI changes → `build`
- UI-only change → `ui`
- Accessibility → `a11y`
- Security fix → `security`
- Urgent production fix → `hotfix`
- Undoing a previous commit → `revert`

**Good examples:**
```
feat: zsh に git エイリアスを追加
config: sheldon プラグイン設定を追加
fix: エイリアスの typo を修正
```

### Commit Granularity

One commit = one logical change.

**Combine when:** same purpose, meaningless alone, or dependency between changes.
**Split when:** independent purposes, different scopes, or rollback granularity matters.

When splitting: commit in dependency order — foundation → implementation → tests → docs.

### Execution

Run `git add <specific-files>` → `git commit` for each logical unit.

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — all commits created following project conventions
- `## Status: DONE_WITH_CONCERNS` — committed, but some files were excluded (e.g., sensitive data, debug code) — list what was skipped
- `## Status: BLOCKED` — sensitive information detected in staged files; commit aborted until resolved
- `## Status: NEEDS_CONTEXT` — no staged or changed files to commit
