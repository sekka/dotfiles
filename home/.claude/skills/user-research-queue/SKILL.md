---
name: user-research-queue
description: Manage the two-stage deep research backlog queue. Add URLs to Inbox or Deep Research 待ち via `add` or `add-deep`, list pending items across both tiers, run Quick Eval on the next Inbox entry, run Deep Research on the next Deep Research 待ち entry, or mark items as done. Triggered by commands like "add to research queue", "what's in my research queue", "quick eval next", "deep research next", or "mark research done".
disable-model-invocation: false
effort: low
---

<objective>
Manage `~/dotfiles/queue/research.md` — a two-stage backlog of URLs to evaluate and deep-research.
Six subcommands: `add`, `add-deep`, `list`, `quick`, `deep`, `done`.
Parse `$ARGUMENTS` to determine which subcommand to run.
</objective>

<quick_start>
**Add to Inbox:** `/user-research-queue add <url> [focus note]`
**Skip to Deep Research 待ち:** `/user-research-queue add-deep <url> [focus note]`
**List both tiers:** `/user-research-queue list` (or just `/user-research-queue`)
**Quick Eval next Inbox entry:** `/user-research-queue quick`
**Deep Research next entry:** `/user-research-queue deep`
**Mark done manually:** `/user-research-queue done <I|D><index> [takeaway]`

**Trigger phrases:**

| Subcommand | Trigger examples |
|------------|-----------------|
| `add` | "add to research queue", "queue this for later", "I'll research this later" |
| `add-deep` | "add directly to deep research", "skip quick eval", "queue for deep research", "add-deep" |
| `list` | "what's in my research queue", "show queue", no arguments |
| `quick` | "quick eval next", "process inbox next", "evaluate next" |
| `deep` | "deep research next", "process deep queue", "research next item" |
| `done` | "mark research done", "queue done I2", "done D1 great takeaway" |
| Auto detection | URL + "later" / "queue" → `add` / no args → `list` |
</quick_start>

## Iron Law

1. Do not modify the queue file without reading its current contents first.
2. Do not mark an item done without confirming with the user when a takeaway is missing.
3. Sub-skill completion is NOT subcommand completion. After delegating to `user-research-eval-ref` in `quick` or `deep`, the workflow continues — you MUST issue the post-delegation `AskUserQuestion` before emitting `Status: DONE`. A child skill's `Status: DONE` line is a hand-off marker, never a terminal signal for this skill.

<workflow>

## Queue File

Path: `~/dotfiles/queue/research.md`

**Sections (in order):**
1. `## Inbox — Quick Eval 待ち`
2. `## Deep Research 待ち`
3. `## Done`

**Pending entry format (used in both Inbox and Deep Research 待ち):**
```
- [ ] YYYY-MM-DD — [title](url) — focus: <note>
```

**Done entry format:**
```
- [x] <added-date> → <today> — [title](url) — outcome: <quick|deep|discarded> — takeaway: <note>
```

---

## Title Fetching (shared by `add` and `add-deep`)

Goal: produce a short, accurate title for the entry. Do NOT do a full evaluation here — that is what `quick` / `deep` are for. Delegate to other skills when the URL is on a host that needs special handling.

```
1. Host is x.com or twitter.com AND path matches /<user>/status/<id>
   → Delegate to user-research-x-posts via the Skill tool, **once**.
     - On success: use the first ~80 chars of the extracted post text as the title
       (prefix with author handle when available: "@handle: <post excerpt>").
     - On any failure (auth wall, "article not found", tool error, timeout):
       fall back IMMEDIATELY to "URL fallback rendering" below.
       Do NOT manually re-attempt agent-browser / playwright-cli / MCP from here —
       user-research-x-posts already runs that fallback chain internally.
2. Host is github.com AND path matches /<owner>/<repo> (repo root)
   → Use `gh repo view <owner>/<repo> --json name,description` and form
     "<owner>/<repo> — <description>" as the title. Truncate <description>
     to ~80 chars; append "…" if truncated. No WebFetch needed.
3. Otherwise
   → WebFetch the URL and extract <title>. On 403/429/empty:
       a. Try agent-browser CLI with `-i -c` to get the page title only
       b. If still failing, fall back to "URL fallback rendering" below
```

