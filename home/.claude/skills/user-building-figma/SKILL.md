---
name: user-building-figma
description: Build Figma design systems and page layouts via the Plugin API (use_figma). Use when creating Local Variables, Text Styles, components, Auto Layout frames, or full page designs directly inside Figma programmatically. The reverse of user-working-with-figma (Figma→Code). Triggered by phrases like "Figmaで作って", "Figmaに反映して", "コンポーネントを作って", "デザインシステムを構築して".
---

# Building Figma Design Systems via Plugin API

This skill covers the **Code → Figma** direction: programmatically constructing design systems,
components, and page layouts inside Figma using the `use_figma` tool.

For the reverse direction (Figma → Code implementation), use the `user-working-with-figma` skill instead.

---

## Phase 0a: Figma Design Quality Standards

Auto Layout + Variables + semantic naming → 32/35 quality score vs. 10/35 for unstructured designs.
Full standards, spacing token system, letter-spacing rule, semantic naming guide, anti-patterns:
`references/design-quality-standards.md`

---

## Phase 0: Pre-Flight Requirements

Before touching Figma, confirm these documents exist:

| Document | Purpose |
|----------|---------|
| **RTM / `plans/00-master-requirements.md`** | Requirements Traceability Matrix — every spec item traced to client brief or research. **Must exist before designing.** Use `/spec-from-brief` to create it. |
| Style Direction (e.g. `plans/10-style-direction.md`) | Color palette, typography, decoration rules, motion — all LOCKED |
| Wireframes (e.g. `plans/06-wireframes.md`) | Page structure, section order, breakpoints |
| Decision log (e.g. `plans/05-decision-log.md`) | Design rationale, rejected alternatives |
| Target Persona | Who the UI is for (age group, skill level, sensory/rational preference, information density preference) — LOCKED |

**RTM (Requirements Traceability Matrix) is the authority.** If a Figma frame includes something not in the RTM, that's a scope creep bug. If the RTM has a ✅ BINDING item not yet in Figma, that's a defect.

Use the `/spec-from-brief` skill to create or audit the RTM before starting Figma work.

Do NOT start building until the style direction is LOCKED and the RTM coverage is ≥ 100%.

---

## Phase 1: Inspect First

Always run a read-only `use_figma` call before creating anything.

```js
// List all pages
const pages = figma.root.children.map(p => ({ name: p.name, id: p.id, children: p.children.length }));
return pages;
```

```js
// Check existing variables, text styles, Auto Layout conventions
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const textStyles = await figma.getLocalTextStylesAsync();
// Inspect a known frame's Auto Layout settings before replicating
const frame = figma.currentPage.children[0];
return {
  collections: collections.map(c => c.name),
  textStyleCount: textStyles.length,
  exampleLayout: { layoutMode: frame.layoutMode, itemSpacing: frame.itemSpacing }
};
```

**Match what's already there. Never impose new conventions on an existing file.**

---

## Phase 2: Design Token Setup

### 2-1. Local Variables (Color Palette)

`hexToRgb` helper + `createVariableCollection` + per-color scope assignment + scope rules: `references/token-setup.md`

### 2-2. Text Styles

Always load fonts first (`loadFontAsync` / `listAvailableFontsAsync`). Full code: `references/token-setup.md`

---

## Phase 3: Auto Layout Architecture

### The Golden Rule

**Always match the existing file's Auto Layout conventions.** Inspect before building (Phase 1).

Section, Container, Row, Header pattern examples: `references/auto-layout-patterns.md`

### Critical API Gotchas

| Mistake | Correct |
|---------|---------|
| `frame.primaryAxisSizingMode = 'HUG'` | Use `'AUTO'` for auto-size. `'HUG'` goes on `layoutSizingHorizontal/Vertical` |
| Set `layoutSizingHorizontal = 'FILL'` before `appendChild` | **ALWAYS** set AFTER `parent.appendChild(child)` |
| Use sync page setter `figma.currentPage = page` | Use `await figma.setCurrentPageAsync(page)` |
| `lineHeight = 28` (bare number) | `lineHeight = { unit: 'PIXELS', value: 28 }` |
| Color values `{ r: 255, g: 0, b: 0 }` | Colors are 0–1 range: `{ r: 1, g: 0, b: 0 }` |
| Mutate fills/strokes in place | Clone array, modify, reassign: `frame.fills = [...frame.fills, newFill]` |
| COLUMNS grid with `offset` | `offset` is invalid for `'CENTER'` alignment — omit it. CENTER auto-calculates margins from count/gutterSize/sectionSize |
| ROWS grid without `offset` | ROWS requires `offset` even for `'MIN'` alignment — always include `offset: 0` |
| `layoutWrap = 'WRAP'` grid with `FILL` children | Children with `layoutSizingHorizontal = 'FILL'` divide width equally — use `FIXED` width on children to get proper wrapping |

