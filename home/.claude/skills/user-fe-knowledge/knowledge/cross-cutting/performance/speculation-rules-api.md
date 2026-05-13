---
title: Speculation Rules API — クリック前プリレンダリング
category: cross-cutting/performance
tags: [speculation-rules, prerender, prefetch, performance, navigation, LCP, 2024]
browser_support: Chrome/Edge 109+ (2023-01), 実運用 121+ 推奨
created: 2026-05-13
updated: 2026-05-13
---

# Speculation Rules API でページ遷移を高速化

> 出典: https://ics.media/entry/260415/ — ICS 楢山 哲弘
> 追加日: 2026-05-13

ユーザーがリンクをクリックする前に、ブラウザがバックグラウンドでページを**完全にレンダリング**しておく仕組み。クリック時点で JS 実行を含むレンダリングが完了済みのため、遷移待ちがほぼ消える。

## 従来手法との違い

| 手法 | レンダリング | 標準化 | ブラウザ対応 |
|------|------------|--------|------------|
| `<link rel="prefetch">` | × (HTML キャッシュのみ) | ○ | 広く対応 |
| `<link rel="prerender">` | △ | 非推奨化 | Chrome のみ |
| **Speculation Rules API** | ◎ (JS 実行含む) | ○ JSON 構文 | Chrome/Edge |

## 効果測定の事例

- **Ray-Ban**: モバイル LCP 4.69秒 → 2.66秒（43%短縮）、コンバージョン率2倍、離脱率13%削減
- **Monrif**: デスクトップ LCP 17.9% 改善、エンゲージメント8.9%向上

## 基本実装

```html
<script type="speculationrules">
{
  "prerender": [{
    "where": { "href_matches": "/*" },
    "eagerness": "moderate"
  }]
}
</script>
```

## 特定 URL のみ対象

```html
<script type="speculationrules">
{
  "prerender": [{
    "urls": ["/products/", "/about/"]
  }]
}
</script>
```

## 副作用 URL の除外（重要）

ログアウト、カート追加など、GET アクセスで副作用が起きる URL は **必ず除外**する。プリレンダリングは「ユーザーが訪れたのと同じ」扱いになるため。

```html
<script type="speculationrules">
{
  "prerender": [{
    "where": {
      "and": [
        { "href_matches": "/*" },
        { "not": { "href_matches": "/logout" } },
        { "not": { "href_matches": "/cart/add/*" } },
        { "not": { "selector_matches": "[data-no-prerender]" } }
      ]
    },
    "eagerness": "moderate"
  }]
}
</script>
```

特定リンクを除外したい場合は HTML 側に `data-no-prerender` を付ければよい。

## eagerness の選び方

| 値 | タイミング | 用途 |
|---|----------|------|
| `immediate` | ルール検出直後 | 遷移先がほぼ決まっているページ（LP の申し込みボタン） |
| `eager` | 比較的早い段階 | prefetch 向き |
| `moderate` | 200ms ホバー or pointerdown | **prerender 推奨**（バランス型） |
| `conservative` | ポインターダウン直前 | 副作用リスクがある場合 |

## 同時先読み上限（Chromium）

| eagerness | Prefetch | Prerender |
|-----------|----------|-----------|
| `immediate` | 50 | 10 |
| `eager` / `moderate` / `conservative` | 2 (FIFO) | 2 (FIFO) |

上限到達時は FIFO で古い先読みが自動キャンセル。

## 推奨パターン（prefetch + prerender 併用）

prefetch でまず HTML を取り、ホバー時に prerender へ昇格させる二段構え。

```html
<script type="speculationrules">
{
  "prefetch": [{
    "where": { "href_matches": "/*" },
    "eagerness": "eager"
  }],
  "prerender": [{
    "where": { "href_matches": "/*" },
    "eagerness": "moderate"
  }]
}
</script>
```

## アナリティクス二重計測対策

プリレンダリング中に GA / GTM が発火すると PV を二重計上してしまう。`document.prerendering` でガードする。

```javascript
if (document.prerendering) {
  document.addEventListener("prerenderingchange", () => {
    initAnalytics();
  }, { once: true });
} else {
  initAnalytics();
}
```

`prerenderingchange` イベントは「実際にユーザーが訪れた瞬間」に発火する。

## 注意点

1. **副作用 URL の除外を忘れない**: ログアウト、決済確定、カート操作などは必ず `not` で除外
2. **アナリティクス対策**: `document.prerendering` チェックは初期化コードに必須
3. **拡張機能**: uBlock Origin 等で無効化される可能性。プログレッシブエンハンスメント前提で
4. **メモリコスト**: 同時に複数ページをレンダリングするためメモリ使用量が増える
5. **個人情報を含む URL**: ユーザー固有のページは慎重に（プリレンダリング後にクリックされない可能性）

## ブラウザサポート

- **対応**: Chrome / Edge 109+（2023年1月）、実運用は **121-122 以降推奨**
- **未対応**: Firefox、Safari
- **非対応ブラウザでは単に無視される** → 既存サイトに安全に導入可能

## SPA との関係

MPA（複数 HTML ページのサイト）で効果が最も大きい。SPA はフレームワーク内蔵の先読み（Next.js の `<Link>` など）との相補性を検討する。

## 関連ナレッジ

- [bfcache](./bfcache.md)
- [frontend-tuning](./frontend-tuning.md)
- [Core Web Vitals 最適化](./performance-optimization.md)

## 参考リソース

- [ICS: Speculation Rules API でウェブサイトのページ遷移を速くする](https://ics.media/entry/260415/)
- [MDN: Speculation Rules API](https://developer.mozilla.org/docs/Web/API/Speculation_Rules_API)
- [web.dev: Prerender pages in Chrome for instant page navigations](https://developer.chrome.com/blog/prerender-pages)
