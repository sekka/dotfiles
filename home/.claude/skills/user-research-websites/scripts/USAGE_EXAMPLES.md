# 使用例

## 実際の実装例

### ケース1: aux-mobility.co.jp の徹底クロール

**要件**:
- 5階層まで徹底的にクロール
- sompoaux.sakura.ne.jp へのリンクを探す
- 未探索ページを検証

**実装**:

```javascript
// deep-crawl-template.js を基に実装

const baseUrl = 'https://aux-mobility.co.jp';
const maxDepth = 5;
const targetDomain = 'sompoaux.sakura.ne.jp';

const knownPages = [
  baseUrl,
  `${baseUrl}/business`,
  `${baseUrl}/projects`,
  `${baseUrl}/company`,
  `${baseUrl}/recruit`,
  `${baseUrl}/news`,
  `${baseUrl}/contact`,
  // ... 全27ページ
];

// 実行結果:
// - 訪問ページ数: 27
// - 発見した内部リンク: 33
// - sompoaux.sakura.ne.jpへのリンク: 0件
// - 未探索ページ: 0件
// - 探索率: 100%
```

**結論**: サイト内に sompoaux.sakura.ne.jp へのリンクは存在しない

**コンテキスト消費**:
- スクリプト使用前: 約15,000トークン（コード生成を含む）
- スクリプト使用後: 約2,000トークン（読み込みのみ）
- **効率化**: 約87%削減

---

### ケース2: siac.co.jp のテスト実行（改善版）

**要件**:
- 3階層までクロール
- 改善版スクリプトの検証
- URL正規化とリトライ機構の確認

**実装**:

```javascript
// 改善版 deep-crawl-template.js を使用

const baseUrl = 'https://www.siac.co.jp';
const maxDepth = 3;
const targetDomain = null;

const knownPages = [
  { url: baseUrl, depth: 0 },
  { url: `${baseUrl}/services/`, depth: 1 },
  { url: `${baseUrl}/works/`, depth: 1 },
  { url: `${baseUrl}/company/`, depth: 1 },
  { url: `${baseUrl}/recruit/`, depth: 1 },
  { url: `${baseUrl}/news/`, depth: 1 },
  { url: `${baseUrl}/community/`, depth: 1 },
  { url: `${baseUrl}/contact/`, depth: 1 },
  { url: `${baseUrl}/services/lineup/system-integration`, depth: 2 },
  { url: `${baseUrl}/services/lineup/ai-iot-application-support`, depth: 2 },
  { url: `${baseUrl}/company/overview`, depth: 2 },
  { url: `${baseUrl}/company/philosophy`, depth: 2 }
];

// 実行結果:
// - 訪問ページ数: 12
// - 発見した内部リンク: 219（正規化後）
// - 未探索ページ: 208（想定階層情報付き）
// - 実行時間: 約12秒
// - エラー: 0件（リトライ機構により安定）
```

**改善効果**:
- ✅ URL正規化により重複リンクを削減
- ✅ 階層情報が正確に記録（depth: 0, 1, 2）
- ✅ リトライ機構によりネットワークエラーなし
- ✅ wouldBeDepthにより未探索ページの階層を予測

**結論**: 改善版スクリプトは想定通りに動作し、再現性とデータ精度が向上

---

## パターン別実装例

### パターン1: 小規模サイト（10ページ以下）

**シナリオ**: コーポレートサイトの全ページをクロール

```javascript
const baseUrl = 'https://small-company.com';
const knownPages = [
  baseUrl,
  `${baseUrl}/about`,
  `${baseUrl}/services`,
  `${baseUrl}/contact`
];

// 実行時間: 約5秒
```

### パターン2: 中規模サイト（50ページ以下）

**シナリオ**: ECサイトの商品ページをクロール

```javascript
const baseUrl = 'https://shop.example.com';
const knownPages = [
  baseUrl,
  `${baseUrl}/category/electronics`,
  `${baseUrl}/category/books`,
  // ... 商品ページは動的に発見
];

// 実行時間: 約1分
// 未探索ページから新しい商品ページを発見
```

### パターン3: 大規模サイト（100ページ以上）

**シナリオ**: メディアサイトの記事ページをクロール

```javascript
const baseUrl = 'https://news.example.com';

// 第0階層: トップページ
const depth0 = [baseUrl];

// 第1階層: カテゴリページ
const depth1 = [
  `${baseUrl}/politics`,
  `${baseUrl}/economy`,
  `${baseUrl}/tech`
];

// 第2階層: 記事ページ（最新10件のみ）
const depth2 = [
  `${baseUrl}/politics/article-001`,
  `${baseUrl}/politics/article-002`,
  // ... 最新10件
];

const knownPages = [...depth0, ...depth1, ...depth2];

// 実行時間: 約2分
// 戦略: 全記事をクロールせず、最新記事のみをサンプリング
```

### パターン4: 特定ドメインへのリンク検索

**シナリオ**: パートナーサイトへのリンクを探す

```javascript
const baseUrl = 'https://main-site.com';
const targetDomain = 'partner-site.com';

// 全ページをクロール
const knownPages = [
  // ... 全ページ
];

// 結果:
// targetDomainLinks: [
//   {
//     foundOn: "https://main-site.com/partners",
//     targetUrl: "https://partner-site.com/collaboration",
//     linkText: "パートナー詳細"
//   }
// ]
```

### パターン5: 404ページの検出

**シナリオ**: サイト内のリンク切れを発見

```javascript
// 通常のクロール実行後、結果を分析

const brokenLinks = results.filter(r =>
  r.totalLinks === 0 && !r.error
);

// brokenLinks には404の可能性があるページが含まれる
```

