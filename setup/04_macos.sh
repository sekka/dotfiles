#!/bin/bash
# macOS defaults 設定を適用（冪等: 何回でも安全に実行可能）

# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
log_section "04: macOS defaults"

# --- バックアップ（1世代ローテーション） ---

BACKUP_DIR="${HOME}/.dotfiles-macos-backup"
mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/backup.txt"
BACKUP_PREV="$BACKUP_DIR/backup.prev.txt"

if [[ -f $BACKUP_FILE ]]; then
  mv "$BACKUP_FILE" "$BACKUP_PREV"
fi

log_info "設定をバックアップしています..."
defaults read >"$BACKUP_FILE"
log_info "バックアップ保存: $BACKUP_FILE"

# --- Finder ---

defaults write NSGlobalDomain AppleShowAllExtensions -bool true
defaults write com.apple.finder AppleShowAllFiles -bool true
defaults write com.apple.finder ShowPathbar -bool true
defaults write com.apple.finder ShowStatusBar -bool true
defaults write com.apple.finder _FXSortFoldersFirst -bool false
defaults write com.apple.finder _FXShowPosixPathInTitle -bool true
defaults write com.apple.finder FXDefaultSearchScope -string "SCcf"
defaults write com.apple.finder FXEnableExtensionChangeWarning -bool false
defaults write com.apple.finder QLEnableTextSelection -bool true
defaults write com.apple.finder FXPreferredViewStyle -string "clmv"
defaults write com.apple.desktopservices DSDontWriteNetworkStores -bool true
defaults write com.apple.desktopservices DSDontWriteUSBStores -bool true
log_info "Finder 設定を適用しました"

# --- ディスクイメージ ---

defaults write com.apple.frameworks.diskimages skip-verify -bool false
defaults write com.apple.frameworks.diskimages skip-verify-locked -bool false
defaults write com.apple.frameworks.diskimages skip-verify-remote -bool false
log_info "ディスクイメージ設定を適用しました"

# --- Dock ---

defaults write com.apple.dock autohide -bool true
defaults write com.apple.dock tilesize -int 20
log_info "Dock 設定を適用しました"

# --- キーボード ---

defaults write NSGlobalDomain KeyRepeat -int 1
defaults write NSGlobalDomain InitialKeyRepeat -int 10
defaults write NSGlobalDomain NSAutomaticSpellingCorrectionEnabled -bool false
defaults write NSGlobalDomain NSAutomaticCapitalizationEnabled -bool false
defaults write NSGlobalDomain NSAutomaticQuoteSubstitutionEnabled -bool false
defaults write NSGlobalDomain NSAutomaticDashSubstitutionEnabled -bool false
log_info "キーボード設定を適用しました"

# --- トラックパッド ---

defaults write com.apple.AppleMultitouchTrackpad Clicking -bool true
defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad Clicking -bool true
defaults -currentHost write NSGlobalDomain com.apple.mouse.tapBehavior -int 1
defaults write NSGlobalDomain com.apple.mouse.tapBehavior -int 1
defaults write NSGlobalDomain com.apple.trackpad.scaling -float 3
log_info "トラックパッド設定を適用しました"

# --- スクリーンショット ---

defaults write com.apple.screencapture disable-shadow -bool true
log_info "スクリーンショット設定を適用しました"

# --- システム全般 ---

defaults write NSGlobalDomain NSNavPanelExpandedStateForSaveMode -bool true
defaults write NSGlobalDomain NSNavPanelExpandedStateForSaveMode2 -bool true
defaults write NSGlobalDomain PMPrintingExpandedStateForPrint -bool true
defaults write NSGlobalDomain PMPrintingExpandedStateForPrint2 -bool true
defaults write com.apple.CrashReporter DialogType -string "none"
log_info "システム全般設定を適用しました"

# --- アクセシビリティ ---

if defaults write com.apple.universalaccess showWindowTitlebarIcons -bool true 2>/dev/null; then
  log_info "アクセシビリティ設定を適用しました"
else
  log_warn "ウインドウタイトルアイコン設定をスキップしました（権限不足）"
fi

# --- Safari ---

if defaults write com.apple.Safari IncludeDevelopMenu -bool true 2>/dev/null; then
  log_info "Safari 開発メニューを有効化しました"
else
  log_warn "Safari 設定をスキップしました（権限不足またはサンドボックス）"
fi

if defaults write com.apple.Safari WebKitDeveloperExtrasEnabledPreferenceKey -bool true 2>/dev/null &&
  defaults write com.apple.Safari com.apple.Safari.ContentPageGroupIdentifier.WebKit2DeveloperExtrasEnabled -bool true 2>/dev/null; then
  log_info "Safari Web インスペクタを有効化しました"
else
  log_warn "Safari Web インスペクタ設定をスキップしました（権限不足またはサンドボックス）"
fi

if defaults write com.apple.Safari ShowFullURLInSmartSearchField -bool true 2>/dev/null; then
  log_info "Safari 完全 URL 表示を有効化しました"
else
  log_warn "Safari 完全 URL 表示設定をスキップしました（権限不足またはサンドボックス）"
fi

# --- メニューバー ---

if defaults -currentHost write -globalDomain NSStatusItemSpacing -int 8 2>/dev/null; then
  log_info "メニューバーアイテム間隔を設定しました"
else
  log_warn "メニューバーアイテム間隔の設定をスキップしました（権限不足）"
fi

if defaults -currentHost write -globalDomain NSStatusItemSelectionPadding -int 6 2>/dev/null; then
  log_info "メニューバーアイテム選択時内余白を設定しました"
else
  log_warn "メニューバーアイテム選択時内余白の設定をスキップしました（権限不足）"
fi

if defaults write com.apple.menuextra.clock DateFormat -string "M\u6708d\u65e5(EEE) H:mm:ss" 2>/dev/null; then
  log_info "メニューバー時計表示を設定しました"
else
  log_warn "メニューバー時計表示の設定をスキップしました（権限不足）"
fi

if defaults write com.apple.menuextra.battery ShowPercent -bool true 2>/dev/null; then
  log_info "バッテリー割合表示を有効化しました"
else
  log_warn "バッテリー割合表示の設定をスキップしました（権限不足）"
fi

# --- テキストエディット ---

if defaults write com.apple.TextEdit RichText -int 0 2>/dev/null &&
  defaults write com.apple.TextEdit PlainTextEncoding -int 4 2>/dev/null &&
  defaults write com.apple.TextEdit PlainTextEncodingForWrite -int 4 2>/dev/null; then
  log_info "テキストエディット設定を適用しました"
else
  log_warn "テキストエディット設定をスキップしました（権限不足）"
fi

# --- アプリケーション再起動 ---

log_info "アプリケーションを再起動して設定を反映しています..."
killall Finder || true
killall Dock || true
killall SystemUIServer || true

# --- サマリー ---

log_section "04: 完了"
log_info "一部の設定は再ログインまたは再起動後に反映されます"