**URL fallback rendering:** When no title can be extracted and the URL itself is the
only available label, do NOT render as `[<url>](<url>)` (visually redundant). Use the
plain URL form for the entry:

```
- [ ] YYYY-MM-DD — <url> — focus: <focus-note>
```

This is the **only** case where the entry omits the `[title](url)` markdown link.
Emit `## Status: DONE_WITH_CONCERNS` noting "title fetch failed; URL used as label".

**Title length cap (~80 chars):** Applies to the **extracted value from each source**
(x.com post text, github `<description>`, generic `<title>`), NOT to the composed entry
title. Truncate at the last word boundary ≤ 80 chars; if no word boundary exists within
that range, hard-cut at 80. Append "…" if truncated.

Example for github: if `<description>` is 200 chars, truncate it to ~80 chars + "…",
then compose `<owner>/<repo> — <truncated-description>…`. The composed title may
exceed 80 chars (because `<owner>/<repo>` is added on top); that is expected.

**Constraints:**
- Keep title fetching lightweight: do NOT trigger full Quick/Deep evaluation in user-research-eval-ref from `add` / `add-deep`. Only call user-research-x-posts (for x.com) or `gh` (for github.com repo roots).
- Each delegated skill is invoked at most **once** for title fetching; do not re-escalate the child skill's internal fallback chain from this skill.

---

## Subcommand: `add <url> [focus-note...]`

1. Read `~/dotfiles/queue/research.md`
2. **Duplicate check**: scan both Inbox and Deep Research 待ち sections for the same URL. If found, warn and stop.
3. Fetch the page title using the **Title Fetching** flow above (x.com → user-research-x-posts, github.com repo → `gh`, otherwise WebFetch).
4. Build entry: `- [ ] <today> — [<title>](<url>) — focus: <focus-note or TBD>`
5. Append the entry under `## Inbox — Quick Eval 待ち`
6. Report the added entry to the user

**Today's date format:** `YYYY-MM-DD` (use current date from system or conversation context)

---

## Subcommand: `add-deep <url> [focus-note...]`

Use when the URL has already been evaluated elsewhere and should go directly to Deep Research 待ち.

1. Read `~/dotfiles/queue/research.md`
2. **Duplicate check**: scan both Inbox and Deep Research 待ち sections for the same URL. If found, warn and stop.
3. Fetch the page title using the **Title Fetching** flow above (x.com → user-research-x-posts, github.com repo → `gh`, otherwise WebFetch).
4. Build entry: `- [ ] <today> — [<title>](<url>) — focus: <focus-note or TBD>`
5. Append the entry under `## Deep Research 待ち`
6. Report the added entry to the user

---

## Subcommand: `list` (or no arguments)

1. Read `~/dotfiles/queue/research.md`
2. Extract all lines under `## Inbox — Quick Eval 待ち` and `## Deep Research 待ち`
3. Display with tier-prefixed 1-based index numbers. For each entry, show four fields explicitly: **url**, **author**, **time**, **text** (one field per line, indented under the index line). Always render the raw URL so the target is unambiguous.

   Field extraction rules:
   - **url**: the raw URL from the entry's markdown link (or the plain URL when the entry uses URL fallback rendering)
   - **author**: for x.com / twitter.com URLs, the `@handle` from the title or URL path; for `github.com/<owner>/<repo>`, use `<owner>`; otherwise the URL host (e.g., `zenn.dev`)
   - **time**: the entry's `YYYY-MM-DD` added date
   - **text**: the title portion of the entry (post excerpt for X, `<owner>/<repo> — <description>` for GitHub, page title otherwise); fall back to the focus note when no title exists. Truncate to ~80 chars with "…" if longer.

```
Inbox (N items)
  I1.
    url:    <url>
    author: <author>
    time:   YYYY-MM-DD
    text:   <title or post excerpt> — focus: ...
  I2.
    url:    ...
    ...

Deep Research 待ち (M items)
  D1.
    url:    <url>
    author: <author>
    time:   YYYY-MM-DD
    text:   <title> — focus: ...
```

If both sections are empty, output: "Research Queue is empty. Use `add <url>` to add an item."
If only one section is empty, show the non-empty section normally and omit the empty one (or show "(empty)").

---

## Subcommand: `quick`

Runs Quick Eval on the first entry in Inbox.

