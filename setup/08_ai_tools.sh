#!/bin/bash
# AI ツールのセットアップ（Ollama）

# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
log_section "08: AI tools setup"

# --- Ollama LaunchAgent ---

if [[ -f "$HOME/Library/LaunchAgents/com.ollama.serve.plist" ]]; then
  launchctl load "$HOME/Library/LaunchAgents/com.ollama.serve.plist" 2>/dev/null || true
  log_info "Ollama LaunchAgent をロードしました"
  sleep 2
else
  log_warn "Ollama LaunchAgent が見つかりません。先に 03_symlinks.sh を実行してください"
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
