---
name: user-ship
description: >
  Run preflight checks, commit, and lightweight review in one pipeline.
  Auto-creates a branch when on master/main/develop.
  Triggered by "ship", "シップ".
allowed-tools: Bash, Read, Grep, Glob, Edit
---

# Ship

Run preflight → commit → review as a single pipeline.

## Iron Law

1. If Phase 1 has any FAIL, stop immediately — never proceed to commit
2. Do not falsify or omit any Phase results
3. Do not auto-fix issues found in Phase 3 (already committed — fix in a separate commit)

## Flow

```
Phase 0: Branch check
    ↓
Phase 1: Preflight (gate)
    ↓ FAIL → stop
Phase 2: Commit
    ↓
Phase 3: Review (lightweight)
    ↓
Phase 4: Summary
```

---

## Phase 0: Branch Check

```bash
git branch --show-current
```

If the current branch is `master`, `main`, or `develop`:

1. Run `git diff HEAD --name-only` to list changed files
2. Infer a branch name following `rules/git-conventions.md`
3. Ask the user: "Create branch `{name}`?"
   - Yes → `git checkout -b {name}` and continue
   - No → continue on the current branch

For any other branch, continue as-is.

---

## Phase 1: Preflight (Gate)

Run the same checks as the `/preflight` skill.

### 1-1. Detect changes

```bash
git status
git diff --cached --name-only
git diff --name-only
```

No changes → report "no changes" and exit with DONE.

### 1-2. Lint/format check

Detect and run the project's lint command:
1. `package.json` scripts (lint, format:check, etc.)
2. `mise.toml` `[tasks]` section
3. Direct commands (dprint, oxlint, eslint, shfmt, shellcheck)

Not found → SKIP.

### 1-3. Type check

TypeScript: `tsc --noEmit`. Python: `pyright` / `mypy`. Not found → SKIP.

### 1-4. Debug code / secrets scan

Grep `git diff` output for:
- Debug code: `console.log`, `debugger`, `TODO`, `FIXME`
- Secrets: `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD` (assignment form), `-----BEGIN`

Debug/secrets findings are WARNING (do not stop).

### 1-5. Gate decision

| Result | Action |
|--------|--------|
| 1+ FAIL | Stop immediately. Do not proceed to Phase 2 |
| WARNING only | Show warnings, proceed to Phase 2 |
| All PASS/SKIP | Proceed to Phase 2 |

---

## Phase 2: Commit

Run the same logic as the `/commit` skill.

1. `git log --oneline -5` to check existing commit style
2. Analyze changes by logical unit and decide whether to split
3. If splitting, commit in dependency order (foundation → implementation → tests → docs)
4. Generate commit messages matching existing style

Follow `rules/git-conventions.md` for commit message format and prefixes.

---

## Phase 3: Review (Lightweight)

Run a lightweight version of the `/review-and-improve` skill.

Target only the committed diff:

```bash
git diff HEAD~{n}  # n = number of commits from Phase 2
```

Check for critical issues only:
- **Security**: injection, hardcoded secrets, missing auth
- **Correctness**: logic errors, unhandled errors, type mismatches

Skip maintainability and style checks. Report issues only — do not auto-fix.

---

## Phase 4: Summary

```markdown
## Ship Results

| Phase | Detail | Result |
|-------|--------|--------|
| 0: Branch | branch name | created / kept |
| 1: Preflight | lint / types / scan | PASS / WARN / FAIL |
| 2: Commit | commit count | N commits |
| 3: Review | security / correctness | OK / needs attention |

### Commits
- `{hash}` {message}

### Phase 3 Findings
(If none: "Review OK")
```

---

## Edge Cases

| Situation | Action |
|-----------|--------|
| No changes | Detected in Phase 1, exit with DONE |
| Preflight FAIL | Stop. Re-run `/ship` after fixing |
| Nothing to stage (all SKIP) | Report "nothing to stage" |
| Critical issue in review | Report only; recommend fixing in a separate commit |
| Branch name collision | Suggest alternative name and re-confirm |

---

## Status

- `DONE` — all Phases completed without issues
- `DONE_WITH_CONCERNS` — Phase 1 had WARNINGs, or Phase 3 found issues
- `BLOCKED` — Phase 1 had FAIL; stopped before commit
