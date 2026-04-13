# Design Intelligence System — Spec

**Date:** 2026-04-13
**Status:** Approved
**Scope:** Improve existing skills only — no new skills created

---

## Problem

AI design instructions are inconsistent across sessions, leading to inconsistent output and
expensive correction cycles. There is no single source of truth for design rules, no
accumulated reference library, and no feedback loop to improve precision over time.

---

## Solution Overview

Improve two existing skills to form a self-improving Design Intelligence loop:

```
Reference site analysis → dotfiles library → DESIGN.md → Figma implementation
       ↑                                                          ↓
       └──────────── Visual diff → DESIGN.md update ────────────┘
```

**Files changed:**

- `home/.claude/skills/user-cloning-website/SKILL.md` — major revision (Phase 1 + 2)
- `home/.claude/skills/user-working-with-figma/SKILL.md` — revision (Phase 3)
- `home/.claude/skills/user-working-with-figma/IMPLEMENTING.md` — revision (Phase 3)

No new skill files. No new mise tasks.

---

## Data Architecture

### Storage locations

| Location                              | Purpose                             |
| ------------------------------------- | ----------------------------------- |
| `~/.claude/design-references/{slug}/` | Shared reference library (dotfiles) |
| `./DESIGN.md`                         | Project-specific design rules       |

### Reference library structure

```
~/.claude/design-references/
  {site-slug}/
    metadata.yaml       # DNA, context tags, borrow tags, date, overall score
    tokens.yaml         # colors, typography, spacing, grid
    evaluation.yaml     # 7-axis scores with qualitative notes
    analysis.md         # tone/manner, emotional value, functional value, designer intent
    motion.yaml         # animation language analysis
    components/
      {name}.yaml       # per-component score + qualitative notes
      {name}.png        # component screenshot
    screenshots/
      full-page.png
      hero.png
      (others as found)
```

### DESIGN.md format (project-level)

```markdown
---
# YAML frontmatter — machine-readable
references: [stripe, notion]
context: [B2B-SaaS]
tokens:
  colors:
    primary: "#1A1A1A"
    accent: "#3B82F6"
    bg: "#FFFFFF"
  typography:
    font: "Noto Sans JP"
    body: "16px"
    h1: "32px"
  spacing:
    section: "64px"
    element: "16px"
  border_radius: "8px"
grid:
  columns: 12
  gutter: "24px"
  margin: "80px"
  max_width: "1280px"
  breakpoints:
    sm: "640px"
    md: "768px"
    lg: "1024px"
    xl: "1280px"
borrow:
  - stripe/cta-style
  - notion/typography-rhythm
---

## Tone & Manner

(prose — the overall aesthetic direction)

## Emotional Value

- Trust: ...
- Calm: ...

## Functional Value

- Visual hierarchy: ...
- CTA clarity: ...

## Designer Intent

(prose — what the designer/client was trying to communicate)

## Why These Choices

(prose — rationale for specific token decisions)
```

### evaluation.yaml format

```yaml
site: example.com
date: 2026-04-13
dna: "余白主義 × モノトーン × タイポ主役 × CTAミニマル"
context: [B2B-SaaS]
borrow: []
overall: 9.2
dimensions:
  visual_hierarchy:
    score: 9
    excellent: "..."
    weak: "..."
  typography:
    score: 9
    excellent: "..."
    weak: "..."
  color_system:
    score: 8
    excellent: "..."
    weak: "..."
  spacing_rhythm:
    score: 9
    excellent: "..."
    weak: "..."
  grid:
    score: 9
    excellent: "..."
    weak: "..."
  emotional_impact:
    score: 9
    excellent: "..."
    weak: "..."
  functional_clarity:
    score: 9
    excellent: "..."
    weak: "..."
```

### 7-axis evaluation model

| Axis               | Quantitative                           | Qualitative             |
| ------------------ | -------------------------------------- | ----------------------- |
| Visual Hierarchy   | Eye flow clarity (1–10)                | Excellent / weak points |
| Typography         | Readability + scale consistency (1–10) | Excellent / weak points |
| Color System       | Contrast + harmony (1–10)              | Excellent / weak points |
| Spacing / Rhythm   | Whitespace consistency (1–10)          | Excellent / weak points |
| Grid               | Column rhythm + density (1–10)         | Excellent / weak points |
| Emotional Impact   | Match to intended feeling (1–10)       | Excellent / weak points |
| Functional Clarity | CTA + nav clarity (1–10)               | Excellent / weak points |

---

## Phase 1 — user-cloning-website: Core AI Analysis

**Goal:** Complete reference library accumulation. Usable immediately after this phase.

### New steps added to existing flow

After existing Steps 1–5 (open, screenshot, token extraction, component screenshots, animation):

**Step 4b — Grid extraction (new JS eval)**

Extract via JS:

- Column count (inferred from common grid containers)
- Gutter width
- Horizontal margin
- Max-width
- Breakpoints from `@media` rules in stylesheets

