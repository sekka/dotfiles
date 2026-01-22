#!/bin/bash
# ===========================================
# yazi プラグイン一括インストールスクリプト
# ===========================================
# yaziのプラグインを一括でインストールします。
#
# 使用方法:
#   ./scripts/setup-yazi-plugins.sh

set -e

echo "🦆 Installing yazi plugins..."
echo ""

# ya コマンドの存在確認
if ! command -v ya &>/dev/null; then
  echo "❌ Error: 'ya' command not found."
  echo "   Please install yazi first: brew install yazi"
  exit 1
fi

# プラグインをインストールまたは更新
install_plugin() {
  ya pkg add "$1" 2>/dev/null || ya pkg upgrade "$1" 2>/dev/null || echo "⚠️  $1: already installed"
}

# Tier 1: 必須プラグイン
echo "📦 Tier 1: Essential plugins"
install_plugin yazi-rs/plugins:git
install_plugin yazi-rs/plugins:full-border
install_plugin yazi-rs/plugins:smart-enter
install_plugin dedukun/bookmarks
echo ""

# Tier 2: 開発者向けプラグイン
echo "📦 Tier 2: Developer plugins"
install_plugin Reledia/glow
install_plugin Ape/mediainfo
install_plugin yazi-rs/plugins:chmod
install_plugin yazi-rs/plugins:jump-to-char
echo ""

# Tier 3: 特定用途プラグイン（オプション）
echo "📦 Tier 3: Optional plugins"
install_plugin ndtoan96/ouch
install_plugin KKV9/compress
echo ""

# 依存パッケージの確認
echo "🔍 Checking dependencies..."
echo ""

check_dependency() {
  if command -v "$1" &>/dev/null; then
    echo "✅ $1 is installed"
  else
    echo "⚠️  $1 is not installed (required by $2)"
    echo "   Install: brew install $1"
  fi
}

check_dependency "glow" "glow.yazi"
check_dependency "mediainfo" "mediainfo.yazi"
check_dependency "ffmpeg" "mediainfo.yazi"
check_dependency "ouch" "ouch.yazi"
check_dependency "exiftool" "exifaudio.yazi"

echo ""
echo "✨ Done! Restart yazi to see changes."
echo ""
echo "💡 Tips:"
echo "   - Press '?' in yazi to see all keybindings"
echo "   - Press 'm' to bookmark current directory"
echo "   - Press \"'\" to jump to bookmarks"
echo "   - Press 'cm' to change file permissions"
