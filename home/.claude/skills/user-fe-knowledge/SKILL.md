---
name: user-fe-knowledge
description: Manage a knowledge base for frontend technologies (CSS, JavaScript, HTML, performance, accessibility). During web development tasks, consult the knowledge base proactively and apply best practices to improve accuracy and speed. Also summarizes and stores technical info from URLs and articles, and answers questions. Covers modern CSS (Grid, Flexbox, @scope, View Transitions), JavaScript patterns, Core Web Vitals, WCAG, and browser compatibility.
disable-model-invocation: false
---

# Frontend Knowledge Management

## Overview

A skill for managing a knowledge base of frontend technologies. Provides three main functions:

1. **Proactive reference during implementation (highest priority)**: During web development tasks, refer to the knowledge base and apply best practices to improve accuracy and speed.
2. **Collection and storage**: Summarize frontend technologies from URLs and articles and add them to the knowledge base.
3. **Reference and Q&A**: Search the accumulated knowledge base for information related to a question and respond.

## Iron Law

1. Do not overwrite existing knowledge with outdated information.
2. Do not register information without a source URL.

## When to Use

### Proactive reference during implementation tasks (highest priority)

- Web development implementation tasks (creating components, implementing layouts, implementing animations, etc.)
- Applying best practices during coding
- Using the latest CSS/JavaScript features
- Considering accessibility and performance

**Triggers**: Implementation requests from the user, code creation tasks, feature additions, etc.

### Collection mode

- When a URL is provided: "Save this article"
- Adding article content: "Add to knowledge"
- Organizing knowledge: "Organize the knowledge"

### Reference mode (Q&A)

- Questions about frontend technologies
- Questions about CSS, JavaScript, performance, accessibility
- When an answer based on accumulated knowledge is needed

---

# Part 1: Knowledge Collection and Storage

## Execution Modes

### 1. Add mode (default)

- When a URL is provided
- Requests such as "Save this article" or "Add to knowledge"

### 2. Organize mode

- Requests such as "Organize the knowledge" or "Check for duplicates"
- Organize a specific category: "Organize css-layout.md"

## Collection Flow

### Step 1: Save the original to raw/_inbox/

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

Report:

```
✅ Saved to raw/_inbox/
📁 raw/_inbox/2026-04-06-{slug}.md
🔗 Source: [URL]

Say "process inbox" to integrate it into knowledge/.
```

### Step 2: Summarize and structure

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

### Step 3: Determine category

Choose the best category from the following (new hierarchy):

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

### Step 4: Duplicate check and decide on a processing approach

**Important**: Always check for duplicates with existing knowledge before adding.

#### 4-1. Search existing knowledge

Use the following command to find existing files related to the topic:

```bash
# Search by keyword (e.g.: Container Query)
find knowledge -type f -name "*.md" | xargs grep -l "container.*query\|@container"

# Search by file name
find knowledge -type f -name "*container*"
```

#### 4-2. Decide on a processing approach

| Situation | Action |
|------|------|
| **Completely new information** | Create a new file |
| **Can be added to an existing file** | Add to the end of the existing file |
| **Update to existing information** | Update the existing section with the Edit tool |
| **Integrate multiple articles** | Integrate information into one file (create or update) |
| **Replacing old information** | Delete the old section and add new information |
| **Clearly old and not useful** | Do not add to knowledge base |

#### 4-3. Criteria for "old and not useful"

Decide not to add to the knowledge base in the following cases:

- **Technologies with ended browser support** (e.g.: IE11-only hacks)
- **Deprecated APIs/syntax** (marked as deprecated in official documentation)
- **Old methods with better alternatives** (e.g.: features that no longer need a polyfill)
- **Implementations with security issues**
- **Articles more than 5 years old that diverge from current standards**

Exceptions:

- **Historically valuable information** (for understanding "why this approach is avoided now")
- **Information needed for legacy code maintenance** (explicitly tagged "legacy")

#### 4-4. Deciding when to split or merge

**When to split:**
- A file exceeds 500 lines
- Contains multiple independent topics
- Information from different categories is mixed in

