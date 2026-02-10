#!/bin/bash
# macOS defaults settings
# 現在のmacで実際に設定されている項目を反映したスクリプトです
# コメントアウトされている項目は、現在デフォルト値で動作している設定です
# 注意: システム設定を変更するため、内容を理解してから実行してください

set -e

echo "# ======================================================================================="
echo "# macOS defaults設定を適用"
echo "# 注意: この設定は慎重に実行してください"
echo ""

# バックアップ作成
echo "現在の設定をバックアップ中..."
backup_file=~/Desktop/macos_defaults_backup_$(date +%Y%m%d_%H%M%S).txt
defaults read >"$backup_file"
echo "✓ バックアップ保存: $backup_file"
echo ""

# =======================================================================================
# Finder設定
# =======================================================================================
echo "## Finder設定を適用中..."

# 全ての拡張子を表示
defaults write NSGlobalDomain AppleShowAllExtensions -bool true
echo "✓ 全ての拡張子を表示"

# 隠しファイルを表示
defaults write com.apple.finder AppleShowAllFiles -bool true
echo "✓ 隠しファイルを表示"

# パスバーを表示
defaults write com.apple.finder ShowPathbar -bool true
echo "✓ パスバーを表示"

# ステータスバーを表示
defaults write com.apple.finder ShowStatusBar -bool true
echo "✓ ステータスバーを表示"

# フォルダを最初にソート（無効化：ファイルとフォルダを名前順で混在）
defaults write com.apple.finder _FXSortFoldersFirst -bool false
echo "✓ フォルダ優先ソートを無効化（ファイルとフォルダを名前順で混在）"

# タイトルバーにフルパス表示
defaults write com.apple.finder _FXShowPosixPathInTitle -bool true
echo "✓ タイトルバーにフルパス表示"

# デフォルトで検索範囲を現在のフォルダに設定
defaults write com.apple.finder FXDefaultSearchScope -string "SCcf"
echo "✓ 検索範囲をデフォルトで現在のフォルダに設定"

# 拡張子変更時の警告を無効化
defaults write com.apple.finder FXEnableExtensionChangeWarning -bool false
echo "✓ 拡張子変更時の警告を無効化"

# Quick Lookで文字列選択を可能に
defaults write com.apple.finder QLEnableTextSelection -bool true
echo "✓ Quick Lookで文字列選択を可能に"

# Finderでデフォルトの表示モードをカラム表示に
defaults write com.apple.finder FXPreferredViewStyle -string "clmv"
echo "✓ Finderデフォルト表示をカラム表示に設定"

# ネットワークボリュームで.DS_Storeファイルを作成しない
defaults write com.apple.desktopservices DSDontWriteNetworkStores -bool true
echo "✓ ネットワークボリュームで.DS_Store作成抑制"

# USBボリュームで.DS_Storeファイルを作成しない
defaults write com.apple.desktopservices DSDontWriteUSBStores -bool true
echo "✓ USBボリュームで.DS_Store作成抑制"

echo ""

# =======================================================================================
# ディスクイメージ設定
# =======================================================================================
echo "## ディスクイメージ設定を適用中..."

# DMGマウント時の検証を有効化（セキュリティ優先）
defaults write com.apple.frameworks.diskimages skip-verify -bool false
defaults write com.apple.frameworks.diskimages skip-verify-locked -bool false
defaults write com.apple.frameworks.diskimages skip-verify-remote -bool false
echo "✓ DMGファイルマウント時の検証を有効化"

echo ""

# =======================================================================================
# Dock設定
# =======================================================================================
echo "## Dock設定を適用中..."

# Dockを自動的に隠す
defaults write com.apple.dock autohide -bool true
echo "✓ Dockの自動非表示"

# Dockの自動非表示の遅延を削除（現在は未設定）
# defaults write com.apple.dock autohide-delay -float 0
# echo "✓ Dock自動非表示の遅延を削除"

# Dock起動アニメーションを無効化（現在は未設定）
# defaults write com.apple.dock launchanim -bool false
# echo "✓ Dock起動アニメーションを無効化"

# Mission Controlのアニメーション速度を高速化（現在は未設定）
# defaults write com.apple.dock expose-animation-duration -float 0.1
# echo "✓ Mission Controlアニメーション高速化"

