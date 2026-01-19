#!/bin/bash
# macOS defaults設定の簡易チェックスクリプト
# デフォルトから変更されている一般的な設定項目をチェックして、
# defaults writeコマンドとして出力します。

set -e

echo "=== macOS設定のカスタマイズ箇所チェック ==="
echo ""

has_customization=false

# === Finder設定 ===
echo "## Finder設定"

# 拡張子表示
if [ "$(defaults read NSGlobalDomain AppleShowAllExtensions 2>/dev/null)" = "1" ]; then
  echo "✓ 全ての拡張子を表示: ON (デフォルト: OFF)"
  echo "  defaults write NSGlobalDomain AppleShowAllExtensions -bool true"
  has_customization=true
fi

# 隠しファイル表示
finder_show_all=$(defaults read com.apple.finder AppleShowAllFiles 2>/dev/null || echo "NO")
if [ "$finder_show_all" = "YES" ] || [ "$finder_show_all" = "1" ]; then
  echo "✓ 隠しファイルを表示: ON (デフォルト: OFF)"
  echo "  defaults write com.apple.finder AppleShowAllFiles -bool true"
  has_customization=true
fi

# パスバー表示
if [ "$(defaults read com.apple.finder ShowPathbar 2>/dev/null)" = "1" ]; then
  echo "✓ パスバーを表示: ON (デフォルト: OFF)"
  echo "  defaults write com.apple.finder ShowPathbar -bool true"
  has_customization=true
fi

# ステータスバー表示
if [ "$(defaults read com.apple.finder ShowStatusBar 2>/dev/null)" = "1" ]; then
  echo "✓ ステータスバーを表示: ON (デフォルト: OFF)"
  echo "  defaults write com.apple.finder ShowStatusBar -bool true"
  has_customization=true
fi

# フォルダを最初にソート
if [ "$(defaults read com.apple.finder _FXSortFoldersFirst 2>/dev/null)" = "1" ]; then
  echo "✓ フォルダを最初にソート: ON (デフォルト: OFF)"
  echo "  defaults write com.apple.finder _FXSortFoldersFirst -bool true"
  has_customization=true
fi

# タイトルバーにフルパス表示
if [ "$(defaults read com.apple.finder _FXShowPosixPathInTitle 2>/dev/null)" = "1" ]; then
  echo "✓ タイトルバーにフルパス表示: ON (デフォルト: OFF)"
  echo "  defaults write com.apple.finder _FXShowPosixPathInTitle -bool true"
  has_customization=true
fi

echo ""

# === Dock設定 ===
echo "## Dock設定"

# 自動非表示
if [ "$(defaults read com.apple.dock autohide 2>/dev/null)" = "1" ]; then
  echo "✓ Dockの自動非表示: ON (デフォルト: OFF)"
  echo "  defaults write com.apple.dock autohide -bool true"
  has_customization=true
fi

# 自動非表示の遅延
autohide_delay=$(defaults read com.apple.dock autohide-delay 2>/dev/null || echo "0.5")
if [ "$autohide_delay" != "0.5" ]; then
  echo "✓ Dock自動非表示の遅延: ${autohide_delay}秒 (デフォルト: 0.5)"
  echo "  defaults write com.apple.dock autohide-delay -float $autohide_delay"
  has_customization=true
fi

# 起動アニメーション
if [ "$(defaults read com.apple.dock launchanim 2>/dev/null)" = "0" ]; then
  echo "✓ Dock起動アニメーション: OFF (デフォルト: ON)"
  echo "  defaults write com.apple.dock launchanim -bool false"
  has_customization=true
fi

# タイルサイズ
tilesize=$(defaults read com.apple.dock tilesize 2>/dev/null || echo "")
if [ -n "$tilesize" ] && [ "$tilesize" != "48" ]; then
  echo "✓ Dockタイルサイズ: $tilesize (デフォルト: 48)"
  echo "  defaults write com.apple.dock tilesize -int $tilesize"
  has_customization=true
fi

echo ""

# === キーボード設定 ===
echo "## キーボード設定"

# キーリピート速度
key_repeat=$(defaults read NSGlobalDomain KeyRepeat 2>/dev/null || echo "")
if [ -n "$key_repeat" ] && [ "$key_repeat" -lt "6" ]; then
  echo "✓ キーリピート速度: $key_repeat (デフォルト: 6, 速いほど小さい値)"
  echo "  defaults write NSGlobalDomain KeyRepeat -int $key_repeat"
  has_customization=true
fi

# リピート開始までの時間
initial_key_repeat=$(defaults read NSGlobalDomain InitialKeyRepeat 2>/dev/null || echo "")
if [ -n "$initial_key_repeat" ] && [ "$initial_key_repeat" -lt "25" ]; then
  echo "✓ リピート開始までの時間: $initial_key_repeat (デフォルト: 25, 速いほど小さい値)"
  echo "  defaults write NSGlobalDomain InitialKeyRepeat -int $initial_key_repeat"
  has_customization=true
fi

# スペルチェック自動修正
if [ "$(defaults read NSGlobalDomain NSAutomaticSpellingCorrectionEnabled 2>/dev/null)" = "0" ]; then
  echo "✓ スペルチェック自動修正: OFF (デフォルト: ON)"
  echo "  defaults write NSGlobalDomain NSAutomaticSpellingCorrectionEnabled -bool false"
  has_customization=true
fi

