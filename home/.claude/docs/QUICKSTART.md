# クイックスタートガイド

## 5分で始める AI コーディングワークフロー

このガイドは、新しいスキルと hook を最速で試すためのクイックスタートです。

---

## Step 1: 動作確認（1分）

### Claude Code を起動

```bash
cd ~/dotfiles
claude
```

### スキルの確認

```bash
# Claude Code のプロンプトで
/help
```

以下のスキルが表示されることを確認：

- `implement-with-review` - 実装レビューループ
- `worktree-manager` - git worktree 管理

---

## Step 2: 実装レビューループを試す（2分）

### 簡単なタスクで試す

```bash
/implement-with-review "簡単なユーティリティ関数を実装する。2つの数値を加算する add 関数。"
```

### 何が起こるか

1. タスク内容を分析
2. 実装 subagent がテストと実装を作成
3. レビュー subagent が自動レビュー
4. 問題があれば修正（最大3回ループ）
5. 完了報告

**期待される結果:**

```markdown
# 実装レビューループ完了

## 実装内容
- 変更ファイル: src/utils/math.ts, tests/utils/math.test.ts
- ループ回数: 1回

## レビュー結果
- ステータス: ✅ 承認
- Critical: 0件
- Major: 0件
- Minor: 0件

## テスト結果
✅ All tests passed (2/2)
```

---

## Step 3: worktree を試す（1分）

### worktree の一覧を確認

```bash
/worktree-manager list
```

**期待される結果:**

```
📁 git worktree 一覧

~/dotfiles    29a3f9f [master]

合計: 1 worktree
```

### 新しい worktree を作成（オプション）

```bash
/worktree-manager create test-feature
```

**期待される結果:**

```
✅ worktree を作成しました

パス: ~/dotfiles-test-feature
ブランチ: test-feature

次のステップ:
1. 新しいターミナルウィンドウを開く
2. cd ~/dotfiles-test-feature
3. claude
```

---

## よくあるユースケース

### ケース1: 新機能を実装する

```bash
# Step 1: worktree を作成
/worktree-manager create feature-user-auth

# Step 2: 新しいターミナルで
cd ~/dotfiles-feature-user-auth
claude

# Step 3: 実装レビューループで実装
/implement-with-review "ユーザー認証機能を実装する。JWT を使用。"

# Step 4: コミット
git add .
git commit -m "feat: ユーザー認証機能を実装"
```

### ケース2: バグを修正する

```bash
# Step 1: 実装レビューループで修正
/implement-with-review "ログイン時にセッションが切れるバグを修正する。"

# Step 2: コミット
git add .
git commit -m "fix: セッション切れバグを修正"
```

### ケース3: リファクタリングする

```bash
# Step 1: 実装レビューループでリファクタリング
/implement-with-review "UserService クラスをリファクタリングし、可読性を向上させる。"

# Step 2: コミット
git add .
git commit -m "refactor: UserService の可読性向上"
```

---

## 次のステップ

### 詳細ドキュメントを読む

- **全体概要:** `AI_CODING_WORKFLOW.md`
- **Phase 1:** `skills/implement-with-review/README.md`
- **Phase 2:** `skills/worktree-manager/README.md`

### ベストプラクティスを学ぶ

- TDD ワークフロー: `.claude/rules/tdd-workflow.md`
- コードレビューワークフロー: `.claude/rules/code-review-workflow.md`
- セキュリティ原則: `.claude/rules/security.md`

---

## トラブルシューティング

### スキルが見つからない

```bash
# スキルのディレクトリ構造を確認
ls ~/.claude/skills/implement-with-review/skill.json

# Claude Code を再起動
```

### worktree が作成できない

```bash
# git のバージョンを確認（2.5以降が必要）
git --version

# worktree が有効か確認
git worktree list
```

---

## ヘルプ

### コマンド一覧

```bash
# スキル
/implement-with-review "<タスク内容>"
/worktree-manager [create|list|switch|delete|status] [<args>]

# 既存スキル
/review-and-improve     # レビュー＋改善
/commit                 # コミット作成
```

### 詳細ヘルプ

```bash
# Claude Code のヘルプ
/help

# 各スキルの README を参照
cat ~/.claude/skills/implement-with-review/README.md
cat ~/.claude/skills/worktree-manager/README.md
```

---

## フィードバック

問題や改善提案があれば、以下で報告してください：

- GitHub Issues: https://github.com/anthropics/claude-code/issues

---

**バージョン:** 1.0.0
**最終更新:** 2026-01-31
**ライセンス:** MIT
