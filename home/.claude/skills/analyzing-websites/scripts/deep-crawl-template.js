/**
 * Playwright MCP の browser_run_code に渡すコード (改善版)
 *
 * 使い方:
 * 1. baseUrl, maxDepth, knownPages を編集
 * 2. このファイル全体を mcp__plugin_playwright_playwright__browser_run_code に渡す
 * 3. または、Claude Codeで Read してから実行
 *
 * 改善点:
 * - URL正規化（末尾スラッシュ、ハッシュの統一）
 * - 深度情報の追跡
 * - リトライ機構（最大3回）
 * - 進捗表示
 */

async (page) => {
  // ========================================
  // 設定（ここを編集）
  // ========================================

  const baseUrl = 'https://aux-mobility.co.jp';
  const maxDepth = 5;
  const targetDomain = 'sompoaux.sakura.ne.jp'; // 探したい外部ドメイン（不要ならnull）

  // クロール対象ページリスト（階層情報付き）
  const knownPages = [
    { url: baseUrl, depth: 0 },
    { url: `${baseUrl}/business`, depth: 1 },
    { url: `${baseUrl}/projects`, depth: 1 },
    { url: `${baseUrl}/company`, depth: 1 },
    { url: `${baseUrl}/recruit`, depth: 1 },
    { url: `${baseUrl}/news`, depth: 1 },
    { url: `${baseUrl}/contact`, depth: 1 },
    // 第2階層
    { url: `${baseUrl}/recruit/interview/auction-managemant-i`, depth: 2 },
    { url: `${baseUrl}/recruit/interview/customer-service-m`, depth: 2 },
    { url: `${baseUrl}/recruit/interview/system-n`, depth: 2 },
    { url: `${baseUrl}/news/category/media`, depth: 2 },
    { url: `${baseUrl}/news/category/notice`, depth: 2 },
    { url: `${baseUrl}/news/category/press`, depth: 2 },
    { url: `${baseUrl}/news/category-1/2025`, depth: 2 },
    { url: `${baseUrl}/news/category-1/2024`, depth: 2 },
    { url: `${baseUrl}/news/category-1/2023`, depth: 2 },
    { url: `${baseUrl}/news/CAN7suuX`, depth: 2 },
    { url: `${baseUrl}/news/mY3h_ezw`, depth: 2 },
    { url: `${baseUrl}/news/VW8OE1Kg`, depth: 2 },
    { url: `${baseUrl}/terms/auction`, depth: 2 },
    { url: `${baseUrl}/terms/kobutsu`, depth: 2 },
    { url: `${baseUrl}/terms/tokushoho`, depth: 2 },
    { url: `${baseUrl}/terms/privacy`, depth: 2 },
    { url: `${baseUrl}/terms/security`, depth: 2 }
  ];

  // ========================================
  // ユーティリティ関数
  // ========================================

  // URL正規化
  function normalizeUrl(urlString) {
    try {
      const url = new URL(urlString);
      // 末尾のスラッシュを削除（ルートパスは除く）
      url.pathname = url.pathname.replace(/\/$/, '') || '/';
      // ハッシュを削除
      url.hash = '';
      // クエリパラメータをソート
      const params = Array.from(url.searchParams.entries()).sort();
      url.search = params.length > 0 ?
        '?' + params.map(([k, v]) => `${k}=${v}`).join('&') : '';
      return url.toString();
    } catch (e) {
      return urlString;
    }
  }

  // リトライ付きページ遷移
  async function gotoWithRetry(page, url, maxRetries = 3) {
    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });
        return { success: true };
      } catch (error) {
        if (retry === maxRetries - 1) {
          return { success: false, error: error.message };
        }
        await page.waitForTimeout(2000);
      }
    }
  }

  // ========================================
  // クロール処理（編集不要）
  // ========================================

  const visited = new Map(); // URL -> depth
  const results = [];
  const targetDomainLinks = [];
  const allInternalLinks = new Set();
  const discoveredLinks = new Map();

  for (const pageInfo of knownPages) {
    const normalizedUrl = normalizeUrl(pageInfo.url);

    if (visited.has(normalizedUrl)) continue;
    visited.set(normalizedUrl, pageInfo.depth);

    const gotoResult = await gotoWithRetry(page, pageInfo.url);

    if (!gotoResult.success) {
      results.push({
        url: pageInfo.url,
        depth: pageInfo.depth,
        totalLinks: 0,
        internalLinks: 0,
        externalLinks: 0,
        hasTargetDomain: false,
        error: gotoResult.error
      });
      continue;
    }

    try {
      // リンクを抽出
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]')).map(a => ({
          href: a.href,
          text: (a.textContent || '').trim().substring(0, 100)
        }));
      });

      // URL正規化とフィルタリング
      const processedLinks = links.map(l => ({
        ...l,
        normalized: l.href
      }));

      // 内部リンクをフィルタ
      const internalLinks = processedLinks.filter(l => {
        const normalized = normalizeUrl(l.href);
        return normalized.startsWith(baseUrl) &&
          !l.href.startsWith('javascript:') &&
          !l.href.startsWith('mailto:') &&
          !l.href.startsWith('tel:');
      });

      // 外部リンクをフィルタ
      const externalLinks = processedLinks.filter(l => {
        const normalized = normalizeUrl(l.href);
        return !normalized.startsWith(baseUrl) &&
          !l.href.startsWith('javascript:') &&
          !l.href.startsWith('mailto:') &&
          !l.href.startsWith('tel:');
      });

      // ターゲットドメインへのリンクをチェック
      let hasTargetDomain = false;
      if (targetDomain) {
        const targetLinks = links.filter(l => l.href.includes(targetDomain));
        if (targetLinks.length > 0) {
          hasTargetDomain = true;
          targetLinks.forEach(link => {
            targetDomainLinks.push({
              foundOn: pageInfo.url,
              targetUrl: link.href,
              linkText: link.text
            });
          });
        }
      }

      // 内部リンクを記録（正規化済み）
      internalLinks.forEach(link => {
        const normalized = normalizeUrl(link.href);
        allInternalLinks.add(normalized);

        if (!discoveredLinks.has(normalized)) {
          discoveredLinks.set(normalized, []);
        }
        discoveredLinks.get(normalized).push({
          from: pageInfo.url,
          linkText: link.text
        });
      });

      results.push({
        url: pageInfo.url,
        depth: pageInfo.depth,
        totalLinks: links.length,
        internalLinks: internalLinks.length,
        externalLinks: externalLinks.length,
        hasTargetDomain
      });

      // レート制限
      await page.waitForTimeout(1000);

    } catch (error) {
      results.push({
        url: pageInfo.url,
        depth: pageInfo.depth,
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
      // 想定階層を計算（リンク元の最小階層 + 1）
      const minSourceDepth = Math.min(...sources.map(s => {
        const sourcePageInfo = knownPages.find(p => p.url === s.from);
        return sourcePageInfo ? sourcePageInfo.depth : 0;
      }));

      unexplored.push({
        targetUrl,
        wouldBeDepth: minSourceDepth + 1,
        linkedFrom: sources.slice(0, 5)
      });
    }
  }

  // 階層別統計（実際の階層情報を使用）
  const depthStats = {};
  for (let d = 0; d <= maxDepth; d++) {
    const pagesAtDepth = results.filter(r => r.depth === d);
    depthStats[d] = {
      visited: pagesAtDepth.length,
      totalLinks: pagesAtDepth.reduce((sum, p) => sum + p.totalLinks, 0),
      internalLinks: pagesAtDepth.reduce((sum, p) => sum + p.internalLinks, 0)
    };
  }

  // 結果を返す
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
    unexplored,
    depthStats
  };
}
