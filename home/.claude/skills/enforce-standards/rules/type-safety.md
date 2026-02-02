# 型安全性チェックルール

## 目的

TypeScript の型システムを最大限活用し、型安全性を確保する。

---

## 対象

### 1. `any` 型の濫用

```typescript
// Bad
function processData(data: any): any {
  return data.value;
}

// Good
interface DataInput {
  value: string;
}

function processData(data: DataInput): string {
  return data.value;
}
```

**理由:**
- 型チェックが無効化される
- ランタイムエラーの原因
- IDE の補完が効かない

### 2. 型注釈の欠落

```typescript
// Bad
function calculate(x, y) {  // 型注釈なし
  return x + y;
}

// Good
function calculate(x: number, y: number): number {
  return x + y;
}
```

### 3. 型アサーション (`as`) の濫用

```typescript
// Bad
const data = JSON.parse(jsonString) as User;  // 検証なし

// Good
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' &&
         obj !== null &&
         'name' in obj &&
         'email' in obj;
}

const data = JSON.parse(jsonString);
if (isUser(data)) {
  // data は User 型
  console.log(data.name);
}
```

### 4. `@ts-ignore` の濫用

```typescript
// Bad
// @ts-ignore
const result = user.nonExistentProperty;

// Good
interface User {
  name: string;
  email: string;
  nonExistentProperty?: string;  // 型定義を修正
}

const result = user.nonExistentProperty;
```

---

## 許容される `any` の使用

### 1. 外部ライブラリの型定義がない場合

```typescript
// OK: 型定義がない外部ライブラリ
import oldLibrary from 'old-library';  // @types なし

const result: any = oldLibrary.process();
```

**推奨:** `@types` パッケージを探すか、自分で型定義を作成

```typescript
// Better
declare module 'old-library' {
  export function process(): string;
}
```

### 2. 高度に動的なデータ構造

```typescript
// OK: 完全に動的な JSON
const dynamicConfig: any = JSON.parse(configString);
```

**推奨:** 可能な限り型を定義

```typescript
// Better
interface Config {
  [key: string]: unknown;
}

const dynamicConfig: Config = JSON.parse(configString);
```

---

## 推奨パターン

### 1. ユニオン型の活用

```typescript
// Good
type Status = 'pending' | 'success' | 'error';

function handleStatus(status: Status) {
  switch (status) {
    case 'pending':
      // ...
      break;
    case 'success':
      // ...
      break;
    case 'error':
      // ...
      break;
  }
}
```

### 2. ジェネリクスの活用

```typescript
// Good
function identity<T>(value: T): T {
  return value;
}

const num = identity(123);  // number
const str = identity('abc');  // string
```

### 3. 型ガードの活用

```typescript
// Good
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function process(value: unknown) {
  if (isString(value)) {
    // value は string 型
    console.log(value.toUpperCase());
  }
}
```

### 4. `unknown` の活用

```typescript
// Good: any の代わりに unknown
function parse(input: unknown): User {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Invalid input');
  }

  // 型ガードで検証
  if (isUser(input)) {
    return input;
  }

  throw new Error('Not a User');
}
```

---

## tsconfig.json の推奨設定

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## 検出方法

### ESLint ルール

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/ban-ts-comment": "error"
  }
}
```

---

## 自動修正

### 修正可能なケース

1. **明らかな型推論**

```typescript
// Before
const value: any = 123;

// After
const value: number = 123;
```

2. **関数の返り値**

```typescript
// Before
function add(a: number, b: number) {
  return a + b;
}

// After
function add(a: number, b: number): number {
  return a + b;
}
```

### 手動修正が必要なケース

1. **複雑な型定義**
2. **外部ライブラリとの連携**
3. **動的なデータ構造**

---

## ユーザー確認が必要なケース

```typescript
// ケース1: 意図的な any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dynamic: any = ...;
// → 本当に any が必要か確認

// ケース2: 型アサーション
const data = response as User;
// → 検証なしの型アサーションは危険。型ガードに置き換えるか確認

// ケース3: @ts-ignore
// @ts-ignore
const value = obj.property;
// → なぜ無視が必要か確認。型定義の修正を検討
```

---

## チェックリスト

- [ ] `any` 型を使用していない（または理由がある）
- [ ] 全ての関数に型注釈がある
- [ ] 型アサーションは最小限
- [ ] `@ts-ignore` を使用していない
- [ ] `strict` モードが有効
- [ ] 型ガードを適切に使用
- [ ] `unknown` を活用

---

## 参考資料

- [TypeScript: strict](https://www.typescriptlang.org/tsconfig#strict)
- [TypeScript: Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [@typescript-eslint: no-explicit-any](https://typescript-eslint.io/rules/no-explicit-any/)
