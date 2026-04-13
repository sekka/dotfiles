# 完全無料 Web アプリスタック — Hono / Neon / Drizzle / Cloudflare Pages

> Source: https://zenn.dev/epicai_techblog/articles/ff6225111e3649
> Added: 2026-04-13

月額0円で動かせるモダンなフルスタック構成。エッジSSRで高速。

## スタック構成

| 役割 | ツール | 無料枠 |
|------|--------|--------|
| フレームワーク | Hono | OSS・無料 |
| DB | Neon (Serverless PostgreSQL) | 0.5 GiB まで無料 |
| ORM | Drizzle ORM | OSS・無料 |
| ホスティング | Cloudflare Pages | 帯域幅・リクエスト数ほぼ無制限 |

## 特徴

- **SSR**: サーバー側で HTML 完成後に返却
- **エッジ**: ユーザーに近い場所で処理 → 高速応答
- **疎結合**: 計算リソース（Cloudflare）とデータ（Neon）を分離
- Drizzle ORM は純粋な TypeScript 製でエッジ環境でもそのまま動作

## 実用ポイント

- 環境変数は `.dev.vars` ファイルで管理（機密情報は `.gitignore` で保護）
- `npx drizzle-kit push` でスキーマを自動反映
- Hono JSX でフロント・バックを単一ファイルで統合開発可能
