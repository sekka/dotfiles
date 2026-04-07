---
name: user-commit
description: Analyze changes by logical unit and commit them in appropriate groups. Triggered by "commit this" or "commit".
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git log:*), Bash(git reset:*)
model: haiku
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
