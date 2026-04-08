---
name: user-evaluating-references
description: Evaluate a URL, article, tool, or post as a reference and decide whether to adopt it. Triggered when a URL is shared with phrases like "is this useful", "I want to use this", "investigate this", or "I'm interested".
disable-model-invocation: false
---

<objective>
Evaluate the reference value of a URL, article, tool, or post. Decide whether to adopt it for the current environment.
Two modes: Quick Evaluation (light reference check) and Deep Research (detailed analysis for adoption).
</objective>

<quick_start>
**Quick Evaluation**: Share a URL and ask "Is this useful?"
**Deep Research**: Share a URL and say "I want to use this", "I want to adopt this", or "Research this"

**Trigger phrases:**

| Mode | Trigger phrases |
|--------|----------------|
| Quick Evaluation | "Is this useful?", "Is this a good reference?", "What do you think?", "Can I use this?", "Evaluate this" |
| Deep Research | "I want to use this", "I want to adopt this", "Research this", "I'm interested", "Check if this is implementable" |
| Auto detection | URL + short question → Quick / URL + detailed background → Deep |
</quick_start>

## Iron Law

1. Do not evaluate without reading the article content
2. Do not recommend adoption without checking the current environment

<workflow>

## Content Retrieval Flow (Common to Both Modes)

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

---

## Routing to Other Skills (Decide After Getting Content)

| Content type | Route to | How to decide |
|--------------|--------------|---------|
| Technical articles on CSS/JS/HTML/performance/accessibility | managing-frontend-knowledge | Detect by keywords in content |
| Design examples, awards, creative works | researching-creative-cases | Detect by keywords in content |
| Explicit request like "analyze the structure of this site" | analyzing-websites | Detect from user message |

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

**Recommended action:** [Adopt and use for ○○ / Recommend storing in managing-frontend-knowledge / For reference only / Out of scope]
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

## Skill Boundaries

**evaluating-references vs researching-creative-cases:**
- evaluating-references: Evaluate a **single URL** actively shared by the user, against the user's own environment
- researching-creative-cases: The system actively scrapes **multiple award sites** to collect and curate examples

**evaluating-references vs analyzing-websites:**
- evaluating-references: Value judgment — "Is this useful?"
- analyzing-websites: Structural analysis task — "Analyze the structure" or "Create a sitemap"

</workflow>

<success_criteria>
**Quick Evaluation:** Return structured card format (table + summary + recommended action)

**Deep Research:**
- State adoption/rejection recommendation with rationale
- Attach an overview-level implementation plan when adopting
- Include comparison with existing environment (CLAUDE.md, Brewfile, skills/)
</success_criteria>
