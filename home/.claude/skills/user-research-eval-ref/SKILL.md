---
name: user-research-eval-ref
description: Evaluate a URL, article, tool, or post as a reference and decide whether to adopt it. Triggered when a URL is shared with phrases like "is this useful", "I want to use this", "investigate this", or "I'm interested".
disable-model-invocation: false
effort: medium
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

**Precedence rule:** Explicit trigger phrases in the table above take precedence over the auto-detection heuristics. Auto-detection applies only when no trigger phrase matches the user's message.

</quick_start>

## Iron Law

1. Do not evaluate without reading the article content (Why: Evaluating from title/abstract alone raises recommendation hallucination rate)
2. Do not recommend adoption without checking the current environment

<workflow>

## Content Retrieval Flow (Common to All Modes)

**Pre-step — X / Twitter post URL:** If the URL host is `x.com` or `twitter.com` AND the path matches an individual post (`/<user>/status/<id>`), delegate content extraction to **user-research-x-posts** via the Skill tool first. Use its extracted post text/thread as the content. Then continue mode evaluation. Do NOT attempt WebFetch on x.com post URLs — it is blocked.

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
| X / Twitter individual post URL (`x.com/*/status/*`, `twitter.com/*/status/*`) | user-research-x-posts | Used as a **content-extraction sub-step**, not a terminal route — fetch the post text/thread, then continue evaluation in the chosen mode |

→ If applicable, launch the target skill using the Skill tool, then end evaluating-references here.

---

## Routing Check (Applies to All Modes)

Before entering Mode 1, 2, or 3, evaluate the routing table above. If the content type matches one of the **terminal** routing targets (user-fe-knowledge, user-research-creative, user-research-websites), launch the target skill via the Skill tool and end evaluating-references here.

**Non-terminal sub-step:** user-research-x-posts is a content-extraction helper, not a terminal route. After it returns the post content, continue with the chosen mode (Quick / Deep / OSS Wiki) using that content.

## Mode 1: Quick Evaluation

**Flow:**
1. Summary in 3 lines or less
2. Evaluate on a 5-point scale
3. Output in structured card format

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
2. **Verify against primary sources** (mandatory — see below)
3. Check existing environment (in priority order)
4. Output adoption recommendation + implementation plan (if adopting)

**Primary-source verification (mandatory):**

When the shared URL is a secondary source (blog post, Zenn/Qiita/Medium article, X post, news summary, AI-generated summary, third-party comparison), do NOT rely on it alone. Identify and fetch the primary source for every load-bearing claim before recommending adoption.

| Topic of claim | Primary source to check |
|---|---|
| Library / framework / SDK API, options, version behavior | Official docs (prefer context7 MCP) + the project's GitHub repo (README, CHANGELOG, source) |
| CLI tool flags, behavior | Official docs / `--help` output / upstream repo |
| Spec / standard (CSS, HTML, ECMAScript, HTTP, WCAG) | W3C / WHATWG / TC39 / IETF / W3C spec pages |
| Browser support / compatibility | MDN + caniuse |
| Cloud service pricing / limits / features | Official vendor docs (not third-party summaries) |
| Benchmarks / performance claims | Original benchmark repo + methodology; if absent, mark as "unverified" |
| Security advisory / CVE | NVD / GHSA / vendor advisory |
| Academic / research claims | Original paper (arXiv, publisher), not a blog summary |

**Rules:**
- If the shared URL IS the primary source (official docs, upstream repo, spec page, vendor advisory), note that and skip duplicate fetching.
- If a primary source cannot be located or fetched, mark the affected claim as **"未検証 (一次ソース未確認)"** in the output. Do NOT silently downgrade to the secondary source.
- Cite primary-source URLs in the output. Distinguish them from the originally shared URL.
- Secondary sources may still be cited for opinion, adoption stories, or community reception — but factual claims (API behavior, limits, support) must trace to a primary source.

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

### Primary Sources Consulted
- [Official docs / spec / upstream repo] — <url> (checked: <claim verified>)
- [...] 
- Unverified claims: [list any claim marked 未検証 (一次ソース未確認), or "none"]

### Recommendation: [Adopt / Do not adopt]
[Rationale]
```

---

## Mode 3: OSS Project Wiki

**Purpose:** Given a GitHub repository URL, produce a comprehensive Japanese wiki-style report that captures what the project is, how it works, how it compares to alternatives, and how the community receives it.

**Trigger condition:** The URL matches `github.com/{owner}/{repo}` AND the user's message contains wiki/document/まとめ intent.

**⚠️ OVERRIDE:** If the URL is a GitHub repo BUT the user's intent is adoption-for-own-use ("use this", "adopt this", "should I use this", "research for my environment"), **switch to Mode 2 (Deep Research)** instead. Adoption-intent supersedes the GitHub URL default.

**Flow:**
1. Gather repo metadata via `gh` CLI (stars, description, topics, recent commits, latest release)
2. Fetch `README.md` and skim top-level directory structure for architecture signals
3. Identify 3-5 similar/competing projects (web search)
4. Search community reactions — X/Twitter, Hacker News, Reddit, Japanese tech blogs (Zenn/Qiita). Note both positive and negative voices. **For specific X posts found during this step, delegate content extraction to user-research-x-posts** (do not WebFetch x.com URLs directly).
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

**user-research-eval-ref vs user-research-x-posts:**
- user-research-eval-ref: Evaluates value / adoption fit of a URL
- user-research-x-posts: **Content-extraction helper** for x.com / twitter.com post URLs. Called as a sub-step from this skill when an X post URL is shared, because WebFetch is blocked on x.com. After extraction, evaluation continues here.

**user-research-eval-ref vs user-research-queue:**
- user-research-eval-ref: Evaluate a single URL **now** (Quick Eval, Deep Research, or OSS Wiki)
- user-research-queue: **Queue management** — add URLs for later, list backlog, and process entries over time; delegates actual deep research to this skill

</workflow>

<success_criteria>
**Quick Evaluation:** Return structured card format (table + summary + recommended action)

**Deep Research:**
- State adoption/rejection recommendation with rationale
- Attach an overview-level implementation plan when adopting
- Include comparison with existing environment (CLAUDE.md, Brewfile, skills/)
- **Cite primary sources** (official docs, spec, upstream repo) for every load-bearing factual claim; any claim without a primary source must be marked 未検証

**OSS Project Wiki:**
- All 10 sections present, in order, in Japanese
- Sections 5, 8, 10 cite source URLs for every claim
- Section 5 comparison table includes at least one weakness axis for the target project
- Output ends with the save-prompt trailing line; no auto-save
</success_criteria>

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — evaluation complete and recommendation delivered (Quick: structured card / Deep: adoption recommendation + plan / OSS Wiki: all 10 sections with citations)
- `## Status: DONE_WITH_CONCERNS` — evaluation complete but content retrieval was partial (e.g., some sections blocked, community reaction data unavailable)
- `## Status: BLOCKED` — cannot retrieve content after exhausting all fallback methods (WebFetch, agent-browser, playwright, Chrome MCP)
- `## Status: NEEDS_CONTEXT` — no URL provided, or intent is ambiguous and mode cannot be determined
