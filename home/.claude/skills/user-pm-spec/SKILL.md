---
name: user-pm-spec
description: Read discovery.md and generate a Requirements Spec (RTM) and Design Doc. Triggered by "仕様書作成", "spec", "design doc", or "仕様化". Saves spec.md and design-doc.md to ~/prj/{slug}/.
argument-hint: [slug]
effort: high
---

# PM Spec — Requirements Spec and Design Doc Generation

Read `discovery.md` and produce `spec.md` (RTM) and `design-doc.md` for the project.

## Iron Law

1. Always read `discovery.md` first — never generate spec from memory alone
2. Every requirement in spec.md must trace back to discovery.md (BINDING) or be explicitly flagged as SUPPLEMENTED or PENDING
3. Coverage matrix must show 0 🔴 gaps before declaring done
4. Do not overwrite existing spec.md or design-doc.md without confirming with the user

## Trigger

Use when: `discovery.md` exists and the PM is ready to produce the formal requirements spec and design doc.

Arguments:
- `slug`: project directory slug (e.g. `oo-corporate-renewal`)

## Process

### Step 1 — Resolve slug

If `slug` is provided as an argument, use it directly.

If no slug is given:
- Run: `ls ~/prj/*/pmo.yaml 2>/dev/null`
- If exactly one `pmo.yaml` exists, extract its slug and auto-detect (inform the user which slug was chosen)
- If zero or multiple exist, ask the user: "プロジェクトのスラッグを入力してください（例: oo-corporate-renewal）"

### Step 2 — Check discovery.md

Check if `~/prj/{slug}/discovery.md` exists.

If it does not exist, stop immediately with the message:

> "discovery.md が見つかりません。先に /user-pm-discover を実行してください。"

Set status to `NEEDS_CONTEXT` and exit.

### Step 3 — Guard against overwriting existing files

Check if `~/prj/{slug}/spec.md` or `~/prj/{slug}/design-doc.md` already exists.

If either file exists, ask the user:

> "以下のファイルがすでに存在します:
> {list of existing files}
> 上書きしてよいですか？ (y/n)"

If the user answers n, stop. If the user answers y, proceed.

### Step 4 — Read discovery.md

Read the full contents of `~/prj/{slug}/discovery.md`.

Extract:
- Project name (from the heading)
- Discovery date
- Goals
- Non-Goals
- Requirements (each row: ID, Requirement, Source, Priority)
- Constraints
- Risks (each row: ID, Risk, Probability, Impact, Mitigation)
- Open Questions

If any requirement rows in discovery.md lack ID numbers, auto-assign them as R01, R02, etc. (in the order they appear) before proceeding with classification.

### Step 5 — Classify requirements

For each requirement in discovery.md and any necessary additions, assign a classification:

- `BINDING` — explicitly stated by the client in discovery.md (cite the discovery.md row ID as source)
- `SUPPLEMENTED` — not stated by client but necessary by industry standard or best practice; must cite a specific reason (e.g. "WCAG 2.1 AA準拠が業界標準"). Typical count: 2-3 items. Only add items that are clearly unavoidable given the project type — do not pad.
- `PENDING` — unclear or unconfirmed; needs client clarification; acceptance criteria is `—`

Assign sequential IDs: S-001, S-002, S-003 …

### Step 6 — Build coverage matrix

For every requirement ID in discovery.md (R01, R02, …), map it to a spec row:

- If mapped → show the spec ID and ✅
- If not mapped → show `—` and 🔴 Missing

Count all 🔴 entries. If any 🔴 remain, do not declare done — either add the missing spec rows or explicitly justify exclusion before proceeding. "Justify exclusion" means: add a **Coverage Exceptions** section at the bottom of spec.md that explains why each excluded item is out of scope. Only after that section is written may the item be considered resolved and removed from 🔴.

**Note:** The coverage matrix maps only discovery.md requirement items (R01, R02, …) → spec rows. SUPPLEMENTED rows (industry-standard additions) and PENDING rows appear in the RTM table but are **not** part of the discovery.md coverage check and do not affect the 🔴 gap count.

### Step 7 — Write spec.md

Save to `~/prj/{slug}/spec.md`:

