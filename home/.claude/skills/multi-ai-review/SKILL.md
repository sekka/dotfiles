---
name: multi-ai-review
description: 複数のAIエンジン（Codex、Gemini、Copilot、CodeRabbit）で並行コードレビューを実施します。各AIの強みを活かした包括的な分析を提供します。
allowed-tools: Bash
---

# マルチAIレビュー

複数のAIレビューツールを並行実行して、多角的な視点でコードをレビューします。

## 特徴

- **並行実行**: すべてのAIレビューを同時に実行して時間を節約
- **多角的分析**: 各AIエンジンの強みを活かした包括的なレビュー
- **統合結果**: すべてのレビュー結果を見やすく統合表示

## 対応AIエンジン

1. **Codex (OpenAI)**: o1/o3モデルによる深い推論と分析
2. **Gemini (Google)**: アーキテクチャと設計パターンの分析
3. **Copilot (GitHub)**: GitHubとの統合による実践的な提案
4. **CodeRabbit**: 詳細なコードパターン分析

## 実行方法

スキルは自動的に以下の処理を実行します：

1. 現在の未コミット変更を取得
2. すべてのAIレビューツールを並行実行
3. 各AIの結果を統合して表示

### 並行実行コマンド

```bash
# 以下のコマンドを並行実行
codex review --uncommitted
gemini --yolo "git diffをレビューしてください"
copilot --allow-all-tools --interactive "git diffをレビューしてください"
coderabbit review --type uncommitted
```

## 出力形式

```markdown
## マルチAIレビュー結果

### 🤖 Codex (OpenAI)
[レビュー結果]

### 🤖 Gemini (Google)
[レビュー結果]

### 🤖 Copilot (GitHub)
[レビュー結果]

### 🤖 CodeRabbit
[レビュー結果]

## 共通の指摘事項
[複数のAIが指摘した重要な問題]

## 推奨アクション
[優先順位付けされた改善提案]
```

## 使用タイミング

- コード変更後のレビュー依頼時
- プルリクエスト作成前
- 重要なリファクタリング後
- コミット前の最終チェック

## 注意事項

- すべてのAIツールが認証済みである必要があります
- 並行実行のため、初回は時間がかかる場合があります
- 各AIツールの利用制限に注意してください
