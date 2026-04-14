---
name: user-fe-vrt
description: Visual regression test that captures screenshots at multiple viewports before and after code changes, then diffs them with ImageMagick. Triggered by "visual check", "layout check", "VRT", "screenshot compare", or "check if layout is broken".
---

# Visual Regression Test (VRT)

Capture screenshots before and after changes to markup, CSS, or layout. Detect pixel-level differences.

## Iron Law

1. Do not compare without a before-change screenshot

## Progress Reporting Rules (Required)

Report progress to the user at the start and end of each Phase. Report format:

```
[VRT Phase N/5] {Phase name} — {status}
  Done: X/Y pages × Z viewports
  Next: {next action}
```

If an error occurs, report it immediately and try alternatives without stopping.

## Execution Rules (Required)

- **Always delegate VRT script execution to a subagent (implementer).** Do not consume the main agent's context.
- Pass the script path, URL list path, and expected results clearly to the subagent.
- After the subagent completes, the main agent takes a screenshot of the report and shows it to the user.
- **Limit the test scope when running:** For verification purposes, 1 page × 1 viewport is enough. Run the full test only for final validation.

## Prerequisites

- ImageMagick (`magick`) is installed
- Node.js is installed (Playwright is installed via npm install)
- `scripts/vrt-urls.txt` exists in the project (list of target URLs)

If `scripts/vrt-urls.txt` does not exist, ask the user for the target URLs and create it.

## Workflow

vrt.sh handles all steps automatically. The AI does not need to write scripts for each phase manually.

### Phase 1: Setup

Calling `vrt.sh` automatically runs:

- Stash leftover check (stops with error if a previous `vrt-auto` stash remains)
- Playwright installation (isolated in `/tmp/vrt-work/`)
- URLs file backup (copied to `/tmp/vrt-work/` so it is not lost by git stash)

### Phase 2: Capture Baseline

vrt.sh handles automatically:

- Stashes code changes with `git add -A && git stash push -m "vrt-auto"`
- Captures screenshots at 3 viewports (1440px → 768px → 375px) in sequence
- An EXIT trap runs after stashing, so `git stash pop` runs automatically even if the script exits early

If a baseline already exists (`/tmp/vrt-baseline/`), this phase is skipped. Use `VRT_FORCE_BASELINE=1` to force re-capture.

### Phase 3: Apply Code Changes

(Outside the scope of this skill. Run vrt.sh after changes are complete.)

### Phase 4: Capture After + Diff (per viewport, fail-fast)

vrt.sh handles automatically (`git stash pop` runs once before After capture):

```
for each viewport in (1440, 768, 375):
  1. Capture After (that VP only)
  2. Calculate diff (that VP only)
  3. If FAIL → generate report and exit 1 immediately (skip remaining VPs)
```

Fail-fast stops at the first failing viewport and outputs the report immediately.

### Phase 5: Review Report

Output location: `/tmp/vrt-report/index.html` (opens in browser automatically on macOS)

Report contents:
- Page title row shows **PASS/WARN/FAIL** and percentage
- 3 columns: BEFORE / AFTER / DIFF images
- Filter buttons (Status / Page / Viewport)

## Criteria

| Status | Diff rate (after fuzz 2%) | Action |
|------|---------------------|-----------|
| PASS | < 0.5% | No problem |
| WARN | 0.5% to 2.0% | Show diff image to user for confirmation |
| FAIL | >= 2.0% | Possible layout break. Investigation required |

## About Rendering Noise

Photo areas produce small differences each time due to anti-aliasing. Fuzz 2% absorbs these. If FAIL still occurs, also check `magick compare -metric SSIM`.

## Commands

```bash
# Normal run (fully automatic from baseline)
bash ~/.claude/skills/user-fe-vrt/vrt.sh scripts/vrt-urls.txt

# Force re-capture baseline
VRT_FORCE_BASELINE=1 bash ~/.claude/skills/user-fe-vrt/vrt.sh scripts/vrt-urls.txt

# Capture baseline only (no git stash, no diff)
# Saves the current display state as the baseline.
# Use this when you want to capture the baseline before making changes.
VRT_BASELINE_ONLY=1 bash ~/.claude/skills/user-fe-vrt/vrt.sh scripts/vrt-urls.txt
```

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — VRT complete, all pages PASS across all viewports, report saved to `/tmp/vrt-report/index.html`
- `## Status: DONE_WITH_CONCERNS` — VRT complete but one or more pages returned WARN; diff images shown to user for confirmation
- `## Status: BLOCKED` — baseline screenshot missing, ImageMagick not installed, or `scripts/vrt-urls.txt` not found
- `## Status: NEEDS_CONTEXT` — target URLs or before-change baseline not yet established
