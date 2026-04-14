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

1. Do not stage files that contain sensitive information
2. Do not commit changes that have not been reviewed

## Step 1: Review Changes

1. Check changed files with `git status`
2. Check all change details with `git diff HEAD`
3. Check recent commit style with `git log --oneline -10`
4. **Exclusion check**:
   - Exclude debug logs, temporary code, and commented-out code
   - Exclude sensitive information (API keys, passwords, etc.)
   - Exclude files covered by `.gitignore`

## Step 2: Commit

Follow `rules/git-conventions.md` for splitting, message format, and prefixes.

Run `git add <specific-files>` → `git commit` for each commit.
