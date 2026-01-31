---
name: checkpointing
description: セッション状態を永続化し、コンテキストを保存
triggers:
  - /checkpoint
  - /checkpointing
args:
  - name: mode
    description: "実行モード: session(デフォルト), full, analyze"
    required: false
---

# Checkpointing

## 概要

セッションの作業履歴を永続化し、次回セッションで参照可能にする。

## モード

### session（デフォルト）

- CLAUDE.md の「セッション履歴」セクションを更新
- 直近の作業内容を要約して追記

### full（--full）

- `.claude/checkpoints/YYYY-MM-DD-HHMMSS.md` にフルスナップショット作成
- git log、変更ファイル、エージェント呼び出しログを含む

### analyze（--full --analyze）

- fullモードに加えて、再利用可能パターンを抽出
- 新規スキル候補を提案

## 使用例

- `/checkpoint` - セッション履歴を更新
- `/checkpoint --full` - フルチェックポイント作成
- `/checkpoint --full --analyze` - パターン抽出付きチェックポイント
