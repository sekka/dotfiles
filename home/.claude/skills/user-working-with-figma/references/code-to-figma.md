# Code → Figma via MCP (generate_figma_design)

A reverse workflow: capture a **running local page** and push it into Figma as a design.
This is separate from the Plugin API approach in `user-building-figma`.

## Prerequisites

```bash
# Node.js 24+ required
node --version  # must be v24+

# Add Figma MCP remote server (one-time)
claude mcp add --transport http figma https://mcp.figma.com/mcp
# Then authenticate in the browser when prompted
```

## When to use

- Stakeholder review: quickly share current implementation as a Figma frame
- Discussion phase: let non-developers inspect and annotate in Figma
- Snapshot before a refactor

## How it works

1. Start your local dev server (`localhost:3000` etc.)
2. Ask Claude Code: "このページをFigmaに書き出して"
3. Claude calls `generate_figma_design` → JS is injected into the page → layout is captured
4. Choose output: new Figma file / existing file / clipboard

## Limitations

- Requires a running local server (not a static file)
- Requires a paid Figma plan (unverified — confirm before use on free tier)
- Output is a visual snapshot, not editable components
- Complex CSS (masks, clip-path, blend modes) may not transfer accurately
- For fully editable design systems, use `user-building-figma` (Plugin API) instead
