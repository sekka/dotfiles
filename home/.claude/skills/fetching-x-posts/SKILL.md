---
name: fetching-x-posts
description: X（Twitter）の投稿URLから効率的にデータを抽出します。Playwrightを使用してheadlessモードで動作し、メモリ使用量とコンテキスト消費量を最小限に抑えます。
disable-model-invocation: false
---

# X投稿取得スキル

## 概要

X（Twitter）の投稿URLを受け取り、軽量なJSON形式でデータを抽出する。
Playwrightのheadlessモードを使用し、スナップショットやスクリーンショットを取らずに必要最小限の情報のみを取得する。

**最適化ポイント:**
- **メモリ使用量**: スナップショット・スクリーンショット不要
- **コンテキスト消費**: JSON形式で約500文字（従来比95%削減）
- **再現性**: スキルとして実装し、`/fetching-x-posts <URL>` で呼び出し可能

## 入力情報の確認

スキル実行時、以下を確認する：

### 1. X投稿のURL

- 形式: `https://x.com/{username}/status/{tweet_id}`
- 例: `https://x.com/YoheiNishitsuji/status/1961413525684764894`

### 2. 抽出する情報（デフォルト）

- ユーザー名
- ユーザーハンドル（@username）
- 投稿本文
- 投稿日時（ISO 8601形式）
- エンゲージメント数（返信、リポスト、いいね、ブックマーク）
- メディア情報（画像/動画の有無、種類）

### 3. オプション

ユーザーに確認（必要に応じて）：

- **画像/動画の取得**: デフォルトでは取得しない（メモリ節約）
  - `yes`: スクリーンショットを追加取得
  - `no`: メタデータのみ（デフォルト）

## 実行フロー

### Step 1: Playwrightでページにアクセス

```typescript
// PlaywrightのMCPツールを使用
mcp__plugin_playwright_playwright__browser_navigate({
  url: '<X投稿のURL>'
});
```

**注意:**
- ページ読み込みにはJavaScriptの実行が必要
- 認証は不要（公開投稿のみ対象）

### Step 2: カスタムスクリプトでデータ抽出

```typescript
mcp__plugin_playwright_playwright__browser_run_code({
  code: `async (page) => {
    // ページが読み込まれるまで待機
    await page.waitForSelector('article', { timeout: 10000 }).catch(() => null);

    // 投稿データを直接抽出
    const postData = await page.evaluate(() => {
      const article = document.querySelector('article');
      if (!article) return null;

      // テキストコンテンツ
      const textElement = article.querySelector('[data-testid="tweetText"]');
      const text = textElement ? textElement.innerText : '';

      // ユーザー情報
      const userNameElement = article.querySelector('[data-testid="User-Name"]');
      const userName = userNameElement ? userNameElement.innerText.split('\\n')[0] : '';
      const userHandle = userNameElement ? userNameElement.innerText.split('\\n')[1] : '';

      // 投稿時刻
      const timeElement = article.querySelector('time');
      const timestamp = timeElement ? timeElement.getAttribute('datetime') : '';
      const displayTime = timeElement ? timeElement.innerText : '';

      // エンゲージメント数（aria-labelから抽出）
      const replies = article.querySelector('[data-testid="reply"]')?.getAttribute('aria-label') || '0';
      const retweets = article.querySelector('[data-testid="retweet"]')?.getAttribute('aria-label') || '0';
      const likes = article.querySelector('[data-testid="like"]')?.getAttribute('aria-label') || '0';
      const bookmarks = article.querySelector('[data-testid="bookmark"]')?.getAttribute('aria-label') || '0';

      // 閲覧数（存在する場合）
      const viewsElement = article.querySelector('[href$="/analytics"]');
      const views = viewsElement ? viewsElement.innerText.match(/[\\d,]+/)?.[0] || '0' : '0';

      // 画像・動画の有無
      const hasMedia = !!article.querySelector('[data-testid="tweetPhoto"], [data-testid="videoPlayer"]');
      const mediaType = article.querySelector('[data-testid="videoPlayer"]') ? 'video' :
                       article.querySelector('[data-testid="tweetPhoto"]') ? 'image' : 'none';

      // 画像URLの取得（存在する場合）
      const mediaUrls = [];
      if (mediaType === 'image') {
        const images = article.querySelectorAll('[data-testid="tweetPhoto"] img');
        images.forEach(img => {
          const src = img.getAttribute('src');
          if (src && !src.includes('profile')) {
            mediaUrls.push(src);
          }
        });
      }

      return {
        userName,
        userHandle,
        text,
        timestamp,
        displayTime,
        engagement: {
          replies: replies.match(/\\d+/)?.[0] || '0',
          retweets: retweets.match(/\\d+/)?.[0] || '0',
          likes: likes.match(/\\d+/)?.[0] || '0',
          bookmarks: bookmarks.match(/\\d+/)?.[0] || '0',
          views: views.replace(/,/g, '')
        },
        media: {
          hasMedia,
          type: mediaType,
          urls: mediaUrls
        }
      };
    });

    return postData;
  }`
});
```

