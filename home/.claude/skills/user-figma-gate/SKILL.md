---
name: user-figma-gate
description: Use when Figma design is complete and coding is about to start, and both an RTM file and a Figma URL are available. Requires Figma MCP. Runs a PASS/FAIL gate: RTM requirement coverage, brand token consistency, accessibility basics, and responsive frame coverage. Outputs BLOCKER/WARNING findings. Not for informal design critique — requires hard requirements in RTM format.
argument-hint: [rtm-file-path] [figma-url]
allowed-tools: Read, Glob, Grep, AskUserQuestion, mcp__figma__get_file, mcp__figma__get_file_nodes
effort: medium
---

# Design Review Gate

Review the completed Figma design against the RTM before coding begins.

## Iron Law

1. FAIL stops the workflow — do not proceed to coding if any BLOCKER is found
2. Every finding must cite the RTM requirement ID or DESIGN.md token it violates
3. Output is a gate report — not suggestions, not preferences

## Process

1. If either argument is missing, ask with AskUserQuestion
2. Read the RTM file — extract all BINDING requirements
3. Use Figma MCP to fetch the Figma file structure:
   - `mcp__figma__get_file` to get all pages and frames
   - `mcp__figma__get_file_nodes` for component details if needed
4. Check DESIGN.md if it exists in the project root (design tokens reference)
5. Run all 5 checks (see below)
6. Output gate report

## Check 1: RTM Coverage

For every BINDING requirement in the RTM:
- Find the corresponding Figma frame or component
- Mark: ✅ Found / ❌ Missing / ⚠️ Partial

A requirement is "found" if there is a frame or component whose name or content clearly corresponds to it.
A requirement is "missing" if no frame/component addresses it.
A requirement is "partial" if the frame exists but key detail is absent (e.g. error state missing).

Severity: Missing BINDING = BLOCKER. Partial = WARNING.

## Check 2: PENDING Resolution

For every PENDING item in the RTM:
- Is it resolved in Figma (design decision made)?
- Or explicitly noted as "deferred to Phase 2" in a Figma annotation?

Unresolved PENDING with no deferral note = WARNING (must confirm with client before coding).

## Check 3: Brand Consistency

If `DESIGN.md` exists:
- Spot-check 3 random frames for color values — do they match DESIGN.md color tokens?
- Spot-check typography — do font families and sizes match the type scale?
- Check spacing — are 8px grid multiples used?

If no `DESIGN.md`: skip this check and note "DESIGN.md not found — brand check skipped."

Severity: Color or type deviation = WARNING.

## Check 4: Accessibility Basics

Check in Figma frames (visually assess from Figma MCP data):
- Text contrast: body text must not be light grey on white background (flag if suspected)
- Focus states: interactive elements (buttons, links, inputs) must have a visible focus variant frame
- Text in images: flag any frame where readable text appears to be embedded in a raster image

Severity: Missing focus states = WARNING. Text in image = WARNING.

## Check 5: Responsive Coverage

For every page in the IA (read from RTM or ask):
- Does a mobile frame (≤375px width) exist?
- Does a desktop frame (≥1280px width) exist?

Missing either = WARNING.

## Output Format

````markdown
# Design Review Gate Report — {project name}
**Date:** {date} | **Figma:** {url} | **RTM:** {path}

## Result: {PASS ✅ | PASS WITH WARNINGS ⚠️ | FAIL ❌}

---

## Check 1: RTM Coverage

| Requirement | RTM ID | Figma Frame | Status |
|---|---|---|---|
| TOPページ Hero | R-001 | TOP/Hero | ✅ Found |
| お問い合わせフォーム | R-012 | — | ❌ Missing |

**Blockers:** {count} | **Warnings:** {count}

---

## Check 2: PENDING Resolution

| PENDING Item | RTM ID | Status |
|---|---|---|
| RECRUITページ有無 | P-003 | ⚠️ Unresolved — confirm with client |

---

## Check 3: Brand Consistency

{findings or "DESIGN.md not found — skipped"}

---

## Check 4: Accessibility

{findings or "No issues found"}

---

## Check 5: Responsive Coverage

| Page | Mobile (≤375px) | Desktop (≥1280px) |
|---|---|---|
| TOP | ✅ | ✅ |
| /about | ❌ Missing | ✅ |

---

## Action Required Before Coding

{numbered list of all BLOCKER and WARNING items}

1. [BLOCKER] Add /contact form design to Figma (R-012)
2. [WARNING] Resolve PENDING: RECRUIT page (P-003) — confirm with client
3. [WARNING] Add mobile frame for /about page
````

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — all checks passed (PASS or PASS WITH WARNINGS)
- `## Status: DONE_WITH_CONCERNS` — PASS WITH WARNINGS — list the warnings
- `## Status: BLOCKED` — FAIL — list the BLOCKERs that must be resolved before coding
- `## Status: NEEDS_CONTEXT` — missing RTM or Figma URL to proceed
