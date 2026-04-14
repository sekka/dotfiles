---
name: user-doc-copy
description: Generate per-page content drafts from a confirmed IA document. Output: Markdown copy draft with headline, body, CTA per section. Placeholders for missing assets marked with 📌 REQUIRED. Triggered by "コンテンツたたき台", "copy draft", "ライティング", or "content draft".
argument-hint: [ia-file-path] [--tone professional|friendly|premium]
---

# Content Draft Generator

Generate first-draft copy for every page in the IA, ready for client review and editing.

## Iron Law

1. Never fabricate specific facts — use placeholders for unknown data (employee count, founding year, etc.)
2. Every placeholder must be marked `📌 REQUIRED:` so the client knows what to provide
3. Primary output is a file saved to `~/prj/{slug}/copy-draft.md`. After saving, respond in chat with the file path and next-step instruction only.
4. Write in Japanese unless the client brief specifies another language

## Trigger

Use when: IA is confirmed and content writing can begin.

Arguments:
- `ia-file-path`: path to the confirmed IA Markdown file (e.g. `~/prj/abc-corp/ia.md`)
- `--tone`: `professional` (default) / `friendly` / `premium`

Tone guide:
- **professional**: 丁寧語、体言止め控えめ、信頼感重視
- **friendly**: ですます + 親しみやすい言葉、短文
- **premium**: 格調ある語彙、余白感、体言止め多用

## Process

1. If IA path is missing, ask with AskUserQuestion
2. Read IA file — extract page list and slug (from file path: parent directory name). If slug is ambiguous, ask the user: "スラッグ（プロジェクト識別子）を教えてください。"
3. If not derivable from IA, ask with AskUserQuestion: company name, USP (1–2 sentences), main CTA type
4. For each page in the page list, generate copy (see Output Format below)
5. Save to `~/prj/{slug}/copy-draft.md`
6. Print file path and note: "Send to the client to review and edit. Required items marked 📌 must be confirmed before design."

## Output Format

One section per page, in IA order.

````markdown
---

## {Page name} ({path})

### Hero / メインビジュアル

**キャッチコピー:** 「{USPを体現する一文 — 15字以内}」
**サブコピー:** 「{補足説明 — 30字以内}」
**CTA:** 「{action label}」→ {path}

📌 REQUIRED: [PHOTO: メインビジュアル — クライアントより提供 or ストック素材選定]

---

### {Section name}

**見出し:** 「{section heading}」

{3–5文の本文たたき台。USPと業種に合わせたトーンで記述。}

📌 REQUIRED: [DATA: {specific fact needed, e.g. 創業年・実績数・資格名}]

---

### CTA セクション

**見出し:** 「{action-oriented heading}」
**本文:** 「{1–2文の背中押しコピー}」
**ボタン:** 「{label}」→ {path}
````

## 📌 REQUIRED Placeholder Types

Use these standardized placeholders so clients know exactly what to provide:

- `📌 REQUIRED: [PHOTO: description]` — image or video the client must provide
- `📌 REQUIRED: [DATA: description]` — specific fact or number
- `📌 REQUIRED: [LOGO: description]` — logo file
- `📌 REQUIRED: [REVIEW: client to verify this claim]` — draft claim that must be confirmed

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — completed normally
- `## Status: DONE_WITH_CONCERNS` — completed but with notes (add bullet list)
- `## Status: NEEDS_CONTEXT` — missing information to proceed (add what is needed)
- `## Status: BLOCKED` — cannot continue (add reason)
