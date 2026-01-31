# console.log 削除ルール

## 目的

デバッグ用の `console.log` を本番環境から削除し、適切なロギングライブラリを使用する。

---

## 対象

### 削除対象

```typescript
// Bad
console.log('Debug:', user);
console.debug('Debugging info');
console.info('Information');
console.dir(object);
console.table(data);
```

### 許可

```typescript
// OK: エラーと警告は許可
console.error('Error occurred:', error);
console.warn('Warning: deprecated API');
```

---

## 理由

### 1. セキュリティ

```typescript
// Bad: 機密情報が漏洩する可能性
console.log('User data:', {
  email: user.email,
  password: user.password  // ← 本番環境で出力されると危険
});
```

### 2. パフォーマンス

```typescript
// Bad: 本番環境でのパフォーマンス低下
for (let i = 0; i < 10000; i++) {
  console.log('Processing:', i);  // ← 大量のログ出力
}
```

### 3. ノイズ

```typescript
// Bad: 本番環境でブラウザコンソールがノイズで埋まる
console.log('Component mounted');
console.log('Props:', props);
console.log('State:', state);
```

---

## 推奨される代替手段

### 1. ロギングライブラリ

```typescript
// Good: 適切なロギングライブラリを使用
import logger from './utils/logger';

logger.info('User logged in', { userId: user.id });
logger.error('Login failed', { error });

// logger.ts の実装例
const logger = {
  info: (message: string, meta?: object) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[INFO]', message, meta);
    }
    // 本番環境では外部サービスに送信（Sentry、Datadog等）
  },
  error: (message: string, meta?: object) => {
    console.error('[ERROR]', message, meta);
    // 本番環境でもエラーは記録
  }
};
```

### 2. デバッグ専用ユーティリティ

```typescript
// Good: 開発環境のみで動作
const debug = process.env.NODE_ENV === 'development'
  ? console.log.bind(console)
  : () => {};

debug('This only logs in development');
```

### 3. React DevTools など専用ツール

```typescript
// Good: React DevTools を使用
// console.log ではなく、DevTools の Profiler や Components タブで確認
```

---

## 例外パターン

### 1. テストファイル

```typescript
// OK: テストファイルでは許可
// test/example.test.ts

describe('Example', () => {
  test('should work', () => {
    console.log('Test output');  // テスト時のデバッグは許可
    expect(true).toBe(true);
  });
});
```

**パターン:**
- `*.test.ts`
- `*.spec.ts`
- `__tests__/**/*.ts`

### 2. 開発環境専用ファイル

```typescript
// OK: 開発環境専用ファイル
// src/utils/debug.ts

export function debugLog(...args: any[]) {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);  // 開発環境のみのユーティリティは許可
  }
}
```

**パターン:**
- `*.dev.ts`
- `src/utils/debug.ts`
- `src/dev/**/*.ts`

### 3. CLIツール

```typescript
// OK: CLIツールでは標準出力として使用
// bin/cli.ts

console.log('Processing file:', filename);  // CLIの出力は許可
```

**パターン:**
- `bin/**/*.ts`
- `cli/**/*.ts`
- スクリプトファイル（`scripts/**/*.ts`）

---

## 検出方法

### 正規表現パターン

```regex
console\.(log|debug|info|dir|table)[\s]*\(
```

### ファイルタイプ別

**対象:**
- `src/**/*.ts`
- `src/**/*.tsx`
- `src/**/*.js`
- `src/**/*.jsx`

**除外:**
- `*.test.ts`、`*.spec.ts`
- `*.dev.ts`
- `bin/**`、`scripts/**`

---

## 自動修正

### 1. 単純削除

```typescript
// Before
function login(user: User) {
  console.log('Logging in:', user);
  return authenticate(user);
}

// After
function login(user: User) {
  return authenticate(user);
}
```

### 2. ロガーへの置き換え（オプション）

```typescript
// Before
console.log('User logged in:', userId);

// After
logger.info('User logged in', { userId });
```

---

## ユーザー確認が必要なケース

以下のパターンは自動削除せず、ユーザーに確認:

```typescript
// ケース1: 複雑な条件付きログ
if (DEBUG_MODE) {
  console.log('Debug info:', data);
}
// → DEBUG_MODE の定義を確認

// ケース2: エラーハンドリング内
try {
  // ...
} catch (error) {
  console.log('Error:', error);  // console.error に変更すべきか確認
}

// ケース3: 意図的なログ
// NOTE: 本番環境でも必要なログ
console.log('Application started');
// → 本当に必要か確認
```

---

## チェックリスト

- [ ] `console.log` を削除
- [ ] `console.debug` を削除
- [ ] `console.info` を削除（本番環境）
- [ ] `console.error` は残す
- [ ] `console.warn` は残す
- [ ] テストファイルは除外
- [ ] 開発環境専用ファイルは除外
- [ ] ロギングライブラリへの移行を検討

---

## 参考資料

- [ESLint: no-console](https://eslint.org/docs/latest/rules/no-console)
- [Airbnb JavaScript Style Guide: Console](https://github.com/airbnb/javascript#console)
- [Sentry JavaScript SDK](https://docs.sentry.io/platforms/javascript/)
