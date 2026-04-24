# PM/PMO Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 4-phase PM/PMO pipeline (Discover → Spec → Execute → Report) as Claude Code skills, covering client-project受託 workflows from first hearing through stakeholder reporting.

**Architecture:** Four new SKILL.md files plus two enhancements to existing skills, all reading/writing project files under `~/prj/{slug}/`. Skills form a dependency chain: pm-discover generates discovery.md which pm-spec consumes; pm-meeting generates decisions.md which pm-report and pm-status consume.

**Tech Stack:** Claude Code skills (SKILL.md markdown), pmo.yaml (YAML project data), Notion MCP (optional output), CSV export for Excel.

**Spec:** `docs/superpowers/specs/2026-04-23-pm-pmo-pipeline-design.md`

---

## File Map

| Action | Path                                            |
| ------ | ----------------------------------------------- |
| Create | `home/.claude/skills/user-pm-discover/SKILL.md` |
| Create | `home/.claude/skills/user-pm-spec/SKILL.md`     |
| Create | `home/.claude/skills/user-pm-meeting/SKILL.md`  |
| Create | `home/.claude/skills/user-pm-report/SKILL.md`   |
| Modify | `home/.claude/skills/user-pmo-wbs/SKILL.md`     |
| Modify | `home/.claude/skills/user-pmo-status/SKILL.md`  |
| Create | `docs/pm-pmo-guide.md`                          |
| Create | `docs/pm-pmo-quickref.md`                       |

Note: `~/prj/` lives outside this repo. Skills write to it at runtime — no repo files involved.

---

## Task 1: user-pm-discover — Hearing → Structured Record

**Files:**

- Create: `home/.claude/skills/user-pm-discover/SKILL.md`

- [ ] **Step 1: Create skill directory and write SKILL.md**

```bash
mkdir -p home/.claude/skills/user-pm-discover
```

Write `home/.claude/skills/user-pm-discover/SKILL.md` with this exact content:

````markdown
---
name: user-pm-discover
description: Run a structured client hearing session and produce discovery.md + initial pmo.yaml. Use when starting a new client project (受託). Triggered by "ヒアリング開始", "discovery", "要件ヒアリング", "hearing start".
argument-hint: [project-name] [client-name] [deadline]
effort: medium
---

# PM Discovery — Hearing → Structured Record

Conduct an AI-guided interview with the PM and generate a structured discovery.md plus an initial pmo.yaml.

## Iron Law

1. Create `~/prj/{slug}/` before writing any files — never write to an undefined path
2. Never skip to output without completing the full interview
3. Never invent requirements — only classify what the PM explicitly states
4. Ask all missing arguments in a single AskUserQuestion, not one at a time

## Trigger

Use when: Starting a new client project and a structured hearing record is needed.

Arguments (ask if missing — ask all at once):

- `project-name`: full project name (e.g. "ABC Corp Corporate Site")
- `client-name`: client company or person name
- `deadline`: final delivery date (YYYY-MM-DD)

## Process

1. Ask for any missing arguments with AskUserQuestion (all missing in one question)
2. Prompt PM: "Project slug (kebab-case, e.g. abc-corp-site, max 30 chars):" — validate format (lowercase + hyphens + alphanumeric only)
3. Create `~/prj/{slug}/` directory
4. Conduct interview — one question at a time, in this order:

   **Q1.** 「このプロジェクトで解決したい課題・目的は何ですか？」
   → Classify answer as Goals

   **Q2.** 「成功とはどういう状態ですか？KPIや数値目標があれば教えてください」
   → Add to Goals (Success Metrics)

   **Q3.** 「スコープ外にしたいこと、このプロジェクトでやらないことはありますか？」
   → Classify as Non-Goals

   **Q4.** 「具体的な機能・コンテンツ要件をリストアップしてください」
   → Classify each item as Requirements (Source: Client, Priority: Must/Should/Could)

   **Q5.** 「予算・スケジュール・技術面での制約はありますか？」
   → Classify as Constraints

   **Q6.** 「最大のリスクや懸念事項は何だと思いますか？」
   → Classify as Risks (Probability + Impact: High/Medium/Low)

   **Q7.** 「その他、クライアントから伝えられた重要なことはありますか？」
   → Classify as Goals / Requirements / Constraints / Risks as appropriate

5. For any ambiguous answer, ask one follow-up before moving to the next question
6. After Q7, present a summary and ask: "追加・修正はありますか？" — apply changes
7. Generate `discovery.md` (see Output Format below)
8. Generate initial `pmo.yaml` (see YAML Format below)
9. Report: "Discovery complete. Files saved to ~/prj/{slug}/. Next: run /user-pm-spec to generate the spec and design doc."

## Output Format — discovery.md