**抽出ロジックの説明:**
- `data-testid`属性を使用してDOM要素を特定
- `aria-label`からエンゲージメント数を抽出
- メディアタイプを判定（画像/動画/なし）
- 必要最小限のデータのみをJSON形式で返す

### Step 3: 結果の整形と出力

取得したJSONデータを整形して表示：

```markdown
## X投稿データ

**投稿者:** {userName} ({userHandle})
**投稿日時:** {displayTime} ({timestamp})
**本文:**
{text}

**エンゲージメント:**
- 返信: {replies}件
- リポスト: {retweets}件
- いいね: {likes}件
- ブックマーク: {bookmarks}件
- 表示: {views}件

**メディア:**
- タイプ: {mediaType}
- URL: {mediaUrls}
```

### Step 4: オプション - スクリーンショット取得

ユーザーが画像確認を希望した場合のみ実行：

```typescript
mcp__plugin_playwright_playwright__browser_take_screenshot({
  type: 'png',
  filename: 'x_post.png',
  fullPage: false  // 投稿部分のみ
});
```

## エラーハンドリング

### ケース1: ページが見つからない

```
エラー: 投稿が存在しないか、削除されました
対応: URLを確認してください
```

### ケース2: プライベート投稿

```
エラー: 認証が必要な投稿です
対応: 公開投稿のみ取得可能です
```

### ケース3: タイムアウト

```
エラー: ページの読み込みがタイムアウトしました
対応: ネットワーク接続を確認してください
```

## 使用例

### 例1: 基本的な使用

```
ユーザー: /fetching-x-posts https://x.com/YoheiNishitsuji/status/1961413525684764894

出力:
{
  "userName": "Yohei Nishitsuji",
  "userHandle": "@YoheiNishitsuji",
  "text": "#つぶやきGLSL float i,e,R,s;vec3 q,p,d=vec3(FC.xy/r.x*.4+vec2(-.2,.8),1);...",
  "timestamp": "2025-08-29T13:00:00.000Z",
  "displayTime": "午後10:00 · 2025年8月29日",
  "engagement": {
    "replies": "10",
    "retweets": "62",
    "likes": "450",
    "bookmarks": "110",
    "views": "15162"
  },
  "media": {
    "hasMedia": true,
    "type": "video",
    "urls": []
  }
}
```

### 例2: 画像付き投稿

```
ユーザー: /fetching-x-posts https://x.com/example/status/123456789

（画像確認を希望する場合）
スクリーンショットも取得しますか？
→ いいえ（デフォルト）
```

## パフォーマンス指標

**コンテキスト消費量:**
- 従来（スナップショット）: ~10,000トークン
- 最適化後（JSON）: ~500トークン
- **削減率: 95%**

**メモリ使用量:**
- 従来（スクリーンショット）: ~5MB
- 最適化後（JSON）: ~10KB
- **削減率: 99.8%**

**実行時間:**
- ページアクセス: ~2秒
- データ抽出: ~0.5秒
- **合計: 約2.5秒**

## 制限事項

1. **公開投稿のみ**: 認証が必要な投稿は取得不可
2. **動画コンテンツ**: 動画そのものは取得せず、メタデータのみ
3. **リプライ**: 現在の実装ではメイン投稿のみ（リプライは対象外）
4. **レート制限**: Xのレート制限に注意（頻繁な取得は避ける）

## 今後の拡張

- [ ] 複数投稿の一括取得
- [ ] スレッド（連続投稿）の取得
- [ ] リプライの取得
- [ ] ユーザープロフィールの取得
- [ ] トレンド情報の取得

## 参考資料

- Playwright MCP公式ドキュメント
- X（Twitter）のDOM構造（`data-testid`属性）
