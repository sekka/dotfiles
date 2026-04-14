# Skill Selection Guide

Reference material for `user-doc-design-spec`. Contains the related skills table, workflow phases, skill selection by task, workflow patterns, and FAQ.

---

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

---

## Workflow Phases

| Phase | Main Skill | Supporting Skill | Output |
|-------|-----------|-----------------|--------|
| **1. Brand/competitive research** | `user-research-design-dna` | `user-research-websites` | DESIGN.md, color/typography tokens |
| **2. Requirements** | `user-doc-spec` | — | RTM |
| **3. UI spec (text)** | `user-doc-design-spec` | — | Wireframes, design system definition |
| **4. Figma build** | `user-figma-build` | — | Figma design |
| **5. Design gate** | `user-figma-gate` | — | PASS/FAIL verdict |
| **6. Code implementation** | `user-fe-develop` | `user-fe-knowledge` | React/Tailwind code |
| **7. Figma → Code** | `user-figma-implement` | — | Component code |
| **8. QA** | `user-fe-html` | `user-fe-vrt` | A11y report, VRT report |

---

## Skill Selection by Task

### Design Phase

| Task | Skill |
|------|-------|
| Extract brand colors, typography from reference sites | `user-research-design-dna` |
| Create wireframes and layout specs | `user-doc-design-spec` |
| Define component states and variants | `user-doc-design-spec` |
| Define design tokens (JSON / CSS Variables) | `user-doc-design-spec` |

### Implementation Phase

| Task | Skill |
|------|-------|
| Look up modern CSS/Tailwind techniques | `user-fe-knowledge` |
| Implement React/Vue/HTML components | `user-fe-develop` |
| Convert Figma design to code | `user-figma-implement` |
| CSS animations and transitions | `user-fe-develop` + `user-fe-knowledge` |

### QA Phase

| Task | Skill |
|------|-------|
| WCAG accessibility check | `user-fe-html` |
| Verify Figma ↔ RTM coverage before coding | `user-figma-gate` |
| Visual regression test | `user-fe-vrt` |

---

## Workflow Patterns

### Pattern 1: UI Design from Scratch

```
1. user-research-design-dna  — Extract brand DNA from reference sites
   ↓
2. user-doc-spec             — Convert brief → RTM
   ↓
3. user-doc-design-spec      — Text wireframes, design system spec
   ↓
4. user-figma-build          — Build in Figma
   ↓
5. user-figma-gate           — RTM coverage gate
   ↓
6. user-fe-develop           — Implement
   ↓
7. user-fe-html              — A11y check
```

### Pattern 2: Implement from Figma Design

```
1. user-figma-gate           — Verify Figma covers RTM requirements
   ↓
2. user-figma-implement      — Figma → HTML/CSS code
   ↓
3. user-fe-html              — Semantics and a11y audit
```

### Pattern 3: Improve Existing UI

```
1. user-fe-html              — Audit current state
   ↓
2. user-doc-design-spec      — Design improvements (wireframes, new specs)
   ↓
3. user-fe-develop           — Apply improved code
```

---

## FAQ

**Q: Which skills do I need to implement a Figma design?**

1. `user-figma-gate` — verify Figma covers all RTM requirements
2. `user-figma-implement` — convert Figma → HTML/CSS code
3. `user-fe-html` — post-implementation accessibility check

**Q: Which skill for the latest CSS techniques?**

- Look up techniques → `user-fe-knowledge`
- Write implementation code → `user-fe-develop`
- Create design specs → `user-doc-design-spec`

**Q: How to use competitor sites as design reference?**

- Extract design DNA (colors, typography, motion) → `user-research-design-dna`
- Analyze site structure and content → `user-research-websites`
