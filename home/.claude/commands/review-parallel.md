---
description: 複数のAIエージェントで並列コードレビューを実施
argument-hint: [対象: --uncommitted, --base <branch>, など]
---

# 並列AIコードレビュー

対象: $ARGUMENTS

## 概要

4つの専門AIエージェントを並列実行し、多角的な視点でコードレビューを実施します。

## 使用するAIエージェント

| エージェント | 専門分野 |
|------------|---------|
| **@agent-codex-reviewer** | コード品質、深い推論分析、ベストプラクティス |
| **@agent-coderabbit-reviewer** | セキュリティ脆弱性、パフォーマンス、OWASP Top 10 |
| **@agent-copilot-reviewer** | GitHub統合、実践的改善、CI/CD最適化 |
| **@agent-gemini-reviewer** | アーキテクチャ分析、システム設計、大規模コンテキスト理解 |

## 実行方法

### 全AIレビュー（推奨）

```
Use @agent-codex-reviewer @agent-coderabbit-reviewer @agent-copilot-reviewer @agent-gemini-reviewer background for reviewing $ARGUMENTS
```

### 選択的レビュー

#### セキュリティとコード品質重視

```
Use @agent-coderabbit-reviewer @agent-codex-reviewer background
```

#### アーキテクチャとGitHub統合

```
Use @agent-gemini-reviewer @agent-copilot-reviewer background
```

#### 高速レビュー（2つのAI）

```
Use @agent-codex-reviewer @agent-copilot-reviewer background
```

## 使用例

### 未コミット変更のレビュー

```
/review-parallel

未コミット変更をレビューしてください
```

または直接指定：

```
Use @agent-codex-reviewer @agent-coderabbit-reviewer @agent-copilot-reviewer @agent-gemini-reviewer background for reviewing uncommitted changes
```

### 特定ブランチとの差分

```
/review-parallel

mainブランチとの差分をレビューしてください
```

または：

```
Use @agent-codex-reviewer @agent-coderabbit-reviewer background for reviewing changes against main branch
```

### セキュリティ重視レビュー

```
/review-parallel

セキュリティ脆弱性に焦点を当ててレビューしてください
```

### パフォーマンス重視レビュー

```
/review-parallel

パフォーマンスボトルネックを特定してレビューしてください
```

## レビュー結果の見方

各AIエージェントは独立してレビューを実施し、それぞれの専門分野に基づいた結果を返します：

### 共通指摘事項（高優先度）

- 複数のAIが指摘した問題は、特に重要です
- 3つ以上のAIが指摘 → **即座に対応すべき**
- 2つのAIが指摘 → **優先的に対応すべき**

### AI別の独自指摘

- **Codex**: 深い論理分析とベストプラクティス
- **CodeRabbit**: セキュリティとパフォーマンスの詳細
- **Copilot**: 実践的な改善とGitHubワークフロー
- **Gemini**: アーキテクチャと長期的影響

## 推奨ワークフロー

### 1. コーディング完了後

```
/review-parallel
最新の変更をレビューしてください
```

### 2. 問題修正

各AIの指摘を確認し、優先度の高いものから修正

### 3. PR作成前の最終チェック

```
/review-parallel
mainブランチとの差分を最終レビューしてください
```

### 4. PR作成

```
/pr
```

## 並列実行の利点

| 項目 | シーケンシャル実行 | 並列実行 |
|------|------------------|---------|
| **時間** | 4倍の時間 | ほぼ同じ時間 |
| **視点** | 1つの視点 | 4つの異なる視点 |
| **信頼性** | 単一AIのバイアス | 多角的検証 |
| **専門性** | 汎用的 | 各AIの専門分野を活用 |

## 注意事項

- 各AIツールが認証済みである必要があります：
  - `codex login`
  - `coderabbit auth`
  - `copilot` の認証設定
  - `gemini` の認証設定
- 並列実行のため、初回は時間がかかる場合があります
- 大量の変更がある場合、一部のAIがタイムアウトする可能性があります
- 各AIの利用制限に注意してください

## トラブルシューティング

### エージェントが見つからない

Agentファイルが正しく配置されているか確認：

```bash
ls -la ~/.claude/agents/
```

以下のファイルが必要：

- `codex-reviewer.md`
- `coderabbit-reviewer.md`
- `copilot-reviewer.md`
- `gemini-reviewer.md`

### AIツールの認証エラー

各ツールの認証を確認：

```bash
codex login
coderabbit auth
copilot --help
gemini --version
```

### 並列実行が遅い

最初の実行は各Agentの初期化に時間がかかります。2回目以降は高速になります。

急ぐ場合は、特定のAIのみを使用：

```
Use @agent-codex-reviewer @agent-copilot-reviewer background
```

## 他のレビュー方法との使い分け

| 方法 | 用途 | 速度 |
|------|------|------|
| `/review-with-claude` | クイックチェック | 最速 |
| `/review-parallel` | 包括的レビュー | 中速（並列） |
| `/review` | 単一の詳細レビュー | 中速 |
| `/review-pr` | PRレビュー | 中速 |

---

**推奨**: 重要な変更やPR作成前は `/review-parallel` で多角的な検証を実施してください。
