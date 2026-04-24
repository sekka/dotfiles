---
name: user-figma-build
description: Build Figma design systems and page layouts via the Plugin API (use_figma). Use when creating Local Variables, Text Styles, components, Auto Layout frames, or full page designs directly inside Figma programmatically. Requires RTM (plans/00-master-requirements.md) and locked style direction to exist before starting. The reverse of user-figma-implement (Figma→Code). Triggered by phrases like "Figmaで作って", "Figmaに反映して", "コンポーネントを作って", "デザインシステムを構築して".
effort: high
---

# Building Figma Design Systems via Plugin API

This skill covers the **Code → Figma** direction: programmatically constructing design systems,
components, and page layouts inside Figma using the `use_figma` tool.

For the reverse direction (Figma → Code implementation), use the `user-figma-implement` skill instead.

---

## Phase 0a: Figma Design Quality Standards

Auto Layout + Variables + semantic naming → 32/35 quality score vs. 10/35 for unstructured designs.
Full standards, spacing token system, letter-spacing rule, semantic naming guide, anti-patterns:
`references/design-quality-standards.md`

### AI-Readable Figma Principle: Reduce Guessing

The core goal is to **eliminate guesses the AI must make**. Ambiguous names, missing annotations, or
unstructured layouts cause the AI to infer intent — leading to inconsistent output.

The four pillars of AI-readable Figma (in priority order):

| Pillar | What to do | Why it matters |
|--------|-----------|----------------|
| **Annotation design** | Add annotations with category labels (interaction, layout, content, state) | Most impactful — AI uses annotations as ground truth |
| Naming conventions | Use `{project}/{category}/{name}/{variant}` consistently | Reduces layer-name ambiguity |
| Auto Layout | All frames use Auto Layout (no absolute positioning) | Enables accurate spacing/layout extraction |
| Design tokens | All colors/spacing via Variables, no hardcoded values | Ensures token-to-code mapping is exact |

**Annotation categories** (label each annotation with one of these):
- `interaction` — hover states, click targets, transitions, animations
- `layout` — responsive behavior, breakpoint rules, overflow handling
- `content` — dynamic text, CMS fields, character limits
- `state` — loading, empty, error, disabled states

**Validation rule:** If a component has interactive behavior, responsive rules, or dynamic content,
it **must** have at least one annotation in the corresponding category before proceeding to Phase 2.

**Start small:** When testing AI-readability for the first time on a project, validate with a single
simple component (e.g., a button) before applying to the full design system.

---

## Phase 0: Pre-Flight Requirements

Before touching Figma, confirm these documents exist:

| Document | Purpose |
|----------|---------|
| **RTM / `plans/00-master-requirements.md`** | Requirements Traceability Matrix — every spec item traced to client brief or research. **Must exist before designing.** Use `/user-doc-spec` to create it. |
| Style Direction (e.g. `plans/10-style-direction.md`) | Color palette, typography, decoration rules, motion — all LOCKED |
| Wireframes (e.g. `plans/06-wireframes.md`) | Page structure, section order, breakpoints |
| Decision log (e.g. `plans/05-decision-log.md`) | Design rationale, rejected alternatives |
| Target Persona | Who the UI is for (age group, skill level, sensory/rational preference, information density preference) — LOCKED |

**RTM (Requirements Traceability Matrix) is the authority.** If a Figma frame includes something not in the RTM, that's a scope creep bug. If the RTM has a ✅ BINDING item not yet in Figma, that's a defect.

Use the `/user-doc-spec` skill to create or audit the RTM before starting Figma work.

Do NOT start building until the style direction is LOCKED and the RTM coverage is ≥ 100%.

---

## Phase 0b: Lo-fi Wireframe in Figma (Optional)

Use when a text wireframe (`plans/06-wireframes.md`) exists but visual gray-box frames in Figma are needed — for stakeholder review before committing to visual direction.

**Skip if:** Figma already has wireframe frames, or you are going straight to hi-fi.

### Conventions

| Element | Value |
|---------|-------|
| Background | `#FFFFFF` |
| Image placeholder | `#BDBDBD` rectangle |
| Body text placeholder | `#333333`, `fontSize: 14` |
| Heading placeholder | `#333333`, `fontSize: 20–28` |
| Spacing unit | 8px grid (`itemSpacing: 16 / 24 / 32`) |
| Layout | Auto Layout only — no manual positioning |
| Tokens / styles | None — gray-box only, no design system |

### Page Setup

