# PM/PMO Pipeline Design

**Date:** 2026-04-23\
**Status:** Approved\
**Scope:** Client project (受託) PM/PMO workflow powered by Claude Code

---

## 1. Background and Philosophy

### Problem Statement

The user (PM/PMO, client project focus) loses the most time in:

- **A. Requirements definition / spec creation** — structuring client conversations into Goals, requirements, and constraints
- **C. Document management** — meeting notes, Design Docs, decision records

Within (A), the three specific pain points are:

1. Hearing → structuring (converting client words into structured form)
2. Coverage check (ensuring nothing is missing)
3. First-draft generation (time cost of writing even with structure in hand)

### Guiding Principle

> "Why and judgment = PM. How and execution = AI."

The PM owns direction, scope decisions, and stakeholder relationships. Claude Code owns structural conversion, coverage checking, first-draft generation, and document export.

### Tool Integration Targets

Notion, Figma, Excel/Office (primary), GitHub (secondary)

---

## 2. Overall Architecture

```
Client Hearing
      │
      ▼
[Phase 1] user-pm-discover
  AI-guided interview → auto-classify into Goals / Non-Goals / Requirements / Constraints / Risks
  Output: ~/prj/{slug}/discovery.md
           ~/prj/{slug}/pmo.yaml (initial)
      │
      ▼
[Phase 2] user-pm-spec
  discovery.md → Requirements Spec (RTM) + Design Doc (10 sections)
  Coverage matrix → flag gaps with 🔴
  Output: ~/prj/{slug}/spec.md
           ~/prj/{slug}/design-doc.md
      │
      ▼
[Phase 3] Execution (existing skills, enhanced)
  user-pmo-wbs     → WBS with auto-estimated hours from discovery.md
  user-pmo-status  → Progress dashboard (integrates decisions.md issues)
  user-pmo-workload → Member workload view
  user-pmo-checklist → Phase-gate checklist
  user-pm-meeting  → Meeting notes → decisions.md + pmo.yaml sync
      │
      ▼
[Phase 4] user-pm-report
  pmo.yaml + decisions.md → Status report
  Output: Notion (via MCP) + ~/prj/{slug}/report-YYYY-MM-DD.csv (Excel)
```

---

## 3. Data Model

All files live under `~/prj/{slug}/`.

**slug** = kebab-case project identifier entered by the PM at discovery time (not auto-generated).\
Rule: lowercase, alphanumeric + hyphens only, max 30 characters.\
Examples: "ABC Corp Corporate Site" → `abc-corp-site`, "社内勤怠システム刷新" → `kintai-renewal`\
`user-pm-discover` prompts "Project slug (kebab-case, e.g. abc-corp-site):" and validates the format.

| File                     | Role                                           | Created by                         |
| ------------------------ | ---------------------------------------------- | ---------------------------------- |
| `pmo.yaml`               | Project master — phases, tasks, deadline, team | pm-discover (initial), wbs, status |
| `discovery.md`           | Structured hearing record                      | **pm-discover (new)**              |
| `spec.md`                | Requirements spec (RTM format)                 | **pm-spec (new)**                  |
| `design-doc.md`          | Design Doc — 10 sections                       | **pm-spec (new)**                  |
| `meetings/YYYY-MM-DD.md` | Individual meeting notes                       | **pm-meeting (new)**               |
| `decisions.md`           | Cumulative decision + action log               | **pm-meeting (new)**               |
| `report-YYYY-MM-DD.csv`  | Status report for Excel                        | **pm-report (new)**                |

### pmo.yaml extensions

Add the following fields to the existing schema:

```yaml
# Existing fields (unchanged)
name: "Project Name"
phase: discovery
deadline: 2026-06-30
team: [PM, Designer, Developer]
tasks: [...]

# New fields
client: "Client Name"
discovery_file: discovery.md
spec_file: spec.md
design_doc_file: design-doc.md
risks:
  - id: R1
    description: "..."
    severity: high
    mitigation: "..."
decisions_file: decisions.md
notion_page_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" # optional; enables pm-report Notion output
```

