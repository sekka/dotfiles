---
name: user-research-queue
description: Manage the two-stage deep research backlog queue. Add URLs to Inbox or Deep Research 待ち, list pending items across both tiers, run Quick Eval on the next Inbox entry, run Deep Research on the next Deep Research 待ち entry, or mark items as done. Triggered by commands like "add to research queue", "what's in my research queue", "quick eval next", "deep research next", or "mark research done".
disable-model-invocation: false
effort: low
---

<objective>
Manage `~/dotfiles/tasks/research-queue.md` — a two-stage backlog of URLs to evaluate and deep-research.
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
| `add-deep` | "add directly to deep research", "skip quick eval", "queue for deep research" |
| `list` | "what's in my research queue", "show queue", no arguments |
| `quick` | "quick eval next", "process inbox next", "evaluate next" |
| `deep` | "deep research next", "process deep queue", "research next item" |
| `done` | "mark research done", "queue done I2", "done D1 great takeaway" |
| Auto detection | URL + "later" / "queue" → `add` / no args → `list` |
</quick_start>

## Iron Law

1. Do not modify the queue file without reading its current contents first.
2. Do not mark an item done without confirming with the user when a takeaway is missing.

<workflow>

## Queue File

Path: `~/dotfiles/tasks/research-queue.md`

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

## Subcommand: `add <url> [focus-note...]`

1. Read `~/dotfiles/tasks/research-queue.md`
2. **Duplicate check**: scan both Inbox and Deep Research 待ち sections for the same URL. If found, warn and stop.
3. Fetch the page title via WebFetch (HEAD or GET, extract `<title>`). On failure, use the raw URL as the title.
4. Build entry: `- [ ] <today> — [<title>](<url>) — focus: <focus-note or TBD>`
5. Append the entry under `## Inbox — Quick Eval 待ち`
6. Report the added entry to the user

**Today's date format:** `YYYY-MM-DD` (use current date from system or conversation context)

---

## Subcommand: `add-deep <url> [focus-note...]`

Use when the URL has already been evaluated elsewhere and should go directly to Deep Research 待ち.

1. Read `~/dotfiles/tasks/research-queue.md`
2. **Duplicate check**: scan both Inbox and Deep Research 待ち sections for the same URL. If found, warn and stop.
3. Fetch the page title via WebFetch. On failure, use the raw URL as the title.
4. Build entry: `- [ ] <today> — [<title>](<url>) — focus: <focus-note or TBD>`
5. Append the entry under `## Deep Research 待ち`
6. Report the added entry to the user

---

## Subcommand: `list` (or no arguments)

1. Read `~/dotfiles/tasks/research-queue.md`
2. Extract all lines under `## Inbox — Quick Eval 待ち` and `## Deep Research 待ち`
3. Display with tier-prefixed 1-based index numbers:

```
Inbox (N items)
  I1. YYYY-MM-DD — Title — focus: ...
  I2. YYYY-MM-DD — Title — focus: ...

Deep Research 待ち (M items)
  D1. YYYY-MM-DD — Title — focus: ...
  D2. YYYY-MM-DD — Title — focus: ...
```

If both sections are empty, output: "Research Queue is empty. Use `add <url>` to add an item."
If only one section is empty, show the non-empty section normally and omit the empty one (or show "(empty)").

---

## Subcommand: `quick`

Runs Quick Eval on the first entry in Inbox.

1. Read `~/dotfiles/tasks/research-queue.md`
2. Take the **first** entry in `## Inbox — Quick Eval 待ち` (index I1)
3. If Inbox is empty, report and stop
4. Extract the URL and focus note from the entry
5. Launch `/user-research-eval-ref` via the Skill tool in **Quick Eval mode**, passing the URL and focus note as context
6. After Quick Eval completes, ask the user via AskUserQuestion with 3 choices:
   > "Quick Eval complete. What next?
   > - `promote` — move to Deep Research 待ち (you can update focus)
   > - `discard` — remove from queue (provide reason)
   > - `keep` — return to end of Inbox"
7. Handle the response:
   - **promote**: remove from Inbox, optionally update focus (ask if user provided new focus), append to `## Deep Research 待ち`. Done entry is NOT created yet.
   - **discard**: ask for one-line reason via AskUserQuestion if not provided. Remove from Inbox and append to `## Done` with `outcome: discarded — takeaway: <reason>`
   - **keep**: remove from first position in Inbox and re-append at the end of Inbox

---

## Subcommand: `deep`

Runs Deep Research on the first entry in Deep Research 待ち.

1. Read `~/dotfiles/tasks/research-queue.md`
2. Take the **first** entry in `## Deep Research 待ち` (index D1)
3. If Deep Research 待ち is empty, report and stop
4. Extract the URL and focus note from the entry
5. Launch `/user-research-eval-ref` via the Skill tool in **Deep Research mode**, passing the URL and focus note as context
6. After Deep Research completes, ask the user via AskUserQuestion:
   > "Deep Research complete. Provide a one-line takeaway (or press Enter to use 'TBD')."
7. Remove the entry from Deep Research 待ち and append to `## Done` with `outcome: deep — takeaway: <takeaway>`
8. Report the moved entry to the user

---

## Subcommand: `done <I|D><index> [takeaway...]`

Manual move of a specific entry to Done. Index format: `I1`, `I2`, ... for Inbox; `D1`, `D2`, ... for Deep Research 待ち.

1. Read `~/dotfiles/tasks/research-queue.md`
2. Parse the tier prefix (`I` or `D`) and numeric index
3. Locate the entry in the appropriate section. If index is out of range, report an error and list current queue
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
- When `deep` is run, user-research-queue delegates the actual Deep Research to user-research-eval-ref (Deep Research mode)

</workflow>

<success_criteria>
**add:** Entry appears in Inbox with correct format; duplicate URLs (checked in both Inbox and Deep Research 待ち) are rejected.

**add-deep:** Entry appears in Deep Research 待ち with correct format; duplicate URLs are rejected.

**list:** Inbox entries shown as I1, I2, ...; Deep Research 待ち entries shown as D1, D2, ...; counts shown per section.

**quick:** Quick Eval completes via user-research-eval-ref; user chooses promote/discard/keep; entry moves or stays accordingly.

**deep:** Deep Research completes via user-research-eval-ref; user provides takeaway; entry moves to Done with `outcome: deep`.

**done:** Entry moves from the specified tier (Inbox or Deep Research 待ち) to Done with correct date range, outcome, and takeaway; tier-prefixed index validation works.
</success_criteria>

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — subcommand completed successfully
- `## Status: DONE_WITH_CONCERNS` — completed but with caveats (e.g., title fetch failed, takeaway defaulted to TBD)
- `## Status: BLOCKED` — cannot read or write the queue file
- `## Status: NEEDS_CONTEXT` — subcommand or required argument cannot be determined from input
