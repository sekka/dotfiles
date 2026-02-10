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

# Ollama LaunchAgent をロード
if [[ -f "$HOME/Library/LaunchAgents/com.ollama.serve.plist" ]]; then
  launchctl load "$HOME/Library/LaunchAgents/com.ollama.serve.plist" 2>/dev/null || true
  echo "✓ Ollama LaunchAgent loaded"
  sleep 2 # Ollama 起動待ち
else
  echo "⚠ Ollama LaunchAgent not found. Run setup/02_home.sh first."
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

echo ""
echo "=== AI Tools Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Ollama is running in background via LaunchAgent"
echo "  2. Initialize in project: cd /path/to/project && grepai init && grepai watch"
echo '  3. Search: grepai search "your query"'
echo ""
