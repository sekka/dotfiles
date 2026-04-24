---
name: user-harness-dual-agent
description: >
  Orchestrate a codex + claude-code dual-agent workflow where codex implements and claude reviews.
  Use this skill whenever the user says "tornado", "use tornado", "dual-agent", "two-agent workflow",
  "use two Claudes", "orchestrator and executor", or wants to delegate a heavy implementation task to
  a second agent. Also use when the user wants to run codex for implementation while keeping claude
  for oversight and review. Trigger proactively when the task is large enough to benefit from parallel
  agent execution.
effort: high
---

# Tornado Skill

Orchestrate codex + claude-code: codex implements, claude reviews.

## Invocation

```bash
mise run tornado              # select plan file with fzf
mise run tornado ./plan.md    # specify directly
```

`--dev=codex --review=claude` is fixed on the mise task side. The only argument is the plan file path.

## Step 1: Verify mise task exists

```bash
mise tasks | grep tornado
```

If `tornado` is not listed, the mise task is not configured. Run `codex:setup` or check `mise.toml` in the project root. Do not proceed further until the task is confirmed.

## Step 2: Check or create plan.md

If plan.md does not exist, create it. Minimum structure:

```markdown
# Task: {task name}

## Goal
{goal in one sentence}

## Steps
1. {step 1}
2. {step 2}

## Success criteria
- {completion condition}
```

## Step 3: Launch tornado

```bash
mise run tornado ./plan.md
```

The TUI may not work inside the Claude Code built-in terminal.
In that case, run it as a separate terminal with `! mise run tornado ./plan.md`.

## Step 4: After completion

After the TUI exits, suggest checking the changed files with `/user-dev-review`.

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — plan.md ready, tornado launched and TUI exited cleanly, and post-run review was suggested
- `## Status: DONE_WITH_CONCERNS` — tornado completed but the post-run review found issues (list each)
- `## Status: BLOCKED` — tornado TUI failed to start, or plan.md is missing and could not be created
- `## Status: NEEDS_CONTEXT` — no plan file path provided and no current task context to generate one from
