---
name: user-pm-session
description: >
  Start a PM work session. Scans all active projects in ~/prj/*/pmo.yaml,
  identifies the focus project, reads its documents, and proactively flags
  items that need attention (overdue tasks, unresolved risks, stale fields,
  missing stakeholder reports). Suggests the next action for each issue with
  a specific skill to invoke.
  Triggered by "PM始める", "今週のPM", "pm-session", "案件確認", "セッション開始", or "session start".
argument-hint: [project-slug]
effort: medium
---

# PM Session

Start a focused PM work session: scan projects, diagnose the selected project's documents, and surface what needs attention — before you have to ask.

## Iron Law

1. Never propose actions without reading the actual files first — always read before diagnosing
2. Always show "Good" items too — explicitly confirming what is healthy is as important as flagging problems
3. Every flagged item must come with a concrete next action, not just "please check"
4. Never force updates — if the user says "later", move to the next item without repeating

## Trigger

Use when: Starting a PM work session, weekly review, or checking project health.

Arguments:
- `project-slug`: optional. If provided, skip the project selection step and go directly to Step 3.

## Process

### Step 1 — Scan all projects

Glob `~/prj/*/pmo.yaml` and read each file. If no files found, output:
```
No projects found. Create a pmo.yaml in ~/prj/{name}/ to start tracking.
```

Identify projects that need attention (flag criteria for project list ordering only — detailed classification happens in Step 4):
- Deadline within 14 days → 🔴
- Any open action item in decisions.md overdue → 🔴
- Any risk with mitigation = "TBD" → 🟡
- Phase has not changed in 30+ days → 🟡

### Step 2 — Select focus project

If `project-slug` argument was provided, skip this step.

Present the project list ordered by urgency (🔴 first):

```
Active projects ({today's date}):
🔴 {project-name} — {reason}
🟡 {project-name} — {reason}
✅ {project-name}

Which project do you want to focus on?
```

Ask with AskUserQuestion if more than one project exists.

### Step 3 — Read project documents

Read all available files for the selected project in parallel:
- `~/prj/{slug}/pmo.yaml` (required)
- `~/prj/{slug}/discovery.md` (if exists)
- `~/prj/{slug}/decisions.md` (if exists)
- Most recent `~/prj/{slug}/report-*.csv` (if any — use glob to find latest by filename)

### Step 4 — Diagnose

Evaluate the following criteria and classify each as 🔴 Action required / 🟡 Review recommended / ✅ Good:

| Criterion | 🔴 Condition | 🟡 Condition |
| --------- | ------------ | ------------ |
| Deadline proximity | ≤ 7 days | 8–14 days |
| Overdue tasks | Any pmo.yaml task with deadline < today and status ≠ done | — |
| Open Questions | decisions.md has open items (questions OR action items) past their deferred-until / due date | items with no deferred-until date; or if decisions.md does not exist, treat as 🟡 and suggest creating it via /user-pm-meeting |
| Risk mitigation | Any risk mitigation = "TBD" | Any risk with no mitigation note |
| Team & Health | No report in last 14 days | Last report 8–14 days ago |
| Phase staleness | phase unchanged + no done tasks in 14 days | phase unchanged 8–14 days; if no phase-change date is recorded in pmo.yaml, treat as 🟡 |
| Approver set | **approver field missing or empty** | — |
| Stakeholder comms | No report file in 21+ days, OR no report file has ever been created | No report in 14–21 days |

**Default rule**: Any criterion not matching a 🔴 or 🟡 condition above is ✅ Good. For example, Stakeholder comms with a report filed within 13 days = ✅ (no flag needed).

### Step 5 — Present diagnosis

Output the session report (see Output Format below).

For each 🔴 item, follow with:
`→ Suggested action: {concrete next step} — use /{skill-name} to proceed`

Available skill suggestions:
- Risk or decision update → `/user-pm-meeting`
- Weekly report → `/user-pm-report`
- WBS adjustment → `/user-pmo-wbs`
- Phase / task update → edit pmo.yaml directly
- Discovery update → `/user-pm-discover`
- Role or judgment call → `/user-pm-judge`

**Consolidation rule**: If both Team & Health and Stakeholder comms trigger 🔴 simultaneously (both caused by the same absent report), merge them into a single Stakeholder comms entry. Do not list Team & Health separately when Stakeholder comms already covers the same fact.

**Named contact rule**: When the suggested action involves reporting to a stakeholder and `approver` is set in pmo.yaml, name them explicitly in the suggestion (e.g., "→ {approver}への報告が必要 — /user-pm-report" instead of generic "report to stakeholder").

After presenting the diagnosis, output a single "Top priority" line:
```
🎯 今日の最優先: {the single most urgent 🔴 item in one line} → {concrete action} — /{skill-name}
```
If the action is "edit pmo.yaml directly" (no skill), omit the `— /{skill-name}` part.
If no 🔴 items exist, output: `🎯 今日の最優先: なし — 全項目良好`

**Top priority selection order** (when multiple 🔴 items exist, pick the first that applies):
1. Deadline proximity ≤ 7 days
2. Overdue tasks (past deadline)
3. Risk mitigation = TBD with severity = high
4. Other criteria in table order (Open Questions → Team & Health → Phase staleness → Approver → Stakeholder comms)

Ask the user: "Which item would you like to address first?"
Accept "later" or "skip" to move on without pressure.

### Step 6 — Session summary

After the user signals completion ("done", "end", "以上", "おわり"), output:

```
Session complete — {YYYY-MM-DD}
Addressed: {N} items
Deferred: {N} items
Next session: /user-pm-session
```

## Output Format

```
## PM Session — {YYYY-MM-DD}

### {Project Name} (Phase: {phase} | Deadline: {deadline} | {N} days remaining)

🔴 Action Required ({N})
- {criterion}: {specific finding}
  → {concrete next action} — /{skill-name}

🟡 Review Recommended ({N})
- {criterion}: {specific finding}

✅ Good ({N})
- {criterion}

🎯 今日の最優先: {most urgent 🔴 item in one line} → {concrete action} — /{skill-name}
```
(Omit `— /{skill-name}` when the action is "edit pmo.yaml directly".)

## Status

- `## Status: DONE` — session completed and summary output
- `## Status: DONE_WITH_CONCERNS` — session completed but some items were deferred without resolution
- `## Status: NEEDS_CONTEXT` — no project slug provided and multiple projects exist with equal urgency
- `## Status: BLOCKED` — no pmo.yaml files found in ~/prj/