```markdown
# Discovery: {Project Name}

Date: {YYYY-MM-DD} | Client: {client} | PM: {git user name}

## Goals

- [ ] {goal 1}
- [ ] {goal 2}

## Non-Goals

- [ ] {non-goal 1}

## Requirements

| ID  | Requirement | Source | Priority |
| --- | ----------- | ------ | -------- |
| R01 | ...         | Client | Must     |
| R02 | ...         | Client | Should   |

## Constraints

- Budget: {budget or "未定"}
- Deadline: {YYYY-MM-DD}
- Technical: {constraints or "なし"}
- Other: {other or "なし"}

## Risks

| ID  | Risk | Probability | Impact | Mitigation |
| --- | ---- | ----------- | ------ | ---------- |
| K01 | ...  | High        | High   | ...        |

## Open Questions

- [ ] {question} [deferred until {YYYY-MM-DD}]
```
````

All Open Questions must be either resolved during the session or marked `[deferred until YYYY-MM-DD]`.

## YAML Format — pmo.yaml (initial)

```yaml
project:
  name: "{project name}"
  slug: "{slug}"
  client: "{client name}"
  deadline: "{YYYY-MM-DD}"
  phase: "discovery"
  discovery_file: discovery.md
  spec_file: ""
  design_doc_file: ""
  decisions_file: ""
  notion_page_id: ""

tasks: []
risks: []
```

## Status

- `## Status: DONE` — discovery.md and pmo.yaml generated, no unresolved open questions
- `## Status: DONE_WITH_CONCERNS` — generated, but open questions remain deferred (list them)
- `## Status: NEEDS_CONTEXT` — missing required arguments
- `## Status: BLOCKED` — cannot proceed (add reason)

````
- [ ] **Step 2: Self-review against spec**

Read the written file and verify:
- Interview covers all 5 spec categories (Goals / Non-Goals / Requirements / Constraints / Risks) ✓
- discovery.md format matches spec template ✓
- pmo.yaml includes all new fields from spec (client, discovery_file, spec_file, design_doc_file, decisions_file, notion_page_id) ✓
- Slug validation rule is described ✓
- Open Questions deferred format is described ✓

- [ ] **Step 3: Commit**

