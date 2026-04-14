# Collection Workflow — Detailed Procedures

This file contains the step-by-step procedures for collecting and integrating frontend knowledge.
Referenced by `user-fe-knowledge` SKILL.md.

---

## Step 1: Save the original to raw/_inbox/

When a URL is provided, fetch the content with `WebFetch` and save it **as-is** to `raw/_inbox/YYYY-MM-DD-{slug}.md`.

File format:

```markdown
---
url: [source URL]
fetched_at: [YYYY-MM-DD]
title: [article title]
---

[Body text or important excerpts]
```

**Important**: Do not write to knowledge/ at this stage. Summarizing, classifying, and integrating is done separately in "compile mode".

Report after saving:

```
✅ Saved to raw/_inbox/
📁 raw/_inbox/2026-04-06-{slug}.md
🔗 Source: [URL]

Say "process inbox" to integrate it into knowledge/.
```

---

## Step 2: Summarize and structure

Write as a **data collection that humans can refer to directly**, keeping in mind:

- Add concise explanations to technical terms.
- Make code examples good enough to copy and paste.
- Clearly state "why this approach is better".
- List browser support status with specific details.

Summarize in the following format:

```markdown
## [Technique Name]

> Source: [URL]
> Written: [YYYY-MM-DD] (article's publish/update date; "unknown" if unavailable)
> Added: [YYYY-MM-DD]

[Overview in 1-3 sentences]

### Code Example

\```css
/* or js/html */
[Practical code example]
\```

### Use Cases
- [Specific use case 1]
- [Specific use case 2]

### Notes
- [Browser support, limitations, etc.]

---
```

---

## Step 3: Determine category

Choose the best category from the following:

| Category | File path | Target | Keywords |
|---------|-------------|------|-----------|
| **CSS - Layout** | `knowledge/css/layout/` | Grid, Flexbox, Container Queries, full-bleed | layout, width, height, centering, full-width |
| **CSS - Animation** | `knowledge/css/animation/` | Transitions, View Transitions, Scroll-driven | motion, animation, transition |
| **CSS - Visual** | `knowledge/css/visual/` | filter, clip-path, mask, shape | filter, mask, shape, visual effects |
| **CSS - Typography** | `knowledge/css/typography/` | text-box, fonts, paint-order | text, font |
| **CSS - Selectors** | `knowledge/css/selectors/` | @scope, :has, :is, :where | scope, selector, pseudo-class |
| **CSS - Values** | `knowledge/css/values/` | clamp, viewport units, currentColor | values, units, viewport, custom properties |
| **CSS - Components** | `knowledge/css/components/` | Popover, Anchor Positioning, field-sizing | UI, component, popover |
| **CSS - Theming** | `knowledge/css/theming/` | light-dark, color-scheme | theme, dark mode, color scheme |
| **HTML** | `knowledge/html/` | Modern HTML, semantics, dialog, details | HTML, markup, elements |
| **JavaScript - Patterns** | `knowledge/javascript/patterns/` | DOM, events, async, utilities | JS, DOM, events, patterns |
| **JavaScript - Animation** | `knowledge/javascript/animation/` | requestAnimationFrame, interpolation | JS animation, mathematical interpolation |
| **Performance** | `knowledge/cross-cutting/performance/` | optimization, Core Web Vitals, lazy-load | speed, optimization, LCP, CLS |
| **Accessibility** | `knowledge/cross-cutting/accessibility/` | WCAG, a11y, links | a11y, accessibility, WCAG |
| **Browser Compatibility** | `knowledge/cross-cutting/browser-compat/` | browser bugs, workarounds | bugs, workarounds, Safari, iOS |
| **Apple Style Guide** | `knowledge/apple-style-guide/` | Apple product writing guidelines, UI terms, style guide | Apple, writing, UI terms, product names, style |
| **Human Interface Guidelines** | `knowledge/human-interface-guidelines/` | Apple design principles, iOS/macOS UI design | HIG, Apple design, iOS, macOS, SwiftUI, UIKit |
| **Material Design 3** | `knowledge/material-design-3/` | Google design system, Material You, design philosophy | Material Design, Material You, Google, Dynamic Color |

---

## Step 4: Duplicate check and decide on processing approach

**Important**: Always check for duplicates with existing knowledge before adding.

### 4-1. Search existing knowledge

