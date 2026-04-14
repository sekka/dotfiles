---
name: user-dev-prototype
description: >
  Use when you want to build an initial prototype fast.
  Orchestrates Opus 4.6 (1M context) + feature-dev agents + auto-approve mode + worktree isolation for maximum velocity.
  Triggered by "rapid prototype", "プロトタイプ", "prototype fast", "quick prototype".
effort: high
disable-model-invocation: false
---

# Rapid Prototype

Speed over polish. Build a working skeleton end-to-end, then iterate.

## Overview

Initial prototypes are about validating ideas, not production quality. The biggest enemy of prototyping speed is getting stuck — on unfamiliar code, on decisions, on confirmation dialogs.

This skill combines three things to eliminate friction: Opus 4.6's 1M context window (holds the entire codebase in mind at once), feature-dev specialist agents (code-architect, code-explorer, code-reviewer), and auto-approve mode (no confirmation pauses). Together, they let you go from idea to running prototype without stalling.

Always isolate prototype work in a git worktree so main stays clean. If the approach turns out to be wrong, discard the branch and start fresh — that's cheaper than prototyping on main.

## Iron Law

1. Prototype quality only. No production polish unless explicitly requested.
2. Always isolate in a worktree — never prototype directly on main/master.
3. Speed > perfection. Ship a working skeleton first.

## Pre-flight Checklist

Before starting, verify:

- [ ] Model set to Opus: run `/model claude-opus-4-6` in Claude Code
- [ ] Auto-approve enabled: Settings → Permissions → Auto-approve all, or launch with `--dangerously-skip-permissions` for local dev
- [ ] Scope defined: one-liner describing what to build

## Execution Flow

### Step 1: Define Scope

Answer these before touching code:

- What to build? (1 feature / full page / full app)
- Tech stack constraints?
- Key user journey to demonstrate?
- Time budget?

Keep the scope tight. A prototype that does one thing end-to-end is better than a broad prototype that does nothing completely.

### Step 2: Configure for Speed

```
1. /model claude-opus-4-6    ← 1M context, best reasoning
2. Enable auto-approve        ← eliminate confirmation friction
```

Auto-approve removes the biggest source of friction in agentic workflows. Enable it for the duration of the prototype session, then disable afterward.

### Step 3: Create Worktree

Create an isolated branch with the worktree tool:

- Branch name: `proto/{feature-name}`
- This keeps main branch clean and allows easy discard if the approach fails

```bash
# Example
git worktree add ../proto-{feature-name} -b proto/{feature-name}
```

Work inside the worktree for all remaining steps.

### Step 4: Architecture Blueprint

Launch `feature-dev:code-architect` agent with:

- The scope definition from Step 1
- Existing codebase context (key files, patterns)
- Request: "Generate a component blueprint and file structure for rapid implementation"

The blueprint should name every file to create and what each component does. This is the input for Step 5.

If the codebase is unfamiliar, run `feature-dev:code-explorer` first to map existing patterns before asking for the blueprint.

### Step 5: Parallel Implementation

Based on the blueprint, split into independent components and launch parallel `implementer` agents:

```
Component A → implementer agent 1
Component B → implementer agent 2
Component C → implementer agent 3
```

Each implementer receives:
- Component spec from the blueprint
- Relevant existing files (patterns to copy from)
- Instruction: "prototype quality, speed > polish"

Independent components can run in parallel. Components with dependencies must run sequentially (foundation → consumers).

### Step 6: Integrate and Browser-Test

After all implementers finish:

1. Merge component outputs (resolve any conflicts)
2. Start the dev server
3. Browser-test the golden path (the key user journey from Step 1)
4. Note broken things — only fix **blockers** (things that prevent demonstrating the core journey)
5. Skip cosmetic issues, edge cases, and non-golden-path flows

### Step 7: Decide Next Step

| Outcome | Action |
|---------|--------|
| Core journey works | Exit worktree → merge to main → `/ship` to clean up |
| Needs more iteration | Go back to Step 5 with narrowed scope |
| Wrong direction | Discard worktree, re-plan from Step 1 |

```bash
# Merge when done
git worktree remove ../proto-{feature-name}
git merge proto/{feature-name}

# Discard if wrong direction
git worktree remove --force ../proto-{feature-name}
git branch -D proto/{feature-name}
```

---

## Feature-Dev Agents

| Agent | Use for |
|-------|---------|
| `feature-dev:code-architect` | Implementation design, blueprint generation, file structure |
| `feature-dev:code-explorer` | Exploring existing code patterns, finding relevant files |
| `feature-dev:code-reviewer` | Quick sanity-check before merging to main |

Launch via the Agent tool. Give each agent a tight scope.

---

## Speed Tips

- Give each implementer agent a tight scope (1 component, not the whole feature)
- Use `feature-dev:code-explorer` first if the codebase is unfamiliar
- Prefer copy-paste from existing components over building from scratch
- Skip tests, skip error handling for edge cases — this is a prototype
- Use hardcoded data and mocks freely
- Stub network calls with `setTimeout` + fake data rather than wiring real APIs
- If a component is blocking progress, stub it and move on

## When to Stop

A prototype is done when it demonstrates the core user journey end-to-end, even if imperfect. Resist the urge to polish.

Signs you are done:
- A stakeholder can click through the key flow
- The idea is validated (or invalidated)
- You have enough signal to write a real spec

Signs you are polishing too much:
- Fixing things that are not in the golden path
- Adding loading states and error handling
- Worrying about performance or bundle size

## Related Skills

- `/user-fe-develop` — for production-quality frontend work after the prototype is validated
- `/ship` — when the prototype is ready to clean up and merge

---

## Status

- `DONE` — prototype runs end-to-end through the core user journey
- `DONE_WITH_CONCERNS` — prototype works but scope drift occurred, or key flows are stubbed
- `BLOCKED` — could not implement the core journey (dependency missing, environment issue, etc.)
- `NEEDS_CONTEXT` — scope is too ambiguous to start; re-run Step 1 with the user
