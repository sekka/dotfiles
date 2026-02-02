# Web調査の方針

## 概要

Web調査では、ブラウザUIを起動せずに情報を取得することを優先する。
Claude in Chromeは最終手段としてのみ使用し、使用前に必ずユーザーの許可を得ること。

---

## 基本原則（優先順位）

### 1. WebFetch（第一優先）

**用途:**
- 公開URLの情報取得
- 公式ドキュメント、価格ページ、ブログ記事等
- 静的HTMLコンテンツ

**メリット:**
- ブラウザUIを起動しない
- 高速で効率的
- ユーザーの作業を妨げない
- マークダウン変換により読みやすい

**使用例:**

```typescript
// 公式ドキュメントの取得
WebFetch({
  url: "https://studio.design/ja/help",
  prompt: "Studioのカスタム投稿タイプとカスタムフィールドの仕様を抽出してください"
});

// 価格情報の取得
WebFetch({
  url: "https://kinsta.com/pricing/",
  prompt: "各プランの料金、ストレージ容量、帯域幅制限を表形式で抽出してください"
});

// 機能比較の取得
WebFetch({
  url: "https://wix.com/features",
  prompt: "CMS機能、カスタムフィールド、API連携の対応状況を抽出してください"
});
```

**制約:**
- 認証が必要なページは取得不可（Google Docs、Confluence、Jira等）
- JavaScript動的レンダリングのみのページは内容が不完全な場合あり

### 2. WebSearch（補助的使用）

**用途:**
- 検索クエリで情報を探す場合
- 複数の情報源を比較する場合
- 最新情報のトレンド調査

**使用例:**

```typescript
WebSearch({
  query: "Studio.design CMS custom fields 2026"
});

WebSearch({
  query: "WordPress.com Business plan API features"
});
```

**注意:**
- 検索結果のURLを取得したら、WebFetchで詳細を取得する

### 3. Claude in Chrome（最終手段のみ）

**使用すべき場合:**
- JavaScriptで動的に生成されるコンテンツ（WebFetchで取得不可）
- 認証が必要なページ（ユーザーの明示的許可後）
- フォーム操作が必要な場合
- インタラクティブな要素の確認が必要な場合
- WebFetchで取得できない、または内容が不完全な場合

**使用してはいけない場合:**
- 単純な情報取得（公式ドキュメント、価格ページ等）
- 静的HTMLで十分な場合
- ユーザーの許可なく使用

**使用前の確認事項:**

1. **WebFetchで十分か再確認**
2. **使用理由を明確に説明**
3. **ユーザーの許可を得る**

**説明例:**

```
「このページはJavaScript動的レンダリングで実装されており、
WebFetchでは内容を取得できませんでした。

Claude in Chromeを使用することで：
- 実際のDOM構造を解析できます
- レンダリング後のコンテンツを取得できます

ブラウザを起動してよろしいですか？」
```

---

## 実践ガイド

### パターン1: 公式ドキュメント調査

**タスク:** Studioのカスタム投稿タイプを調査

**✅ 正しいアプローチ:**

```typescript
// Step 1: WebFetchで公式ドキュメントを取得
WebFetch({
  url: "https://studio.design/ja/help",
  prompt: "カスタム投稿タイプ、カスタムフィールドに関するページを探し、詳細を抽出"
});

// Step 2: 不足があればWebSearchで補足
WebSearch({
  query: "Studio.design custom post types カスタム投稿タイプ"
});
```

**❌ 避けるべきアプローチ:**

```typescript
// ❌ いきなりブラウザ自動化
Task({
  subagent_type: "Explore",
  prompt: "Studioのカスタム投稿タイプを調査"
});
// → Exploreエージェントが内部でClaude in Chromeを使用する可能性
```

### パターン2: 価格情報の調査

**タスク:** 6つのCMSの価格を比較

**✅ 正しいアプローチ:**

