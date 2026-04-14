# Design Token Setup — Code Examples

## Color Variables

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
];

for (const c of colors) {
  const v = figma.variables.createVariable(c.name, collection, 'COLOR');
  v.setValueForMode(modeId, hexToRgb(c.hex));
  v.scopes = c.scopes; // ALWAYS set scopes explicitly — never leave as ALL_SCOPES
}
```

## Scope Rules

| Variable type | Correct scopes |
|--------------|----------------|
| Background colors | `['FRAME_FILL', 'SHAPE_FILL']` |
| Text colors | `['TEXT_FILL']` |
| Accent/stroke | `['FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR']` |
| Spacing | `['GAP']` |

## Text Styles

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
ts.letterSpacing = { unit: 'PERCENT', value: 0 }; // ALWAYS PERCENT. Converts to em in CSS: N% → (N/100)em
```

Naming convention: `{project}/{role}/{variant}` — e.g. `dm/heading/h1-pc`, `dm/label/nav`
