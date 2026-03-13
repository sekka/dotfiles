#!/usr/bin/env bash
# check-ai-auth.sh — AI認証確認ヘルパー
#
# Usage: check-ai-auth.sh <codex|gemini>
# Exit:  0 = 認証OK, 1 = 認証失敗（stderrにエラーメッセージ）

set -euo pipefail

_ai="${1:-}"

if [[ -z $_ai ]]; then
  echo "Usage: check-ai-auth.sh <codex|gemini>" >&2
  exit 1
fi

# macOS専用: gtimeout でCLI応答性を確認
_timeout_cmd=$(command -v gtimeout || echo "")

_check_timeout() {
  local cmd="$1"
  if [[ -n $_timeout_cmd ]]; then
    "$_timeout_cmd" 2 "$cmd" --version >/dev/null 2>&1
  else
    "$cmd" --version >/dev/null 2>&1
  fi
}

case "$_ai" in
codex)
  if [[ ${AI_HAS_CODEX:-} == "1" ]]; then exit 0; fi
  if ! command -v codex >/dev/null 2>&1; then
    echo "ERROR: Codex CLI not installed" >&2
    echo "  Install: npm install -g @openai/codex" >&2
    exit 1
  fi
  if ! [[ -f ~/.codex/auth.json ]]; then
    echo "ERROR: Codex not authenticated" >&2
    echo "  Run: codex login" >&2
    exit 1
  fi
  if ! _check_timeout codex; then
    echo "WARNING: Codex CLI not responding" >&2
    exit 1
  fi
  ;;
gemini)
  if [[ ${AI_HAS_GEMINI:-} == "1" ]]; then exit 0; fi
  if [[ -z ${GEMINI_API_KEY:-} ]] &&
    ! ([[ -f ~/.gemini/.env ]] && grep -qF 'GEMINI_API_KEY=' ~/.gemini/.env 2>/dev/null); then
    echo "ERROR: Gemini not authenticated" >&2
    echo "  Set GEMINI_API_KEY environment variable or create ~/.gemini/.env" >&2
    exit 1
  fi
  ;;
*)
  echo "ERROR: Unknown AI: $_ai" >&2
  echo "Usage: check-ai-auth.sh <codex|gemini>" >&2
  exit 1
  ;;
esac