---

## 高度な使用例

### 1. 動的にknownPagesを生成

**シナリオ**: 既存のサイトマップから自動生成

```javascript
// サイトマップを読み込む
const sitemap = JSON.parse(fs.readFileSync('sitemap.json'));

// URLを抽出
const knownPages = sitemap.pages.map(p => p.url);

// クロール実行
```

### 2. 段階的クロール

**シナリオ**: 第1階層で発見したリンクを使って第2階層をクロール

```javascript
// Phase 1: 第0-1階層
const phase1Pages = [baseUrl, ...depth1Pages];
const phase1Result = await crawl(phase1Pages);

// Phase 2: 発見した内部リンクを追加
const phase2Pages = [...phase1Pages, ...phase1Result.allInternalLinks];
const phase2Result = await crawl(phase2Pages);
```

### 3. 複数サイトの比較

**シナリオ**: 競合サイトとのリンク構造を比較

```javascript
const sites = [
  'https://site-a.com',
  'https://site-b.com',
  'https://site-c.com'
];

const results = [];
for (const site of sites) {
  // 各サイトをクロール
  const result = await crawl([site]);
  results.push({
    site,
    totalLinks: result.totalInternalLinks,
    depth: calculateMaxDepth(result)
  });
}

// 比較表を生成
```

---

## トラブルシューティング実例

### 問題1: 内部リンクが0件

**症状**: `internalLinks: 0` が全ページで発生

**原因**: サイトがJavaScriptで動的にレンダリングしている

**解決策**: このスクリプトはPlaywright MCPを使用しているため、通常は問題なし。それでも0件の場合:

```javascript
// waitUntil を変更
await page.goto(url, {
  waitUntil: 'networkidle', // domcontentloaded → networkidle
  timeout: 30000 // タイムアウトも延長
});

// または、明示的に待機
await page.waitForSelector('a[href]', { timeout: 5000 });
```

### 問題2: 未探索ページが多すぎる

**症状**: `unexplored: 500` など大量の未探索ページ

**原因**: 動的に生成されるページ（ページネーション、検索結果など）

**解決策**:

```javascript
// パターンで除外
const internalLinks = links.filter(l =>
  l.href.startsWith(baseUrl) &&
  !l.href.includes('?page=') && // ページネーション除外
  !l.href.includes('/search?') && // 検索結果除外
  !l.href.startsWith('javascript:') &&
  !l.href.startsWith('mailto:') &&
  !l.href.startsWith('tel:')
);
```

### 問題3: メモリ不足

**症状**: 大規模サイト（1000ページ以上）でメモリエラー

**解決策**: バッチ処理

```javascript
// 100ページごとにバッチ処理
const batchSize = 100;
for (let i = 0; i < knownPages.length; i += batchSize) {
  const batch = knownPages.slice(i, i + batchSize);
  const result = await crawl(batch);
  // 結果を保存
  saveResults(result, `batch-${i / batchSize}.json`);
}
```

---

## パフォーマンス最適化

### 並列クロール（実験的）

**注意**: Playwright MCPでは並列実行不可。Node.js + Playwrightで実装する場合のみ。

```javascript
// 複数のブラウザインスタンスで並列クロール
const batches = chunk(knownPages, 10); // 10ページずつ
const results = await Promise.all(
  batches.map(batch => crawlBatch(batch))
);
```

### レート制限の調整

```javascript
// 速度重視（サーバー負荷注意）
await page.waitForTimeout(500); // 1000 → 500

// 安全重視
await page.waitForTimeout(2000); // 1000 → 2000
```

---

## 出力結果の活用例

### 1. サイトマップ生成

```javascript
// 結果からMarkdownサイトマップを生成
const sitemap = generateSitemap(result.allInternalLinks);
fs.writeFileSync('sitemap.md', sitemap);
```

### 2. リンク切れレポート

```javascript
// 404の可能性があるページをリスト化
const brokenLinks = result.results
  .filter(r => r.totalLinks === 0)
  .map(r => r.url);

console.log('リンク切れの可能性:', brokenLinks);
```

### 3. 探索率レポート

```javascript
const coverage = (result.summary.totalVisited /
  (result.summary.totalVisited + result.summary.unexploredPages)) * 100;

console.log(`探索率: ${coverage.toFixed(1)}%`);
```

---

## まとめ

### いつこのスクリプトを使うべきか

**使うべき場面**:
- 徹底的なクロールが必要（5階層以上）
- JavaScript SPAサイト
- 未探索ページの検証が重要
- 特定ドメインへのリンク検索
- コンテキスト効率を重視

**使わなくてもよい場面**:
- 単純な1-2階層のクロール
- 静的HTMLサイト（Python標準ライブラリで十分）
- リアルタイムで対話的にクロール

### コスト比較

| 手法 | コンテキスト消費 | 実行時間 | 再現性 |
|------|------------------|----------|--------|
| 毎回コード生成 | 15,000トークン | 変動 | 低 |
| このスクリプト | 2,000トークン | 一定 | 高 |
| **削減率** | **87%** | - | - |

### 改善版の追加メリット

| 機能 | 改善前 | 改善版 |
|------|--------|--------|
| URL正規化 | なし | 末尾スラッシュ・ハッシュを統一 |
| リトライ機構 | なし | 最大3回、2秒間隔 |
| 階層計算 | URLパスの`/`の数 | 明示的なdepth指定 |
| 未探索ページ情報 | リンク元のみ | 想定階層（wouldBeDepth）も含む |
| depthStats | visited, totalLinks | internalLinksも追加 |

**推奨**: 新規実装では改善版を使用してください。
