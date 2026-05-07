# Keep Plan Files Current

When a project has a plan, roadmap, or status document (e.g., `docs/MVP_PLAN.md`, `ROADMAP.md`, `TODO.md` with checkboxes or status fields), keep it in sync with reality. The plan must reflect the current state of the codebase, not the state at the time it was authored.

## When to apply

- The repository contains a plan/roadmap/status doc with checkboxes (`- [ ]` / `- [x]`), status tables, or completion markers
- You completed work that maps to a planned item
- You discovered work the plan doesn't capture (a new task, a removed task, a partial completion)
- You started a session by reading a plan file — verify it before trusting it

## Process

1. **When you finish work that maps to a plan item**, update the checkbox / status in the same commit (or the next one). Do not let "code merged but plan stale" become a normal state.
2. **When the plan and reality diverge**, prefer updating the plan to match reality, not the other way around. The plan is a description, not a prescription.
3. **When a plan item is partially done**, do not check it. Either keep it `[ ]` with an inline note ("UI done, gesture handler未実装"), or split the item into sub-tasks.
4. **When a plan was written long ago**, treat its checkboxes as untrustworthy until verified against `git log` and the actual code. State the discrepancy to the user before acting on plan-derived assumptions.
5. **For completed work that the plan doesn't anticipate**, add a new line under the relevant section rather than silently dropping it.

## What "current" means

- Checkboxes match implementation state (not authorial intent)
- A "Last updated YYYY-MM-DD" or status summary at the top is preferred for any plan over ~50 lines
- Items completed by deviation from the original design are still marked done, with a brief note explaining the deviation (e.g., "ProcessPipelineUseCase 相当を ViewModel 内に実装")

## When NOT needed

- Throwaway plans inside conversations or one-off task descriptions
- Plans the user has explicitly marked as historical / archived (e.g., moved to `docs/archive/`)
- README-style docs that describe architecture rather than progress

## Why

A stale plan misleads everyone who reads it: human reviewers, AI agents joining mid-stream, future-you. The natural assumption when reading `[ ] DIContainer 実装` is that DIContainer is unimplemented. If it actually exists in the code, every reader pays the cost of re-deriving truth.

The 2026-05-06 incident in `nelu/docs/00_MVP_PLAN.md` had 2 items checked out of 41 despite Week 1-12 being substantively complete. The user had to ask the agent to assess actual progress, because the plan file was useless as a source of truth. This rule exists so that doesn't repeat.

## Anti-pattern

- Treating the plan as a write-once artifact ("we made the plan, now we execute")
- Updating the plan only when the user explicitly asks
- Marking a partially-done item as `[x]` because "the spirit of it is done"
- Letting the plan drift while making heroic effort to keep `git log` clean — git log alone is a poor status doc, plans exist precisely because git log is too granular

## Status field for output

When updating a plan file, include the section heading or table you changed in your end-of-turn summary so the user can verify at a glance.
