#!/bin/bash
# Claude Code 公式版のインストールとプラグインセットアップ

# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
log_section "06: Claude Code setup"

# --- Claude Code インストール ---

# Homebrew 版が残っている場合はアンインストール
if brew list --cask claude-code &>/dev/null; then
  log_warn "Homebrew 版 Claude Code を検出しました。公式版に移行するためアンインストールします..."
  brew uninstall --cask claude-code
  log_info "Homebrew 版をアンインストールしました"
fi

# 公式版インストール
if [[ -f "$HOME/.local/bin/claude" ]]; then
  log_skip "Claude Code 公式版は既にインストール済み"
  "$HOME/.local/bin/claude" --version
else
  log_info "Claude Code 公式版をインストールしています..."
  curl -fsSL https://claude.ai/install.sh | bash

  if [[ -f "$HOME/.local/bin/claude" ]]; then
    log_info "Claude Code 公式版のインストールが完了しました"
    "$HOME/.local/bin/claude" --version
  else
    log_error "インストールに失敗しました"
    exit 1
  fi
fi

# PATH 確認
if ! is_installed claude; then
  log_warn "claude コマンドが PATH に見つかりません。新しいシェルセッションを開くか source ~/.zshrc を実行してください"
fi

# --- プラグイン管理 ---

UPDATE_MODE=false
INSTALLED_PLUGINS_FILE="$HOME/.claude/plugins/installed_plugins.json"

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

if ! is_installed jq; then
  log_error "jq がインストールされていません。セットアップを中断します（brew install jq）"
  exit 1
fi

# マーケットプレースが追加済みか確認
is_marketplace_added() {
  local name="$1"
  local json_file="$HOME/.claude/plugins/known_marketplaces.json"

  if [[ -f $json_file ]]; then
    jq -e ".[\"$name\"]" "$json_file" &>/dev/null
    return $?
  fi
  return 1
}

# プラグインがインストール済みか確認
is_plugin_installed() {
  local plugin="$1"

  if [[ ! -f $INSTALLED_PLUGINS_FILE ]]; then
    return 1
  fi

  jq -e ".plugins[\"$plugin\"][0]" "$INSTALLED_PLUGINS_FILE" &>/dev/null
  return $?
}

# version フィールドから SHA を抽出
extract_sha_from_version() {
  local version="$1"
  if [[ $version =~ ^[0-9a-f]{12,}$ ]]; then
    echo "$version"
  else
    echo ""
  fi
}

# プラグインの更新が必要か確認
plugin_needs_update() {
  local plugin="$1"
  local marketplace="${plugin##*@}"

  local known_marketplaces_file="$HOME/.claude/plugins/known_marketplaces.json"
  if [[ ! -f $known_marketplaces_file ]]; then
    log_warn "known_marketplaces.json が見つかりません（更新チェックをスキップ）"
    return 0
  fi

  local install_location
  install_location=$(jq -r ".[\"$marketplace\"].installLocation // empty" "$known_marketplaces_file" 2>/dev/null)

  if [[ -z $install_location ]] || [[ ! -d "$install_location/.git" ]]; then
    log_warn "マーケットプレース '$marketplace' が無効です（更新チェックをスキップ）"
    return 0
  fi

  local marketplace_head
  if ! marketplace_head=$(cd "$install_location" && git rev-parse HEAD 2>/dev/null); then
    log_warn "マーケットプレース '$marketplace' の HEAD 取得に失敗しました（更新チェックをスキップ）"
    return 0
  fi

  if [[ ! $marketplace_head =~ ^[0-9a-f]{40}$ ]]; then
    log_warn "不正な git SHA です（更新チェックをスキップ）"
    return 0
  fi

  local installed_sha
  installed_sha=$(jq -r ".plugins[\"$plugin\"][0].gitCommitSha // empty" "$INSTALLED_PLUGINS_FILE" 2>/dev/null)

  if [[ -n $installed_sha ]]; then
    [[ $installed_sha == "$marketplace_head" ]] && return 1
    return 0
  fi

  local version
  version=$(jq -r ".plugins[\"$plugin\"][0].version // empty" "$INSTALLED_PLUGINS_FILE" 2>/dev/null)
  local version_sha
  version_sha=$(extract_sha_from_version "$version")

  if [[ -n $version_sha ]]; then
    [[ $marketplace_head == "$version_sha"* ]] && return 1
    return 0
  fi

  log_info "プラグイン '$plugin' はセマンティックバージョン '$version' を使用しています（更新チェックをスキップ）"
  return 1
}

# マーケットプレースを追加または更新
ensure_marketplace() {
  local name="$1"
  local source="$2"

  if is_marketplace_added "$name"; then
    if [[ $UPDATE_MODE == "true" ]]; then
      log_info "マーケットプレース '$name' を更新しています..."
      claude plugin marketplace update "$name"
    else
      log_skip "マーケットプレース '$name' は追加済み"
    fi
  else
    log_info "マーケットプレース '$source' を追加しています..."
    claude plugin marketplace add "$source"
  fi
}

