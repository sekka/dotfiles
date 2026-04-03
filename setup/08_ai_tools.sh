#!/bin/bash
# AI ツールのセットアップ（Ollama）

# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
log_section "08: AI tools setup"

# --- Ollama LaunchAgent 移行（手動 plist → Nix 管理） ---

OLD_PLIST="$HOME/Library/LaunchAgents/com.ollama.serve.plist"
if [[ -e $OLD_PLIST ]] || [[ -L $OLD_PLIST ]]; then
  launchctl unload "$OLD_PLIST" 2>/dev/null || true
  rm -f "$OLD_PLIST"
  log_info "旧 Ollama LaunchAgent を削除しました（Nix 管理に移行済み）"
else
  log_skip "旧 Ollama LaunchAgent はありません"
fi

# --- Ollama 埋め込みモデル ---

if is_installed ollama; then
  log_info "Ollama 埋め込みモデルをセットアップしています..."
  ollama pull nomic-embed-text
  log_info "Ollama モデルの準備が完了しました"
else
  log_warn "ollama が見つかりません。先に Brewfile からインストールしてください"
fi

# --- サマリー ---

log_section "08: 完了"
log_info "セットアップが完了しました"
