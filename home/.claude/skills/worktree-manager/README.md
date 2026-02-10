# git worktree 管理スキル

## 概要

git worktree を管理し、複数タスクの並列開発を可能にするスキル。
ブランチごとに独立した作業環境を作成し、コンテキストを完全に分離する。

## 着想元

松尾研究所の実践的なAIコーディング管理手法から着想を得た。

> 複数ウィンドウを常設し、モジュール単位でAIとのコンテキストを分離。1人開発でも「並列化」することで、調査・設計・実装を同時進行できます。

出典: https://zenn.dev/mkj/articles/868e0723efa060

## 特徴

- **完全なコンテキスト分離**: ブランチごとに独立した作業環境
- **ブランチ切り替え不要**: `git checkout` なしで作業可能
- **複数タスクの同時進行**: 調査・設計・実装を並列実行
- **作業状態の保持**: 各 worktree で作業状態が保持される

## 使い方

詳細は `prompt.md` を参照してください。

```bash
# 基本コマンド
/worktree-manager create <branch-name>  # worktree を作成
/worktree-manager list                   # 一覧表示
/worktree-manager switch <branch-name>   # 切り替え
/worktree-manager delete <branch-name>   # 削除
/worktree-manager status                 # 状態確認
```

## 実装

- `skill.ts`: スキルのエントリーポイント
- `worktree-manager.ts`: worktree 管理ロジック
- `prompt.md`: Claude Code 向けの詳細プロンプト
