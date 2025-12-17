# TypeScript

型定義、移行パターン、設計改善に関するナレッジ集。

---

## JS→TS 移行で発見される設計問題

> 出典: https://zenn.dev/ktsushima/articles/js-to-ts-migration-learnings
> 執筆日: 不明
> 追加日: 2025-12-17

TypeScript 移行は「型を書くだけ」ではない。型を明示する過程で設計の曖昧さが浮き彫りになる。

### 核となる洞察

> 型を書く行為そのものが「気づく力」を高める

型定義時に考えるべき問い:
- 「この関数は何を返すべきか？」→ 設計の曖昧さ発見
- 「このデータは本当に信頼できるか？」→ バリデーション追加
- 「失敗パターンを考えたか？」→ エラーハンドリング強化
- 「この値は環境で変わるべきでは？」→ 設定管理導入
- 「この変数はいつまで有効か？」→ ライフタイム管理

---

### 問題1: メモリリーク（イベントハンドラ削除の欠落）

```javascript
// ❌ 問題: 削除手段がない
export function onDeviceUpdated(callback) {
  connection.on("deviceUpdated", callback);
}
```

```typescript
// ✅ 解決: クリーンアップ関数を返す
export function onDeviceUpdated(
  callback: (data: DeviceUpdate) => void
): () => void {
  connection?.on("deviceUpdated", callback);
  return () => connection?.off("deviceUpdated", callback);
}

// 使用例（Vue）
onMounted(() => {
  const cleanup = onDeviceUpdated((data) => {
    /* ... */
  });
  onUnmounted(cleanup);
});

// 使用例（React）
useEffect(() => {
  const cleanup = onDeviceUpdated((data) => {
    /* ... */
  });
  return cleanup;
}, []);
```

**学び:** 戻り値の型を明示すると「何を返すべきか」という設計思考が促される。

---

### 問題2: ランタイム検証の欠如

**重要:** TypeScript の型はコンパイル時のみ有効。外部データ（API レスポンス等）はランタイム検証が必要。

```typescript
interface NegotiateResponse {
  url: string;
  accessToken: string;
}

async function negotiate(): Promise<NegotiateResponse> {
  const response = await fetch(NEGOTIATE_URL);
  const data = await response.json();

  // ❌ 危険: 検証なしの型アサーション
  // return data as NegotiateResponse;

  // ✅ 安全: ランタイム検証後に型アサーション
  if (!data || typeof data !== "object") {
    throw new Error("Response is not an object");
  }
  if (typeof data.url !== "string" || !data.url) {
    throw new Error('Missing or invalid "url"');
  }
  if (typeof data.accessToken !== "string" || !data.accessToken) {
    throw new Error('Missing or invalid "accessToken"');
  }

  return data as NegotiateResponse;
}
```

**より良い方法: Zod などのバリデーションライブラリ**

```typescript
import { z } from "zod";

const NegotiateResponseSchema = z.object({
  url: z.string().url(),
  accessToken: z.string().min(1),
});

type NegotiateResponse = z.infer<typeof NegotiateResponseSchema>;

async function negotiate(): Promise<NegotiateResponse> {
  const response = await fetch(NEGOTIATE_URL);
  const data = await response.json();
  return NegotiateResponseSchema.parse(data); // 検証 + 型付け
}
```

---

### 問題3: fetch のタイムアウト

```typescript
async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeout = 5000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout (${timeout}ms)`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

### 問題4: ハードコードされた設定値

```typescript
// ❌ 問題: 環境ごとの切り替え不可
const API_URL = "https://api.example.com";

// ✅ 解決: 環境変数を使用
const API_URL =
  import.meta.env.VITE_API_URL || "https://api.example.com";
```

```bash
# .env.development
VITE_API_URL=http://localhost:3000

# .env.production
VITE_API_URL=https://api.example.com
```

**型定義（vite-env.d.ts）:**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // 他の環境変数...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

### 問題5: クロージャでキャプチャされた値の古さ

```typescript
// ❌ 問題: 初回取得のトークンがずっと使われる
const { accessToken } = await negotiate();
connection = new HubConnectionBuilder()
  .withUrl(url, { accessTokenFactory: () => accessToken })
  .build();

// ✅ 解決: 毎回新しいトークンを取得
connection = new HubConnectionBuilder()
  .withUrl(url, {
    accessTokenFactory: async () => {
      try {
        const { accessToken } = await negotiate();
        return accessToken;
      } catch {
        return cachedToken; // フォールバック
      }
    },
  })
  .build();
```

**学び:** クロージャでキャプチャされた値のライフタイムを意識する。

---

## TypeScript 型定義パターン

### 関数を返す関数

```typescript
// クリーンアップ関数を返す
function subscribe(callback: () => void): () => void {
  // 登録処理
  return () => {
    // 解除処理
  };
}
```

### オプショナルチェイニングと型

```typescript
// connection が null/undefined の可能性がある場合
connection?.on("event", callback);
connection?.off("event", callback);
```

### ユニオン型とタイプガード

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: string };

function isSuccess<T>(result: Result<T>): result is { success: true; data: T } {
  return result.success;
}

const result = await fetchData();
if (isSuccess(result)) {
  console.log(result.data); // 型が絞り込まれる
} else {
  console.error(result.error);
}
```

### Readonly と不変性

```typescript
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

// 配列も読み取り専用に
function process(items: readonly string[]): void {
  // items.push('x'); // エラー
}
```

---

## 移行のベストプラクティス

1. **1ファイルずつ移行** - 一度に複数ファイルは混乱の元
2. **型を書きながら「なぜ？」と問う** - 設計の見直し機会
3. **ライブラリの型定義を読む** - 学習効果が高い
4. **`strict: true` を有効化** - 妥協せず厳格モードで
5. **`any` を避ける** - `unknown` を使い、適切に絞り込む

```typescript
// ❌ any は型チェックを無効化
function process(data: any) { ... }

// ✅ unknown は使用前に検証が必要
function process(data: unknown) {
  if (typeof data === 'string') {
    // ここでは string として扱える
  }
}
```

---

## 関連ナレッジ

- [JavaScript パターン](./javascript-patterns.md) - 基本的な JS パターン
