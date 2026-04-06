---
title: Webフロントエンド開発における機密情報漏洩対策
category: cross-cutting/security
tags: [security, secret-leak, nextjs, react, server-component, ssr, build-security, 2025]
browser_support: 全ブラウザ（実装パターン）
created: 2026-01-31
updated: 2026-01-31
---

# Webフロントエンド開発における機密情報漏洩対策

> 出典: https://speakerdeck.com/mizdra/web-frontend-secret-leak
> 発表日: 2025年11月15日（YAPC::Fukuoka 2025）
> 発表者: mizdra（株式会社はてな フロントエンドエキスパート）
> 追加日: 2026-01-31

## 概要

モダンなフロントエンドフレームワークでは、**全コンポーネントがブラウザ向けバンドルに含まれる**ため、従来のテンプレートエンジン（erb、Xslate）と異なり、機密情報漏洩リスクが高まります。本資料では、漏洩の種類、対策方法、検査・予防テクニックを解説します。

---

## 1. 機密情報の種類

### 個人情報
- メールアドレス
- 住所
- 電話番号
- クレジットカード情報

### 業務情報
- 開発環境ドメイン（`dev.example.com`）
- 未公開キャンペーン情報
- 社内プロジェクト名

### 認証情報
- API トークン
- Cookie
- セッションID
- OAuth クライアントシークレット

### ログとソースコード
- デバッグログ
- エラーメッセージ（スタックトレース含む）
- 社内ライブラリ名
- プロプライエタリなコード

---

## 2. フロントエンドフレームワーク固有のリスク

### 従来のテンプレートエンジン（erb、Xslate）

```erb
<!-- サーバー側のみで実行 -->
<% if @user.admin? %>
  <div>管理者専用コンテンツ</div>
  <% secret_data = fetch_secret() %>
<% end %>
```

**特徴**: サーバー側でレンダリングされ、ブラウザに送信されるのは HTML のみ。

---

### モダンフロントエンドフレームワーク（React、Vue、Next.js）

```jsx
// ❌ 全コンポーネントがバンドルに含まれる
function AdminPanel() {
  const secretData = process.env.SECRET_API_KEY; // 危険！
  return <div>{secretData}</div>;
}
```

**問題点**: このコンポーネントがブラウザ向けバンドルに含まれると、`SECRET_API_KEY` が平文で露出します。

---

## 3. 主な対策方法

### ① サーバーから機密情報を fetch する

**最も手軽で、どのフレームワークにも適用可能。**

```jsx
// ✅ ブラウザから API を呼び出し
function UserProfile() {
  const [email, setEmail] = useState(null);

  useEffect(() => {
    fetch('/api/user/email')
      .then(res => res.json())
      .then(data => setEmail(data.email));
  }, []);

  return <div>{email}</div>;
}
```

**サーバー側（Next.js API Routes）:**

```javascript
// pages/api/user/email.js
export default async function handler(req, res) {
  const email = await getEmailFromDatabase(req.user.id);
  res.json({ email });
}
```

**利点**:
- ブラウザ向けバンドルに機密情報が含まれない
- どのフレームワークでも実装可能

**欠点**:
- 追加のHTTPリクエストが必要
- 初回レンダリング時に遅延が発生

---

### ② getServerSideProps（Next.js Pages Router 限定）

**サーバー側のバンドルにのみ含まれ、ブラウザには送信されない。**

```jsx
// ✅ サーバーサイドでのみ実行
export async function getServerSideProps(context) {
  const secret = process.env.SECRET_API_KEY;
  const data = await fetchDataWithSecret(secret);

  return {
    props: {
      publicData: data.public, // ブラウザに送信
      // secret は送信されない
    },
  };
}

function Page({ publicData }) {
  return <div>{publicData}</div>;
}
```

**重要**: `getServerSideProps` 内で取得した機密情報を `props` に含めないこと。

---

### ③ Server Component（React 19 / Next.js App Router）

**Xslate や erb と同様、サーバーのみでレンダリング。**

```jsx
// app/page.jsx (Server Component)
async function Page() {
  const secret = process.env.SECRET_API_KEY;
  const data = await fetchDataWithSecret(secret);

  return <div>{data.public}</div>;
  // secret はブラウザに送信されない
}
```

**重要な落とし穴**: Server Component から Client Component に渡す props は、HTML 内にシリアライズされます。

```jsx
// ❌ 機密情報が HTML に埋め込まれる
'use client';

function ClientComponent({ secret }) {
  return <div>{secret}</div>;
}

// Server Component
async function Page() {
  const secret = process.env.SECRET_API_KEY;
  return <ClientComponent secret={secret} />; // 危険！
}
```

**HTML 出力例:**

```html
<script>
  self.__NEXT_DATA__ = {
    "props": {
      "secret": "sk-abc123..." // 漏洩！
    }
  }
</script>
```

**対策**: Client Component には機密情報を渡さない。

```jsx
// ✅ 機密情報は Server Component 内で処理
async function Page() {
  const secret = process.env.SECRET_API_KEY;
  const publicData = await fetchPublicData(secret);

  return <ClientComponent data={publicData} />;
}
```

---

## 4. 漏洩検査方法

