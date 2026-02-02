# 実装レビューループスキル

## 目的

実装とレビューを自動的に交互実行し、品質を安定させる。
「実装 subagent ↔ レビュー subagent」のループを最大3回実行し、プロセスを固定化する。

---

## ワークフロー

```
1. タスク分析
   ↓
2. 実装 subagent で実装
   ↓
3. レビュー subagent で自動レビュー
   ↓
4. 問題があれば実装 subagent で修正
   ↓
5. 再レビュー（最大3回ループ）
   ↓
6. 合格したら完了報告
```

---

## 実行手順

### Step 1: タスク内容の確認

ユーザーから提供されたタスク内容を分析する:

- 実装する機能の要件
- 関連ファイル
- 制約条件
- 期待される品質基準

不明点があれば `AskUserQuestion` で確認する。

---

### Step 2: 実装フェーズ

**Implementer Subagent** を起動し、実装を行う:

```typescript
Task({
  subagent_type: "general-purpose",
  description: "実装を実行",
  prompt: `
# 実装タスク

以下の要件に基づいて実装を行ってください:

${タスク内容}

## 実装ガイドライン

${Read("~/.claude/skills/implement-with-review/subagents/implementer.md")}

## 制約

- TDD の原則に従う（テストを先に書く）
- セキュリティを考慮する（OWASP Top 10）
- 過剰な機能追加は避ける
- コメントは最小限に

## 成果物

実装完了後、以下を報告してください:

1. 変更したファイルのリスト
2. 主要な変更内容の要約
3. テスト結果
4. 懸念事項（あれば）
`
});
```

---

### Step 3: レビューフェーズ

**Reviewer Subagent** を起動し、実装をレビューする:

```typescript
Task({
  subagent_type: "general-purpose",
  description: "実装をレビュー",
  prompt: `
# レビュータスク

以下の実装をレビューしてください:

## 変更されたファイル

${変更ファイルリスト}

## レビューガイドライン

${Read("~/.claude/skills/implement-with-review/subagents/reviewer.md")}

## レビュー項目

1. **コード品質**
   - 可読性
   - 保守性
   - DRY原則

2. **セキュリティ**
   - OWASP Top 10
   - 機密情報の露出
   - インジェクション攻撃

3. **パフォーマンス**
   - 不要な処理
   - メモリリーク
   - 最適化の余地

4. **テスト**
   - カバレッジ
   - エッジケース
   - 実環境での動作確認

5. **ドキュメント**
   - README の更新
   - CLAUDE.md の更新
   - コメントの適切性

## 出力形式

以下の形式でレビュー結果を報告してください:

\`\`\`json
{
  "status": "approved" | "needs_revision",
  "issues": [
    {
      "severity": "critical" | "major" | "minor",
      "category": "security" | "performance" | "quality" | "test" | "documentation",
      "file": "ファイルパス",
      "line": 行番号,
      "description": "問題の説明",
      "suggestion": "修正案"
    }
  ],
  "summary": "総評"
}
\`\`\`
`
});
```

---

### Step 4: 修正ループ

レビュー結果に基づいて修正を行う:

```typescript
let loopCount = 0;
const MAX_LOOPS = 3;

while (loopCount < MAX_LOOPS) {
  const reviewResult = await getReviewResult();

  if (reviewResult.status === "approved") {
    // レビュー合格
    reportSuccess(reviewResult);
    break;
  }

  if (reviewResult.issues.some(i => i.severity === "critical")) {
    // Critical 問題がある場合は必ず修正
    await fixIssues(reviewResult.issues);
    loopCount++;
  } else if (loopCount === MAX_LOOPS - 1) {
    // 最終ループで Minor 問題のみなら合格とする
    reportSuccessWithWarnings(reviewResult);
    break;
  } else {
    // Minor/Major 問題を修正
    await fixIssues(reviewResult.issues);
    loopCount++;
  }
}

if (loopCount >= MAX_LOOPS) {
  reportMaxLoopsReached();
}
```

---

### Step 5: 完了報告

最終的な結果をユーザーに報告する:

```markdown
# 実装レビューループ完了

## 実装内容

- 変更ファイル: ${変更ファイルリスト}
- ループ回数: ${loopCount}

## レビュー結果

- ステータス: ${status}
- Critical: ${criticalCount}
- Major: ${majorCount}
- Minor: ${minorCount}

## 主要な変更

${変更内容の要約}

## テスト結果

${テスト結果}

## 懸念事項

${懸念事項}

## 次のステップ

- [ ] 実環境での動作確認
- [ ] ドキュメントの更新確認
- [ ] コミット作成
```

---

## 使用例

### 例1: 新機能の実装

```bash
/implement-with-review "ユーザー認証機能を実装する。JWT + bcrypt を使用。"
```

### 例2: バグ修正

```bash
/implement-with-review "ログイン時にセッションが切れるバグを修正する。"
```

### 例3: リファクタリング

```bash
/implement-with-review "UserService クラスをリファクタリングし、可読性を向上させる。"
```

---

## 制約事項

- 最大ループ回数: 3回
- Critical 問題が残る場合はループを継続
- Minor 問題のみの場合は最終ループで合格とする
- 各ループで必ずテストを実行
- 実環境での動作確認はユーザーが行う

---

## 成功基準

以下の条件を全て満たすことを成功とする:

1. レビューで Critical/Major 問題がない
2. テストが全て通過
3. セキュリティチェックに合格
4. ドキュメントが更新されている
5. コーディング規約に準拠

---

## エラーハンドリング

### ケース1: 実装が失敗

- エラーメッセージを確認
- 原因を特定
- 修正案を提示
- ユーザーに確認

### ケース2: テストが失敗

- 失敗したテストを特定
- 原因を分析
- 修正を実施
- 再テスト

### ケース3: レビューが何度も不合格

- 3回ループしても合格しない場合
- 残存問題をリスト化
- ユーザーに判断を仰ぐ

---

## 参考資料

- TDD ワークフロー: `@.claude/rules/tdd-workflow.md`
- コードレビューワークフロー: `@.claude/rules/code-review-workflow.md`
- セキュリティ原則: `@.claude/rules/security.md`
