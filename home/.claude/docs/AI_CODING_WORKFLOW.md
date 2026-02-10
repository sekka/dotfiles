# AI コーディングワークフロー

## 概要

このドキュメントは、Claude Code を中心とした実践的な AI コーディング管理手法をまとめたものです。
松尾研究所の実践的なノウハウ（[出典](https://zenn.dev/mkj/articles/868e0723efa060)）を参考に、以下の2つの柱で構成されています。

---

## 2つの柱

### 1. 実装レビューループ（Phase 1）

**目的:** 実装とレビューを自動的に交互実行し、品質を安定させる

**スキル:** `/implement-with-review`

**特徴:**
- 実装 subagent とレビュー subagent の自動ループ
- OWASP Top 10 対応の厳密なレビュー
- 最大3回のループで品質安定化

**使い方:**

```bash
# 新機能の実装
/implement-with-review "ユーザー認証機能を実装する。JWT + bcrypt を使用。"

# バグ修正
/implement-with-review "ログイン時にセッションが切れるバグを修正する。"

# リファクタリング
/implement-with-review "UserService クラスをリファクタリングし、可読性を向上させる。"
```

**ワークフロー:**

```
タスク分析
  ↓
実装 subagent で実装（TDD）
  ↓
レビュー subagent で自動レビュー
  ↓
問題があれば修正（最大3回ループ）
  ↓
合格したら完了報告
```

**詳細:** `skills/implement-with-review/README.md`

---

### 2. git worktree サポート（Phase 2）

**目的:** 複数タスクの並列開発を可能にし、コンテキストを完全に分離する

**スキル:** `/worktree-manager`

**Hook:** `auto-detect-worktree.ts`

**特徴:**
- worktree の作成・削除・一覧・切り替え機能
- worktree 専用設定の管理
- セッション開始時の自動検出

**使い方:**

```bash
# worktree を作成
/worktree-manager create feature-a

# 一覧表示
/worktree-manager list

# 切り替え（パスを表示）
/worktree-manager switch feature-a

# 削除
/worktree-manager delete feature-a

# 状態確認
/worktree-manager status
```

**ユースケース:**

```bash
# ターミナル1: メインブランチで調査
cd ~/dotfiles
claude

# ターミナル2: 機能開発
/worktree-manager create feature-new-auth
cd ~/dotfiles-feature-new-auth
claude
```

**worktree 専用設定:**

```json
{
  "branch": "feature-a",
  "purpose": "新機能の実装",
  "created": "2026-01-31T12:00:00Z",
  "claudeConfig": {
    "model": "sonnet"
  }
}
```

**詳細:** `skills/worktree-manager/README.md`

---

## 統合ワークフロー

3つの柱を組み合わせた理想的なワークフロー：

### シナリオ: 新機能の実装

```bash
# Step 1: worktree を作成して並列開発
/worktree-manager create feature-payment
cd ~/dotfiles-feature-payment
claude

# Step 2: 実装レビューループで実装
/implement-with-review "決済機能を実装する。Stripe を使用。"

# （自動ループ）
# 実装 → レビュー → 修正 → 再レビュー

# Step 3: コミット
git add .
git commit -m "feat: 決済機能を実装"
```

---

## ベストプラクティス

### 1. 実装前の要件明確化

**原則:** 曖昧な要件は `AskUserQuestion` で必ずヒアリング

```bash
# Bad: 曖昧なまま実装
/implement-with-review "パフォーマンスを改善して"

# Good: 要件を明確化してから実装
# → AskUserQuestion で「何を優先？」と確認
# → メモリ使用量の削減を選択
/implement-with-review "メモリ使用量を削減するため、不要なキャッシュを削除する"
```

### 2. TDD の徹底

**原則:** テストを先に書き、実環境での動作確認を必ず行う

```
1. テストを先に書く（Red）
2. 最小限の実装（Green）
3. 実環境での動作確認（必須）
4. リファクタリング（Refactor）
```

### 3. プロセスの固定化

**原則:** 「コマンド + タスク指定だけ」で再現可能にする

```bash
# プロセスが固定化されている
/implement-with-review "タスク内容"

# プロセスが固定化されていない（避ける）
# → 毎回異なる手順で実装
```

### 4. コンテキストの分離

**原則:** worktree で複数タスクを並列実行し、コンテキストを分離

```bash
# タスクごとに worktree を作成
/worktree-manager create feature-a
/worktree-manager create feature-b
/worktree-manager create bugfix-c

# 各ターミナルで独立して作業
```

---

## アンチパターン

### 1. レビューのスキップ

**Bad:**

```bash
# 実装だけして終わり
# → レビューなし、品質不安定
```

**Good:**

```bash
# 実装レビューループで品質担保
/implement-with-review "..."
```

### 2. 未使用コードの放置

**Bad:**

```typescript
// import { useState, useEffect, useMemo } from 'react';  // useMemo 未使用
// const _oldVariable = 123;  // 未使用
// console.log('Debug:', value);  // 本番環境に残る
```

**Good:**

```bash
# lint-format.ts hook が自動実行（PostToolUse）
# フォーマットとリント修正を自動適用
```

### 3. ブランチ切り替えによる作業状態の喪失

**Bad:**

```bash
# git checkout で頻繁に切り替え
# → ファイルの状態が変わる、コンパイル結果が消える
```

**Good:**

```bash
# worktree で並列開発
/worktree-manager create feature-a
/worktree-manager create feature-b
```

---

## 導入手順

### 1. 既存の設定を確認

```bash
# .claude ディレクトリの確認
ls -la ~/.claude/

# 既存の skills と hooks を確認
ls ~/.claude/skills/
ls ~/.claude/hooks/
```

### 2. 新しいスキルと hook を配置

```bash
# 既に配置済み（このドキュメントがあるということは）
# 以下を確認

ls ~/.claude/skills/implement-with-review/
ls ~/.claude/skills/worktree-manager/

ls ~/.claude/hooks/auto-detect-worktree.ts
```

### 3. スキルの動作確認

```bash
# Claude Code を起動
claude

# スキルの一覧を確認
/help

# 各スキルを試す
/implement-with-review "簡単なテスト実装"
/worktree-manager list
```

### 4. hook の動作確認

```bash
# セッション開始時のメッセージを確認
# （worktree の場合は自動検出メッセージが表示される）
```

---

## トラブルシューティング

### Q1: スキルが表示されない

**A:** スキルのディレクトリ構造を確認

```bash
# skill.json が存在するか確認
ls ~/.claude/skills/implement-with-review/skill.json

# Claude Code を再起動
```

### Q2: worktree が作成できない

**A:** git のバージョンを確認

```bash
# git 2.5 以降が必要
git --version

# worktree が有効か確認
git worktree list
```

### Q3: レビューが厳しすぎる

**A:** レビュー基準を調整

```typescript
// skills/implement-with-review/subagents/reviewer.md を編集
// Weight（重み付け）を調整
```

---

## 参考資料

### 外部リンク

- [松尾研究所の実践的なAIコーディング管理手法](https://zenn.dev/mkj/articles/868e0723efa060)
- [Git worktree 公式ドキュメント](https://git-scm.com/docs/git-worktree)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

### 内部ドキュメント

- TDD ワークフロー: `.claude/rules/tdd-workflow.md`
- セマンティック検索: `.claude/rules/semantic-search.md`
- 技術調査ガイド: `.claude/rules/tech-research.md`
- レビューワークフロー: `.claude/rules/code-review-workflow.md`
- フロントエンドナレッジ: `.claude/rules/frontend-knowledge.md`
- セキュリティ原則: `.claude/rules/security.md`

---

## まとめ

2つの柱を組み合わせることで、以下を実現：

1. **品質の安定化**: 実装レビューループで一貫した品質
2. **効率化**: git worktree で並列開発

これらは松尾研究所の実践的なノウハウを参考に、Claude Code 向けに最適化したワークフローです。

---

**バージョン:** 1.0.0
**最終更新:** 2026-01-31
**ライセンス:** MIT
