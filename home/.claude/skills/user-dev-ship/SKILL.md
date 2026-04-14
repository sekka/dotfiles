---
name: user-dev-ship
description: >
  Run preflight checks, commit, and lightweight review, then optionally deliver (push/PR/merge).
  Auto-creates a branch when on master/main/develop.
  Triggered by "ship", "シップ", "shipして", "harness-ship", "ハーネスシップ".
allowed-tools: Bash, Read, Grep, Glob, Edit
---

# Ship

Run preflight → commit → review as a single pipeline, with optional delivery.

## Modes

| Trigger | Delivery |
|---------|----------|
| `/ship` | Phase 3 の後に選択肢を提示 |
| `/ship push` | push + create PR |
| `/ship merge` | push + PR + squash merge + cleanup |
| `/ship local` | local merge into master + cleanup |

All modes run the same Phase 0-3 (preflight → commit → review).

## Iron Law

1. If Phase 1 has any FAIL, stop immediately — never proceed to commit
2. Do not falsify or omit any Phase results
3. Do not auto-fix issues found in Phase 3 (already committed — fix in a separate commit)

## References

- [corrections.md](./corrections.md) — Known pitfalls and past mistakes. Read before running the pipeline.

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
    引数なし → ユーザーに選択肢を提示（下記）
    引数あり → 指定された delivery に直行
    ↓
Phase 4: Deliver
    ├─ push  → push + create PR
    ├─ merge → push + PR + squash merge + cleanup
    ├─ local → checkout master + merge --no-ff + cleanup
    └─ done  → delivery せず終了
    ↓
Phase 5: Summary
```

### Delivery prompt (引数なしの場合)

Phase 3 完了後、以下の選択肢を提示する:

```
Phase 0-3 complete. How would you like to deliver?
  1. push  — push + create PR
  2. merge — push + PR + squash merge
  3. local — local merge into master
  4. done  — stop here (no delivery)
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

If branch name already exists, append `-2`, `-3`, etc.

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

## Phase 4: Deliver

If the user chose "done" in the delivery prompt (or explicitly passed no delivery argument), skip to Phase 5.

### Push mode

```bash
git push -u origin {branch-name}
```

On push failure: report error and stop. Local branch and commit remain intact.
On gh CLI auth failure: show `gh auth status` output and stop.

```bash
gh pr create --title "{prefix}: {summary}" --body "$(cat <<'EOF'
## Summary
{1-3 bullet points describing changes}

## Changed files
{List changed files}
EOF
)"
```

### Merge mode

Same push + PR as above, then:

```bash
gh pr merge --squash --delete-branch
git checkout master
git pull origin master
```

### Local mode

Save the current branch name for return, then merge into master.

```bash
original_branch=$(git branch --show-current)  # save for return
git checkout master
git merge --no-ff {branch-name}
git branch -d {branch-name}
```

If not on master before Phase 0, return to the original branch after merge:

```bash
git checkout {original_branch}
```

On merge conflict: abort merge, report conflict, and stop.

---

## Phase 5: Summary

### No delivery (done)

```markdown
## Ship Results

| Phase | Detail | Result |
|-------|--------|--------|
| 0: Branch | branch name | created / kept |
| 1: Preflight | lint / types / scan | PASS / WARN |
| 2: Commit | commit count | N commits |
| 3: Review | security / correctness | OK / needs attention |

### Commits
- `{hash}` {message}

### Phase 3 Findings
(If none: "Review OK")
```

### Push mode

```markdown
## Ship Results

| Phase | Detail | Result |
|-------|--------|--------|
| 0: Branch | branch name | created / kept |
| 1: Preflight | lint / types / scan | PASS / WARN |
| 2: Commit | N commits | done |
| 3: Review | security / correctness | OK / needs attention |
| 4: Deliver | push + PR | PR #{number} |

PR: https://github.com/.../pull/NNN
```

### Merge mode

Same table as push mode, with delivery row showing:
`Branch: {name} → squash merged into master`

### Local mode

Same table, with delivery row showing:
`Branch: {name} → merged into master (local)`

---

## Edge Cases

| Situation | Action |
|-----------|--------|
| No changes | Detected in Phase 1, exit with DONE |
| Preflight FAIL | Stop. Re-run `/ship` after fixing |
| Nothing to stage (all SKIP) | Report "nothing to stage" |
| Critical issue in review | Report only; recommend fixing in a separate commit |
| Branch name collision | Append `-2` suffix and retry |
| Push failure (push/merge) | Report error and stop; branch/commit remain local |
| gh CLI not authenticated | Show `gh auth status` and stop |
| Merge conflict (local) | Abort merge, report conflict, and stop |
| Not on master before Phase 0 | Branch from current branch; return to original branch after local merge |

---

## Status

- `DONE` — all Phases completed without issues
- `DONE_WITH_CONCERNS` — Phase 1 had WARNINGs, or Phase 3 found issues
- `BLOCKED` — Phase 1 had FAIL, push failed, gh not authenticated, or merge conflict
