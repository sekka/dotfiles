/**
 * Playwright MCP の browser_run_code に渡すコード
 *
 * 用途: 5階層まで徹底的にクロールし、全内部リンクを発見・検証
 * 特徴: JavaScript SPAにも対応、未探索ページの検出
 */

interface CrawlOptions {
  baseUrl: string;
  maxDepth: number;
  knownPages: string[];
  targetDomain?: string; // 特定ドメインへのリンクを探す場合
}

interface CrawlResult {
  results: Array<{
    url: string;
    totalLinks: number;
    internalLinks: number;
    externalLinks: number;
    hasTargetDomain?: boolean;
  }>;
  targetDomainLinks?: Array<{
    foundOn: string;
    targetUrl: string;
    linkText: string;
  }>;
  totalInternalLinksDiscovered: number;
  allInternalLinks: string[];
  unexplored: Array<{
    targetUrl: string;
    linkedFrom: Array<{
      from: string;
      linkText: string;
    }>;
  }>;
  depthStats: Record<number, {
    visited: number;
    totalLinks: number;
  }>;
}

/**
 * メインクロール関数
 *
 * @param page - Playwright Page オブジェクト
 * @param options - クロールオプション
 * @returns クロール結果
 */
export async function deepCrawl(page: any, options: CrawlOptions): Promise<CrawlResult> {
  const { baseUrl, maxDepth, knownPages, targetDomain } = options;

  const visited = new Set<string>();
  const results: CrawlResult['results'] = [];
  const targetDomainLinks: CrawlResult['targetDomainLinks'] = [];
  const allInternalLinks = new Set<string>();
  const discoveredLinks = new Map<string, Array<{ from: string; linkText: string }>>();

  // ページをクロール
  for (const url of knownPages) {
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      // リンクを抽出
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]')).map(a => ({
          href: a.href,
          text: a.textContent?.trim().substring(0, 100) || ''
        }));
      });

      // フィルタリング
      const internalLinks = links.filter(l =>
        l.href.startsWith(baseUrl) &&
        !l.href.startsWith('javascript:') &&
        !l.href.startsWith('mailto:') &&
        !l.href.startsWith('tel:')
      );

      const externalLinks = links.filter(l =>
        !l.href.startsWith(baseUrl) &&
        !l.href.startsWith('javascript:') &&
        !l.href.startsWith('mailto:') &&
        !l.href.startsWith('tel:')
      );

      // ターゲットドメインへのリンクをチェック
      let hasTargetDomain = false;
      if (targetDomain) {
        const targetLinks = links.filter(l => l.href.includes(targetDomain));
        if (targetLinks.length > 0) {
          hasTargetDomain = true;
          targetLinks.forEach(link => {
            targetDomainLinks!.push({
              foundOn: url,
              targetUrl: link.href,
              linkText: link.text
            });
          });
        }
      }

      // 内部リンクを記録
      internalLinks.forEach(link => {
        allInternalLinks.add(link.href);

        if (!discoveredLinks.has(link.href)) {
          discoveredLinks.set(link.href, []);
        }
        discoveredLinks.get(link.href)!.push({
          from: url,
          linkText: link.text
        });
      });

      results.push({
        url,
        totalLinks: links.length,
        internalLinks: internalLinks.length,
        externalLinks: externalLinks.length,
        ...(targetDomain && { hasTargetDomain })
      });

      // レート制限
      await page.waitForTimeout(1000);

    } catch (error: any) {
      results.push({
        url,
        totalLinks: 0,
        internalLinks: 0,
        externalLinks: 0,
        ...(targetDomain && { hasTargetDomain: false })
      });
    }
  }

  // 未探索ページを特定
  const unexplored: CrawlResult['unexplored'] = [];
  for (const [targetUrl, sources] of discoveredLinks.entries()) {
    if (!visited.has(targetUrl)) {
      unexplored.push({
        targetUrl,
        linkedFrom: sources.slice(0, 5) // 最初の5つのみ
      });
    }
  }

  // 階層別統計（簡易版: 既知ページのみ）
  const depthStats: Record<number, { visited: number; totalLinks: number }> = {};
  for (let d = 0; d <= maxDepth; d++) {
    const pagesAtDepth = results.filter((_, i) => {
      // 簡易的な階層判定（URLのスラッシュの数で判断）
      const depth = (knownPages[i].split('/').length - 3);
      return depth === d;
    });
    depthStats[d] = {
      visited: pagesAtDepth.length,
      totalLinks: pagesAtDepth.reduce((sum, p) => sum + p.totalLinks, 0)
    };
  }

  return {
    results,
    ...(targetDomain && { targetDomainLinks }),
    totalInternalLinksDiscovered: allInternalLinks.size,
    allInternalLinks: Array.from(allInternalLinks),
    unexplored,
    depthStats
  };
}

