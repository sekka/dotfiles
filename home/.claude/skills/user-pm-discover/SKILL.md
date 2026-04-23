---
name: user-pm-discover
description: Run an AI-guided client hearing session and produce discovery.md + initial pmo.yaml. Triggered by "ヒアリング開始", "discovery", or "要件ヒアリング". Saves to ~/prj/{slug}/.
argument-hint: [project-name] [client-name] [deadline]
effort: high
---

# PM Discovery — Client Hearing

Conduct a structured 7-question client hearing, classify answers, and generate `discovery.md` + `pmo.yaml` for the project.

## Iron Law

1. Create `~/prj/{slug}/` before writing any files
2. Never skip to output without completing the full 7-question interview
3. Never invent requirements — only classify what the PM explicitly states
4. Ask all missing arguments in a single AskUserQuestion, not one at a time

## Trigger

Use when: Starting a new project and a structured requirements hearing is needed.

Arguments (ask all missing in one AskUserQuestion):
- `project-name`: full project name (e.g. "○○ Corporate Site Renewal")
- `client-name`: client or company name
- `deadline`: final delivery date (YYYY-MM-DD)

## Process

### Step 1 — Collect missing arguments

If any of `project-name`, `client-name`, or `deadline` is missing, ask all of them at once with a single AskUserQuestion. Do not ask one at a time.

### Step 2 — Collect slug

Ask the PM to provide a slug for the project directory:

> "Please enter a project slug (kebab-case, max 30 chars, lowercase letters + hyphens + digits only).  
> Example: `oo-corporate-renewal`"

Validate the slug:
- Rule: 2–30 characters, lowercase alphanumeric and hyphens only, must start and end with an alphanumeric character
- Reject and re-ask if it contains uppercase letters, spaces, underscores, or special characters
- Reject if shorter than 2 or longer than 30 characters

### Step 3 — Create project directory

Before creating, check if `~/prj/{slug}/` already exists:
- If it exists, ask: "~/prj/{slug}/ already exists. Continue with this directory? (y/n)" — if n, go back to Step 2 and ask for a different slug.
- If it does not exist, run: `mkdir -p ~/prj/{slug}/`

Confirm creation before proceeding.

### Step 4 — Conduct 7-question interview

Ask each question one at a time. Wait for the PM's answer before moving to the next question. After each answer:
- Classify the content into one or more of: **Goals**, **Non-Goals**, **Requirements**, **Constraints**, **Risks**
- If the answer is ambiguous or incomplete, ask one targeted follow-up question immediately before moving on
- If the PM cannot answer even after the follow-up, mark the item as `[Unknown - confirm later]` and continue to the next question. Flag all `[Unknown]` items in the Step 5 summary.

**Questions (in order):**

1. **Background & Purpose**  
   "このプロジェクトの背景と目的を教えてください。なぜ今このプロジェクトが必要なのでしょうか？"

2. **Goals (Success Criteria)**  
   "プロジェクトが成功したと判断できる条件を教えてください。完了時に何が達成されている必要がありますか？"

3. **Non-Goals (Scope Boundaries)**  
   "今回のスコープに含めないこと、対象外とすることを教えてください。"

4. **Functional Requirements**  
   "クライアントから求められている具体的な機能や成果物を教えてください。"

5. **Constraints**  
   "予算・納期・技術・体制など、プロジェクト上の制約条件を教えてください。"

6. **Risks & Concerns**  
   "現時点で懸念されているリスクや不確実要素はありますか？"

7. **Open Questions**  
   "まだ決まっていないこと、クライアントへの確認が必要な事項はありますか？それぞれいつまでに確認できますか？"

### Step 5 — Present summary and confirm

After Q7, present the classified summary in chat:

```
## Hearing Summary

**Goals:** ...
**Non-Goals:** ...
**Requirements:** ...
**Constraints:** ...
**Risks:** ...
**Open Questions:** ...
```

Ask: "この内容で正しいですか？修正や追加があれば教えてください。"

Accept corrections and update the classification before proceeding.

### Step 6 — Generate discovery.md

Save to `~/prj/{slug}/discovery.md`:

```markdown
# Discovery: {Project Name}

Date: {YYYY-MM-DD} | Client: {client} | PM: {git user name}

## Goals
- [ ] {goal}

## Non-Goals
- [ ] {non-goal}

## Requirements
| ID | Requirement | Source | Priority |
| -- | ----------- | ------ | -------- |
| R01 | ... | Client | Must |

## Constraints
- Budget: ...
- Deadline: ...
- Technical: ...
- Other: ...

## Risks
| ID | Risk | Probability | Impact | Mitigation |
| -- | ---- | ----------- | ------ | ---------- |
| K01 | ... | High | High | ... |

## Open Questions
- [ ] {question} [deferred until {YYYY-MM-DD}]
```

Rules for filling in the template:
- Assign sequential IDs: R01, R02 … for Requirements; K01, K02 … for Risks
- `Source` is always "Client" unless the PM specifies otherwise
- `Priority` values: Must / Should / Could
- `Probability` values: High / Medium / Low
- `Impact` values: High / Medium / Low
- Every Open Question must have a `[deferred until YYYY-MM-DD]` tag based on the PM's answer to Q7
- PM name: obtain from `git config user.name`. If the command returns empty, use `PM` as the placeholder name.

### Step 7 — Generate initial pmo.yaml

Save to `~/prj/{slug}/pmo.yaml`:

```yaml
project:
  name: "{project name}"
  slug: "{slug}"
  client: "{client name}"
  deadline: "{YYYY-MM-DD}"
  phase: "discovery"
  discovery_file: discovery.md
  spec_file: ""
  design_doc_file: ""
  decisions_file: ""
  notion_page_id: ""

tasks: []
risks: []
```

### Step 8 — Report completion

Say:
> "Discovery complete. Files saved:
> - `~/prj/{slug}/discovery.md`
> - `~/prj/{slug}/pmo.yaml`
>
> Next step: run `user-pm-spec` to create the specification document."

## Completion Condition

`discovery.md` is generated and all Open Questions are either resolved inline or explicitly deferred with a `[deferred until YYYY-MM-DD]` tag.

## Status

Add one of the following at the end of every response:

- `## Status: DONE` — discovery.md and pmo.yaml generated, no unresolved open questions
- `## Status: DONE_WITH_CONCERNS` — generated, but open questions remain deferred (list them)
- `## Status: NEEDS_CONTEXT` — missing required arguments (list what is needed)
- `## Status: BLOCKED` — cannot proceed (add reason)
