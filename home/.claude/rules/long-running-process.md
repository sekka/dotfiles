# Long-Running Process Monitoring

When dispatching async operations (codex:rescue, large builds, agent runs, reviews), do not passively wait. Monitor elapsed time against an expected baseline and act when the duration becomes abnormal.

## When to apply

- Any background task (`run_in_background: true`, Monitor, Agent dispatch)
- Async review tools (codex:rescue, coderabbit, ultrareview)
- Large builds (`nix build`, `darwin-rebuild`, container builds)
- Long agent runs (subagents that may take 10+ minutes)

## Process

1. **Set an expected baseline before launch.** Estimate duration based on input size (lines of diff, scope of build, complexity of task). State it briefly: "expecting ~Nm".
2. **Compare actual elapsed time to baseline while waiting.** A 2-3x overrun, or any absolute threshold of 15+ min for a task expected to be quick, is abnormal.
3. **When abnormal duration is detected:**
   - Stop and report to the user immediately
   - Read partial logs / process state to investigate
   - Decide: kill and restart with a different approach, or wait further with explicit justification
4. **Never silently wait through an abnormal duration.**

## Examples

- 11-line nix overlay change → codex:rescue expected ~5 min. If still running at 15 min: anomaly. Report.
- Multi-file refactor → codex:rescue expected 20-30 min. 38 min is normal range; 90 min is anomaly.
- `nix build` of cached system → expected <1 min. 5 min idle: investigate.

## Anti-pattern

Following a user instruction ("use codex to review") does NOT authorize unbounded passive waiting. The instruction means: execute the tool AND notice when its execution becomes abnormal. Idle waiting through a clear duration mismatch is a failure even when the tool itself was correctly chosen.
