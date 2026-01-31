# コーディング規約強制スキル

## 概要

コーディング規約を自動的にチェック・修正し、コードベースの一貫性と品質を保つスキル。
松尾研究所の実践的なAIコーディング管理手法から着想を得て、「長文インストラクションで埋もれやすい指示」をスキルとして固定化。

## 着想元

> 長文インストラクションで埋もれやすい禁止事項（後方互換コード削除、未使用変数削除など）をSkillsで定義。都度の確認は必要ですが、複数ターン実行時の精度向上に寄与します。

出典: https://zenn.dev/mkj/articles/868e0723efa060

## 特徴

- **5つのルールで包括的にチェック**: 未使用コード、後方互換コード、console.log、フォーマット、型安全性
- **自動修正とユーザー確認の使い分け**: 安全な修正は自動、慎重な判断が必要な箇所はユーザーに確認
- **カスタマイズ可能**: プロジェクト固有の規約をルールファイルで定義
- **コミット前の自動実行**: hook で自動化可能

## 使い方

### 基本的な使用法

```bash
# カレントディレクトリ全体をチェック
/enforce-standards

# 特定のファイル
/enforce-standards src/auth/login.ts

# 特定のディレクトリ
/enforce-standards src/components/

# チェックのみ（修正しない）
/enforce-standards --check-only

# 自動修正モード
/enforce-standards --fix

# インタラクティブモード
/enforce-standards --interactive
```

## チェック項目

### 1. 未使用コードの削除

- 未使用の変数
- 未使用の import
- 未使用の関数
- 未使用の型定義

**ルール詳細:** `rules/unused-code.md`

### 2. 後方互換コードの削除

- コメントアウトされたコード
- `_variable` のような未使用変数のリネーム
- `// removed` などのコメント
- 使われていない古いコード

**ルール詳細:** `rules/backward-compat.md`

### 3. console.log の削除

- `console.log`、`console.debug`、`console.info`
- ただし、`console.error`、`console.warn` は許可
- テストファイルは除外

**ルール詳細:** `rules/console-log.md`

### 4. フォーマット統一

- インデント（スペース2個）
- セミコロン（必須）
- シングルクォート
- 末尾カンマ（ES5準拠）

**ルール詳細:** `rules/formatting.md`

### 5. 型安全性チェック

- `any` 型の濫用
- 型注釈の欠落
- 型アサーション (`as`) の濫用
- `@ts-ignore` の濫用

**ルール詳細:** `rules/type-safety.md`

## 実行モード

### 1. チェックのみ（デフォルト）

```bash
/enforce-standards --check-only
```

問題を検出して報告のみ。ファイルは変更しない。

### 2. 自動修正モード

```bash
/enforce-standards --fix
```

修正可能な問題を自動修正。修正不可能な問題は報告。

### 3. インタラクティブモード

```bash
/enforce-standards --interactive
```

各問題について修正するか確認。ユーザーが承認した問題のみ修正。

## 出力例

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
```

## コミット前の自動実行

hook で自動実行する設定:

```typescript
// home/.claude/hooks/enforce-standards-on-commit.ts

export default {
  onBeforeCommit: async () => {
    return {
      message: "コーディング規約チェックを実行中...",
      autoRunSkill: "enforce-standards --fix"
    };
  }
};
```

## カスタマイズ

### ルールのカスタマイズ

各ルールファイル（`rules/*.md`）を編集してプロジェクト固有の規約を反映。

**例: console.log を許可する**

`rules/console-log.md` を編集:

```markdown
## 例外パターン

- テストファイル (`*.test.ts`, `*.spec.ts`)
- 開発環境のみのファイル (`*.dev.ts`)
- デバッグユーティリティ (`src/utils/debug.ts`)  ← 追加
```

### 除外設定

`.enforcerc.json` を作成:

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

## 成功基準

以下の条件を満たすことを成功とする:

1. 全ての未使用コードが削除されている
2. 後方互換コードが削除されている
3. console.log が削除されている（本番環境）
4. フォーマットが統一されている
5. `any` 型の濫用がない

## 制約事項

- 構文解析が必要な高度なチェックは TypeScript Compiler API を使用
- バイナリファイルは除外
- 大きなファイル（10,000行以上）は警告を表示
- 並列処理なし（順次処理）

## トラブルシューティング

### Q1: 自動修正が aggressive すぎる

**A:** `--interactive` モードを使用して、1つずつ確認しながら修正。

### Q2: 特定のルールを無効化したい

**A:** `.enforcerc.json` でルールを `false` に設定。

```json
{
  "rules": {
    "console-log": false
  }
}
```

### Q3: 構文エラーで失敗する

**A:** 構文エラーのあるファイルはスキップされます。先に構文エラーを修正してください。

## 今後の拡張案

### 1. セキュリティチェック

- SQL インジェクション
- XSS 脆弱性
- 機密情報のハードコード

### 2. パフォーマンスチェック

- N+1 クエリ
- 不要な再レンダリング
- メモリリーク

### 3. アクセシビリティチェック

- ARIA 属性
- セマンティック HTML
- キーボードナビゲーション

## 参考資料

- [松尾研究所の実践的なAIコーディング管理手法](https://zenn.dev/mkj/articles/868e0723efa060)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)

## ライセンス

MIT License

## バージョン履歴

- v1.0.0 (2026-01-31): 初版リリース
  - 5つのルール（未使用コード、後方互換コード、console.log、フォーマット、型安全性）
  - 3つの実行モード（チェックのみ、自動修正、インタラクティブ）
  - カスタマイズ可能な設定