```markdown
# Requirements Spec: {Project Name}

Generated: {YYYY-MM-DD} | Source: discovery.md ({discovery date})

## Coverage Matrix

| Discovery Item | Spec Row | Status |
| -------------- | -------- | ------ |
| R01 | S-001 | ✅ |
| R02 | — | 🔴 Missing |

BINDING: {n} | SUPPLEMENTED: {n} | PENDING: {n}

## Requirements Traceability Matrix

| ID | Requirement | Classification | Source / Reason | Priority | Acceptance Criteria |
| -- | ----------- | -------------- | --------------- | -------- | ------------------- |
| S-001 | ... | BINDING | discovery.md R01 | Must | ... |
| S-002 | ... | SUPPLEMENTED | WCAG 2.1 AA準拠が業界標準 | Should | ... |
| S-003 | ... | PENDING | クライアント未確認 | TBD | — |
```

Rules:
- Priority values: Must / Should / Could / TBD
- PENDING rows always have `TBD` priority and `—` acceptance criteria
- SUPPLEMENTED rows must cite a specific industry standard, regulation, or best practice

### Step 8 — Write design-doc.md

Save to `~/prj/{slug}/design-doc.md` with exactly 10 sections in this order:

```markdown
# Design Doc: {Project Name}

Date: {YYYY-MM-DD} | Status: Draft

## Goals
{From discovery.md Goals — preserve bullet format}

## Non-Goals
{From discovery.md Non-Goals — preserve bullet format}

## Background
{Project context: client, industry, problem — 2-3 sentences drawn from discovery.md. If discovery.md has no explicit background section, synthesize from: client name (from the heading), industry inferred from the project name/goals, and the core problem stated in Goals.}

## User Stories
- As a {persona}, I want to {action} so that {outcome}.
{3-5 user stories derived from BINDING requirements}

## Success Metrics
{From discovery.md Goals — express as KPIs and measurable outcomes where possible}

## Biggest Hypotheses
{Top 2-3 assumptions the project is betting on to achieve its goals}

## Risk / Pre-mortem
| ID | Risk | Probability | Impact | Mitigation |
| -- | ---- | ----------- | ------ | ---------- |
{From discovery.md Risks table — copy all rows. If discovery.md has no risk rows, add a single placeholder row: `| — | No risks identified in discovery | — | — | Conduct risk workshop with client |`}

## Functional Requirements
{Summary of BINDING requirements from spec.md — grouped by feature area, 2-4 groups}

## Alternatives Considered
| Option | Pros | Cons | Decision |
| ------ | ---- | ---- | -------- |
{At least one row — leave blank cells as `—` if no alternatives were evaluated yet}

## Results
*To be filled after project delivery.*
```

### Step 9 — Update pmo.yaml

Check if `~/prj/{slug}/pmo.yaml` exists:

- **If it does not exist**, create a minimal one:

  ```yaml
  project: {Project Name}
  slug: {slug}
  spec_file: spec.md
  design_doc_file: design-doc.md
  ```

- **If it exists**, open it and set `spec_file: spec.md` and `design_doc_file: design-doc.md`. If either field is missing, add it. Leave all other existing fields unchanged.

### Step 10 — Show summary

Print a summary:

```
## Spec Generation Summary

Project: {project name}
Slug: {slug}

Requirements: {total} total
- BINDING: {n}
- SUPPLEMENTED: {n}
- PENDING: {n}

Coverage matrix: {n} items — {n} ✅ mapped, {n} 🔴 missing

Files written:
- ~/prj/{slug}/spec.md
- ~/prj/{slug}/design-doc.md
- ~/prj/{slug}/pmo.yaml (updated)
```

If PENDING items exist, add:

> "以下の要件が不明確です。クライアントに確認後、/user-pm-spec を再実行してください。"
> {list each PENDING item by ID and description}

## Completion Condition

`spec.md` and `design-doc.md` are written, coverage matrix shows 0 🔴 gaps, and pmo.yaml is updated with `spec_file` and `design_doc_file`.

**0 🔴 gaps** means all discovery.md requirement items are mapped to a spec row (or covered by a Coverage Exceptions entry). PENDING spec items do **not** block completion — their presence triggers `DONE_WITH_CONCERNS` status, not `BLOCKED`.

## Status

Add one of the following at the end of every response:

- `## Status: DONE` — spec.md and design-doc.md written, 0 🔴 gaps in coverage matrix
- `## Status: DONE_WITH_CONCERNS` — written, but PENDING items remain (list each PENDING item by ID)
- `## Status: NEEDS_CONTEXT` — slug not found or discovery.md missing (state which)
- `## Status: BLOCKED` — cannot resolve requirements (add reason)
