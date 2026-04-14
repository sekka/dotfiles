---
name: user-doc-ia
description: Generate an IA (information architecture) proposal from an RTM file. Input: RTM file path. Output: Mermaid sitemap + page list + navigation design + client-facing rationale + decision list, saved to ~/prj/{slug}/ia.md. Triggered by "IA作って", "サイトマップ", "information architecture", "ia plan", or "site structure".
argument-hint: [rtm-file-path]
---

# IA Planner — Information Architecture Generator

Generate a complete IA proposal from a Requirements Traceability Matrix (RTM).

## Iron Law

1. Never invent pages not traceable to the RTM — every proposed page must cite a BINDING or SUPPLEMENTED requirement
2. Primary output is a file saved to `~/prj/{slug}/ia.md`. After saving, respond in chat with the file path only.
3. Decision list must be explicit — never hide open questions in prose

## Trigger

Use when: `user-doc-spec` has produced an RTM and you are ready to define site structure.

Arguments:
- `rtm-file-path`: path to the RTM Markdown file (e.g. `~/prj/abc-corp/rtm.md`)

## Process

1. If RTM path is not provided, ask with AskUserQuestion
2. Read the RTM file
3. Extract: all BINDING pages/sections, SUPPLEMENTED structural decisions, PENDING items
4. Infer slug from the file path (parent directory name). If unclear, ask the user.
5. Generate the 5-part output (see below)
6. Save to `~/prj/{slug}/ia.md`
7. Print the file path

## Output — 5-Part Set

Save all 5 parts to `~/prj/{slug}/ia.md` in this order.

### Part 1: Mermaid Sitemap

Hierarchical tree of all pages. Every node maps to a BINDING or SUPPLEMENTED requirement.

```
graph TD
  TOP["TOP / ホーム"]
  TOP --> ABOUT["会社概要"]
  TOP --> SERVICE["サービス"]
  SERVICE --> S1["サービスA"]
  SERVICE --> S2["サービスB"]
  TOP --> NEWS["お知らせ"]
  TOP --> CONTACT["お問い合わせ"]
```

Rules:
- Every BINDING page requirement maps to a node
- Orphan pages (no parent) go directly under TOP
- Max depth: 3 levels (TOP → section → page)
- Node labels use Japanese page names with path in quotes where helpful

### Part 2: Page List

One row per page. Every row must have a purpose and expected user action.

| Page | Path | Purpose | Primary content | Expected user action |
|---|---|---|---|---|
| TOP | / | First impression, navigate to services | Hero, service overview, news | Click to Service or Contact |
| 会社概要 | /about | Build trust | Company history, team, philosophy | Back-navigate or Contact |

### Part 3: Navigation Design

State explicitly:
- **Global nav (header):** ordered list of top-level items
- **Footer nav:** list of secondary links
- **Breadcrumb:** yes / no + rule (e.g. "all pages except TOP")

### Part 4: Client-Facing Rationale

2–4 paragraphs in Japanese. Proposal-ready prose. Explain:
- Why this page count (not more, not fewer)
- Why this navigation grouping
- Key structural decisions made

Tone: professional, direct. This text is copy-pasteable into a client presentation.

### Part 5: Decision List

Items where the client must choose before IA is final.

| # | Question | Options | Impact if deferred |
|---|---|---|---|
| 1 | リクルートページは必要ですか？ | 必要 / 不要 | Adds 1 page + nav item |
| 2 | ニュースにカテゴリフィルタは必要ですか？ | 必要 / 不要 | Affects CMS setup |

## Revision Mode

If the user provides client feedback after the first output:
1. Accept the feedback as input
2. Regenerate only the affected parts (sitemap + page list if pages change; rationale if reasoning changes)
3. Do not regenerate unchanged sections
4. Save updated file and print file path

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — completed normally
- `## Status: DONE_WITH_CONCERNS` — completed but with notes (add bullet list)
- `## Status: NEEDS_CONTEXT` — missing information to proceed (add what is needed)
- `## Status: BLOCKED` — cannot continue (add reason)
