# 開発時の実践ガイド

## このガイドについて

「今、何をすべきか」が一目で分かる開発者向けチートシートです。
状況別のコマンド一覧とフローチャートで、迷わず開発を進められます。

---

## クイックリファレンス

### 状況別コマンド

| 状況 | コマンド | 説明 |
|------|----------|------|
| **新機能を実装したい** | `/implement-with-review "..."` | 実装とレビューを自動ループ |
| **バグを修正したい** | `/implement-with-review "..."` | 同上 |
| **コードをリファクタリングしたい** | `/implement-with-review "..."` | 同上 |
| **コードの品質をチェックしたい** | `/enforce-standards --check-only` | チェックのみ（修正しない） |
| **コーディング規約違反を修正したい** | `/enforce-standards --fix` | 自動修正 |
| **複数タスクを並列で進めたい** | `/worktree-manager create <branch>` | worktree 作成 |
| **CLAUDE.md を更新したい** | `/claude-md-management:revise-claude-md` | ドキュメント更新 |
| **クイックレビューしたい** | `/reviewing-with-claude` | 軽量レビュー |
| **包括的レビューしたい** | `/reviewing-parallel` | 複数AIで並列レビュー |
| **コミットを作成したい** | `/commit` | 変更をまとめてコミット |

---

## 開発フロー（デシジョンツリー）

### フロー1: 開発開始時

```
タスクを受け取る
  ↓
複数タスクを並列で進める？
  YES → /worktree-manager create <branch>
        新しいターミナルで cd <path> && claude
  NO  → 次へ
  ↓
要件は明確？
  NO  → AskUserQuestion で確認
  YES → 次へ
  ↓
実装開始
  ↓
/implement-with-review "タスク内容"
```

### フロー2: 実装中

```
実装中
  ↓
不安な箇所がある？
  YES → /reviewing-with-claude でクイックレビュー
  NO  → 実装継続
  ↓
テストは通っている？
  NO  → 失敗したテストを修正（先送りしない）
  YES → 次へ
  ↓
実環境で動作確認した？
  NO  → 必ず実環境でテスト
  YES → 実装完了へ
```

### フロー3: 実装完了時

```
実装完了
  ↓
重要な変更？（セキュリティ、決済等）
  YES → /reviewing-parallel で包括レビュー
  NO  → /reviewing-with-claude で軽量レビュー
  ↓
コーディング規約違反がある？
  YES → /enforce-standards --fix で修正
  NO  → 次へ
  ↓
CLAUDE.md の更新が必要？
  YES → /claude-md-management:revise-claude-md
  NO  → 次へ
  ↓
コミット作成
  ↓
/commit
  ↓
実環境で最終確認
  ↓
PR作成（必要に応じて）
```

---

## ケース別の詳細手順

### ケース1: 新機能を実装する

#### 準備

```bash
# 複数タスクがある場合は worktree を作成
/worktree-manager create feature-new-payment

# 新しいターミナル
cd ~/dotfiles-feature-new-payment
claude
```

#### 実装

```bash
# Step 1: 実装レビューループで実装
/implement-with-review "決済機能を実装する。Stripe を使用し、クレジットカード決済に対応。"

# （自動で以下が実行される）
# - タスク分析
# - 実装 subagent で実装（TDD）
# - レビュー subagent で自動レビュー
# - 問題があれば修正（最大3回ループ）
# - 合格したら完了報告
```

#### 確認

```bash
# Step 2: コーディング規約チェック
/enforce-standards --fix

# Step 3: 実環境で動作確認
# （実際に決済処理を試す）

# Step 4: CLAUDE.md 更新（hook が提案）
/claude-md-management:revise-claude-md
```

#### コミット

```bash
# Step 5: コミット作成
/commit

# → コミットメッセージが自動生成される
# 例: "feat: Stripe を使用した決済機能を実装"
```

---

### ケース2: バグを修正する

#### 調査

