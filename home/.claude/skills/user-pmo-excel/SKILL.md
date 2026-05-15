---
name: user-pmo-excel
description: >
  Sync ~/prj/{slug}/pmo.yaml with the project's WBS Excel (.xlsm) using a
  column-ownership model. YAML owns the plan (task structure, estimates),
  Excel owns the actuals (start/end dates, status, client comments). The Gantt
  chart area is left to VBA macros. Triggered by "Excel sync", "WBS 同期",
  "pmo excel", or whenever a user asks to push plan changes to Excel or pull
  actuals from Excel.
effort: low
context: fork
agent: general-purpose
---

# PMO Excel ⇄ YAML Sync

Run the Python sync CLI located at `~/dotfiles/scripts/pmo/sync.py`.

## Iron Law

1. Never edit Excel files directly — always go through `sync.py`
2. Never modify columns owned by Excel from the YAML side (and vice versa)
3. Close Excel before running sync (PermissionError otherwise)
4. The Gantt chart area (J column onward in WBS) is off-limits — VBA owns it

## Trigger

Use when the user wants to:

- Push WBS plan changes (task additions, estimate updates) to Excel
- Pull Excel actuals (start/end dates, status) into pmo.yaml
- Validate pmo.yaml schema and id uniqueness

## Arguments

- `project-slug`: project directory name under `~/prj/`. Ask if not provided.
- `mode`: one of `sync` (default), `pull`, `push`, `doctor`. Ask only if ambiguous.

## Process

1. If `project-slug` is missing, ask with AskUserQuestion
2. Verify `~/prj/{slug}/pmo.yaml` exists and has an `excel:` section. If not, tell the user to set it up first (point to the spec doc)
3. Run the appropriate sub-command:
   ```bash
   cd ~/dotfiles/scripts/pmo
   uv run python sync.py <mode> wbs --project <slug>
   ```
   For `doctor`, omit the `wbs` argument.
4. Relay the output. If exit code is non-zero, explain the cause (Excel still open, schema error, etc.)
5. If `sync` produced new rows on either side, summarize what changed

## Notes

- The sync CLI is designed for the WBS sheet only. Issues / master sync is a future extension.
- For the first sync on a new project, run `sync.py doctor` first to validate the YAML structure.

## Status: DONE