```typescript
// 並列でWebFetchを実行
WebFetch({ url: "https://studio.design/pricing", prompt: "全プランの料金を抽出" });
WebFetch({ url: "https://wordpress.com/pricing/", prompt: "ビジネスプランの料金を抽出" });
WebFetch({ url: "https://kinsta.com/pricing/", prompt: "エントリープランの料金を抽出" });
WebFetch({ url: "https://wix.com/premium", prompt: "ビジネスプランの料金を抽出" });
WebFetch({ url: "https://movabletype.net/price/", prompt: "全プランの料金を抽出" });
WebFetch({ url: "https://www.wpx.ne.jp/speed/price/", prompt: "W1-W3プランの料金を抽出" });
```

### パターン3: 機能の詳細確認

**タスク:** WixのリレーションDB機能を確認

**✅ 正しいアプローチ:**

```typescript
// Step 1: WebSearchで候補を探す
WebSearch({
  query: "Wix CMS relations database 2026"
});

// Step 2: 見つかったURLをWebFetchで詳細取得
WebFetch({
  url: "https://support.wix.com/ja/article/...",
  prompt: "リレーションDB、カスタムコレクション、データ連携の対応状況を抽出"
});
```

### パターン4: JavaScript動的レンダリングページ

**タスク:** SPAで実装されたページの調査

**✅ 正しいアプローチ:**

```
1. まずWebFetchを試す
2. 内容が不完全な場合、ユーザーに報告:
   「WebFetchでは内容が取得できませんでした。
    このページはJavaScript動的レンダリングです。
    Claude in Chromeを使用してよろしいですか？」
3. 許可を得てからClaude in Chromeを使用
```

---

## エージェント選択のガイドライン

### Web調査タスクでのエージェント選択

| エージェント | 使用すべき場合 | 内部ツール |
|-------------|--------------|----------|
| **websearch** | 検索ベースの調査 | WebSearch, WebFetch |
| **Explore** | コードベース探索 | Glob, Grep, Read |
| **一般エージェント** | 避ける | Claude in Chrome使用の可能性 |

**推奨:**
- Web調査では`websearch`エージェントを使用
- または、直接WebFetch/WebSearchツールを並列実行

**非推奨:**
- `Explore`エージェントをWeb調査に使用（コードベース専用）
- `general-purpose`エージェントをWeb調査に使用（ブラウザ起動の可能性）

---

## 禁止事項

**IMPORTANT:** 以下の行為は禁止

- ユーザーの明示的な指示なくClaude in Chromeを起動する
- 単純な情報取得にブラウザ自動化を使う
- WebFetchで十分な場合にブラウザを開く
- 使用理由を説明せずにブラウザ自動化を実行する

---

## チェックリスト

Web調査タスク開始前に確認：

- [ ] WebFetchで取得可能か？
- [ ] 公開URLか？（認証不要）
- [ ] 静的HTMLか、軽度のJavaScriptか？
- [ ] ブラウザ自動化が本当に必要か？

Claude in Chrome使用前に確認：

- [ ] WebFetchを試したか？
- [ ] 使用理由を明確に説明できるか？
- [ ] ユーザーの許可を得たか？

---

## トラブルシューティング

### WebFetchで内容が取得できない

**原因:**
- JavaScript動的レンダリング
- 認証が必要
- リダイレクトループ

**対応:**
1. 別のURLを試す（例: `/docs`の代わりに`/help`）
2. WebSearchで代替情報源を探す
3. それでもダメならユーザーに相談

### Claude in Chromeが自動起動してしまう

**原因:**
- Exploreエージェント等が内部で使用

**対応:**
- `websearch`エージェントを使用
- または直接WebFetchツールを呼び出す

---

## 参考資料

- [WebFetchツールの仕様](システムプロンプト参照)
- [WebSearchツールの仕様](システムプロンプト参照)
- [Claude in Chromeブラウザ自動化ガイドライン](システムプロンプト参照)
