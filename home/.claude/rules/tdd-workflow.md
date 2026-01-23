# テスト駆動開発（TDD）の実践

## 概要

コードを書く際は、テストファーストの原則に従い、品質と保守性を確保する。
TDDは単なるテスト手法ではなく、**設計手法**である。

---

## 実装の手順（5ステップ）

### 1. テストを先に書く

- **実装したい機能の期待動作をテストコードで表現**
- テストが失敗することを確認（**Red**フェーズ）
  - これで「正しく失敗するテスト」であることを検証
  - テストが緑になる状態で始めると、テストが意味を持たない可能性がある

**例（Jest）:**

```typescript
describe('ValidationHook', () => {
  test('should reject dangerous commands', () => {
    const result = validateCommand('rm -rf /');
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('危険');
  });
});
```

### 2. 最小限の実装

- テストを通過する**最小限のコード**を書く（**Green**フェーズ）
- 過剰な機能追加は避ける
- 「動けばOK」の段階

**例:**

```typescript
function validateCommand(cmd: string): ValidationResult {
  if (cmd.includes('rm -rf')) {
    return { approved: false, reason: '危険なコマンド' };
  }
  return { approved: true };
}
```

### 3. 実環境での動作確認（必須）

**IMPORTANT:** ユニットテストだけでは不十分。

- 実際の環境で実行し、期待通り動作することを確認
- 統合テストや手動テストを実施

**例（hooks の場合）:**

- スクリプトテストが通っても、実際にClaude Codeで実行して確認
- ファイル監視、ネットワークリクエスト、環境変数など、モックできない部分を検証

### 4. 失敗したテストへの対応

- テストが失敗したら、**その場で原因を特定し修正**
- 「後で調べる」「たぶん大丈夫」と先送りしない
- 原因不明のまま次に進まない

**対応フロー:**

1. エラーメッセージを読む
2. スタックトレースを確認
3. デバッガーやconsole.logで変数の中身を確認
4. 原因を特定して修正
5. 再度テスト実行

### 5. 完了の定義

以下の**両方**を満たして初めて完了：

- テストが全て通る
- 実環境で期待通り動作する

---

## 判断基準

以下の状況では「未完了」と判断する：

- スクリプトテストは通るが、実環境で確認していない
- 実環境で一部のケースしか確認していない
- エラーや警告を無視している
- 「動いているように見える」だけで確認が不十分

---

## なぜこれが重要か

横着して実環境テストをスキップすると：

- **問題の発見が遅れ、修正コストが増大**
  - バグが深く埋もれると、原因特定に何倍も時間がかかる
- **原因特定に余計な時間がかかる**
  - 複数の変更が混在すると、どこが悪いか分からない
- **ユーザーの信頼を失う**
  - 「テストは通っているのに動かない」は最悪のパターン

**最初から丁寧にテストする方が、結果的に最も効率的で確実。**

---

## 失敗パターンと対策

### パターン1: テストをスキップ

**症状:**

- 「簡単な変更だから」とテストを書かない
- 後でテストを書くつもりが、忘れる

**対策:**

- **No Code Without Test**: テストなしのコードは書かない
- コミットフックでテストカバレッジをチェック

### パターン2: 実環境テストの省略

**症状:**

- ユニットテストだけで満足
- 実際に動かしたら動かない

**対策:**

- チェックリストに「実環境テスト」を追加
- CI/CDパイプラインに統合テストを組み込む

### パターン3: 失敗テストの放置

**症状:**

- 「後で直す」とTODOコメントを残す
- いつまでも直さない

**対策:**

- **テストが失敗したらそこで止まる**
- 他の作業に移る前に必ず修正

---

## 実践例

### ケーススタディ: hooks実装

**シナリオ:** Git操作を監視するhookを実装

#### Step 1: テスト（Red）

```typescript
test('should detect git commit', () => {
  const event = { tool: 'Bash', command: 'git commit -m "test"' };
  const result = handleToolCall(event);
  expect(result.operation).toBe('commit');
});
```

テスト実行 → 失敗（`handleToolCall`未実装）

#### Step 2: 実装（Green）

```typescript
function handleToolCall(event) {
  if (event.command?.includes('git commit')) {
    return { operation: 'commit' };
  }
}
```

テスト実行 → 成功

#### Step 3: 実環境テスト

1. Claude Codeで実際に `git commit` を実行
2. hookが発火することを確認
3. ログに `operation: commit` が出力されることを確認

#### Step 4: リファクタリング（Refactor）

```typescript
function handleToolCall(event: ToolCallEvent): GitOperation | null {
  const gitPattern = /git\s+(commit|push|pull)/;
  const match = event.command?.match(gitPattern);
  return match ? { operation: match[1] } : null;
}
```

テスト再実行 → 全て通過

---

## チェックリスト

実装完了前に以下を確認：

- [ ] テストを先に書いた（Red確認済み）
- [ ] 最小限の実装でテストを通過させた（Green）
- [ ] 実環境で動作確認した
- [ ] 失敗したテストを全て修正した
- [ ] エラー・警告がない
- [ ] エッジケースをテストした
- [ ] ドキュメントを更新した

---

## 参考資料

- [Test-Driven Development: By Example](https://www.amazon.com/dp/0321146530) - Kent Beck
- [Growing Object-Oriented Software, Guided by Tests](https://www.amazon.com/dp/0321503627)
- [Jest公式ドキュメント](https://jestjs.io/)