```bash
# Search by keyword (e.g.: Container Query)
find knowledge -type f -name "*.md" | xargs grep -l "container.*query\|@container"

# Search by file name
find knowledge -type f -name "*container*"
```

### 4-2. Decide on a processing approach

| Situation | Action |
|------|------|
| **Completely new information** | Create a new file |
| **Can be added to an existing file** | Add to the end of the existing file |
| **Update to existing information** | Update the existing section with the Edit tool |
| **Integrate multiple articles** | Integrate information into one file (create or update) |
| **Replacing old information** | Delete the old section and add new information |
| **Clearly old and not useful** | Do not add to knowledge base |

### 4-3. Criteria for "old and not useful"

Do not add to the knowledge base in the following cases:

- **Technologies with ended browser support** (e.g.: IE11-only hacks)
- **Deprecated APIs/syntax** (marked as deprecated in official documentation)
- **Old methods with better alternatives** (e.g.: features that no longer need a polyfill)
- **Implementations with security issues**
- **Articles more than 5 years old that diverge from current standards**

Exceptions:

- **Historically valuable information** (for understanding "why this approach is avoided now")
- **Information needed for legacy code maintenance** (explicitly tagged "legacy")

### 4-4. Deciding when to split or merge

**When to split:**
- A file exceeds 500 lines
- Contains multiple independent topics
- Information from different categories is mixed in

**When to merge:**
- The same topic is spread across multiple files
- Multiple thin files are easier to understand as one
- Strongly related topics (e.g.: Container Query and Container Query Units)

---

## Step 5: Update the file

1. Read `~/.claude/skills/user-fe-knowledge/knowledge/[category]/[filename].md`
2. Update according to the processing approach:
   - **New**: Create a new file with the Write tool
   - **Append**: Add to the end of the existing file with the Edit tool
   - **Update**: Replace the existing section with the Edit tool
   - **Merge**: Merge content from multiple files into one
3. If the file does not exist, create it and add YAML frontmatter.
4. YAML frontmatter format:
   ```yaml
   ---
   title: Title
   category: css/layout (category path)
   tags: [tag1, tag2, tag3]
   browser_support: Browser support status
   created: YYYY-MM-DD
   updated: YYYY-MM-DD
   ---
   ```

---

## Step 6: Confirm

After addition is complete, report:

- Name of the technique added
- Target category
- Preview of the summary

Output example:

```
✅ Added to knowledge

📁 Category: css/layout/
📝 Technique: Practical patterns for Container Queries
🔗 Source: https://example.com/container-queries

### Added content preview:
> A method to achieve component-level responsive design
> using container queries...
```

---

## Articles with multiple techniques

When a single article contains multiple techniques:

- Add each technique as a separate entry.
- Include the same source URL.
- Add cross-references if they are related.

---

## Articles spanning multiple categories

When an article is relevant to multiple categories, **do not force it all into one file**.

| Situation | Action |
|------|------|
| One main topic, other categories are supplementary | Add to main category, other categories get reference links only |
| Contains multiple independent topics | Split and add to each category |
| Closely related across categories | Add to each category and include cross-references |

Rules when splitting:

1. **Make each file self-contained**: Understandable by reading that file alone.
2. **Minimize duplication**: Only overview for shared content, details in the appropriate category.
3. **State cross-references clearly**: Always add links to related knowledge.

Report format:

```
✅ Added to knowledge (split into 2 categories)

📁 accessibility-link-underline.md
   📝 Consideration for prefers-reduced-motion

📁 css-animation.md
   📝 Motion reduction support pattern

🔗 Cross-references set
```

---

## Detecting and merging similar knowledge

Before adding, check for similarity with existing knowledge:

1. **Same URL**: If it already exists, treat as an update.
2. **Similar technique**: If it covers the same concept or feature.

Actions when a similar entry is found:

- **No conflict**: Merge into existing entry to strengthen it.
- **Update**: Update existing with new information (old information may remain as "previous method").
- **Conflict**: Present both views and state the recommended one.
- **Different perspective**: Add as a separate entry (include cross-reference).

Report when merging:

```
🔄 Detected and merged similar knowledge

Existing: "CSS Grid Basics" (written: 2023-06)
New: "Grid Layout Practical Guide" (written: 2024-08)

→ Merged as "CSS Grid Layout Complete Guide"
  - Basic syntax (existing) + practical patterns (new) merged
  - Browser support information updated to latest
```

---

## Compile Mode: Processing the inbox

