#!/usr/bin/env bash
# AI可用性検証スクリプト
# NOTE: ~/dotfiles/scripts/system/ に配置（既存のscripts/ディレクトリ構造に従う）

echo "Multi-AI Orchestration Health Check"
echo "===================================="

# 環境変数をソース
# shellcheck source=/dev/null
source ~/dotfiles/home/config/zsh/67_ai_availability.zsh 2>/dev/null || true

check_ai() {
  local name=$1 var=$2
  local value="${!var}"
  if [[ $value == "1" ]]; then
    echo "[OK]   $name"
  else
    echo "[FAIL] $name"
  fi
}

check_ai "Codex" "AI_HAS_CODEX"
check_ai "Gemini" "AI_HAS_GEMINI"
check_ai "Copilot" "AI_HAS_COPILOT"
check_ai "CodeRabbit" "AI_HAS_CODERABBIT"

echo ""
echo "Environment: $AI_ENVIRONMENT"
echo "Available: $AI_AVAILABLE_MODELS"

# パーミッションチェック
echo ""
echo "Permission Check"
echo "================"
for f in ~/.codex/auth.json ~/.gemini/.env ~/.coderabbit/auth.token ~/.coderabbit/config.json; do
  if [[ -f $f ]]; then
    perm=$(stat -f%A "$f" 2>/dev/null || stat -c%a "$f" 2>/dev/null || echo "???")
    if [[ $perm == "600" ]]; then
      echo "[OK]   $f ($perm)"
    else
      echo "[WARN] $f ($perm) - should be 600"
    fi
  fi
done

# キャッシュ状態
echo ""
cache="${XDG_CACHE_HOME:-$HOME/.cache}/ai-availability.cache"
if [[ -f $cache ]]; then
  age=$(($(date +%s) - $(stat -f%m "$cache" 2>/dev/null || stat -c%Y "$cache" 2>/dev/null || echo 0)))
  echo "Cache: $cache (age: ${age}s)"
else
  echo "Cache: not found"
fi
