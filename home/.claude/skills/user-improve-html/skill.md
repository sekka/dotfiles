---
name: user-improve-html
description: Check HTML semantics, accessibility, and ARIA attributes thoroughly and suggest improvements. Triggered by "improve HTML", "a11y check", "accessibility", "ARIA", "semantics", or "improve markup".
---

# HTML Semantics & Accessibility Check

Check markup semantics, accessibility, and ARIA attributes using rules. Provide specific improvement suggestions.

## Iron Law

1. Do not make HTML changes that affect appearance without permission

## Progress Reporting Rules (Required)

Report progress to the user at the start and end of each Phase. Report format:

```
[HTML Check Phase N/4] {Phase name} — {status}
  Found: errors=X, warnings=Y, info=Z
  Next: {next action}
```

## Execution Rules (Required)

- **Always delegate check-html.ts execution to a subagent (implementer).** Do not consume the main agent's context.
- Pass the file path/URL and expected output format clearly to the subagent.
- After the subagent completes, the main agent creates a qualitative analysis and report from the JSON results.

## Prerequisite Check (Required — Run First)

When the skill starts, **before any other work**, confirm the following. If it fails, report to the user immediately and stop:

```bash
CHECK_HTML="$HOME/.claude/skills/improve-html/scripts/check-html.ts"
test -f "$CHECK_HTML" || { echo "ERROR: $CHECK_HTML not found"; exit 1; }
command -v bun >/dev/null || { echo "ERROR: bun is not installed"; exit 1; }
```

If both pass, proceed to the next phase. If either fails, report to the user and stop.

## Input Types

| Input | Processing |
|------|------|
| File path (.html) | Pass directly to check-html.ts |
| URL | Get HTML with browser tool → save to temp file → check-html.ts |
| git diff | Find changed HTML/TSX/JSX files → check each file |
| Code block | Save to temp file → check-html.ts |

For URL input, use a browser automation tool (chrome MCP) to get the page.

## Workflow

### Phase 1: Prepare Input

1. Determine input type
2. For URL: get page HTML with browser tool and save to `/tmp/html-check/`
3. For git diff: identify changed files

### Phase 2: Automated Check (Delegate to Subagent)

Have the implementer subagent run:

```bash
bun "$CHECK_HTML" <file> --format=json --severity=info
```

For multiple files, use a glob pattern or run individually.

Receive the JSON results.

### Phase 3: Qualitative Analysis (Claude reasoning)

Analyze the following items that are hard to detect automatically:

- **Appropriateness of ARIA use in context**: Does the role choice match the purpose?
- **Alt text quality**: Is it specific enough given the content?
- **Logical reading order**: Does DOM order match visual order?
- **Component-level a11y patterns**: Does it follow WAI-ARIA APG?
- **Knowledge base check**: Apply knowledge from `knowledge/cross-cutting/accessibility/`

When a pattern violation is found, refer to the corresponding template in the `patterns/` directory and show the correct implementation example.

### Phase 4: Generate Report

Output in Markdown format:

```markdown
# HTML Semantics & Accessibility Report

## Summary

| Category | Error | Warning | Info |
|---------|-------|---------|------|
| ARIA attributes | 2 | 1 | 0 |
| ...     | ...   | ...     | ...  |

## Issues (in priority order)

### Error: [rule-id] Rule name
- **Element**: `<element ...>`
- **WCAG**: Success Criterion X.Y.Z
- **Impact**: Specific impact on assistive technology users
- **Fix example**:
  ```html
  Fixed code here
  ```

### Warning: ...

## Qualitative Analysis Findings

(Structural issues and improvement suggestions found in Phase 3)

## Reference Patterns

(Links to APG patterns related to violations)
```

## Project Configuration

If `.htmlcheckrc.yaml` exists in the project root, the CLI loads it automatically:

```yaml
ignore:
  - seo-meta-description    # ignore specific rules
severity_overrides:
  heading-hierarchy: error   # change severity
custom_rules: []             # add custom rules
```

## Rule Categories

| # | File | Description | Rule count |
|---|---------|------|---------|
| 01 | aria-attributes | ARIA attribute validity and completeness | 15 |
| 02 | aria-widgets | ARIA widget patterns | 12 |
| 03 | accessible-names | Accessible names | 8 |
| 04 | forms | Form accessibility | 10 |
| 05 | focus-keyboard | Focus and keyboard | 10 |
| 06 | images-media | Image and media alternative text | 8 |
| 07 | live-regions | Live regions and dynamic content | 6 |
| 08 | semantic-structure | Semantic structure and landmarks | 12 |
| 09 | tables | Table accessibility | 5 |
| 10 | language | Language and internationalization (including Japanese-specific) | 5 |
| 11 | css-a11y | CSS-caused accessibility issues | 8 |
| 12 | seo | Basic SEO | 5 |
| 13 | performance | Performance | 5 |

## Resources

- Rule definitions: `rules/*.yaml`
- ARIA data: `data/aria-role-map.yaml`, `data/valid-aria-attrs.yaml`
- APG patterns: `patterns/*.md`
- CLI script: `~/.claude/skills/improve-html/scripts/check-html.ts`
- a11y knowledge: `home/.claude/skills/managing-frontend-knowledge/knowledge/cross-cutting/accessibility/`
