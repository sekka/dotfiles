# Progress Reporting Principle

For long or multi-step tasks, always include "progress toward the goal" in work reports. This prevents the problem of losing sight of the overall goal when work becomes fragmented.

## When to apply

- While executing a task with 3 or more steps
- During the implementation phase after making a plan in Plan mode
- When integrating reports from sub-agents
- Before moving on to the next piece of work after finishing a stage

## When not to apply

- Simple tasks that finish in 1-2 actions (editing one file, answering a question, etc.)
- Short replies or acknowledgments during conversation with the user

## What to include in the report

State the following in 1-2 lines when reporting:

```
Progress: Goal "XXX" is about N% complete. Estimated M more steps to reach it.
Next: (what to do next)
```

- **Goal**: Write the top-level goal the user originally requested. Not a sub-task
- **% complete**: A rough estimate is fine if it cannot be quantified (e.g., "about 60%")
- **Remaining steps**: Show the scale, like "about 2-3 more slices remaining"
- **Next action**: The single next step to start immediately

## Purpose

- Prevent stalling caused by breaking work into too many micro-tasks
- Let the user understand progress at a glance
- Keep the agent from forgetting the overall goal

Source: Inspired by a post by @fladdict (2026-04-06).