**Step 5b — AI integrated analysis**

Pass to AI: full-page screenshot + component screenshots + extracted tokens + DOM structure summary.

AI generates for `analysis.md`:

- **Tone & Manner** — aesthetic direction in prose
- **Emotional Value** — what feelings it successfully creates, and how
- **Functional Value** — how the design helps users accomplish goals
- **Designer Intent** — inferred philosophy/approach of the designer
- **Why This Works** — specific observations tying visual choices to outcomes

**Step 5c — 7-axis evaluation**

AI scores each axis 1–10 and provides:

- `excellent`: what the design does well on this axis
- `weak`: where it falls short (or "-" if none)
- Overall score = average

**Step 5d — Component-level evaluation**

For each captured component (nav, hero, card, footer, etc.):

- Score on relevant axes
- One-line qualitative note
- Save as `components/{name}.yaml`

**Step 5e — Metadata generation**

AI generates draft, user confirms:

- `dna`: one-line design fingerprint (e.g. "余白主義 × モノクロ × タイポ主役")
- `context`: usage context tags (e.g. `[B2B-SaaS, editorial]`)
- `borrow`: patterns worth borrowing, cited by axis (e.g. `[this-site/cta-style]`)

**Step 5f — Save to dotfiles**

Save all outputs to `~/.claude/design-references/{slug}/`.
Slug = domain name with dots replaced by hyphens (e.g. `stripe-com`).

**Optional Step — About page analysis**

If user provides an About/Press page URL:

- Fetch and extract stated brand values
- Cross-reference with visual analysis
- Add "Brand Alignment" note to `analysis.md`

---

## Phase 2 — DESIGN.md Generation

**Goal:** Establish DESIGN.md as the single source of truth. Solves the "inconsistent AI instructions" problem.

### Added to user-cloning-website

After Phase 1 analysis, offer to generate `./DESIGN.md`:

1. Ask which reference(s) to use as the base
2. Ask for any project-specific overrides
3. Generate DESIGN.md in the standard format (YAML frontmatter + prose sections)
4. Save to project root

### Added to user-working-with-figma

Add Step 0 — DESIGN.md generation from Figma:

1. Run `mcp__figma__get_variable_defs` to extract design tokens
2. Run `mcp__figma__get_screenshot` on key frames
3. AI generates DESIGN.md prose sections from visual analysis
4. Save `./DESIGN.md` if not already present

---

## Phase 3 — user-working-with-figma: Visual Diff + Loop

**Goal:** Close the feedback loop. Precision improves with each iteration.

### Step 0 (new) — DESIGN.md bootstrap + read

1. Check if `./DESIGN.md` exists
2. If missing: offer to generate it (using Phase 2 flow — from Figma variables + screenshot analysis)
3. Read `./DESIGN.md` and include its full content in context before any Figma MCP calls or code generation

### After implementation (new steps)

**Step 7 — Visual Diff**

1. Take browser screenshot of implemented component
2. Take Figma screenshot of the same frame
3. Pass both to AI for side-by-side analysis
4. AI scores the gap on each of the 7 axes
5. Output: diff report with per-axis delta (e.g. `spacing: -2, typography: 0`)

**Step 8 — DESIGN.md gap proposals**

For each axis with a significant gap (delta ≤ -1 on the 1–10 scale):

- AI proposes a specific DESIGN.md update that would prevent this gap
- Example: "spacing_rhythm gap detected → suggest updating `spacing.section` from 64px to 56px"

**Step 9 — DESIGN.md auto-update**

User reviews proposals. On approval:

- Update `./DESIGN.md` with the accepted changes
- Log the change in a `## Changelog` section at the bottom of DESIGN.md

**Optional — Reverse analysis mode**

User can pass their own implemented page URL instead of a Figma URL.
Same 7-axis analysis runs, saves to `~/.claude/design-references/self/{project-slug}/`.
Enables "self design DNA" tracking over time.

---

## Risks

| Risk                                                              | Mitigation                                                                                | Status   |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------- |
| AI visual analysis quality varies                                 | Use both screenshot + DOM context (approach B); treat output as draft for user to confirm | Accepted |
| dotfiles reference library grows large                            | Slug-based directory structure keeps it clean; no index file needed                       | Accepted |
| Figma visual diff is approximate (screenshots, not pixel-perfect) | Frame as "directional feedback" not exact measurement; useful enough for loop             | Accepted |

---

## Out of Scope

- Automated CI/validation harness (mise tasks) — too heavy for personal use
- Multi-user or team sharing of design references
- Figma plugin or browser extension

---

## Success Criteria

- Phase 1: Run cloning-website on a site → `~/.claude/design-references/{slug}/` populated with DNA, scores, analysis prose
- Phase 2: DESIGN.md exists in a project → AI implements Figma designs without being told "make it consistent"
- Phase 3: After implementation → diff report generated → DESIGN.md updated → next implementation is more accurate
