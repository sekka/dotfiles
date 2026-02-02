# コーディング規約強制スキル

## 目的

コーディング規約を自動的にチェック・修正し、コードベースの一貫性と品質を保つ。
「長文インストラクションで埋もれやすい指示」をスキルとして固定化する。

---

## 着想元

松尾研究所の実践的なAIコーディング管理手法から着想を得た。

> 長文インストラクションで埋もれやすい禁止事項（後方互換コード削除、未使用変数削除など）をSkillsで定義。都度の確認は必要ですが、複数ターン実行時の精度向上に寄与します。

出典: https://zenn.dev/mkj/articles/868e0723efa060

---

## チェック項目

### 1. 未使用コードの削除

**対象:**
- 未使用の変数
- 未使用の import
- 未使用の関数
- 未使用の型定義

**ルール詳細:** `${Read("~/.claude/skills/enforce-standards/rules/unused-code.md")}`

### 2. 後方互換コードの削除

**対象:**
- コメントアウトされたコード
- `_variable` のような未使用変数のリネーム
- `// removed` などのコメント
- 使われていない古いコード

**ルール詳細:** `${Read("~/.claude/skills/enforce-standards/rules/backward-compat.md")}`

### 3. console.log の削除

**対象:**
- `console.log`
- `console.debug`
- `console.info`（本番環境）

**例外:**
- `console.error`（エラーログは許可）
- `console.warn`（警告ログは許可）

**ルール詳細:** `${Read("~/.claude/skills/enforce-standards/rules/console-log.md")}`

### 4. フォーマット統一

**対象:**
- インデント（スペース2個 or 4個）
- セミコロンの有無
- シングルクォート vs ダブルクォート
- 末尾カンマ

**ルール詳細:** `${Read("~/.claude/skills/enforce-standards/rules/formatting.md")}`

### 5. 型安全性チェック

**対象:**
- `any` 型の濫用
- 型注釈の欠落
- 型アサーション (`as`) の濫用
- `@ts-ignore` の濫用

**ルール詳細:** `${Read("~/.claude/skills/enforce-standards/rules/type-safety.md")}`

---

## 実行フロー

### Step 1: 対象ファイルの特定

ユーザーが指定したファイルまたはディレクトリを対象とする。

**例:**

```bash
# 単一ファイル
/enforce-standards src/auth/login.ts

# ディレクトリ全体
/enforce-standards src/

# カレントディレクトリ
/enforce-standards .
```

指定がない場合は、変更されたファイル（git diff）を対象とする。

### Step 2: 各ルールのチェック

各ルールに基づいてファイルを解析:

1. **未使用コードの検出**
   - ESLint の `no-unused-vars` 相当
   - TypeScript の unused import 検出

2. **後方互換コードの検出**
   - コメントアウトされたコード（`// ...`、`/* ... */`）
   - `_` で始まる未使用変数
   - `// TODO: remove`, `// DEPRECATED` などのマーカー

3. **console.log の検出**
   - `console.log`、`console.debug`、`console.info` の検出
   - ただし、テストファイルは除外

4. **フォーマットチェック**
   - Prettier または ESLint の設定に準拠

5. **型安全性チェック**
   - `any` 型の使用箇所
   - 型注釈の欠落
   - `@ts-ignore` の使用箇所

### Step 3: 自動修正

修正可能な問題は自動的に修正:

```typescript
// Before
import { useState, useEffect, useMemo } from 'react';  // useMemo は未使用

function Component() {
  const [count, setCount] = useState(0);
  // const oldLogic = () => { ... };  // コメントアウト
  console.log('Debug:', count);  // console.log

  return <div>{count}</div>;
}

// After
import { useState, useEffect } from 'react';

function Component() {
  const [count, setCount] = useState(0);

  return <div>{count}</div>;
}
```

### Step 4: 修正不可能な問題の報告

自動修正できない問題を報告:

```json
{
  "file": "src/auth/login.ts",
  "issues": [
    {
      "rule": "type-safety",
      "line": 45,
      "severity": "warning",
      "message": "any 型を使用しています。具体的な型を指定してください。",
      "code": "function handleLogin(data: any) { ... }"
    }
  ]
}
```

