---
name: user-pm-meeting
description: Parse raw meeting notes into structured records — decisions.md entry, meetings archive file, and pmo.yaml sync. Triggered by "議事録", "meeting", "ミーティング記録", "meeting notes".
argument-hint: [slug] [meeting-notes]
effort: low
---

# PM Meeting — Notes → Structured Record

Parse raw meeting notes and produce a `decisions.md` entry, a `meetings/YYYY-MM-DD.md` archive, and updated `pmo.yaml` tasks and risks.

## Iron Law

1. Never invent decisions or action items — only extract what is explicitly stated in the notes
2. `decisions.md` に新エントリを先頭追加する（上書き禁止、最新が先頭）
3. Always sync action items with `status: pending` to `pmo.yaml` tasks
4. If slug is ambiguous, ask before writing any files

## Trigger

Use when: a meeting has occurred and the PM wants to record decisions, action items, and risks.

Arguments:
- `slug`: project directory name under `~/prj/` (auto-detect if only one project exists)
- `meeting-notes`: raw meeting notes (paste inline or provide file path)

## Process

### Step 1 — Resolve slug

Check `~/prj/` for project directories:
- If exactly one project exists: use that slug automatically (announce it)
- If multiple projects exist: list them and ask "どのプロジェクトの議事録ですか？slug を入力してください。"
- If no projects exist: respond with `## Status: NEEDS_CONTEXT` — "~/prj/ にプロジェクトが見つかりません。先に user-pm-discover を実行してください。"
- Validate that `~/prj/{slug}/` exists before proceeding

### Step 2 — Accept raw notes

If meeting notes were not provided with the command:
- Prompt: "会議メモを貼り付けてください。（終了は空行2つ）"
- Wait for the PM to paste the notes

If a file path was provided instead of inline text, read the file content.

### Step 3 — Extract from notes

Analyze the raw notes and extract the following four categories. Extract only what is explicitly stated — do not infer or supplement.

**Decisions (✅):** Clear conclusions that were reached. Definitive statements ("〜にする", "〜で決定", "decided to", "agreed on").

**Action items (📋):** Tasks assigned to a person with or without a deadline.
- Extract owner and due date from context
- If owner is not mentioned: use `[owner TBD]`
- If due date is not mentioned: use `TBD`

**Unresolved (❓):** Open questions that were raised but not answered. Pending decisions or items for follow-up.

**New risks (⚠️):** Risks or concerns surfaced during the meeting. Assign severity based on language cues:
- `high`: "重大", "致命的", "クリティカル", "critical", "blocker", or strong concern language
- `low`: "軽微", "minor", small concerns
- `medium`: default when unclear

### Step 4 — Determine meeting metadata

- **Meeting date:** extract from notes if present (format: YYYY-MM-DD); otherwise use today's date
- **Meeting title:** infer from notes if possible (agenda header, subject line, etc.); otherwise use "ミーティング {YYYY-MM-DD}"
- **Attendees:** extract if mentioned; otherwise omit

### Step 5 — Determine ID sequence numbers

Read existing files once now and do not re-read them mid-process:
- Read `~/prj/{slug}/decisions.md` if it exists → scan all entries and find the single highest number across D{n}, A{n}, U{n}, K{n}
- Read `~/prj/{slug}/pmo.yaml` if it exists → find highest T-{nnn} task id and K-{nnn} risk id
- New IDs for this meeting all start from (highest found + 1) and increment sequentially from there (e.g., if D3, A3, U2, K2 exist, the next available number is 4 — use D4, A4, U4, K4 as needed)
- If no existing file, start at D1, A1, U1, K1, T-001, K-001

### Step 6 — Append to decisions.md

File: `~/prj/{slug}/decisions.md`

**If the file does not exist:** create it with this header first:
```markdown
# Decisions Log

This file is append-only. Newest entries appear first.

---

```

Prepend the new entry immediately after the header (before any existing entries):

```markdown
## {YYYY-MM-DD} — {Meeting Title}

### Decisions
- [D{n}] {decision text}

### Action Items
| # | Action | Owner | Due |
| - | ------ | ----- | --- |
| A{n} | {action} | {owner} | {YYYY-MM-DD or TBD} |

### Unresolved
- [U{n}] {question}

### New Risks
- [K{n}] {risk} (severity: high/medium/low)

---

```

