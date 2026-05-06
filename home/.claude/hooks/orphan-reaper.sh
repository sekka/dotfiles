#!/usr/bin/env bash
# SessionStart orphan reaper.
# Catches orphans left by abnormal Claude Code exit (crash, kill -9, OS sleep,
# Wi-Fi disconnect) — paths that the SessionEnd hook does NOT cover.
# Runs at the start of each new Claude Code session.
#
# Sibling-session safety: only PPID=1 (orphan) processes are killed.

export ORPHAN_REAPER_SOURCE="SessionStart"
# shellcheck source=lib/orphan-patterns.sh
source "$HOME/.claude/hooks/lib/orphan-patterns.sh"

reap_all_known_orphans

exit 0
