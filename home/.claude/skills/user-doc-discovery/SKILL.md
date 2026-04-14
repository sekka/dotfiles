---
name: user-doc-discovery
description: Generate a customized client briefing questionnaire before the first meeting. Input: project type and industry. Output: structured Markdown briefing sheet with answer fields, saved to ~/prj/{slug}/discovery.md. Triggered by "briefing sheet", "ヒアリングシート", "discovery", or "client questionnaire".
argument-hint: [project-type] [industry]
---

# Client Discovery — Briefing Questionnaire Generator

Generate a tailored client briefing questionnaire before the first client meeting.

## Iron Law

1. Never begin Process step 3 without knowing: project type, industry, and client name. If any are missing, ask in one AskUserQuestion before proceeding.
2. Primary output is a file saved to `~/prj/{slug}/discovery.md`. After saving, respond in chat with the file path and next-step instruction only.
3. Never invent answers — output answer fields (→) for the client to fill in

## Trigger

Use when: Starting a new project, before the first client meeting.

Arguments (positional or ask if missing):
- `project-type`: corporate / lp / ec / service / video / branding
- `industry`: real estate / healthcare / restaurant / b2b-saas / retail / manufacturing / etc.

## Process

1. If project type, industry, or client name is missing, ask all three together in one AskUserQuestion: "案件の種別（corporate/lp/ec/service/video/branding）、業種、クライアント名を教えてください。"
2. Select base question set (always included) + project-type-specific additions
3. Infer slug from client name: lowercase, hyphens, no spaces. For Japanese names, use phonetic romanization (e.g. "田中設計" → "tanaka-sekkei", "ABC商事" → "abc-shoji"). If unsure, ask the user: "スラッグ（URLに使う英字識別子）を教えてください。例: tanaka-sekkei"
4. Create `~/prj/{slug}/` directory if it does not exist
5. Save to `~/prj/{slug}/discovery.md`
6. Print the file path and say: "Fill this in with the client, then pass to `/user-doc-spec`."

## Question Sets

### Base (always included)

```
### Purpose & Background
- Why create this? What problem does it solve?
  →
- What does success look like 3 months after launch?
  →

### Target Audience
- Who is the primary user? (age / role / behavior / context)
  →
- Secondary audience?
  →

### Competitive & Reference Sites
- Sites you like and why? (list 2–3)
  →
- Direct competitors to be aware of?
  →

### Scope & Content
- Required pages or sections? (list)
  →
- Existing assets? (logo / photos / copy / brand guide)
  →

### Technical Requirements
- CMS needed? (yes / no / TBD)
  →
- Special integrations? (forms / booking / payment / analytics tracking)
  →

### Schedule & Budget
- Target launch date?
  →
- Budget range?
  →

### Approval Structure
- Who approves design? Who approves content? Who signs off on launch?
  →
```

### corporate (append after base)

```
### Company Profile
- Core business and positioning in one sentence?
  →
- Key differentiators from competitors?
  →
- Recruitment section needed?
  →
- News / press section? Update frequency?
  →
```

### lp (append after base)

```
### Conversion
- Single offer or multiple?
  →
- CTA type: form / phone / LINE / purchase?
  →
- A/B test planned?
  →
- Tracking pixels needed? (Meta / Google Ads / etc.)
  →
```

### ec (append after base)

```
### E-Commerce
- Number of SKUs at launch?
  →
- Payment gateway? (Stripe / Shopify / etc.)
  →
- Shipping logic? (flat rate / weight-based / free threshold)
  →
- Inventory managed in-house or via 3PL?
  →
```

### video (append after base)

```
### Video Production
- Script: client provides or we draft?
  →
- Footage: client shoots or we arrange crew?
  →
- Voiceover: language / gender / style?
  →
- Delivery format: web / broadcast / social?
  →
- Music: licensed or original?
  →
```

### branding (append after base)

```
### Branding
- Current brand assets and what's wrong with them?
  →
- Competitor visual landscape (what to avoid / what to aim for)?
  →
- Target feeling in 3–5 adjectives?
  →
- Deliverables: logo / color / typography / guidelines doc?
  →
```

### service (append after base)

```
### Service Site
- Number of service lines to feature?
  →
- Booking or inquiry flow?
  →
- Testimonials / case studies available?
  →
- Pricing shown publicly or on request?
  →
```

## Output File Format

```markdown
## Briefing Sheet — {client name} ({YYYY-MM-DD})

**Project type:** {type} | **Industry:** {industry}

---

{base questions}

{project-type-specific questions}
```

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — completed normally
- `## Status: DONE_WITH_CONCERNS` — completed but with notes (add bullet list)
- `## Status: NEEDS_CONTEXT` — missing information to proceed (add what is needed)
- `## Status: BLOCKED` — cannot continue (add reason)
