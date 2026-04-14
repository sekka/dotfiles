---
name: user-pmo-checklist
description: Generate a phase-gate checklist for a web project. Phases: kickoff / pre-launch / handoff. Output: Markdown checklist ready to paste into a project doc. Triggered by "チェックリスト", "checklist", "キックオフ確認", "公開前確認", or "納品確認". Also use proactively when entering any project phase — offer to generate the checklist without waiting for an explicit request.
argument-hint: [phase]
effort: low
---

# Phase Gate Checklist

Generate a project phase checklist for kickoff, pre-launch, or handoff.

## Iron Law

1. Do not skip checklist items — output all items for the requested phase
2. Output is plain Markdown — ready to copy-paste into Notion, Google Docs, or a project file
3. Never mix phases in one output — one checklist per invocation

## Trigger

Use when: Entering a project phase gate.

Arguments:
- `phase`: `kickoff` / `pre-launch` / `handoff`

If phase is missing or not one of the three options, ask with AskUserQuestion.

Before generating, if the project name is not provided as an argument or derivable from context, ask with AskUserQuestion: "プロジェクト名を教えてください。". Use today's date for `{date}`.

## Kickoff Checklist

Output when `phase = kickoff`:

````markdown
## Kickoff Checklist — {project name} ({date})

### Contracts & Admin
- [ ] Contract / SOW signed by both parties
- [ ] Invoice schedule agreed
- [ ] NDA signed (if applicable)

### Accounts & Access
- [ ] Hosting access shared with team
- [ ] Domain registrar access confirmed
- [ ] CMS admin account created
- [ ] Analytics account access shared
- [ ] Git repository access granted (if applicable)

### Schedule & Scope
- [ ] Project schedule agreed and distributed to all parties
- [ ] Milestone dates confirmed in writing
- [ ] Scope of work clearly defined — out-of-scope items listed

### Roles & Approval
- [ ] Design approver identified (client-side)
- [ ] Content approver identified (client-side)
- [ ] Launch approver identified (client-side)
- [ ] Internal team roles assigned (PM, Designer, Developer)

### Communication
- [ ] Communication channel established (Slack / email / etc.)
- [ ] Meeting cadence agreed (weekly / biweekly / on-demand)
- [ ] Escalation path defined
````

## Pre-Launch Checklist

Output when `phase = pre-launch`:

````markdown
## Pre-Launch Checklist — {project name} ({date})

### DNS & Infrastructure
- [ ] DNS A record pointing to new server
- [ ] SSL certificate active (HTTPS loads without warning)
- [ ] www redirect working (www → non-www or vice versa)
- [ ] Old domain 301 redirects in place (if migration)

### Forms & Tracking
- [ ] All contact forms submit successfully
- [ ] Form submission triggers confirmation email to user
- [ ] Form notification email received by client
- [ ] Google Analytics 4 / GTM firing on page load (verify with GA Debugger or GTM Preview)
- [ ] Conversion events tracked (if applicable)

### SEO & Meta
- [ ] `<title>` tags set and unique per page
- [ ] Meta descriptions set per page
- [ ] OG tags (og:title, og:description, og:image) set per key page
- [ ] robots.txt in place and not blocking indexing
- [ ] sitemap.xml accessible at /sitemap.xml
- [ ] Canonical tags set (if applicable)

### Assets & UI
- [ ] Favicon displays in browser tab
- [ ] 404 page exists, returns 404 status, is on-brand
- [ ] All images have alt attributes
- [ ] No broken links (internal and external)

### Performance & Quality
- [ ] Core Web Vitals baseline captured (PageSpeed Insights)
- [ ] Site loads correctly on mobile (iOS Safari + Android Chrome)
- [ ] Site loads correctly on desktop (Chrome + Safari)
- [ ] No JS console errors on key pages
````

## Handoff Checklist

Output when `phase = handoff`:

````markdown
## Handoff Checklist — {project name} ({date})

### Credentials & Access
- [ ] Hosting login credentials documented and transferred securely
- [ ] Domain registrar login transferred or admin contact updated
- [ ] CMS admin account created for client (separate from dev account)
- [ ] Analytics admin access transferred to client
- [ ] All dev/staging environments documented

### Documentation
- [ ] Operations manual delivered (how to update content, add pages, etc.)
- [ ] Known limitations or caveats documented
- [ ] Maintenance contact and escalation path documented

### Maintenance Agreement
- [ ] Maintenance plan scope agreed (what is / isn't covered)
- [ ] SLA defined (response time for bugs, update requests)
- [ ] Monthly retainer or ad-hoc model confirmed in writing

### Acceptance
- [ ] Client has reviewed and accepted the delivered site
- [ ] Acceptance signature or written approval obtained
- [ ] Final invoice issued
````

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — checklist output complete
- `## Status: NEEDS_CONTEXT` — phase argument missing or invalid (list valid options)
- `## Status: BLOCKED` — cannot generate (add reason)