// Playwright MCP で実行する場合のコード
// async (page) => { ... } の中で使用
export const playwrightMcpCode = `
const baseUrl = 'https://aux-mobility.co.jp';
const maxDepth = 5;
const targetDomain = 'sompoaux.sakura.ne.jp'; // 探したい外部ドメイン

// 既知のページリスト
const knownPages = [
  baseUrl,
  baseUrl + '/business',
  baseUrl + '/projects',
  baseUrl + '/company',
  baseUrl + '/recruit',
  baseUrl + '/news',
  baseUrl + '/contact',
  // 第2階層
  baseUrl + '/recruit/interview/auction-managemant-i',
  baseUrl + '/recruit/interview/customer-service-m',
  baseUrl + '/recruit/interview/system-n',
  baseUrl + '/news/category/media',
  baseUrl + '/news/category/notice',
  baseUrl + '/news/category/press',
  baseUrl + '/news/category-1/2025',
  baseUrl + '/news/category-1/2024',
  baseUrl + '/news/category-1/2023',
  baseUrl + '/news/CAN7suuX',
  baseUrl + '/news/mY3h_ezw',
  baseUrl + '/news/VW8OE1Kg',
  baseUrl + '/terms/auction',
  baseUrl + '/terms/kobutsu',
  baseUrl + '/terms/tokushoho',
  baseUrl + '/terms/privacy',
  baseUrl + '/terms/security'
];

const visited = new Set();
const results = [];
const targetDomainLinks = [];
const allInternalLinks = new Set();
const discoveredLinks = new Map();

for (const url of knownPages) {
  if (visited.has(url)) continue;
  visited.add(url);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]')).map(a => ({
        href: a.href,
        text: a.textContent?.trim().substring(0, 100) || ''
      }));
    });

    const internalLinks = links.filter(l =>
      l.href.startsWith(baseUrl) &&
      !l.href.startsWith('javascript:') &&
      !l.href.startsWith('mailto:') &&
      !l.href.startsWith('tel:')
    );

    const externalLinks = links.filter(l =>
      !l.href.startsWith(baseUrl) &&
      !l.href.startsWith('javascript:') &&
      !l.href.startsWith('mailto:') &&
      !l.href.startsWith('tel:')
    );

    // ターゲットドメインへのリンクをチェック
    const targetLinks = links.filter(l => l.href.includes(targetDomain));
    if (targetLinks.length > 0) {
      targetLinks.forEach(link => {
        targetDomainLinks.push({
          foundOn: url,
          targetUrl: link.href,
          linkText: link.text
        });
      });
    }

    internalLinks.forEach(link => {
      allInternalLinks.add(link.href);

      if (!discoveredLinks.has(link.href)) {
        discoveredLinks.set(link.href, []);
      }
      discoveredLinks.get(link.href).push({
        from: url,
        linkText: link.text
      });
    });

    results.push({
      url,
      totalLinks: links.length,
      internalLinks: internalLinks.length,
      externalLinks: externalLinks.length,
      hasTargetDomain: targetLinks.length > 0
    });

    await page.waitForTimeout(1000);

  } catch (error) {
    results.push({
      url,
      totalLinks: 0,
      internalLinks: 0,
      externalLinks: 0,
      hasTargetDomain: false,
      error: error.message
    });
  }
}

// 未探索ページを特定
const unexplored = [];
for (const [targetUrl, sources] of discoveredLinks.entries()) {
  if (!visited.has(targetUrl)) {
    unexplored.push({
      targetUrl,
      linkedFrom: sources.slice(0, 5)
    });
  }
}

return {
  summary: {
    totalVisited: visited.size,
    totalInternalLinks: allInternalLinks.size,
    targetDomainLinksFound: targetDomainLinks.length,
    unexploredPages: unexplored.length
  },
  results,
  targetDomainLinks,
  allInternalLinks: Array.from(allInternalLinks),
  unexplored
};
`;
