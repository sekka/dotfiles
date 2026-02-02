/**
 * Playwright MCP の browser_run_code に渡すコード (BFS改善版)
 *
 * AUXプロジェクトのクロールスクリプトから得られた知見を統合：
 * - BFS（幅優先探索）による階層的クローリング
 * - より堅牢なURL正規化
 * - 未探索ページの詳細追跡
 * - 階層別統計の強化
 *
 * 使い方:
 * 1. baseUrl, maxDepth を編集
 * 2. 必要に応じて startUrls を編集（既知のURLリスト）
 * 3. このファイル全体を mcp__plugin_playwright_playwright__browser_run_code に渡す
 * 4. または、Claude Codeで Read してから実行
 */

async (page) => {
  // ========================================
  // 設定（ここを編集）
  // ========================================

  const baseUrl = 'https://example.com';
  const maxDepth = 3;
  const targetDomain = null; // 探したい外部ドメイン（不要ならnull）

  // 開始URL（通常はトップページのみでOK）
  const startUrls = [
    baseUrl
  ];

  // 既知のページがある場合はここに追加（オプション）
  const knownPages = [
    // `${baseUrl}/about`,
    // `${baseUrl}/contact`,
  ];

  // ========================================
  // ユーティリティ関数
  // ========================================

  /**
   * URL正規化（AUXスクリプトの知見を統合）
   * - ハッシュを削除
   * - 末尾スラッシュを削除（ルート以外）
   * - クエリパラメータをソート
   */
  function normalizeUrl(urlString, base) {
    try {
      const url = new URL(urlString, base);
      // ハッシュを削除
      url.hash = '';
      // 末尾のスラッシュを削除（ルートパスは除く）
      let normalized = url.href;
      if (normalized.endsWith('/') && normalized !== baseUrl + '/') {
        normalized = normalized.slice(0, -1);
      }
      return normalized;
    } catch (e) {
      return null;
    }
  }

  /**
   * リトライ付きページ遷移
   */
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

  /**
   * ページからリンクを抽出
   */
  async function extractLinks(page, currentUrl) {
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]')).map(a => ({
        href: a.href,
        text: (a.textContent || '').trim().substring(0, 100),
        originalHref: a.getAttribute('href')
      }));
    });

    // フィルタリング
    return links.filter(l => {
      const href = l.originalHref;
      return href &&
        !href.startsWith('#') &&
        !href.startsWith('javascript:') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:');
    });
  }

  // ========================================
  // BFSクローリング処理
  // ========================================

  const visited = new Set();
  const allPages = [];
  const targetDomainLinks = [];
  const discoveredLinks = new Map(); // targetUrl -> [{from, linkText, depth}]

  // 初期化：startUrls + knownPages
  let currentLevel = new Set([...startUrls, ...knownPages].map(url => normalizeUrl(url, baseUrl)));

  console.log(`クロール開始: ${baseUrl}`);
  console.log(`最大深度: ${maxDepth}`);
  console.log(`開始URL数: ${currentLevel.size}`);

  for (let depth = 0; depth <= maxDepth; depth++) {
    console.log(`\n=== 深度${depth}のクロール開始 ===`);
    console.log(`対象ページ数: ${currentLevel.size}`);

    const nextLevel = new Set();

    for (const url of Array.from(currentLevel)) {
      if (visited.has(url)) continue;

      visited.add(url);
      console.log(`[深度${depth}] クロール: ${url}`);

      const gotoResult = await gotoWithRetry(page, url);

      if (!gotoResult.success) {
        allPages.push({
          url: url,
          depth: depth,
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
        const links = await extractLinks(page, url);

        // 内部リンクと外部リンクを分類
        const internalLinks = [];
        const externalLinks = [];

        for (const link of links) {
          const normalized = normalizeUrl(link.href, url);
          if (!normalized) continue;

          if (normalized.startsWith(baseUrl)) {
            internalLinks.push({ ...link, normalized });

            // 次の階層の候補に追加
            if (depth < maxDepth && !visited.has(normalized)) {
              nextLevel.add(normalized);
            }

            // 発見リンクを記録
            if (!discoveredLinks.has(normalized)) {
              discoveredLinks.set(normalized, []);
            }
            discoveredLinks.get(normalized).push({
              from: url,
              linkText: link.text,
              depth: depth
            });
          } else {
            externalLinks.push({ ...link, normalized });
          }
        }

        // ターゲットドメインへのリンクをチェック
        let hasTargetDomain = false;
        if (targetDomain) {
          const targetLinks = links.filter(l => l.href.includes(targetDomain));
          if (targetLinks.length > 0) {
            hasTargetDomain = true;
            targetLinks.forEach(link => {
              targetDomainLinks.push({
                foundOn: url,
                foundOnDepth: depth,
                targetUrl: link.href,
                linkText: link.text
              });
            });
          }
        }

        allPages.push({
          url: url,
          depth: depth,
          totalLinks: links.length,
          internalLinks: internalLinks.length,
          externalLinks: externalLinks.length,
          hasTargetDomain
        });

        console.log(`  内部リンク数: ${internalLinks.length}`);

        // レート制限
        await page.waitForTimeout(1500);

      } catch (error) {
        allPages.push({
          url: url,
          depth: depth,
          totalLinks: 0,
          internalLinks: 0,
          externalLinks: 0,
          hasTargetDomain: false,
          error: error.message
        });
      }
    }

    console.log(`深度${depth}完了: ${Array.from(currentLevel).filter(url => visited.has(url)).length}ページ訪問`);
    console.log(`次の階層の候補: ${nextLevel.size}ページ`);

    currentLevel = nextLevel;
  }

  // ========================================
  // 結果の集計
  // ========================================

  // 未探索ページを特定
  const unexplored = [];
  for (const [targetUrl, sources] of discoveredLinks.entries()) {
    if (!visited.has(targetUrl)) {
      // リンク元の最小階層を計算
      const minSourceDepth = Math.min(...sources.map(s => s.depth));
      unexplored.push({
        targetUrl,
        wouldBeDepth: minSourceDepth + 1,
        linkedFrom: sources.slice(0, 5) // 最初の5つのソースのみ
      });
    }
  }

  // 階層別統計
  const depthStats = {};
  for (let d = 0; d <= maxDepth; d++) {
    const pagesAtDepth = allPages.filter(p => p.depth === d);
    depthStats[d] = {
      visited: pagesAtDepth.length,
      totalLinks: pagesAtDepth.reduce((sum, p) => sum + p.totalLinks, 0),
      internalLinks: pagesAtDepth.reduce((sum, p) => sum + p.internalLinks, 0),
      externalLinks: pagesAtDepth.reduce((sum, p) => sum + p.externalLinks, 0)
    };
  }

  // ========================================
  // 結果を返す
  // ========================================

  console.log('\n=== クロール完了 ===');
  console.log(`訪問ページ数: ${visited.size}`);
  console.log(`未探索ページ: ${unexplored.length}`);
  if (targetDomain) {
    console.log(`${targetDomain}へのリンク: ${targetDomainLinks.length}件`);
  }

  return {
    summary: {
      totalVisited: visited.size,
      maxDepth: maxDepth,
      targetDomainLinksFound: targetDomainLinks.length,
      unexploredPages: unexplored.length
    },
    depthStats,
    allPages,
    targetDomainLinks: targetDomain ? targetDomainLinks : [],
    unexplored: unexplored.sort((a, b) => a.wouldBeDepth - b.wouldBeDepth).slice(0, 100), // 深度順、最大100件
    visitedUrls: Array.from(visited)
  };
}
