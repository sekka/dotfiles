#!/bin/bash
# qmd v2.x 用フロントエンドナレッジセットアップ
# knowledge/ を 'frontend' コレクションとして統一インデックス（~/.cache/qmd/index.sqlite）に登録し、
# 埋め込みベクターを生成する。qmd 未インストール時は bun/npm で導入する。

# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"

COLLECTION_NAME="frontend"
KNOWLEDGE_DIR="$HOME/.claude/skills/user-fe-knowledge/knowledge"

export PATH="$HOME/.bun/bin:$HOME/.cache/.bun/bin:$PATH"

if ! is_installed qmd; then
  log_info "qmd CLI をインストールしています..."
  if is_installed bun; then
    bun install -g @tobilu/qmd || {
      log_error "qmd インストールに失敗しました"
      exit 1
    }
  elif is_installed npm; then
    npm install -g @tobilu/qmd || {
      log_error "qmd インストールに失敗しました"
      exit 1
    }
  else
    log_error "bun / npm が見つかりません"
    exit 1
  fi
fi

if [[ ! -d $KNOWLEDGE_DIR ]]; then
  log_error "knowledge ディレクトリが見つかりません: $KNOWLEDGE_DIR"
  echo "  setup/04_symlinks.sh を先に実行してください"
  exit 1
fi

if qmd collection list 2>/dev/null | grep -q "^${COLLECTION_NAME} "; then
  log_skip "コレクション '$COLLECTION_NAME' は既に登録されています"
else
  log_info "コレクション '$COLLECTION_NAME' を追加しています..."
  if ! qmd collection add "$KNOWLEDGE_DIR" --name "$COLLECTION_NAME"; then
    log_error "コレクション追加に失敗しました"
    exit 1
  fi
fi

# 埋め込み生成は常に実行（コンテンツハッシュで差分更新、済みエントリはスキップ）。
# コレクションは登録済みだが前回の embed が中断した場合もここで復旧する。
log_info "埋め込みベクター生成中（差分のみ、済みは 0.2 秒程度でスキップ）..."
if ! qmd embed; then
  log_error "埋め込み生成に失敗しました"
  echo "   完全リセット: qmd collection remove $COLLECTION_NAME && $0"
  exit 1
fi

log_info "完了: コレクション '$COLLECTION_NAME' のインデックスと埋め込みが利用可能です"
echo '   使用方法: qmd-fe "CSS animation performance"'
