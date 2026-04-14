---
name: user-doc-notion
description: Use when you want to automatically generate Notion documentation with screenshots. Takes screenshots of all features in a target app/website and creates a user-friendly operation guide in Notion. Use proactively when teams need to document operations for onboarding, handoff, or client delivery — triggered by 'Notionページに操作説明を作って', 'notionify', or 'screenshot して Notion にまとめて'.
effort: high
---

# user-notionify

## Overview

Automate the creation of a user-friendly operation guide in Notion by:

1. Discovering all features/sections of a target app or website
2. Taking screenshots of each feature using browser automation
3. Uploading screenshots to Notion via the file upload REST API
4. Building a structured Notion page with headings, images, and descriptions

Trigger keywords: "notionify", "Notionページに操作説明を作って", "screenshot して Notion にまとめて"

---

## Iron Law

1. **Check `NOTION_TOKEN` first.** If the env var is unset, stop immediately and tell the user to set it before continuing.
2. **Never screenshot login-required pages without confirmation.** If the target URL shows a login wall or the user mentions authentication is required, ask for explicit confirmation before proceeding.
3. **Always save screenshots locally before uploading.** Write every file to `/tmp/notionify/` first. Never send a screenshot directly to Notion without a local copy existing.

---

## Pre-flight

```bash
# 1. Check NOTION_TOKEN
echo ${NOTION_TOKEN:-"NOT SET"}

# 2. Test Notion API connectivity (expected: 200)
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  https://api.notion.com/v1/users/me
```

If `NOTION_TOKEN` is "NOT SET" or the HTTP status is not 200, stop and report the issue to the user.

---

## Execution Flow

### Step 1: Confirm Input

Before doing any work, confirm the following with the user:

- **Target URL** — the app or website to document
- **Notion parent page ID** — where to create the new doc (32-character hex ID from the page URL)
- **Scope** — all features, or specific sections only?
- **Document title** — what to name the Notion page

```bash
mkdir -p /tmp/notionify
```

---

### Step 2: Feature Discovery

Open the target URL and discover its navigation structure.

```bash
agent-browser open TARGET_URL
agent-browser wait 'body'
```

Use JS eval to extract navigation links and page sections:

```javascript
(() => {
  const navLinks = [...document.querySelectorAll('nav a, [role="navigation"] a, header a')]
    .map(a => ({ text: a.innerText.trim(), href: a.href }))
    .filter(l => l.text && l.href);
  const sections = [...document.querySelectorAll('section, [data-section], main > div')]
    .map(s => s.id || s.className || s.tagName)
    .filter(Boolean).slice(0, 20);
  return JSON.stringify({ navLinks, sections }, null, 2);
})()
```

Build a feature list from the results. Number each feature (feature-1, feature-2, …) for consistent file naming.

---

### Step 3: Screenshot Loop

For each feature or section identified in Step 2:

```bash
# Option A: navigate to a dedicated URL
agent-browser open FEATURE_URL
agent-browser wait 'CONTENT_SELECTOR'

# Option B: scroll to an in-page section
agent-browser eval 'document.querySelector("SELECTOR").scrollIntoView()'

# Take screenshot
agent-browser screenshot /tmp/notionify/feature-N-FEATURE_NAME.png
```

Replace `N` with the feature number and `FEATURE_NAME` with a slug (e.g., `feature-3-dashboard.png`).

If a specific selector is not found, fall back to a full-page screenshot and note the limitation in the description.

---

### Step 4: Upload Images to Notion

Notion MCP does not support binary file uploads directly. Use the Notion REST API (3-step process) for each screenshot.

```bash
# Step 4a: Create an upload session
UPLOAD=$(curl -s -X POST https://api.notion.com/v1/file_uploads \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"mode":"single_part"}')

UPLOAD_ID=$(echo $UPLOAD | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
UPLOAD_URL=$(echo $UPLOAD | python3 -c "import sys,json; print(json.load(sys.stdin)['upload_url'])")

# Step 4b: Upload the file (raw binary PUT — do NOT use -F/multipart here)
curl -s -X PUT "$UPLOAD_URL" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Content-Type: image/png" \
  --data-binary @/tmp/notionify/feature-N-FEATURE_NAME.png
```

Track the mapping `{ feature_name → upload_id }` as you go — you need it in Step 5.

---

### Step 5: Create Notion Page

Use the Notion MCP to create the page. Load it first with ToolSearch if not yet available:
`ToolSearch: "select:mcp__claude_ai_Notion__notion-create-pages"`

Then call `mcp__claude_ai_Notion__notion-create-pages` with the parent page ID.

Structure the page as follows — repeat the pattern for each feature:

```
## [Feature Name]          ← heading_2 block
[Screenshot]               ← image block
[Operation description]    ← paragraph block (user-friendly, plain language)
---                        ← divider block
```

Image block format (use the `UPLOAD_ID` from Step 4):

```json
{
  "object": "block",
  "type": "image",
  "image": {
    "type": "file_upload",
    "file_upload": { "id": "<UPLOAD_ID>" }
  }
}
```

> **Note**: The `file_upload` type (not `file`) is the correct format when referencing an upload created via `POST /v1/file_uploads`. Verify against the Notion API changelog if this produces a 400 error, as block formats can change across API versions.

Write operation descriptions in the **same language as the target app's UI** (auto-detect from the page content). Keep descriptions concise, action-oriented, and free of technical jargon.

---

### Step 6: Verify

Open the created Notion page and take a final screenshot to confirm images and text rendered correctly.

```bash
agent-browser open NOTION_PAGE_URL
agent-browser screenshot /tmp/notionify/result.png
```

Read the screenshot visually and confirm that images appear and sections are labeled correctly. Report any issues found.

---

## Error Handling

| Error | Action |
|-------|--------|
| `NOTION_TOKEN` not set | Stop immediately. Tell the user to set the env var. |
| Notion API returns non-200 on upload | Retry once. If it still fails, log the error and continue with the next screenshot. |
| `agent-browser` not found | Fall back to Playwright MCP for all screenshot steps. |
| Feature selector not found in DOM | Take a full-page screenshot instead and note the limitation in the description block. |
| Notion page creation fails | Report the full API error response to the user. Do not guess at a fix. |

---

## Output

```
/tmp/notionify/
├── feature-1-{name}.png
├── feature-2-{name}.png
├── ...
└── result.png    ← verification screenshot of the created Notion page
```

Report the Notion page URL at the end of the run.

---

## Env Requirements

| Variable | Required | Description |
|----------|----------|-------------|
| `NOTION_TOKEN` | Yes | Notion integration token (`secret_…`) |

---

## Status

- `DONE` — all features documented, Notion page created, all screenshots uploaded successfully
- `DONE_WITH_CONCERNS` — page created but some screenshots failed to upload or some features were skipped (list what was skipped)
- `BLOCKED` — `NOTION_TOKEN` not set, API connectivity failed, or Notion page creation returned an error (report the error)