Triggered by: "Process inbox", "Compile", "Integrate knowledge", "Organize raw"

### Compile Flow

1. **Get inbox list**

   ```bash
   ls -la ~/.claude/skills/user-fe-knowledge/raw/_inbox/*.md 2>/dev/null
   ```

   If 0 files: report "inbox is empty" and finish.

2. **Process each file in order**

   For each `.md` file in `_inbox/`, do the following:

   a. Read the file
   b. Apply Step 2: Summarize and structure
   c. Apply Step 3: Determine category
   d. Apply Step 4: Duplicate check
   e. Integrate into knowledge/ with Step 5: Update the file
   f. Move the original file to `_archived/`

   ```bash
   mv raw/_inbox/{filename}.md raw/_archived/{filename}.md
   ```

3. **Completion report**

   ```
   ✅ Compile complete

   Processed: N files
   📁 Integrated into categories:
      - css/layout/: 2 files
      - cross-cutting/accessibility/: 1 file
   📦 Moved to raw/_archived/: N files
   ```

**Notes**:
- Do not compile automatically. Always start on user request.
- If unsure about the category, ask with AskUserQuestion.
- If one file spans multiple categories, apply the "articles spanning multiple categories" rule.
- After integrating, prompt: `💡 knowledge/ has been updated. To update the search index: qmd embed`

---

## Organize Mode: Maintaining the knowledge base

Triggered by: "Organize the knowledge", "Check for duplicates"

### Organize Tasks

#### 1. Merge similar knowledge

Criteria for merging:

- **Same technique**: Full merge (keep more detailed and up-to-date information)
- **Update relationship**: Overwrite with new info, note old info as "previous method"
- **Complementary relationship**: Combine knowledge from both for a more comprehensive entry
- **Conflict**: Present both views and state which is recommended

Format after merging:

```markdown
## [Technique Name]

> Source: [URL1], [URL2] (comma-separated for multiple)
> Written: [most recent writing date] (merged from: [date1], [date2])
> Added: [first added date] / Merged: [YYYY-MM-DD]

[Integrated comprehensive description]
```

#### 2. Update old information

- Check entries written more than 2 years ago first.
- Look for changed browser support.
- Look for better methods that have appeared.
- Mark deprecated entries (delete or add a note).

#### 3. Reorganize categories

- Suggest splitting categories that have grown too large.
- Move misclassified entries.
- Add cross-references between related techniques.

#### 4. Unify formatting

- Unify code example formatting.
- Unify section structure.
- Suggest filling in missing information (use cases, notes).

#### 5. Drift check

Compare originals in `raw/_archived/` with corresponding entries in `knowledge/`:

```bash
grep -r "Source: {URL}" knowledge/
```

Report divergences as suggestions only — do not rewrite automatically.

Report format:

```
🔍 Drift check results (3 divergences detected)

1. raw/_archived/2026-03-15-grid-masonry.md
   ↔ knowledge/css/layout/grid-masonry.md
   📌 Original has Safari 18 support info added (knowledge still says Safari 17)

Proceed with updates? [y/N]
```

#### 6. Missing content candidates

Search for TBD/TODO sections:

```bash
grep -rn "TBD\|TODO\|unknown\|XXX\|needs review" knowledge/
```

Report completion candidates as suggestions only. Do not auto-complete.

#### 7. Find new article candidates

Re-evaluate topics in `raw/_archived/` that have not been integrated. Report candidate list and ask user whether to integrate. Do not add to knowledge/ automatically.

### Organize Flow

1. Read the target category file.
2. Analyze: duplicate entries, old information, inconsistent formatting, large files (20+ entries).
3. List improvement suggestions.
4. Execute after user approval.

Output example:

```
📊 Analysis results for css-layout.md

Entries: 15
Last updated: 2025-01-15

### Issues detected

1. 🔄 Possible duplicate
   - "Flexbox gap" and "Flexbox gap property" are similar

2. ⚠️ Old information
   - "Grid fallback for IE" (written: 2021-03)
     → IE support has ended; recommend deleting

3. 📝 Inconsistent formatting
   - 3 entries are missing the "Use Cases" section

### Recommended actions
- [ ] Merge duplicates
- [ ] Delete old information
- [ ] Unify formatting

Proceed?
```

When to organize:
- When a category exceeds 20 entries
- Regular maintenance every 3 months
- When there is a major spec change (new browser feature, etc.)
