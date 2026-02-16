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

# グローバル変数の初期化
UPDATE_MODE=false
INSTALLED_PLUGINS_FILE="$HOME/.claude/plugins/installed_plugins.json"

# 引数パース
while [[ $# -gt 0 ]]; do
  case "$1" in
  --update)
    UPDATE_MODE=true
    shift
    ;;
  *)
    shift
    ;;
  esac
done

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
  local plugin="$1"

  # jq と installed_plugins.json の両方が必要
  if [[ $JQ_AVAILABLE != "true" ]] || [[ ! -f $INSTALLED_PLUGINS_FILE ]]; then
    return 1 # false（未インストール扱い）
  fi

  # 配列構造に対応: .plugins["name"][0] で存在確認
  jq -e ".plugins[\"$plugin\"][0]" "$INSTALLED_PLUGINS_FILE" >/dev/null 2>&1
  return $?
}

# ヘルパー関数: version フィールドから SHA を抽出
extract_sha_from_version() {
  local version="$1"
  # 12桁以上の16進数文字列ならSHA、それ以外はセマンティックバージョン
  if [[ $version =~ ^[0-9a-f]{12,}$ ]]; then
    echo "$version"
  else
    echo "" # セマンティックバージョン → 比較不可
  fi
}

# プラグインの更新が必要か確認
plugin_needs_update() {
  local plugin="$1"
  local marketplace="${plugin##*@}"

  # マーケットプレイスの installLocation を取得
  local known_marketplaces_file="$HOME/.claude/plugins/known_marketplaces.json"
  if [[ ! -f $known_marketplaces_file ]]; then
    echo "   ⚠️  known_marketplaces.json not found (skipping update check)"
    return 0 # ファイル不明 → 更新必要と判定（安全側）
  fi

  local install_location
  install_location=$(jq -r ".[\"$marketplace\"].installLocation // empty" "$known_marketplaces_file" 2>/dev/null)

  if [[ -z $install_location ]] || [[ ! -d "$install_location/.git" ]]; then
    echo "   ⚠️  Marketplace '$marketplace' not found or invalid (skipping update check)"
    return 0 # マーケットプレイス不明 → 更新必要と判定（安全側）
  fi

  # マーケットプレイス HEAD SHA を取得
  local marketplace_head
  if ! marketplace_head=$(cd "$install_location" && git rev-parse HEAD 2>/dev/null); then
    echo "   ⚠️  Failed to get HEAD for marketplace '$marketplace' (skipping update check)"
    return 0 # HEAD取得失敗 → 更新必要と判定（安全側）
  fi

  # SHA フォーマット検証（40桁の16進数）
  if [[ ! $marketplace_head =~ ^[0-9a-f]{40}$ ]]; then
    echo "   ⚠️  Invalid git SHA format for '$marketplace' (skipping update check)"
    return 0 # SHA不正 → 更新必要と判定（安全側）
  fi

  # インストール済み SHA を取得
  local installed_sha
  installed_sha=$(jq -r ".plugins[\"$plugin\"][0].gitCommitSha // empty" "$INSTALLED_PLUGINS_FILE" 2>/dev/null)

  if [[ -n $installed_sha ]]; then
    # gitCommitSha がある場合: 完全一致確認
    [[ $installed_sha == "$marketplace_head" ]] && return 1 # 更新不要
    return 0                                                # 更新必要
  fi

  # gitCommitSha がない場合: version フィールドから SHA を抽出
  local version
  version=$(jq -r ".plugins[\"$plugin\"][0].version // empty" "$INSTALLED_PLUGINS_FILE" 2>/dev/null)
  local version_sha
  version_sha=$(extract_sha_from_version "$version")

  if [[ -n $version_sha ]]; then
    # version が SHA の場合: プレフィックス一致確認（12桁で比較）
    [[ $marketplace_head == "$version_sha"* ]] && return 1 # 更新不要
    return 0                                               # 更新必要
  fi

  # セマンティックバージョン（1.0.0等）の場合 → 更新スキップ
  echo "   📝  Plugin '$plugin' uses semantic version '$version' (skipping update check)"
  return 1 # 更新不要
}

# マーケットプレースを追加または更新
ensure_marketplace() {
  local name="$1"   # マーケットプレース名（判定用）
  local source="$2" # 追加時のソース（GitHub repo または URL）

  if is_marketplace_added "$name"; then
    if [[ $UPDATE_MODE == "true" ]]; then
      echo "📦 Marketplace '$name' を更新中..."
      claude plugin marketplace update "$name"
    else
      echo "📦 Marketplace '$name' は追加済み（スキップ）"
    fi
  else
    echo "📦 Marketplace '$source' を追加中..."
    claude plugin marketplace add "$source"
  fi
}

# プラグインをインストールまたは更新
ensure_plugin() {
  local plugin="$1" # 形式: plugin@marketplace

  if is_plugin_installed "$plugin"; then
    if [[ $UPDATE_MODE == "true" ]]; then
      if plugin_needs_update "$plugin"; then
        echo "🔌 Plugin '$plugin' を更新中..."
        if ! claude plugin update "$plugin" 2>/dev/null; then
          echo "   ⚠️  プラグインの更新に失敗しました（続行します）"
        else
          echo "   ✅ プラグインを更新しました"
        fi
      else
        echo "🔌 Plugin '$plugin' は最新です（スキップ）"
      fi
    else
      echo "🔌 Plugin '$plugin' はインストール済み（スキップ）"
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
    ((marketplace_count++)) || true
  fi
done < <(jq -r '.extraKnownMarketplaces | to_entries[] | "\(.key)\t\(.value.source.repo // "")\t\(.value.source.url // "")"' "$SETTINGS_FILE")

# enabledPlugins から true のもの全てをインストール
echo ""
echo "🔌 有効化されたプラグインをインストール中..."
while read -r plugin; do
  if [[ -n $plugin ]]; then
    ensure_plugin "$plugin"
    ((plugin_count++)) || true
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
