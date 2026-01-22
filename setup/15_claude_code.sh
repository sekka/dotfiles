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

# PATHの設定を確認
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
  echo ""
  echo "⚠️  警告: ~/.local/bin がPATHに含まれていません"
  echo "   シェル設定ファイル（~/.zshrc など）に以下を追加してください:"
  echo ""
  echo '   export PATH="$HOME/.local/bin:$PATH"'
  echo ""
fi

echo ""
echo "# ======================================================================================="
echo "# インストール完了"
echo "# ======================================================================================="
echo ""
echo "📝 次のステップ:"
echo '   1. シェルを再起動: exec $SHELL -l'
echo "   2. 動作確認: claude --version"
echo "   3. セットアップ: claude doctor"
echo ""
echo "💡 公式版の利点:"
echo "   - 自動更新機能が有効（バックグラウンドで最新版に自動更新）"
echo "   - 公式サポート対象"
echo "   - インストール先: ~/.local/bin/claude"
echo ""
