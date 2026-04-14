---
name: user-dev-impl-review
description: Implementation review gate before launch. Orchestrates visual regression (user-fe-vrt), HTML quality (user-fe-html), and code review (user-dev-review), then adds launch-specific checks (forms, redirects, OG tags, DNS, SSL, analytics). Triggered by "実装レビュー", "公開前チェック", "implementation review", or "launch check".
argument-hint: [target-url] [figma-url]
allowed-tools: Read, Glob, Grep, Bash, mcp__figma__get_file
---

# Implementation Review Gate

Review the coded site against Figma and launch readiness before going live.

## Iron Law

1. BLOCKER findings must be resolved before launch — do not approve launch with open BLOCKERs
2. This skill orchestrates other skills — it does not duplicate their logic
3. Consolidated report is the single source of truth — do not mix findings from sub-skill runs with this report

## Trigger

Use when: Coding is complete and launch is imminent.

Arguments:
- `target-url`: live or staging URL (e.g. `https://staging.example.com`)
- `figma-url`: Figma file URL for visual comparison

## Process

Run all 4 phases in order. Collect findings. Output consolidated report.

### Phase 1: Visual Check (user-fe-vrt)

Delegate to `user-fe-vrt` skill with the target URL as input.
Collect: pages with FAIL or WARN diff results.

### Phase 2: HTML Quality (user-fe-html)

Delegate to `user-fe-html` skill scoped to the project's source files.
Collect: BLOCKER and WARNING findings (ignore INFO).

### Phase 3: Code Quality (user-dev-review)

Delegate to `user-dev-review` scoped to frontend files only (HTML, CSS, JS/TS).
Collect: security and correctness findings only (ignore style suggestions).

### Phase 4: Launch Checks (run directly)

Check each item using Bash:

```bash
# SSL check
curl -I {target-url} | grep -i "strict-transport"

# Redirect check (if migrating from old domain)
curl -I http://{old-domain}/ | grep -i location

# OG tags — check each key page
curl -s {target-url} | grep -i "og:"
curl -s {target-url}/about | grep -i "og:"

# robots.txt
curl -s {target-url}/robots.txt

# sitemap.xml
curl -s {target-url}/sitemap.xml | head -20

# 404 page
curl -I {target-url}/definitely-does-not-exist | grep "HTTP"
```

Check manually (cannot automate):
- [ ] All forms submit successfully and trigger confirmation email
- [ ] Google Analytics / GTM fires on page load (use GA Debugger or GTM Preview)
- [ ] Favicon appears in browser tab
- [ ] Page titles are unique per page (not all "サイト名" generic)

## Output Format

````markdown
# Implementation Review Gate Report — {project name}
**Date:** {date} | **Target:** {url} | **Figma:** {url}

## Result: {PASS ✅ | PASS WITH WARNINGS ⚠️ | FAIL ❌}

---

## Phase 1: Visual Check

| Page | Viewport | Diff % | Status |
|---|---|---|---|
| / | mobile | 0% | ✅ |
| /about | desktop | 3.2% | ⚠️ |

---

## Phase 2: HTML Quality

| Finding | Severity | File | Line |
|---|---|---|---|
| Missing alt on hero img | WARNING | index.html | 42 |

---

## Phase 3: Code Quality

| Finding | Severity | File |
|---|---|---|
| Inline event handler (onclick) | WARNING | contact.html |

---

## Phase 4: Launch Checks

| Check | Status | Note |
|---|---|---|
| SSL (HSTS header) | ✅ | |
| robots.txt | ✅ | |
| sitemap.xml | ✅ | 12 URLs |
| 404 page | ✅ | Returns 404 status |
| OG tags (TOP) | ✅ | |
| OG tags (/about) | ⚠️ | og:image missing |
| Form submission | ✅ | Confirmed manually |
| GA4 firing | ✅ | Confirmed via GA Debugger |
| Favicon | ✅ | |
| Unique page titles | ⚠️ | /service/* all use generic title |

---

## Action Required Before Launch

{numbered list, BLOCKERs first, then WARNINGs}

1. [BLOCKER] Fix visual regression on /about desktop — 3.2% diff exceeds threshold
2. [WARNING] Add og:image to /about page
3. [WARNING] Set unique <title> tags for /service/* pages
````

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — all checks passed (PASS or PASS WITH WARNINGS)
- `## Status: DONE_WITH_CONCERNS` — PASS WITH WARNINGS — list warnings
- `## Status: BLOCKED` — FAIL — list BLOCKERs that must be resolved before launch
- `## Status: NEEDS_CONTEXT` — missing target URL or Figma URL to proceed