```js
const wireframePage = figma.createPage();
wireframePage.name = '0_Wireframes';
await figma.setCurrentPageAsync(wireframePage);

// Gray helper (hex → 0-1 RGB)
const g = hex => ({
  r: parseInt(hex.slice(1,3),16)/255,
  g: parseInt(hex.slice(3,5),16)/255,
  b: parseInt(hex.slice(5,7),16)/255
});
```

### Section Frame

```js
const makeSection = (name, bgHex='#FFFFFF') => {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = 'VERTICAL';
  f.primaryAxisSizingMode = 'AUTO';   // height hugs content
  f.counterAxisSizingMode = 'FIXED';  // width is fixed
  f.resize(1440, 100);                // height placeholder; AUTO overrides
  f.fills = [{ type:'SOLID', color: g(bgHex) }];
  f.paddingTop = f.paddingBottom = 80;
  f.paddingLeft = f.paddingRight = 120;
  f.itemSpacing = 32;
  return f;
};
```

### Image Placeholder

```js
const makeImg = (w, h, label='Image') => {
  const r = figma.createRectangle();
  r.resize(w, h);
  r.fills = [{ type:'SOLID', color: g('#BDBDBD') }];
  r.name = `[IMG] ${label}`;
  return r;
};
```

### Text Placeholder

```js
const makeText = async (content, size=16) => {
  await figma.loadFontAsync({ family:'Inter', style:'Regular' });
  const t = figma.createText();
  t.fontName = { family:'Inter', style:'Regular' };
  t.characters = content;
  t.fontSize = size;
  t.fills = [{ type:'SOLID', color: g('#333333') }];
  return t;
};
```

### Desktop + Mobile Pair

```js
// Desktop (1440px) — append to wireframePage
const desktop = figma.createFrame();
desktop.name = 'TOP — Desktop';
desktop.resize(1440, 900);
desktop.layoutMode = 'VERTICAL';
desktop.primaryAxisSizingMode = 'AUTO';
desktop.itemSpacing = 0;
wireframePage.appendChild(desktop);

// Mobile (375px) — placed 40px to the right
const mobile = figma.createFrame();
mobile.name = 'TOP — Mobile';
mobile.resize(375, 812);
mobile.layoutMode = 'VERTICAL';
mobile.primaryAxisSizingMode = 'AUTO';
mobile.itemSpacing = 0;
mobile.x = 1480;
wireframePage.appendChild(mobile);
```

After each page, run `get_screenshot` to confirm layout before continuing.

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
- After notifying, output `## Status: DONE_WITH_CONCERNS` immediately — do **not** wait for the user to complete slot conversion. The build is done; slot conversion is a manual post-step.

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

## Phase 8b: DESIGN.md Token Export

Export design tokens from the Figma file to `DESIGN.md` so brand checks in `/user-figma-gate` (Check 3) can run without Figma access.

**When to run:**
- After Phase 2 (color tokens + text styles are stable)
- When `/user-figma-gate` reports "DESIGN.md not found — brand check skipped"

**Skip if:** `DESIGN.md` already exists and is up to date with current tokens.

### What to extract

```js
// 1. Color variables
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const allVars = await figma.variables.getLocalVariablesAsync();
const colorVars = allVars.filter(v => v.resolvedType === 'COLOR');
return colorVars.map(v => ({ name: v.name, value: v.valuesByMode }));

// 2. Text styles
const textStyles = await figma.getLocalTextStylesAsync();
return textStyles.map(s => ({
  name: s.name,
  fontSize: s.fontSize,
  fontFamily: s.fontName.family,
  fontWeight: s.fontName.style,
  lineHeight: s.lineHeight,
  letterSpacing: s.letterSpacing,
}));
```

### DESIGN.md format

Write to `DESIGN.md` in the project root:

```markdown
# Design System Tokens

## Colors

| Token | Hex |
|-------|-----|
| primary/500 | #3B82F6 |
| neutral/900 | #111827 |

## Typography

| Style | Family | Size | Weight | Line Height |
|-------|--------|------|--------|-------------|
| heading/xl | Inter | 48px | Bold | 1.2 |
| body/md | Inter | 16px | Regular | 1.5 |

## Spacing

Base unit: 8px grid. Scale: 4, 8, 16, 24, 32, 48, 64, 96px.
```

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

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — all requested Figma frames, components, or design system elements built and visually validated via screenshot
- `## Status: DONE_WITH_CONCERNS` — build complete but manual steps remain (e.g., user must convert `[SLOT]` frames to actual Slots via `⌘⇧S`) — list each
- `## Status: BLOCKED` — Plugin API call failed, or required font is unavailable
- `## Status: NEEDS_CONTEXT` — missing RTM, style direction not yet LOCKED (DRAFT or pending approval counts as not LOCKED), missing wireframes, or RTM coverage below 100%; cannot start Phase 1
