# 個人サービスのホスティング比較

> Source: https://zenn.dev/helloworld/articles/b42240ad018a51
> Added: 2026-04-13

Cloudflare Workers を採用することで、年間コストをドメイン代のみ（約1,500円）に削減できる。

## サービス比較

| サービス | 問題点 |
|---------|-------|
| Vercel Hobby | 非商用・個人利用のみ（商用不可） |
| AWS Amplify | 従量課金で長期コスト予測困難 |
| Firebase App Hosting | Blaze プラン（従量課金）必須 |
| Google Cloud Run | セットアップが複雑、インフラ知識が必要 |
| **Cloudflare Workers** | **静的アセット無制限・SSR対応・商用OK → 採用** |

## 選定基準

- 無料利用可・商用利用対応・独自ドメイン・SSR / API 対応

## 実用ポイント

- Next.js は `@opennextjs/cloudflare` アダプターでデプロイ対応
- ドメイン登録〜ホスティングまで Cloudflare で一元管理
- 無料枠超過時は同一プラットフォーム内で $5/月〜にアップグレード可能
