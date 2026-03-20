/**
 * Playwright MCP の browser_run_code に渡すコード (改善版)
 *
 * 使い方:
 * 1. 環境変数で設定: CRAWL_BASE_URL, CRAWL_MAX_DEPTH, CRAWL_TARGET_DOMAIN, CRAWL_KNOWN_PAGES_JSON
 * 2. または、スクリプト内の設定セクションを直接編集
 * 3. このファイル全体を mcp__plugin_playwright_playwright__browser_run_code に渡す
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
	// 設定（引数 or 環境変数から読み込み）
	// ========================================

	// 使い方:
	// 環境変数で設定:
	//   CRAWL_BASE_URL=https://example.com
	//   CRAWL_MAX_DEPTH=5  (デフォルト: 5)
	//   CRAWL_TARGET_DOMAIN=external.com  (オプション)
	//   CRAWL_KNOWN_PAGES_JSON='[{"url":"https://example.com","depth":0},{"url":"https://example.com/about","depth":1}]'
	//
	// または、以下の変数を直接編集:

	const baseUrl = (typeof process !== 'undefined' && process.env?.CRAWL_BASE_URL) || "https://example.com";
	const maxDepth = parseInt((typeof process !== 'undefined' && process.env?.CRAWL_MAX_DEPTH) || "5", 10);
	const targetDomain = (typeof process !== 'undefined' && process.env?.CRAWL_TARGET_DOMAIN) || null;

	if (baseUrl === "https://example.com") {
		console.warn("⚠️ baseUrl がデフォルト値です。CRAWL_BASE_URL 環境変数またはスクリプト内で設定してください。");
	}

	// クロール対象ページリスト（階層情報付き）
	// 環境変数 CRAWL_KNOWN_PAGES_JSON から JSON 配列で渡すか、直接編集
	const knownPagesJson = (typeof process !== 'undefined' && process.env?.CRAWL_KNOWN_PAGES_JSON) || "";
	const knownPages = knownPagesJson ? JSON.parse(knownPagesJson) : [
		{ url: baseUrl, depth: 0 },
		// 第1階層の例:
		// { url: `${baseUrl}/about`, depth: 1 },
		// { url: `${baseUrl}/contact`, depth: 1 },
	];

	// ========================================
	// ユーティリティ関数
	// ========================================

	// URL正規化
	function normalizeUrl(urlString) {
		try {
			const url = new URL(urlString);
			// 末尾のスラッシュを削除（ルートパスは除く）
			url.pathname = url.pathname.replace(/\/$/, "") || "/";
			// ハッシュを削除
			url.hash = "";
			// クエリパラメータをソート
			const params = Array.from(url.searchParams.entries()).sort();
			url.search = params.length > 0 ? "?" + params.map(([k, v]) => `${k}=${v}`).join("&") : "";
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
					waitUntil: "domcontentloaded",
					timeout: 15000,
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
				error: gotoResult.error,
			});
			continue;
		}

		try {
			// リンクを抽出
			const links = await page.evaluate(() => {
				return Array.from(document.querySelectorAll("a[href]")).map((a) => ({
					href: a.href,
					text: (a.textContent || "").trim().substring(0, 100),
				}));
			});

			// URL正規化とフィルタリング
			const processedLinks = links.map((l) => ({
				...l,
				normalized: l.href,
			}));

			// 内部リンクをフィルタ
			const internalLinks = processedLinks.filter((l) => {
				const normalized = normalizeUrl(l.href);
				return (
					normalized.startsWith(baseUrl) &&
					!l.href.startsWith("javascript:") &&
					!l.href.startsWith("mailto:") &&
					!l.href.startsWith("tel:")
				);
			});

			// 外部リンクをフィルタ
			const externalLinks = processedLinks.filter((l) => {
				const normalized = normalizeUrl(l.href);
				return (
					!normalized.startsWith(baseUrl) &&
					!l.href.startsWith("javascript:") &&
					!l.href.startsWith("mailto:") &&
					!l.href.startsWith("tel:")
				);
			});

			// ターゲットドメインへのリンクをチェック
			let hasTargetDomain = false;
			if (targetDomain) {
				const targetLinks = links.filter((l) => l.href.includes(targetDomain));
				if (targetLinks.length > 0) {
					hasTargetDomain = true;
					targetLinks.forEach((link) => {
						targetDomainLinks.push({
							foundOn: pageInfo.url,
							targetUrl: link.href,
							linkText: link.text,
						});
					});
				}
			}

			// 内部リンクを記録（正規化済み）
			internalLinks.forEach((link) => {
				const normalized = normalizeUrl(link.href);
				allInternalLinks.add(normalized);

				if (!discoveredLinks.has(normalized)) {
					discoveredLinks.set(normalized, []);
				}
				discoveredLinks.get(normalized).push({
					from: pageInfo.url,
					linkText: link.text,
				});
			});

			results.push({
				url: pageInfo.url,
				depth: pageInfo.depth,
				totalLinks: links.length,
				internalLinks: internalLinks.length,
				externalLinks: externalLinks.length,
				hasTargetDomain,
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
				error: error.message,
			});
		}
	}

	// 未探索ページを特定
	const unexplored = [];
	for (const [targetUrl, sources] of discoveredLinks.entries()) {
		if (!visited.has(targetUrl)) {
			// 想定階層を計算（リンク元の最小階層 + 1）
			const minSourceDepth = Math.min(
				...sources.map((s) => {
					const sourcePageInfo = knownPages.find((p) => p.url === s.from);
					return sourcePageInfo ? sourcePageInfo.depth : 0;
				}),
			);

			unexplored.push({
				targetUrl,
				wouldBeDepth: minSourceDepth + 1,
				linkedFrom: sources.slice(0, 5),
			});
		}
	}

	// 階層別統計（実際の階層情報を使用）
	const depthStats = {};
	for (let d = 0; d <= maxDepth; d++) {
		const pagesAtDepth = results.filter((r) => r.depth === d);
		depthStats[d] = {
			visited: pagesAtDepth.length,
			totalLinks: pagesAtDepth.reduce((sum, p) => sum + p.totalLinks, 0),
			internalLinks: pagesAtDepth.reduce((sum, p) => sum + p.internalLinks, 0),
		};
	}

	// 結果を返す
	return {
		summary: {
			totalVisited: visited.size,
			totalInternalLinks: allInternalLinks.size,
			targetDomainLinksFound: targetDomainLinks.length,
			unexploredPages: unexplored.length,
		},
		results,
		targetDomainLinks,
		allInternalLinks: Array.from(allInternalLinks),
		unexplored,
		depthStats,
	};
};