# Dockのタイルサイズ（現在の設定: 20）
defaults write com.apple.dock tilesize -int 20
echo "✓ Dockタイルサイズを20に設定"

echo ""

# =======================================================================================
# キーボード設定
# =======================================================================================
echo "## キーボード設定を適用中..."

# キーリピート速度を高速化（最速は1、デフォルトは6）
defaults write NSGlobalDomain KeyRepeat -int 1
echo "✓ キーリピート速度を高速化（1）"

# リピート開始までの時間を短縮（最速は10、デフォルトは25）
defaults write NSGlobalDomain InitialKeyRepeat -int 10
echo "✓ リピート開始時間を短縮（10）"

# スペルチェックの自動修正を無効化
defaults write NSGlobalDomain NSAutomaticSpellingCorrectionEnabled -bool false
echo "✓ スペルチェック自動修正を無効化"

# 自動大文字変換を無効化
defaults write NSGlobalDomain NSAutomaticCapitalizationEnabled -bool false
echo "✓ 自動大文字変換を無効化"

# ピリオド2回でのスマート引用符を無効化
defaults write NSGlobalDomain NSAutomaticQuoteSubstitutionEnabled -bool false
echo "✓ スマート引用符を無効化"

# ダッシュのスマート変換を無効化
defaults write NSGlobalDomain NSAutomaticDashSubstitutionEnabled -bool false
echo "✓ スマートダッシュを無効化"

echo ""

# =======================================================================================
# トラックパッド設定
# =======================================================================================
echo "## トラックパッド設定を適用中..."

# タップでクリックを有効化
defaults write com.apple.AppleMultitouchTrackpad Clicking -bool true
defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad Clicking -bool true
defaults -currentHost write NSGlobalDomain com.apple.mouse.tapBehavior -int 1
defaults write NSGlobalDomain com.apple.mouse.tapBehavior -int 1
echo "✓ タップでクリックを有効化"

# トラックパッド速度を高速化（デフォルトは1）
defaults write NSGlobalDomain com.apple.trackpad.scaling -float 3
echo "✓ トラックパッド速度を高速化（3）"

echo ""

# =======================================================================================
# スクリーンショット設定
# =======================================================================================
echo "## スクリーンショット設定を適用中..."

# スクリーンショットの保存形式をPNGに設定（現在は未設定）
# defaults write com.apple.screencapture type -string "png"
# echo "✓ スクリーンショット形式をPNGに設定"

# スクリーンショットの影を無効化
defaults write com.apple.screencapture disable-shadow -bool true
echo "✓ スクリーンショットの影を無効化"

# スクリーンショットの保存場所をデスクトップに設定（デフォルト）
# カスタマイズする場合は以下のコメントを外す
# defaults write com.apple.screencapture location -string "${HOME}/Pictures/Screenshots"
# mkdir -p "${HOME}/Pictures/Screenshots"
# echo "✓ スクリーンショット保存場所を設定"

echo ""

# =======================================================================================
# システム全般
# =======================================================================================
echo "## システム全般設定を適用中..."

# ウィンドウのリサイズアニメーションを無効化（現在は未設定）
# defaults write NSGlobalDomain NSAutomaticWindowAnimationsEnabled -bool false
# echo "✓ ウィンドウアニメーションを無効化"

# スクロールバーを常に表示（現在は未設定）
# defaults write NSGlobalDomain AppleShowScrollBars -string "Always"
# echo "✓ スクロールバーを常に表示"

# 保存ダイアログを展開表示
defaults write NSGlobalDomain NSNavPanelExpandedStateForSaveMode -bool true
defaults write NSGlobalDomain NSNavPanelExpandedStateForSaveMode2 -bool true
echo "✓ 保存ダイアログを展開表示"

# 印刷ダイアログを展開表示
defaults write NSGlobalDomain PMPrintingExpandedStateForPrint -bool true
defaults write NSGlobalDomain PMPrintingExpandedStateForPrint2 -bool true
echo "✓ 印刷ダイアログを展開表示"

# クラッシュレポーターを無効化
defaults write com.apple.CrashReporter DialogType -string "none"
echo "✓ クラッシュレポーターを無効化"

# 未確認のアプリケーション実行時の警告を無効化（セキュリティリスク注意）
# defaults write com.apple.LaunchServices LSQuarantine -bool false
# echo "✓ 未確認アプリの警告を無効化"

