#!/bin/bash
# yazi プラグインを一括インストール

# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
log_section "07: Yazi plugins setup"

# --- ヘルパー関数 ---

install_plugin() {
  local plugin="$1"
  local pkg_list
  pkg_list=$(ya pkg list 2>/dev/null)
  if echo "$pkg_list" | grep -qF "${plugin}"; then
    log_skip "プラグイン: $plugin (既にインストール済み)"
  else
    log_info "プラグインをインストールしています: $plugin"
    if ya pkg add "$plugin" &>/dev/null; then
      log_info "インストール完了: $plugin"
    else
      log_warn "インストールに失敗しました: $plugin"
    fi
  fi
}

# --- Tier 1: 必須プラグイン ---

install_plugin yazi-rs/plugins:git
install_plugin yazi-rs/plugins:full-border
install_plugin yazi-rs/plugins:smart-enter
install_plugin dedukun/bookmarks

# --- Tier 2: 開発者向けプラグイン ---

install_plugin Reledia/glow
install_plugin boydaihungst/mediainfo.yazi:mediainfo
install_plugin yazi-rs/plugins:chmod
install_plugin yazi-rs/plugins:jump-to-char

# --- Tier 3: 特定用途プラグイン ---

install_plugin ndtoan96/ouch
install_plugin KKV9/compress
install_plugin Sonico98/exifaudio.yazi:exifaudio

# --- サマリー ---

log_section "07: 完了"
log_info "yazi を再起動してプラグインを有効化してください"
