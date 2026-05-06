#!/usr/bin/env bash
# Shared orphan-reap logic for SessionEnd hook and periodic launchd reaper.
# Kills only PPID=1 processes matching known leak patterns.
# Set ORPHAN_REAPER_SOURCE before sourcing to tag the log line.

LOG="${HOME}/.claude/logs/orphan-cleanup.log"

orphan_log() {
  printf '%s [%s] %s\n' "$(date -Iseconds)" "${ORPHAN_REAPER_SOURCE:-?}" "$*" \
    >>"$LOG" 2>/dev/null
}

# Kill all PPID=1 processes whose command line matches the given regex.
# Logs count and PIDs if any killed.
reap_orphans_matching() {
  local pattern="$1"
  local label="$2"
  local pids
  pids=$(ps -eo pid,ppid,command | awk -v re="$pattern" '$2==1 && $0 ~ re {print $1}')
  if [ -n "$pids" ]; then
    local count
    count=$(echo "$pids" | wc -l | tr -d ' ')
    orphan_log "killing $label orphans: $count process(es) [pids: $(echo "$pids" | tr '\n' ' ' | sed 's/ $//')]"
    echo "$pids" | xargs kill -TERM 2>/dev/null
  fi
}

# Pattern matrix. Add new entries here as new leak sources are observed.
reap_all_known_orphans() {
  reap_orphans_matching 'agent-browser-darwin' 'agent-browser-darwin'
  reap_orphans_matching 'agent-browser-chrome-' 'agent-browser-chrome'
  reap_orphans_matching 'chrome-devtools-mcp' 'chrome-devtools-mcp'
}
