#!/bin/bash
# PreCompact / PostCompact hook: 作業チェックポイントを記録する
#
# コンテキスト圧縮が発生するたびに、タイムスタンプ・プロジェクト名・
# ディレクトリを ~/.claude/progress-checkpoint.md に追記する。
# 圧縮前に何をやっていたかを後から振り返れるよう、監査ログとして残す。

CHECKPOINT_FILE="$HOME/.claude/progress-checkpoint.md"
TIMESTAMP=$(TZ=Asia/Tokyo date +"%Y-%m-%dT%H:%M:%S%z" | sed 's/+0900/+09:00/')
PROJECT=$(basename "$PWD")
DIRECTORY="$PWD"

cat >>"$CHECKPOINT_FILE" <<EOF
---
## Checkpoint: $TIMESTAMP
- Project: $PROJECT
- Directory: $DIRECTORY
---
EOF
