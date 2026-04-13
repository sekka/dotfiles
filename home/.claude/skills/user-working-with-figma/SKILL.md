---
name: user-working-with-figma
description: Implement Figma designs as high-fidelity code. Triggered by requests to implement a Figma file, frame, or component, or phrases like "match the Figma design" or "implement this Figma". Uses the Figma MCP tool when available.
disable-model-invocation: false
---

# Figma Design Implementation Skill

## Overview

A skill for implementing Figma designs as high-fidelity code.
Uses the official Figma MCP server tools to maximize token efficiency while accurately reproducing design intent.

## Iron Law

1. Do not claim "matches the design" without Figma data
2. Do not ignore rate limits

## Available MCP Tools

| Tool | Use |
|--------|------|
| `mcp__figma__implement_design` | **Fast path**: End-to-end frame → code generation (analysis + codegen + file placement). React+Tailwind by default; customizable to Vue/iOS. ~95% accuracy for simple layouts, 80–85% for complex. |
| `mcp__figma__get_design_context` | Get structured design information in React+Tailwind format |
| `mcp__figma__get_screenshot` | Screenshot for visual layout verification |
| `mcp__figma__get_variable_defs` | Bulk fetch of color, spacing, and typography variables |
| `mcp__figma__get_code_connect_map` | Get Figma node to code component mapping |
| `mcp__figma__get_metadata` | Get layer info as XML (lightweight version for large designs) |
| `mcp__figma__create_design_system_rules` | Auto-generate design system rules for the project |

## Rate Limit Notes

- **Starter/View/Collab seats**: 6 times per month limit (use carefully)
- **Dev/Full seats (Professional or higher)**: Per-minute limit (follows Tier 1 REST API)

For the 6-per-month limit, save tokens using a 2-step strategy: `get_metadata` first, then `get_design_context`.

## Execution Flow

### Step 0: DESIGN.md Bootstrap + Read

**Always run this before any implementation.**

1. Check if `./DESIGN.md` exists in the project root
2. **If it does not exist**, offer to generate it:
   - Run `mcp__figma__get_variable_defs` to get design tokens
   - Run `mcp__figma__get_screenshot` on the main frame(s)
   - Run `mcp__figma__create_design_system_rules` if available
   - Pass screenshots to AI with the analysis prompt from
     `user-cloning-website/references/ai-analysis-prompt.md`
   - Generate `./DESIGN.md` following `references/design-md-format.md`
   - Save to project root
3. **Read `./DESIGN.md` fully** and treat its contents as hard constraints:
   - All `tokens` values override any guessed values
   - `grid` settings define the layout system
   - Prose sections (`Tone & Manner`, `Designer Intent`, etc.) inform implementation decisions

### Step 1: Fast Path — `implement-design` (try first)

When the goal is **full-frame implementation** (not partial extraction or token audit), try `implement-design` first:

```
mcp__figma__implement_design(nodeId, options?)
  options.framework: "react" (default) | "vue" | "ios"
  options.styling:   "tailwind" (default) | "css-modules" | ...
```

- Simple layouts: ~95% accuracy. Complex (deep Flexbox nesting, responsive breakpoints): 80–85%.
- The tool controls the full workflow: frame analysis → code generation → file placement.
- If the output needs polish (the ~15–20% gap), fall through to Steps 3–7 for targeted corrections.
- Skip this step when: partial extraction, token-only audit, or the frame is highly complex with many interactive states.

### Step 2: Preparation (First time only)

When using Figma for the first time in a project:

```
1. Generate project rules with mcp__figma__create_design_system_rules
2. Get existing component mapping with mcp__figma__get_code_connect_map
```

If a Code Connect mapping exists, reuse existing components as the first priority.

### Step 3: Get Design Information

**Important: Figma API responses consume a large number of tokens. Always delegate to a Sub Agent and return only a summary to the main session.**

Recommended fetch order:
1. `mcp__figma__get_design_context` — Get structure and properties
2. `mcp__figma__get_screenshot` — Visual check (all states: default/hover/focus/active/disabled)
3. `mcp__figma__get_variable_defs` — Get design tokens (variables)

Details: `FETCHING.md` / `references/sub-agent-pattern.md`

### Step 4: Token Saving for Large Designs

When the design is large and the `get_design_context` response becomes too big:

```
1. Get lightweight XML layer info first with mcp__figma__get_metadata
2. Identify the required node IDs
3. Get details only for those nodes using mcp__figma__get_design_context
```

### Step 5: Asset Handling

- Use localhost URLs returned by MCP as-is
- Do not add new icon packages (handle assets using the existing method)

Details: `references/asset-handling.md`

### Step 6: Exclude System UI

Do not implement OS-rendered elements such as the iOS home indicator or Android navigation bar.
Details: `references/system-ui-exclusion.md`

### Step 7: Code Implementation

**WARNING: Do not write code without checking Figma first.**
Do not fill in design details from internal knowledge or guesswork. Always check the relevant node with Figma MCP before implementing.

Repeat this loop for each section and component:

