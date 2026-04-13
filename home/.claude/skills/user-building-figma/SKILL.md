---
name: user-building-figma
description: Build Figma design systems and page layouts via the Plugin API (use_figma). Use when creating Local Variables, Text Styles, components, Auto Layout frames, or full page designs directly inside Figma programmatically. The reverse of user-working-with-figma (Figma→Code). Triggered by phrases like "Figmaで作って", "Figmaに反映して", "コンポーネントを作って", "デザインシステムを構築して".
---

# Building Figma Design Systems via Plugin API

This skill covers the **Code → Figma** direction: programmatically constructing design systems,
components, and page layouts inside Figma using the `use_figma` tool.

For the reverse direction (Figma → Code implementation), use the `user-working-with-figma` skill instead.

---

## Phase 0: Pre-Flight Requirements

Before touching Figma, confirm these documents exist:

| Document | Purpose |
|----------|---------|
| Style Direction (e.g. `plans/10-style-direction.md`) | Color palette, typography, decoration rules, motion — all LOCKED |
| Wireframes (e.g. `plans/06-wireframes.md`) | Page structure, section order, breakpoints |
| Decision log (e.g. `plans/05-decision-log.md`) | Design rationale, rejected alternatives |

Do NOT start building until the style direction is LOCKED. Building without locked specs wastes work.

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

```js
function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}

const collection = figma.variables.createVariableCollection('DS/Colors');
const modeId = collection.defaultModeId;

const colors = [
  { name: 'bg/primary', hex: '#090B0E', scopes: ['FRAME_FILL', 'SHAPE_FILL'] },
  { name: 'text/primary', hex: '#FFFFFF', scopes: ['TEXT_FILL'] },
  { name: 'accent/primary', hex: '#02CA96', scopes: ['FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR'] },
  // ... etc
];

for (const c of colors) {
  const v = figma.variables.createVariable(c.name, collection, 'COLOR');
  v.setValueForMode(modeId, hexToRgb(c.hex));
  v.scopes = c.scopes; // ALWAYS set scopes explicitly — never leave as ALL_SCOPES
}
```

**Scope rules (avoid polluting pickers):**

| Variable type | Correct scopes |
|--------------|----------------|
| Background colors | `['FRAME_FILL', 'SHAPE_FILL']` |
| Text colors | `['TEXT_FILL']` |
| Accent/stroke | `['FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR']` |
| Spacing | `['GAP']` |

### 2-2. Text Styles

Always load fonts before creating text styles:

```js
await figma.loadFontAsync({ family: 'Oxanium', style: 'ExtraBold' });
// If a font is unavailable, call listAvailableFontsAsync() to find alternatives
const allFonts = await figma.listAvailableFontsAsync();
```

```js
const ts = figma.createTextStyle();
ts.name = 'dm/heading/h1-pc'; // Use slash-separated namespacing: project/role/variant
ts.fontName = { family: 'Oxanium', style: 'ExtraBold' };
ts.fontSize = 48;
ts.lineHeight = { unit: 'PIXELS', value: 56 }; // NOT bare numbers
ts.letterSpacing = { unit: 'PERCENT', value: 0 }; // NOT bare numbers
```

**Naming convention:** `{project}/{role}/{variant}` — e.g. `dm/heading/h1-pc`, `dm/label/nav`

---

## Phase 3: Auto Layout Architecture

### The Golden Rule

**Always match the existing file's Auto Layout conventions.** Inspect before building (Phase 1).

### Standard Section Pattern

Observed from production Figma files:

```js
// Outer section frame (vertical stack, full width, auto height)
const section = figma.createFrame();
section.name = 'Section/News';
section.layoutMode = 'VERTICAL';
section.primaryAxisSizingMode = 'AUTO';   // height grows with content
section.counterAxisSizingMode = 'FIXED';  // width fixed (e.g. 1440px)
section.resize(1440, 100);                // height will auto-expand
section.itemSpacing = 48;
section.paddingTop = 96;
section.paddingBottom = 96;
section.paddingLeft = 0;
section.paddingRight = 0;
section.primaryAxisAlignItems = 'MIN';
section.counterAxisAlignItems = 'CENTER'; // center children horizontally

// After appending to parent:
parent.appendChild(section);
section.layoutSizingHorizontal = 'FILL'; // MUST be set AFTER appendChild
```

### Inner Container (for centered content with max-width)

