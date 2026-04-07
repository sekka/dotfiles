# Session Summary

When the user explicitly signals the end of a session (「おわり」 (done), 「終了」 (end), 「また」 (see you), etc.), save a summary using the steps below. Do not save on `/clear` or mid-session interruptions. Skip if there was no meaningful work done.

1. Create the `.claude/sessions/` directory if it does not exist
2. Run `git diff --name-only` to get the list of changed files
3. Review the session conversation and detect the following patterns (for the "Contribution candidates" section):
   - **Repeated pattern**: The same operation was performed 3 or more times → skill candidate
   - **Approach switch**: The initial approach failed and a different method was used → rule candidate
   - **New discovery**: A new tool, command, or technique was used → memory or rule candidate
4. Save to `.claude/sessions/YYYY-MM-DD-HHmm.md` (use the current time)

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

## Contribution candidates
(Omit this entire section if nothing applies)
- [Skill candidate] Automate XYZ (reason: performed N times during session)
- [Rule candidate] Check ABC first when doing DEF (reason: learned from today's failure)
- [Memory candidate] How to use XYZ (reason: likely to use again)
```

Note: The "Contribution candidates" section is a suggestion only — do not act on it. Writing it in the summary is enough to notice it next session.

After saving, report only one line: "Session summary saved."
