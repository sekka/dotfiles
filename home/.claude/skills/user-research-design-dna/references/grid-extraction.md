# Grid Extraction

Run this JS via `agent-browser eval` after Step 4 (component screenshots).

## JavaScript

```javascript
(() => {
  const sheets = [...document.styleSheets];
  const result = { maxWidth: null, columns: null, gutter: null, margin: null, breakpoints: [] };

  // Find max-width container
  const containerSelectors = [
    '.container', '[class*="container"]', '[class*="wrapper"]',
    'main', '[class*="max-w-"]', '[class*="max-width"]'
  ];
  for (const sel of containerSelectors) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const style = getComputedStyle(el);
    if (style.maxWidth && style.maxWidth !== 'none') {
      result.maxWidth = style.maxWidth;
      result.margin = style.paddingLeft || style.marginLeft;
      break;
    }
  }

  // Find grid elements — restrict to container elements to avoid 500 getComputedStyle calls
  const candidates = [...document.querySelectorAll(
    'div, section, main, article, ul, ol, header, footer, nav, aside'
  )].slice(0, 200);
  for (const el of candidates) {
    const style = getComputedStyle(el);
    if (style.display === 'grid') {
      const cols = style.gridTemplateColumns;
      if (cols && cols !== 'none' && cols !== '') {
        const colStr = cols.trim();
        const repeatMatch = colStr.match(/^repeat\(\s*(\d+)/);
        const count = repeatMatch ? parseInt(repeatMatch[1]) : colStr.split(/\s+/).length;
        if (!result.columns || count > result.columns) result.columns = count;
        result.gutter = style.gap || style.columnGap || null;
      }
    }
  }

  // Extract breakpoints from @media rules
  try {
    sheets.forEach(sheet => {
      try {
        ;[...(sheet.cssRules || [])].forEach(rule => {
          if (rule.type === CSSRule.MEDIA_RULE) {
            const text = rule.conditionText || (rule.media && rule.media.mediaText) || '';
            const m = text.match(/min-width:\s*([\d.]+(?:px|em|rem))/);
            if (m) result.breakpoints.push(m[1]);
          }
        });
      } catch (_) {}
    });
  } catch (_) {}

  result.breakpoints = [...new Set(result.breakpoints)].sort((a, b) => parseFloat(a) - parseFloat(b));
  return JSON.stringify(result, null, 2);
})()
```

## Fallback

If `agent-browser eval` fails (CORS, CSP, or site uses no CSS Grid):

1. Note in `tokens.yaml` grid section: `# grid: inferred from visual analysis (eval failed)`
2. Pass full-page screenshot to AI: "このページのグリッドシステムを視覚的に推定してください（カラム数、余白、max-width）"
3. Use AI's estimate, mark values with `# estimated` comment in YAML

## Usage

```bash
agent-browser eval '<paste JS above>'
```

Save the JSON result. It feeds into the AI analysis prompt (Step 5b) and into `tokens.yaml`.

## tokens.yaml grid section

Add to the root level of `tokens.yaml`:

```yaml
grid:
  max_width: "1280px"      # from result.maxWidth
  columns: 12              # from result.columns
  gutter: "24px"           # from result.gutter
  margin: "80px"           # from result.margin
  breakpoints:
    - "640px"
    - "768px"
    - "1024px"
    - "1280px"
```
