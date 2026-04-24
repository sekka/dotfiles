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
