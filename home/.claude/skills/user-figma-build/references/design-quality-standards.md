# Figma Design Quality Standards

High Figma structure quality = significantly better AI-generated code.
Benchmark: Auto Layout + Variables + semantic naming → **32/35** quality score vs. **10/35** for flat/unstructured designs.

## Required for all frames

| Requirement | What it enables |
|-------------|-----------------|
| **Auto Layout** on ALL frames | CSS flex/grid extraction; absolute positioning breaks responsive output |
| **Variables** for all colors | Token-based path mapping; prevents scattered hex values |
| **Variables** for spacing | CSS custom property generation |
| **Variables** for border-radius | Consistent radius across all components |
| **Semantic layer naming** | AI uses names as code identifiers — "EmailInput" vs "Rectangle 4" |
| **Logical grouping hierarchy** | Enables accurate component boundary detection |

## Spacing token system

Implement as Figma Variables under `spacing/*`:

| Token | Value |
|-------|-------|
| `spacing/xs` | 4px |
| `spacing/s` | 8px |
| `spacing/m` | 16px |
| `spacing/l` | 24px |
| `spacing/xl` | 40px |

## letter-spacing rule

**ALWAYS specify letter-spacing in PERCENT (%) in Figma.** Never use px.
Implementation converts automatically: Figma N% → CSS `letter-spacing: (N / 100)em`
Example: Figma 5% → `letter-spacing: 0.05em`

## Line-height recommendation

Body text: **160%–180%** in Figma → `line-height: 1.6`–`1.8` in CSS

## Semantic naming guide

| Anti-pattern | Correct example |
|-------------|-----------------|
| Rectangle 4 | Button/Primary |
| Frame 23 | Card/NewsItem |
| Group 1 | Header/Navigation |
| Text | Label/Category |

## Anti-patterns that reduce AI output quality

- Absolute positioning instead of Auto Layout → breaks responsive extraction
- Hardcoded hex values → blocks token path mapping (same color can appear 14+ times)
- Flat layer hierarchy → prevents component boundary detection
- Default naming (Rectangle, Frame, Group, Text) → zero semantic context for AI
- letter-spacing in px → incompatible with em-based CSS conversion
