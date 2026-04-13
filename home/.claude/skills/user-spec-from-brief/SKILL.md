---
name: user-spec-from-brief
description: Convert a client brief into a requirements spec with explicit provenance for every item. Also works as an audit tool to check an existing RTM against the original brief and improve accuracy. Covers extraction, classification, gap research, coverage check, and RTM formatting.
---

# Client Brief → Spec (Requirements Traceability) Skill

## Two Modes

### Mode A — New RTM (新規作成)
Use when: Starting a project spec from scratch.
Input: client brief document.
Output: RTM with BINDING/SUPPLEMENTED/PENDING for every item + coverage matrix.

### Mode B — RTM Audit (既存RTM監査・精度向上)
Use when: An RTM already exists but you want to verify it against the brief, add missing line numbers, improve SUPPLEMENTED research basis, or check coverage drift.
Input: client brief + existing RTM.
Output: Gap report + corrected RTM rows + updated coverage matrix.

**Mode B checklist:**
1. Re-run the coverage matrix against the current brief → find unmapped leaves
2. For each existing BINDING row: verify line number is cited and correct
3. For each existing SUPPLEMENTED row: verify research basis is specific (not "業界標準" alone)
4. For each existing PENDING row: verify the client's own uncertainty text is quoted
5. Flag CANCELLED items that are missing from the RTM
6. Update the coverage % and flag any rows in RTM that can't be traced to a brief line (= scope creep)

---

Use this skill when:
- Starting a new project spec from client instructions (Mode A)
- Auditing whether a spec faithfully reflects a client brief (Mode B)
- Adding provenance annotations to existing spec documents (Mode B)
- Checking whether a spec has drifted from the original brief over time (Mode B)

---

## Core Principle

**Every spec item must trace back to one of three sources:**

| Status | Symbol | Meaning | Required Citation |
|--------|--------|---------|-------------------|
| Client stated explicitly | ✅ BINDING | Non-negotiable. Change only if client revises brief. | Brief line number + quote |
| Client is silent; filled by research | 🔵 SUPPLEMENTED | Changeable. Must document what research said and why. | Research source + key finding + decision rationale |
| Client flagged as uncertain | 🟡 PENDING | Block design on this until client answers. | Brief line number + client's own "確認中/TBD" text |
| Client cancelled (strikethrough) | ~~CANCELLED~~ | Record it existed and was cancelled. Do not implement. | Brief line number |

**Never invent a requirement without either a brief citation or a research basis.**

---

## Step 1 — Extract Leaf Requirements from Brief

Read the brief completely. Extract **every leaf-level item** — the most specific bullet, not the parent heading.

**Example:**

```
Brief:
  CHARACTERS
    メカ場面写
      主人公のみ        ← leaf #1
      1〜2枚           ← leaf #2
      クリックで拡大    ← leaf #3
```

Each leaf becomes one RTM row. Record the source line number.

**Rules:**
- Strikethrough text (~~like this~~) = CANCELLED requirement. Still record it.
- "確認中" / "未定" / "問い合わせ中" = PENDING. Copy the client's own words.
- Ambiguous parents without leaves = still a BINDING requirement (e.g., "INTRODUCTION" alone means "include this section").

---

## Step 2 — Identify Gaps

After extraction, find what the brief is **silent** about that you still need to decide:
- Page-level UX patterns (e.g., single-page scroll vs sub-pages)
- Navigation and discovery patterns (e.g., search, filters)
- Information hierarchy (e.g., card layout, sort order)
- Standard elements not mentioned (e.g., footer, breadcrumbs, error states)

These gaps become candidates for 🔵 SUPPLEMENTED items.

---

## Step 3 — Research Gaps

For each gap, investigate using:
1. **Reference sites** — actual published sites in the same domain. Record: site name, URL, specific feature observed.
2. **Industry standards** — common patterns for the genre (e.g., anime official sites always have ON AIR section).
3. **Client's reference URLs** — if client provided links in the brief, treat observed patterns there as strong signals.

**Document the research, not just the conclusion.** Bad: `"業界標準"`. Good: `"Tier A 5サイト中4サイトがNEWSにカテゴリフィルタなし（フリーレン・ダンダダン・ブルーロック・炎炎）"`

---

## Step 4 — Coverage Check (定量化)

Create a coverage matrix to verify every brief leaf maps to an RTM row.

### Method

1. **Count brief leaves** — list every leaf extracted in Step 1 with its line number. Call this N_brief.
2. **Count RTM rows** — count rows with ✅ BINDING status. Call this N_rtm.
3. **Map** — for each brief leaf, write the RTM row ID it maps to (or "GAP" if missing).
4. **Coverage = N_mapped / N_brief × 100%**

