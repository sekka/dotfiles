#!/bin/bash
# SessionStart hook: AI可用性を検出し、ルーティング指示をコンテキストに注入する
# Claude Codeがセッション開始時に「どのAIが使えるか」を常に意識するための仕組み
set -euo pipefail

models="${AI_AVAILABLE_MODELS:-claude}"

# AI名→ルーティング指示のマッピング（bash 3.2互換: indirect expansion）
# shellcheck disable=SC2034
rule_CODEX="IMPLEMENTATION: Use codex-implementer (NOT implementer)"
# shellcheck disable=SC2034
rule_GEMINI="RESEARCH: Use gemini-researcher (NOT researcher)"
# shellcheck disable=SC2034
rule_COPILOT="REVIEW (CI/CD): Use copilot-reviewer"
# shellcheck disable=SC2034
rule_CODERABBIT="REVIEW (Security): Use coderabbit:code-reviewer"

external_count=0
routing_rules=""
for ai in CODEX GEMINI COPILOT CODERABBIT; do
  var="AI_HAS_${ai}"
  rule="rule_${ai}"
  if [[ "${!var:-0}" == "1" ]]; then
    routing_rules="${routing_rules}${routing_rules:+ }${!rule}."
    external_count=$((external_count + 1))
  fi
done

if (( external_count > 0 )); then
  context="[ROUTING MANDATE] ${external_count} external AI(s) available (${models}). MUST delegate per CLAUDE.md section 4: ${routing_rules} Do NOT use Read/Grep/Glob/Write/Edit directly."
else
  context="[ROUTING INFO] No external AIs available. Use Claude built-in subagents (researcher/implementer/reviewer) to save main context."
fi

# Pure bash JSON escaping（subprocess不要）
context="${context//\\/\\\\}"
context="${context//\"/\\\"}"
context="${context//$'\n'/\\n}"
context="${context//$'\t'/\\t}"
printf '{"additionalContext": "%s"}\n' "$context"
