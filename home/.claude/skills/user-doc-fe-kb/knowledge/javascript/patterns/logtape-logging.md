---
title: LogTape — JS/TS ロギング入門（console.log の代替）
category: javascript/patterns
tags: [logging, logtape, console, typescript, nodejs, bun, cloudflare-workers, 2026]
browser_support: Node.js, Deno, Bun, ブラウザ, Cloudflare Workers（全ランタイム対応）
created: 2026-04-13
updated: 2026-04-13
---

# LogTape — JS/TS ロギング入門

> 出典: https://zenn.dev/hongminhee/articles/e0d19ae2c4e042
> 執筆日: 2026-01-01
> 追加日: 2026-04-13

`console.log` の限界を超えるロギング。依存ゼロ・全ランタイム対応の **LogTape** が推奨候補。

## console.log の問題点

| 問題 | 内容 |
|------|------|
| フィルタリング不可 | 本番環境で動的に出力レベルを制御できない |
| 出力先固定 | Sentry・ファイル・CloudWatch などへ切り替えられない |
| 識別困難 | どのモジュールから出力されたか不明 |
| 非構造化 | JSON 分析ツールと連携できない |
| ライブラリ混入 | 依存パッケージのログを制御できない |

## LogTape の特徴

- **依存ゼロ**（「少ない」ではなく本当にゼロ）
- Node.js, Deno, Bun, ブラウザ, Cloudflare Workers すべてで動作
- 設定されていなければ何も出力しない（ライブラリ組み込み時に安全）

## 基本セットアップ

```typescript
import { configure, getConsoleSink, getLogger } from "@logtape/logtape";

await configure({
  sinks: {
    console: getConsoleSink(),
    // 複数の出力先を追加可能（ファイル、Sentry 等）
  },
  loggers: [
    {
      category: ["my-app"],
      lowestLevel: "debug",
      sinks: ["console"],
    },
  ],
});

const logger = getLogger(["my-app", "database"]);
logger.info("Connected to {db}", { db: "postgres" });
```

## ログレベル

`trace` → `debug` → `info` → `warning` → `error` → `fatal`

本番環境では `info` 以上を推奨。

## カテゴリシステム（階層的識別）

```typescript
// モジュール単位でカテゴリを分ける
const logger = getLogger(["my-app", "database"]);
const authLogger = getLogger(["my-app", "auth"]);

// 設定で "my-app" 以下を一括制御、または個別に絞り込み可能
```

## 構造化ログ

```typescript
// テンプレートリテラル形式
logger.info`User ${userId} logged in from ${ipAddress}`;

// オブジェクト形式（JSON 出力に最適）
logger.info("Login attempt", { userId, ipAddress, timestamp: Date.now() });
```

## コンテキスト伝播

```typescript
// 明示的なコンテキスト付与
const requestLogger = logger.with({ requestId: "abc-123" });
requestLogger.info("Processing request"); // requestId が自動付与される

// AsyncLocalStorage による暗黙的伝播（Node.js）
import { withContext } from "@logtape/logtape";
await withContext({ requestId: "abc-123" }, async () => {
  logger.info("Inside context"); // requestId が自動付与
});
```

## Cloudflare Workers での注意点

```typescript
// Workers 環境ではリクエスト終了時に dispose() でフラッシュが必要
export default {
  async fetch(request: Request) {
    // ... 処理
    await dispose(); // ログを確実にフラッシュ
  },
};
```

## ユースケース

- Next.js / Nuxt アプリのサーバーサイドロギング
- Cloudflare Workers・Hono API のリクエストトレース
- ライブラリ開発（ユーザーのログ設定に干渉しない）
- 本番環境でのエラートラッキング（Sentry sink との連携）

## 関連ナレッジ

- [Hono / Cloudflare Pages スタック](../../../references/free-web-stack.md)
