---
title: 個人Webサービスの技術スタック選定 2025（catnose）
category: cross-cutting/architecture
tags: [architecture, next.js, cloudflare, vercel, stack, 2025]
browser_support: N/A（アーキテクチャ記事）
created: 2026-04-13
updated: 2026-04-13
---

# 個人Webサービスの技術スタック選定 2025

> 出典: https://x.com/catnose99/status/1947882026365030912
> 投稿日: 2025-07-23
> 追加日: 2026-04-13

catnose（@catnose99 / Zenn 作者）による、個人 Web サービスを作る際の技術スタック選定指針（2025年版）。

## スタック選定フローチャート

| ケース | スタック |
|-------|---------|
| **1ページだけの簡単なWebページ** | HTML/CSS ファイルを Cloudflare に直置き |
| **SEO不要 + 静的ビルドできる** | React + Vite（SPA）→ Cloudflare |
| **SEO必要 + 静的ビルドできる** | Next.js Static Export → Cloudflare |
| **SEO必要 + AI系API不使用** | Next.js（OpenNext）on Cloudflare Workers。データ少: KV/D1、多: Turso |
| **SEO必要 + AI系API使う + 最短リリース優先** | Next.js on Vercel + Upstash (Redis) + Turso / PlanetScale / TiDB |
| **コスト許容 + 慎重に作りたい** | React or Next.js + Google Cloud（Cloud Run / SQL / Tasks / Scheduler / CDN / Storage） |

## 選定の軸

1. **SEO が必要か** → 不要なら SPA で十分
2. **静的ビルドできるか** → できるなら Cloudflare が最安
3. **AI 系 API を使うか** → 使うなら Vercel の方が楽
4. **コストを抑えたいか** → Cloudflare Workers + KV/D1 が有利

## データベース選択

| 用途 | 選択肢 |
|------|-------|
| データ量が少ない | Cloudflare KV / D1 |
| データ量が多い | Turso |
| AI 系サービス | PlanetScale / TiDB |
| 慎重に作りたい | Google Cloud SQL |

## 注意点

> 「とかいいつつ、結局微妙に要件と合わなくて毎回新しい構成になりがち」— catnose

実際の要件に合わせて柔軟に選定する必要がある。

---