**Edge cases:**
- If no decisions found: write `- なし` under `### Decisions`
- If no action items found: write `なし` as a single line replacing the table under `### Action Items`
- If no unresolved items found: write `- なし` under `### Unresolved`
- If no new risks found: omit the `### New Risks` section entirely from this entry

### Step 7 — Save meeting archive

Create directory if needed: `mkdir -p ~/prj/{slug}/meetings/`

Save to `~/prj/{slug}/meetings/{YYYY-MM-DD}.md`. If that file already exists, use `{YYYY-MM-DD}-2.md`, then `-3.md`, etc. — increment the counter until the filename is free. Never overwrite an existing meeting file.

```markdown
# Meeting: {Meeting Title}

Date: {YYYY-MM-DD} | Project: {project name from pmo.yaml} | Attendees: {list if mentioned, else omit this field}

## Raw Notes

{original notes, lightly formatted — preserve content, normalize whitespace only}

## Extracted

### Decisions
- [D{n}] {decision text}

### Action Items
| # | Action | Owner | Due |
| - | ------ | ----- | --- |
| A{n} | {action} | {owner} | {YYYY-MM-DD or TBD} |

### Unresolved
- [U{n}] {question}

### New Risks
- [K{n}] {risk} (severity: high/medium/low)
```

Apply same edge-case rules as Step 6 for missing sections.

### Step 8 — Sync action items to pmo.yaml

For each action item extracted, append a new task entry under `tasks:` in `~/prj/{slug}/pmo.yaml`:

```yaml
- id: T-{next number, 3-digit zero-padded}
  phase: "{YYYY-MM-DD} action"
  name: "{action item text}"
  assignee: "{owner or TBD}"
  est_hours: 0
  deadline: "{YYYY-MM-DD or TBD}"
  status: pending
  source: "meeting {YYYY-MM-DD}"
```

If no action items were found, skip this step entirely (do not create an empty `tasks:` key or modify pmo.yaml).

If action items exist and `tasks:` key does not exist in pmo.yaml, add it as an empty list first, then append.

### Step 9 — Sync new risks to pmo.yaml

For each new risk extracted, append under `risks:` in `~/prj/{slug}/pmo.yaml`:

```yaml
- id: K-{next number, 3-digit zero-padded}
  description: "{risk text}"
  severity: "{high/medium/low}"
  mitigation: "TBD"
  source: "meeting {YYYY-MM-DD}"
```

If no new risks were found, skip this step entirely (do not create an empty `risks:` key or modify pmo.yaml).

If risks exist and `risks:` key does not exist in pmo.yaml, add it as an empty list first, then append.

### Step 10 — Update pmo.yaml project section

Check the `project:` section in `~/prj/{slug}/pmo.yaml`:
- If `decisions_file:` is absent or empty string `""`: set it to `decisions.md`
- If already set to a non-empty value: leave unchanged

### Step 11 — Report summary

Print a summary in chat:

```
## Meeting Recorded: {Meeting Title} ({YYYY-MM-DD})

- Decisions: {N}
- Action items: {N} ({N_tbd} with [owner TBD])
- Unresolved: {N}
- New risks: {N}

Files updated:
- ~/prj/{slug}/decisions.md
- ~/prj/{slug}/meetings/{YYYY-MM-DD}.md
- ~/prj/{slug}/pmo.yaml
```

## Completion Condition

`decisions.md` updated with newest entry first, `meetings/YYYY-MM-DD.md` saved, `pmo.yaml` synced with action items and risks.

## Status

Add one of the following at the end of every response:

- `## Status: DONE` — decisions.md updated, meeting file saved, pmo.yaml synced, no [owner TBD] items
- `## Status: DONE_WITH_CONCERNS` — saved successfully, but one or more action items have `[owner TBD]` (list the items)
- `## Status: NEEDS_CONTEXT` — notes not provided or slug not found (specify what is missing)
- `## Status: BLOCKED` — cannot parse notes or write files (add reason)
