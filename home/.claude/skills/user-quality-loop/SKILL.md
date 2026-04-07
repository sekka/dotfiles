---
name: user-quality-loop
description: Run format, lint, and typecheck in an automatic loop. Triggered by "quality loop", "run lint", "format and check", or "format code".
allowed-tools: Bash, Read, Edit, Glob
---

# Quality Loop

Automatically runs format → lint → typecheck. If a step fails, it fixes the issue and reruns.

## Iron Law

1. Do not change existing logic with auto-fixes

## Flow

```
Detect commands → Run → All pass? → Yes → Report done
                           ↓ No
                      Auto-fix → Rerun (max 3 times)
                           ↓ Same error 2 times in a row
                      Stop → Report problems
```

## Phase 1: Detect Commands

Find available quality check commands from the project root.

### Detection Order
1. `mise.toml` — Look for lint/format/check tasks in the `[tasks]` section
2. `package.json` — Look for lint/format/typecheck scripts
3. `Makefile` — Look for lint/format/check targets
4. Direct commands — dprint, oxlint, eslint, prettier, shfmt, shellcheck, tsc, pyright

### Common Patterns
| Project | Command |
|-------------|---------|
| This dotfiles repository | `bun scripts/development/lint-format.ts` |
| Node.js project | `npm run lint && npm run format` |
| mise-managed project | `mise run lint`, `mise run format` |

## Phase 2: Run

Run in this order (only what exists):

1. **Formatter** (dprint, prettier, shfmt, etc.) — Run in auto-fix mode
2. **Linter** (oxlint, eslint, shellcheck, etc.) — Run with `--fix` option
3. **Type Checker** (tsc, pyright, etc.) — Check only

Record the result of each step (pass/fail, error count).

## Phase 3: Retry Loop

### Loop Conditions
- Rerun up to **3 times** (to prevent infinite loops)
- Stop immediately if the **same error appears 2 times in a row** (auto-fix not possible)

### What to do in each loop
1. Analyze the error content
2. Auto-fixable → Fix with the Edit tool → Rerun Phase 2
3. Cannot auto-fix → Stop the loop, report as unresolved in Phase 4
4. Repeat until all pass or the limit is reached

### What to auto-fix
- Fix import order
- Remove unused variables
- Apply formatting (rerun formatter)
- Simple type errors (only obvious fixes)

### What NOT to auto-fix
- Errors that require logic changes
- Type errors that require design decisions
- Security-related warnings

## Phase 4: Report

```markdown
## Quality Check Results

- **Runs:** N times (initial + M retries)
- **Formatter:** PASS / FAIL (details)
- **Linter:** PASS / FAIL (N remaining)
- **Type Check:** PASS / FAIL / SKIP

### Auto-fixed Items
- [file:line] what was fixed

### Unresolved Issues (manual action needed)
- [file:line] error description
```
