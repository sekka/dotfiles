---
title: CSS Grid Masonry Layout（Grid Lanes）
category: css/layout
tags: [grid, masonry, pinterest, layout, 2026]
browser_support: Safari 19.0+, Firefox 77+ (with flag)
created: 2026-01-31
updated: 2026-01-31
---

# CSS Grid Masonry Layout（Grid Lanes）

> 出典: https://gihyo.jp/article/2026/01/misskey-22
> 執筆日: 2026年1月26日
> 追加日: 2026-01-31

JavaScript不要でPinterest風のMasonryレイアウトを実現するCSS Grid拡張機能。

## 概要

従来はJavaScriptライブラリが必要だったMasonryレイアウト（高さが異なるカードをタイル状に配置）が、CSSのみで実装可能になります。

## 基本的な使い方

```css
.masonry-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-template-rows: masonry; /* Masonry レイアウトを有効化 */
  gap: 16px;
}
```

**重要**: `grid-template-rows: masonry` または `grid-template-columns: masonry` で有効化します。

## 縦方向のMasonry

```css
/* 縦にタイル状に並べる（デフォルト） */
.masonry-vertical {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: masonry;
  gap: 20px;
}
```

**動作**: 各列で高さが最も低い位置に次のアイテムが配置されます。

## 横方向のMasonry

```css
/* 横にタイル状に並べる */
.masonry-horizontal {
  display: grid;
  grid-template-columns: masonry;
  grid-template-rows: repeat(3, auto);
  gap: 20px;
}
```

## ユースケース

### 画像ギャラリー

```html
<div class="gallery">
  <img src="1.jpg" alt="">
  <img src="2.jpg" alt="">
  <img src="3.jpg" alt="">
  <!-- ... -->
</div>
```

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-template-rows: masonry;
  gap: 16px;
}

.gallery img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}
```

### カードレイアウト

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-template-rows: masonry;
  gap: 24px;
  padding: 24px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### ブログ記事一覧

```css
.blog-posts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: masonry;
  gap: 32px;
}

.post {
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.post img {
  width: 100%;
  height: auto;
}
```

## レスポンシブ対応

```css
.masonry {
  display: grid;
  grid-template-rows: masonry;
  gap: 16px;
}

/* モバイル: 1カラム */
@media (max-width: 640px) {
  .masonry {
    grid-template-columns: 1fr;
  }
}

/* タブレット: 2カラム */
@media (min-width: 641px) and (max-width: 1024px) {
  .masonry {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* デスクトップ: 3カラム */
@media (min-width: 1025px) {
  .masonry {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 配置アルゴリズムの制御

```css
.masonry {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: masonry;
  masonry-auto-flow: next; /* デフォルト */
}
```

### masonry-auto-flow の値

| 値 | 説明 |
|----|------|
| `next` | 次の空きスペースに配置（デフォルト） |
| `ordered` | ソース順に配置 |
| `dense` | 隙間を埋めるように配置 |

**例: 隙間を埋める**

```css
.masonry-dense {
  grid-template-rows: masonry;
  masonry-auto-flow: dense; /* 隙間を最小化 */
}
```

## アイテムのスパン

```css
.masonry-item {
  /* 2カラム分の幅 */
  grid-column: span 2;
}

.masonry-item.featured {
  /* 特定のアイテムを強調 */
  grid-column: span 3;
}
```

## 従来の方法との比較

### JavaScript ライブラリ（Masonry.js）

```javascript
// 従来: JavaScriptが必要
const masonry = new Masonry('.grid', {
  itemSelector: '.grid-item',
  columnWidth: 200,
  gutter: 16
});
```

**問題点**:
- JavaScriptライブラリの読み込みが必要
- レイアウト計算がJavaScriptで行われる
- リサイズ時の再計算が必要
- パフォーマンスオーバーヘッド

### CSS Grid Masonry

```css
/* CSS のみ */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-template-rows: masonry;
  gap: 16px;
}
```

**利点**:
- JavaScript不要
- ブラウザネイティブで高速
- レスポンシブに自動対応
- メンテナンスコストが低い

## ブラウザサポート

| ブラウザ | バージョン | 備考 |
|----------|-----------|------|
| Safari | 19.0+ | 2025年予定 |
| Firefox | 77+ | `layout.css.grid-template-masonry-value.enabled` フラグで有効化 |
| Chrome | 未対応 | 検討中 |
| Edge | 未対応 | 検討中 |

### Firefox での有効化

1. `about:config` を開く
2. `layout.css.grid-template-masonry-value.enabled` を検索
3. `true` に設定

## フォールバック

```css
/* フォールバック: 通常のグリッド */
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

/* Masonry サポート */
@supports (grid-template-rows: masonry) {
  .masonry {
    grid-template-rows: masonry;
  }
}
```

### JavaScript フォールバック

```javascript
// Masonry 未対応ブラウザで Masonry.js を使用
if (!CSS.supports('grid-template-rows', 'masonry')) {
  // Masonry.js を読み込んで初期化
  loadMasonryLibrary();
}
```

## パフォーマンス

### 最適化のヒント

1. **画像の遅延読み込み**

```html
<img src="image.jpg" loading="lazy" alt="">
```

2. **contain プロパティ**

```css
.masonry-item {
  contain: layout style paint;
}
```

3. **content-visibility**

```css
.masonry-item {
  content-visibility: auto;
}
```

## アニメーション

```css
.masonry-item {
  transition: transform 0.3s ease;
}

.masonry-item:hover {
  transform: scale(1.05);
  z-index: 1;
}
```

**注意**: Masonryレイアウト自体のアニメーションは現時点では限定的です。

## アクセシビリティ

```css
/* キーボードフォーカス時のハイライト */
.masonry-item:focus-visible {
  outline: 3px solid #007aff;
  outline-offset: 4px;
}
```

## 実装のベストプラクティス

1. **最小幅の指定**: `minmax(250px, 1fr)` で小さすぎるカラムを防ぐ
2. **適切なギャップ**: 16px〜24px が視覚的に良好
3. **レスポンシブ**: メディアクエリでカラム数を調整
4. **画像最適化**: WebP形式、適切なサイズ
5. **遅延読み込み**: `loading="lazy"` を使用

## 関連ナレッジ

- [CSS Grid 基礎](./grid-basics.md)
- [auto-fill と auto-fit](./grid-auto-fill-fit.md)
- [CSS contain プロパティ](../values/contain.md)
- [content-visibility](../../cross-cutting/performance/content-visibility.md)

## 参考リソース

- [CSS Grid Layout Module Level 3: Masonry](https://drafts.csswg.org/css-grid-3/#masonry-layout)
- [MDN: Masonry Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Masonry_Layout)
- [Can I Use: CSS Grid Masonry](https://caniuse.com/css-grid-masonry)
