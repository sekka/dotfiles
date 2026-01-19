#!/bin/bash
# macOS設定変更後のスナップショットを取得し、差分をpdefで生成
# pdefがインストールされていない場合は、diffで代替

set -e

SNAPSHOT_DIR="${HOME}/.dotfiles-macos-snapshots"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
AFTER_FILE="${SNAPSHOT_DIR}/after_${TIMESTAMP}.txt"
OUTPUT_DIR="${HOME}/Desktop"

echo "=== macOS設定のスナップショット取得（変更後） ==="
echo ""

# 最新のbeforeファイルを検索
LATEST_BEFORE=$(find "${SNAPSHOT_DIR}" -name "before_*.txt" -type f -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)

if [ -z "$LATEST_BEFORE" ]; then
  echo "❌ エラー: 変更前のスナップショットが見つかりません"
  echo "   先に 'mise run macos:snapshot-before' を実行してください"
  exit 1
fi

echo "変更前のスナップショット: $(basename "$LATEST_BEFORE")"
echo ""

# スナップショット取得
echo "スナップショットを取得中..."
defaults read >"$AFTER_FILE"
echo "✓ スナップショット保存: $AFTER_FILE"
echo ""

# pdefの存在確認
if command -v pdef &>/dev/null; then
  echo "pdefを使用して差分を生成中..."
  DIFF_FILE="${OUTPUT_DIR}/macos_settings_diff_${TIMESTAMP}.sh"

  pdef "$LATEST_BEFORE" "$AFTER_FILE" >"$DIFF_FILE"

  if [ -s "$DIFF_FILE" ]; then
    echo "✅ 差分スクリプト生成完了: $DIFF_FILE"
    echo ""
    echo "📝 生成されたスクリプトの内容:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cat "$DIFF_FILE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "💡 このスクリプトを setup/05_macos_defaults.sh に追加できます"
  else
    echo "ℹ️  変更は検出されませんでした"
    rm "$DIFF_FILE"
  fi
else
  echo "⚠️  pdefがインストールされていません。diffで代替します..."
  DIFF_FILE="${OUTPUT_DIR}/macos_settings_diff_${TIMESTAMP}.txt"

  diff "$LATEST_BEFORE" "$AFTER_FILE" >"$DIFF_FILE" || true

  if [ -s "$DIFF_FILE" ]; then
    echo "✅ 差分ファイル生成完了: $DIFF_FILE"
    echo ""
    echo "⚠️  注意: diffの結果は手動で解釈する必要があります"
    echo ""
    echo "💡 pdefをインストールすると、defaults writeコマンドを自動生成できます:"
    echo "   git clone https://github.com/yammerjp/pdef.git"
    echo "   cd pdef && make && sudo cp bin/pdef /usr/local/bin/"
  else
    echo "ℹ️  変更は検出されませんでした"
    rm "$DIFF_FILE"
  fi
fi

echo ""
echo "🗑️  スナップショットファイルを削除する場合:"
echo "   rm -rf $SNAPSHOT_DIR"
echo ""
