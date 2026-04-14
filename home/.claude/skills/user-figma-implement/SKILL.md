---
name: user-figma-implement
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
| `generate_figma_design` (Figma MCP remote) | **Code → Figma**: Captures a running local page via JS injection and creates a Figma design. Use for stakeholder review and discussion. Different namespace from `mcp__figma__*` tools above — provided by the remote MCP server. |

## Tool Selection Cheat Sheet

| Goal | Tool |
|------|------|
| Figma → Code (implement design) | `mcp__figma__implement_design` / `mcp__figma__get_design_context` |
| Code → Figma (programmatic build) | `use_figma` Plugin API → see `user-figma-build` skill |
| Code → Figma (capture existing page) | `generate_figma_design` (see section below) |

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
     (**Starter/View/Collab seats**: counts against the 6/month limit — skip `create_design_system_rules` and use `get_metadata` instead when budget is tight)
   - Run `mcp__figma__get_screenshot` on the main frame(s)
   - Run `mcp__figma__create_design_system_rules` if available (Dev/Full seats only; skip for Starter seats)
   - Pass screenshots to AI with the analysis prompt from
     `user-cloning-website/references/ai-analysis-prompt.md`
   - Generate `./DESIGN.md` following `references/design-md-format.md`
     (path resolution: `~/.claude/skills/` is the root for cross-skill references)
   - Save to project root
   - Note: `tokens.spacing` values are not extractable from Figma variables alone — fill them in manually or ask the user after generation
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

**2-Phase strategy for multi-language / CMS projects:**

When the target is a framework (Laravel, Next.js, etc.), split into two phases rather than generating framework code directly:

```
Phase 1: Figma → HTML/CSS mock
  - Use implement_design / get_design_context
  - Check in browser, fix layout gaps
  - Auto Layout in Figma is required for accurate extraction

Phase 2: mock → framework integration
  - Feed corrected mock into framework (Blade, JSX, etc.)
  - Extract multi-language text strings
  - Generate translation files

Why split: Phase 1 fixes design gaps without touching framework complexity.
Phase 2 can then focus on integration logic only.
```

### Step 2: Preparation (First time only)

When using Figma for the first time in a project:

```
1. Generate project rules with mcp__figma__create_design_system_rules
2. Get existing component mapping with mcp__figma__get_code_connect_map
   - Requires Figma Org or Enterprise plan (not available on Free/Professional)
   - When available: returns Figma property → implementation snippets, import paths, custom instructions
   - Provides the highest accuracy for component mapping — prioritize Code Connect over manual extraction
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

When the design is large and the `get_design_context` response becomes too big,
use the 3-phase progressive extraction pattern:

```
Phase 1 — Map: mcp__figma__get_metadata
  → Lightweight XML, builds a structure map of the entire frame
  → Identify logical section boundaries and their node IDs

Phase 2 — Divide: split the frame into logical sections
  → Break large frames into independently processable units
  → Prioritize by render order (top → bottom)

Phase 3 — Detail: mcp__figma__get_design_context per section
  → Fetch full design context only for the current section
  → Implement, validate, then proceed to the next section
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

**Optional: Computed Style Verification (for cross-framework implementations)**

When implementing the same design for a second framework (e.g., Vue after React),
extract computed CSS styles via Playwright MCP to eliminate interpretation differences:

```
1. Confirm the primary (React) output looks correct via screenshot
2. Use Playwright MCP to extract computed styles from the rendered DOM:
   - Exact px values, not Tailwind class names
   - This computed output becomes the "ground truth" for the second framework
3. Use computed CSS values to implement the target framework (Vue/iOS/etc.)
   - Eliminates class-name-to-value ambiguity between frameworks
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

4. Ask the user to commit: `docs: Visual Diff フィードバックを DESIGN.md に反映`

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

Layout → Typography → Color detailed rules, letter-spacing % → em conversion, token path mapping:
`references/implementation-guide.md`

## Quality Checklist

`references/quality-checklist.md` / `references/a11y-checklist.md`

## Guide for Requesters

Information needed for accurate implementation requests (URL, stack, Design Token, scope, etc.):
`references/request-guide.md`

## Code → Figma via MCP (generate_figma_design)

Reverse workflow: capture a running local page and push it to Figma (stakeholder review, snapshot).
Prerequisites (Node.js 24+), limitations, how it works: `references/code-to-figma.md`

## Related Skills

- **user-doc-design-spec**: Component spec definition, supplementing design intent
- **user-fe-develop**: Implementation details (React/Vue/CSS)
- **user-fe-knowledge**: Reference for modern CSS techniques
- **user-figma-build**: Code → Figma via Plugin API (programmatic component/design system construction)

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — implementation complete, all visual diff axes at 0 or -1, DESIGN.md reflects current state
- `## Status: DONE_WITH_CONCERNS` — implementation complete but one or more visual diff axes at -2 or worse; proposals presented and awaiting approval (list affected axes)
- `## Status: BLOCKED` — Figma MCP rate limit reached, node ID not provided, or required Figma data is inaccessible
- `## Status: NEEDS_CONTEXT` — missing Figma node URL/ID or target tech stack; cannot begin implementation
