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

#### Creating Wireframes

**Goals:**

- Propose information design and section layout that matches the purpose.
- Design placement of key elements such as navigation, CTAs, and forms.
- Create layout options for each breakpoint.
- Organize user flows and screen transitions.
- Use annotated wireframes to clarify intent and states.

**Deliverables:**

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

#### Information Design Principles

**Eye flow:**

- F-pattern (text-heavy)
- Z-pattern (visual-heavy)
- Gutenberg diagram (diagonal scan)

**Visualizing priority:**

- Use size and position to express importance.
- Use color and contrast to guide attention.
- Use whitespace to group elements.

### Step 2: Layout and Grid Design

#### Grid System

**12-column grid (recommended):**

```css
/* Container */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

/* Responsive example */
.col-span-4 {
  grid-column: span 4; /* Desktop: 3 columns */
}

@media (max-width: 768px) {
  .col-span-4 {
    grid-column: span 12; /* Mobile: 1 column */
  }
}
```

#### Spacing System

**4px/8px grid:**

```css
/* Tailwind-based spacing */
--spacing-1:  0.25rem;  /* 4px  - tight */
--spacing-2:  0.5rem;   /* 8px  - small */
--spacing-4:  1rem;     /* 16px - medium (standard) */
--spacing-6:  1.5rem;   /* 24px - between sections */
--spacing-8:  2rem;     /* 32px - large */
--spacing-12: 3rem;     /* 48px - hero */
--spacing-16: 4rem;     /* 64px - extra large */
```

**Spacing rules:**

- Related elements: small spacing (4-8px)
- Within a section: medium spacing (16-24px)
- Between sections: large spacing (32-64px)

### Step 3: Typography Design

#### Font Selection

**Recommended font pairings:**

| Use | Combination | Characteristics |
|------|------------|------|
| Modern / minimal | Inter | Clean and readable |
| Elegant | Playfair Display + Lato | Serif × sans-serif |
| Tech | Space Grotesk + IBM Plex Sans | Technical and trustworthy |
| Business | Roboto + Open Sans | Versatile |

#### Type Scale (mobile-first)

```css
/* Mobile */
--text-xs:   0.75rem;  /* 12px - caption */
--text-sm:   0.875rem; /* 14px - secondary */
--text-base: 1rem;     /* 16px - body */
--text-lg:   1.125rem; /* 18px - emphasized body */
--text-xl:   1.25rem;  /* 20px - H3 */
--text-2xl:  1.5rem;   /* 24px - H2 */
--text-3xl:  1.875rem; /* 30px - H1 */
--text-4xl:  2.25rem;  /* 36px - Display */

/* Desktop (slightly larger) */
@media (min-width: 768px) {
  --text-3xl: 2.25rem;  /* 36px */
  --text-4xl: 3rem;     /* 48px */
  --text-5xl: 3.75rem;  /* 60px */
}
```

#### Typography Rules

**Line height:**

- Headings: 1.2–1.3
- Body: 1.5–1.7
- Captions: 1.4

**Letter spacing:**

- Uppercase headings: 0.05em (wider)
- Normal: 0 (default)
- Small text: 0.01em (slightly wider)

### Step 4: Color System

#### Color Palette Design

**Primary color (shades 50–900):**

```css
/* Example: Blue palette */
--color-primary-50:  #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6;  /* Base color */
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;
```

#### Semantic Colors

```css
/* Success */
--color-success: #10b981;

/* Warning */
--color-warning: #f59e0b;

/* Error */
--color-error: #ef4444;

/* Info */
--color-info: #3b82f6;

/* Neutral (grayscale) */
--color-gray-50:  #f9fafb;
--color-gray-500: #6b7280;
--color-gray-900: #111827;
```

#### Ensuring Accessibility

**WCAG contrast ratios:**

- AA (minimum): Normal text 4.5:1, large text 3:1
- AAA (recommended): Normal text 7:1, large text 4.5:1

**Check tools:**

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools: Accessibility Pane

### Step 5: Component Design

#### Defining Component States

**Required states:**

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

#### Component Library Structure

**Basic components:**

- Button
- Input / Textarea
- Select / Dropdown
- Checkbox / Radio
- Toggle / Switch
- Badge / Tag
- Avatar
- Icon

**Composite components:**

- Card
- Modal / Dialog
- Dropdown Menu
- Tabs
- Accordion
- Navigation Bar
- Breadcrumb
- Pagination

### Step 6: Responsive Design

#### Breakpoints

