# Bash Tool Implicit Backgrounding

The Bash tool sometimes backgrounds long-running commands automatically — even when `run_in_background: true` was NOT set. The signal is the return string `Command running in background with ID: <id>`. Treat that string as the authoritative bg marker, not the absence of `run_in_background` in the call.

## When to apply

- Any Bash invocation where the return contains `Command running in background with ID:`
- Especially for: `git commit` in repos with pre-commit hooks, `nix build`, `darwin-rebuild`, `bun lint-format.ts --staged`, large test suites, agent dispatches

## When NOT needed

- Bash invocations that returned synchronous stdout (no "background" line)
- Short commands (< 1s) that obviously completed before the response

## Process

When the Bash response contains `Command running in background with ID: <id>`:

1. **Do NOT treat it as completed.** The captured stdout file (e.g. `/private/tmp/.../<id>.output`) may be empty or contain only shell init noise (zoxide warning, cd output). Empty ≠ failed.
2. **Wait for the actual completion signal.** Two valid options:
   - Wait for the bg completion notification from the harness (automatic; do not poll for it)
   - `sleep <expected-hook-duration> && cat <output-path>` synchronously, with `<expected-hook-duration>` based on the underlying hook/command cost (see baselines below)
3. **Never retry the same command before confirming the previous bg is dead.** Check `ps -p <pid>` or grep `ps -ef` for the still-running shell. Spawning a second bg while the first holds locks or has staged files causes `git add` competition, stage clearance, and 10x time blow-up.
4. **HEAD-unchanged ≠ commit-failed.** Before declaring a commit failed:
   - `git reflog` — your bg commit may have already landed
   - `ps -ef | grep -E 'git|bun|lint'` — the hook may still be running
   - Only then conclude failure

## Baselines for `git commit` in this repo

The `dotfiles` pre-commit hook runs `bun lint-format.ts --staged --verbose` (oxlint + dprint + shfmt + shellcheck on staged files). Expected wall time:

| Staged file count | Expected hook time |
|---|---|
| 1-5 files, markdown only | 10-30s |
| 10-30 files, markdown only | 30-90s |
| Includes TS/shell files | 60-180s |

Default `timeout: 600000` for any commit in this repo. For other repos with pre-commit hooks, read `.git/hooks/pre-commit` once before the first commit to estimate cost.

## Why

2026-05-15 dotfiles commit incident — a 27-file skill annotation commit took 30+ minutes instead of ~60 seconds. Root cause: Bash returned `Command running in background with ID: ...` for `git commit`, the bg was misread as foreground, HEAD-unchanged after 5s was misread as failure, retry was issued before the original bg finished, spawned bg shells competed for the staging lock and for the pre-commit hook, output files showed only zoxide noise (which was misread as "no output = failed"). Reading `.git/hooks/pre-commit` and `ps -ef` once at the first anomaly would have collapsed 30 min to 60 seconds.

## Anti-pattern

- "Bash returned, so the command finished." Check the return string for the bg marker.
- "Output is empty, so it failed." Empty output = still running OR captured only init noise.
- "HEAD didn't change, so the commit failed." Check `reflog` and `ps` first.
- Retrying a commit every 5-15s when the underlying hook needs 30-90s. Each retry adds load and stage churn, never shortens the wait.
