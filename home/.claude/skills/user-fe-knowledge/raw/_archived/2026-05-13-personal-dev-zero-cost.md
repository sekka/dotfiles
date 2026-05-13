---
url: https://qiita.com/teppei19980914/items/3c744bb8fd71dc4550af
fetched_at: 2026-05-13
title: 個人開発の運用コストを本当に0円にした技術選定と設計判断のすべて
---

# 個人開発の運用コストを0円にした技術選定と設計判断

**公開日:** 2026年5月1日（更新日: 2026年5月8日）

## 主要な技術ポイント

### 1. ホスティング: GitHub Pages
- **理由:** "ビルド成果物が静的ファイル（HTML/CSS/JS）になるフレームワークとの相性が抜群"
- **対象:** Flutter Web、Astro などの SSG フレームワーク
- **制約:** カスタムサーバ処理不可

### 2. フロントエンド DB: Drift (SQLite)
- **理由:** ブラウザ内（IndexedDB）にデータ保存→サーバ代ゼロ
- **トレードオフ:** デバイス間同期がない

### 3. バッチ処理: GitHub Actions cron
- **目的:** 予約投稿、記事自動取得などの定期実行
- **注意点:** UTC で動作するため、JST との時差対応が必須

## コード例

### GitHub Actions デプロイ
```yaml
name: Deploy to GitHub Pages
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

### JST タイムゾーン対応
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

**なぜ優れているか:** "GitHub Actions は UTC で動作するため、JST との時差を考慮しないと日付判定バグが発生" — 具体的な失敗例に基づいた実装

## サービス比較表

| レイヤー | 選択 | 無料枠 | トレードオフ |
|---------|------|--------|-----------|
| ホスティング | GitHub Pages | 無制限 | 静的サイトのみ |
| DB | Drift（ブラウザ） | 無制限 | デバイス間同期なし |
| メール | Formspree | 月50件 | 低容量 |
| 認証 | なし | 無料 | 即使える（復旧不可） |

## 適用可能なフロントエンド環境
- ✅ Flutter Web（Drift との統合）
- ✅ Astro（静的ビルド）
- ✅ 標準 HTML/CSS/JS（GitHub Pages サポート）
- ⚠️ 常駐サーバ必須なら Vercel Free（月100GB帯域、100時間 Serverless）
