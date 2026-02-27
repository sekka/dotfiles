#!/bin/bash
# 開発ツール追加セットアップ（GitHub CLI 拡張機能、gibo、CotEditor）

# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
log_section "05: Dev tools setup"

# --- GitHub CLI 拡張機能 ---

if ! is_installed gh; then
  log_warn "gh がインストールされていません。Brewfile から先にインストールしてください"
else
  install_gh_extension() {
    local ext="$1"
    local ext_list
    ext_list=$(gh extension list 2>/dev/null)
    if echo "$ext_list" | grep -q "${ext##*/}"; then
      log_skip "gh extension: $ext (既にインストール済み)"
    else
      log_info "gh extension をインストールしています: $ext"
      gh extension install "$ext"
    fi
  }

  install_gh_extension him0/gh-sync
  install_gh_extension dlvhdr/gh-dash
  install_gh_extension mislav/gh-branch
fi

# --- gibo (.gitignore 生成ツール) ---

if ! is_installed gibo; then
  log_warn "gibo がインストールされていません。Brewfile から先にインストールしてください"
else
  log_info "gibo テンプレートを更新しています..."
  gibo update
fi

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
  mise upgrade
fi

# --- サマリー ---

log_section "05: 完了"
