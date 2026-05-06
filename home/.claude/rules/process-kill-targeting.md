# Process Kill Targeting

When killing processes, target only the intended process. Never use a kill pattern that would catch unrelated processes the user is actively using.

## Forbidden patterns

- `pkill -f "Google Chrome"` — kills the user's entire browser
- `pkill -f "node"` — kills any node process (other dev servers, editors, MCP servers)
- `pkill -f "python"` — same risk
- Any wide-pattern `pkill` / `killall` against a name shared by user-facing applications

## Safe patterns

- `pkill -f "chrome-devtools-mcp"` — matches only the MCP wrapper, not the browser
- `kill <PID>` after looking up the specific PID via `ps` / `pgrep`
- `pgrep -f "<specific-pattern>"` first, then visually confirm before killing
- For dev servers started via `run_in_background`, use the task ID + KillShell, not pkill

## Process

1. Before killing, identify the exact process: `ps aux | grep <pattern>` and read the full command line
2. Confirm the match is unique to your target (one PID, or a clearly bounded set)
3. If the match is wider than intended, narrow the pattern — do not proceed with the wide one
4. Prefer `kill <PID>` over `pkill -f` whenever a single PID is enough

## Why

2026-04-05 hieizan incident — `pkill -f "Google Chrome.*chrome-devtools-mcp"` was used to stop the MCP server. The pattern matched and killed the user's main browser process as well, terminating their active work in unrelated tabs. The user lost in-progress state and was angered.

The lesson: regex-style pkill against a name shared with a user-visible application is hostile by default. The safe baseline is to target only the wrapper script's name, never the parent application's name.

## Anti-pattern

"It's faster to pkill broadly and see what dies." No. The user's environment is not your sandbox.
