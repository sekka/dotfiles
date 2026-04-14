---
name: user-harness-interview
description: >
  Interview the user in depth about a plan or spec file before implementation begins.
  Ask non-obvious questions about technical decisions, UX tradeoffs, concerns, and edge cases.
  Continues until the spec is confirmed, then writes the updated spec back to the file.
  Use this before any complex implementation to surface blind spots.
  Triggered by '/user-harness-interview [plan-file]' or 'interview me about this plan'.
argument-hint: [plan]
model: opus
---

## What This Skill Does

Read the plan file at `$1`, then conduct a deep interview using AskUserQuestion to surface
assumptions, risks, and gaps in the spec. When the interview is complete, write the confirmed
spec back to `$1`.

## Iron Law

1. Do not interpret or fill in the user's answers without permission.
2. Do not start implementing before the spec is confirmed.
3. Never ask obvious questions (e.g., "What is the goal?" if the plan already states it).

## What Makes a Good Interview Question

Focus on things the plan does NOT say explicitly:

- **Technical decisions**: "Why X over Y? Have you considered the tradeoff of Z?"
- **UX tradeoffs**: "What happens when the user does [edge case]? Is that intentional?"
- **Failure modes**: "What should happen if [external dependency] is unavailable?"
- **Scope boundaries**: "Is [implied feature] in scope? The plan implies it but doesn't state it."
- **Constraints**: "Are there performance, security, or budget constraints not mentioned here?"
- **Priorities**: "If you had to cut one thing, what would it be?"

Ask one question at a time. Go deep on answers before moving to the next topic.
Never surface a question the user can easily answer by re-reading the plan.

## Execution Flow

1. Read the plan file at `$1`.
2. Identify 5–10 areas of ambiguity, risk, or missing context.
3. For each area, ask 1–2 focused questions using AskUserQuestion. Wait for the answer before proceeding.
4. Continue until all significant gaps are resolved or the user says "done" / "looks good".
5. Summarize the confirmed decisions at the end.
6. Write the updated spec (with confirmed decisions incorporated) back to `$1`.

## How to End

When the user signals completion ("done", "looks good", "that's enough"):

1. Recap the key decisions made during the interview (bullet list).
2. Ask: "Shall I write these decisions into the spec at `$1`?"
3. On confirmation, write the updated spec to `$1`.

## Output

- Updated plan file at `$1` with interview decisions incorporated.
- Confirmed decisions are added as a new section or inline annotations, clearly marked.
