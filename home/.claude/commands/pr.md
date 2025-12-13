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
```

### Step 2: 品質チェック

PR 作成前に以下を確認：

- [ ] lint が通ること（`npm run lint`）
- [ ] 型チェックが通ること（`npm run typecheck`）
- [ ] テストが通ること（`npm run test`）
- [ ] ビルドが成功すること（`npm run build`）

### Step 3: コミット整理（必要な場合）

- 関連するコミットをまとめる（squash）
- コミットメッセージを整理
- 機密情報が含まれていないか確認

### Step 4: PR 情報の作成

以下の情報を収集：

- 変更の概要（何をなぜ変更したか）
- 関連する Issue 番号
- テスト計画
- レビュアーへの注意点

### Step 5: PR 作成

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

## 注意事項

- Draft PR として作成する場合は `--draft` オプションを追加
- 大きな変更は複数の PR に分割を検討
- PR 作成後は CI の結果を確認
- コンフリクトがある場合は事前に解消
