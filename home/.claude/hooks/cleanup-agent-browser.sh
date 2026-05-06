#!/usr/bin/env bash
# Cleanup at SessionEnd: graceful agent-browser close + reap known orphans.
# Workaround for vercel-labs/agent-browser#1263 (v0.26.0 macOS orphan).
# Daemon's idle timeout does not cover daemon abnormal death (Wi-Fi blip, etc.).
#
# Sibling-session safety: only PPID=1 (orphan) processes are killed.
# Live processes belonging to other Claude Code sessions are never touched.

export ORPHAN_REAPER_SOURCE="SessionEnd"
# shellcheck source=lib/orphan-patterns.sh
source "$HOME/.claude/hooks/lib/orphan-patterns.sh"

# 1. Graceful close via official CLI (specific to agent-browser).
agent-browser close 2>/dev/null

# 2. Reap all known orphan patterns (PPID=1 only).
reap_all_known_orphans

exit 0