---

## 4. New Skills

### 4.1 `user-pm-discover` — Hearing → Structured Record

**Trigger:** "ヒアリング開始", "discovery", "要件ヒアリング"\
**Arguments:** project-name, client-name, deadline (prompt for missing ones)

**Flow:**

1. Create `~/prj/{slug}/` directory
2. Conduct AI-as-interviewer session, one question at a time:
   - "このプロジェクトで解決したい課題は何ですか？"
   - "成功とはどういう状態ですか？KPIや指標はありますか？"
   - "予算・スケジュール・技術的な制約はありますか？"
   - "スコープ外にしたいことはありますか？"
   - "最大のリスクは何だと思いますか？"
3. Classify each answer in real-time → Goals / Non-Goals / Requirements / Constraints / Risks
4. Immediately ask follow-up on anything ambiguous
5. On session end: generate `discovery.md` + initial `pmo.yaml`

**Output format (`discovery.md`):**

```markdown
# Discovery: {Project Name}

Date: YYYY-MM-DD | Client: {client} | PM: {pm}

## Goals

- [ ] ...

## Non-Goals

- [ ] ...

## Requirements

| ID | Requirement | Source | Priority |
| -- | ----------- | ------ | -------- |
| R1 | ...         | Client | Must     |

## Constraints

- Budget: ...
- Deadline: ...
- Technical: ...

## Risks

| ID | Risk | Probability | Impact | Mitigation |
| -- | ---- | ----------- | ------ | ---------- |
| R1 | ...  | High        | High   | ...        |

## Open Questions

- [ ] ...
```

**Completion condition:** `discovery.md` generated and all "Open Questions" either resolved or explicitly deferred (marked with `[deferred]` tag and a follow-up date).

---

### 4.2 `user-pm-spec` — Discovery → Spec + Design Doc

**Trigger:** "仕様書作成", "spec", "design doc", "仕様化"\
**Arguments:** slug (auto-detect from `~/prj/*/` if only one exists)

**Flow:**

1. Auto-read `~/prj/{slug}/discovery.md`
2. Classify each requirement: `BINDING` (client-stated) / `SUPPLEMENTED` (industry standard) / `PENDING` (unclear)
3. Generate coverage matrix → flag gaps 🔴
4. Write `spec.md` (RTM format)
5. Write `design-doc.md` (10 sections per note.com article structure):
   - Goals, Non-goals, Background, User Stories, Success Metrics,
     Biggest Hypotheses, Risk/Pre-mortem, Functional Requirements,
     Alternatives Considered, Results (placeholder)
6. Show diff summary and prompt user to confirm

**Completion condition:** Both `spec.md` and `design-doc.md` written, coverage matrix shows 0 🔴 gaps.

---

### 4.3 `user-pm-meeting` — Meeting Notes → Structured Record

**Trigger:** "議事録", "meeting", "ミーティング記録"\
**Arguments:** slug, raw meeting notes (paste or file path)

**Flow:**

1. Extract from raw notes:
   - ✅ Decisions
   - 📋 Action items (with owner + deadline)
   - ❓ Unresolved questions
   - ⚠️ New risks
2. Append to `decisions.md` (cumulative log)
3. Save as `meetings/YYYY-MM-DD.md`
4. Sync action items and risks to `pmo.yaml`

**`decisions.md` format (append-only, newest first):**

```markdown
## YYYY-MM-DD — {Meeting title}

### Decisions

- [D1] ...

### Action Items

| #  | Action | Owner | Due        |
| -- | ------ | ----- | ---------- |
| A1 | ...    | PM    | YYYY-MM-DD |

### Unresolved

- [U1] ...

### New Risks

- [R2] ... (severity: high/medium/low)
```

