#!/bin/bash
# Homebrew パッケージ管理（インストール・更新・クリーンアップ）

# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
log_section "02: Homebrew setup"

# --- 前提条件 ---

if ! is_installed brew; then
  log_error "Homebrew がインストールされていません。先に 01_base.sh を実行してください"
  exit 1
fi

# --- メイン処理 ---

log_info "Homebrew を更新しています..."
brew update

log_info "Brewfile でパッケージをインストールしています..."
brew bundle --file="$(dirname "$0")/Brewfile"

log_info "パッケージをアップグレードしています..."
brew upgrade

log_info "Cask パッケージをアップグレードしています..."
brew upgrade --cask --greedy

log_info "不要ファイルを削除しています..."
brew cleanup

log_info "使われていない依存パッケージを削除しています..."
brew autoremove

# --- サマリー ---

log_section "02: 完了"