```bash
git add home/.claude/skills/user-pm-discover/
git commit -m "feat: user-pm-discover スキルを追加（ヒアリング→discovery.md自動生成）"
````

---

## Task 2: user-pm-spec — Discovery → Spec + Design Doc

**Files:**

- Create: `home/.claude/skills/user-pm-spec/SKILL.md`

Depends on: Task 1 (discovery.md format must be stable)

- [ ] **Step 1: Create skill directory and write SKILL.md**

```bash
mkdir -p home/.claude/skills/user-pm-spec
```

Write `home/.claude/skills/user-pm-spec/SKILL.md`:

````markdown
---
name: user-pm-spec
description: Convert discovery.md into a Requirements Spec (RTM) and Design Doc (10 sections). Run after user-pm-discover. Triggered by "仕様書作成", "spec", "design doc", "仕様化".
argument-hint: [slug]
effort: high
---

# PM Spec — Discovery → Requirements Spec + Design Doc

Read `~/prj/{slug}/discovery.md` and generate two documents: a Requirements Traceability Matrix (spec.md) and a Design Doc (design-doc.md).

## Iron Law

1. Always read `discovery.md` first — never generate spec from memory alone
2. Every requirement in spec.md must trace back to discovery.md (BINDING) or be explicitly flagged as supplemented/pending
3. Coverage matrix must show 0 🔴 gaps before declaring done
4. Do not overwrite existing spec.md or design-doc.md without confirming with the user

## Trigger

Use when: `~/prj/{slug}/discovery.md` exists and spec/design doc creation is needed.

Arguments:

- `slug`: project slug. If only one `~/prj/*/pmo.yaml` exists, auto-detect. Otherwise ask.

## Process

1. Resolve slug (auto-detect or ask)
2. If `~/prj/{slug}/discovery.md` does not exist, stop: "discovery.md が見つかりません。先に /user-pm-discover を実行してください。"
3. Read `~/prj/{slug}/discovery.md`
4. Classify each requirement:
   - `BINDING` — explicitly stated by client in discovery.md
   - `SUPPLEMENTED` — industry standard not stated by client but necessary (cite specific reason)
   - `PENDING` — unclear; needs client clarification
5. Generate coverage matrix (see below) — flag any discovery.md item not mapped to spec with 🔴
6. Write `~/prj/{slug}/spec.md` (RTM format)
7. Write `~/prj/{slug}/design-doc.md` (10 sections)
8. Update `~/prj/{slug}/pmo.yaml`: set `spec_file: spec.md` and `design_doc_file: design-doc.md`
9. Show summary: counts of BINDING / SUPPLEMENTED / PENDING, and any 🔴 gaps
10. If PENDING items exist, ask PM: "以下の要件が不明確です。クライアントに確認後、/user-pm-spec を再実行してください。"

## Output Format — spec.md

```markdown
# Requirements Spec: {Project Name}

Generated: {YYYY-MM-DD} | Source: discovery.md ({date})

## Coverage Matrix

| Discovery Item | Spec Row | Status     |
| -------------- | -------- | ---------- |
| R01            | S-001    | ✅         |
| R02            | —        | 🔴 Missing |

BINDING: {n} | SUPPLEMENTED: {n} | PENDING: {n}

## Requirements Traceability Matrix

| ID    | Requirement | Classification | Source / Reason           | Priority | Acceptance Criteria |
| ----- | ----------- | -------------- | ------------------------- | -------- | ------------------- |
| S-001 | ...         | BINDING        | discovery.md R01          | Must     | ...                 |
| S-002 | ...         | SUPPLEMENTED   | WCAG 2.1 AA準拠が業界標準 | Should   | ...                 |
| S-003 | ...         | PENDING        | クライアント未確認        | TBD      | —                   |
```
````

## Output Format — design-doc.md

```markdown
# Design Doc: {Project Name}

Date: {YYYY-MM-DD} | Status: Draft

## Goals

{From discovery.md Goals — 3-5 bullet points}

## Non-Goals

{From discovery.md Non-Goals}

## Background

{Project context: client, industry, problem being solved — 2-3 sentences}

## User Stories

- As a {persona}, I want to {action} so that {outcome}.
  {Generate 3-5 based on Requirements}

## Success Metrics

{From discovery.md Goals — KPIs and measurable outcomes}

## Biggest Hypotheses

{Top 2-3 assumptions the project is betting on}

## Risk / Pre-mortem

| ID | Risk | Probability | Impact | Mitigation |
{From discovery.md Risks}

## Functional Requirements

{Summary of BINDING requirements from spec.md — grouped by feature area}

## Alternatives Considered

| Option   | Pros | Cons | Decision            |
| -------- | ---- | ---- | ------------------- |
| {option} | ...  | ...  | Rejected / Selected |

## Results

_To be filled after project delivery._
```

## Status

- `## Status: DONE` — spec.md and design-doc.md written, 0 🔴 gaps in coverage matrix
- `## Status: DONE_WITH_CONCERNS` — written, but PENDING items remain (list them)
- `## Status: NEEDS_CONTEXT` — slug not found or discovery.md missing
- `## Status: BLOCKED` — cannot resolve requirements (add reason)

````
- [ ] **Step 2: Self-review against spec**

Verify:
- BINDING / SUPPLEMENTED / PENDING classification is described ✓
- Coverage matrix format is defined ✓
- design-doc.md has all 10 sections from note.com article ✓
- pmo.yaml update (spec_file, design_doc_file) is in process ✓
- Guard against overwriting existing files ✓

- [ ] **Step 3: Commit**

```bash
git add home/.claude/skills/user-pm-spec/
git commit -m "feat: user-pm-specスキルを追加（discovery.md→仕様書+Design Doc）"
````

---

## Task 3: user-pm-meeting — Meeting Notes → Structured Record

**Files:**

- Create: `home/.claude/skills/user-pm-meeting/SKILL.md`

Independent of Tasks 1 and 2 (can run in parallel).

- [ ] **Step 1: Create skill directory and write SKILL.md**

```bash
mkdir -p home/.claude/skills/user-pm-meeting
```

Write `home/.claude/skills/user-pm-meeting/SKILL.md`:

````markdown
---
name: user-pm-meeting
description: Extract decisions, action items, unresolved questions, and risks from raw meeting notes. Saves to decisions.md (cumulative) and meetings/YYYY-MM-DD.md. Syncs action items and risks to pmo.yaml. Triggered by "議事録", "meeting", "ミーティング記録", "meeting notes".
argument-hint: [slug] [meeting-notes]
effort: low
---

# PM Meeting — Notes → Structured Record

Parse raw meeting notes and update three locations: the meeting archive, the cumulative decisions log, and pmo.yaml.

## Iron Law

1. Never invent decisions or action items — only extract what is stated in the notes
2. Append to decisions.md (never overwrite) — newest entry first
3. Always sync action items with `status: pending` to pmo.yaml tasks
4. If slug is ambiguous, ask before writing any files

## Trigger

Use when: A meeting has occurred and notes need to be structured.

Arguments:

- `slug`: project slug (auto-detect if one project in ~/prj/)
- `meeting-notes`: raw notes — paste directly or provide a file path

If notes are not provided, prompt: "会議メモを貼り付けてください。"

## Process

1. Resolve slug (auto-detect or ask)
2. Accept raw notes (paste or file path)
3. Extract from notes:
   - ✅ **Decisions** — clear conclusions reached
   - 📋 **Action Items** — tasks with owner + deadline (infer from context if not explicit; flag as `[owner TBD]` if unclear)
   - ❓ **Unresolved** — open questions not yet answered
   - ⚠️ **New Risks** — risks surfaced during the meeting
4. Append new entry to `~/prj/{slug}/decisions.md` (newest first — see format below)
5. Save full structured notes to `~/prj/{slug}/meetings/{YYYY-MM-DD}.md`
6. Append action items as new tasks in `~/prj/{slug}/pmo.yaml`:

```yaml
tasks:
  - id: T-{next number}
    phase: "{meeting date} action"
    name: "{action item text}"
    assignee: "{owner}"
    est_hours: 0
    deadline: "{due date or TBD}"
    status: pending
    source: "meeting {YYYY-MM-DD}"
```
````

7. Append new risks to `~/prj/{slug}/pmo.yaml` under `risks:`:

```yaml
risks:
  - id: K-{next number}
    description: "{risk text}"
    severity: "{high/medium/low}"
    mitigation: "TBD"
    source: "meeting {YYYY-MM-DD}"
```

8. Report: summary of extracted items (N decisions, N action items, N unresolved, N risks)

## decisions.md Format (append-only, newest first)

```markdown
## {YYYY-MM-DD} — {Meeting Title}

### Decisions

- [D{n}] {decision text}

### Action Items

| #    | Action   | Owner   | Due                 |
| ---- | -------- | ------- | ------------------- |
| A{n} | {action} | {owner} | {YYYY-MM-DD or TBD} |

### Unresolved

- [U{n}] {question}

### New Risks

- [K{n}] {risk} (severity: high/medium/low)

---
```

## meetings/YYYY-MM-DD.md Format

```markdown
# Meeting: {Meeting Title}

Date: {YYYY-MM-DD} | Project: {project name} | Attendees: {list if mentioned}

## Raw Notes

{original notes, lightly formatted}

## Extracted

### Decisions

{same as decisions.md entry}

### Action Items

{same as decisions.md entry}

### Unresolved

{same as decisions.md entry}

### New Risks

{same as decisions.md entry}
```

## Status

- `## Status: DONE` — decisions.md updated, meeting file saved, pmo.yaml synced
- `## Status: DONE_WITH_CONCERNS` — saved, but some action items have `[owner TBD]` (list them)
- `## Status: NEEDS_CONTEXT` — no notes provided or slug not found
- `## Status: BLOCKED` — cannot parse notes (add reason)

````
- [ ] **Step 2: Self-review against spec**

Verify:
- decisions.md format matches spec exactly ✓
- meetings/YYYY-MM-DD.md is created separately from decisions.md ✓
- pmo.yaml sync for action items and risks is described with exact YAML format ✓
- "Never overwrite" iron law is stated ✓

- [ ] **Step 3: Commit**

```bash
git add home/.claude/skills/user-pm-meeting/
git commit -m "feat: user-pm-meetingスキルを追加（議事録→decisions.md構造化）"
````

---

## Task 4: user-pmo-wbs enhancement — Auto-estimation from discovery.md

**Files:**

- Modify: `home/.claude/skills/user-pmo-wbs/SKILL.md`

Depends on: Task 1 (discovery.md format stable)

- [ ] **Step 1: Read current SKILL.md**

Read `home/.claude/skills/user-pmo-wbs/SKILL.md` in full.

- [ ] **Step 2: Add discovery.md integration to the Process section**

In the Process section, replace step 2 (the slug inference step):

```
2. Infer slug from project name: lowercase, hyphens, ASCII only (e.g. "○○ Corporate Site" → "oo-corporate-site")
```

with:

```
2. Infer slug from project name: lowercase, hyphens, ASCII only (e.g. "○○ Corporate Site" → "oo-corporate-site")
2a. If `~/prj/{slug}/discovery.md` exists, read it and apply discovery multipliers to hour estimates:
    - Requirements count > 20 → multiply all est_hours by 1.3 (round to nearest 0.5h)
    - Any risk with `Probability: High` AND `Impact: High` present → add 10% buffer to total hours
    - More than 3 PENDING requirements → flag in output: "⚠️ {n} 件の要件が未確定です。WBS確定前にクライアント確認を推奨します。"
    Templates are not overridden — only the hour totals are adjusted.
```

- [ ] **Step 3: Verify the edit did not break existing sections**

Read the modified file in full. Confirm:

- All task templates (corporate-site, lp, ec, etc.) are unchanged
- YAML Output Format is unchanged
- New step 2a is correctly placed between slug inference and template generation

- [ ] **Step 4: Commit**

```bash
git add home/.claude/skills/user-pmo-wbs/SKILL.md
git commit -m "feat: user-pmo-wbs にdiscovery.md連動の工数補正を追加"
```

---

## Task 5: user-pmo-status enhancement — Integrate decisions.md action items

**Files:**

- Modify: `home/.claude/skills/user-pmo-status/SKILL.md`

Depends on: Task 3 (decisions.md format stable)

- [ ] **Step 1: Read current SKILL.md**

Read `home/.claude/skills/user-pmo-status/SKILL.md` in full.

- [ ] **Step 2: Add decisions.md integration**

In the Process section, add a new step after the existing task-list rendering step:

```
N+1. For each project, if `~/prj/{slug}/decisions.md` exists:
     - Parse all Action Items from the file
     - Extract items where Due date < today → show as 🔴 Overdue
     - Extract items where Due date is within 3 days → show as 🟡 Due Soon
     - Append an "Action Items" subsection to that project's dashboard block:

     **Overdue Action Items 🔴**
     | Action | Owner | Due | Days overdue |
     | ------ | ----- | --- | ------------ |
     | {action} | {owner} | {date} | {n} |

     **Due Soon 🟡**
     | Action | Owner | Due |
     | ------ | ----- | --- |
     | {action} | {owner} | {date} |

     If no overdue or due-soon items, omit these tables.
```

- [ ] **Step 3: Verify the edit**

Read the modified file. Confirm:

- Existing dashboard logic (pmo.yaml reading, deadline flags) is unchanged
- New decisions.md section is clearly subordinate (project-level, not global)

- [ ] **Step 4: Commit**

```bash
git add home/.claude/skills/user-pmo-status/SKILL.md
git commit -m "feat: user-pmo-status にdecisions.mdのアクションアイテム統合表示を追加"
```

---

## Task 6: user-pm-report — Status Report Generation

**Files:**

- Create: `home/.claude/skills/user-pm-report/SKILL.md`

Depends on: Tasks 3 (decisions.md format), Tasks 1+4 (pmo.yaml schema stable)

- [ ] **Step 1: Create skill directory and write SKILL.md**

```bash
mkdir -p home/.claude/skills/user-pm-report
```

Write `home/.claude/skills/user-pm-report/SKILL.md`:

````markdown
---
name: user-pm-report
description: Generate a project status report from pmo.yaml and decisions.md. Outputs CSV (always) and Notion page (if notion_page_id is set). Triggered by "レポート生成", "report", "週次報告", "status report".
argument-hint: [slug] [period]
effort: medium
---

# PM Report — Status Report Generation

Aggregate project data from pmo.yaml and decisions.md and produce a structured status report.

## Iron Law

1. Read pmo.yaml and decisions.md before generating — never fabricate progress data
2. CSV is always saved — Notion output is best-effort (skip gracefully if notion_page_id not set)
3. Do not overwrite an existing report file — use date-stamped filenames

## Trigger

Use when: Weekly or milestone status report is needed.

Arguments:

- `slug`: project slug (auto-detect if one project in ~/prj/)
- `period`: reporting period (default: last 7 calendar days from today)

## Process

1. Resolve slug (auto-detect or ask)
2. Read `~/prj/{slug}/pmo.yaml`
3. If `~/prj/{slug}/decisions.md` exists, read it
4. Calculate progress:
   - Task progress: `done tasks / total tasks × 100` (round to nearest 5%)
   - Phase: read `project.phase` from pmo.yaml
   - Days remaining: deadline - today
5. Extract from decisions.md (within reporting period):
   - Completed action items (items with status marked or due date passed)
   - Open action items
   - Unresolved questions
   - Active risks (from pmo.yaml risks + decisions.md new risks)
6. Generate report (see Report Format below)
7. Save CSV to `~/prj/{slug}/report-{YYYY-MM-DD}.csv` (see CSV Format below)
8. If `project.notion_page_id` is set and non-empty in pmo.yaml:
   - Output report to Notion page via MCP
   - On failure, print warning and continue (CSV is already saved)
9. If `notion_page_id` is empty: skip Notion output silently, save CSV only
10. Report: "レポートを ~/prj/{slug}/report-{YYYY-MM-DD}.csv に保存しました。[Notionへの出力: 成功/スキップ]"

## Report Format (displayed in chat)

```markdown
# Status Report: {Project Name}

Period: {start} – {end} | Generated: {YYYY-MM-DD}
Phase: {phase} | Progress: {n}% | Days remaining: {n}

---

## Progress Summary

- Total tasks: {n}
- Completed: {n} ({n}%)
- In progress: {n}
- Pending: {n}

## Completed This Period

- {action / task}

## Issues & Blockers

| Issue            | Owner          | Status |
| ---------------- | -------------- | ------ |
| {unresolved U-n} | {owner or TBD} | Open   |

## Next Period Actions

| Action             | Owner   | Due    |
| ------------------ | ------- | ------ |
| {open action item} | {owner} | {date} |

## Risk Status

| ID  | Risk | Severity | Mitigation |
| --- | ---- | -------- | ---------- |
| K01 | ...  | High     | ...        |
```
````

## CSV Format

Save as `~/prj/{slug}/report-{YYYY-MM-DD}.csv`:

```csv
section,item,owner,due,status
Progress,Total tasks,—,—,{n}
Progress,Completed,—,—,{n}
Progress,In progress,—,—,{n}
Progress,Pending,—,—,{n}
Completed,{task/action},—,—,done
Issue,{unresolved},TBD,—,open
Next Action,{action},{owner},{due},pending
Risk,{risk description},—,—,{severity}
```

## Status

- `## Status: DONE` — report displayed, CSV saved
- `## Status: DONE_WITH_CONCERNS` — CSV saved, Notion output failed (add error)
- `## Status: NEEDS_CONTEXT` — slug not found or pmo.yaml missing
- `## Status: BLOCKED` — cannot read required files (add reason)

````
- [ ] **Step 2: Self-review against spec**

Verify:
- Period defaults to last 7 calendar days ✓
- Notion output is gracefully skipped when notion_page_id is empty ✓
- CSV is always generated ✓
- Report sections match spec (progress, completed, issues, next actions, risks) ✓

- [ ] **Step 3: Commit**

```bash
git add home/.claude/skills/user-pm-report/
git commit -m "feat: user-pm-reportスキルを追加（週次レポート→CSV/Notion出力）"
````

---

## Task 7: Documentation

**Files:**

- Create: `docs/pm-pmo-guide.md`
- Create: `docs/pm-pmo-quickref.md`

Independent — can be done any time after Tasks 1-6 are complete.

- [ ] **Step 1: Write docs/pm-pmo-guide.md**

Write `docs/pm-pmo-guide.md`:

```markdown
# PM/PMO Skill Guide

Claude Code を使い倒すための PM/PMO ワークフロー完全ガイド。

---

## 1. 概要と哲学

**原則: "Why と判断はPM、How と作業はAI"**

あなた（PM）が担うのは: 方向性の決定、スコープ判断、クライアントとの関係管理
Claude Code が担うのは: 構造化変換、カバレッジ検証、初稿生成、ドキュメント出力

### フェーズパイプライン全体像
```

クライアントヒアリング
↓
[Phase 1] /user-pm-discover
AI対話 → Goals/Non-Goals/要件/制約/リスクを分類
出力: ~/prj/{slug}/discovery.md + pmo.yaml（初期）
↓
[Phase 2] /user-pm-spec
discovery.md → 要件定義書（RTM）+ Design Doc（10項目）
出力: ~/prj/{slug}/spec.md + design-doc.md
↓
[Phase 3] プロジェクト実行
/user-pmo-wbs → WBS生成（discovery.mdで工数補正）
/user-pmo-status → 進捗ダッシュボード
/user-pm-meeting → 議事録→decisions.md構造化
↓
[Phase 4] /user-pm-report
pmo.yaml + decisions.md → ステータスレポート
出力: CSV + Notion（設定時）

```
### プロジェクトデータの場所

全ファイルは `~/prj/{slug}/` 配下に保存されます:

| ファイル | 内容 | 生成スキル |
|---|---|---|
| `pmo.yaml` | プロジェクトマスタ | discover (初期) / wbs / status |
| `discovery.md` | ヒアリング構造化記録 | pm-discover |
| `spec.md` | 要件定義書（RTM） | pm-spec |
| `design-doc.md` | Design Doc（10項目） | pm-spec |
| `meetings/YYYY-MM-DD.md` | 個別議事録 | pm-meeting |
| `decisions.md` | 意思決定累積ログ | pm-meeting |
| `report-YYYY-MM-DD.csv` | ステータスレポート | pm-report |

---

## 2. プロジェクト開始（Phase 1 → 2）

### /user-pm-discover — ヒアリング

**いつ使う:** 新規案件のキックオフ時

**使い方:**
```

/user-pm-discover project-name="ABC Corp コーポレートサイト" client-name="ABC株式会社" deadline="2026-09-30"

```
引数が不足していると Claude が一括で聞き返します。

**Claude がやること:**
1. プロジェクトディレクトリを作成
2. 7問のインタビューを1問ずつ実施
3. 各回答を Goals / Non-Goals / Requirements / Constraints / Risks に自動分類
4. `discovery.md` と `pmo.yaml` を生成

**あなたがやること:**
- 各質問に正直に・具体的に答える
- 不明な点は「未定」「要確認」と伝えれば OK（Open Questions として記録される）

**完了確認:** `~/prj/{slug}/discovery.md` を確認し、内容が合っているか目視チェック

---

### /user-pm-spec — 仕様書・Design Doc生成

**いつ使う:** discovery.md 完成後、仕様化フェーズ開始時

**使い方:**
```

/user-pm-spec abc-corp-site

```
スラッグ省略可（プロジェクトが1つだけなら自動検出）

**Claude がやること:**
1. discovery.md を読み込み
2. 要件を BINDING / SUPPLEMENTED / PENDING に分類
3. カバレッジマトリクスを生成（抜け漏れを🔴でフラグ）
4. `spec.md`（RTM形式）と `design-doc.md`（10項目）を生成

**あなたがやること:**
- 🔴 フラグが付いた項目 → クライアントに確認
- PENDING 項目 → 確認後に再実行

---

## 3. プロジェクト実行（Phase 3）

### /user-pmo-wbs — WBS生成
```

/user-pmo-wbs project-name="ABC Corp コーポレートサイト" deliverable-types="corporate-site" deadline="2026-09-30" team-members="PM, Designer, Developer"

```
`discovery.md` があれば自動で工数を補正します:
- 要件数20件超 → 工数×1.3
- 高確率×高影響リスクあり → 全体に10%バッファ
- PENDING要件3件超 → 警告表示

---

### /user-pmo-status — 進捗ダッシュボード
```

/user-pmo-status

```
引数不要。`~/prj/*/pmo.yaml` を全読み込みし、全案件を一覧表示。
`decisions.md` があれば、期限切れ・期限間近のアクションアイテムも統合表示します。

---

### /user-pmo-workload — メンバー工数確認
```

