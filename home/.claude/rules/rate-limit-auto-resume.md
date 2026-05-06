# Rate Limit Auto-Resume

When hitting Anthropic API rate limits during long autonomous work, monitor for reset and resume automatically. Do not idle waiting for a user re-prompt.

## When to apply

- Auto Mode is active
- The user has explicitly delegated autonomous work ("任せる", "all yours", "一気に進めて", "go", etc.)
- The current task has clear continuation points (multi-step plan, ongoing migration, batch processing)

## When NOT to apply

- The user explicitly paused or said stop
- A non-rate-limit error caused the halt (real bug, not throttle)
- The next step requires user input that hasn't been given
- The token cost of resumption clearly outweighs the user value

## Process

1. **Identify the limit type from the error.** Common shapes:
   - **Per-minute / per-hour / 5-hour rolling window** → reset is bounded, auto-resume is appropriate
   - **Monthly org limit** → cannot auto-resume; reset is days-to-weeks away. Report to user immediately, suggest plan upgrade or admin action
2. **For bounded resets**, use `ScheduleWakeup` (max 3600s) targeting just after the reset time. Pass the same continuation prompt so the next firing picks up the work.
3. **On resume**, give a one-line status report ("Resuming Phase 8 step 3"), then continue. No apology, no recap.
4. **Continue until task complete.** Re-resume on subsequent rate limits within the same delegated task. Stop only on explicit user interrupt.

## Why

2026-04-27 koyasan-hataraku Phase 8 — user said "ちゃんと表示と動作確認を都度行う前提で一気に進めてください 高野山は任せます", an explicit autonomous delegation. Rate limit hit mid-task. Without auto-resume, the user has no progress visibility and must manually re-prompt every reset cycle, which destroys the value of the autonomous delegation.

## Anti-pattern

- Waiting passively for the user to say "再開して"
- Apologizing or summarizing the prior context on resume (wastes tokens, the work is already known)
- Asking "should I continue?" when the user has already said "任せる"
