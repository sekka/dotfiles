---
description: 外部ツール使用時のセキュリティ制約
---

# セキュリティ原則

## 外部ツール使用時の注意

- **Context7 / DeepWiki**: 公開OSSライブラリのみ問い合わせ対象。社内ライブラリ名は一般化する（例: `@company/auth` → "カスタム認証ライブラリ"）
- **WebFetch**: 認証が必要なサイトは使用不可（Google Docs、Confluence、Jira、GitHubプライベートリポジトリ）
