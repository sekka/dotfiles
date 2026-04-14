---
name: user-doc-design-spec
description: Use when creating UI design documentation before Figma work or coding: text wireframes, layout specifications, design system definitions (colors, typography, spacing tokens), component state inventories, or design handoff documents. Outputs Markdown specs, not code. To generate UI code directly, use the frontend-design skill instead.
disable-model-invocation: false
---

# UI Design Specification

## Overview

A skill for designing UIs that are not just visually appealing, but also implementable within a rapid development cycle. Covers modern design trends, platform-specific guidelines, component design, and the delicate balance between innovation and usability.

## Iron Law

1. Do not propose designs that cannot be implemented.
2. Do not skip responsive support.

## Execution Flow

### Step 1: Wireframes and Information Architecture

Create ASCII wireframes for each major breakpoint. Design placement of navigation, CTAs, forms, and key elements. Annotate intent and user-flow transitions. Apply eye-flow patterns (F-pattern for text-heavy, Z-pattern for visual-heavy, Gutenberg diagonal for scanning). Use size, position, color, and whitespace to express visual priority.

```markdown
## [Page Name] Wireframe

### Layout Structure (Desktop)
┌─────────────────────────────────────┐
│ [Header]                            │
│ Logo | Nav | Search | User Menu     │
├─────────────────────────────────────┤
│ [Hero Section]                      │
│ H1: Main Message                    │
│ Subheading                          │
│ [Primary CTA] [Secondary CTA]       │
├─────────────────────────────────────┤
│ [Main Content]                      │
│ ┌───────┐ ┌───────┐ ┌───────┐     │
│ │Card 1 │ │Card 2 │ │Card 3 │     │
│ └───────┘ └───────┘ └───────┘     │
└─────────────────────────────────────┘

### Responsive (Mobile)
- Header: Hamburger menu
- Hero: Single column layout
- Cards: Stacked layout
```

### Step 2: Layout and Grid Design

> Token values and CSS examples: see [`references/css-tokens.md`](references/css-tokens.md)

Use a 12-column grid with `max-width: 1280px` container. Apply the 4px/8px spacing grid. Use `gap: 1.5rem` between grid columns. Specify how column spans change per breakpoint (e.g., `span 4` desktop → `span 12` mobile). Group spacing rules: related elements (4–8px), within section (16–24px), between sections (32–64px).

### Step 3: Typography Design

> Token values and CSS examples: see [`references/css-tokens.md`](references/css-tokens.md)

Select a font pairing appropriate for the brand tone:

| Use | Combination | Characteristics |
|------|------------|------|
| Modern / minimal | Inter | Clean and readable |
| Elegant | Playfair Display + Lato | Serif × sans-serif |
| Tech | Space Grotesk + IBM Plex Sans | Technical and trustworthy |
| Business | Roboto + Open Sans | Versatile |

Define the type scale from `--text-xs` (12px) to `--text-5xl` (60px desktop). Set line height 1.2–1.3 for headings, 1.5–1.7 for body. Set letter spacing 0.05em for uppercase headings, 0.01em for small text.

### Step 4: Color System

> Token values and CSS examples: see [`references/css-tokens.md`](references/css-tokens.md)

Define a primary palette with shades 50–900. Add semantic colors: success, warning, error, info, and a grayscale neutral set. Verify contrast ratios: AA minimum 4.5:1 (normal text), AAA recommended 7:1. Use WebAIM Contrast Checker or Chrome DevTools Accessibility Pane.

### Step 5: Component Design

Define all required states for each component. Use a checklist to avoid gaps.

```markdown
## Button Component

### States
- [ ] Default (initial state)
- [ ] Hover (mouse over)
- [ ] Focus (keyboard focus)
- [ ] Active (clicking)
- [ ] Disabled
- [ ] Loading

### Variants
- Primary (main action)
- Secondary (supporting action)
- Outline (border only)
- Ghost (transparent background)
- Danger (destructive actions like delete)

### Sizes
- Small (32px height)
- Medium (40px height) - default
- Large (48px height)
```

**Basic components:** Button, Input/Textarea, Select/Dropdown, Checkbox/Radio, Toggle/Switch, Badge/Tag, Avatar, Icon.