/user-pmo-workload

```
引数不要。全プロジェクトのタスクをメンバー別に集計表示。

---

### /user-pmo-checklist — フェーズゲート確認
```

/user-pmo-checklist

```
現在のフェーズに応じたゲートチェックリストを表示。

---

### /user-pm-meeting — 議事録の記録
```

/user-pm-meeting abc-corp-site
（プロンプトに促されたらメモを貼り付け）

```
または:
```

/user-pm-meeting abc-corp-site meeting-notes="2026-04-23のメモ..."

```
**Claude がやること:**
- 決定事項 / アクションアイテム / 未解決事項 / 新リスクを抽出
- `decisions.md` に追記（最新が先頭）
- `meetings/2026-04-23.md` として保存
- アクションアイテムとリスクを `pmo.yaml` に自動追記

---

## 4. 報告・共有（Phase 4）

### /user-pm-report — ステータスレポート生成
```

/user-pm-report abc-corp-site

````
または引数省略（プロジェクトが1つなら自動検出）

**出力:**
- チャットにレポート表示
- `~/prj/{slug}/report-YYYY-MM-DD.csv` を保存（Excel対応）
- `pmo.yaml` に `notion_page_id` が設定されていれば Notion にも出力

**Notion 連携の設定:**
`~/prj/{slug}/pmo.yaml` の `notion_page_id` に Notion ページの UUID を記入:
```yaml
notion_page_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
````

---

## 5. pmo.yaml フィールドリファレンス

```yaml
project:
  name: "プロジェクト正式名称" # 必須
  slug: "kebab-case-slug" # 必須、30文字以内
  client: "クライアント名" # pm-discoverが設定
  deadline: "YYYY-MM-DD" # 必須
  phase: "discovery" # discovery / spec / design / development / qa / launch
  discovery_file: discovery.md # pm-discoverが設定
  spec_file: spec.md # pm-specが設定
  design_doc_file: design-doc.md # pm-specが設定
  decisions_file: decisions.md # pm-meetingが設定
  notion_page_id: "" # 任意、Notion出力用ページUUID