---

## Phase 3b: Layout Grids & Guides

12-column grid (1440px, CENTER, 24px gutter, 8px baseline) + page-level guides: `references/auto-layout-patterns.md`

---

## Phase 4: Component Architecture with Slots

### The Hybrid Approach

**Plugin API cannot create slots programmatically** (as of 2026-04). No slot-related methods exist
in the Plugin API (`figma.createSlot()` does not exist).

**Workflow:**
1. Claude builds component structure via Plugin API, marking slot frames with `[SLOT]` prefix
2. Claude notifies user when component is ready
3. User converts marked frames to actual Slots in Figma UI: select frame → `⌘⇧S` (macOS) or right-click → "スロットに変換"

### SectionWrapper Component Pattern

Component creation, slot detection, and slot content in instances: `references/component-patterns.md`

**When to call user for slot conversion:**
- After all `SectionWrapper` variants are created on the DS page
- Say: "コンポーネント `SectionWrapper` の `[SLOT] body` フレームを `⌘⇧S` でスロットに変換してください"

### Component Naming Convention

`{project}/{category}/{name}/{variant}` — examples: `references/component-patterns.md`

---

## Phase 5: Page Organization

### Recommended Page Structure

```
0_Reference       — Original/existing design (read-only reference)
1_DS              — Design System: colors, typography, components, effects
2_{PageName}      — One page per major section (TOP, NEWS, CHARACTERS, etc.)
```

### Page Creation

```js
// Rename existing reference page
figma.root.children[0].name = '0_Reference';

// Create new pages
const pageNames = ['1_DS (Design System)', '2_TOP', '3_NEWS', '4_CHARACTERS'];
for (const name of pageNames) {
  const page = figma.createPage();
  page.name = name;
}
```

---

## Phase 6: DS Page Layout

Build the Design System page in this order:
1. **Color swatches** (10-column grid of color variables)
2. **Typography specimens** (one row per text style, showing label + sample text)
3. **Spacing scale** (visual ruler of spacing tokens)
4. **Effect styles** (glow, shadow samples)
5. **Components** (one component per row with variants)

Position each section frame below the previous: `frame.x = 0; frame.y = prevY + prevHeight + 80;`

---

## Phase 7: Validation Loop

After each major section:

```
1. get_screenshot → Check visual layout
2. use_figma (read-only) → Check Auto Layout structure (layoutMode, sizingMode, padding)
3. Fix before moving on
```

**Never build the next section on a broken foundation.**

---

## Figma File Font Availability

Before specifying fonts, always verify availability:

```js
const all = await figma.listAvailableFontsAsync();
const oxanium = all.filter(f => f.fontName.family === 'Oxanium');
return oxanium.map(f => f.fontName.style);
```

**Common unavailable fonts (require commercial license):**
- `DINNextW1G` — Monotype commercial. Use `Barlow Condensed` as alternative.
- Custom brand fonts — Must be uploaded to Figma organization or use Google Fonts alternatives.

---

## Phase 8: Design System Rules Sync

After the DS page is built and tokens/components are stable, sync the design system rules back to the project's AI config files.

```
mcp__figma__create_design_system_rules(options?)
  options.clientLanguages:  ["TypeScript"] (default)
  options.clientFrameworks: ["React"]      (default — change to Vue, etc. if needed)
```

**What it generates:**
- Component path conventions ("use `src/components/Button` not inline divs")
- Design token usage rules ("no hardcoded hex values — use CSS variables")
- `get_design_context` / `get_metadata` / `get_screenshot` usage guidelines

**Where it writes:**
| Tool | File |
|------|------|
| Claude Code | `CLAUDE.md` |
| Codex CLI | `AGENTS.md` |
| Cursor | `.cursor/rules/figma-design-system.mdc` |

**When to run:**
- After Phase 6 (DS page is complete) — first-time setup
- After any significant token or component rename

**Skip if:** No codebase yet (pure Figma exploration). This tool analyzes the *code* side, not Figma.

---

## AI Image Editing & Prototyping Workflow

When the task involves photo editing, illustration vectorizing, or preparing multiple design directions for review, see:
`references/figma-ai-image-workflow.md`

Key tools covered: Glass effect, Remove background, Vectorize, Erase object, Expand image, Figma Make embed in FigJam.

---

## Checklist Before Each `use_figma` Call

- [ ] `return` sends output (NOT `figma.closePlugin()`)
- [ ] All colors in 0–1 range
- [ ] `lineHeight` / `letterSpacing` use `{ unit, value }` format
- [ ] `layoutSizingHorizontal/Vertical = 'FILL'` set AFTER `appendChild`
- [ ] `await figma.setCurrentPageAsync(page)` for page switching
- [ ] Every created/mutated node ID included in `return`
- [ ] Working incrementally (one section per call, validate after each)