echo ""

# =======================================================================================
# アクセシビリティ設定
# =======================================================================================
echo "## アクセシビリティ設定を適用中..."

# ウインドウタイトルにアイコンを表示
if defaults write com.apple.universalaccess showWindowTitlebarIcons -bool true 2>/dev/null; then
  echo "✓ ウインドウタイトルにアイコンを表示"
else
  echo "⚠ ウインドウタイトルアイコンの設定はスキップ（権限不足）"
  echo "  → システム設定 > アクセシビリティ > ディスプレイ から手動で設定してください"
fi

echo ""

# =======================================================================================
# Safari設定
# =======================================================================================
echo "## Safari設定を適用中..."

# 開発メニューを有効化
defaults write com.apple.Safari IncludeDevelopMenu -bool true
echo "✓ Safari開発メニューを有効化"

# Webインスペクタを有効化
defaults write com.apple.Safari WebKitDeveloperExtrasEnabledPreferenceKey -bool true
defaults write com.apple.Safari com.apple.Safari.ContentPageGroupIdentifier.WebKit2DeveloperExtrasEnabled -bool true
echo "✓ Safari Webインスペクタを有効化"

# アドレスバーに完全なURLを表示
defaults write com.apple.Safari ShowFullURLInSmartSearchField -bool true
echo "✓ Safari完全URL表示を有効化"

# 新規タブを空白ページで開く（現在は未設定）
# defaults write com.apple.Safari NewTabBehavior -int 1
# echo "✓ Safari新規タブを空白ページに設定"

echo ""

# =======================================================================================
# メニューバー設定
# =======================================================================================
echo "## メニューバー設定を適用中..."

# ステータスアイテムの間隔を設定
defaults -currentHost write -globalDomain NSStatusItemSpacing -int 8
echo "✓ メニューバーアイテム間隔を8に設定"

# ステータスアイテムの選択時内余白を設定
defaults -currentHost write -globalDomain NSStatusItemSelectionPadding -int 6
echo "✓ メニューバーアイテム選択時内余白を6に設定"

# 日付・時刻の表示形式（24時間表示、秒表示あり）
defaults write com.apple.menuextra.clock DateFormat -string "M\u6708d\u65e5(EEE) H:mm:ss"
echo "✓ メニューバー時計表示を設定（例：1月23日(木) 14:30:45）"

# バッテリーの割合表示（ノートPCの場合）
defaults write com.apple.menuextra.battery ShowPercent -bool true
echo "✓ バッテリー割合表示を有効化"

echo ""

# === アクティビティモニタ設定 ===
# echo "## アクティビティモニタ設定を適用中..."

# 起動時に全てのプロセスを表示（現在は未設定）
# defaults write com.apple.ActivityMonitor ShowCategory -int 0
# echo "✓ アクティビティモニタで全プロセスを表示"

# Dockアイコンをネットワーク使用率として表示（現在は未設定）
# defaults write com.apple.ActivityMonitor IconType -int 3
# echo "✓ アクティビティモニタのDockアイコンをネットワーク使用率に設定"

# echo ""

# =======================================================================================
# テキストエディット設定
# =======================================================================================
echo "## テキストエディット設定を適用中..."

# プレーンテキストをデフォルトで使用
defaults write com.apple.TextEdit RichText -int 0
echo "✓ テキストエディットでプレーンテキストをデフォルトに設定"

# 開くとき・保存するときはUTF-8を使用
defaults write com.apple.TextEdit PlainTextEncoding -int 4
defaults write com.apple.TextEdit PlainTextEncodingForWrite -int 4
echo "✓ テキストエディットでUTF-8をデフォルトに設定"

echo ""

# アプリケーション再起動
echo "# ======================================================================================="
echo "# 設定を反映するため、アプリケーションを再起動しています..."

killall Finder || true
killall Dock || true
killall SystemUIServer || true
# killall Safari || true

echo ""
echo "✅ macOS defaults設定が完了しました"
echo ""
echo "⚠️  注意事項:"
echo "   - 一部の設定は再ログインまたはシステム再起動後に反映されます"
echo "   - バックアップファイル: $backup_file"
echo "   - 設定を元に戻す場合は、システム環境設定から手動で変更してください"
echo ""
