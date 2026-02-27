#!/bin/bash
# yazi プラグインを一括インストール

# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
log_section "07: Yazi plugins setup"

# --- 前提条件 ---

if ! is_installed ya; then
  log_error "'ya' コマンドが見つかりません。先に yazi をインストールしてください（brew install yazi）"
  exit 1
fi

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

check_dependency() {
  local cmd="$1"
  local required_by="$2"
  if is_installed "$cmd"; then
    log_info "依存ツール確認: $cmd"
  else
    log_warn "$cmd がインストールされていません（$required_by が必要）"
    log_warn "  インストール: brew install $cmd"
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

# --- 依存パッケージ確認 ---

check_dependency glow "glow.yazi"
check_dependency mediainfo "mediainfo.yazi"
check_dependency ffmpeg "mediainfo.yazi"
check_dependency ouch "ouch.yazi"
check_dependency exiftool "exifaudio.yazi"

# --- サマリー ---

log_section "07: 完了"
log_info "yazi を再起動してプラグインを有効化してください"
