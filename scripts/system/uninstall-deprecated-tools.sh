#!/bin/bash
# 非推奨ブラウザ自動化ツールのアンインストール
# pinchtab, agent-browser, fossil-mcp を削除する

set -euo pipefail

log() { printf '\033[1;34m[cleanup]\033[0m %s\n' "$1"; }

# fossil-mcp (バイナリ)
if [[ -f "$HOME/.local/bin/fossil-mcp" ]]; then
  rm "$HOME/.local/bin/fossil-mcp"
  log "fossil-mcp を削除しました"
else
  log "fossil-mcp: 見つかりません（スキップ）"
fi

# npm/mise でインストールされたツール
for tool in agent-browser pinchtab; do
  if command -v "$tool" &>/dev/null; then
    if npm uninstall -g "$tool" 2>/dev/null || mise uninstall "npm:$tool" 2>/dev/null; then
      log "$tool を削除しました"
    else
      log "$tool の削除に失敗しました（手動削除が必要）"
    fi
  else
    log "$tool: 見つかりません（スキップ）"
  fi
done

log "完了"
