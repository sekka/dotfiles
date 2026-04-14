# Implementation Guide

## Layout Implementation

```css
/* Figma Auto Layout → CSS Flexbox */
direction: horizontal → flex-direction: row
direction: vertical   → flex-direction: column
spacing: 16           → gap: 1rem
padding: [8, 16, 8, 16] → padding: 0.5rem 1rem

/* Figma Constraints */
Fill container → flex: 1 or width: 100%
Fixed width    → width: [px]
Hug contents   → width: fit-content
```

## Typography Implementation

```css
/* Apply Figma values directly to CSS */
font-size: [Figma value]px
line-height: [Figma value]px → recommended to convert to em: calc([value]px / [font-size]px)
font-weight: [Figma weight]
/* letter-spacing: Figma では必ず PERCENT (%) で指定。実装時は em に変換 — px 禁止 */
/* 変換式: Figma N% → CSS letter-spacing: (N / 100)em */
/* 例: Figma 5% → letter-spacing: 0.05em */
letter-spacing: [figma-percent / 100]em;
```

## Color Implementation

Prefer variables from `get_variable_defs`. Hardcoding is a last resort:
```css
/* Good: variable reference */
color: var(--color-primary-500);
background: var(--color-gray-100);

/* If no Design Token, write HEX directly */
color: #3b82f6;

/* Token path mapping: prefer full variable path over hex fallback */
/* get_variable_defs path: color/core/content/primary → --color-core-content-primary */
/* Path-based mapping eliminates misidentification risk for visually similar colors */
/* (e.g., #F7F7F7 vs #F0F0F0 — hex fallback alone risks wrong token assignment) */
```
