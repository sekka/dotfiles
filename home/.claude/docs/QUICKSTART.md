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
- `enforce-standards` - コーディング規約強制
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

## Step 3: コーディング規約チェックを試す（1分）

### 既存のファイルをチェック

```bash
# チェックのみ（修正しない）
/enforce-standards --check-only .
```

### 何が起こるか

1. 未使用コードを検出
2. 後方互換コードを検出
3. console.log を検出
4. フォーマット違反を検出
5. 型安全性の問題を検出

**期待される結果:**

```markdown
# コーディング規約チェック完了

## 検出結果

✅ 問題なし: 20ファイル
⚠️ 要確認: 3ファイル

## 詳細

### src/example.ts
- [Warning] console.log を検出: 行34
- [Warning] 未使用 import: 行2
```

---

## Step 4: worktree を試す（1分）

### worktree の一覧を確認

```bash
/worktree-manager list
```

**期待される結果:**

```
📁 git worktree 一覧

/Users/kei/dotfiles    29a3f9f [master]

合計: 1 worktree
```

### 新しい worktree を作成（オプション）

```bash
/worktree-manager create test-feature
```

**期待される結果:**

```
✅ worktree を作成しました

パス: /Users/kei/dotfiles-test-feature
ブランチ: test-feature

次のステップ:
1. 新しいターミナルウィンドウを開く
2. cd /Users/kei/dotfiles-test-feature
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

# Step 4: コーディング規約チェック
/enforce-standards --fix

# Step 5: コミット
git add .
git commit -m "feat: ユーザー認証機能を実装"
```

### ケース2: バグを修正する

```bash
# Step 1: 実装レビューループで修正
/implement-with-review "ログイン時にセッションが切れるバグを修正する。"

# Step 2: コーディング規約チェック
/enforce-standards --fix

# Step 3: コミット
git add .
git commit -m "fix: セッション切れバグを修正"
```

### ケース3: リファクタリングする

```bash
# Step 1: コーディング規約チェック（現状把握）
/enforce-standards --check-only src/

# Step 2: 実装レビューループでリファクタリング
/implement-with-review "UserService クラスをリファクタリングし、可読性を向上させる。"

# Step 3: コーディング規約チェック（再確認）
/enforce-standards --fix

# Step 4: コミット
git add .
git commit -m "refactor: UserService の可読性向上"
```

---

## 設定のカスタマイズ

### CLAUDE.md 自動同期の有効化

`~/.claude/hooks/auto-sync-claude-md.ts` を編集：

```typescript
const CONFIG = {
  autoSync: true,  // ← false から true に変更
  debounceMs: 5000,
  maxChanges: 10,
};
```

### コミット前の自動規約チェック

`~/.claude/hooks/enforce-standards-on-commit.ts` を作成：

```typescript
export default {
  onBeforeCommit: async () => {
    return {
      message: "コーディング規約チェックを実行中...",
      autoRunSkill: "enforce-standards --fix"
    };
  }
};
```

---

## 次のステップ

### 詳細ドキュメントを読む

- **全体概要:** `AI_CODING_WORKFLOW.md`
- **Phase 1:** `skills/implement-with-review/README.md`
- **Phase 2:** `hooks/auto-sync-claude-md.md`
- **Phase 3:** `skills/enforce-standards/README.md`
- **Phase 4:** `skills/worktree-manager/README.md`

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

### hook が動作しない

```bash
# TypeScript の構文エラーを確認
cd ~/.claude/hooks/
tsc --noEmit auto-sync-claude-md.ts

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
/enforce-standards [--check-only|--fix|--interactive] [<path>]
/worktree-manager [create|list|switch|delete|status] [<args>]

# 既存スキル
/reviewing-with-claude  # クイックレビュー
/reviewing-parallel     # 並列レビュー
/commit                 # コミット作成
```

### 詳細ヘルプ

```bash
# Claude Code のヘルプ
/help

# 各スキルの README を参照
cat ~/.claude/skills/implement-with-review/README.md
cat ~/.claude/skills/enforce-standards/README.md
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
