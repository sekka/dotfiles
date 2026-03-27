# 調査: nabeelhyatt/coworkpowers - Claude Code ナレッジワークプラグイン

## 調査対象

https://github.com/nabeelhyatt/coworkpowers

## 概要

**CoworkPowers** は Claude Code のプラグインで、ナレッジワーク（コミュニケーション下書き、意思決定、会議準備など）に特化した機能を提供します。完了したタスクからインサイトをフィードバックし、次回の類似タスクをより速く・より良く処理できる「コンパウンドループ」を実現します。

## 主なフェーズ

1. **Research** (`/coworkpowers:workflow-research`): 並列エージェントで徹底的な調査
   - context-gatherer、stakeholder-mapper、constraint-analyzer、precedent-researcher が並列実行
2. **Work** (`/coworkpowers:workflow-work`): 専門エージェントによる実行
   - executive-writer（コミュニケーション）、analyst（データ分析）、decision-architect（40以上の意思決定フレームワーク）、meeting-orchestrator（会議準備）、coach（リーダーシップ）
3. **Review** (`/coworkpowers:workflow-review`): 最大 8 つの専門レビュアーが並列実行
   - clarity-reviewer、tone-calibrator、completeness-auditor、sensitivity-scanner、devil's-advocate、risk-assessor、strategic-alignment-checker、actionability-validator
4. **Compound** (`/coworkpowers:workflow-compound`): パターン・テンプレート・好みを蓄積

## メリット

- **コンパウンドナレッジ**: タスクを重ねるごとに品質と速度が向上する
- **並列エージェント**: 調査フェーズでは並列処理により高速で徹底的な調査が可能
- **ステーク分類**: リスクに応じたレビューの重さを自動調整
- **40 以上の意思決定フレームワーク**: decision-architect に組み込まれている
- **Claude Code 統合**: 既存のワークフローに組み込みやすい

## デメリット・注意点

- **Claude Code 専用**: Claude Code が必要（他の AI ツールでは使えない）
- **複雑さ**: 多数のエージェントとフェーズがあり、シンプルなタスクには過剰な可能性
- **コスト**: 並列エージェント処理のためトークン消費が多い可能性あり
- **最初は効果が薄い**: コンパウンド効果はナレッジが蓄積してから本領発揮
- **英語ベース**: リポジトリの説明は英語

## 判断のポイント

Claude Code を日常的に使い、コミュニケーション下書き・意思決定・会議準備などのタスクをこなす場合、特に長期的な価値向上を求めるなら導入価値が高い。短期的・単発タスクには過剰かもしれない。
