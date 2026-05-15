---
name: user-pmo-wbs
description: >
  Use when starting a new project and a WBS is needed. Generates a
  domain-aware Work Breakdown Structure with day estimates from built-in
  templates (corporate-site, lp, ec, video-production, animation, branding,
  logo-design, cms-setup, migration) and saves to ~/prj/{slug}/WBS.yaml.
  Triggers: "WBS", "工数見積", "タスク洗い出し", "work breakdown".
argument-hint: [project-name] [deliverable-types] [deadline] [team-members]
effort: medium
context: fork
agent: general-purpose
---

# WBS Generator

Generate a project WBS with estimated days for each task, based on the deliverable type.

## Iron Law

1. Never invent tasks not relevant to the stated deliverable type — use the matching template (Why: Off-template tasks break WBS structure and create estimate/actual divergence)
2. Save to `~/prj/{slug}/WBS.yaml` — primary output is the YAML file, not the chat table
3. Interactive only after initial generation — present the full WBS first, then accept adjustments
4. Follow the 100% rule — the WBS must cover every task in project scope; no out-of-scope tasks, no omissions

## Trigger

Use when: Starting a new project and a WBS is needed.

Arguments (ask if missing):
- `project-name`: full project name (e.g. "○○ Corporate Site")
- `deliverable-types`: comma-separated list from supported types below
- `deadline`: final delivery date (YYYY-MM-DD)
- `team-members`: comma-separated names (e.g. "PM, Designer, Developer") — used for context only. Actual assignees in the WBS follow the template roles. If a provided member has no matching template role, they are silently ignored (do not add tasks or warn).

If any argument is missing, ask with AskUserQuestion (ask all missing in one question).

Supported deliverable types:
- `corporate-site` — multi-page corporate website
- `lp` — single landing page
- `ec` — e-commerce site
- `service-site` — SaaS or service site
- `video-production` — live-action video
- `animation` — motion graphics / animated video
- `motion-graphics` — alias for animation (same template)
- `branding` — brand identity system
- `logo-design` — logo only
- `cms-setup` — CMS installation and configuration
- `migration` — site migration from old platform

## Process

1. If any required argument is missing, ask with AskUserQuestion (ask all missing in one question)
2. Infer slug from project name: lowercase, hyphens, ASCII only (e.g. "○○ Corporate Site" → "oo-corporate-site")
2a. If `~/prj/{slug}/discovery.md` exists, read it and apply discovery multipliers to day estimates:
    - Requirements count (rows in the Requirements table) > 20 → multiply all est_days by 1.3 (round to nearest 0.5日)
    - Any risk with both Probability: High AND Impact: High present → add 10% buffer to project total days (round up to nearest 0.5日). Do NOT redistribute this buffer to individual task est_days — note it as a footer line in the WBS chat table: "Risk buffer (+10%): {Xd} | Total with buffer: {Yd}"
    - More than 3 rows with Priority: PENDING or source showing "未確認" → flag in output: "⚠️ {n} 件の要件が未確定です。WBS確定前にクライアント確認を推奨します。"
    The deliverable-type templates are not overridden — only the day totals are adjusted. If discovery.md is absent or malformed, skip this step silently.
3. Generate WBS from template for each deliverable type (see Task Templates below)
4. Adjust deadlines: distribute tasks backward from the final deadline
5. Present the WBS as a Markdown table in chat
6. Save to `~/prj/{slug}/WBS.yaml` (see YAML format below)
7. Say: "WBS saved. Adjust tasks, days, or assignees by describing what to change."
8. Accept adjustments via conversation — re-save after each change

## Task Templates

### corporate-site / service-site

| Phase | Task | Assignee | Est. days |
|---|---|---|---|
| 1. Requirements | Briefing meeting | PM | 2d |
| 1. Requirements | RTM creation | PM | 3d |
| 1. Requirements | Client review & sign-off | PM | 1d |
| 2. IA & Copy | IA proposal | PM | 4d |
| 2. IA & Copy | Copywriting draft | PM | 8d |
| 2. IA & Copy | Client review & revisions | PM | 2d |
| 3. Design | Wireframes | Designer | 8d |
| 3. Design | Visual design (desktop) | Designer | 16d |
| 3. Design | Visual design (mobile) | Designer | 8d |
| 3. Design | Client review & revisions | Designer | 4d |
| 4. Development | HTML/CSS markup | Developer | 16d |
| 4. Development | CMS integration | Developer | 8d |
| 4. Development | Form & tracking setup | Developer | 4d |
| 4. Development | Browser QA | Developer | 4d |
| 5. Launch | Pre-launch checklist | PM | 2d |
| 5. Launch | Launch & DNS switch | Developer | 2d |
| 5. Launch | Handoff documentation | PM | 2d |

### lp

| Phase | Task | Assignee | Est. days |
|---|---|---|---|
| 1. Requirements | Briefing & RTM | PM | 3d |
| 2. Copy | Copywriting draft | PM | 4d |
| 2. Copy | Client review | PM | 1d |
| 3. Design | Visual design (desktop + mobile) | Designer | 12d |
| 3. Design | Client review & revisions | Designer | 3d |
| 4. Development | HTML/CSS markup | Developer | 8d |
| 4. Development | Form & tracking setup | Developer | 2d |
| 4. Development | Browser QA | Developer | 2d |
| 5. Launch | Pre-launch checklist & launch | PM + Developer | 2d |

### ec

