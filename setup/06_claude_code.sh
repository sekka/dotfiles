#!/bin/bash
# Claude Code 公式インストールスクリプト
# https://code.claude.com/docs/en/getting-started

set -e

echo "# ======================================================================================="
echo "# Claude Code 公式版への移行"
echo "# ======================================================================================="

# Homebrew版がインストールされているか確認
if brew list --cask claude-code &>/dev/null; then
  echo "⚠️  Homebrew版 Claude Code が検出されました"
  echo "   公式版に移行するため、アンインストールします..."
  brew uninstall --cask claude-code
  echo "✅ Homebrew版をアンインストールしました"
else
  echo "ℹ️  Homebrew版 Claude Code は未インストールです"
fi

# 公式版がすでにインストールされているか確認
if [[ -f "$HOME/.local/bin/claude" ]]; then
  echo "✅ Claude Code 公式版は既にインストールされています"
  "$HOME/.local/bin/claude" --version
else
  echo "📥 Claude Code 公式版をインストールしています..."
  curl -fsSL https://claude.ai/install.sh | bash

  if [[ -f "$HOME/.local/bin/claude" ]]; then
    echo "✅ Claude Code 公式版のインストールが完了しました"
    "$HOME/.local/bin/claude" --version
  else
    echo "❌ インストールに失敗しました"
    exit 1
  fi
fi

# PATHの設定を確認（コマンド実行可能性で判定）
if ! command -v claude &>/dev/null; then
  echo ""
  echo "⚠️  警告: claude コマンドがPATHに見つかりません"
  echo "   新しいシェルセッションを開くか、以下を実行してPATHを再読み込みしてください:"
  echo ""
  echo "   source ~/.zshrc"
  echo ""
fi

# ======================
# プラグイン管理
# ======================

# jq が利用可能か確認
if ! command -v jq &>/dev/null; then
  echo "⚠️  警告: jq がインストールされていません。プラグインの更新検出をスキップします。"
  echo "   インストール方法: brew install jq"
  JQ_AVAILABLE=false
else
  JQ_AVAILABLE=true
fi

# マーケットプレースが追加済みか確認
is_marketplace_added() {
  local name="$1"
  local json_file="$HOME/.claude/plugins/known_marketplaces.json"

  if [[ $JQ_AVAILABLE == "true" ]] && [[ -f $json_file ]]; then
    jq -e ".[\"$name\"]" "$json_file" >/dev/null 2>&1
    return $?
  fi
  return 1
}

# プラグインがインストール済みか確認
is_plugin_installed() {
  local plugin="$1" # 形式: plugin@marketplace
  # claude plugin list の出力から、プラグイン名を検索
  # "❯ " プレフィックスを含めることで、誤マッチを防ぐ
  claude plugin list 2>/dev/null | grep -qF "❯ $plugin"
  return $?
}

# マーケットプレースを追加または更新
ensure_marketplace() {
  local name="$1"   # マーケットプレース名（判定用）
  local source="$2" # 追加時のソース（GitHub repo または URL）

  if is_marketplace_added "$name"; then
    echo "📦 Marketplace '$name' を更新中..."
    claude plugin marketplace update "$name"
  else
    echo "📦 Marketplace '$source' を追加中..."
    claude plugin marketplace add "$source"
  fi
}

# プラグインをインストールまたは更新
ensure_plugin() {
  local plugin="$1" # 形式: plugin@marketplace

  if is_plugin_installed "$plugin"; then
    echo "🔌 Plugin '$plugin' を更新中..."
    if ! claude plugin update "$plugin" 2>/dev/null; then
      echo "   ⚠️  プラグインの更新に失敗しました（続行します）"
    else
      echo "   ✅ プラグインを更新しました"
    fi
  else
    echo "🔌 Plugin '$plugin' をインストール中..."
    if ! claude plugin install "$plugin" 2>/dev/null; then
      echo "   ⚠️  プラグインのインストールに失敗しました（続行します）"
    else
      echo "   ✅ プラグインをインストールしました"
    fi
  fi
}

# settings.json のパス
SETTINGS_FILE="$HOME/dotfiles/home/.claude/settings.json"

if [[ ! -f $SETTINGS_FILE ]]; then
  echo "❌ エラー: settings.json が見つかりません: $SETTINGS_FILE"
  exit 1
fi

echo ""
echo "# ======================================================================================="
echo "# マーケットプレースとプラグインの自動セットアップ"
echo "# ======================================================================================="

# カウンタ
marketplace_count=0
plugin_count=0

# extraKnownMarketplaces から自動取得してセットアップ
echo ""
echo "📦 マーケットプレースをセットアップ中..."
while IFS=$'\t' read -r name repo url; do
  # repo または url のいずれかが設定されている
  source="${repo:-$url}"
  if [[ -n $source ]]; then
    ensure_marketplace "$name" "$source"
    ((marketplace_count++))
  fi
done < <(jq -r '.extraKnownMarketplaces | to_entries[] | "\(.key)\t\(.value.source.repo // "")\t\(.value.source.url // "")"' "$SETTINGS_FILE")

# enabledPlugins から true のもの全てをインストール
echo ""
echo "🔌 有効化されたプラグインをインストール中..."
while read -r plugin; do
  if [[ -n $plugin ]]; then
    ensure_plugin "$plugin"
    ((plugin_count++))
  fi
done < <(jq -r '.enabledPlugins | to_entries[] | select(.value == true) | .key' "$SETTINGS_FILE")

echo ""
echo "# ======================================================================================="
echo "# セットアップ完了サマリー"
echo "# ======================================================================================="
echo "   📦 マーケットプレース: $marketplace_count 個"
echo "   🔌 プラグイン: $plugin_count 個"
echo ""
echo "✅ すべてのプラグインとマーケットプレースのセットアップが完了しました"
