#!/bin/bash
# SessionStart hook: AI可用性を検出し、ルーティング指示をコンテキストに注入する
# Claude Codeがセッション開始時に「どのAIが使えるか」を常に意識するための仕組み

# 環境変数から利用可能AIを取得（zsh 67_ai_availability.zsh で設定済み）
codex="${AI_HAS_CODEX:-0}"
gemini="${AI_HAS_GEMINI:-0}"
copilot="${AI_HAS_COPILOT:-0}"
coderabbit="${AI_HAS_CODERABBIT:-0}"
models="${AI_AVAILABLE_MODELS:-claude}"

# ルーティング指示を構築
routing_rules=""

if [[ "$codex" == "1" ]]; then
  routing_rules="${routing_rules}  - IMPLEMENTATION: Use codex-implementer (NOT implementer)\n"
fi

if [[ "$gemini" == "1" ]]; then
  routing_rules="${routing_rules}  - RESEARCH: Use gemini-researcher (NOT researcher)\n"
fi

if [[ "$copilot" == "1" ]]; then
  routing_rules="${routing_rules}  - REVIEW (CI/CD): Use copilot-reviewer\n"
fi

if [[ "$coderabbit" == "1" ]]; then
  routing_rules="${routing_rules}  - REVIEW (Security): Use coderabbit-reviewer\n"
fi

# 外部AIが1つでも利用可能な場合のみ、強い委譲メッセージを出す
external_count=0
for v in "$codex" "$gemini" "$copilot" "$coderabbit"; do
  [[ "$v" == "1" ]] && ((external_count++))
done

if (( external_count > 0 )); then
  context="[ROUTING MANDATE] ${external_count} external AI(s) available (${models}). MUST delegate tasks per CLAUDE.md section 4:\n${routing_rules}  - Do NOT use Read/Grep/Glob/Write/Edit directly. Delegate to subagents.\n  - Check CLAUDE.md section 4 anti-patterns before every tool call."
else
  context="[ROUTING INFO] No external AIs available. Use Claude built-in subagents (researcher/implementer/reviewer) to save main context."
fi

# additionalContext として出力（Claude Code SessionStart hookの規約）
# shellcheck disable=SC2016
printf '{"additionalContext": "%s"}' "$(echo -e "$context" | sed 's/"/\\"/g' | tr '\n' ' ')"
