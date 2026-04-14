---
name: user-pmo-status
description: Show a multi-project status dashboard. Reads ~/prj/*/pmo.yaml automatically. Flags projects with deadline within 2 weeks. Triggered by "プロジェクト状況", "project status", "案件一覧", or "dashboard". Also use proactively at the start of weekly planning sessions or when the user mentions any project's status without asking for the dashboard.
effort: low
---

# Multi-Project Status Dashboard

Show status of all active projects at a glance.

## Iron Law

1. Read all `~/prj/*/pmo.yaml` files — do not ask the user to specify projects
2. Flag 🔴 for any project with deadline within 14 days
3. Never invent data — if pmo.yaml is missing or malformed, show the project as "⚠️ Data missing"

## Trigger

Use when: Weekly review, or user wants to see all project statuses.

No arguments required.

## Process

1. Glob `~/prj/*/pmo.yaml` — read all files found
2. If no files found, output: "No projects found. Create a pmo.yaml in ~/prj/{name}/ to start tracking."
3. For each project: extract name, phase, deadline, and task list
4. Calculate progress: `done tasks / total tasks × 100` (round to nearest 10%)
5. Calculate days remaining from today to deadline
6. Sort by deadline (soonest first)
7. Flag 🔴 if days remaining ≤ 14
8. Output dashboard table

## Progress Calculation

```
If total tasks = 0: show progress as "—"
done_count = tasks where status = "done"
total_count = total tasks
progress = round(done_count / total_count * 100, -1)  # nearest 10%
```

## Alert Logic

| Days remaining | Alert label |
|---|---|
| ≤ 14 | 🔴 {N} days |
| 15–30 | {N} days remaining |
| > 30 | comfortable |
| Already past | 🔴 OVERDUE |

## Output Format

```
Project Status — {today's date}

Project              Phase          Progress  Deadline   Alert
─────────────────────────────────────────────────────────────
{name padded}        {phase}        {N}%      {MM/DD}    {alert}
...
```

If a pmo.yaml is malformed or unreadable:

```
⚠️ {slug} — pmo.yaml unreadable
```

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — dashboard output complete
- `## Status: DONE_WITH_CONCERNS` — some files were unreadable (list them)
- `## Status: NEEDS_CONTEXT` — required argument or context is missing (add what is needed)
- `## Status: BLOCKED` — cannot read any project files (add reason)