### Coverage Matrix Format

```markdown
## Coverage Matrix

| Brief Line | Brief Text | RTM Row | Status |
|-----------|-----------|---------|--------|
| L15 | ビジュアル | TOP-01 | ✅ Mapped |
| L36 | メカ場面写 > 主人公のみ | CHAR-06 | ✅ Mapped |
| L278 | カイリ メカモード切り替え | — | ❌ GAP |
```

**Target**: 100% coverage of BINDING + PENDING leaves.
CANCELLED leaves must appear in the matrix but marked ~~CANCELLED~~.

### Gap Resolution

For any GAP:
- Either add the missing row to the RTM, or
- Document why it was intentionally deferred (with reason).
- Never silently drop a brief leaf.

---

## Step 5 — RTM Format

The Requirements Traceability Matrix has 4 columns:

| 要件 | ソース | ステータス | 現在の対応 |
|------|--------|-----------|-----------|

### Column: ソース

**For BINDING**: `指示書 L{n}（"{exact quote}"）`
Example: `指示書 L36（"主人公のみ"）`

**For SUPPLEMENTED**: `🔵 {Research source}: {key finding}`
Example: `🔵 参考調査: Tier A 5サイト中4サイトがNEWSフィルタなし（フリーレン/ダンダダン/ブルーロック/炎炎）`

**For PENDING**: `指示書 L{n}（"{client's own uncertainty text}"）`
Example: `指示書 L24（"INTRODUCTIONの違いについて確認中"）`

**For SUPPLEMENTED, also record in a separate table:**

```markdown
## Supplemented Items (Layer 2 Sources)

| ID | Item | Gap | Research Basis | Decision | Decision Log |
|----|------|-----|---------------|----------|-------------|
| S-1 | NEWSフィルタなし | 指示書はフィルタ有無を未記載 | Tier A 5サイト中4サイトがフィルタなし | フィルタなし | B-5 |
```

---

## Step 6 — Validate Spec Against Brief (Adversarial Review)

After creating the RTM, verify in reverse: read each brief leaf and confirm it maps to an RTM row.
Do NOT rely on memory. Read the brief line by line.

Questions to answer:
- Does every leaf requirement appear in the RTM?
- Does every PENDING item have a clear blocking question?
- Does every CANCELLED item appear with a ~~strikethrough~~ annotation explaining the cancellation?
- Is the ソース column specific enough that someone unfamiliar with the project could trace it?

---

## Step 7 — Maintenance Rules

**When the client updates the brief:**
1. Re-run Steps 1–4 on the changed sections.
2. If a BINDING item is revised, update the RTM and note the revision in the decision log.
3. If a new item is added, add it as BINDING and update the coverage matrix.
4. Never update the RTM without updating the coverage matrix.

**When a SUPPLEMENTED decision is challenged:**
1. Check if the brief has since been updated.
2. Re-evaluate the research basis.
3. If overriding, note why in the decision log.

---

## Document Hierarchy Rule

The authority chain must be explicitly stated at the top of every spec document:

```
Layer 1 (Non-negotiable): Client brief
Layer 2 (Gap fill): Reference site research + industry standards
Layer 3 (Interpretation): Spec documents (RTM, wireframes, functional spec)
Layer 4 (Implementation): Design tool (Figma, etc.)

If Layer 3/4 contradicts Layer 1 → fix Layer 3/4, never Layer 1.
If Layer 1 is silent → Layer 2 applies.
```

---

## Anti-Patterns

| Anti-pattern | Why it's wrong | Fix |
|-------------|---------------|-----|
| "業界標準" without citing which sites | Unverifiable. Future team can't check. | Name the specific sites and what you found. |
| Figma as a source of truth | Figma is Layer 4. It implements decisions; it doesn't make them. | Trace back to brief or research. |
| Marking brief content as PENDING | If the brief says it, it's BINDING even if the detail is vague. | Use PENDING only for items where the client explicitly noted uncertainty. |
| Dropping a brief leaf without documentation | Creates invisible gaps. | Add it to RTM with CANCELLED or document why deferred. |
| Counting summary headings as single requirements | Obscures individual requirement completeness. | Always extract leaf-level items. |

---

## Output Files

| File | Purpose |
|------|---------|
| `plans/00-master-requirements.md` | RTM — primary output |
| `plans/05-decision-log.md` | Decision log for SUPPLEMENTED choices |
| `coverage-matrix.md` (or section in RTM) | Brief leaf → RTM row mapping table |

## Status: DONE
