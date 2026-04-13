# Figma AI Image Workflow Reference

Source: [Workflow Lab: AI Image Tooling and Interactive Prototyping in Figma](https://www.figma.com/blog/workflow-lab-ai-image-tooling/) (Feb 27, 2026)

## Overview

A workflow for moving from design concept to interactive prototype using Figma's AI image editing tools and Figma Make. Useful when testing multiple visual directions before crit or stakeholder review.

---

## Core Tools

| Tool | Purpose | When to use |
|------|---------|-------------|
| **Glass effect** | Frosted surface, refraction, progressive blur | "Locked/gated content" visual metaphor |
| **Remove background** | Strip raster image background | Before Vectorize or compositing |
| **Vectorize** | Convert raster → editable vector | Hand-drawn sketches, illustrations that need brand color editing |
| **Cut tool** | Refine vector edges, trim paths | After Vectorize to clean up rough edges |
| **Bounding boxes** | Rotate anchor points on vectors | Polish small details without losing hand-drawn quality |
| **Erase object** | AI-powered object removal from photos | Remove distracting elements (e.g. a spoon from a food photo) |
| **Expand image** | AI-extend canvas boundaries | Adapt photo proportions to fit layout without distortion |
| **Inline variables search** | Search for brand tokens in fill panel | Apply brand colors to vectorized illustration |

---

## Workflow Patterns

### Pattern 1: Glass / Frosted Modal

For "gated access" UI metaphors (exclusive content, paywalls, locked features):

1. Use relevant component from design system as base
2. Apply slight blur to background photography so content is visible but "out of reach"
3. Add **Glass effect** → frosted surface + refraction for depth
4. Add **progressive blur** on edges to soften the boundary

**Best for:** Modal, overlay, paywall — situations where a visual pause is justified.

---

### Pattern 2: Sketch → Scalable Vector Asset

For in-feed or space-constrained UI where illustration feels lighter than photography:

1. Start with hand-drawn sketch (photo or scanned)
2. **Remove background** to isolate the illustration
3. **Vectorize** → editable vector with paths
4. Search fill panel with **Inline variables search** → apply brand color variables
5. **Cut tool** → trim edges, remove stray paths
6. **Bounding boxes** → rotate anchor points to polish details

Result: reusable, brand-aligned, scalable asset.

---

### Pattern 3: Photo Adaptation (Erase + Expand)

For full-screen overlays or hero sections where photo proportions don't fit the layout:

1. Select the photo — identify distracting elements and proportion issues
2. **Erase object** → remove distracting element (drag to select, AI fills context-aware)
3. **Expand image** → drag blue handles to extend canvas; AI generates context-aware fill
4. Verify the original focal point (food, face, product) is still the hero

**Best for:** Full-screen moments, hero sections, situations where finding a new photo wastes more time than editing.

---

## Prototyping & Crit Workflow

### Step 1: Build interactive prototypes in Figma Make

After completing design directions:
- Import designs into Figma Make using a **shared template** (with built-in styles and structural guidelines)
- Each direction becomes an interactive prototype in minutes
- Enables evaluation of timing, hierarchy, and motion — not just static layout

### Step 2: Embed in FigJam for crit

Instead of sharing individual Figma Make links (hard to compare side-by-side):
- **Embed Figma Make prototypes directly into FigJam**
- Lay all directions out side-by-side
- Team uses comments, stickies, and live reactions to align in real time

**Why FigJam over Figma Design for crit:** Better tools for synchronous annotation and voting across multiple options.

### Step 3: Path to production

After crit alignment on one direction:

| Who | Path |
|-----|------|
| PM / Engineer | Continue iterating in Figma Make before moving to code |
| Designer | Polish in Figma Design → Dev Mode for developer handoff |
| Designer (code-capable) | Use **Figma MCP** to carry design context directly into the build |

---

## When to Apply Each Pattern

| Situation | Recommended pattern |
|-----------|-------------------|
| Gated content, exclusive access metaphor | Pattern 1 (Glass modal) |
| Need personality/illustration, space-constrained | Pattern 2 (Sketch → Vector) |
| Photography doesn't fit layout proportions | Pattern 3 (Erase + Expand) |
| Multiple directions need stakeholder review | FigJam embed crit |
| Design handoff to code | Dev Mode or Figma MCP |

---

## Key Insight

> "A static frame only tells part of the story, which can lead to everyone imagining the experience differently. Feedback can skew toward visuals, allowing ambiguity to creep in. Friction rarely shows up in a screenshot, and clarity often comes through interaction."

Make designs interactive before crit — not after.
