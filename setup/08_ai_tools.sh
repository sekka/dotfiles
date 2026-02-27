#!/bin/bash
# AI ツールのセットアップ（Ollama、grepai、fossil-mcp）

# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
log_section "08: AI tools setup"

# --- Ollama LaunchAgent ---

if [[ -f "$HOME/Library/LaunchAgents/com.ollama.serve.plist" ]]; then
  launchctl load "$HOME/Library/LaunchAgents/com.ollama.serve.plist" 2>/dev/null || true
  log_info "Ollama LaunchAgent をロードしました"
  sleep 2
else
  log_warn "Ollama LaunchAgent が見つかりません。先に 03_symlinks.sh を実行してください"
fi

# --- Ollama 埋め込みモデル ---

if is_installed ollama; then
  log_info "Ollama 埋め込みモデルをセットアップしています..."
  ollama pull nomic-embed-text
  log_info "Ollama モデルの準備が完了しました"
else
  log_warn "ollama が見つかりません。先に Brewfile からインストールしてください"
fi

# --- grepai ---

if is_installed grepai; then
  log_info "grepai の準備が完了しました"
else
  log_warn "grepai が見つかりません。先に Brewfile からインストールしてください"
fi

# --- fossil-mcp ---

if is_installed fossil-mcp; then
  log_skip "fossil-mcp はインストール済み（$(fossil-mcp --version 2>/dev/null || echo 'version unknown')）"
else
  log_info "fossil-mcp をインストールしています..."
  FOSSIL_DIR="$HOME/.local/bin"
  mkdir -p "$FOSSIL_DIR"

  OS_NAME="macos"
  ARCH=$(uname -m)
  case "$ARCH" in
  arm64) ARCH_NAME="aarch64" ;;
  x86_64) ARCH_NAME="x86_64" ;;
  *)
    log_warn "非対応のアーキテクチャです: $ARCH"
    ARCH_NAME=""
    ;;
  esac

  if [[ -n $ARCH_NAME ]]; then
    ASSET="fossil-mcp-${OS_NAME}-${ARCH_NAME}.tar.gz"
    DOWNLOAD_URL="https://github.com/yfedoseev/fossil-mcp/releases/latest/download/${ASSET}"

    curl -fsSL "$DOWNLOAD_URL" | tar -xz -C "$FOSSIL_DIR"

    if [[ -f "$FOSSIL_DIR/fossil-mcp" ]]; then
      chmod +x "$FOSSIL_DIR/fossil-mcp"
      log_info "fossil-mcp をインストールしました"
    else
      log_warn "インストールに失敗しました（展開後にバイナリが見つかりません）"
    fi
  fi
fi

# --- agent-browser ---

if is_installed agent-browser; then
  log_skip "agent-browser はインストール済み（$(agent-browser --version 2>/dev/null || echo 'version unknown')）"
  log_info "agent-browser のブラウザをセットアップしています..."
  if agent-browser install; then
    log_info "agent-browser の準備が完了しました"
  else
    log_error "agent-browser install に失敗しました。手動で実行してください: agent-browser install"
  fi
else
  log_warn "agent-browser が見つかりません。mise install を実行してください（npm:agent-browser）"
fi

# --- サマリー ---

log_section "08: 完了"
log_info "次のステップ: cd /path/to/project && grepai init && grepai watch"
