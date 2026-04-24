# DESIGN.md Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate `@google/design.md` CLI and DESIGN.md authoring workflows into the dotfiles harness so that AI-generated UI is consistently on-brand across personal and client projects.

**Architecture:** Install the CLI via mise globally, create a `user-design-md` skill for init/lint/update flows, add a conditional `design.md lint` gate to the lint pipeline, update `user-figma-implement` and `user-fe-develop` to reference DESIGN.md, and add an auto-loaded rule so Claude checks for DESIGN.md before any UI work.

**Tech Stack:** `@google/design.md` 0.1.0 (alpha), mise npm backend, TypeScript/Bun, Claude Code skills (Markdown)

---

## File Map

| File                                                | Action                  | Responsibility                                   |
| --------------------------------------------------- | ----------------------- | ------------------------------------------------ |
| `home/config/mise/config.toml`                      | Modify (line ~549)      | Global tool install                              |
| `home/.claude/rules/design-md.md`                   | Create                  | Auto-loaded rule: when/how to use DESIGN.md      |
| `home/.claude/skills/user-design-md/SKILL.md`       | Create                  | init / lint / update skill                       |
| `scripts/development/lint-format.ts`                | Modify (~430–485)       | Conditional `design.md lint` in `processFiles()` |
| `home/.claude/skills/user-figma-implement/SKILL.md` | Modify (Step 0 section) | Add lint step to existing DESIGN.md bootstrap    |
| `home/.claude/skills/user-fe-develop/SKILL.md`      | Modify (Step 1 area)    | Add DESIGN.md token-reference guidance           |

---

## Task 1: Add `@google/design.md` to mise global tools

**Files:**

- Modify: `home/config/mise/config.toml` (around line 549, `# --- AI/LLM CLI ---` section)

- [ ] **Step 1: Add tool entry after `@openai/codex`**

  Open `home/config/mise/config.toml`. After line 550 (`"npm:@openai/codex" = "latest"`), add:

  ```toml
  "npm:@google/design.md" = "latest" # DESIGN.md CLI: lint/diff/export/spec  https://github.com/google-labs-code/design.md
  ```

- [ ] **Step 2: Install and verify**

  ```bash
  mise install npm:@google/design.md
  design.md --version
  ```

  Expected: version string printed (e.g. `0.1.0`)

- [ ] **Step 3: Smoke-test lint on a temp file**

  ```bash
  cat > /tmp/test-design.md << 'EOF'
  ---
  version: alpha
  name: Test
  colors:
    primary: "#1A1C1E"
    neutral: "#F7F5F2"
  typography:
    body-md:
      fontFamily: Inter
      fontSize: 1rem
  spacing:
    sm: 8px
    md: 16px
  ---
  ## Overview
  Test design.
  ## Colors
  Primary and neutral.
  ## Typography
  Body uses Inter.
  ## Do's and Don'ts
  - Do use primary for CTAs.
  EOF
  design.md lint /tmp/test-design.md
  ```

  Expected: JSON output with `"errors": 0`

- [ ] **Step 4: Commit**

  ```bash
  git add home/config/mise/config.toml
  git commit -m "chore: @google/design.md CLIをmiseグローバルツールに追加"
  ```

---

## Task 2: Create `rules/design-md.md`

**Files:**

- Create: `home/.claude/rules/design-md.md`

- [ ] **Step 1: Create the rule file**

  Create `home/.claude/rules/design-md.md` with the following content:

  ```markdown
  # DESIGN.md Usage Rules

  ## When to check for DESIGN.md

  - Before implementing any UI component or page layout
  - Before writing CSS, Tailwind classes, or inline styles
  - When generating color values, spacing, or typography

  ## When to run `design.md lint`

  - After creating or editing DESIGN.md
  - Before running `user-figma-implement` or `user-fe-develop`
  - Automatically via lint-format pipeline when DESIGN.md exists

  ## DESIGN.md authoring rules

  - All color values must be defined as YAML tokens; do not hardcode hex in prose sections
  - Do not add a `components` section for fewer than 3 distinct components (YAGNI)
  - Keep Do's and Don'ts to 5 items max
  - Always set `version: alpha` until the spec exits alpha status
  - Token references in component definitions use `{colors.primary}` syntax, not raw hex

  ## CLAUDE.md one-liner (add to each project)

  When a DESIGN.md exists in a project, propose adding this line to the project's CLAUDE.md:

  > UIを実装するときは必ず @DESIGN.md を参照してスタイルを適用すること
  ```

- [ ] **Step 2: Verify the file is readable**

  ```bash
  cat home/.claude/rules/design-md.md
  ```

  Expected: file contents print without error

- [ ] **Step 3: Commit**

  ```bash
  git add home/.claude/rules/design-md.md
  git commit -m "docs: DESIGN.md利用ルールをrules/に追加"
  ```

---

## Task 3: Create `user-design-md` skill

**Files:**

- Create: `home/.claude/skills/user-design-md/SKILL.md`

