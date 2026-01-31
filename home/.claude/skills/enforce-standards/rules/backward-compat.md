# 後方互換コード削除ルール

## 目的

後方互換性のために残されたコードや、削除されたコードのコメントを削除し、コードベースをクリーンに保つ。

---

## 対象

### 1. コメントアウトされたコード

```typescript
// Bad
function login(email: string, password: string) {
  // const oldLogic = () => {
  //   // 古いロジック
  //   return validateOld(email);
  // };

  return validateNew(email, password);
}

// Good
function login(email: string, password: string) {
  return validateNew(email, password);
}
```

**理由:**
- Git履歴で確認できる
- コードが読みにくくなる
- 混乱を招く

### 2. `_` プレフィックスの未使用変数

```typescript
// Bad
function process(data: Data) {
  const _oldVariable = data.old;  // 使われていない
  const newVariable = data.new;

  return newVariable;
}

// Good
function process(data: Data) {
  const newVariable = data.new;
  return newVariable;
}
```

**例外:** インターフェース実装で必須の引数

```typescript
// OK: インターフェース実装のため必要
interface Handler {
  handle(event: Event, context: Context): void;
}

class MyHandler implements Handler {
  handle(event: Event, _context: Context) {
    // context は使わないが、インターフェース実装のため必須
    console.log(event);
  }
}
```

### 3. `// removed`, `// deprecated` などのマーカー

```typescript
// Bad
function authenticate(user: User) {
  // Removed: old authentication logic
  // This was deprecated in v2.0
  return newAuth(user);
}

// Good
function authenticate(user: User) {
  return newAuth(user);
}
```

### 4. 使われていない古いコード

```typescript
// Bad
// 旧バージョンとの互換性のため残す
function oldCalculate(x: number): number {
  return x * 2;
}

function newCalculate(x: number): number {
  return x * 3;
}

export function calculate(x: number): number {
  return newCalculate(x);
}

// Good
function calculate(x: number): number {
  return x * 3;
}

export { calculate };
```

---

## 検出パターン

### 1. コメントアウトされたコードの検出

**パターン:**
- 複数行にわたるコメント（`//` が連続）
- ブロックコメント内のコード（`/* ... */`）

**ヒューリスティック:**
- セミコロンで終わる行
- `{` や `}` を含む行
- `function`, `const`, `let`, `var` などのキーワード

```regex
// コメントアウトされたコード検出パターン
^[\s]*\/\/[\s]*(const|let|var|function|class|if|for|while)\b
```

### 2. `_` プレフィックス変数の検出

```regex
// アンダースコアで始まる変数
(const|let|var)[\s]+_[a-zA-Z0-9]+[\s]*=
```

### 3. 削除マーカーの検出

```regex
// removed|deprecated|TODO: remove などのマーカー
\/\/[\s]*(removed|deprecated|obsolete|TODO:[\s]*remove)
```

---

## 例外パターン

### 1. ドキュメントコメント

```typescript
// OK: ドキュメントとしてのコメント
/**
 * Example usage:
 * ```
 * const result = calculate(10);
 * console.log(result);
 * ```
 */
function calculate(x: number): number {
  return x * 3;
}
```

### 2. 説明のためのコメント

```typescript
// OK: アルゴリズムの説明
function quickSort(arr: number[]): number[] {
  // ピボットを選択（中央の要素）
  const pivot = arr[Math.floor(arr.length / 2)];
  // ...
}
```

### 3. TODO コメント（実装予定）

```typescript
// OK: 実装予定のTODO
function process(data: Data) {
  // TODO: エラーハンドリングを追加
  return data.value;
}
```

---

## 自動修正

### 安全に削除できるケース

1. **明らかにコードのコメント**
   - `// const oldValue = 123;`
   - `// function oldHelper() { ... }`

2. **削除マーカーとその前後の行**
   - `// Removed: ...` とその周辺

3. **未使用の `_` プレフィックス変数**
   - 参照されていない変数

### 慎重に判断すべきケース

1. **複雑なコメント**
   - コードと説明が混在

2. **インターフェース実装の `_` 変数**
   - 必須引数の場合は残す

---

## ユーザー確認が必要なケース

以下のパターンは自動削除せず、ユーザーに確認:

```typescript
// ケース1: 大量のコメントアウトコード（10行以上）
// → 本当に削除してよいか確認

// ケース2: TODOと一緒にコメントアウト
// TODO: この機能を実装
// const futureFeature = () => { ... };
// → 実装予定の可能性があるため確認

// ケース3: 条件付きコンパイル風のコメント
// #if DEBUG
// const debugValue = 123;
// #endif
// → 特殊なケースのため確認
```

---

## チェックリスト

- [ ] コメントアウトされたコードを削除
- [ ] `_` プレフィックスの未使用変数を削除
- [ ] 削除マーカーとその周辺を削除
- [ ] 使われていない古いコードを削除
- [ ] ドキュメントコメントは残す
- [ ] TODO コメント（実装予定）は残す
- [ ] テストが通ることを確認

---

## 参考資料

- [Google JavaScript Style Guide: Comments](https://google.github.io/styleguide/jsguide.html#formatting-comments)
- [Airbnb JavaScript Style Guide: Comments](https://github.com/airbnb/javascript#comments)