**When to merge:**
- The same topic is spread across multiple files
- Multiple thin files are easier to understand as one
- Strongly related topics (e.g.: Container Query and Container Query Units)

### Step 5: Update the file

1. Read `~/.claude/skills/managing-frontend-knowledge/knowledge/[category]/[filename].md`
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

### Step 6: Confirm

After the addition is complete, report:

- Name of the technique added
- Target category
- Preview of the summary

## Articles with multiple techniques

When a single article contains multiple techniques:

- Add each technique as a separate entry.
- Include the same source URL.
- Add cross-references if they are related.

## Articles spanning multiple categories

When an article is relevant to multiple categories, **do not force it all into one file**.

### Criteria for splitting

| Situation | Action |
|------|------|
| One main topic, other categories are supplementary | Add to main category, other categories get reference links only |
| Contains multiple independent topics | Split and add to each category |
| Closely related across categories | Add to each category and include cross-references |

### Rules when splitting

1. **Make each file self-contained**: Understandable by reading that file alone.
2. **Minimize duplication**: Only overview for shared content, details in the appropriate category.
3. **State cross-references clearly**: Always add links to related knowledge.

### Splitting example

Example: An article on "Implementing animations with accessibility in mind"

```
accessibility-link-underline.md:
  - Why prefers-reduced-motion is needed and how to detect it
  - Related: "Motion reduction support" in css-animation.md

css-animation.md:
  - CSS implementation patterns for motion reduction support
  - Related: "prefers-reduced-motion" in accessibility-link-underline.md
```

### Report format

```
✅ Added to knowledge (split into 2 categories)

📁 accessibility-link-underline.md
   📝 Consideration for prefers-reduced-motion

📁 css-animation.md
   📝 Motion reduction support pattern

🔗 Cross-references set
```

## Detecting and merging similar knowledge (at time of adding)

Before adding, check for similarity with existing knowledge:

### Check items

1. **Same URL**: If it already exists, treat as an update.
2. **Similar technique**: If it covers the same concept or feature.

### Actions when a similar entry is found

- **No conflict**: Merge into existing entry to strengthen it.
- **Update**: Update existing with new information (old information may remain as "previous method").
- **Conflict**: Present both views and state the recommended one.
- **Different perspective**: Add as a separate entry (include cross-reference).

### Report when merging

```
🔄 Detected and merged similar knowledge

Existing: "CSS Grid Basics" (written: 2023-06)
New: "Grid Layout Practical Guide" (written: 2024-08)

→ Merged as "CSS Grid Layout Complete Guide"
  - Basic syntax (existing) + practical patterns (new) merged
  - Browser support information updated to latest
```

## When the category is unclear

Ask the user or add to the closest category.
If a new category is needed, also update the category list in `SKILL.md`.

## Output example (Add mode)

```
✅ Added to knowledge

📁 Category: css-layout.md
📝 Technique: Practical patterns for Container Queries
🔗 Source: https://example.com/container-queries

### Added content preview:
> A method to achieve component-level responsive design
> using container queries...
```

---

## Compile Mode

Integrate originals accumulated in `raw/_inbox/` into knowledge/.

### Triggers

- "Process inbox", "Compile", "Integrate knowledge"
- "Organize raw"

### Compile Flow

1. **Get inbox list**

   ```bash
   ls -la ~/.claude/skills/user-fe-knowledge/raw/_inbox/*.md 2>/dev/null
   ```

   If 0 files: Report "inbox is empty" and finish.

2. **Process each file in order**

   For each `.md` file in `_inbox/`, do the following:

   a. Read the file
   b. Apply **Step 2: Summarize and structure** (existing logic)
   c. Apply **Step 3: Determine category** (existing logic)
   d. Apply **Step 4: Duplicate check and decide on processing approach** (existing logic)
   e. Integrate into knowledge/ with **Step 5: Update the file** (existing logic)
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

### Notes

