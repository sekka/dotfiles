# CSS Tokens & Design System Reference

Reference material for `user-doc-design-spec`. Contains CSS code blocks extracted from the main SKILL.md to keep it concise.

---

## Grid System

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

---

## Spacing System

**4px/8px grid (Tailwind-based):**

```css
--spacing-1:  0.25rem;  /* 4px  - tight */
--spacing-2:  0.5rem;   /* 8px  - small */
--spacing-4:  1rem;     /* 16px - medium (standard) */
--spacing-6:  1.5rem;   /* 24px - between sections */
--spacing-8:  2rem;     /* 32px - large */
--spacing-12: 3rem;     /* 48px - hero */
--spacing-16: 4rem;     /* 64px - extra large */
```

**Spacing rules:**

- Related elements: small spacing (4–8px)
- Within a section: medium spacing (16–24px)
- Between sections: large spacing (32–64px)

---

## Typography Scale

**Mobile-first type scale:**

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

**Line height:**

- Headings: 1.2–1.3
- Body: 1.5–1.7
- Captions: 1.4

**Letter spacing:**

- Uppercase headings: 0.05em (wider)
- Normal: 0 (default)
- Small text: 0.01em (slightly wider)

---

## Color Palette

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

**Semantic colors:**

```css
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error:   #ef4444;
--color-info:    #3b82f6;

/* Neutral (grayscale) */
--color-gray-50:  #f9fafb;
--color-gray-500: #6b7280;
--color-gray-900: #111827;
```

**WCAG contrast ratios:**

- AA (minimum): Normal text 4.5:1, large text 3:1
- AAA (recommended): Normal text 7:1, large text 4.5:1

---

## Design Tokens

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

**CSS Variables — `:root` implementation:**

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

---

## Animation & Motion

**Easing functions and durations:**

```css
--ease-in:     cubic-bezier(0.4, 0, 1, 1);
--ease-out:    cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

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

---

## Responsive CSS Examples

**Mobile-first `.card` example:**

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

**Breakpoints (Tailwind-based):**

```css
--breakpoint-sm: 640px;   /* Mobile (landscape) */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Laptop */
--breakpoint-xl: 1280px;  /* Desktop */
--breakpoint-2xl: 1536px; /* Large desktop */
```

---

## Platform-Specific Guidelines

| Platform | Font | Min tap target | Notes |
|----------|------|----------------|-------|
| iOS | SF Pro / SF Compact | 44×44pt | Respect HIG components; swipe, pinch, long press gestures |
| Android | Roboto | 48×48dp | Use elevation for UI hierarchy; FAB pattern |
| Web | System font stack | 48×48px | Show hover states; support keyboard navigation |

---

## Button Component Handoff Spec

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