### grep 検索（ビルド成果物の検査）

```bash
# Next.js の静的ファイルを検索
grep -r "sk-" .next/static/

# Vite のビルド成果物を検索
grep -r "SECRET_API_KEY" dist/
```

**検索対象**:
- API キーのプレフィックス（`sk-`、`pk_`、`Bearer`）
- 環境変数名（`SECRET_`、`PRIVATE_`）
- 開発環境ドメイン（`dev.`、`staging.`）

---

### Chrome DevTools Network タブ

1. DevTools を開く（F12）
2. Network タブを選択
3. リソースを選択
4. **Search** 機能で機密情報を検索

**検索例**:
- `SECRET_API_KEY`
- `admin@example.com`
- `dev.example.com`

---

## 5. 予防テクニック

### CI での自動 grep 検査

```yaml
# .github/workflows/check-secrets.yml
name: Check Secret Leak

on: [push, pull_request]

jobs:
  check-secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: npm run build
      - name: Check for secrets in build output
        run: |
          if grep -r "sk-" .next/static/; then
            echo "Secret leaked in build output!"
            exit 1
          fi
```

**チェック項目**:
- API キー
- 環境変数名
- 開発環境ドメイン
- デバッグログ

---

### Taint API（汚染された値の検出）

**React 19 / Next.js App Router の実験的機能**

```javascript
import { experimental_taintObjectReference } from 'react';

async function getSecret() {
  const secret = process.env.SECRET_API_KEY;

  // この値が Client Component に渡されたらエラー
  experimental_taintObjectReference(
    'Secret API Key should not be passed to Client Component',
    secret
  );

  return secret;
}
```

**動作**:
- 汚染された値が Client Component に渡されると、実行時エラー
- 開発環境でのみ有効（本番では無効化推奨）

---

### GraphQL の活用（スキーマで制限）

```graphql
type User {
  id: ID!
  name: String!
  email: String! @auth(requires: ADMIN)
  # email は管理者のみアクセス可能
}
```

**利点**:
- スキーマで許可されたフィールドのみアクセス可能
- バックエンドで一元管理

---

## 6. よくある漏洩パターン

### Source Map の漏洩

**問題**:
```javascript
// bundle.js.map がブラウザに公開される
{
  "version": 3,
  "sources": ["../../src/secret.js"],
  "sourcesContent": ["const SECRET = 'sk-abc123';"]
}
```

**対策**:

```javascript
// next.config.js
module.exports = {
  productionBrowserSourceMaps: false, // 本番では無効化
};
```

**Sentry 等への Source Map アップロード:**

```bash
# ビルド後に Source Map を Sentry にアップロード
npm run build
sentry-cli sourcemaps upload --org=my-org --project=my-project .next/

# アップロード後に削除
rm -rf .next/**/*.map
```

---

### 関連リソースの漏洩

**問題**: 開発環境用ファイルが本番ビルドに含まれる

```
/app/internal/admin.jsx  ← 本番ビルドに含まれるべきでない
/app/public/page.jsx
```

**対策（Next.js）:**

```javascript
// next.config.js
module.exports = {
  webpack(config, { isServer }) {
    if (!isServer) {
      // ブラウザ向けバンドルから除外
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/internal/,
        })
      );
    }
    return config;
  },
};
```

---

### 環境変数の誤った使用

**問題**:
```javascript
// ❌ ブラウザ向けバンドルに含まれる
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
```

**対策**:

```javascript
// ✅ サーバー側のみで使用
const apiKey = process.env.SECRET_API_KEY;

// API Routes で使用
export default async function handler(req, res) {
  const data = await fetch('https://api.example.com', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  res.json(data);
}
```

**Next.js の環境変数ルール**:
- `NEXT_PUBLIC_` プレフィックス: ブラウザに公開
- プレフィックスなし: サーバー側のみ

---

## 7. フレームワーク別の対策まとめ

| フレームワーク | 推奨対策 |
|--------------|---------|
| Next.js Pages Router | `getServerSideProps` または API Routes |
| Next.js App Router | Server Component（props に注意） |
| React (SPA) | API fetch |
| Vue (SPA) | API fetch |
| Nuxt.js | `asyncData` または Server Middleware |

---

## 8. チェックリスト

実装前・ビルド前に確認:

- [ ] 機密情報を Client Component の props に渡していないか
- [ ] 環境変数が正しく使用されているか（`NEXT_PUBLIC_` の使用は適切か）
- [ ] Source Map が本番ビルドに含まれていないか
- [ ] 開発環境用ファイルが本番ビルドに含まれていないか
- [ ] CI で grep 検査を実行しているか
- [ ] API Routes / Server Component で機密情報を処理しているか

---

## 参考資料

- [Next.js: Data Fetching](https://nextjs.org/docs/basic-features/data-fetching)
- [React: Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [OWASP: Sensitive Data Exposure](https://owasp.org/www-project-top-ten/2017/A3_2017-Sensitive_Data_Exposure)

---

## 関連ナレッジ

- [セキュリティベストプラクティス](./security-best-practices.md)
- [Next.js セキュリティガイド](../../javascript/frameworks/nextjs-security.md)
- [環境変数の管理](./env-vars-management.md)