- [ ] **Step 1: Create the skill directory and SKILL.md**

  ```bash
  mkdir -p home/.claude/skills/user-design-md
  ```

  Create `home/.claude/skills/user-design-md/SKILL.md`:

  ````markdown
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
  2. Never hardcode hex values in prose — all colors must be defined as YAML tokens first

  ## Mode Detection

  | Trigger                                                 | Mode            |
  | ------------------------------------------------------- | --------------- |
  | "create", "init", "新しく作って", no existing DESIGN.md | **Init**        |
  | "lint", "verify", "check", "確認して"                   | **Lint/Verify** |
  | "update", "change the color", "トークンを変えて"        | **Update**      |

  ---

  ## Mode 1: Init (Create from scratch)

  ### Step 1: Collect style signals

  Ask the user for (or discover from the project):

  - Primary brand color (hex)
  - Secondary / neutral colors
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
  design.md lint ./DESIGN.md
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
  design.md lint ./DESIGN.md
  ```

  ### Step 2: Interpret output

  Parse the JSON `findings` array:

  | Severity                   | Action                                                                                                       |
  | -------------------------- | ------------------------------------------------------------------------------------------------------------ |
  | `error`                    | Must fix before any UI implementation. Fix and re-run.                                                       |
  | `warning: contrast-ratio`  | Report the component name, current ratio, and WCAG AA minimum (4.5:1). Suggest a darker/lighter alternative. |
  | `warning: orphaned-tokens` | Report which tokens are defined but unused. Ask user if they want to remove or add component references.     |
  | `info`                     | Report as-is. No action required.                                                                            |

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

  Apply the requested edits to `./DESIGN.md`.

  ### Step 3: Diff and check for regressions

  ```bash
  design.md diff ./DESIGN.md.bak ./DESIGN.md
  ```

  If `"regression": true` in the output, report which tokens degraded and confirm with the user
  before keeping the change.

  ### Step 4: Lint and clean up

  ```bash
  design.md lint ./DESIGN.md && rm ./DESIGN.md.bak
  ```

  Only delete the backup after a clean lint.

  ---

  ## Status

  Add one of the following at the end of every response:

  - `## Status: DONE` — DESIGN.md created/verified/updated and lint passes with 0 errors
  - `## Status: DONE_WITH_CONCERNS` — Done, but warnings remain (list them)
  - `## Status: BLOCKED` — lint errors that cannot be resolved without user input
  - `## Status: NEEDS_CONTEXT` — missing brand information needed to generate DESIGN.md
  ````

- [ ] **Step 2: Verify the file exists**

  ```bash
  head -10 home/.claude/skills/user-design-md/SKILL.md
  ```

  Expected: frontmatter with `name: user-design-md`

- [ ] **Step 3: Commit**

  ```bash
  git add home/.claude/skills/user-design-md/SKILL.md
  git commit -m "feat: user-design-md スキルを追加（init/lint/update）"
  ```

---

## Task 4: Add conditional `design.md lint` to `lint-format.ts`

**Files:**

- Modify: `scripts/development/lint-format.ts` (add function after line ~295, add call in `processFiles()` around line ~468)

- [ ] **Step 1: Add `runDesignMdLint` function**

  In `scripts/development/lint-format.ts`, add the following function after the `runShellcheck` function (around line 295):

  ```typescript
  async function runDesignMdLint(verbose: boolean): Promise<LintResult | null> {
    if (!existsSync("DESIGN.md")) return null;

    if (verbose) console.log("🔧 Running: design.md lint DESIGN.md");

    const result = await runCommand(["design.md", "lint", "DESIGN.md"], verbose);
    return {
      tool: "design.md",
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.stderr || undefined,
    };
  }
  ```

- [ ] **Step 2: Call it from `processFiles()`**

  In `processFiles()` (around line 468, just before the results output loop), add:

  ```typescript
  // DESIGN.md lint — project-level check (全ファイルモードのみ)
  if (!options.file && !options.staged) {
    const designMdResult = await runDesignMdLint(options.verbose);
    if (designMdResult) results.push(designMdResult);
  }
  ```

- [ ] **Step 3: Verify TypeScript compiles**

  ```bash
  bun run --bun tsc --noEmit
  ```

  Expected: no errors

- [ ] **Step 4: Test without DESIGN.md (should be silent)**

  ```bash
  # From a directory without DESIGN.md:
  bun scripts/development/lint-format.ts --mode=check --verbose 2>&1 | grep -i design
  ```

  Expected: no `design.md` line in output (skipped silently)

- [ ] **Step 5: Test with a valid DESIGN.md (should pass)**

  ```bash
  cp /tmp/test-design.md ./DESIGN.md
  bun scripts/development/lint-format.ts --mode=check --verbose 2>&1 | grep -E "design|✅|ERROR"
  rm ./DESIGN.md
  ```

  Expected: `✅ design.md passed`

