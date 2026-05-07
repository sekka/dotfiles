# Verify Edits Before Reporting Done

After any `Edit`, `Write`, or `NotebookEdit` call, confirm the change actually landed before claiming the work is complete. Never report "done" / "完了" / "fixed" based on tool success codes alone — verify by reading or grepping the changed location.

## When to apply

- Any single Edit/Write/NotebookEdit
- Any subagent that reports having made file changes (verify the agent's claim, do not trust it blindly)
- Before saying "done", "完了", "fixed", "実装しました" for changes that involve files

## Verification methods (pick one)

- Re-read the changed line range with `Read`
- `grep` for a unique string from the new content
- `git diff -- <file>` to confirm the diff is non-empty and matches intent
- For multiple file changes: `git status` + spot-check one or two files

## When NOT needed

- Read-only operations (no file modification)
- Bash commands whose effect is observable from stdout
- Tasks where the next tool call immediately consumes the file (the next read serves as verification)

## Why

2026-04-22 incident — a session reported edits to hieizan scripts (db-export.sh, db-import.sh, init-wp-env.sh) as complete. The edits never landed. The user discovered the false report in the next session and was harmed by the trust violation.

This rule exists because tool success codes lie occasionally (silent failures, path mismatches, replace_all=false on non-unique strings, sandbox restrictions). The only honest "done" report is one backed by a post-write read.

## Anti-pattern

Reporting "done" by combining "the Edit tool returned success" + "the change should be there logically". This is the exact pattern that caused the 2026-04-22 incident. The fix is not "be more careful" — it is "always verify".
