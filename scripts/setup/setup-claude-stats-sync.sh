#!/bin/bash

###############################################################################
# Claude Code Statistics Auto-Sync Setup
#
# このスクリプトは、Claude Code統計をiCloud Driveに定期的に自動同期する
# launchdサービスをセットアップします
#
# 使用方法:
#   bash ~/dotfiles/scripts/setup/setup-claude-stats-sync.sh
#
# アンインストール:
#   bash ~/dotfiles/scripts/setup/setup-claude-stats-sync.sh --uninstall
###############################################################################

set -e

# =============================================================================
# Configuration
# =============================================================================

PLIST_SOURCE="${HOME}/dotfiles/scripts/setup/com.user.claude-stats-sync.plist"
PLIST_DEST="${HOME}/Library/LaunchAgents/com.user.claude-stats-sync.plist"
LOG_FILE="/var/log/claude-stats-sync.log"
LABEL="com.user.claude-stats-sync"

# =============================================================================
# Colors for output
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# Functions
# =============================================================================

print_header() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

check_requirements() {
  print_header "必要な環境確認"

  # Check if plist source exists
  if [[ ! -f $PLIST_SOURCE ]]; then
    print_error "plistファイルが見つかりません: $PLIST_SOURCE"
    exit 1
  fi
  print_success "plistファイル存在確認"

  # Check if sync script exists
  SYNC_SCRIPT="${HOME}/dotfiles/scripts/development/sync-claude-stats-to-icloud.ts"
  if [[ ! -f $SYNC_SCRIPT ]]; then
    print_error "同期スクリプトが見つかりません: $SYNC_SCRIPT"
    exit 1
  fi
  print_success "同期スクリプト存在確認"

  # Check if Bun is installed
  if ! command -v bun &>/dev/null; then
    print_error "Bunがインストールされていません"
    print_info "Bunをインストールしてください: curl -fsSL https://bun.sh/install | bash"
    exit 1
  fi
  print_success "Bunインストール確認"

  # Check iCloud Drive
  ICLOUD_DIR="${HOME}/Library/Mobile Documents/com~apple~CloudDocs"
  if [[ ! -d $ICLOUD_DIR ]]; then
    print_warning "iCloud Driveが見つかりません"
    print_info "iCloud Driveにログインしてください"
  else
    print_success "iCloud Drive確認"
  fi

  # Check Claude Code stats
  STATS_CACHE="${HOME}/.claude/stats-cache.json"
  if [[ ! -f $STATS_CACHE ]]; then
    print_warning "Claude Codeの統計がまだ生成されていません"
    print_info "Claude Codeを使用してください"
  else
    print_success "Claude Code統計確認"
  fi
}

install_service() {
  print_header "launchdサービスをインストール中"

  # Create LaunchAgents directory if it doesn't exist
  mkdir -p "${HOME}/Library/LaunchAgents"
  print_success "LaunchAgentsディレクトリ作成"

  # Copy plist file
  cp "$PLIST_SOURCE" "$PLIST_DEST"
  print_success "plistファイルをコピー"

  # Set proper permissions
  chmod 644 "$PLIST_DEST"
  print_success "権限設定"

  # Load the service
  launchctl load "$PLIST_DEST"
  print_success "launchdサービスをロード"

  # Verify it's loaded
  if launchctl list | grep -q "$LABEL"; then
    print_success "サービスロード確認"
  else
    print_warning "サービスロード確認に失敗しました"
  fi
}

uninstall_service() {
  print_header "launchdサービスをアンインストール中"

  # Check if service is loaded
  if launchctl list | grep -q "$LABEL"; then
    launchctl unload "$PLIST_DEST"
    print_success "launchdサービスをアンロード"
  else
    print_info "サービスは既にアンロードされています"
  fi

  # Remove plist file
  if [[ -f $PLIST_DEST ]]; then
    rm "$PLIST_DEST"
    print_success "plistファイルを削除"
  fi

  print_success "アンインストール完了"
}

show_status() {
  print_header "サービス状態確認"

  if launchctl list | grep -q "$LABEL"; then
    print_success "サービス状態: アクティブ"

    # Show last run time
    if [[ -f $LOG_FILE ]]; then
      print_info "最終実行ログ:"
      tail -n 5 "$LOG_FILE" | sed 's/^/  /'
    fi
  else
    print_warning "サービス状態: 非アクティブ"
  fi
}

show_usage() {
  cat <<EOF
${BLUE}Claude Code Statistics Auto-Sync Setup${NC}

使用方法:
  bash ~/dotfiles/scripts/setup/setup-claude-stats-sync.sh [COMMAND]

コマンド:
  install      launchdサービスをインストール（デフォルト）
  uninstall    launchdサービスをアンインストール
  status       サービス状態を確認
  test         同期スクリプトをテスト実行
  logs         ログを表示
  help         このヘルプを表示

設定:
  自動同期間隔: 1時間
  ログファイル: $LOG_FILE
  plistファイル: $PLIST_DEST

例:
  # インストール
  bash ~/dotfiles/scripts/setup/setup-claude-stats-sync.sh install

  # ステータス確認
  bash ~/dotfiles/scripts/setup/setup-claude-stats-sync.sh status

  # アンインストール
  bash ~/dotfiles/scripts/setup/setup-claude-stats-sync.sh uninstall

EOF
}

test_sync() {
  print_header "同期スクリプトをテスト実行"

  if bun ~/dotfiles/scripts/development/sync-claude-stats-to-icloud.ts --check-icloud; then
    print_success "テスト実行成功"
  else
    print_error "テスト実行失敗"
    exit 1
  fi
}

show_logs() {
  print_header "ログファイル表示"

  if [[ ! -f $LOG_FILE ]]; then
    print_info "ログファイルがまだ生成されていません"
    return
  fi

  tail -n 50 "$LOG_FILE"
}

# =============================================================================
# Main Logic
# =============================================================================

main() {
  local command="${1:-install}"

  case "$command" in
  install)
    check_requirements
    install_service
    show_status
    print_success "インストール完了！"
    print_info "自動同期は1時間ごとに実行されます"
    ;;
  uninstall)
    uninstall_service
    ;;
  status)
    show_status
    ;;
  test)
    test_sync
    ;;
  logs)
    show_logs
    ;;
  help | --help | -h)
    show_usage
    ;;
  *)
    print_error "不明なコマンド: $command"
    show_usage
    exit 1
    ;;
  esac
}

# Run main function
main "$@"
