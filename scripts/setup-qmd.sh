#!/bin/bash
# qmd v2.x 用フロントエンドナレッジセットアップ
# - knowledge/ ディレクトリを 'frontend' コレクションとして統一インデックスに登録
# - 埋め込みベクターを生成
#
# qmd v2 では INDEX_PATH 環境変数は廃止され、~/.cache/qmd/index.sqlite を共有
# コレクション名で論理分離する設計

# shellcheck source=../setup/lib/common.sh
source "$(dirname "$0")/../setup/lib/common.sh"

COLLECTION_NAME="frontend"
KNOWLEDGE_DIR="$HOME/.claude/skills/user-managing-frontend-knowledge/knowledge"

# qmd インストール確認
if ! is_installed qmd; then
  log_error "qmd がインストールされていません。"
  echo "  bun install -g @tobilu/qmd"
  echo "  または: npm install -g @tobilu/qmd"
  exit 1
fi

# knowledge ディレクトリ確認
if [[ ! -d $KNOWLEDGE_DIR ]]; then
  log_error "knowledge ディレクトリが見つかりません: $KNOWLEDGE_DIR"
  echo "  setup/04_symlinks.sh を先に実行してください"
  exit 1
fi

# 冪等性: 既にコレクションが登録済みならスキップ
if qmd collection list 2>/dev/null | grep -q "^${COLLECTION_NAME} "; then
  log_skip "コレクション '$COLLECTION_NAME' は既に登録されています"
  echo "   再インデックス: qmd update"
  echo "   再埋め込み:     qmd embed"
  echo "   完全リセット:   qmd collection remove $COLLECTION_NAME && $0"
  exit 0
fi

# コレクション追加（インデックス生成も同時に行われる）
log_info "コレクション '$COLLECTION_NAME' を追加しています..."
if ! qmd collection add "$KNOWLEDGE_DIR" --name "$COLLECTION_NAME"; then
  log_error "コレクション追加に失敗しました"
  exit 1
fi

# 埋め込みベクター生成
log_info "埋め込みベクター生成中（初回は数分かかります）..."
if ! qmd embed; then
  log_error "埋め込み生成に失敗しました。コレクションを削除します。"
  qmd collection remove "$COLLECTION_NAME" 2>/dev/null || true
  exit 1
fi

log_info "完了: コレクション '$COLLECTION_NAME' のインデックスと埋め込みが利用可能です"
echo '   使用方法: qmd-fe "CSS animation performance"'
