#!/bin/bash
# shellcheck source=../setup/lib/common.sh
source "$(dirname "$0")/../setup/lib/common.sh"

INDEX_PATH="${QMD_FRONTEND_INDEX:-$HOME/.local/share/qmd/frontend.sqlite}"
INDEX_DIR="$(dirname "$INDEX_PATH")"
SKILL_DIR="$HOME/.claude/skills/user-managing-frontend-knowledge"

# qmd インストール確認
if ! is_installed qmd; then
  log_error "qmd がインストールされていません。"
  echo "  npm install -g @tobilu/qmd"
  echo "  または: bun install -g @tobilu/qmd"
  exit 1
fi

# 冪等性: 既存インデックスがあればスキップ
if [ -f "$INDEX_PATH" ]; then
  log_skip "インデックスは既に存在します: $INDEX_PATH"
  echo "   差分更新: qmd-fe embed"
  echo "   再生成:   rm \"$INDEX_PATH\" && $0"
  exit 0
fi

mkdir -p "$INDEX_DIR"

# インデックス生成
log_info "フロントエンドナレッジをインデックス中..."
INDEX_PATH="$INDEX_PATH" qmd index "$SKILL_DIR/knowledge" -c frontend

# 埋め込みベクター生成（失敗時は不完全な DB を削除）
log_info "埋め込みベクター生成中（初回は数分かかります）..."
INDEX_PATH="$INDEX_PATH" qmd embed || {
  log_error "埋め込み生成に失敗しました。不完全な DB を削除します。"
  rm -f "$INDEX_PATH"
  exit 1
}

log_info "完了: $INDEX_PATH"
echo '   使用方法: qmd-fe query "CSS animation"'