1. Read `~/dotfiles/queue/research.md`
2. Take the **first** entry in `## Inbox — Quick Eval 待ち` (index I1)
3. If Inbox is empty, report and stop
4. Extract the URL and focus note from the entry
5. Launch `/user-research-eval-ref` via the Skill tool in **Quick Eval mode**, passing the URL and focus note as context
6. **MANDATORY — do not skip after sub-skill returns.** Per Iron Law #3, the child's `Status: DONE` is not your terminal signal. Even if the sub-skill ended with `## Status: DONE` and its recommended action is unambiguous (e.g., "discard 寄り"), you MUST still issue the AskUserQuestion below. NEVER end the turn with only the eval card and expect the user to type the next action — selection is the queue skill's job. Use `AskUserQuestion` (NOT a free-text prompt) so the user picks from buttons:

   ```
   question: "Quick Eval 完了 (I<n>: <title>)。次のアクションは？"
   header: "Next action"
   options:
     - label: "discard"
       description: "Inbox から削除し Done に移動 (outcome: discarded)。理由を次で聞きます"
     - label: "promote"
       description: "Deep Research 待ちへ昇格。深掘り評価対象として残す"
     - label: "keep"
       description: "Inbox の末尾に戻して保留"
   ```

   The labels MUST be exactly `discard` / `promote` / `keep` so step 7 can dispatch mechanically.

7. Handle the response:
   - **promote**: remove from Inbox, optionally update focus (ask if user provided new focus), append to `## Deep Research 待ち`. Done entry is NOT created yet.
   - **discard**: ask for a one-line reason via AskUserQuestion (button options, NOT free text). Generate 2-4 reason options grounded in the eval card content — typical buckets: 既存資産と重複 / ターゲット不一致 / メンテ不活発 / 一次情報なし / その他. Then remove from Inbox and append to `## Done` with `outcome: discarded — takeaway: <reason>`.
   - **keep**: remove from first position in Inbox and re-append at the end of Inbox

   **Anti-pattern (do NOT do this):** "Recommended action: discard 寄り" を出して終わる、ユーザーに `/user-research-queue done I1 ...` を手打ちさせる、Status: DONE のみで返す。これらはすべて Iron Law #3 違反。

---

## Subcommand: `deep`

Runs Deep Research on the first entry in Deep Research 待ち.

1. Read `~/dotfiles/queue/research.md`
2. Take the **first** entry in `## Deep Research 待ち` (index D1)
3. If Deep Research 待ち is empty, report and stop
4. Extract the URL and focus note from the entry
5. Launch `/user-research-eval-ref` via the Skill tool in **Deep Research mode**, passing the URL and focus note as context
6. **MANDATORY — do not skip after sub-skill returns.** Per Iron Law #3, the child's `Status: DONE` is not your terminal signal. Even when the sub-skill output already contains a clear "Recommendation: Adopt / Do not adopt", you MUST still issue the AskUserQuestion below. Use `AskUserQuestion` with 2-4 takeaway options grounded in the Deep Research output (NOT a free-text prompt):

   ```
   question: "Deep Research 完了 (D<n>: <title>)。Done に残す takeaway を選んでください"
   header: "Takeaway"
   options:
     - label: "<採用判断 + 一行根拠>"   # eval-ref の Recommendation: Adopt から生成
       description: "..."
     - label: "<不採用判断 + 一行根拠>" # Recommendation: Do not adopt から生成
       description: "..."
     - label: "TBD (後で書く)"
       description: "今は確定できない。Done エントリの takeaway は TBD で記録"
   ```

   Anti-pattern: ユーザーに takeaway 文を手打ちさせる、Status: DONE のみで終わる、sub-skill の出力をそのまま貼って終わる。
7. Remove the entry from Deep Research 待ち and append to `## Done` with `outcome: deep — takeaway: <takeaway>`
8. Report the moved entry to the user

---

## Subcommand: `done <I|D><index> [takeaway...]`

Manual move of a specific entry to Done. Index format: `I1`, `I2`, ... for Inbox; `D1`, `D2`, ... for Deep Research 待ち.