**Composite components:** Card, Modal/Dialog, Dropdown Menu, Tabs, Accordion, Navigation Bar, Breadcrumb, Pagination.

### Step 6: Responsive Design

> Token values and CSS examples: see [`references/css-tokens.md`](references/css-tokens.md)

Use Tailwind-based breakpoints: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px. Write mobile-first CSS — base styles for mobile, then override at each breakpoint with `@media (min-width: ...)`. For modern component-scoped layouts, prefer container queries (`container-type: inline-size`).

### Step 7: Interactions and Animations

> Token values and CSS examples: see [`references/css-tokens.md`](references/css-tokens.md)

Define easing and duration tokens: `--ease-out` for exits, `--ease-in-out` for transitions, `--duration-fast` (150ms) for hover, `--duration-base` (200ms) for standard, `--duration-slow` (300ms) for deliberate motion. Specify button hover (`translateY(-2px)` + shadow), focus rings, and loading spinners. Keep animations purposeful — avoid motion that does not communicate state.

### Step 8: Design Tokens

> Token values and CSS examples: see [`references/css-tokens.md`](references/css-tokens.md)

Output tokens in two formats: JSON (for design tool import / Style Dictionary) and CSS Variables (for direct browser use). Token categories: color, spacing, fontSize, borderRadius, shadow, animation. Name tokens semantically (`--color-primary-500`, not `--blue`).

### Step 9: Platform-Specific Guidelines

> Platform comparison table: see [`references/css-tokens.md`](references/css-tokens.md)

Tailor specs to the target platform:

- **iOS**: SF Pro font; 44×44pt minimum tap target; respect HIG components and gesture patterns.
- **Android**: Roboto font; 48×48dp minimum tap target; use elevation shadows for hierarchy; FAB pattern.
- **Web**: System font stack; 48×48px minimum tap target; clear hover states; full keyboard navigation support.

### Step 10: Design Handoff

> Component spec template: see [`references/css-tokens.md`](references/css-tokens.md)

Write a developer spec per component covering: Props (name, type, options), Styles (height, padding, border-radius, font-weight), Colors with CSS variable references, and Accessibility requirements (aria attributes, focus behavior, keyboard support).

**Asset prep:**
- Icons: SVG inline (Heroicons, Lucide, or Phosphor; sizes 16/20/24/32px)
- Photos: WebP/AVIF with 2x/3x Retina variants
- Logos: SVG (scalable)

## Output Deliverables

1. **Wireframes**: Layout options per major breakpoint
2. **Design system document**: Rules for colors, typography, and spacing
3. **Component library**: Component specs including all states
4. **Design tokens**: JSON / CSS Variables format
5. **Interactive prototype**: Verify the behavior of main flows
6. **Developer implementation notes**: Tailwind classes, CSS specs
7. **Animation specs**: Transitions, easing, and durations

## Best Practices

1. **Simplicity First**: Complex designs take longer to implement.
2. **Component Reuse**: Design once, use everywhere.
3. **Standard Patterns**: Do not reinvent common interactions.
4. **Progressive Enhancement**: Prioritize the core experience, then add delight.
5. **Performance Conscious**: Beautiful and lightweight.
6. **Accessibility Built-in**: WCAG compliant from the start.

## Tips for Faster Implementation

**Useful tools:**

- **Tailwind UI**: High-quality component templates
- **Shadcn/ui**: Customizable component library
- **Heroicons**: Consistent icon set
- **Radix UI**: Accessible primitive components
- **Framer Motion**: Preset animations

## CSS Knowledge Reference

When implementing designs with modern CSS techniques, use the `user-fe-knowledge` skill to search the knowledge base.

**Note:** Always verify with Context7 or MDN for the latest browser support. For UI patterns achievable without JavaScript (accordion, popover, etc.), prefer CSS-only implementations.

## Related Skills & Skill Selection Guide

For the full skill selection guide, workflow patterns, and FAQ, see [`references/skill-selection-guide.md`](references/skill-selection-guide.md).

Key sister skills: `user-figma-build` (Figma implementation after specs), `user-fe-develop` (code implementation), `user-research-design-dna` (brand DNA extraction before specs).