echo ""

# === トラックパッド設定 ===
echo "## トラックパッド設定"

# タップでクリック
if [ "$(defaults read com.apple.AppleMultitouchTrackpad Clicking 2>/dev/null)" = "1" ]; then
  echo "✓ タップでクリック: ON (デフォルト: OFF)"
  echo "  defaults write com.apple.AppleMultitouchTrackpad Clicking -bool true"
  echo "  defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad Clicking -bool true"
  has_customization=true
fi

# 3本指ドラッグ
if [ "$(defaults read com.apple.AppleMultitouchTrackpad TrackpadThreeFingerDrag 2>/dev/null)" = "1" ]; then
  echo "✓ 3本指ドラッグ: ON (デフォルト: OFF)"
  echo "  defaults write com.apple.AppleMultitouchTrackpad TrackpadThreeFingerDrag -bool true"
  echo "  defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad TrackpadThreeFingerDrag -bool true"
  has_customization=true
fi

# トラックパッド速度
trackpad_scaling=$(defaults read NSGlobalDomain com.apple.trackpad.scaling 2>/dev/null || echo "")
if [ -n "$trackpad_scaling" ] && [ "$trackpad_scaling" != "1" ]; then
  echo "✓ トラックパッド速度: $trackpad_scaling (デフォルト: 1)"
  echo "  defaults write NSGlobalDomain com.apple.trackpad.scaling -float $trackpad_scaling"
  has_customization=true
fi

echo ""

# === スクリーンショット設定 ===
echo "## スクリーンショット設定"

# 保存形式
screenshot_type=$(defaults read com.apple.screencapture type 2>/dev/null || echo "png")
if [ "$screenshot_type" != "png" ]; then
  echo "✓ スクリーンショット形式: $screenshot_type (デフォルト: png)"
  echo "  defaults write com.apple.screencapture type -string \"$screenshot_type\""
  has_customization=true
fi

# 影を含めない
if [ "$(defaults read com.apple.screencapture disable-shadow 2>/dev/null)" = "1" ]; then
  echo "✓ スクリーンショットの影: OFF (デフォルト: ON)"
  echo "  defaults write com.apple.screencapture disable-shadow -bool true"
  has_customization=true
fi

# 保存場所
screenshot_location=$(defaults read com.apple.screencapture location 2>/dev/null || echo "")
if [ -n "$screenshot_location" ]; then
  echo "✓ スクリーンショット保存場所: $screenshot_location (デフォルト: デスクトップ)"
  echo "  defaults write com.apple.screencapture location -string \"$screenshot_location\""
  has_customization=true
fi

echo ""

# === システム全般 ===
echo "## システム全般"

# ウィンドウアニメーション
if [ "$(defaults read NSGlobalDomain NSAutomaticWindowAnimationsEnabled 2>/dev/null)" = "0" ]; then
  echo "✓ ウィンドウアニメーション: OFF (デフォルト: ON)"
  echo "  defaults write NSGlobalDomain NSAutomaticWindowAnimationsEnabled -bool false"
  has_customization=true
fi

# スクロールバー常時表示
scrollbars=$(defaults read NSGlobalDomain AppleShowScrollBars 2>/dev/null || echo "Automatic")
if [ "$scrollbars" = "Always" ]; then
  echo "✓ スクロールバー: 常に表示 (デフォルト: 自動)"
  echo '  defaults write NSGlobalDomain AppleShowScrollBars -string "Always"'
  has_customization=true
fi

# .DS_Store作成抑制（ネットワークボリューム）
if [ "$(defaults read com.apple.desktopservices DSDontWriteNetworkStores 2>/dev/null)" = "1" ]; then
  echo "✓ ネットワークボリュームで.DS_Store作成抑制: ON (デフォルト: OFF)"
  echo "  defaults write com.apple.desktopservices DSDontWriteNetworkStores -bool true"
  has_customization=true
fi

# クラッシュレポーター
crash_reporter=$(defaults read com.apple.CrashReporter DialogType 2>/dev/null || echo "")
if [ "$crash_reporter" = "none" ]; then
  echo "✓ クラッシュレポーター: 無効 (デフォルト: 有効)"
  echo '  defaults write com.apple.CrashReporter DialogType -string "none"'
  has_customization=true
fi

echo ""

# === Safari設定 ===
echo "## Safari設定"

# 開発メニュー
if [ "$(defaults read com.apple.Safari IncludeDevelopMenu 2>/dev/null)" = "1" ]; then
  echo "✓ Safari開発メニュー: ON (デフォルト: OFF)"
  echo "  defaults write com.apple.Safari IncludeDevelopMenu -bool true"
  has_customization=true
fi

# 完全なURL表示
if [ "$(defaults read com.apple.Safari ShowFullURLInSmartSearchField 2>/dev/null)" = "1" ]; then
  echo "✓ Safari完全URL表示: ON (デフォルト: OFF)"
  echo "  defaults write com.apple.Safari ShowFullURLInSmartSearchField -bool true"
  has_customization=true
fi

echo ""
echo "=== チェック完了 ==="

if [ "$has_customization" = false ]; then
  echo "✓ デフォルトから変更されている一般的な設定は見つかりませんでした。"
else
  echo ""
  echo "💡 上記のコマンドをスクリプトに保存して使用できます。"
  echo "   例: $0 > ~/Desktop/my_macos_settings.sh"
fi
