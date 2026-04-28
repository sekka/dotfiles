---
name: user-dev-preflight
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

## Phase 2.5: Dead Code Check (opt-in)

Run only when the project explicitly opts in by having a `knip.json`, `knip.jsonc`, `.knip.json`, or a `knip` section in `package.json`. Skip otherwise — knip produces many false positives on codebases with external entry points (CLI scripts, hooks, harness-invoked files).

- Command: `knip --reporter compact --no-exit-code`
- Report findings as WARNING (never block, never auto-delete)
- Deletion is always a manual decision after human review

If no knip config is detected, record as SKIP.

## Phase 2.6: Text Lint (opt-in)

Run only when a textlint config is present: `.textlintrc`, `.textlintrc.json`, `.textlintrc.yaml`, or a `textlint` key in `package.json`.

- Command: `textlint --format compact $(git diff --cached --name-only | grep '\.md$')`
- If no staged markdown files, run on all `.md` files: `textlint --format compact "**/*.md"`
- Report findings as WARNING (never block)
- Fixing prose style is always a manual decision

If no textlint config is detected, record as SKIP.

## Phase 2.7: Dependency Updates Check (opt-in)

Run only when `package.json` exists in the project root.

- Command: `ncu --format group --errorLevel 0`
- Report available updates as INFO (never block, never auto-update)
- Major version bumps are listed separately in `--format group` output

If no `package.json` is found, record as SKIP.

## Phase 3: Type Check

Run the type checker if one exists.

| Language | Command |
|------|---------|
| TypeScript | `tsc --noEmit` |
| Python | `pyright` or `mypy` |

If a TypeScript project is detected (`tsconfig.json` exists) and `type-coverage` is installed, run an additional coverage check after tsc:

- Command: `type-coverage --detail --ignore-catch`
- Report the coverage percentage as INFO (e.g., "type coverage: 94.2%")
- Do not block on any coverage level — report only

If none is found, record as SKIP.

## Phase 4: Change Review (lightweight)

Read `git diff --cached` (staged) or `git diff` (unstaged) and check the following.

### Check Points (grep-based)

- **Debug code remaining**: `console.log`, `debugger`, `print(`, `TODO`, `FIXME`
- **Unintended changes**: Check the file list for unrelated files

Record any problems as WARNING with a count. Delegate detailed review to `/user-dev-review`.

## Phase 5: Security Scan

### 5a: Secret Detection

Use Grep to check that staged files do not contain the following.

```bash
git diff --cached
```

Patterns to check:

- Staging of `.env` files
- Keywords such as `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD` (in assignment form)
- Private key files (`-----BEGIN`, `.pem`, `.key`)

Report detections as WARNING (do not block). If any detections are found, set Status to `DONE_WITH_CONCERNS` in Phase 7.

### 5b: Semgrep Scan (opt-in)

Run only when `semgrep` is installed. Use `--config=auto` (requires internet + may need `semgrep login` on first use).

- Build the changed files list: `git diff --cached --name-only`
- Command: `semgrep --config=auto --quiet --error <changed files>`
- If semgrep exits non-zero for any reason (not installed, auth required, network unavailable), record as SKIP

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
| textlint | PASS / WARNING(n items) / SKIP |
| Dead code (knip) | PASS / WARNING(n items) / SKIP |
| Dependency updates (ncu) | N updates available / UP TO DATE / SKIP |
| Type check | PASS / FAIL / SKIP |
| Type coverage | N% / SKIP |
| Change review | OK / WARNING(n items) |
| Security scan | OK / WARNING(n items) / SKIP |

### Commit Message Candidates
- `feat: ...`
- `fix: ...`

## Status: DONE
```

If there is even one FAIL, set Status to `DONE_WITH_CONCERNS`.
