---
title: Scroll Anchoring（スクロールアンカリング）
category: css/layout
tags: [scroll, anchoring, layout-shift, performance, ux, 2026]
browser_support: Chrome 56+, Firefox 66+, Safari 18.0+
created: 2026-01-31
updated: 2026-01-31
---

# Scroll Anchoring（スクロールアンカリング）

> 出典: https://gihyo.jp/article/2026/01/misskey-22
> 執筆日: 2026年1月26日
> 追加日: 2026-01-31

コンテンツが動的に読み込まれる際に、スクロール位置がずれるのを防ぐブラウザ機能。

## 概要

画像やコンテンツが遅延読み込みされる際、レイアウトシフトによってスクロール位置がずれる問題を自動的に補正します。

## 問題点

### レイアウトシフトの例

```html
<div class="article">
  <p>ユーザーがここを読んでいる...</p>
  <img src="photo.jpg" alt=""> <!-- 画像が読み込まれると... -->
  <p>このテキストが下にずれる！</p>
</div>
```

**問題**:
1. ユーザーがテキストを読んでいる
2. 上部の画像が読み込まれる
3. レイアウトがシフトし、テキストが下に移動
4. ユーザーが読んでいた箇所を見失う

## 解決策

### デフォルトの挙動

**Scroll Anchoring** は、モダンブラウザでデフォルトで有効になっています。

```css
/* デフォルト（有効） */
* {
  overflow-anchor: auto;
}
```

**動作**:
- ブラウザが自動的にスクロール位置を調整
- コンテンツが追加されても、ユーザーが見ている位置を維持

### 無効化（特定の要素）

```css
.dynamic-content {
  overflow-anchor: none; /* スクロールアンカリングを無効化 */
}
```

**用途**: 意図的にスクロール位置を変えたい場合（チャットUIなど）。

## ユースケース

### 無限スクロール

```css
.feed {
  overflow-anchor: auto; /* デフォルト、明示的に指定 */
}

.feed-item {
  min-height: 100px; /* 読み込み前の最小高さ */
}
```

**動作**:
- 新しいアイテムが読み込まれても、ユーザーが見ている位置は維持される

### 画像ギャラリー

```html
<div class="gallery">
  <img src="1.jpg" loading="lazy" alt="">
  <img src="2.jpg" loading="lazy" alt="">
  <img src="3.jpg" loading="lazy" alt="">
</div>
```

```css
.gallery {
  overflow-anchor: auto;
}

.gallery img {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9; /* 読み込み前にスペースを確保 */
}
```

### ブログ記事

```css
.article {
  overflow-anchor: auto;
}

/* 画像の高さを事前に指定 */
.article img {
  width: 100%;
  height: auto;
}
```

## 無効化が必要な場合

### チャットUI

```css
.chat-messages {
  overflow-anchor: none; /* 新しいメッセージで自動スクロール */
  overflow-y: auto;
}
```

**理由**: チャットでは新しいメッセージが追加されたら、自動的に最下部にスクロールしたい。

### スライドショー

```css
.carousel {
  overflow-anchor: none; /* スライド切り替え時の自動調整を無効化 */
}
```

## ベストプラクティス

### 1. 画像に aspect-ratio を指定

```css
img {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9; /* 読み込み前にスペースを確保 */
}
```

### 2. 最小高さを指定

```css
.placeholder {
  min-height: 200px; /* コンテンツ読み込み前の最小高さ */
}
```

### 3. loading="lazy" と併用

```html
<img src="photo.jpg" loading="lazy" alt="" style="aspect-ratio: 16 / 9;">
```

## デバッグ

### Scroll Anchoring が効いているか確認

```javascript
// DevTools Console で確認
document.getAnimations().forEach(anim => {
  if (anim.effect?.target?.style?.overflowAnchor === 'auto') {
    console.log('Scroll Anchoring: 有効');
  }
});
```

### パフォーマンス測定

```javascript
// Layout Shift の測定（Core Web Vitals）
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.hadRecentInput) continue;
    console.log('Layout Shift:', entry.value);
  }
}).observe({ type: 'layout-shift', buffered: true });
```

## ブラウザサポート

| ブラウザ | バージョン | デフォルト |
|----------|-----------|-----------|
| Chrome | 56+ | 有効 |
| Edge | 79+ | 有効 |
| Firefox | 66+ | 有効 |
| Safari | 18.0+ | 有効 |

**Note**: すべてのモダンブラウザでデフォルト有効です。

## パフォーマンスへの影響

### Core Web Vitals: CLS（Cumulative Layout Shift）

Scroll Anchoring は、CLS（累積レイアウトシフト）を改善します。

**良いCLSスコア**: 0.1以下

```javascript
// Web Vitals ライブラリで測定
import { getCLS } from 'web-vitals';

getCLS((metric) => {
  console.log('CLS:', metric.value);
});
```

## 関連機能

### content-visibility: auto

```css
.long-list-item {
  content-visibility: auto; /* ビューポート外はレンダリングしない */
}
```

併用すると、パフォーマンスとUXの両立が可能。

## トラブルシューティング

### 問題: Scroll Anchoring が効かない

**原因1**: `overflow-anchor: none` が設定されている

```css
/* 確認 */
* {
  overflow-anchor: auto !important; /* 強制的に有効化（デバッグ用） */
}
```

**原因2**: 要素に固定高さがない

```css
/* 解決策: 最小高さを指定 */
.item {
  min-height: 100px;
}
```

**原因3**: スクロールコンテナが複雑

```css
/* シンプルな構造に変更 */
.scroll-container {
  overflow-y: auto;
  overflow-anchor: auto;
}
```

## 実装例

### 無限スクロールブログ

```html
<div class="blog-feed">
  <article class="post">
    <img src="1.jpg" loading="lazy" style="aspect-ratio: 16/9" alt="">
    <h2>記事タイトル1</h2>
    <p>記事本文...</p>
  </article>
  <article class="post">
    <img src="2.jpg" loading="lazy" style="aspect-ratio: 16/9" alt="">
    <h2>記事タイトル2</h2>
    <p>記事本文...</p>
  </article>
</div>
```

```css
.blog-feed {
  overflow-anchor: auto; /* デフォルトだが明示 */
}

.post {
  min-height: 300px; /* 読み込み前の最小高さ */
  margin-bottom: 32px;
}

.post img {
  width: 100%;
  height: auto;
}
```

## 関連ナレッジ

- [loading="lazy"](../../html/modern/lazy-loading.md)
- [aspect-ratio](../values/aspect-ratio.md)
- [content-visibility](../../cross-cutting/performance/content-visibility.md)
- [Core Web Vitals: CLS](../../cross-cutting/performance/cls-optimization.md)

## 参考リソース

- [CSS Overflow Module Level 3: overflow-anchor](https://drafts.csswg.org/css-overflow-3/#overflow-anchor)
- [MDN: overflow-anchor](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-anchor)
- [Scroll Anchoring Explainer](https://github.com/WICG/ScrollAnchoring/blob/master/explainer.md)
- [Web.dev: Optimize CLS](https://web.dev/optimize-cls/)