```
[Implementation loop per section]
1. Check that section's node with mcp__figma__get_design_context
2. Visual check with mcp__figma__get_screenshot
3. Implement based on the confirmed information
4. Move to next section → go back to 1
```

Implementation priority:
```
1. Reuse Code Connect-mapped components first
2. Design tokens (variables) over hardcoded values
3. Layout structure (flex/grid arrangement)
4. Spacing (padding/margin/gap)
5. Typography (font-size, line-height, font-weight)
6. Color (background, text color, border)
7. Interactions (hover, focus, active states)
8. Animations (transition, animation)
```

### Step 8: Visual Diff Check

Take screenshots of both the implementation and the Figma design, then score the delta per axis.

```
[Screenshot procedure]
1. Open the implementation in browser
2. Take a full-page or viewport screenshot with agent-browser or Playwright MCP
3. Take a Figma screenshot with mcp__figma__get_screenshot for the same frame
4. Compare the two images side by side
```

Score the delta on each of the 7 axes (scale: 0 = perfect match, -1 = minor gap, -2 = noticeable gap, -3 = major mismatch):

| Axis | Delta | Note |
|------|-------|------|
| Visual Hierarchy | | |
| Typography | | |
| Color System | | |
| Spacing / Rhythm | | |
| Grid | | |
| Emotional Impact | | |
| Functional Clarity | | |

If all deltas are 0 or -1, implementation is complete. If any delta ≤ -2, proceed to Step 9.

### Step 9: Gap Proposals

For each axis with delta ≤ -2, generate a DESIGN.md update proposal:

```
以下の差分を分析して、DESIGN.md への修正提案を作成してください。
実装スクリーンショット: [path]
Figma スクリーンショット: [path]
差分軸: [axis name], delta: [score]

DESIGN.md の tokens または prose セクションで修正すべき箇所を
具体的な値（例: line_height_body: 1.6 → 1.75）で提案してください。
```

Present proposals to the user. Do NOT update DESIGN.md automatically — wait for approval.

### Step 10: DESIGN.md Auto-Update

After user approves proposals from Step 9:

1. Open `./DESIGN.md`
2. Apply only the approved changes
3. Add an entry to the `Changelog` table:

```markdown
| {today's date} | {what changed} | Visual Diff delta ≤ -2 on {axis} |
```

4. Commit: `docs: Visual Diff フィードバックを DESIGN.md に反映`

### Step 11: Reverse Analysis (Optional)

If the Visual Diff reveals a design intent in Figma that is NOT yet captured in DESIGN.md, run this prompt to propose new prose sections:

```
Figma デザインと実装の差分から、DESIGN.md に追加すべき
デザイン意図（Tone & Manner, Emotional Value, Designer Intent）の
記述を提案してください。
現在の DESIGN.md: [paste current prose sections]
Figma スクリーンショット: [image]
```

Present the proposal to the user. Apply only after approval.

## Implementation Guidelines

### Layout Implementation

```css
/* Figma Auto Layout → CSS Flexbox */
direction: horizontal → flex-direction: row
direction: vertical   → flex-direction: column
spacing: 16           → gap: 1rem
padding: [8, 16, 8, 16] → padding: 0.5rem 1rem

/* Figma Constraints */
Fill container → flex: 1 or width: 100%
Fixed width    → width: [px]
Hug contents   → width: fit-content
```

### Typography Implementation

```css
/* Apply Figma values directly to CSS */
font-size: [Figma value]px
line-height: [Figma value]px → recommended to convert to em: calc([value]px / [font-size]px)
font-weight: [Figma weight]
letter-spacing: [Figma value]px
```

### Color Implementation

Prefer variables from `get_variable_defs`. Hardcoding is a last resort:
```css
/* Good: variable reference */
color: var(--color-primary-500);
background: var(--color-gray-100);

/* If no Design Token, write HEX directly */
color: #3b82f6;
```

## Quality Checklist

- [ ] Spacing: Do Figma values match px units?
- [ ] Typography: Are font family, size, and weight accurate?
- [ ] Color: Are HEX values or tokens correct?
- [ ] Layout: Do flex/grid direction and alignment match?
- [ ] Responsive: Is the judgment between fixed size and flexible size correct?
- [ ] Assets: Are SVG/images taken from actual files?
- [ ] System UI: Are OS-rendered elements not implemented?
- [ ] Code Connect: Were existing components reused?
- [ ] Contrast: テキスト/背景のコントラスト比が 4.5:1 以上か（WCAG 1.4.3）
- [ ] Motion: `prefers-reduced-motion: reduce` でアニメーションが無効化されるか（WCAG 2.3.3）
- [ ] Keyboard: すべてのインタラクティブ要素にフォーカスインジケーターがあるか（WCAG 2.4.7）
- [ ] Details: `references/a11y-checklist.md` を参照

## Guide for Requesters

Information needed for accurate implementation requests (URL, stack, Design Token, scope, etc.):
`references/request-guide.md`

## Related Skills

- **designing-ui**: Component spec definition, supplementing design intent
- **developing-frontend**: Implementation details (React/Vue/CSS)
- **managing-frontend-knowledge**: Reference for modern CSS techniques
