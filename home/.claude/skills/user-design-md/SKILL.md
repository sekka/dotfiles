---
name: user-design-md
description: >
  Manage DESIGN.md files for projects. Use this skill when the user says "create a DESIGN.md",
  "add a design system", "lint DESIGN.md", "update the design tokens", "verify the design file",
  or when starting a new web project that needs brand/style definitions for AI-generated UI.
  Three modes: Init (create from scratch), Lint/Verify (check existing), Update (edit tokens).
disable-model-invocation: false
effort: medium
---

# DESIGN.md Management Skill

## Overview

Create, validate, and update DESIGN.md files — the machine-readable design system specification
that gives Claude Code and other AI agents a persistent understanding of a project's visual identity.

Format: YAML front matter (exact token values) + Markdown prose (rationale and constraints).
CLI: `design.md lint`, `design.md diff`, `design.md export`, `design.md spec`

## Iron Law

1. Always run `design.md lint` after creating or editing DESIGN.md before reporting done
2. Never hardcode hex values in **style definitions** in prose — all colors used in component/style values must be defined as YAML tokens first and referenced as `{colors.name}`. Exception: color label lines in the Colors section (e.g., `**Primary (#2563EB):**`) are documentation and may include hex for human readability.

## Mode Detection

| Trigger | Mode |
|---------|------|
| "create", "init", "新しく作って", no existing DESIGN.md | **Init** |
| "lint", "verify", "check", "確認して" | **Lint/Verify** |
| "update", "change the color", "トークンを変えて" | **Update** |

---

## Mode 1: Init (Create from scratch)

### Step 1: Collect style signals

Ask the user for (or discover from the project):

- Primary brand color (hex)
- Secondary / neutral / text colors — use descriptive token names that match the user's intent (e.g., `neutral`, `text`, `surface`, `accent`). The template shows `secondary` and `neutral` as examples; adapt the names to the actual colors provided.
- Main typeface(s) — body text, headings
- Base spacing unit (typically 4px or 8px)
- Any existing CSS custom properties or Tailwind config to extract from

If a Figma URL is available, run `user-figma-implement` Step 0 first — it generates DESIGN.md
from Figma variable defs. Only use this Init mode when Figma is not available.

### Step 2: Generate the file

Create `./DESIGN.md` in the project root using this minimum structure:

```yaml
---
version: alpha
name: <project-name>
colors:
  primary: "<hex>"
  secondary: "<hex>"
  neutral: "<hex>"
typography:
  body-md:
    fontFamily: <font-name>
    fontSize: 1rem
  heading-lg:
    fontFamily: <font-name>
    fontSize: 2rem
spacing:
  sm: 8px
  md: 16px
  lg: 32px
---
## Overview

<One paragraph: the visual personality and brand intent>

## Colors

- **Primary (<hex>):** <When to use>
- **Secondary (<hex>):** <When to use>
- **Neutral (<hex>):** <When to use>

## Typography

- **body-md:** <Font name> — default body copy
- **heading-lg:** <Font name> — page and section headings

## Do's and Don'ts

- Do use `primary` for all interactive elements (buttons, links)
- Do use `neutral` as the page background
- Don't use more than 2 typefaces
- Don't add color tokens outside of the YAML front matter
```

Expand with `components`, `rounded`, or `elevation` sections only when the project has 3+
distinct component types that need visual specification.

### Step 3: Lint and fix

```bash
~/.local/share/mise/shims/design.md lint ./DESIGN.md
```

Read the JSON output. Fix all `"severity": "error"` findings before continuing.
For `"severity": "warning"` with `contrast-ratio`, suggest an alternative color to the user.

### Step 4: Propose CLAUDE.md addition

If the project has a CLAUDE.md, propose appending:

```
UIを実装するときは必ず @DESIGN.md を参照してスタイルを適用すること
```

---

## Mode 2: Lint/Verify (Check existing)

### Step 1: Run lint

```bash
~/.local/share/mise/shims/design.md lint ./DESIGN.md
```

### Step 2: Interpret output

Parse the JSON `findings` array:

| Severity | Action |
|----------|--------|
| `error` | Must fix before any UI implementation. Fix and re-run. |
| `warning: contrast-ratio` | Report the component name, current ratio, and WCAG AA minimum (4.5:1). Suggest a darker/lighter alternative. |
| `warning: orphaned-tokens` | Report which tokens are defined but unused. Ask user if they want to remove or add component references. |
| `info` | Report as-is. No action required. |

### Step 3: Report in human language

Summarise findings in plain language, grouped by severity. Example:

> **1 error:** `components.button-primary` references `{colors.accent}` which is not defined.
> **1 warning:** `button-secondary` text (#ffffff) on background (#4A90E2) has contrast ratio 3.1:1 — fails WCAG AA. Suggest darkening background to #2C5F9E (ratio 4.6:1).

---

## Mode 3: Update (Edit existing tokens)

### Step 1: Clarify the change

Ask: what token(s) are changing and why? (New brand color, new component, spacing adjustment, etc.)

### Step 2: Back up and edit

```bash
cp ./DESIGN.md ./DESIGN.md.bak
```

Apply the requested edits to `./DESIGN.md`. If a color token's hex value changes, also update the corresponding Colors section label in the prose (e.g., `**Primary (#old):**` → `**Primary (#new):**`) to keep documentation consistent.

### Step 3: Diff and check for regressions

```bash
~/.local/share/mise/shims/design.md diff ./DESIGN.md.bak ./DESIGN.md
```

If `"regression": true` in the output, report which tokens degraded and confirm with the user
before keeping the change.

### Step 4: Lint and clean up

```bash
~/.local/share/mise/shims/design.md lint ./DESIGN.md && rm -f ./DESIGN.md.bak
```

Only delete the backup after a clean lint.

---

## Status

Add one of the following at the end of every response:

- `## Status: DONE` — DESIGN.md created/verified/updated and lint passes with 0 errors
- `## Status: DONE_WITH_CONCERNS` — Done, but warnings remain (list them)
- `## Status: BLOCKED` — lint errors that cannot be resolved without user input
- `## Status: NEEDS_CONTEXT` — missing brand information needed to generate DESIGN.md
