# Auto Layout Patterns — Code Examples

## Standard Section Pattern

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

## Inner Container (centered content with max-width)

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

## Horizontal Row

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

## Header Pattern

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

## Layout Grids

### Standard 12-Column Grid (1440px → 1200px content)

```js
frame.layoutGrids = [
  {
    pattern: 'COLUMNS',
    alignment: 'CENTER',   // auto-centers: margin = (1440 - 12*78 - 11*24) / 2 = 120px
    count: 12,
    gutterSize: 24,
    sectionSize: 78,       // column width
    visible: true,
    color: { r: 0.01, g: 0.79, b: 0.59, a: 0.08 },
  },
  {
    pattern: 'ROWS',
    alignment: 'MIN',
    count: 200,
    gutterSize: 8,
    sectionSize: 8,        // 8px baseline grid
    offset: 0,             // REQUIRED even for MIN — omitting throws
    visible: true,
    color: { r: 1, g: 1, b: 1, a: 0.025 },
  },
];

// Page-level guides
page.guides = [
  { axis: 'X', offset: 120 },   // left content margin
  { axis: 'X', offset: 720 },   // center axis
  { axis: 'X', offset: 1320 },  // right content margin
  { axis: 'Y', offset: 72 },    // header bottom
];
```

Grid API rules:
- `COLUMNS` + `CENTER`: **no `offset` field** — auto-calculated
- `ROWS` + `MIN`: **`offset` is required** (use `offset: 0`)
- `page.guides` sets ruler guides at page level (not on frames)