# プラグインをインストールまたは更新
ensure_plugin() {
  local plugin="$1"

  if is_plugin_installed "$plugin"; then
    if [[ $UPDATE_MODE == "true" ]]; then
      if plugin_needs_update "$plugin"; then
        log_info "プラグイン '$plugin' を更新しています..."
        if ! claude plugin update "$plugin" 2>/dev/null; then
          log_warn "プラグインの更新に失敗しました（続行します）"
        else
          log_info "プラグインを更新しました: $plugin"
        fi
      else
        log_skip "プラグイン '$plugin' は最新です"
      fi
    else
      log_skip "プラグイン '$plugin' はインストール済み"
    fi
  else
    log_info "プラグイン '$plugin' をインストールしています..."
    if ! claude plugin install "$plugin" 2>/dev/null; then
      log_warn "プラグインのインストールに失敗しました（続行します）"
    else
      log_info "プラグインをインストールしました: $plugin"
    fi
  fi
}

SETTINGS_FILE="$HOME/dotfiles/home/.claude/settings.json"

if [[ ! -f $SETTINGS_FILE ]]; then
  log_error "settings.json が見つかりません: $SETTINGS_FILE"
  exit 1
fi

# --- マーケットプレースとプラグインのセットアップ ---

marketplace_count=0
plugin_count=0

log_info "マーケットプレースをセットアップしています..."
while IFS=$'\t' read -r name repo url; do
  local_source="${repo:-$url}"
  if [[ -n $local_source ]]; then
    ensure_marketplace "$name" "$local_source"
    marketplace_count=$((marketplace_count + 1)) || true
  fi
done < <(jq -r '.extraKnownMarketplaces | to_entries[] | "\(.key)\t\(.value.source.repo // "")\t\(.value.source.url // "")"' "$SETTINGS_FILE")

log_info "有効化されたプラグインをインストールしています..."
while read -r plugin; do
  if [[ -n $plugin ]]; then
    ensure_plugin "$plugin"
    plugin_count=$((plugin_count + 1)) || true
  fi
done < <(jq -r '.enabledPlugins | to_entries[] | select(.value == true) | .key' "$SETTINGS_FILE")

# --- サードパーティスキル管理 ---

# "リポジトリ スキル名" の形式で宣言
THIRD_PARTY_SKILLS=(
  "yoshiko-pg/difit difit-review"
)

is_skill_installed() {
  [[ -d "$HOME/.claude/skills/$1" ]]
}

ensure_skill() {
  local repo="$1"
  local skill="$2"

  if is_skill_installed "$skill"; then
    if [[ $UPDATE_MODE == "true" ]]; then
      log_info "スキル '$skill' を更新しています..."
      if ! npx -y skills add "$repo" --skill "$skill" -a claude-code -g -y 2>/dev/null; then
        log_warn "スキルの更新に失敗しました: $skill（続行します）"
      else
        log_info "スキルを更新しました: $skill"
      fi
    else
      log_skip "スキル '$skill' はインストール済み"
    fi
  else
    log_info "スキル '$skill' をインストールしています..."
    if ! npx -y skills add "$repo" --skill "$skill" -a claude-code -g -y 2>/dev/null; then
      log_warn "スキルのインストールに失敗しました: $skill（続行します）"
    else
      log_info "スキルをインストールしました: $skill"
    fi
  fi
}

skill_count=0

log_info "サードパーティスキルをセットアップしています..."
for entry in "${THIRD_PARTY_SKILLS[@]}"; do
  read -r repo skill <<<"$entry"
  if [[ -n $repo ]] && [[ -n $skill ]]; then
    ensure_skill "$repo" "$skill"
    skill_count=$((skill_count + 1)) || true
  fi
done

# --- サマリー ---

log_section "06: 完了"
log_info "マーケットプレース: $marketplace_count 件 / プラグイン: $plugin_count 件 / スキル: $skill_count 件"

# --- qmd インデックス（フロントエンドナレッジのセマンティック検索） ---
# qmd v2 では統一インデックス（~/.cache/qmd/index.sqlite）にコレクションを登録する

# qmd CLI のインストール確認（bun bin が PATH にない可能性があるので明示的に拡張）
export PATH="$HOME/.cache/.bun/bin:$PATH"

if ! is_installed qmd; then
  log_info "qmd CLI をインストールしています..."
  if is_installed bun; then
    bun install -g @tobilu/qmd || log_warn "qmd インストールに失敗しました（続行します）"
  elif is_installed npm; then
    npm install -g @tobilu/qmd || log_warn "qmd インストールに失敗しました（続行します）"
  else
    log_warn "bun / npm が見つかりません。qmd インストールをスキップします"
  fi
fi

# コレクション登録と埋め込み生成（setup-qmd.sh が冪等性を担保）
if is_installed qmd; then
  log_info "qmd フロントエンドコレクションをセットアップしています..."
  "$HOME/dotfiles/scripts/setup-qmd.sh" || log_warn "qmd セットアップに失敗しました（続行します）"
fi
