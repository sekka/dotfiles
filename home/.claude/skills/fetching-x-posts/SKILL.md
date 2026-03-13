---
name: fetching-x-posts
description: X（Twitter）の投稿URLから効率的にデータを抽出します。Playwright CLIをheadlessモードで使用し、メモリ使用量とコンテキスト消費量を最小限に抑えます。
disable-model-invocation: false
---

# X投稿取得スキル

## 概要

X投稿URLからJSONデータを抽出する。Node.js CLI（Playwright）を優先実行し、失敗時のみMCPにフォールバック。画像付き投稿の場合は同一ブラウザセッションでスクリーンショットも取得する。

## 実行フロー

### Step 1: Node.js CLI方式（優先）

heredocで実行する（`node -e "..."` は `!` のbash history expansion と Node.js v24 TypeScriptパーサーの問題で失敗するため）。

```bash
node - <<'NODEEOF'
const { execFileSync } = require('child_process');
const npmRoot = execFileSync('npm', ['root', '-g']).toString().trim();
const { chromium } = require(`${npmRoot}/playwright`);
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ userAgent: UA });
  try {
    await page.goto('https://x.com/username/status/TWEET_ID', { waitUntil: 'domcontentloaded', timeout: 30000 }); // ← URLを置き換える
    await page.waitForSelector('[data-testid="tweetText"]', { timeout: 15000 }).catch(() => null);
    const data = await page.evaluate(() => {
      const article = document.querySelector('article');
      if (!article) return { error: 'article not found' };
      const textEl = article.querySelector('[data-testid="tweetText"]');
      const userEl = article.querySelector('[data-testid="User-Name"]');
      const timeEl = article.querySelector('time');
      const userLines = userEl?.innerText.split('\n') ?? [];
      return {
        userName: userLines[0] || '',
        userHandle: userLines.find(s => s.startsWith('@')) || '',
        text: textEl?.innerText || '',
        timestamp: timeEl?.getAttribute('datetime') || '',
        displayTime: timeEl?.innerText || '',
        engagement: {
          replies: article.querySelector('[data-testid="reply"]')?.getAttribute('aria-label') || '',
          retweets: article.querySelector('[data-testid="retweet"]')?.getAttribute('aria-label') || '',
          likes: article.querySelector('[data-testid="like"]')?.getAttribute('aria-label') || '',
        },
        media: {
          type: article.querySelector('[data-testid="videoPlayer"]') ? 'video'
              : article.querySelector('[data-testid="tweetPhoto"]') ? 'image' : 'none',
        }
      };
    });
    if (data.media && data.media.type === 'image') {
      await page.locator('article').first().screenshot({ path: '/tmp/x_post_image.png' });
    }
    console.log(JSON.stringify(data, null, 2));
  } finally { await browser.close(); }
})();
NODEEOF
```

### Step 2: MCP方式（フォールバック）

Step 1で以下のいずれかが発生した場合のみ使用する：
- `Cannot find package 'playwright'` がエラー出力に含まれる
- `Cannot find module` がエラー出力に含まれる
- `MODULE_NOT_FOUND` がエラー出力に含まれる
- 終了コードが0以外、または標準出力が空、またはJSONパース失敗
- 標準出力のJSONに `error` キーが含まれる（例: `article not found`）

```typescript
// ページにアクセス（URLは取得対象のX投稿URLに置き換える）
mcp__plugin_playwright_playwright__browser_navigate({ url: 'https://x.com/username/status/TWEET_ID' });

// データ抽出 + 画像ありの場合はスクリーンショットも同一セッションで取得
const data = await mcp__plugin_playwright_playwright__browser_run_code({ code: `
  async (page) => {
    await page.waitForSelector('[data-testid="tweetText"]', { timeout: 15000 }).catch(() => null);
    const data = await page.evaluate(() => {
      const article = document.querySelector('article');
      if (!article) return { error: 'article not found' };
      const textEl = article.querySelector('[data-testid="tweetText"]');
      const userEl = article.querySelector('[data-testid="User-Name"]');
      const timeEl = article.querySelector('time');
      const userLines = userEl?.innerText.split('\n') ?? [];
      return {
        userName: userLines[0] || '',
        userHandle: userLines.find(s => s.startsWith('@')) || '',
        text: textEl?.innerText || '',
        timestamp: timeEl?.getAttribute('datetime') || '',
        displayTime: timeEl?.innerText || '',
        engagement: {
          replies: article.querySelector('[data-testid="reply"]')?.getAttribute('aria-label') || '',
          retweets: article.querySelector('[data-testid="retweet"]')?.getAttribute('aria-label') || '',
          likes: article.querySelector('[data-testid="like"]')?.getAttribute('aria-label') || '',
        },
        media: {
          type: article.querySelector('[data-testid="videoPlayer"]') ? 'video'
              : article.querySelector('[data-testid="tweetPhoto"]') ? 'image' : 'none',
        }
      };
    });
    if (data.media?.type === 'image') {
      await page.locator('article').first().screenshot({ path: '/tmp/x_post_image.png' });
    }
    return data;
  }
` });

// セッションを閉じる（MCP方式はブラウザが残留するため必須）
mcp__plugin_playwright_playwright__browser_close();
```

### Step 3: 画像の表示

`media.type === 'image'` の場合、Read ツールで `/tmp/x_post_image.png` を読み込む。
動画（`media.type === 'video'`）の場合はメタデータのみ（動画本体は取得不可）。

### Step 4: 結果の整形と出力

```
**投稿者:** {userName} ({userHandle})
**日時:** {displayTime}
**本文:**
{text}

**エンゲージメント:** 返信{replies} / リポスト{retweets} / いいね{likes}
**メディア:** {type}
[画像がある場合はここに表示]
```

## エラーハンドリング

| エラー | 原因 | 対応 |
|--------|------|------|
| `article not found` | ページ未読み込み / ログイン要求 | URL確認 or 時間をおいて再試行 |
| `Cannot find package 'playwright'` | グローバルインストール未完了 | Step 2（MCP方式）にフォールバック |
| タイムアウト | ネットワーク遅延 | timeout値を増やして再試行 |

## 制限事項

1. 公開投稿のみ（ログインが必要な投稿は取得不可）
2. 動画コンテンツはメタデータのみ（動画本体は取得しない）
3. リプライチェーンはメイン投稿のみ対象