tasks:
  - id: T-001 # T-{3桁連番}
    phase: "要件定義"
    name: "RTM作成"
    assignee: "PM"
    est_hours: 3
    deadline: "YYYY-MM-DD"
    status: pending # pending / in_progress / done
    source: "" # 任意、meeting YYYY-MM-DD など

risks:
  - id: K-001 # K-{3桁連番}
    description: "リスク内容"
    severity: high # high / medium / low
    mitigation: "対応方針"
    source: "" # 任意
```

---

## 6. トラブルシューティング

| 症状                                                      | 対処                                                             |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| `/user-pm-spec` が "discovery.md が見つかりません" と言う | 先に `/user-pm-discover` を実行                                  |
| `/user-pm-report` の Notion 出力が失敗する                | `notion_page_id` が正しいか確認。問題があっても CSV は保存される |
| `/user-pmo-status` でプロジェクトが表示されない           | `~/prj/{slug}/pmo.yaml` が存在するか確認                         |
| WBS の工数が大きく補正される                              | `discovery.md` の要件数や高リスク数を確認。見直して再実行        |
| PENDING 要件が多くて仕様書が作れない                      | クライアントに確認後、`discovery.md` を手動で編集して再実行      |

````
- [ ] **Step 2: Write docs/pm-pmo-quickref.md**

Write `docs/pm-pmo-quickref.md`:

```markdown
# PM/PMO Quick Reference

