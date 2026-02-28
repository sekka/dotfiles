#!/bin/bash
# SessionStart hook: AI可用性を検出し、ルーティング指示をコンテキストに注入する
# Claude Codeがセッション開始時に「どのAIが使えるか」を常に意識するための仕組み

models="${AI_AVAILABLE_MODELS:-claude}"

# AI名→ルーティング指示のマッピング（単一ループで構築）
declare -A ai_rules=(
  [CODEX]="IMPLEMENTATION: Use codex-implementer (NOT implementer)"
  [GEMINI]="RESEARCH: Use gemini-researcher (NOT researcher)"
  [COPILOT]="REVIEW (CI/CD): Use copilot-reviewer"
  [CODERABBIT]="REVIEW (Security): Use coderabbit-reviewer"
)

external_count=0
routing_rules=""
for ai in CODEX GEMINI COPILOT CODERABBIT; do
  var="AI_HAS_${ai}"
  if [[ "${!var:-0}" == "1" ]]; then
    routing_rules="${routing_rules} ${ai_rules[$ai]}."
    ((external_count++))
  fi
done

if (( external_count > 0 )); then
  context="[ROUTING MANDATE] ${external_count} external AI(s) available (${models}). MUST delegate per CLAUDE.md section 4:${routing_rules} Do NOT use Read/Grep/Glob/Write/Edit directly."
else
  context="[ROUTING INFO] No external AIs available. Use Claude built-in subagents (researcher/implementer/reviewer) to save main context."
fi

# Pure bash JSON escaping（subprocess不要）
context="${context//\\/\\\\}"
context="${context//\"/\\\"}"
printf '{"additionalContext": "%s"}\n' "$context"
