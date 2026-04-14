# DESIGN.md Format

This file is the single source of truth for design rules in a project.
It lives at `./DESIGN.md` in the project root.

## Format

```markdown
---
# Machine-readable tokens (YAML frontmatter)
references: []            # slugs from ~/.claude/design-references/ used as base
context: []               # e.g. [B2B-SaaS, editorial]
tokens:
  colors:
    primary: "#1A1A1A"
    accent: "#3B82F6"
    bg: "#FFFFFF"
    text_secondary: "#6B7280"
  typography:
    font_family: "Noto Sans JP, sans-serif"
    body: "16px"
    h1: "40px"
    h2: "32px"
    h3: "24px"
    line_height_body: "1.75"
    font_weight_body: "400"
    font_weight_heading: "700"
  spacing:
    section: "64px"
    element: "16px"
    tight: "8px"
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
borrow: []                # e.g. [stripe-com/cta-style, notion-so/typography-rhythm]
---

## Tone & Manner

(2–3 sentences describing the overall aesthetic direction and personality)

## Emotional Value

- {Emotion}: {what creates it}
- {Emotion}: {what creates it}

## Functional Value

- {Function}: {how it helps users}
- {Function}: {how it helps users}

## Designer Intent

(2–3 sentences on the philosophy/approach and what the design communicates)

## Why These Choices

(Specific observations connecting visual choices to outcomes)

## Motion

(1–2 sentences describing the site's motion language — sourced from `motion.yaml` `motion_language` field)

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| YYYY-MM-DD | Initial | Created from {source} |
```

## Generation from dotfiles reference

When generating DESIGN.md from a dotfiles reference, pre-fill `tokens` and `grid` from
`~/.claude/design-references/{slug}/tokens.yaml`, pre-fill the prose sections from
`~/.claude/design-references/{slug}/analysis.md`, and pre-fill `## Motion` from
`~/.claude/design-references/{slug}/motion.yaml` (`motion_language` field).

Ask the user:
1. Which reference(s) from `~/.claude/design-references/` to use as base
2. Any project-specific token overrides
3. Context tags for this project

## Generation from Figma

When generating DESIGN.md from Figma:
1. Run `mcp__figma__get_variable_defs` → maps to `tokens` section
2. Run `mcp__figma__get_screenshot` on representative frames
3. Run `mcp__figma__create_design_system_rules` if available
4. Pass screenshots to AI with the analysis prompt from
   `user-cloning-website/references/ai-analysis-prompt.md` for prose sections

## Usage by AI implementers

When `./DESIGN.md` exists in a project, read it fully before any design or implementation work.
It functions as a constraint: all token values, spacing, and grid decisions must match DESIGN.md
unless the user explicitly overrides.

## 3-Layer Architecture (Optional, for long-running projects)

DESIGN.md alone is Layer 1. For multi-month or multi-contributor projects, add Layers 2–3:

| Layer | Content | Purpose |
|-------|---------|---------|
| Layer 1: `DESIGN.md` | Core principles, tokens, prose | AI constraint source — already implemented |
| Layer 2: `contracts/` | Per-component JSON specs | Type-safe component contracts linked to DESIGN.md rules |
| Layer 3: `harness/` | Validation scripts + CI | Automated drift detection |

### Layer 2: contracts/ format

```json
{
  "id": "button",
  "variants": {
    "contained": {
      "tokenRefs": { "bg": "color.primary.500", "radius": "radius.md" },
      "tailwind": "inline-flex items-center justify-center gap-2 h-10 px-4"
    }
  },
  "rules": [
    { "id": "BTN_ICON_ONLY_ARIA_REQUIRED", "severity": "error" },
    { "id": "SPACE_NO_PY_05_BTN", "severity": "error" }
  ]
}
```

Rules reference a shared prohibition registry (not duplicated per contract):

```json
{
  "id": "AI_NO_CARD_COLOR_BAR_TOP",
  "severity": "error",
  "detector": "tailwind-class",
  "pattern": "border-t-4",
  "alternative": "border border-slate-200 only"
}
```

`detector: "tailwind-class"` enables auto-detection (32 rules). Other detectors require manual review.

### Layer 3: harness/ scripts

| Script | Function |
|--------|----------|
| `design:check` | JSON schema compliance, rule ID uniqueness, reference integrity |
| `design:drift` | Detects divergence between contracts and actual implementation files |
| File-write hooks | Scan 32 auto-detectable patterns on every file save |
| CI (GitHub Actions) | Full validation on every PR before merge |

```jsonc
// package.json
"scripts": {
  "design:check": "node harness/check.js",
  "design:drift": "node harness/drift.js"
}
```

**When to add Layer 2–3:** Projects lasting 2+ months, 2+ contributors, or when Visual Diff manual review (Layer 1 Step 8–9) becomes insufficient to catch AI-generated drift.