**Completion condition:** `decisions.md` updated, `pmo.yaml` synced, meeting file saved.

---

### 4.4 `user-pm-report` — Status Report Generation

**Trigger:** "レポート生成", "report", "週次報告", "status report"\
**Arguments:** slug (auto-detect if one project), period (default: last 7 calendar days from today)

**Flow:**

1. Auto-read `pmo.yaml` + `decisions.md`
2. Generate report structure:
   - Progress summary (% per phase)
   - Completed this period
   - Issues and blockers
   - Next period actions
   - Risk status
3. Output to Notion via MCP (target page identified by `notion_page_id` in `pmo.yaml`; skip with warning if field absent)
4. Save CSV to `~/prj/{slug}/report-YYYY-MM-DD.csv`

**Completion condition:** CSV saved. Notion update is best-effort (skipped gracefully if `notion_page_id` not set).

---

## 5. Existing Skill Enhancements

### `user-pmo-wbs` — Add auto-estimation from discovery.md

When `discovery.md` exists for the project, read it before generating the WBS. The existing deliverable-type templates remain the base; discovery signals apply a multiplier:

- Requirements count > 20 → ×1.3 on all estimates
- Any `severity: high` risk present → add 10% buffer to total
- More than 3 PENDING requirements → flag for PM review before finalizing WBS

The template is not overridden; only the hour totals are adjusted.

### `user-pmo-status` — Integrate decisions.md issues

When rendering the status dashboard, merge open action items from `decisions.md` into the task list view. Show overdue action items with 🔴.

---

## 6. Documentation Plan

### Files to create

| File                      | Contents                                 |
| ------------------------- | ---------------------------------------- |
| `~/prj/README.md`         | Project directory overview + quick setup |
| `docs/pm-pmo-guide.md`    | Full usage guide for all PMO skills      |
| `docs/pm-pmo-quickref.md` | One-page command quick reference         |

### `docs/pm-pmo-guide.md` structure

1. Overview and philosophy
2. Project start (Phase 1→2): pm-discover, pm-spec
3. Execution (Phase 3): wbs, status, workload, checklist, pm-meeting
4. Reporting (Phase 4): pm-report, Notion/Excel export
5. pmo.yaml field reference
6. Troubleshooting

### `docs/pm-pmo-quickref.md` structure

Single table: "What you want to do → Command → Arguments"

---

## 7. Implementation Sequence

Dependencies determine order:

1. **Data model** — extend pmo.yaml schema (no code, just documentation)
2. **user-pm-discover** — foundation; other skills depend on discovery.md
3. **user-pm-spec** — depends on discovery.md existing
4. **user-pm-meeting** — independent, can be built in parallel with spec
5. **user-pmo-wbs enhancement** — depends on discovery.md format being stable
6. **user-pmo-status enhancement** — depends on decisions.md format being stable
7. **user-pm-report** — depends on pmo.yaml schema + decisions.md format
8. **Documentation** — written in parallel with skill implementation

---

## 8. Risks

| Risk                                          | Likelihood | Impact | Mitigation                                             |
| --------------------------------------------- | ---------- | ------ | ------------------------------------------------------ |
| Notion MCP unavailable or breaking changes    | Medium     | Medium | CSV export as fallback; Notion MCP is optional         |
| pmo.yaml schema change breaks existing skills | Low        | High   | Extend with new fields only; existing fields unchanged |
| user-pm-discover sessions grow too long       | Medium     | Low    | Cap at 15 questions; flag remaining as Open Questions  |
| discovery.md not present when running spec    | Low        | Medium | pm-spec prompts to run pm-discover first               |

---

## 9. Out of Scope

- Figma → spec extraction (future: could parse Figma MCP output into requirements)
- Automated client email/Slack drafts (future: pm-report extension)
- CI/CD or code-level integration (this system is PM-layer only)
- Multi-user / team access to `~/prj/` (single-user only)
