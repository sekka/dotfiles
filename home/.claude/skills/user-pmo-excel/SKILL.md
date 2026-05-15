---
name: user-pmo-excel
description: >
  Use when the user asks to sync ~/prj/{slug}/pmo.yaml with the project's WBS
  Excel (.xlsm), push plan changes to Excel, or pull actuals from Excel.
  Performs snapshot-based one-way sync; direction is always explicit: `pull`
  (Excel → YAML) or `push` (YAML → Excel). Triggers: "Excel sync", "WBS 同期",
  "pmo excel", "pmo pull", "pmo push".
effort: low
context: fork
agent: general-purpose
---

# PMO Excel ⇄ YAML Sync

Run the Python sync CLI at `~/dotfiles/scripts/pmo/sync.py`. The sync is
snapshot-based one-way: each run writes `.pmo/last-sync.json` capturing both
YAML and Excel state, and the next run aborts (exit 2) if the destination side
has uncommitted changes since that snapshot.

## Iron Law

1. Never edit Excel files directly — always go through `sync.py` (Why: VBA
   macros depend on the column structure, and direct edits trip the snapshot
   guard)
2. Close Excel before running sync (PermissionError otherwise, exit 3)
3. The Gantt chart area (date columns after the last declared `excel.columns`
   entry) is off-limits — VBA owns it
4. Columns marked `readonly: true` in `pmo.yaml` (e.g. WORKDAY formulas) are
   skipped by sync — never strip the flag without confirming

## Trigger

Use when the user wants to:

- **pull**: Bring Excel-side updates (actual dates, status, comments) into `pmo.yaml`
- **push**: Send YAML-side updates (new tasks, edited estimates) to Excel
- **doctor**: Validate `pmo.yaml` schema and id uniqueness
- **migrate-ids**: Auto-number empty id column in a fresh Excel template

## Arguments

- `project-slug`: project directory name under `~/prj/`. Ask if not provided.
- `direction`: `pull` or `push`. Required and explicit — there is no default.
  Ask if ambiguous; never guess.
- `--force` (optional): bypass the snapshot guard. Only suggest this after the
  user has reviewed the guard's diff output.

## Process

1. If `project-slug` is missing, ask with AskUserQuestion.
2. Verify `~/prj/{slug}/pmo.yaml` exists and has an `excel:` section. If not,
   point to `scripts/pmo/README.md` and stop.
3. Run the appropriate sub-command from the dotfiles directory:
   ```bash
   cd ~/dotfiles/scripts/pmo
   uv run python sync.py pull wbs --project <slug>          # Excel → YAML
   uv run python sync.py push wbs --project <slug>          # YAML → Excel
   uv run python sync.py doctor --project <slug>            # validate only
   uv run python sync.py migrate-ids wbs --project <slug>   # number empty ids
   ```
4. Relay the output. Map exit codes to user-facing causes:
   - **0**: success
   - **2**: snapshot guard tripped — destination has uncommitted changes.
     Show the guard's diff to the user and surface the 3 options the CLI
     printed (run the opposite direction first / `--force` / manual resolve).
     Do NOT add `--force` on the user's behalf.
   - **3**: Excel is open in another process (PermissionError) — ask the user
     to close it
   - **4**: backup failed (push only) — disk full or permission issue
5. After a successful `pull` / `push`, summarize what changed: cell updates,
   appended rows, and any "kept in other side" warnings.

## Notes

- The sync CLI targets the WBS sheet only. Issues / master sync is a future
  extension.
- For a brand-new project, run `sync.py doctor` first to confirm the YAML
  schema, then `migrate-ids` if the Excel `id` column is empty.
- Excel backups are written to `.pmo/backups/` on push only (last 10 kept).
  Pull does not back up.
- The snapshot file (`.pmo/last-sync.json`) holds both `yaml` and `excel`
  side states; this prevents cross-mode false positives (e.g. a push-then-pull
  sequence on the same data).

## Status: DONE
