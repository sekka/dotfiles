# 未使用コード削除ルール

## 目的

未使用のコードを検出・削除し、コードベースをクリーンに保つ。

---

## 対象

### 1. 未使用の変数

```typescript
// Bad
const unusedVariable = 123;
const usedVariable = 456;

console.log(usedVariable);

// Good
const usedVariable = 456;
console.log(usedVariable);
```

### 2. 未使用の import

```typescript
// Bad
import { useState, useEffect, useMemo } from 'react';  // useMemo 未使用

function Component() {
  const [count] = useState(0);
  return <div>{count}</div>;
}

// Good
import { useState } from 'react';

function Component() {
  const [count] = useState(0);
  return <div>{count}</div>;
}
```

### 3. 未使用の関数

```typescript
// Bad
function unusedHelper() {
  return 'unused';
}

function usedHelper() {
  return 'used';
}

export function main() {
  return usedHelper();
}

// Good
function usedHelper() {
  return 'used';
}

export function main() {
  return usedHelper();
}
```

### 4. 未使用の型定義

```typescript
// Bad
type UnusedType = { value: string };
type UsedType = { value: number };

const data: UsedType = { value: 123 };

// Good
type UsedType = { value: number };

const data: UsedType = { value: 123 };
```

---

## 検出方法

### TypeScript の場合

```bash
# TypeScript Compiler の unused チェック
tsc --noUnusedLocals --noUnusedParameters --noEmit
```

### ESLint の場合

```json
{
  "rules": {
    "no-unused-vars": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

---

## 例外パターン

### 1. 意図的に未使用の変数（destructuring）

```typescript
// OK: 一部のプロパティのみを使用
const { name, ...rest } = user;  // rest は意図的に未使用の場合がある
```

### 2. 関数の引数（インターフェース実装）

```typescript
// OK: インターフェース実装のため全引数が必要
interface Handler {
  handle(event: Event, context: Context): void;
}

class MyHandler implements Handler {
  // context は未使用だが、インターフェース実装のため必須
  handle(event: Event, context: Context) {
    console.log(event);
  }
}
```

この場合は `_` プレフィックスで明示:

```typescript
class MyHandler implements Handler {
  handle(event: Event, _context: Context) {
    console.log(event);
  }
}
```

### 3. 型定義のみの import

```typescript
// OK: 型として使用
import type { User } from './types';

function greet(user: User) {
  console.log(`Hello, ${user.name}`);
}
```

---

## 自動修正

### 安全に削除できるケース

- ローカル変数（他のファイルから参照されない）
- private メソッド（外部から参照されない）
- 未使用の import

### 慎重に判断すべきケース

- export された関数・型（他のファイルで使われている可能性）
- public メソッド（継承先で使われている可能性）
- グローバル変数

---

## チェックリスト

- [ ] 未使用の変数を削除
- [ ] 未使用の import を削除
- [ ] 未使用の関数を削除
- [ ] 未使用の型定義を削除
- [ ] テストが通ることを確認
- [ ] ビルドが成功することを確認

---

## 参考資料

- [TypeScript: Compiler Options](https://www.typescriptlang.org/tsconfig#noUnusedLocals)
- [ESLint: no-unused-vars](https://eslint.org/docs/latest/rules/no-unused-vars)
