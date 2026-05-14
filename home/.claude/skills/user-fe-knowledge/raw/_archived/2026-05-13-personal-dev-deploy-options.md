---
url: https://qiita.com/Hiruge/items/262e0645fbfb024ecd4b
fetched_at: 2026-05-13
title: できるだけ無料でサービスを運用するための個人開発オススメデプロイ先
---

# 個人開発向けデプロイ先ガイド

**公開日:** 2026年3月5日（更新日: 2026年3月8日）

## 主要な技術ポイント

### 1. フロントエンド（SPA）ホスティング — Cloudflare Pages 推奨
- "帯域無制限で商用利用もOK" な点が個人開発に最適
- GitHub リポジトリ接続で自動デプロイ、即座に `*.pages.dev` ドメイン利用可
- **代替案**: Vercel は親和性高いが「Hobby プランは商用利用不可」

### 2. バックエンド（APIサーバー）

**手軽さ重視:** Render（750時間/月、512MB RAM）
- Dockerfile デプロイ対応、シンプルな設定
- 難点: シンガポール立地で TTFB が約 363ms と遅延あり

**レスポンス重視:** Cloud Run（東京リージョン）
- "月200万リクエスト、18万vCPU秒、36万GB秒" の無料枠
- 計測例: TTFB 226ms（Render 比で約40%高速）
- 要件: Dockerfile 作成能力が必要

### 3. データベース — TiDB Cloud Starter 推奨
- "5GB（行データ）、MySQL 8.x 互換"
- **重要:** "Spending Limit を $0 に設定すること" で課金防止
- ローカル MySQL からの移行が接続文字列変更のみで簡単
- 代替: Supabase（PostgreSQL、認証・ストレージ機能併備）

### 4. キャッシュ層 — Upstash Redis
- "256MB、月50万コマンド" 無料
- サーバーレス設計、REST API 対応で統合容易

## 実装例

```javascript
const API_ENDPOINT = process.env.CLOUD_RUN_URL;
const DB_HOST = process.env.TIDB_HOST;
const REDIS_URL = process.env.UPSTASH_REDIS_URL;

fetch(`${API_ENDPOINT}/api/data`)
  .then(res => res.json())
  .catch(err => console.error('API Error:', err));
```

```dockerfile
FROM golang:1.20
WORKDIR /app
COPY . .
RUN go build -o server .
CMD ["./server"]
```

## 選定基準
1. 無料枠で本番環境維持が最優先
2. インフラ構築の簡潔性
3. ユーザー増時のスケーリング可能性
