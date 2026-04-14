---
name: user-pmo-wbs
description: Generate a domain-aware WBS (Work Breakdown Structure) for a new project. Supports corporate-site, lp, ec, video-production, animation, branding, logo-design, cms-setup, migration. Saves to ~/prj/{slug}/pmo.yaml. Triggered by "WBS", "工数見積", "タスク洗い出し", or "work breakdown".
argument-hint: [project-name] [deliverable-types] [deadline] [team-members]
---

# WBS Generator

Generate a project WBS with estimated hours for each task, based on the deliverable type.

## Iron Law

1. Never invent tasks not relevant to the stated deliverable type — use the matching template
2. Save to `~/prj/{slug}/pmo.yaml` — primary output is the YAML file, not the chat table
3. Interactive only after initial generation — present the full WBS first, then accept adjustments

## Trigger

Use when: Starting a new project and a WBS is needed.

Arguments (ask if missing):
- `project-name`: full project name (e.g. "○○ Corporate Site")
- `deliverable-types`: comma-separated list from supported types below
- `deadline`: final delivery date (YYYY-MM-DD)
- `team-members`: comma-separated names (e.g. "PM, Designer, Developer")

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
3. Generate WBS from template for each deliverable type (see Task Templates below)
4. Adjust deadlines: distribute tasks backward from the final deadline
5. Present the WBS as a Markdown table in chat
6. Save to `~/prj/{slug}/pmo.yaml` (see YAML format below)
7. Say: "WBS saved. Adjust tasks, hours, or assignees by describing what to change."
8. Accept adjustments via conversation — re-save after each change

## Task Templates

### corporate-site / service-site

| Phase | Task | Assignee | Est. hours |
|---|---|---|---|
| 1. Requirements | Briefing meeting | PM | 2h |
| 1. Requirements | RTM creation | PM | 3h |
| 1. Requirements | Client review & sign-off | PM | 1h |
| 2. IA & Copy | IA proposal | PM | 4h |
| 2. IA & Copy | Copywriting draft | PM | 8h |
| 2. IA & Copy | Client review & revisions | PM | 2h |
| 3. Design | Wireframes | Designer | 8h |
| 3. Design | Visual design (desktop) | Designer | 16h |
| 3. Design | Visual design (mobile) | Designer | 8h |
| 3. Design | Client review & revisions | Designer | 4h |
| 4. Development | HTML/CSS markup | Developer | 16h |
| 4. Development | CMS integration | Developer | 8h |
| 4. Development | Form & tracking setup | Developer | 4h |
| 4. Development | Browser QA | Developer | 4h |
| 5. Launch | Pre-launch checklist | PM | 2h |
| 5. Launch | Launch & DNS switch | Developer | 2h |
| 5. Launch | Handoff documentation | PM | 2h |

### lp

| Phase | Task | Assignee | Est. hours |
|---|---|---|---|
| 1. Requirements | Briefing & RTM | PM | 3h |
| 2. Copy | Copywriting draft | PM | 4h |
| 2. Copy | Client review | PM | 1h |
| 3. Design | Visual design (desktop + mobile) | Designer | 12h |
| 3. Design | Client review & revisions | Designer | 3h |
| 4. Development | HTML/CSS markup | Developer | 8h |
| 4. Development | Form & tracking setup | Developer | 2h |
| 4. Development | Browser QA | Developer | 2h |
| 5. Launch | Pre-launch checklist & launch | PM + Developer | 2h |

### ec

| Phase | Task | Assignee | Est. hours |
|---|---|---|---|
| 1. Requirements | Briefing & RTM | PM | 4h |
| 1. Requirements | Product / category structure | PM | 3h |
| 2. Design | UI design (key pages) | Designer | 24h |
| 2. Design | Client review & revisions | Designer | 6h |
| 3. Development | Platform setup (Shopify / etc.) | Developer | 8h |
| 3. Development | Theme development | Developer | 24h |
| 3. Development | Payment & shipping config | Developer | 4h |
| 3. Development | Product data import | Developer | 4h |
| 3. Development | QA (desktop + mobile) | Developer | 6h |
| 4. Launch | Pre-launch checklist | PM | 2h |
| 4. Launch | Launch & DNS | Developer | 2h |
| 4. Launch | Handoff | PM | 2h |

### video-production

