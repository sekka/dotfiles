---
name: user-research-eval-ref
description: Evaluate a URL, article, tool, or post as a reference and decide whether to adopt it. Triggered when a URL is shared with phrases like "is this useful", "I want to use this", "investigate this", or "I'm interested".
disable-model-invocation: false
---

<objective>
Evaluate the reference value of a URL, article, tool, or post. Decide whether to adopt it for the current environment.
Three modes: Quick Evaluation (light reference check), Deep Research (detailed analysis for adoption), and OSS Project Wiki (comprehensive external-view report for a GitHub repo).
</objective>

<quick_start>
**Quick Evaluation**: Share a URL and ask "Is this useful?"
**Deep Research**: Share a URL and say "I want to use this", "I want to adopt this", or "Research this"
**OSS Project Wiki**: Share a GitHub repo URL and say "document this", "wiki化", "まとめて", "解析してまとめて"

**Trigger phrases:**

| Mode | Trigger phrases |
|--------|----------------|
| Quick Evaluation | "Is this useful?", "Is this a good reference?", "What do you think?", "Can I use this?", "Evaluate this" |
| Deep Research | "I want to use this", "I want to adopt this", "Research this", "I'm interested", "Check if this is implementable" |
| OSS Project Wiki | GitHub URL + "document this", "wiki化して", "まとめて", "解析してまとめて", "どんなプロジェクト", "comprehensive summary" |
| Auto detection | URL + short question → Quick / URL + detailed background → Deep / GitHub URL + "wiki/document/まとめ" → OSS Wiki |
</quick_start>

## Iron Law

1. Do not evaluate without reading the article content
2. Do not recommend adoption without checking the current environment

<workflow>

## Content Retrieval Flow (Common to All Modes)

```
1. Try WebFetch → 200 OK → done
2. WebFetch fails (403/429/empty response) → try agent-browser CLI with `-i -c`
3. agent-browser fails → try playwright-cli
4. playwright-cli fails → try Playwright MCP
5. Playwright MCP fails → get with chrome MCP (chrome-devtools)
6. All fail → report failure reason to user and stop
```

**Quick Evaluation**: Try WebFetch first; on failure, try agent-browser CLI only (skip steps 4-6 for speed).
**Deep Research**: Try all schemes.
**OSS Project Wiki**: Prefer `gh` CLI for repo facts; fall back to this flow for README/blog content.

---

## Routing to Other Skills (Decide After Getting Content)

| Content type | Route to | How to decide |
|--------------|--------------|---------|
| Technical articles on CSS/JS/HTML/performance/accessibility | user-fe-knowledge | Detect by keywords in content |
| Design examples, awards, creative works | user-research-creative | Detect by keywords in content |
| Explicit request like "analyze the structure of this site" | user-research-websites | Detect from user message |

→ If applicable, launch the target skill using the Skill tool, then end evaluating-references here.

---

## Mode 1: Quick Evaluation

**Flow:**
1. Routing check (see table above)
2. Summary in 3 lines or less
3. Evaluate on a 5-point scale
4. Output in structured card format

**5-point scale:**

| Score | Meaning |
|--------|------|
| ⭐⭐⭐⭐⭐ | Can adopt immediately. Direct value. |
| ⭐⭐⭐⭐ | High reference value. Worth considering for adoption. |
| ⭐⭐⭐ | Useful as background knowledge |
| ⭐⭐ | Low relevance to current environment |
| ⭐ | Out of scope |

**Evaluation dimensions:**
- **Relevance**: How much does it relate to current work and environment? (Judge based on LLM conversation context and general knowledge)
- **Novelty**: Is this content already known or already adopted?
- **Implementation cost**: How much effort to adopt? (low / medium / high)

**Basis for Quick Evaluation:** LLM general knowledge + conversation context (no deep file search)

**Output format (structured card):**

```markdown
## Reference Evaluation: [Article title / Tool name]

| Item | Rating |
|------|------|
| Relevance | ⭐⭐⭐⭐ |
| Novelty | ⭐⭐⭐ |
| Implementation cost | low |

**Summary:** [3 lines or less]

**Recommended action:** [Adopt and use for ○○ / Recommend storing in user-fe-knowledge / For reference only / Out of scope]
```

---

## Mode 2: Deep Research

**Flow:**
1. Detailed analysis
2. Check existing environment (in priority order)
3. Output adoption recommendation + implementation plan (if adopting)

