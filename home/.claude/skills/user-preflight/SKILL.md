---
name: user-preflight
description: Pre-commit integrated check. Runs lint, type check, change review, secret scan, and draft commit message in one command. Triggered by "preflight" or "pre-commit check".
allowed-tools: Bash, Read, Grep, Glob
effort: low
---

# Preflight

Run all pre-commit checks in one command.

## Iron Law

1. Do not alter or omit check results
2. Do not return DONE when a check has failed

## Flow

```
Detect changes → lint/format → type check → change review → secret scan → commit message draft → result summary
```

## References

- [corrections.md](./corrections.md) — Known pitfalls and past mistakes. Read before running checks.

## Phase 1: Detect Changes

```bash
git status
git diff --cached --name-only  # staged
git diff --name-only           # unstaged
```

If there are no changes, report "no changes" and exit with DONE.

## Phase 2: lint/format Check

Detect and run the project's lint command.

### Detection Order

1. `package.json` scripts — `lint`, `format:check`, etc.
2. `mise.toml` — Look for lint/format tasks in `[tasks]`
3. `Makefile` — lint/format targets
4. Direct commands — dprint, oxlint, eslint, shfmt, shellcheck

If none are found, record as SKIP.

## Phase 3: Type Check

Run the type checker if one exists.

| Language | Command |
|------|---------|
| TypeScript | `tsc --noEmit` |
| Python | `pyright` or `mypy` |

If none is found, record as SKIP.

## Phase 4: Change Review (lightweight)

Read `git diff --cached` (staged) or `git diff` (unstaged) and check the following.

### Check Points (grep-based)

- **Debug code remaining**: `console.log`, `debugger`, `print(`, `TODO`, `FIXME`
- **Unintended changes**: Check the file list for unrelated files

Record any problems as WARNING with a count. Delegate detailed review to `/review-and-improve`.

## Phase 5: Secret Scan

Use Grep to check that staged files do not contain the following.

```bash
git diff --cached
```

### Patterns to Check

- Staging of `.env` files
- Keywords such as `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD` (in assignment form)
- Private key files (`-----BEGIN`, `.pem`, `.key`)

Report detections as WARNING (do not block).

## Phase 6: Commit Message Draft

```bash
git log --oneline -5
```

Look at the existing commit style and propose 1-2 candidates based on the changes.

### Common Prefixes

`feat:`, `fix:`, `config:`, `refactor:`, `docs:`, `chore:`

## Phase 7: Result Summary

```markdown
## Preflight Results

| Check | Result |
|---------|------|
| lint/format | PASS / FAIL / SKIP |
| Type check | PASS / FAIL / SKIP |
| Change review | OK / WARNING(n items) |
| Secret scan | OK / WARNING(n items) |

### Commit Message Candidates
- `feat: ...`
- `fix: ...`

## Status: DONE
```

If there is even one FAIL, set Status to `DONE_WITH_CONCERNS`.