| Phase | Task | Assignee | Est. days |
|---|---|---|---|
| 1. Requirements | Briefing & RTM | PM | 4d |
| 1. Requirements | Product / category structure | PM | 3d |
| 2. Design | UI design (key pages) | Designer | 24d |
| 2. Design | Client review & revisions | Designer | 6d |
| 3. Development | Platform setup (Shopify / etc.) | Developer | 8d |
| 3. Development | Theme development | Developer | 24d |
| 3. Development | Payment & shipping config | Developer | 4d |
| 3. Development | Product data import | Developer | 4d |
| 3. Development | QA (desktop + mobile) | Developer | 6d |
| 4. Launch | Pre-launch checklist | PM | 2d |
| 4. Launch | Launch & DNS | Developer | 2d |
| 4. Launch | Handoff | PM | 2d |

### video-production

| Phase | Task | Assignee | Est. days |
|---|---|---|---|
| 1. Pre-production | Brief & concept | PM | 2d |
| 1. Pre-production | Script | Copywriter | 6d |
| 1. Pre-production | Storyboard | Director | 8d |
| 1. Pre-production | Client approval | PM | 1d |
| 1. Pre-production | Location / talent / crew booking | PM | 4d |
| 2. Production | Shooting | Crew (external) | 8d |
| 3. Post-production | Rough cut | Editor | 8d |
| 3. Post-production | Client review | PM | 1d |
| 3. Post-production | Final edit + color grade | Editor | 6d |
| 3. Post-production | Audio mix | Editor | 3d |
| 3. Post-production | Delivery (formats + upload) | Editor | 2d |

### animation / motion-graphics

| Phase | Task | Assignee | Est. days |
|---|---|---|---|
| 1. Pre-production | Brief & concept | PM | 2d |
| 1. Pre-production | Script / narration | Copywriter | 4d |
| 1. Pre-production | Storyboard | Designer | 8d |
| 1. Pre-production | Client approval | PM | 1d |
| 2. Design | Asset design (characters / icons / BG) | Designer | 16d |
| 3. Animation | Motion build | Animator | 20d |
| 3. Animation | Voiceover recording (if needed) | External | 3d |
| 3. Animation | Audio sync & SFX | Animator | 3d |
| 3. Animation | Client review & revisions | Animator | 4d |
| 4. Delivery | Export (MP4 / GIF / web) | Animator | 2d |

### branding

| Phase | Task | Assignee | Est. days |
|---|---|---|---|
| 1. Research | Brand workshop | PM | 3d |
| 1. Research | Competitor analysis | Designer | 4d |
| 2. Concept | Mood boards (3 directions) | Designer | 8d |
| 2. Concept | Client review | PM | 1d |
| 3. Design | Logo design (selected direction) | Designer | 12d |
| 3. Design | Color palette & typography | Designer | 4d |
| 3. Design | Client review & revisions | Designer | 4d |
| 4. Delivery | Brand guide document | Designer | 8d |
| 4. Delivery | Asset export (SVG / PNG / PDF) | Designer | 2d |

### logo-design

| Phase | Task | Assignee | Est. days |
|---|---|---|---|
| 1. Brief | Brief & reference gathering | PM | 1d |
| 2. Concept | Logo concepts (3 directions) | Designer | 8d |
| 2. Concept | Client review | PM | 1d |
| 3. Refinement | Revisions on selected direction | Designer | 4d |
| 3. Refinement | Final client approval | PM | 1d |
| 4. Delivery | Final files (SVG, PNG, PDF) | Designer | 1d |

### cms-setup

| Phase | Task | Assignee | Est. days |
|---|---|---|---|
| 1. Planning | CMS selection & configuration plan | Developer | 3d |
| 2. Setup | Server / hosting setup | Developer | 4d |
| 2. Setup | CMS installation | Developer | 2d |
| 2. Setup | Theme / template configuration | Developer | 8d |
| 2. Setup | User accounts & permissions | Developer | 2d |
| 3. Content | Content migration or entry | Developer | 8d |
| 4. QA | QA & client walkthrough | PM + Developer | 3d |
| 4. QA | Handoff documentation | PM | 2d |

### migration

| Phase | Task | Assignee | Est. days |
|---|---|---|---|
| 1. Audit | Content inventory | PM | 4d |
| 1. Audit | URL mapping (old → new) | PM | 3d |
| 2. Setup | New platform setup | Developer | 4d |
| 3. Migration | Content migration | Developer | 8d |
| 3. Migration | 301 redirect setup | Developer | 3d |
| 3. Migration | Link & form QA | Developer | 4d |
| 4. Launch | DNS switch | Developer | 1d |
| 4. Launch | Post-launch monitoring (48h) | Developer | 2d |
| 4. Launch | Handoff | PM | 2d |

## YAML Output Format

Save to `~/prj/{slug}/WBS.yaml`:

```yaml
project:
  name: "{project name}"
  slug: "{slug}"
  deadline: "{YYYY-MM-DD}"
  phase: "spec"

tasks:
  - id: T-001
    phase: "{phase name}"
    name: "{task name}"
    assignee: "{assignee}"
    est_days: {number}
    deadline: "{YYYY-MM-DD}"
    status: pending
```

Set `status: pending` for all tasks on initial generation.
Distribute task deadlines backward from the project deadline (final phase ends on deadline; earlier phases end proportionally earlier).

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — WBS generated and saved
- `## Status: DONE_WITH_CONCERNS` — generated but with notes (add bullet list)
- `## Status: NEEDS_CONTEXT` — missing required arguments (list what is needed)
- `## Status: BLOCKED` — cannot generate (add reason)