**Existing environment check targets (in priority order):**
1. `CLAUDE.md`, `.claude/rules/*` — Check for conflicts with settings and policies
2. `Brewfile` — Check if the tool is already installed
3. `home/.claude/skills/` — Check related skills
4. Current work context — Check scope

**Scope limit:** Implementation plan is at overview level only. Delegate detailed implementation to Plan mode (superpowers:writing-plans).

**Output format:**

```markdown
## Research Results: [Tool name / Method name]

### Overview
[Detailed description]

### Comparison with Existing Environment
| Item | Current | Proposed |
|------|------|------|
| ... | ... | ... |

### Implementation Plan (if adopting)
[Step-by-step overview-level adoption procedure]

### Recommendation: [Adopt / Do not adopt]
[Rationale]
```

---

## Mode 3: OSS Project Wiki

**Purpose:** Given a GitHub repository URL, produce a comprehensive Japanese wiki-style report that captures what the project is, how it works, how it compares to alternatives, and how the community receives it.

**Trigger condition:** The URL matches `github.com/{owner}/{repo}` AND the user's message contains wiki/document/まとめ intent. If the URL is a GitHub repo but the intent is adoption-for-own-use, prefer Mode 2 (Deep Research) instead.

**Flow:**
1. Gather repo metadata via `gh` CLI (stars, description, topics, recent commits, latest release)
2. Fetch `README.md` and skim top-level directory structure for architecture signals
3. Identify 3-5 similar/competing projects (web search)
4. Search community reactions — X/Twitter, Hacker News, Reddit, Japanese tech blogs (Zenn/Qiita). Note both positive and negative voices.
5. Render the structured wiki (section list below) in **Japanese**
6. Output to stdout. Do NOT auto-save to disk. If the user asks to save, ask for a destination path.

**Wiki section list (required order):**

1. **要約** — One-paragraph essence of the project
2. **これは何のためのプロダクトか** — Problem the project solves and why it matters
3. **何ができるのか** — Concrete feature list
4. **どうやって実現しているのか** — Architecture, key components, notable implementation choices
5. **類似プロジェクト比較** — Table comparing 3-5 alternatives across 5-7 axes (license, scope, maturity, differentiator, etc.)
6. **新規性・革新性** — What is genuinely new
7. **差別化ポイント** — Winning angles and trade-offs
8. **コミュニティの反応** — Supporters vs. critics, with source citations
9. **制約・注意点** — Technical limitations and operational pitfalls
10. **参考リソース** — Primary sources, explainer articles, comparison posts. Note source type and access date.

**Quality guardrails:**
- Every claim in sections 5, 8, 10 must cite a source URL.
- Prefer `gh api` and `gh repo view` over scraping for repo facts.
- If community-reaction search yields nothing, write "確認できず" rather than fabricating.
- Section 5 comparison must include at least one axis where the target project is *weaker* than an alternative — avoid marketing-only tone.

**Output format:** The wiki itself (markdown), followed by one trailing line:

```
---
保存する場合は保存先パスを指定してください。
```

---

## Skill Boundaries

**user-research-eval-ref vs user-research-creative:**
- user-research-eval-ref: Evaluate a **single URL** actively shared by the user, against the user's own environment
- user-research-creative: The system actively scrapes **multiple award sites** to collect and curate examples

**user-research-eval-ref vs user-research-websites:**
- user-research-eval-ref: Value judgment — "Is this useful?"
- user-research-websites: Structural analysis task — "Analyze the structure" or "Create a sitemap"

**Mode 2 (Deep Research) vs Mode 3 (OSS Project Wiki):**
- Mode 2: "Should I adopt this for my environment?" → compares against the user's own dotfiles/skills/Brewfile
- Mode 3: "What is this project, objectively?" → comprehensive external-view wiki, independent of the user's environment

</workflow>

<success_criteria>
**Quick Evaluation:** Return structured card format (table + summary + recommended action)

**Deep Research:**
- State adoption/rejection recommendation with rationale
- Attach an overview-level implementation plan when adopting
- Include comparison with existing environment (CLAUDE.md, Brewfile, skills/)

**OSS Project Wiki:**
- All 10 sections present, in order, in Japanese
- Sections 5, 8, 10 cite source URLs for every claim
- Section 5 comparison table includes at least one weakness axis for the target project
- Output ends with the save-prompt trailing line; no auto-save
</success_criteria>
