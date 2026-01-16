---
title: aspect-ratio
category: css/layout
tags: [aspect-ratio, layout, responsive, cls]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# aspect-ratio

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

アスペクト比を指定。CLS 対策にも有効。

## 基本的な使い方

```css
.video-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.square {
  aspect-ratio: 1; /* 正方形 */
}

/* 画像と組み合わせ */
.thumbnail {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}
```

## ユースケース

### レスポンシブ動画

```css
.video-container {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.video-container iframe {
  width: 100%;
  height: 100%;
}
```

### カードレイアウト

```css
.card-image {
  width: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  background: #f0f0f0; /* 画像読み込み前の背景 */
}
```

### CLS（Cumulative Layout Shift）対策

```css
/* 画像読み込み前に領域を確保 */
img {
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
}
```

## 従来の方法との比較

```css
/* 従来: padding-top ハック */
.video-wrapper {
  position: relative;
  padding-top: 56.25%; /* 16:9 */
}

.video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* aspect-ratio使用: シンプル */
.video-wrapper {
  aspect-ratio: 16 / 9;
}

.video-wrapper iframe {
  width: 100%;
  height: 100%;
}
```

## ブラウザ対応

全モダンブラウザで対応済み。

## 関連ナレッジ

- [object-fit](./object-fit.md)
- [CLS 対策](../../cross-cutting/performance/cls-optimization.md)
