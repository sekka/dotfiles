#!/bin/bash
# macOS 開発環境の基礎セットアップ（Xcode CLT, Homebrew, zsh）

# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
log_section "01: Base setup"

# --- Xcode Command Line Tools ---

if xcode-select -p &>/dev/null; then
  log_skip "Xcode CLT は既にインストール済み"
else
  log_info "Xcode CLT をインストールしています..."
  sudo xcode-select --install
fi

# --- Xcode ライセンス同意 ---

if xcodebuild -license check &>/dev/null; then
  log_skip "Xcode ライセンスは承認済み"
else
  log_info "Xcode ライセンスに同意しています..."
  sudo xcodebuild -license accept
fi

# --- Rosetta 2 ---

if [[ -d /Library/Apple/usr/share/rosetta ]]; then
  log_skip "Rosetta 2 は既にインストール済み"
else
  log_info "Rosetta 2 をインストールしています..."
  softwareupdate --install-rosetta --agree-to-license
fi

# --- Homebrew ---

if is_installed brew; then
  log_skip "Homebrew は既にインストール済み"
else
  log_info "Homebrew をインストールしています..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
  log_info "Homebrew をインストールしました"
fi

# --- zsh ---

brew install zsh

WHICH_ZSH="$(which zsh)"

if grep -qF "$WHICH_ZSH" /etc/shells; then
  log_skip "zsh は /etc/shells に登録済み"
else
  log_info "zsh を /etc/shells に追加しています..."
  sudo sh -c "echo $WHICH_ZSH >> /etc/shells"
fi

CURRENT_SHELL=$(dscl . -read "/Users/${USER}" UserShell | awk '{print $2}')
if [[ $CURRENT_SHELL == "$WHICH_ZSH" ]]; then
  log_skip "デフォルトシェルは既に zsh"
else
  log_info "デフォルトシェルを zsh に変更しています..."
  chsh -s "$WHICH_ZSH"
fi

# --- サマリー ---

log_section "01: 完了"
log_info "新しいシェルセッションを開いてください"
