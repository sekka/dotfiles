#!/bin/bash
# =============================================================================
# AI Tools Setup Script
# =============================================================================
#
# このスクリプトは以下のAIツールをセットアップします：
#   - Ollama: ローカルLLMランタイム
#   - grepai: セマンティックコード検索ツール
#   - fossil-mcp: 静的解析ツール（デッドコード・重複コード検出）
#
# =============================================================================
# 使い方
# =============================================================================
#
# 【初回セットアップ後の手順】
#
# 1. Ollama を起動（バックグラウンド）
#    $ ollama serve &
#
# 2. プロジェクトで grepai を初期化
#    $ cd /path/to/project
#    $ grepai init
#    $ grepai watch      # インデックス化デーモンを起動
#
# 3. セマンティック検索（自然言語でコードを検索）
#    $ grepai search "ユーザー認証のロジック"
#    $ grepai search "エラーハンドリング"
#    $ grepai search "データベース接続"
#
# 4. コールグラフ（関数の呼び出し関係を調査）
#    $ grepai trace callers "HandleRequest"  # 呼び出し元を探索
#    $ grepai trace callees "SaveUser"       # 呼び出し先を探索
#
# 【エイリアス（50_aliases.zsh で定義）】
#    gai  = grepai
#    gais = grepai search
#    gait = grepai trace
#    gaiw = grepai watch
#
# 【既存ツールとの使い分け】
#    - 正確なテキスト検索 → rg / ag
#    - ファイル名検索     → fd
#    - 意味的な検索       → grepai search
#    - 関数の呼び出し関係 → grepai trace
#
# 【Claude Code との連携】
#    MCP サーバーとして統合されているため、Claude Code が
#    自動的に grepai を使用してコードベースを探索できます。
#
# 【注意事項】
#    - .grepai/ ディレクトリがプロジェクトに作成される
#      → .gitignore に追加推奨
#    - Ollama は手動起動（ollama serve）
#    - grepai は grepai update で自己更新可能
#
# =============================================================================

set -euo pipefail

echo "=== AI Tools Setup ==="

# Ollama LaunchAgent をロード
if [[ -f "$HOME/Library/LaunchAgents/com.ollama.serve.plist" ]]; then
  launchctl load "$HOME/Library/LaunchAgents/com.ollama.serve.plist" 2>/dev/null || true
  echo "✓ Ollama LaunchAgent loaded"
  sleep 2 # Ollama 起動待ち
else
  echo "⚠ Ollama LaunchAgent not found. Run setup/03_symlinks.sh first."
fi

# Ollama モデルのセットアップ
if command -v ollama >/dev/null 2>&1; then
  echo "Setting up Ollama embedding model..."
  ollama pull nomic-embed-text
  echo "✓ Ollama model ready"
else
  echo "⚠ Ollama not found. Run 'brew bundle --file=setup/Brewfile' first."
fi

# grepai（Brewfile でインストール済み前提）
if command -v grepai >/dev/null 2>&1; then
  echo "✓ grepai ready"
else
  echo "⚠ grepai not found. Run 'brew bundle --file=setup/Brewfile' first."
fi

# fossil-mcp（静的解析 MCP サーバー: デッドコード・重複コード検出）
if command -v fossil-mcp >/dev/null 2>&1; then
  echo "✓ fossil-mcp ready ($(fossil-mcp --version 2>/dev/null || echo 'version unknown'))"
else
  echo "📥 Installing fossil-mcp..."
  FOSSIL_DIR="$HOME/.local/bin"
  mkdir -p "$FOSSIL_DIR"

  # OS とアーキテクチャ検出（公式スクリプトと同じロジック）
  OS_NAME="macos" # macOS 専用（Darwin）
  ARCH=$(uname -m)
  case "$ARCH" in
  arm64) ARCH_NAME="aarch64" ;;
  x86_64) ARCH_NAME="x86_64" ;;
  *)
    echo "⚠ Unsupported architecture: $ARCH"
    ARCH_NAME=""
    ;;
  esac

  if [[ -n ${ARCH_NAME} ]]; then
    ASSET="fossil-mcp-${OS_NAME}-${ARCH_NAME}.tar.gz"
    DOWNLOAD_URL="https://github.com/yfedoseev/fossil-mcp/releases/latest/download/${ASSET}"

    # ダウンロードと展開
    curl -fsSL "$DOWNLOAD_URL" | tar -xz -C "$FOSSIL_DIR"

    if [[ -f "$FOSSIL_DIR/fossil-mcp" ]]; then
      chmod +x "$FOSSIL_DIR/fossil-mcp"
      echo "✓ fossil-mcp installed"
    else
      echo "⚠ Installation failed: binary not found after extraction"
    fi
  fi
fi

echo ""
echo "=== AI Tools Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Ollama is running in background via LaunchAgent"
echo "  2. Initialize in project: cd /path/to/project && grepai init && grepai watch"
echo '  3. Search: grepai search "your query"'
echo ""