| Phase | Task | Assignee | Est. hours |
|---|---|---|---|
| 1. Pre-production | Brief & concept | PM | 2h |
| 1. Pre-production | Script | Copywriter | 6h |
| 1. Pre-production | Storyboard | Director | 8h |
| 1. Pre-production | Client approval | PM | 1h |
| 1. Pre-production | Location / talent / crew booking | PM | 4h |
| 2. Production | Shooting | Crew (external) | 8h |
| 3. Post-production | Rough cut | Editor | 8h |
| 3. Post-production | Client review | PM | 1h |
| 3. Post-production | Final edit + color grade | Editor | 6h |
| 3. Post-production | Audio mix | Editor | 3h |
| 3. Post-production | Delivery (formats + upload) | Editor | 2h |

### animation / motion-graphics

| Phase | Task | Assignee | Est. hours |
|---|---|---|---|
| 1. Pre-production | Brief & concept | PM | 2h |
| 1. Pre-production | Script / narration | Copywriter | 4h |
| 1. Pre-production | Storyboard | Designer | 8h |
| 1. Pre-production | Client approval | PM | 1h |
| 2. Design | Asset design (characters / icons / BG) | Designer | 16h |
| 3. Animation | Motion build | Animator | 20h |
| 3. Animation | Voiceover recording (if needed) | External | 3h |
| 3. Animation | Audio sync & SFX | Animator | 3h |
| 3. Animation | Client review & revisions | Animator | 4h |
| 4. Delivery | Export (MP4 / GIF / web) | Animator | 2h |

### branding

| Phase | Task | Assignee | Est. hours |
|---|---|---|---|
| 1. Research | Brand workshop | PM | 3h |
| 1. Research | Competitor analysis | Designer | 4h |
| 2. Concept | Mood boards (3 directions) | Designer | 8h |
| 2. Concept | Client review | PM | 1h |
| 3. Design | Logo design (selected direction) | Designer | 12h |
| 3. Design | Color palette & typography | Designer | 4h |
| 3. Design | Client review & revisions | Designer | 4h |
| 4. Delivery | Brand guide document | Designer | 8h |
| 4. Delivery | Asset export (SVG / PNG / PDF) | Designer | 2h |

### logo-design

| Phase | Task | Assignee | Est. hours |
|---|---|---|---|
| 1. Brief | Brief & reference gathering | PM | 1h |
| 2. Concept | Logo concepts (3 directions) | Designer | 8h |
| 2. Concept | Client review | PM | 1h |
| 3. Refinement | Revisions on selected direction | Designer | 4h |
| 3. Refinement | Final client approval | PM | 1h |
| 4. Delivery | Final files (SVG, PNG, PDF) | Designer | 1h |

### cms-setup

| Phase | Task | Assignee | Est. hours |
|---|---|---|---|
| 1. Planning | CMS selection & configuration plan | Developer | 3h |
| 2. Setup | Server / hosting setup | Developer | 4h |
| 2. Setup | CMS installation | Developer | 2h |
| 2. Setup | Theme / template configuration | Developer | 8h |
| 2. Setup | User accounts & permissions | Developer | 2h |
| 3. Content | Content migration or entry | Developer | 8h |
| 4. QA | QA & client walkthrough | PM + Developer | 3h |
| 4. QA | Handoff documentation | PM | 2h |

### migration

| Phase | Task | Assignee | Est. hours |
|---|---|---|---|
| 1. Audit | Content inventory | PM | 4h |
| 1. Audit | URL mapping (old → new) | PM | 3h |
| 2. Setup | New platform setup | Developer | 4h |
| 3. Migration | Content migration | Developer | 8h |
| 3. Migration | 301 redirect setup | Developer | 3h |
| 3. Migration | Link & form QA | Developer | 4h |
| 4. Launch | DNS switch | Developer | 1h |
| 4. Launch | Post-launch monitoring (48h) | Developer | 2h |
| 4. Launch | Handoff | PM | 2h |

## YAML Output Format

Save to `~/prj/{slug}/pmo.yaml`:

```yaml
project:
  name: "{project name}"
  slug: "{slug}"
  deadline: "{YYYY-MM-DD}"
  phase: "requirements"

tasks:
  - id: T-001
    phase: "{phase name}"
    name: "{task name}"
    assignee: "{assignee}"
    est_hours: {number}
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
