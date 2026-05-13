---
title: 個人開発の運用コスト 0 円スタック選定
category: cross-cutting/architecture
tags: [architecture, hosting, deployment, free-tier, cloudflare-pages, github-pages, cloud-run, render, tidb, supabase, upstash, 2026]
browser_support: N/A (アーキテクチャ)
created: 2026-05-13
updated: 2026-05-13
---

# 個人開発を 0 円で運用するスタック選定

> 出典:
> - https://qiita.com/teppei19980914/items/3c744bb8fd71dc4550af — 「運用コストを本当に0円にした技術選定と設計判断のすべて」(2026-05-01 / 更新 2026-05-08)
> - https://qiita.com/Hiruge/items/262e0645fbfb024ecd4b — 「個人開発オススメデプロイ先」(2026-03-05 / 更新 2026-03-08)
>
> 追加日: 2026-05-13

個人開発・小規模サービスを「完全 0 円」または「無料枠で本番運用可能」にするための、レイヤーごとの選定パターン。catnose 版の [web-service-stack-2025.md](./web-service-stack-2025.md) と相補的。

## 全レイヤーまとめ表

| レイヤー | 推奨選択 | 無料枠 | トレードオフ |
|---------|---------|--------|------------|
| 静的ホスティング (個人) | **GitHub Pages** | 無制限 | 静的サイトのみ、商用不可 |
| 静的ホスティング (商用) | **Cloudflare Pages** | 帯域無制限 | 商用利用 OK |
| API サーバー (手軽) | Render | 750h/月、512MB RAM | TTFB ≈ 363ms (シンガポール) |
| API サーバー (高速) | **Cloud Run (東京)** | 200万req/月、18万vCPU秒、36万GB秒 | Dockerfile 必須 |
| DB | TiDB Cloud Starter | 5GB、MySQL 8.x 互換 | Spending Limit $0 設定が必須 |
| DB (PG + 認証) | Supabase | 500MB、認証・Storage 付き | 7 日アクセスなしで一時停止 |
| キャッシュ | Upstash Redis | 256MB、50万コマンド/月 | サーバーレス前提 |
| バッチ | GitHub Actions cron | 公開リポは無制限 | UTC 動作 |
| メール送信 | Formspree | 50件/月 | 低容量 |
| 認証 | (採用しない / Supabase) | — | パスワード復旧不可問題 |

## 1. 静的ホスティング

### GitHub Pages（個人開発・OSS）
- "ビルド成果物が静的ファイル（HTML/CSS/JS）になるフレームワークとの相性が抜群"
- 対象: Flutter Web、Astro、Vite (SPA)、Next.js Static Export
- 制約: カスタムサーバ処理不可、商用利用は規約確認推奨

### Cloudflare Pages（商用 OK）
- 帯域無制限。`*.pages.dev` ドメインがすぐ使える
- GitHub リポジトリ接続で自動デプロイ
- **Vercel との違い**: Vercel Hobby プランは **商用利用不可**。商用なら Cloudflare 一択

## 2. API サーバー

### 手軽さ重視: Render
- 750時間/月、512MB RAM
- Dockerfile デプロイ対応
- 難点: シンガポール立地で TTFB ≈ 363ms

### レスポンス重視: Cloud Run（東京リージョン）
- 200万 req/月、18万 vCPU秒、36万 GB秒
- 計測例: TTFB 226ms（Render 比で約40%高速）
- 要件: Dockerfile 作成スキル必要

```dockerfile
# Cloud Run 用 Dockerfile 例
FROM golang:1.20
WORKDIR /app
COPY . .
RUN go build -o server .
CMD ["./server"]
```

## 3. データベース

### TiDB Cloud Starter（推奨）
- 5GB、MySQL 8.x 互換
- **重要**: "Spending Limit を $0 に設定すること" で課金防止
- ローカル MySQL からの移行が接続文字列変更のみで簡単

