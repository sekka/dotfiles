#!/bin/bash
# macOS設定変更前のスナップショットを取得
# pdefで差分を取るために使用します

set -e

SNAPSHOT_DIR="${HOME}/.dotfiles-macos-snapshots"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BEFORE_FILE="${SNAPSHOT_DIR}/before_${TIMESTAMP}.txt"

# ディレクトリ作成
mkdir -p "$SNAPSHOT_DIR"

echo "=== macOS設定のスナップショット取得（変更前） ==="
echo ""

# スナップショット取得
echo "スナップショットを取得中..."
defaults read >"$BEFORE_FILE"

echo "✓ スナップショット保存: $BEFORE_FILE"
echo ""
echo "📝 次の手順:"
echo "   1. システム環境設定で設定を変更してください"
echo "   2. 変更が完了したら、以下のコマンドを実行してください:"
echo "      mise run macos:snapshot-after"
echo ""
echo "💡 現在のスナップショットファイル名をメモしてください:"
echo "   before_${TIMESTAMP}.txt"
echo ""
