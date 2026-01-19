---
title: レスポンシブ画像（srcset, sizes, picture）
category: html
tags: [responsive, srcset, sizes, picture, performance, 2016, updated-2025]
browser_support: 全モダンブラウザ対応（IE11 は非対応）
created: 2026-01-19
updated: 2026-01-19
---

# レスポンシブ画像（srcset, sizes, picture）

> 出典: https://ics.media/entry/13324/
> 執筆日: 2016年9月26日
> 最終更新: 2025年5月8日
> 追加日: 2026-01-19

HTML のみで、CSS や JavaScript を使わずにレスポンシブな画像を実現する方法。`srcset`、`sizes`、`picture` 要素を使って、デバイスに応じた最適なサイズの画像を自動配信できます。

## 基本コンセプト

ブラウザが画面サイズやデバイスの解像度に基づいて、最適な画像を自動選択して表示します。

## srcset と sizes 属性

### 基本的な使い方

```html
<img
  srcset="images/small.jpg 320w,
          images/medium.jpg 640w,
          images/large.jpg 1280w"
  sizes="(max-width: 1280px) 100vw, 1280px"
  src="images/large.jpg"
  alt="レスポンシブ画像"
>
```

### srcset の構文

```
srcset="画像URL 幅w, 画像URL 幅w, ..."
```

- **幅の指定**: `w` 単位を使用（`px` ではない）
- **320w**: 画像の実際の幅が 320px
- **640w**: 画像の実際の幅が 640px
- **1280w**: 画像の実際の幅が 1280px

### sizes の構文

```
sizes="(メディアクエリ) 表示幅, デフォルト表示幅"
```

**例:**
```html
sizes="(max-width: 1280px) 100vw, 1280px"
```

- **1280px 以下**: 画面幅の 100%（`100vw`）
- **1280px 超**: 固定で 1280px

### ブラウザの自動選択

ブラウザは以下を考慮して最適な画像を選択：

1. **画面幅**: `sizes` で指定された表示サイズ
2. **デバイスピクセル比**: Retina ディスプレイなどの高解像度対応
3. **ネットワーク状況**: 低速回線では小さい画像を優先（一部ブラウザ）

## picture 要素によるアートディレクション

### 基本的な使い方

```html
<picture>
  <source
    media="(max-width: 520px)"
    srcset="images/cropped.jpg 640w"
    sizes="100vw"
  >
  <source
    srcset="images/medium.jpg 640w,
            images/large.jpg 1280w"
    sizes="(max-width: 1280px) 100vw, 1280px"
  >
  <img src="images/large.jpg" alt="レスポンシブ画像">
</picture>
```

### アートディレクションのユースケース

```html
<!-- モバイル: 縦長にトリミング -->
<!-- デスクトップ: 横長のまま -->
<picture>
  <source
    media="(max-width: 767px)"
    srcset="portrait.jpg"
  >
  <source
    media="(min-width: 768px)"
    srcset="landscape.jpg"
  >
  <img src="landscape.jpg" alt="風景">
</picture>
```

## 実践的なパターン

### 1. シンプルな解像度対応

```html
<img
  srcset="image@1x.jpg 1x,
          image@2x.jpg 2x"
  src="image@1x.jpg"
  alt="画像"
>
```

- **1x**: 通常のディスプレイ
- **2x**: Retina ディスプレイ

### 2. 複数サイズ + 高解像度対応

```html
<img
  srcset="small.jpg 320w,
          small@2x.jpg 640w,
          medium.jpg 640w,
          medium@2x.jpg 1280w,
          large.jpg 1280w,
          large@2x.jpg 2560w"
  sizes="(max-width: 640px) 100vw,
         (max-width: 1280px) 640px,
         1280px"
  src="large.jpg"
  alt="画像"
>
```

### 3. WebP フォーマットのフォールバック

```html
<picture>
  <source
    type="image/webp"
    srcset="image.webp"
  >
  <source
    type="image/jpeg"
    srcset="image.jpg"
  >
  <img src="image.jpg" alt="画像">
</picture>
```

### 4. モバイルとデスクトップで異なるトリミング