### Step 5: サマリー出力

```markdown
# コーディング規約チェック完了

## 修正結果

✅ 自動修正: 15件
⚠️ 要確認: 3件

## 詳細

### src/auth/login.ts

**自動修正 (5件):**
- 未使用 import を削除: `useMemo`
- コメントアウトされたコードを削除: 行12-18
- console.log を削除: 行34, 67, 89

**要確認 (1件):**
- [Warning] any 型を使用: 行45
  ```typescript
  function handleLogin(data: any) { ... }
  ```
  **推奨:** `LoginData` 型を定義してください

### src/components/UserList.tsx

**自動修正 (10件):**
- 未使用変数を削除: `_oldData`, `_tempValue`
- フォーマット統一: インデント修正
- 末尾カンマ追加

**要確認 (2件):**
- [Warning] @ts-ignore を使用: 行23
- [Warning] 型注釈が欠落: 行56

---

## 次のステップ

- [ ] 要確認の問題を手動で修正
- [ ] テストを実行して動作確認
- [ ] コミット作成
```

---

## ルールのカスタマイズ

各ルールファイルを編集してプロジェクト固有の規約を反映:

### 例: console.log を許可する

`rules/console-log.md` を編集:

```markdown
## 例外パターン

- テストファイル (`*.test.ts`, `*.spec.ts`)
- 開発環境のみのファイル (`*.dev.ts`)
- デバッグユーティリティ (`src/utils/debug.ts`)  ← 追加
```

### 例: `any` 型を部分的に許可

`rules/type-safety.md` を編集:

```markdown
## 許可される `any` の使用

- 外部ライブラリの型定義がない場合
- レガシーコードのインターフェース  ← 追加
```

---

## 実行モード

### 1. チェックのみ（デフォルト）

```bash
/enforce-standards --check-only
```

- 問題を検出して報告のみ
- ファイルは変更しない

### 2. 自動修正モード

```bash
/enforce-standards --fix
```

- 修正可能な問題を自動修正
- 修正不可能な問題は報告

### 3. インタラクティブモード

```bash
/enforce-standards --interactive
```

- 各問題について修正するか確認
- ユーザーが承認した問題のみ修正

---

## コミット前の自動実行（オプション）

hook で自動実行する設定:

```typescript
// home/.claude/hooks/enforce-standards-on-commit.ts

export default {
  onBeforeCommit: async () => {
    // 変更されたファイルに対して enforce-standards を実行
    return {
      message: "コーディング規約チェックを実行中...",
      autoRunSkill: "enforce-standards --fix"
    };
  }
};
```

---

## 除外設定

特定のファイルやディレクトリを除外:

### .enforcerc.json

```json
{
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**",
    "*.min.js",
    "vendor/**",
    "legacy/**"
  ],
  "rules": {
    "unused-code": true,
    "backward-compat": true,
    "console-log": true,
    "formatting": true,
    "type-safety": "warn"
  }
}
```

---

## エラーハンドリング

### ケース1: 構文エラーがある場合

- 構文エラーのあるファイルはスキップ
- エラーメッセージを表示
- 他のファイルの処理は継続

### ケース2: ルールファイルが見つからない

- デフォルトルールを使用
- 警告を表示

### ケース3: 自動修正が失敗

- 元のファイルを保持
- エラーメッセージを表示
- 次のファイルに進む

---

## 制約事項

- 構文解析が必要な高度なチェックは TypeScript Compiler API を使用
- バイナリファイルは除外
- 大きなファイル（10,000行以上）は警告を表示
- 並列処理なし（順次処理）

---

## 成功基準

以下の条件を満たすことを成功とする:

1. 全ての未使用コードが削除されている
2. 後方互換コードが削除されている
3. console.log が削除されている（本番環境）
4. フォーマットが統一されている
5. `any` 型の濫用がない

---

## 参考資料

- TDD ワークフロー: `@.claude/rules/tdd-workflow.md`
- セキュリティ原則: `@.claude/rules/security.md`
- [松尾研究所の実践的なAIコーディング管理手法](https://zenn.dev/mkj/articles/868e0723efa060)
