#!/bin/bash
# 開発ツール追加セットアップ（CotEditor、mise）

# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
log_section "10: Dev tools setup"

# --- CotEditor コマンドラインツール ---

COT_SOURCE="/Applications/CotEditor.app/Contents/SharedSupport/bin/cot"
COT_TARGET="/opt/homebrew/bin/cot"

if [[ ! -f $COT_SOURCE ]]; then
  log_warn "CotEditor が見つかりません: $COT_SOURCE"
elif [[ -L $COT_TARGET ]]; then
  log_skip "cot コマンドは既にインストール済み"
else
  log_info "cot シンボリックリンクを作成しています..."
  sudo ln -s "$COT_SOURCE" "$COT_TARGET"
  log_info "cot コマンドをインストールしました"
fi

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