```bash
# Step 1: エラーの原因調査（必要に応じて）
/debug "ログイン時にセッションが切れる"
```

#### 修正

```bash
# Step 2: 実装レビューループで修正
/implement-with-review "ログイン時にセッションが切れるバグを修正する。原因はトークンの有効期限チェック漏れ。"

# （自動でテスト作成、実装、レビュー）
```

#### 確認

```bash
# Step 3: コーディング規約チェック
/enforce-standards --fix

# Step 4: 実環境で動作確認
# （実際にログインを試す）

# Step 5: テストの追加確認
# → エッジケースのテストが追加されているか確認
```

#### コミット

```bash
# Step 6: コミット作成
/commit

# 例: "fix: セッション切れバグを修正"
```

---

### ケース3: リファクタリングする

#### 現状把握

```bash
# Step 1: コーディング規約チェック（現状把握）
/enforce-standards --check-only src/services/

# → どこに問題があるか把握
```

#### リファクタリング

```bash
# Step 2: 実装レビューループでリファクタリング
/implement-with-review "UserService クラスをリファクタリングする。以下を改善：
- 関数の分割（1関数50行以内）
- DRY原則の適用（重複コード削除）
- 型安全性の向上（any型を排除）"

# （自動でテスト作成、リファクタリング、レビュー）
```

#### 確認

```bash
# Step 3: コーディング規約チェック（再確認）
/enforce-standards --fix

# Step 4: テストが全て通ることを確認
npm test

# Step 5: 実環境で動作確認
# → 既存機能が壊れていないか確認
```

#### コミット

```bash
# Step 6: コミット作成
/commit

# 例: "refactor: UserService の可読性と保守性を向上"
```

---

### ケース4: 複数タスクを並列で進める

#### worktree の作成

```bash
# ターミナル1: メインブランチで調査
cd ~/dotfiles
claude
# 技術調査を実施

# ターミナル2: 機能A開発
/worktree-manager create feature-a
cd ~/dotfiles-feature-a
claude
/implement-with-review "機能Aを実装"

# ターミナル3: 機能B開発
/worktree-manager create feature-b
cd ~/dotfiles-feature-b
claude
/implement-with-review "機能Bを実装"
```

#### worktree の管理

```bash
# 一覧表示
/worktree-manager list

# 切り替え（パスを表示）
/worktree-manager switch feature-a

# 状態確認
/worktree-manager status

# 削除（完了後）
/worktree-manager delete feature-a
```

---

## チェックリスト

### 実装開始前

- [ ] 要件は明確か？（曖昧なら AskUserQuestion）
- [ ] 複数タスクがあるか？（あれば worktree 作成）
- [ ] テスト環境は整っているか？

### 実装中

- [ ] テストを先に書いたか？（TDD）
- [ ] 不安な箇所をレビューしたか？（/reviewing-with-claude）
- [ ] テストは全て通っているか？
- [ ] 実環境で動作確認したか？

### 実装完了後

- [ ] 包括的レビューを実施したか？（重要な変更の場合）
- [ ] コーディング規約違反を修正したか？（/enforce-standards）
- [ ] CLAUDE.md を更新したか？
- [ ] コミットメッセージは適切か？
- [ ] 実環境で最終確認したか？

---

## よくある質問

### Q1: テストが失敗したらどうする？

**A:** その場で修正。先送りしない。

```bash
# 1. エラーメッセージを読む
# 2. スタックトレースを確認
# 3. デバッガーやconsole.logで変数の中身を確認
# 4. 原因を特定して修正
# 5. 再度テスト実行
```

### Q2: レビューで Critical 問題が出たらどうする？

**A:** 必ず修正。修正されるまで次に進まない。

```bash
# /implement-with-review は自動で修正ループ
# → 手動介入が必要な場合はユーザーに確認
```

### Q3: 実環境テストで問題が見つかったらどうする？

**A:** 再度実装レビューループを実行。

