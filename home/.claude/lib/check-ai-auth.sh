#!/usr/bin/env bash
# check-ai-auth.sh — AI認証確認ヘルパー
#
# Usage: check-ai-auth.sh <codex|gemini|copilot|coderabbit>
# Exit:  0 = 認証OK, 1 = 認証失敗（stderrにエラーメッセージ）

set -euo pipefail

_ai="${1:-}"

if [[ -z $_ai ]]; then
  echo "Usage: check-ai-auth.sh <codex|gemini|copilot|coderabbit>" >&2
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
copilot)
  if [[ ${AI_HAS_COPILOT:-} == "1" ]]; then exit 0; fi
  if ! command -v gh >/dev/null 2>&1; then
    echo "ERROR: GitHub CLI not installed" >&2
    echo "  Install: brew install gh" >&2
    exit 1
  fi
  if ! command -v copilot >/dev/null 2>&1; then
    echo "ERROR: Copilot CLI not installed" >&2
    echo "  Install: gh extension install github/gh-copilot" >&2
    exit 1
  fi
  if ! gh auth status >/dev/null 2>&1; then
    echo "ERROR: GitHub not authenticated" >&2
    echo "  Run: gh auth login" >&2
    exit 1
  fi
  if ! _check_timeout copilot; then
    echo "WARNING: Copilot CLI not responding" >&2
    exit 1
  fi
  ;;
coderabbit)
  if [[ ${AI_HAS_CODERABBIT:-} == "1" ]]; then exit 0; fi
  if ! command -v coderabbit >/dev/null 2>&1; then
    echo "ERROR: CodeRabbit CLI not installed" >&2
    echo "  Install: npm install -g @coderabbitai/coderabbit-cli" >&2
    exit 1
  fi
  if ! [[ -f ~/.coderabbit/config.json || -f ~/.coderabbit/auth.token ]]; then
    echo "ERROR: CodeRabbit not configured" >&2
    echo "  Run: coderabbit auth login" >&2
    exit 1
  fi
  ;;
*)
  echo "ERROR: Unknown AI: $_ai" >&2
  echo "Usage: check-ai-auth.sh <codex|gemini|copilot|coderabbit>" >&2
  exit 1
  ;;
esac
