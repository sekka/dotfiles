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

### Proactive reference during implementation (highest priority)

Triggered by: implementation requests, code creation tasks, feature additions, coding work.

Apply during: creating components, implementing layouts, animations, modals — any web development task.
Always extract keywords from the task, look up relevant knowledge, and apply best practices before writing code.

### Collection mode

Triggered by: "Save this article", "Add to knowledge", URL provided, "Organize the knowledge", "Check for duplicates".

### Reference mode (Q&A)

Triggered by: questions about CSS, JavaScript, performance, or accessibility where accumulated knowledge should inform the answer.

---

# Part 1: Knowledge Collection and Storage

## Execution Modes

### Add mode (default)

Activated when a URL is provided or the user requests "Save this article" / "Add to knowledge".

**Summary**: Fetch the article with WebFetch, save the raw content to `raw/_inbox/`, then summarize, classify, and integrate it into `knowledge/`. Duplicate-check before writing.

> For the full step-by-step procedure (inbox format, knowledge entry format, category table, duplicate handling, split/merge rules, compile flow), see [`references/collection-workflow.md`](references/collection-workflow.md)

Output example:

```
✅ Added to knowledge

📁 Category: css/layout/
📝 Technique: Practical patterns for Container Queries
🔗 Source: https://example.com/container-queries
```

### Compile mode

Activated by: "Process inbox", "Compile", "Integrate knowledge", "Organize raw".

**Summary**: Process each `.md` file in `raw/_inbox/` — summarize, classify, integrate into `knowledge/`, then move to `raw/_archived/`. Never compile automatically; always start on user request.

> For the full compile flow, see [`references/collection-workflow.md`](references/collection-workflow.md)

### Organize mode

Activated by: "Organize the knowledge", "Check for duplicates", "Organize css-layout.md".

**Summary**: Analyze a category for duplicates, stale information, formatting inconsistencies, and drift from raw originals. Present suggestions and execute only after user approval.

Tasks: merge similar entries, update old info, reorganize categories, unify formatting, drift check, find missing content candidates.

> For detailed organize tasks and output formats, see [`references/collection-workflow.md`](references/collection-workflow.md)

---

# Part 2: Knowledge Reference (during implementation and Q&A)

## Search Priority

Follow this order when referring to knowledge:

1. **`qmd-fe "..."`** — semantic search, maximum token efficiency (use first)
2. **`qmd search -c frontend "..."`** — keyword search (BM25, fast)
3. **Direct Read** — only when the above find nothing, or full file context is needed

**Direct Read is the last resort.** The knowledge base has 297 MD files with 170,000+ words.
If search result snippets are enough to decide, no Read is needed.

## Proactive Reference during Implementation (recommended)

When performing web development tasks, proactively consult the knowledge base:

1. **Extract keywords from the task**
   - "Responsive card component" → Container Query, Grid, clamp()
   - "Implement animation" → View Transitions, prefers-reduced-motion
   - "Implement modal" → dialog element, Popover API

2. **Find the relevant category** — see [`references/knowledge-directory.md`](references/knowledge-directory.md)

3. **Read the knowledge file** in `~/.claude/skills/user-fe-knowledge/knowledge/`

4. **Apply best practices** — use up-to-date methods, consider browser support, apply accessibility and performance practices

**Effect**: Improved work accuracy, faster implementation, application of the latest best practices.

## Knowledge Base Directory

```
knowledge/
├── INDEX.md
├── css/
│   ├── layout/        # Grid, Flexbox, Container Queries
│   ├── animation/     # Transitions, View Transitions, Scroll-driven
│   ├── visual/        # filter, mask, shape
│   ├── typography/    # fonts, text
│   ├── selectors/     # @scope, :has, pseudo-classes
│   ├── values/        # clamp, units, custom properties
│   ├── components/    # Popover, Anchor Positioning
│   └── theming/       # light-dark, themes
├── javascript/
│   ├── patterns/      # DOM, events, async, utilities
│   └── animation/     # requestAnimationFrame, interpolation
├── html/              # Modern HTML, semantics
├── cross-cutting/
│   ├── performance/   # Core Web Vitals, optimization
│   ├── accessibility/ # WCAG, a11y
│   └── browser-compat/# browser bugs, workarounds
├── apple-style-guide/
├── human-interface-guidelines/
└── material-design-3/
```

> See [`references/knowledge-directory.md`](references/knowledge-directory.md) for the full category table with target topics and keywords.

## When Answering Questions

1. Extract keywords from the user's question.
2. Find the relevant file from the category directory above.
3. Read the file in `~/.claude/skills/user-fe-knowledge/knowledge/`.
4. Answer based on accumulated knowledge, including source URL and practical code examples.

Answer format:

```markdown
## [Answer to the question]

[Explanation]

### Code Example

\```css
/* or js/html */
\```

### References
- [Source URL]
```

If no matching knowledge exists: answer with general knowledge, tell the user there is no matching entry in the knowledge base, and suggest using the collection feature to add it.

---

## Semantic Search with qmd

```bash
# Semantic search (recommended)
qmd-fe "CSS animation performance"

# Keyword search (BM25, fast)
qmd search -c frontend "Grid layout"

# Get a single file
qmd get knowledge/css/layout/container-query.md

# Update index after knowledge changes
qmd update
qmd embed

# Check index status
qmd status
qmd collection list

# First-time setup / full rebuild
~/dotfiles/setup/21_qmd.sh
qmd collection remove frontend && ~/dotfiles/setup/21_qmd.sh
```

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — knowledge retrieved and applied (or article saved/compiled) successfully
- `## Status: DONE_WITH_CONCERNS` — answer provided but no matching entry in the knowledge base; response based on general knowledge only (suggest adding it)
- `## Status: BLOCKED` — source URL is inaccessible or the knowledge base index cannot be written
- `## Status: NEEDS_CONTEXT` — no URL, keyword, or question provided; cannot determine which mode (collect / reference / Q&A) to run