```css
/* Tailwind-based breakpoints */
--breakpoint-sm: 640px;   /* Mobile (landscape) */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Laptop */
--breakpoint-xl: 1280px;  /* Desktop */
--breakpoint-2xl: 1536px; /* Large desktop */
```

#### Responsive Strategy

**Mobile-first:**

```css
/* Base styles (mobile) */
.card {
  width: 100%;
  padding: 1rem;
}

/* Tablet and above */
@media (min-width: 768px) {
  .card {
    width: 50%;
    padding: 1.5rem;
  }
}

/* Desktop and above */
@media (min-width: 1024px) {
  .card {
    width: 33.333%;
    padding: 2rem;
  }
}
```

**Container queries (modern approach):**

```css
/* Changes based on the component's own size */
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: flex;
    flex-direction: row;
  }
}
```

### Step 7: Interactions and Animations

#### Micro-interactions

**Transition settings:**

```css
/* Easing functions */
--ease-in:     cubic-bezier(0.4, 0, 1, 1);
--ease-out:    cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Durations */
--duration-fast:   150ms;  /* Quick (hover, etc.) */
--duration-base:   200ms;  /* Standard */
--duration-slow:   300ms;  /* Slow */
--duration-slower: 500ms;  /* Special effects */
```

**Animation examples:**

```css
/* Button hover */
.button {
  transition: all var(--duration-base) var(--ease-out);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Loading spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

### Step 8: Design Tokens

#### Token Definition

**JSON format:**

```json
{
  "color": {
    "primary": {
      "500": { "value": "#3b82f6" }
    }
  },
  "spacing": {
    "4": { "value": "1rem" }
  },
  "fontSize": {
    "base": { "value": "1rem" },
    "lg": { "value": "1.125rem" }
  },
  "borderRadius": {
    "md": { "value": "0.375rem" }
  }
}
```

**CSS Variables (implementation):**

```css
:root {
  /* Colors */
  --color-primary-500: #3b82f6;

  /* Spacing */
  --spacing-4: 1rem;

  /* Typography */
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;

  /* Border Radius */
  --radius-md: 0.375rem;
}
```

### Step 9: Platform-Specific Guidelines

#### iOS (Human Interface Guidelines)

**Characteristics:**

- SF Pro / SF Compact fonts
- Minimum tap target: 44×44pt
- Respect iOS standard components
- Gestures: swipe, pinch, long press

#### Android (Material Design)

**Characteristics:**

- Roboto font
- Minimum tap target: 48×48dp
- Use elevation (shadow) to express UI hierarchy
- Use FAB (Floating Action Button)

#### Web (Responsive)

**Characteristics:**

- System font stack
- Minimum tap target: 48×48px
- Show hover states clearly
- Support keyboard navigation

### Step 10: Design Handoff

#### Developer Specification

**Component spec:**

```markdown
## Button Component

### Props
- variant: 'primary' | 'secondary' | 'outline'
- size: 'sm' | 'md' | 'lg'
- disabled: boolean
- loading: boolean

### Styles
- Height: 40px (md), 32px (sm), 48px (lg)
- Padding: 0 1rem
- Border Radius: 0.375rem
- Font Weight: 500

### Colors (Primary)
- Background: var(--color-primary-500)
- Text: white
- Hover: var(--color-primary-600)
- Active: var(--color-primary-700)
- Disabled: var(--color-gray-300)

### Accessibility
- aria-label or text content required
- Focus visible outline
- Keyboard accessible (Enter, Space)
```

#### Asset Preparation

**Images:**

- SVG: icons, logos (scalable)
- WebP/AVIF: photos (next-gen formats)
- 2x/3x: Retina support

**Icon system:**

- Recommended: Heroicons, Lucide, Phosphor Icons
- Sizes: 16px, 20px, 24px, 32px
- Format: SVG (inline recommended)

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

## Related Skills

| Skill | When to use |
|-------|-------------|
| `user-research-design-dna` | Before designing — extract brand DNA (colors, typography, motion) from reference sites |
| `user-doc-spec` | Convert client brief → RTM before creating design specs |
| `user-figma-build` | After specs are defined — build design system in Figma (Code → Figma) |
| `user-figma-gate` | After Figma is complete — RTM coverage gate before coding starts |
| `user-figma-implement` | Convert completed Figma designs to HTML/CSS code (Figma → Code) |
| `user-fe-develop` | Frontend implementation once design specs are ready |
| `user-fe-knowledge` | Reference for modern CSS/JS techniques during implementation |
| `user-fe-html` | HTML semantics and accessibility audit after implementation |
