---
name: user-pm-judge
description: >
  Help a playing manager decide whether to act as a player or as a PM in the current situation.
  Identifies the current mode (player / PM / mixed), matches 1–3 of the 10 PM iron rules,
  and outputs actionable steps executable within 15 minutes.
  Also helps articulate vague "bad feelings" into concrete risk statements.
  Triggered by "判断に迷う", "PMとして", "役割整理", "モード確認", "なんか嫌な予感がする",
  "これはPMの仕事？", "どう動くべき？", "what should I do as PM", or "mode check".
argument-hint: [situation]
effort: low
---

# PM Judge

Disambiguate your current role and surface the right next action — in under 15 minutes.

## Iron Law

1. Never prescribe actions without first identifying the current mode
2. Always cite iron rules by number and name — vague encouragement is forbidden
3. Every recommended action must be executable in 15 minutes or less
4. When "bad feeling" language appears, invoke the risk articulation flow before mode judgment

## The 10 PM Iron Rules (internal reference)

| # | Rule |
|---|------|
| 1 | Use the project charter as your navigation anchor |
| 2 | Analyze and assess impact before taking any action |
| 3 | Route every change through the formal change process (log it, label it, reply with a holding response before committing) |
| 4 | The PM's role is to remove obstacles, not to execute tasks |
| 5 | Follow the 100% rule in the WBS |
| 6 | Communication accounts for the majority of PM work |
| 7 | Manage risks before they materialize |
| 8 | The baseline is a symbol of discipline |
| 9 | Team composition changes reset the group stage |
| 10 | Resolve conflict through collaborative problem-solving |

## Trigger

Use when: Facing a judgment call about role, unsure whether to act as player or PM, or sensing something is wrong but unable to name it.

Arguments:
- `situation`: free-text description of the current situation. If missing, ask with AskUserQuestion: "今どんな状況ですか？簡単に教えてください。"

## Process

### Step 1 — Receive situation

Accept `situation` from argument. If not provided, ask with AskUserQuestion.

### Step 2 — Bad-feeling detection

If the situation contains vague worry language ("嫌な予感", "なんかおかしい", "なんとなく", "気になる", "モヤモヤ", "something feels off", "bad feeling"):

Run risk articulation — ask 2–3 focused questions to sharpen the signal:
1. "何がどう気になっていますか？具体的に起きていることを教えてください。"
2. "それはいつ頃から感じていますか？"
3. "もし放置したら、何が起きると思いますか？"

After answers, summarize: "つまり、リスクとして「{articulated risk statement}」が発現する懸念があるということですね。"
Then proceed to Step 3 with the articulated risk as the situation.

### Step 3 — Mode judgment

Classify the situation into one of three modes:

**Player mode**: You are primarily executing tasks. Signs — "I'm coding / designing / writing", "I'm stuck on implementation", "I need to finish X by myself".

**PM mode**: You need to manage, decide, or unblock. Signs — "A team member is stuck", "scope changed", "client asked something", "deadline risk", "conflict between members".

**Mixed mode**: Both are happening simultaneously. Signs — "I'm coding but also need to handle X", "I'm the only one and must do both right now".

Write 1–2 sentences explaining why you chose this mode.

### Step 4 — Match iron rules

Select 1–3 rules from the 10 PM Iron Rules that most directly apply to this situation.

For each rule, write one sentence explaining how it applies to the *specific* situation — not a generic description of the rule.

### Step 5 — Output recommended actions

Provide 1–3 concrete actions, each completable within 15 minutes:
- Player mode: focus actions (defer PM work, set a clear stop time, block distractions)
- PM mode: management actions (log the risk, send a message, update pmo.yaml, call a quick sync)
- Mixed mode: sequencing actions (do PM task first, then resume player work with a defined window)

## Output Format

```markdown
## PM Judge — {one-line situation title}

**Current mode**: {Player / PM / Mixed}
**Reasoning**: {1–2 sentences}

**Applicable iron rules:**
- Rule {N} "{rule name}" — {how it applies to this specific situation}

**Recommended actions:**
1. {action 1 — completable in 15 min}
2. {action 2 — if applicable}
3. {action 3 — if applicable}
```

If bad-feeling flow was triggered, prepend before the mode block:

```markdown
**Risk articulation:**
"{articulated risk statement}"
→ Suggested: log this in decisions.md via /user-pm-meeting
```

## Status

- `## Status: DONE` — mode identified and actions output
- `## Status: NEEDS_CONTEXT` — situation not provided and user did not respond to AskUserQuestion
- `## Status: BLOCKED` — situation too ambiguous to classify even after bad-feeling articulation (rare)