- [ ] **Step 6: Commit**

  ```bash
  git add scripts/development/lint-format.ts
  git commit -m "feat: lint-formatパイプラインにdesign.md lintを条件付き追加"
  ```

---

## Task 5: Add lint step to `user-figma-implement/SKILL.md`

**Files:**

- Modify: `home/.claude/skills/user-figma-implement/SKILL.md` (Step 0 section)

The existing Step 0 already handles DESIGN.md generation from Figma. Add a lint gate after the existing read step.

- [ ] **Step 1: Locate the insertion point**

  ```bash
  grep -n "Step 0\|design.md lint\|Read.*DESIGN" home/.claude/skills/user-figma-implement/SKILL.md | head -20
  ```

  Find the end of the "Read `./DESIGN.md` fully" paragraph (the last bullet under step 2 or 3 of Step 0).

- [ ] **Step 2: Add lint gate after the read step**

  After the paragraph that says "Read `./DESIGN.md` fully and treat its contents as hard constraints", add:

  ````markdown
  ### Step 0c: Lint Gate

  After reading DESIGN.md, run:

  ```bash
  design.md lint ./DESIGN.md
  ```
  ````

  - **Errors (`"severity": "error"`):** Fix before proceeding. Broken token references in components
    will cause AI to hallucinate values.
  - **Warnings (`contrast-ratio`):** Report to user but do not block. Note the failing component
    names so the user can decide.
  - **If DESIGN.md does not exist and Figma is unavailable:** Offer `user-design-md` init mode
    (skippable — the user can proceed without a DESIGN.md).
  ```
  ```

- [ ] **Step 3: Verify the file**

  ```bash
  grep -A 12 "Step 0c" home/.claude/skills/user-figma-implement/SKILL.md
  ```

  Expected: the new section prints correctly

- [ ] **Step 4: Commit**

  ```bash
  git add home/.claude/skills/user-figma-implement/SKILL.md
  git commit -m "feat: user-figma-implementにdesign.md lintゲートを追加（Step 0c）"
  ```

---

## Task 6: Add DESIGN.md token-reference guidance to `user-fe-develop/SKILL.md`

**Files:**

- Modify: `home/.claude/skills/user-fe-develop/SKILL.md` (Step 1 section)

- [ ] **Step 1: Locate the insertion point**

  ```bash
  grep -n "Step 1\|Step 2\|Project Setup\|Framework" home/.claude/skills/user-fe-develop/SKILL.md | head -10
  ```

  Find the end of the "Step 1: Project Setup" section, just before "Step 2: TypeScript Type Design".

- [ ] **Step 2: Add the DESIGN.md check block**

  At the end of Step 1 (Project Setup), add:

  ````markdown
  #### DESIGN.md Check

  Before writing any component styles, check for a DESIGN.md in the project root:

  ```bash
  # Check if it exists
  ls ./DESIGN.md 2>/dev/null && design.md lint ./DESIGN.md || echo "No DESIGN.md found"
  ```
  ````

  **If DESIGN.md exists:**
  - Read the YAML front matter to get token names for colors, spacing, and typography
  - Do not hardcode new style values (hex, px, font names) that aren't in DESIGN.md; add them to
    DESIGN.md first, then reference the token
  - In component code, prefer CSS custom properties derived from tokens over inline values:
    ```css
    /* ✅ preferred */
    background-color: var(--color-primary);

    /* ❌ avoid */
    background-color: #1A1C1E;
    ```
  - If a Tailwind config exists, check whether DESIGN.md tokens are already exported to it via
    `design.md export --format tailwind DESIGN.md`

  **If DESIGN.md does not exist:** proceed normally. Offer to create one with `user-design-md`
  if the project has 3+ pages or reusable component patterns.
  ```
  ```

- [ ] **Step 3: Verify the file**

  ```bash
  grep -A 20 "DESIGN.md Check" home/.claude/skills/user-fe-develop/SKILL.md | head -25
  ```

  Expected: the new section prints correctly

- [ ] **Step 4: Commit**

  ```bash
  git add home/.claude/skills/user-fe-develop/SKILL.md
  git commit -m "feat: user-fe-developにDESIGN.mdトークン参照ガイダンスを追加"
  ```

---

## Verification Checklist

After all 6 tasks, verify the full integration:

- [ ] `design.md --version` prints without error
- [ ] `bun scripts/development/lint-format.ts --mode=check --verbose` with a valid `DESIGN.md` in
      cwd shows `✅ design.md passed`
- [ ] `bun scripts/development/lint-format.ts --mode=check --verbose` without `DESIGN.md` shows no
      design.md output (silently skipped)
- [ ] `home/.claude/rules/design-md.md` exists and is readable
- [ ] `home/.claude/skills/user-design-md/SKILL.md` exists with correct frontmatter
- [ ] `user-figma-implement` Step 0c is present
- [ ] `user-fe-develop` DESIGN.md Check section is present
- [ ] `bun run --bun tsc --noEmit` passes
