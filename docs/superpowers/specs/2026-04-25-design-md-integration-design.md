# DESIGN.md Integration Design

Date: 2026-04-25
Status: Approved

## Summary

Integrate the DESIGN.md format (Google Stitch, OSS since 2026-04-21) into the dotfiles harness.
Goal: make AI-generated UI consistently on-brand across personal and client projects, with zero manual overhead.

## Scope

- Personal web projects
- Client projects (user-doc-* / user-figma-* workflows)
- Claude Code as the primary agent

## Deliverables

```
dotfiles/
├── .mise.toml                              # [change] add npm:@google/design.md
├── scripts/development/lint-format.ts      # [change] conditional design.md lint
└── home/.claude/
    ├── rules/
    │   └── design-md.md                    # [new] when/how to use DESIGN.md
    └── skills/
        ├── user-design-md/
        │   └── SKILL.md                    # [new] init / lint / update flows
        ├── user-figma-implement/
        │   └── SKILL.md                    # [change] add Step 0: DESIGN.md check
        └── user-fe-develop/
            └── SKILL.md                    # [change] add token-reference guidance
```

## Architecture

### Tool installation

`mise use npm:@google/design.md` adds the CLI globally.
After `mise install`, `design.md lint` is available as a shell command.
Version is pinned to `latest` for now; switch to a fixed version once the spec exits alpha.

### `user-design-md` skill — three modes

**Init (new project):**

1. Collect style signals: existing CSS, Figma URL, brand colors, typeface names
2. Generate DESIGN.md with YAML front matter + Markdown rationale (minimum sections: Overview, Colors, Typography, Do's and Don'ts)
3. Run `design.md lint` and fix any errors before handing off
4. Propose a one-line addition to CLAUDE.md: `UIを実装するときは必ず @DESIGN.md を参照してスタイルを適用すること`

**Lint/Verify (existing file):**

1. Run `design.md lint DESIGN.md` and capture JSON output
2. Report errors/warnings in human language
3. For WCAG contrast failures, suggest alternative color values

**Update (edit existing):**

1. Clarify what changed (new color, new component, etc.)
2. Apply edits
3. Run `design.md diff DESIGN.md DESIGN.md.bak` to surface regressions

### Minimum DESIGN.md shape

```yaml
---
version: alpha
name: <project-name>
colors:
  primary: "#..."
  secondary: "#..."
  neutral: "#..."
typography:
  body-md:
    fontFamily: ...
    fontSize: 1rem
spacing:
  sm: 8px
  md: 16px
---
## Overview
## Colors
## Typography
## Do's and Don'ts
```

Components and Elevation sections are added only when needed (YAGNI).

### `user-figma-implement` — Step 0 addition

Before any implementation work begins:

- Check for DESIGN.md in project root
- If present: run `design.md lint`; block on errors, warn on warnings
- If absent: offer `user-design-md` init (skippable)
- Warn if Figma tokens and DESIGN.md color/typography values diverge

### `user-fe-develop` — token-reference guidance addition

When implementing UI components:

- If DESIGN.md exists, reference its color/spacing/component tokens
- Do not hardcode new style values not in DESIGN.md; add them to DESIGN.md first
- Replace inline hex values (`#xxxxxx`) with DESIGN.md token references (`{colors.primary}`)

### `lint-format.ts` — conditional gate

```typescript
if (await exists("DESIGN.md")) {
  await run("design.md lint DESIGN.md");
  // exit code 1 on errors → fails the lint step
  // warnings are informational only → pass
}
```

### `rules/design-md.md` — auto-loaded rule

Tells Claude when to check for DESIGN.md and how to author it:

- Check before any UI component implementation
- Run lint after creating or editing
- Keep Do's and Don'ts ≤ 5 items
- Pin `version: alpha` until spec stabilizes
- No hardcoded hex in prose; use YAML tokens

## Risks

| Risk                             | Likelihood | Mitigation                                                                |
| -------------------------------- | ---------- | ------------------------------------------------------------------------- |
| Alpha spec breaking changes      | Medium     | `version: alpha` marker; pin to specific npm version when spec stabilizes |
| Lint step slows `lint-format.ts` | Low        | Only runs when DESIGN.md exists; npx cache keeps it fast                  |
| Figma ↔ DESIGN.md drift          | Medium     | Step 0 in user-figma-implement warns on divergence                        |

## Implementation order

1. `.mise.toml` — tool install
2. `rules/design-md.md` — AI awareness
3. `user-design-md/SKILL.md` — new skill
4. `lint-format.ts` — lint gate
5. `user-figma-implement/SKILL.md` — Step 0
6. `user-fe-develop/SKILL.md` — token guidance
