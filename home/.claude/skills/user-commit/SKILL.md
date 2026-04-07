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

## Step 2: Analyze Logical Units and Decide How to Split

Classify changes into logical units. Use the following criteria to decide whether to split or combine:

**Criteria for combining into one commit:**
- Changes with the same purpose or motivation (example: implementing feature A + its tests)
- Changes that have no meaning without each other (example: rename + update references)
- Changes with dependencies (example: add utility + implementation that uses it)

**Criteria for separating into different commits:**
- Changes with independent purposes (example: bug fix + unrelated refactor)
- Changes with different scopes (example: main code change + config file cleanup)
- Changes where you want to preserve rollback granularity

**Cases where one commit is enough:**
- Do not force a split when all changes are tightly coupled for the same purpose

## Step 3: Execute Commits

When splitting, commit in dependency order:
1. Foundation (libraries, config, type definitions)
2. Implementation
3. Tests
4. Documentation

Run `git add <specific-files>` → `git commit` for each commit.

## Commit Message Rules

- Prefix: `feat`, `fix`, `refactor`, `perf`, `style`, `docs`, `test`, `build`, `chore`, `config`, `ui`, `a11y`, `security`, `hotfix`, `revert`
- Write in present tense ("add" not "added")
- First line is 72 characters or less. Clearly state what and why was changed
- Add details in the body if needed (separated by a blank line)

### Good Examples

```
feat: add user profile edit feature

Users can now upload a profile image and update basic info.
Validation and error handling are implemented.
```

```
refactor: migrate auth middleware to class-based

For better testability and DI support. Replaces the existing function-based implementation.
```

### Examples to Avoid

```
❌ chore: fix various things
❌ fix: bug fix
❌ update: update code
```
