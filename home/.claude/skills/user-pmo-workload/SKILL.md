---
name: user-pmo-workload
description: Show member workload for the current week across all projects. Reads ~/prj/*/pmo.yaml and ~/prj/members.yaml. Falls back to 40h default capacity per member if members.yaml is absent. Flags overloaded members (🔴) and suggests reassignment. Triggered by "稼働確認", "workload", "メンバー工数", or "リソース確認". Also use proactively before sprint planning or task assignment discussions.
effort: low
---

# Member Workload Visualizer

Show planned workload per member for the current week across all active projects.

## Iron Law

1. Read `~/prj/*/pmo.yaml` and `~/prj/members.yaml` — never ask the user to specify files
2. Scope is current week only (Monday–Sunday of the week containing today)
3. Only visualize planned allocation — do not estimate actuals, costs, or billing
4. Flag 🔴 if any member exceeds their weekly capacity

## Trigger

Use when: Planning task assignment or checking team capacity.

No arguments required.

## Process

1. Read `~/prj/members.yaml` — get member names and weekly capacities
2. Glob `~/prj/*/pmo.yaml` — read all project task lists
3. For each task: check if the task deadline falls within the current week AND status is not `done`
4. Sum `est_hours` per assignee across all projects for the current week
5. Compare to each member's `weekly_capacity_hours`
6. Output visualization per member
7. For any overloaded member: suggest 1–2 specific tasks to move or reassign

## Members.yaml Fallback

If `~/prj/members.yaml` does not exist:
- Derive member list from all unique `assignee` values in pmo.yaml files
- Set capacity to 40h for all members (default)
- Place the following note block at the very top of the output (before the week header):
  ```
  members.yaml not found — using 40h default capacity for all members.
  ⚠️ {name} — not in members.yaml, using 40h default
  ⚠️ {name} — not in members.yaml, using 40h default
  ...
  ```
  (one ⚠️ line per member, alphabetical order)

## Bar Chart Format

```
[████████░░] 80%
```

- 10 blocks total
- Each filled block = 10% of capacity (round down — 25% = 2 blocks, 85% = 8 blocks)
- Filled = `█`, empty = `░`
- Over 100%: show all 10 blocks filled + percentage over (e.g. `[██████████] 112%`)

## Output Format

Display members in alphabetical order. Overloaded members are not reordered.

```
Member Workload — week of {Monday date} to {Sunday date}

{Member name}
  Assigned: {N}h / Capacity: {C}h  [{bar}] {pct}%
  Breakdown: {project1} {Nh}, {project2} {Nh}

{Member name}  🔴 Overloaded
  Assigned: {N}h / Capacity: {C}h  [{bar}] {pct}%
  Breakdown: {project1} {Nh}, {project2} {Nh}
  → Suggestion: move "{task name}" ({Nh}) from {project} to next week
    or reassign to {under-capacity member} ({Ch} available)
  (Prefer tasks whose deadline is still in the future; avoid suggesting moves for already-overdue tasks)

---
Members with no tasks this week: {comma-separated names or "none"}
```

"Members with no tasks this week" lists every member whose total assigned hours for the week is 0 — even if they appear in the member blocks above. If all members have tasks, write "none".

If no tasks fall in the current week for any member:

```
No tasks scheduled for the week of {Monday date}. Check pmo.yaml deadlines.
```

## Assignee Not in members.yaml

If an assignee appears in pmo.yaml tasks but is not listed in members.yaml (members.yaml exists but the name is missing):
- Include them in the output using the 40h default capacity
- Add "⚠️ {name} — not in members.yaml, using 40h default" at the top of the output, before the week header
- If members.yaml is absent entirely, the note block in the Members.yaml Fallback section above covers this — do not add a separate ⚠️ note per member in addition

For members with zero tasks this week: include them in the output but omit the Breakdown line entirely.

## Week Matching

A task falls in the current week if its `deadline` field falls on any day Monday–Sunday of the current week. Use `deadline` as the scheduled-work proxy. Tasks with no `deadline` are excluded and listed under "Members with no tasks this week" for their assignee if no other tasks are assigned.

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — workload output complete
- `## Status: DONE_WITH_CONCERNS` — some files missing or unreadable (list them)
- `## Status: NEEDS_CONTEXT` — required files not found and cannot proceed (add reason)
- `## Status: BLOCKED` — cannot read project files (add reason)
