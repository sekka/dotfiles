#!/bin/bash
# 開発ツール追加セットアップ（CotEditor、mise）

# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
log_section "10: Dev tools setup"

# --- CotEditor コマンドラインツール ---

ensure_symlink \
  "/Applications/CotEditor.app/Contents/SharedSupport/bin/cot" \
  "/opt/homebrew/bin/cot" \
  "cot" sudo

# --- claude-squad cs コマンド ---

ensure_symlink \
  "$(brew --prefix)/bin/claude-squad" \
  "$(brew --prefix)/bin/cs" \
  "cs"

# --- mise ランタイム更新 ---

if ! is_installed mise; then
  log_warn "mise がインストールされていません"
else
  log_info "mise ランタイムをアップグレードしています..."
  mise upgrade || log_warn "mise upgrade に失敗しました（rate limit や GPG 問題の可能性があります）"
  log_info "mise キャッシュをクリーンアップしています..."
  mise run mise-clean || log_warn "mise-clean に失敗しました"
fi

# --- サマリー ---

log_section "10: 完了"
