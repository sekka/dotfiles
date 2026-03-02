#!/bin/bash
# SessionStart hook: 利用可能な外部AIをコンテキストに注入する
set -euo pipefail

available=""
for ai in CODEX GEMINI COPILOT CODERABBIT; do
  var="AI_HAS_${ai}"
  if [[ "${!var:-0}" == "1" ]]; then
    name="$(echo "$ai" | tr '[:upper:]' '[:lower:]')"
    available="${available:+$available, }${name}"
  fi
done

if [[ -n "$available" ]]; then
  context="[AI AVAILABLE] External AIs: ${available}. Route per CLAUDE.md routing rules."
else
  context="[AI AVAILABLE] No external AIs. Use built-in subagents to save main context."
fi

printf '{"additionalContext": "%s"}\n' "$context"