```bash
/implement-with-review "実環境テストで見つかった問題を修正する。
問題: ログイン後にリダイレクトが失敗する
原因: URLエンコードの不備"
```

### Q4: CLAUDE.md の更新を忘れたらどうする？

**A:** いつでも更新可能。

```bash
# hook が提案していなくても手動実行可能
/claude-md-management:revise-claude-md
```

### Q5: worktree を削除し忘れたらどうする？

**A:** いつでも削除可能。

```bash
# 一覧で確認
/worktree-manager list

# 不要な worktree を削除
/worktree-manager delete old-feature
```

---

## コマンドリファレンス

### /implement-with-review

**用途:** 実装とレビューを自動ループ

**構文:**

```bash
/implement-with-review "<タスク内容>"
```

**例:**

```bash
/implement-with-review "ユーザー認証機能を実装する。JWT を使用。"
```

**オプション:**

- なし（タスク内容のみ指定）

---

### /enforce-standards

**用途:** コーディング規約のチェック・修正

**構文:**

```bash
/enforce-standards [--check-only|--fix|--interactive] [<path>]
```

**例:**

```bash
# チェックのみ
/enforce-standards --check-only

# 自動修正
/enforce-standards --fix src/

# インタラクティブ
/enforce-standards --interactive
```

**チェック項目:**

1. 未使用コード
2. 後方互換コード
3. console.log
4. フォーマット
5. 型安全性

---

### /worktree-manager

**用途:** git worktree の管理

**構文:**

```bash
/worktree-manager [create|list|switch|delete|status] [<args>]
```

**例:**

```bash
# 作成
/worktree-manager create feature-a

# 一覧
/worktree-manager list

# 切り替え
/worktree-manager switch feature-a

# 削除
/worktree-manager delete feature-a

# 状態確認
/worktree-manager status
```

---

### /reviewing-with-claude

**用途:** クイックレビュー（軽量）

**構文:**

```bash
/reviewing-with-claude
```

**タイミング:**

- 実装中の軽微な確認
- セキュリティチェック
- コーディング規約違反の検出

---

### /reviewing-parallel

**用途:** 包括的レビュー（複数AIで並列）

**構文:**

```bash
/reviewing-parallel
```

**タイミング:**

- 実装完了後
- PR作成前
- 重要な変更（セキュリティ、決済等）

---

### /commit

**用途:** コミット作成

**構文:**

```bash
/commit
```

**動作:**

1. git status で変更確認
2. git diff で差分確認
3. git log で履歴確認
4. コミットメッセージを自動生成
5. git commit 実行

---

## トラブルシューティング

### 問題: スキルが見つからない

**解決策:**

```bash
# スキルのディレクトリを確認
ls ~/.claude/skills/implement-with-review/skill.json

# Claude Code を再起動
```

---

### 問題: hook が動作しない

**解決策:**

```bash
# TypeScript の構文エラーを確認
cd ~/.claude/hooks/
tsc --noEmit auto-sync-claude-md.ts

# Claude Code を再起動
```

---

### 問題: テストが失敗し続ける

**解決策:**

1. エラーメッセージを精読
2. スタックトレースを確認
3. デバッガーで変数の中身を確認
4. `/debug` スキルで原因調査
5. 原因が分からない場合はユーザーに相談

---

### 問題: レビューが厳しすぎる

**解決策:**

```bash
# レビュー基準を調整
# skills/implement-with-review/subagents/reviewer.md を編集
```

---

## まとめ

開発時の基本フロー：

```
1. worktree 作成（並列開発の場合）
   ↓
2. 実装レビューループで実装
   ↓
3. コーディング規約チェック
   ↓
4. 実環境で動作確認
   ↓
5. CLAUDE.md 更新
   ↓
6. コミット作成
```

**重要な原則:**

- テストを先に書く（TDD）
- 実環境で必ず動作確認
- 失敗したテストは先送りしない
- プロセスを固定化する

---

**バージョン:** 1.0.0
**最終更新:** 2026-01-31
**ライセンス:** MIT
