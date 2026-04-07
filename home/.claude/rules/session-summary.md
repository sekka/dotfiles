# Session Summary

When the user explicitly signals the end of a session (「おわり」 (done), 「終了」 (end), 「また」 (see you), etc.), save a summary using the steps below. Do not save on `/clear` or mid-session interruptions. Skip if there was no meaningful work done.

1. Create the `.claude/sessions/` directory if it does not exist
2. Run `git diff --name-only` to get the list of changed files
3. Save to `.claude/sessions/YYYY-MM-DD-HHmm.md` (use the current time)

```
# Session Summary - YYYY-MM-DD HH:mm

## What was done
(Summary of the task, 2-5 lines)

## Changed files
(Output of git diff --name-only. Write "none" if empty)

## Decisions
(Design and policy decisions made. Write "none" if empty)

## Unresolved items
(Remaining tasks, things to handle in the next session. Write "none" if empty)
```

After saving, report only one line: "Session summary saved."
