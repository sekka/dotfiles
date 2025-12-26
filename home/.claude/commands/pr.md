---
description: Pull Request の作成
argument-hint: [ベースブランチ（省略時は main/master）]
allowed-tools: Bash(git:*), Bash(gh:*), Read, Glob, TodoWrite
---

# Pull Request 作成

ベースブランチ: $ARGUMENTS

## 実行内容

### Step 1: 事前確認

```bash
# 現在のブランチと状態を確認
git status
git branch --show-current

# ベースブランチとの差分を確認
git log --oneline <base>..HEAD
git diff <base>...HEAD --stat

# 変更がない場合は処理を中断
if [ -z "$(git status --porcelain)" ] && [ -z "$(git log <base>..HEAD)" ]; then
  echo "コミットする変更がありません"
  exit 1
fi
```

**確認事項：**

- 変更の範囲と性質を理解する
- これが機能（feat）、バグ修正（fix）、ドキュメント（docs）、メンテナンス（chore）のいずれかを特定
- 変更が不明確な場合は、進む前にユーザーに明確化を求める

### Step 2: ブランチ作成（必要な場合）

現在のブランチが main/master の場合、新しいブランチを作成：

**ブランチ命名規約：**

- パターン: `{prefix}/issue-{number}` または `{prefix}/{short-description}`
- プレフィックス: `feat/`, `fix/`, `docs/`, `chore/`
- 例: `feat/issue-123` または `fix/login-validation`

```bash
# 新しいブランチを作成して切り替え
git checkout -b feat/issue-123
```

### Step 3: 品質チェック（必須）

**重要**: PR 作成前に以下のチェックを必ず実行し、すべて合格すること：

```bash
# lint が通ること
npm run lint || exit 1

# 型チェックが通ること
npm run typecheck || exit 1

# テストが通ること
npm run test || exit 1

# ビルドが成功すること（該当する場合）
npm run build || exit 1
```

これらのチェックが失敗した場合は、PR を作成せずに修正すること。

### Step 4: コミット整理（必要な場合）

- 関連するコミットをまとめる（squash）
- コミットメッセージを整理
- 機密情報が含まれていないか確認
- デバッグログや一時的なコードが含まれていないか確認

### Step 5: PRテンプレートの読み込み（必須）

**重要**: PRテンプレートが存在する場合、必ず読み込んで使用すること：

```bash
# PRテンプレートの確認
if [ -f .github/pull_request_template.md ]; then
  cat .github/pull_request_template.md
fi
```

テンプレートが存在しない場合は、ユーザーに通知してどう進めるか確認する。

### Step 6: PR 情報の作成

以下の情報を収集：

- 変更の概要（何をなぜ変更したか）
- 関連する Issue 番号（`Closes #123` 形式でマージ時に自動クローズ）
- テスト計画
- レビュアーへの注意点
- 破壊的変更の有無

### Step 7: PR 作成

```bash
gh pr create \
  --title "feat: 変更の要約" \
  --body "$(cat <<'EOF'
## 概要

変更内容の説明

## 関連 Issue

- Closes #XXX

## 変更内容

- 変更点 1
- 変更点 2

## テスト計画

- [ ] テスト項目 1
- [ ] テスト項目 2

## スクリーンショット（UI 変更の場合）

## チェックリスト

- [ ] lint/typecheck/test が通ること
- [ ] 必要なドキュメント更新
- [ ] 破壊的変更の有無を確認
EOF
)"
```

## PR タイトルの形式

```text
<type>: <description>
```

| type     | 用途               |
| -------- | ------------------ |
| feat     | 新機能             |
| fix      | バグ修正           |
| docs     | ドキュメント       |
| style    | フォーマット       |
| refactor | リファクタリング   |
| perf     | パフォーマンス改善 |
| test     | テスト             |
| ci       | CI/CD              |
| chore    | その他             |

## PR 本文のテンプレート

```markdown
## 概要

<!-- 何をなぜ変更したかを簡潔に -->

## 関連 Issue

- Closes #XXX
- Related to #YYY

## 変更内容

<!-- 主要な変更点を箇条書きで -->

## テスト計画

<!-- どのようにテストしたか/してほしいか -->

## 破壊的変更

<!-- API や動作の互換性に影響がある場合は記載 -->

## チェックリスト

- [ ] セルフレビュー完了
- [ ] テスト追加/更新
- [ ] ドキュメント更新（必要な場合）
```

## レビュアーの設定

```bash
# 特定のユーザーをレビュアーに設定
gh pr create --reviewer username1,username2

# チームをレビュアーに設定
gh pr create --reviewer org/team-name
```

## 品質チェックリスト

PR作成前に以下を必ず検証：

- [ ] すべての変更が意図的でPRの目的に関連している
- [ ] ブランチ名が規約に従っている
- [ ] コミットメッセージが明確で適切にプレフィックスが付けられている
- [ ] PRテンプレートが完全に記入されている（存在する場合）
- [ ] 関連するissueがリンクされている
- [ ] lint、test、typecheckがローカルで合格している
- [ ] デバッグログや一時的なコードが削除されている
- [ ] 機密情報（API キー、パスワード等）が含まれていない

## エラーハンドリング

**いずれかのステップが失敗した場合：**

1. すぐにユーザーにエラーを報告する
2. ユーザーの承認なしに回避策を試みない
3. リモートブランチが既に存在する場合は、強制プッシュするか新しいブランチ名を作成するかをユーザーに尋ねる
4. マージ競合がある場合は、ユーザーに通知し、解決のガイダンスを提供する
5. 品質チェックが失敗した場合は、PR を作成せずに修正を優先する

## 注意事項

- Draft PR として作成する場合は `--draft` オプションを追加
- 大きな変更は複数の PR に分割を検討
- PR 作成後は CI の結果を確認
- コンフリクトがある場合は事前に解消
- main/master ブランチに直接プッシュしない
- PRテンプレートの読み込みを決してスキップしない
- ユーザーの変更の確認なしにPRを作成しない
