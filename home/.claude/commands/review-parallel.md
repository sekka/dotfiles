---
description: 複数のAIエージェントで並列コードレビューを実施
argument-hint: [対象: --uncommitted, --base <branch>, など]
---

# 並列AIコードレビュー

## 🆕 推奨: Subagent経由での実行

複数のAIレビュアーを統合し、自動的に結果をマージするには、Subagentを使用してください。

```
Use @agent-parallel-reviewer to review uncommitted changes
Use @agent-parallel-reviewer to review main branch
Use @agent-parallel-reviewer to review $ARGUMENTS
```

**利点**:
- ✅ 自動的に重複排除・優先度付け・カテゴリ分類を実行
- ✅ 統合レポートが1つのレポートとして提示される
- ✅ 複数レビュアーの結果を1つの優先度付きレポートに統合

**認証とセキュリティ**:
- `@agent-parallel-reviewer` は、各レビュアーエージェント（Codex, CodeRabbit, Copilot, Gemini）の認証情報を引き継ぐ
- 個別の認証設定が必要（従来と同じ）
- 詳細: [認証セットアップガイド](#認証セットアップ)

**例**:
```
/review-parallel
uncommitted changesをレビューしてください
```

---

## ⚠️ 従来の方法（レガシー・廃止予定）

> **推奨**: 上記の新しい Subagent 方式を使用してください。
> 従来の方法は互換性のため現在も利用可能ですが、将来的には廃止予定です。
> 移行方法は[移行ガイド](#移行ガイド)を参照してください。

### 概要

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

## 認証セットアップ

### Subagent方式での認証

`@agent-parallel-reviewer` を使用するには、4つのレビュアーエージェントの認証設定が必要です：

```bash
# 1. Codex認証
codex login

# 2. CodeRabbit認証
coderabbit auth

# 3. Copilot認証（GitHub）
# GitHub CLIで自動認証
gh auth login

# 4. Gemini認証
gemini auth setup
```

### 認証フロー

```
ユーザー入力
    ↓
@agent-parallel-reviewer
    ├─ Codexレビュアーへ通信（codex CLIで認証）
    ├─ CodeRabbitレビュアーへ通信（coderabbit認証情報使用）
    ├─ Copilotレビュアーへ通信（GitHub認証情報使用）
    └─ Geminiレビュアーへ通信（gemini認証情報使用）
    ↓
統合結果をユーザーに返す
```

各レビュアーエージェントは独立して認証を処理するため、**Subagent方式で追加の認証設定は不要**です。

---

## 移行ガイド

### 従来の方法から新方式への移行

#### Step 1: 新Subagentが利用可能か確認

```bash
# parallel-reviewer agent が存在するか確認
ls ~/.claude/agents/parallel-reviewer.md
```

#### Step 2: コマンドを更新

**従来の方式**（廃止予定）:
```bash
/review-parallel
uncommitted changesをレビューしてください
```

**新しい方式**（推奨）:
```bash
/review-parallel
uncommitted changesをレビューしてください
```

> 注：コマンド自体は同じ `/review-parallel` ですが、内部で Subagent を通じて実行されます

#### Step 3: 統合結果の形式の変更を確認

新方式では以下の改善が期待できます：

| 項目 | 従来の方式 | 新方式 |
|------|-----------|--------|
| **出力形式** | 4つのエージェント出力が分散 | 1つの統合レポート |
| **重複排除** | 手動で見分ける必要 | 自動的に重複排除 |
| **優先度** | 各エージェントが独立 | 複数指摘の一致で優先度昇格 |
| **セキュリティ** | セキュリティ指摘は散在 | OWASP対応で自動昇格 |

---

**推奨**: 重要な変更やPR作成前は `/review-parallel` で多角的な検証を実施してください。