| やりたいこと | コマンド | 主な引数 |
|---|---|---|
| 新規案件ヒアリング開始 | `/user-pm-discover` | project-name client-name deadline |
| 仕様書・Design Doc生成 | `/user-pm-spec` | (slug) |
| WBS作成 | `/user-pmo-wbs` | project-name deliverable-types deadline team-members |
| 全案件の状況確認 | `/user-pmo-status` | — |
| メンバー工数確認 | `/user-pmo-workload` | — |
| フェーズゲート確認 | `/user-pmo-checklist` | — |
| 議事録を記録・構造化 | `/user-pm-meeting` | (slug) → メモ貼付け |
| ステータスレポート生成 | `/user-pm-report` | (slug) |

## フェーズ別クイックスタート

### 案件開始時
1. `/user-pm-discover` でヒアリング
2. `/user-pm-spec` で仕様書生成
3. `/user-pmo-wbs` でWBS作成

### 実行中（毎週）
1. `/user-pm-meeting` で議事録記録
2. `/user-pmo-status` で全案件確認
3. `/user-pm-report` で週次レポート生成

## pmo.yaml フェーズ値

`discovery` → `spec` → `design` → `development` → `qa` → `launch`

## 参考

詳細ガイド: `docs/pm-pmo-guide.md`  
設計仕様: `docs/superpowers/specs/2026-04-23-pm-pmo-pipeline-design.md`
````