### Supabase（認証・Storage まで欲しい場合）
- PostgreSQL ベース
- 認証、Storage、Realtime も無料枠で利用可
- 注意: 7 日アクセスなしで一時停止

### Drift (SQLite on IndexedDB)
- ブラウザ内にデータ保存 → サーバ代ゼロ
- 適用: Flutter Web、ブラウザ完結型アプリ
- トレードオフ: **デバイス間同期がない**

## 4. キャッシュ層: Upstash Redis
- 256MB、50万コマンド/月 無料
- サーバーレス設計、REST API 対応で統合容易
- Vercel / Cloudflare Workers との親和性が高い

## 5. バッチ・定期実行

### GitHub Actions cron
- 公開リポジトリは無制限
- **重要な落とし穴**: UTC で動作するため、JST との時差対応が必須

```yaml
name: Deploy & Schedule
on:
  push:
    branches: [main]
  schedule:
    - cron: "0 21 * * *"  # UTC 21:00 = JST 6:00

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/
```

### JST タイムゾーン対応コード

```typescript
export function isPublished(entry: {
  data: { draft?: boolean; date: Date }
}): boolean {
  const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const nowJST = new Date(Date.now() + JST_OFFSET_MS);
  const todayJST = nowJST.toISOString().slice(0, 10);
  const entryDate = entry.data.date.toISOString().slice(0, 10);
  return entryDate <= todayJST;
}
```

→ "GitHub Actions は UTC で動作するため、JST との時差を考慮しないと日付判定バグが発生"

## 6. ロックインリスク管理

### Drift（ブラウザ DB）の制約
- デバイス間同期なし → 「ローカル完結」を仕様として割り切る
- バックアップは export 機能で別途設計

### Supabase 一時停止対策
- 7 日アクセスなしで一時停止 → 監視ジョブで定期 ping

### TiDB Spending Limit
- 必ず $0 に設定。超過時の予期せぬ課金を防ぐ

## 構成例: 0 円フルスタック

```
Frontend:   Cloudflare Pages (React + Vite)
API:        Cloud Run (Go, 東京)
DB:         TiDB Cloud Starter (MySQL 互換)
Cache:      Upstash Redis
Batch:      GitHub Actions cron
Mail:       Formspree (50通/月)
Auth:       Supabase Auth (Supabase DB 採用時)
```

```javascript
// 環境変数で各サービスを参照
const API_ENDPOINT = process.env.CLOUD_RUN_URL;
const DB_HOST = process.env.TIDB_HOST;
const REDIS_URL = process.env.UPSTASH_REDIS_URL;

fetch(`${API_ENDPOINT}/api/data`)
  .then(res => res.json())
  .catch(err => console.error('API Error:', err));
```

## 選定基準のまとめ

1. **無料枠で本番運用維持** が最優先（趣味プロジェクトが課金で死なないこと）
2. **インフラ構築の簡潔性**
3. **ユーザー増時のスケーラビリティ**

## アンチパターン

- ❌ Vercel Hobby で商用展開 → 規約違反
- ❌ TiDB の Spending Limit 未設定 → 突然の請求リスク
- ❌ GitHub Actions cron を JST で書く → ローカルだけ通る時刻バグ
- ❌ Render の遅延を許容できない UX で採用 → 体感速度が出ない
- ❌ Drift のみで複数デバイス対応サービスを作る → 仕様破綻

## 関連ナレッジ

- [web-service-stack-2025](./web-service-stack-2025.md) — catnose 版（フローチャート式）

## 参考リソース

- [Qiita: 個人開発の運用コストを本当に 0 円にした技術選定](https://qiita.com/teppei19980914/items/3c744bb8fd71dc4550af)
- [Qiita: できるだけ無料でサービスを運用するための個人開発オススメデプロイ先](https://qiita.com/Hiruge/items/262e0645fbfb024ecd4b)