1. Read `~/dotfiles/queue/research.md`
2. Parse the tier prefix (`I` or `D`) and numeric index
3. Locate the entry in the appropriate section. If index is out of range, report an error with the invalid index, list current queue showing BOTH tiers (Inbox and Deep Research 待ち) in the same format as the `list` subcommand, and emit `## Status: BLOCKED`
4. If `takeaway` is omitted, ask via AskUserQuestion: "One-line takeaway for this entry?"
5. Determine `outcome`:
   - Inbox (`I`) origin → `outcome: quick`
   - Deep Research 待ち (`D`) origin → `outcome: deep`
6. Build Done entry: `- [x] <added-date> → <today> — [title](url) — outcome: <outcome> — takeaway: <takeaway>`
   - `<added-date>` is taken from the existing entry's date field
7. Remove the entry from its section
8. Append the Done entry under `## Done`
9. Report the moved entry to the user

---

## Skill Boundaries

**user-research-queue vs user-research-eval-ref:**
- user-research-queue: Queue management — add, list, track, and move entries across Inbox / Deep Research 待ち / Done
- user-research-eval-ref: Single-URL evaluation — Quick Eval, Deep Research, or OSS Wiki for one URL now
- When `quick` is run, user-research-queue delegates the actual Quick Eval to user-research-eval-ref (Quick Eval mode)
- When `deep` is run, user-research-queue delegates the actual Deep Research to user-research-eval-ref (Deep Research mode). Primary-source verification happens inside user-research-eval-ref Mode 2.

**user-research-queue vs user-research-x-posts:**
- user-research-queue: Queue management
- user-research-x-posts: Content extractor for x.com / twitter.com individual post URLs
- During `add` / `add-deep`, user-research-queue calls user-research-x-posts to fetch the title for X post URLs (WebFetch is blocked on x.com).
- During `quick` / `deep`, the delegated user-research-eval-ref also routes x.com URLs through user-research-x-posts internally; user-research-queue does not need to re-invoke it.

</workflow>

<success_criteria>
**add:** Entry appears in Inbox with correct format; duplicate URLs (checked in both Inbox and Deep Research 待ち) are rejected.

**add-deep:** Entry appears in Deep Research 待ち with correct format; duplicate URLs are rejected.

**list:** Inbox entries shown as I1, I2, ...; Deep Research 待ち entries shown as D1, D2, ...; counts shown per section; each entry displays four fields (url / author / time / text) with the raw URL visible.

**quick:** Quick Eval completes via user-research-eval-ref; user chooses promote/discard/keep; entry moves or stays accordingly.

**deep:** Deep Research completes via user-research-eval-ref; user provides takeaway; entry moves to Done with `outcome: deep`.

**done:** Entry moves from the specified tier (Inbox or Deep Research 待ち) to Done with correct date range, outcome, and takeaway; tier-prefixed index validation works.
</success_criteria>

## Pre-output Self-Check (quick / deep only)

Before writing the `## Status:` line at the end of a `quick` or `deep` turn, run this 1-step check:

- [ ] Did this turn actually call the `AskUserQuestion` tool **in the same turn**, after the `user-research-eval-ref` Skill returned?

If **NO** → STOP. Do **NOT** emit `## Status: DONE`, do **NOT** emit any closing summary, do **NOT** end the turn. Call `AskUserQuestion` first (Step 6 of `quick` / Step 6 of `deep`). The sub-skill's `## Status: DONE` line is a hand-off marker, NEVER your terminal signal — see Iron Law #3.

If **YES** → proceed to the Status section below.

**Why this check exists:** The most common failure mode is "sub-skill returned a clean answer (e.g., 'Out of scope / Recommended action: discard'), so the parent skill silently emitted `## Status: DONE` and ended the turn, forcing the user to type the next subcommand manually." That is an Iron Law #3 violation regardless of how unambiguous the recommendation looked. The clarity of the sub-skill's recommendation is irrelevant — selection-button presentation is the queue skill's contractual job, not the user's typing job.

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — subcommand completed successfully (including `quick` / `deep` after the Skill tool delegation returns and an AskUserQuestion is issued; the turn ends at the AskUserQuestion call and `## Status: DONE` is emitted for that turn — the post-answer move is the next turn's work)
- `## Status: DONE_WITH_CONCERNS` — completed but with caveats (e.g., title fetch failed → URL fallback rendering used, takeaway defaulted to TBD)
- `## Status: BLOCKED` — cannot read or write the queue file
- `## Status: NEEDS_CONTEXT` — subcommand or required argument cannot be determined from input