```html
<picture>
  <!-- モバイル: 正方形 -->
  <source
    media="(max-width: 767px)"
    srcset="square-small.jpg 320w,
            square-medium.jpg 640w"
    sizes="100vw"
  >
  <!-- デスクトップ: 16:9 -->
  <source
    media="(min-width: 768px)"
    srcset="wide-medium.jpg 640w,
            wide-large.jpg 1280w"
    sizes="(max-width: 1280px) 100vw, 1280px"
  >
  <img src="wide-large.jpg" alt="画像">
</picture>
```

## 高度な機能

### HDR / Wide Color Gamut 対応

```html
<picture>
  <!-- HDR 対応ディスプレイ -->
  <source
    media="(dynamic-range: high)"
    srcset="image-hdr.jpg"
  >
  <!-- Wide Color Gamut 対応 -->
  <source
    media="(color-gamut: p3)"
    srcset="image-p3.jpg"
  >
  <!-- 通常 -->
  <img src="image-srgb.jpg" alt="画像">
</picture>
```

### プリロード

```html
<!-- HTML head 内 -->
<link
  rel="preload"
  as="image"
  href="hero.jpg"
  imagesrcset="hero-small.jpg 320w,
               hero-medium.jpg 640w,
               hero-large.jpg 1280w"
  imagesizes="100vw"
>
```

## パフォーマンス最適化

### loading 属性との併用

```html
<img
  srcset="small.jpg 320w,
          medium.jpg 640w,
          large.jpg 1280w"
  sizes="(max-width: 1280px) 100vw, 1280px"
  src="large.jpg"
  alt="画像"
  loading="lazy"
>
```

### decoding 属性

```html
<img
  srcset="small.jpg 320w,
          medium.jpg 640w"
  sizes="100vw"
  src="medium.jpg"
  alt="画像"
  decoding="async"
>
```

- **async**: 非同期デコード（推奨）
- **sync**: 同期デコード
- **auto**: ブラウザに任せる（デフォルト）

## ブラウザサポート

| ブラウザ | srcset | sizes | picture |
|---------|--------|-------|---------|
| Chrome | 38+ | 38+ | 38+ |
| Firefox | 38+ | 38+ | 38+ |
| Safari | 9+ | 9+ | 9.1+ |
| Edge | 12+ | 12+ | 13+ |
| IE | ❌ | ❌ | ❌ |

**現在の状況**: IE11 のサポートが 2022年6月に終了したため、全モダンブラウザで安心して使用可能。

## よくある間違い

### ❌ px 単位の使用

```html
<!-- ❌ 間違い -->
<img srcset="small.jpg 320px, medium.jpg 640px">

<!-- ✅ 正しい -->
<img srcset="small.jpg 320w, medium.jpg 640w">
```

### ❌ sizes の省略

```html
<!-- ❌ sizes がないと、ブラウザが適切に選択できない -->
<img srcset="small.jpg 320w, medium.jpg 640w">

<!-- ✅ sizes を明示 -->
<img
  srcset="small.jpg 320w, medium.jpg 640w"
  sizes="(max-width: 640px) 100vw, 640px"
>
```

### ❌ picture 内の img の省略

```html
<!-- ❌ img 要素は必須 -->
<picture>
  <source srcset="image.jpg">
</picture>

<!-- ✅ img 要素を含める -->
<picture>
  <source srcset="image.jpg">
  <img src="fallback.jpg" alt="画像">
</picture>
```

## ユースケース

- ヒーローイメージのレスポンシブ配信
- ブログ記事内の画像最適化
- ECサイトの商品画像
- ポートフォリオサイトのギャラリー
- ニュースサイトのサムネイル

## Tips

### 画像生成の自動化

```bash
# ImageMagick で複数サイズを生成
convert original.jpg -resize 320x image-320w.jpg
convert original.jpg -resize 640x image-640w.jpg
convert original.jpg -resize 1280x image-1280w.jpg
```

### CDN での自動リサイズ

```html
<!-- Cloudflare Images の例 -->
<img
  srcset="https://example.com/image.jpg/w=320 320w,
          https://example.com/image.jpg/w=640 640w,
          https://example.com/image.jpg/w=1280 1280w"
  sizes="100vw"
  src="https://example.com/image.jpg"
>
```

## 参考リソース

- [MDN: Responsive images](https://developer.mozilla.org/ja/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [HTML Standard: The picture element](https://html.spec.whatwg.org/multipage/embedded-content.html#the-picture-element)

---
