---
name: user-pm-report
description: Generate a project status report from pmo.yaml and decisions.md. Outputs CSV (always) and Notion page (if notion_page_id is set in pmo.yaml). Triggered by "レポート生成", "report", "週次報告", "status report".
argument-hint: [slug] [period]
effort: medium
---

# PM Report — Status Report Generation

Aggregate project data from pmo.yaml and decisions.md and produce a structured status report.

## Iron Law

1. Read pmo.yaml and decisions.md before generating — never fabricate progress data
2. CSV is always saved — Notion output is best-effort (skip gracefully if notion_page_id not set or empty)
3. Do not overwrite an existing report file — always use date-stamped filenames

## Trigger

Use when: Weekly or milestone status report is needed.

Arguments:
- `slug`: project slug (auto-detect if exactly one project exists in ~/prj/)
- `period`: reporting period in days (default: 7 — last 7 calendar days from today)

## Process

1. Resolve slug:
   - If exactly one `~/prj/*/pmo.yaml` exists: use that project automatically (announce it)
   - If multiple: list slugs and ask "どのプロジェクトのレポートですか？"
   - If none: respond with `## Status: NEEDS_CONTEXT` — "~/prj/ にプロジェクトが見つかりません。"

2. Read `~/prj/{slug}/pmo.yaml`
   - If missing: `## Status: NEEDS_CONTEXT` — "pmo.yaml が見つかりません。"

3. If `~/prj/{slug}/decisions.md` exists, read it; otherwise skip decisions sections

4. Determine reporting period:
   - period_end = today
   - period_start = today - {period} days (default 7)

5. Calculate progress from pmo.yaml:
   - total_tasks = count of all items in tasks list
   - done_count = count of items where status = "done"
   - progress_pct = round(done_count / total_tasks * 100) if total_tasks > 0, else 0
   - phase = project.phase from pmo.yaml
   - days_remaining = project.deadline - today (negative = overdue)

6. Extract from decisions.md (within reporting period only):
   - Completed action items: rows where Due date ≤ period_end (use as proxy for completed)
   - Open action items: rows where Due date > today or Due = "TBD"
   - Unresolved questions: all [U{n}] lines
   - Active risks from pmo.yaml risks list + new risks from decisions.md

7. Generate report (see Report Format below) and display in chat

8. Save CSV to `~/prj/{slug}/report-{YYYY-MM-DD}.csv` where YYYY-MM-DD = today
   - If file already exists (re-run same day), append `-2`, `-3` suffix until filename is free

9. Notion output:
   - Read `project.notion_page_id` from pmo.yaml
   - If set and non-empty string: output report content to Notion page via MCP
     - On any failure: print "⚠️ Notion への出力に失敗しました。CSVは保存済みです。" and continue
   - If empty string or field absent: skip silently (no warning)

10. Report: "レポートを ~/prj/{slug}/report-{YYYY-MM-DD}.csv に保存しました。[Notion: 成功/スキップ/失敗]"

## Report Format (displayed in chat)

```markdown
# Status Report: {Project Name}

Period: {period_start} – {period_end} | Generated: {YYYY-MM-DD}
Phase: {phase} | Progress: {progress_pct}% | Days remaining: {days_remaining}

---

## Progress Summary

| Metric | Value |
| ------ | ----- |
| Total tasks | {n} |
| Completed | {done_count} ({progress_pct}%) |
| In progress | {in_progress_count} |
| Pending | {pending_count} |

## Completed This Period

{List all pmo.yaml tasks with status=done (no date filter — all completed tasks are shown cumulatively), plus decisions.md action items where Due date ≤ period_end. Write "なし" if none}

## Issues & Blockers

| Issue | Owner | Status |
| ----- | ----- | ------ |
| {unresolved item} | {owner or TBD} | Open |

(Write "なし" if no issues)

## Next Period Actions

| Action | Owner | Due |
| ------ | ----- | --- |
| {open action item} | {owner} | {date or TBD} |

(Source: decisions.md open action items only — do not list pmo.yaml in_progress tasks here. Write "なし" if no open action items)

## Risk Status

| ID | Risk | Severity | Mitigation |
| -- | ---- | -------- | ---------- |
| K-001 | ... | high | ... |

(Write "リスクなし" if risks list is empty)
```

## CSV Format

Save as `~/prj/{slug}/report-{YYYY-MM-DD}.csv`:

```
section,item,owner,due,status
Progress,Total tasks,—,—,{n}
Progress,Completed,—,—,{done_count}
Progress,In progress,—,—,{in_progress_count}
Progress,Pending,—,—,{pending_count}
Completed,{task or action name},—,—,done
Issue,{unresolved item text},{owner or TBD},—,open
Next Action,{action text},{owner},{due or TBD},pending
Risk,{risk description},—,—,{severity}
```

Use UTF-8 encoding. Escape commas in values with double-quotes.

## Status

- `## Status: DONE` — report displayed in chat, CSV saved
- `## Status: DONE_WITH_CONCERNS` — CSV saved, but Notion output failed (list the error)
- `## Status: NEEDS_CONTEXT` — slug not found, pmo.yaml missing, or ambiguous project (specify what is missing)
- `## Status: BLOCKED` — cannot read required files (add reason)
