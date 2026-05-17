---
name: user-pmo-excel
description: >
  Use when the user asks to regenerate ~/prj/{slug}/WBS.yaml from the project's
  WBS Excel (.xlsx), pull Excel-side updates into YAML for AI-readable analysis,
  or bootstrap a new WBS.yaml. One-way only — Excel is the source of truth, YAML
  is rewritten each pull. Triggers: "Excel pull", "WBS 同期", "pmo excel",
  "pmo pull", "WBS.yaml 更新".
effort: low
context: fork
agent: general-purpose
---

# PMO Excel → YAML Pull

Run the Python CLI at `~/dotfiles/scripts/pmo/sync.py`. Each `pull` reads the
WBS sheet and rewrites the `tasks` section of `WBS.yaml` atomically. The
`project` and `excel` header blocks are preserved.

## Iron Law

1. Never write to Excel from this tool — pull is the only direction. The user
   edits Excel directly; this tool ingests the result.
2. Close Excel before running pull (otherwise PermissionError, exit 3).
3. The Gantt chart area (date columns past the canonical schema) is not read.
4. Edits applied to `WBS.yaml` by hand are not persisted — the next pull
   overwrites the `tasks` block. To make a change durable, edit Excel.

## Trigger

Use when the user wants to:

- **init**: Create a new `WBS.yaml` skeleton for a new project
- **pull**: Regenerate `WBS.yaml` tasks from the Excel WBS sheet
- **doctor**: Validate `WBS.yaml` (id uniqueness, missing ids)

## Arguments

- `project-slug`: project directory name under `~/prj/`. Ask if not provided.

## Process

1. If `project-slug` is missing, ask with AskUserQuestion.
2. Verify `~/prj/{slug}/WBS.yaml` exists. If not, offer `init` to create a
   minimal skeleton.
3. Run the appropriate sub-command from the dotfiles directory:

   ```bash
   cd ~/dotfiles/scripts/pmo
   uv run python sync.py init --project <slug>                   # create WBS.yaml skeleton
   uv run python sync.py init --project <slug> --file WBS.xlsx --force  # overwrite
   uv run python sync.py pull --project <slug>                   # Excel → WBS.yaml (regenerate)
   uv run python sync.py doctor --project <slug>                 # validate only
   ```

   For `init`: creates `~/prj/<slug>/WBS.yaml` with minimal skeleton. `--file`
   sets the Excel filename (default `WBS.xlsx`). Fails if WBS.yaml already
   exists unless `--force` is passed. The WBS column layout is baked into
   `lib/schema.py` — no need to specify columns in WBS.yaml.
4. Relay the output. Map exit codes:
   - **0**: success
   - **1**: doctor found issues, or init refused to overwrite existing WBS.yaml
   - **2**: WBS.yaml or Excel file missing
   - **3**: Excel is open in another process — ask the user to close it
5. After a successful `pull`, report the task count and any unexpected
   reductions (e.g. tasks the user expected to see that aren't present means
   their id cell is blank or they're past the first empty row in Excel).

## Notes

- The CLI targets the WBS sheet only. Issues / master sync is a future
  extension.
- This is a destructive operation on the `tasks` block of `WBS.yaml`: it is
  fully regenerated each run. User edits to YAML tasks are lost on the next
  pull — that is the intended one-way design.
- Atomic write protects the existing WBS.yaml if `ruamel.yaml.dump` raises
  mid-write (e.g. an unserializable value); the destination is preserved.
- `read_rows` stops at the first empty id cell in column A. If tasks appear
  missing after pull, check whether a blank id row interrupted the range.

## Status: DONE