```js
const container = figma.createFrame();
container.name = 'container';
container.layoutMode = 'VERTICAL';
container.primaryAxisSizingMode = 'AUTO';
container.counterAxisSizingMode = 'FIXED';
container.resize(1200, 100); // content max-width
container.itemSpacing = 32;
container.fills = [];
section.appendChild(container);
container.layoutSizingHorizontal = 'FIXED'; // fixed inner width
```

### Horizontal Row

```js
const row = figma.createFrame();
row.name = 'row';
row.layoutMode = 'HORIZONTAL';
row.primaryAxisSizingMode = 'AUTO';
row.counterAxisSizingMode = 'AUTO';
row.itemSpacing = 24;
row.primaryAxisAlignItems = 'SPACE_BETWEEN';
row.counterAxisAlignItems = 'CENTER';
row.fills = [];
```

### Header Pattern

```js
const header = figma.createFrame();
header.layoutMode = 'HORIZONTAL';
header.primaryAxisSizingMode = 'FIXED';
header.counterAxisSizingMode = 'FIXED';
header.resize(1440, 72);
header.paddingLeft = 40; header.paddingRight = 40;
header.primaryAxisAlignItems = 'SPACE_BETWEEN';
header.counterAxisAlignItems = 'CENTER';
```

### Critical API Gotchas

| Mistake | Correct |
|---------|---------|
| `frame.primaryAxisSizingMode = 'HUG'` | Use `'AUTO'` for auto-size. `'HUG'` goes on `layoutSizingHorizontal/Vertical` |
| Set `layoutSizingHorizontal = 'FILL'` before `appendChild` | **ALWAYS** set AFTER `parent.appendChild(child)` |
| Use sync page setter `figma.currentPage = page` | Use `await figma.setCurrentPageAsync(page)` |
| `lineHeight = 28` (bare number) | `lineHeight = { unit: 'PIXELS', value: 28 }` |
| Color values `{ r: 255, g: 0, b: 0 }` | Colors are 0–1 range: `{ r: 1, g: 0, b: 0 }` |
| Mutate fills/strokes in place | Clone array, modify, reassign: `frame.fills = [...frame.fills, newFill]` |

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

```js
const comp = figma.createComponent();
comp.name = 'SectionWrapper';
comp.layoutMode = 'VERTICAL';
comp.primaryAxisSizingMode = 'AUTO';
comp.counterAxisSizingMode = 'FIXED';
comp.resize(1440, 100);
comp.itemSpacing = 48;
comp.paddingTop = 96; comp.paddingBottom = 96;
comp.counterAxisAlignItems = 'CENTER';

// Section heading (fixed, defined in component)
const heading = figma.createFrame();
heading.name = 'SectionHeader';
// ... build heading with decorative lines + Oxanium text ...
comp.appendChild(heading);

// Slot placeholder (user converts this to a real slot)
const slotFrame = figma.createFrame();
slotFrame.name = '[SLOT] body'; // naming convention: [SLOT] prefix
slotFrame.layoutMode = 'VERTICAL';
slotFrame.primaryAxisSizingMode = 'AUTO';
slotFrame.counterAxisSizingMode = 'FIXED';
slotFrame.resize(1200, 100);
slotFrame.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 1 }, opacity: 0.1 }]; // visible hint
comp.appendChild(slotFrame);
slotFrame.layoutSizingHorizontal = 'FILL'; // set AFTER appendChild
```

**When to call user for slot conversion:**
- After all `SectionWrapper` variants are created on the DS page
- Say: "コンポーネント `SectionWrapper` の `[SLOT] body` フレームを `⌘⇧S` でスロットに変換してください"

### Component Naming Convention

```
{project}/{category}/{name}/{variant}

Examples:
  DM/Common/SectionWrapper/Default
  DM/Common/Button/Primary
  DM/Common/Button/Secondary
  DM/Common/NewsRow/Default
  DM/Navigation/Header/PC
  DM/Navigation/Header/SP
```

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

## Checklist Before Each `use_figma` Call

- [ ] `return` sends output (NOT `figma.closePlugin()`)
- [ ] All colors in 0–1 range
- [ ] `lineHeight` / `letterSpacing` use `{ unit, value }` format
- [ ] `layoutSizingHorizontal/Vertical = 'FILL'` set AFTER `appendChild`
- [ ] `await figma.setCurrentPageAsync(page)` for page switching
- [ ] Every created/mutated node ID included in `return`
- [ ] Working incrementally (one section per call, validate after each)