- **Do not compile automatically**. Always start on user request.
- If unsure about the category, ask with AskUserQuestion.
- If one file spans multiple categories, apply the existing "articles spanning multiple categories" rule.
- After integrating, prompt for qmd embed:

  ```
  💡 knowledge/ has been updated. To update the search index:
     qmd embed
  ```

---

## Organize Mode

Triggered by "Organize the knowledge", "Check for duplicates", etc.

### Organize Tasks

#### 1. Merge similar knowledge

**Merge process:**

1. When similar entries are detected, compare their content.
2. Check for conflicts (if there is a conflict, prioritize the newer writing date, or present both views).
3. If no issues, merge into one strong knowledge entry.

**Criteria for merging:**

- **Same technique**: Full merge (keep more detailed and up-to-date information)
- **Update relationship**: Overwrite with new info, note old info as "previous method"
- **Complementary relationship**: Combine knowledge from both for a more comprehensive entry
- **Conflict**: Present both views and state which is recommended

**Format after merging:**

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
- Entries that are deprecated (delete or add a note).

#### 3. Reorganize categories

- Suggest splitting categories that have grown too large.
- Move misclassified entries.
- Add cross-references between related techniques.

#### 4. Unify formatting

- Unify code example formatting.
- Unify section structure.
- Suggest filling in missing information (use cases, notes).

#### 5. Drift check (detect divergence between raw originals and knowledge)

Compare the originals in `raw/_archived/` with the corresponding entries in `knowledge/` to find information that is in the original but not reflected in the knowledge base.

**Steps:**

1. Go through each file in `raw/_archived/`
2. For each URL in the file, search knowledge/ for entries with the same source URL:
   ```bash
   grep -r "Source: {URL}" knowledge/
   ```
3. Compare the original with the existing knowledge entry and extract:
   - Technical points in the original but not in the knowledge
   - Browser support that was updated in the original but is still old in the knowledge
   - Sample code added to the original
4. Report as a suggestion list (do not write automatically)

**Report example:**

```
🔍 Drift check results (3 divergences detected)

1. raw/_archived/2026-03-15-grid-masonry.md
   ↔ knowledge/css/layout/grid-masonry.md
   📌 Original has Safari 18 support info added (knowledge still says Safari 17)

2. ...

Proceed with updates? [y/N]
```

**Important**: Suggestions only. Do not rewrite the knowledge base without user approval.

#### 6. Missing content candidates

Detect TBD, "unknown", and empty sections in knowledge/ and suggest candidates for completion.

**Steps:**

1. Search all of knowledge/ for the following patterns:
   ```bash
   grep -rn "TBD\|TODO\|unknown\|XXX\|needs review" knowledge/
   ```
2. For each hit, if there is a corresponding original in `raw/_archived/`, extract the relevant part.
3. Report the completion candidates as a suggestion list.

**Important**: Suggestions only. Do not auto-complete.

#### 7. Find new article candidates

Re-evaluate topics in `raw/_archived/` that have not been integrated into knowledge/.

**Steps:**

1. For each file in `_archived/`, check if it has been integrated into the knowledge base.
   - Search knowledge/ with the source URL
   - If not found, mark as "not integrated"
2. Estimate the reason it was not integrated:
   - Intentionally skipped as out of scope → do nothing
   - On hold because the category was unclear → present as a candidate
3. Report the candidate list and ask the user whether to integrate.

**Important**: Do not add to knowledge/ automatically.

### Organize Flow

1. Read the target category file.
2. Analyze:
   - Duplicate entries
   - Old information (written more than 2 years ago, or added more than 1 year ago with unknown writing date)
   - Inconsistent formatting
   - Large files (20 or more entries)
3. List improvement suggestions.
4. Execute after user approval.

### Output example (Organize mode)

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

### When to organize

Consider organizing at these times:

- When a category exceeds 20 entries
- Regular maintenance every 3 months
- When there is a major spec change (new browser feature, etc.)

---

# Part 2: Knowledge Reference (during implementation and Q&A)

## How to Use

### Search priority

Follow this order when referring to knowledge:

1. **Use `qmd-fe "..."` first** (semantic search, maximum token efficiency)
2. Use `qmd search -c frontend "..."` when keyword search is needed.
3. Only Read directly when the above does not find results, or when the full context of a specific file is needed.

**Direct Read is the last resort.** The knowledge base has 297 MD files with 170,000+ words. Doing a brute-force Read will consume a huge number of tokens.

If the search result snippets are enough to make a decision, no Read is needed. Only use `qmd get <file>` to get the relevant file when necessary.

### Proactive reference during implementation tasks (recommended)

When performing web development implementation tasks or coding work, proactively refer to the knowledge base in the following flow:

1. **Extract keywords from the task**
   - Example: "Responsive card component" → Container Query, Grid, clamp()
   - Example: "Implement animation" → View Transitions, prefers-reduced-motion
   - Example: "Implement modal" → dialog element, Popover API

2. **Identify the relevant category** (refer to the category list above)

3. **Read the knowledge file**
   - The relevant file inside `~/.claude/skills/managing-frontend-knowledge/knowledge/`

4. **Apply best practices and implement**
   - Use up-to-date methods based on the knowledge
   - Consider browser support information
   - Apply accessibility and performance considerations

**Effect**: Improved work accuracy, faster implementation, application of the latest best practices.

### When answering questions

1. Extract keywords from the user's question.
2. Identify the relevant file from the category list above.
3. Read the relevant file inside `~/.claude/skills/managing-frontend-knowledge/knowledge/`
4. Answer based on the accumulated knowledge.

### Directory Structure

```
knowledge/
├── INDEX.md                          # Overall index
├── css/
│   ├── layout/                       # Grid, Flexbox, positioning
│   ├── animation/                    # Transitions, animations
│   ├── visual/                       # filter, mask, shape
│   ├── typography/                   # fonts, text
│   ├── selectors/                    # @scope, :has, pseudo-classes
│   ├── values/                       # clamp, units, custom properties
│   ├── components/                   # Popover, Anchor Positioning
│   └── theming/                      # light-dark, themes
├── javascript/
│   ├── patterns/                     # DOM, events, patterns
│   └── animation/                    # requestAnimationFrame, interpolation
├── html/                             # Modern HTML, semantics
├── cross-cutting/
│   ├── performance/                  # optimization, Core Web Vitals
│   ├── accessibility/                # WCAG, a11y
│   └── browser-compat/               # browser bugs, workarounds
├── apple-style-guide/               # Apple writing guidelines
├── human-interface-guidelines/      # Apple HIG, design principles
└── material-design-3/               # Material Design 3, design philosophy
```

## Answer Format

```markdown
## [Answer to the question]

[Explanation]

### Code Example

\```css
/* or js/html */
\```

### Use Cases
- [Specific use case]

### References
- [Source URL (if available)]
```

## When there is no matching category

1. Answer with general knowledge.
2. Tell the user "There is no matching information in the knowledge base."
3. If needed, suggest adding it using the collection feature.

## When spanning multiple categories

Read multiple relevant files and give a comprehensive answer.
Example: "Scroll animation" → `css-animation.md` + `performance.md`

## Notes

- If a category file does not exist, do not error; answer with whatever information is available.
- Always include the source URL when available.
- Prefer practical code examples.

---

## Semantic Search with qmd

Using qmd semantic search instead of directly reading files can greatly reduce token usage.
qmd v2 is designed to hold multiple collections in a unified index (`~/.cache/qmd/index.sqlite`).
Frontend knowledge is registered as the `frontend` collection.

```bash
# If the collection is not registered (first time / new machine)
~/dotfiles/setup/21_qmd.sh

# Semantic search (recommended. qmd-fe = alias for qmd query -c frontend)
qmd-fe "CSS animation performance"

# Keyword search (BM25, fast)
qmd search -c frontend "Grid layout"

# Get a single file
qmd get knowledge/css/layout/container-query.md

# When knowledge is updated (incremental index + embedding update)
qmd update
qmd embed

# Full rebuild
qmd collection remove frontend && ~/dotfiles/setup/21_qmd.sh

# Check index status
qmd status
qmd collection list
```