- [ ] **Step 3: Self-review**

Read both files and verify:

- All 8 commands are documented in quickref ✓
- Guide covers all 4 phases ✓
- pmo.yaml field reference includes all fields from spec ✓
- Troubleshooting covers key failure modes ✓

- [ ] **Step 4: Commit**

```bash
git add docs/pm-pmo-guide.md docs/pm-pmo-quickref.md
git commit -m "docs: PM/PMOスキル全体ガイドとクイックリファレンスを追加"
```

---

## Self-Review Against Spec

### Spec Coverage Check

| Spec Requirement                                                                                         | Covered by                    |
| -------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 1: pm-discover (interview + discovery.md + pmo.yaml)                                               | Task 1                        |
| Phase 2: pm-spec (RTM + Design Doc 10 sections)                                                          | Task 2                        |
| Phase 3: pm-meeting (decisions.md + pmo.yaml sync)                                                       | Task 3                        |
| Phase 4: pm-report (CSV + Notion)                                                                        | Task 6                        |
| user-pmo-wbs enhancement (multiplier from discovery.md)                                                  | Task 4                        |
| user-pmo-status enhancement (decisions.md action items)                                                  | Task 5                        |
| docs/pm-pmo-guide.md                                                                                     | Task 7                        |
| docs/pm-pmo-quickref.md                                                                                  | Task 7                        |
| pmo.yaml new fields (client, discovery_file, spec_file, design_doc_file, decisions_file, notion_page_id) | Task 1 (YAML Format section)  |
| slug = PM-entered, kebab-case, max 30 chars                                                              | Task 1 (Process step 2)       |
| Open Questions: resolved or `[deferred until YYYY-MM-DD]`                                                | Task 1 (completion condition) |
| decisions.md format defined                                                                              | Task 3                        |
| Notion output: graceful skip when notion_page_id empty                                                   | Task 6                        |
| WBS multiplier rules: ×1.3 >20 req, +10% high-risk, flag >3 PENDING                                      | Task 4                        |
| ~/prj/README.md                                                                                          | ⚠️ Missing — see note below    |

**Note:** `~/prj/README.md` is outside the dotfiles repo. Create it manually at first project setup, or add a step in pm-discover to generate it. For now, `docs/pm-pmo-guide.md` serves as the canonical reference.

### Placeholder Scan

No TBD, TODO, or incomplete sections found in any task.

### Type Consistency

- `discovery.md` format defined in Task 1, consumed in Tasks 2 and 4 — consistent ✓
- `decisions.md` format defined in Task 3, consumed in Tasks 5 and 6 — consistent ✓
- `pmo.yaml` schema defined in Task 1, extended in Tasks 3/4/5/6 — consistent ✓
- Slug format rule stated in Tasks 1, 2, 3, 6 — all use same definition ✓
