#!/bin/bash
# =============================================================================
# AI Tools Setup Script
# =============================================================================
#
# このスクリプトは以下のAIツールをセットアップします：
#   - Ollama: ローカルLLMランタイム
#   - grepai: セマンティックコード検索ツール
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

# Ollama モデルのセットアップ
if command -v ollama >/dev/null 2>&1; then
  echo "Setting up Ollama embedding model..."
  ollama pull nomic-embed-text
  echo "✓ Ollama model ready"
else
  echo "⚠ Ollama not found. Run 'brew bundle' first."
fi

# grepai のインストール
if ! command -v grepai >/dev/null 2>&1; then
  echo "Installing grepai..."
  curl -sSL https://raw.githubusercontent.com/yoanbernabeu/grepai/main/install.sh | sh
  echo "✓ grepai installed"
else
  echo "grepai already installed. Checking for updates..."
  grepai update 2>/dev/null || echo "✓ grepai is up to date"
fi

echo ""
echo "=== AI Tools Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Start Ollama: ollama serve &"
echo "  2. Initialize in project: cd /path/to/project && grepai init && grepai watch"
echo '  3. Search: grepai search "your query"'
echo ""
