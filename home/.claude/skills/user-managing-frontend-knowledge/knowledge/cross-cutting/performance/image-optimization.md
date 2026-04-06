---
title: 画像読み込み高速化テクニック
category: cross-cutting/performance
tags: [performance, images, loading, fetchpriority, srcset, optimization]
created: 2026-02-01
updated: 2026-02-01
---

# 画像読み込み高速化テクニック

> 出典: https://ics.media/entry/230519/
> 執筆日: 2023年5月19日
> 追加日: 2026-02-01

## 概要

画像の読み込み方法を最適化することで、Webページのパフォーマンスを大幅に改善できます。`loading`属性、`fetchpriority`属性、`srcset`属性を適切に使用することで、Core Web Vitals（特にLCP）のスコアを向上させることができます。

## 1. loading 属性による遅延読み込み

### 基本的な使い方

`loading="lazy"` を指定することで、画像が表示領域に近づくまで読み込みを遅延させることができます。

```html
<!-- ファーストビュー外の画像は遅延読み込み -->
<img
  src="below-fold-image.jpg"
  alt="スクロールしないと見えない画像"
  loading="lazy"
>

<!-- ファーストビュー内の画像は即座に読み込み -->
<img
  src="hero-image.jpg"
  alt="ヒーロー画像"
  loading="eager"
>
```

### loading 属性の値

| 値 | 説明 | 使用場面 |
|---|------|----------|
| `lazy` | 表示領域に近づくまで読み込みを遅延 | ファーストビュー外の画像 |
| `eager` | すぐに読み込み（デフォルト） | ファーストビュー内の重要な画像 |

### 実践例: ブログ記事

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>ブログ記事</title>
</head>
<body>
  <!-- ヒーロー画像: すぐに表示されるので loading="eager" -->
  <header>
    <img
      src="hero.jpg"
      alt="記事のヒーロー画像"
      loading="eager"
      width="1200"
      height="630"
    >
  </header>

  <article>
    <p>記事の本文...</p>

    <!-- 記事内の画像: スクロールしないと見えないので loading="lazy" -->
    <figure>
      <img
        src="screenshot-1.jpg"
        alt="スクリーンショット1"
        loading="lazy"
        width="800"
        height="600"
      >
      <figcaption>図1: スクリーンショット</figcaption>
    </figure>

    <p>続きの本文...</p>

    <figure>
      <img
        src="screenshot-2.jpg"
        alt="スクリーンショット2"
        loading="lazy"
        width="800"
        height="600"
      >
      <figcaption>図2: 別のスクリーンショット</figcaption>
    </figure>
  </article>

  <!-- フッター画像も遅延読み込み -->
  <footer>
    <img
      src="footer-logo.png"
      alt="フッターロゴ"
      loading="lazy"
      width="200"
      height="50"
    >
  </footer>
</body>
</html>
```

### 注意点

1. **ファーストビュー内の画像には使わない**
   - LCP（Largest Contentful Paint）が悪化する可能性
   - ユーザーがすぐに見る画像は `loading="eager"` を使用

2. **width と height を必ず指定**
   - CLS（Cumulative Layout Shift）を防ぐ
   - レイアウトシフトが発生しないようにスペースを確保

```html
<!-- ❌ 悪い例: サイズ未指定 -->
<img src="image.jpg" loading="lazy">

<!-- ✅ 良い例: サイズ指定あり -->
<img src="image.jpg" loading="lazy" width="800" height="600">
```

## 2. fetchpriority 属性による優先度制御

### 基本的な使い方

`fetchpriority` 属性を使用することで、画像の読み込み優先度を明示的に制御できます。

```html
<!-- 最優先で読み込み -->
<img
  src="hero-image.jpg"
  alt="ヒーロー画像"
  fetchpriority="high"
  width="1200"
  height="630"
>

<!-- 低優先度で読み込み -->
<img
  src="decorative-image.jpg"
  alt="装飾画像"
  fetchpriority="low"
  loading="lazy"
  width="200"
  height="200"
>
```

### fetchpriority 属性の値

| 値 | 説明 | 使用場面 |
|---|------|----------|
| `high` | 高優先度で読み込み | LCP画像、ヒーロー画像 |
| `low` | 低優先度で読み込み | 装飾画像、アイコン |
| `auto` | ブラウザが自動判断（デフォルト） | 通常の画像 |

### 実践例: ECサイトの商品ページ

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>商品ページ</title>
</head>
<body>
  <main>
    <!-- メイン商品画像: 最優先で読み込み -->
    <section class="product-images">
      <img
        src="product-main.jpg"
        alt="商品メイン画像"
        fetchpriority="high"
        width="800"
        height="800"
      >

      <!-- サムネイル画像: 低優先度 -->
      <div class="thumbnails">
        <img
          src="product-thumb-1.jpg"
          alt="商品画像1"
          fetchpriority="low"
          width="100"
          height="100"
        >
        <img
          src="product-thumb-2.jpg"
          alt="商品画像2"
          fetchpriority="low"
          width="100"
          height="100"
        >
        <img
          src="product-thumb-3.jpg"
          alt="商品画像3"
          fetchpriority="low"
          width="100"
          height="100"
        >
      </div>
    </section>

    <!-- 関連商品画像: 遅延読み込み + 低優先度 -->
    <section class="related-products">
      <h2>関連商品</h2>
      <div class="product-grid">
        <img
          src="related-1.jpg"
          alt="関連商品1"
          loading="lazy"
          fetchpriority="low"
          width="300"
          height="300"
        >
        <img
          src="related-2.jpg"
          alt="関連商品2"
          loading="lazy"
          fetchpriority="low"
          width="300"
          height="300"
        >
      </div>
    </section>
  </main>
</body>
</html>
```

### loading と fetchpriority の組み合わせ

| 画像の種類 | loading | fetchpriority | 理由 |
|-----------|---------|---------------|------|
| LCP画像（ヒーロー画像） | `eager` | `high` | 最優先で読み込み |
| ファーストビュー内の重要な画像 | `eager` | `auto` or `high` | すぐに表示 |
| ファーストビュー外の画像 | `lazy` | `auto` | 必要になるまで遅延 |
| 装飾画像・アイコン | `lazy` | `low` | 最低優先度 |

```html
<!-- パターン1: LCP画像（最優先） -->
<img
  src="hero.jpg"
  alt="ヒーロー画像"
  loading="eager"
  fetchpriority="high"
  width="1200"
  height="630"
>

<!-- パターン2: ファーストビュー外の重要な画像 -->
<img
  src="content-image.jpg"
  alt="コンテンツ画像"
  loading="lazy"
  width="800"
  height="600"
>

<!-- パターン3: 装飾画像（最低優先度） -->
<img
  src="decoration.svg"
  alt=""
  loading="lazy"
  fetchpriority="low"
  width="50"
  height="50"
>
```

## 3. srcset 属性によるレスポンシブ画像

### 基本的な使い方

`srcset` 属性を使用することで、デバイスの画面幅や解像度に応じて最適な画像を配信できます。

```html
<!-- 画面幅に応じた画像の切り替え -->
<img
  src="image-800.jpg"
  srcset="
    image-400.jpg 400w,
    image-800.jpg 800w,
    image-1200.jpg 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt="レスポンシブ画像"
  width="1200"
  height="800"
>
```

### srcset と sizes の説明

**srcset:**
- 複数の画像ソースとその幅を指定
- `w` 記述子で画像の実際の幅を指定

**sizes:**
- 画面幅に応じて画像が表示されるサイズを指定
- メディアクエリで条件を指定

### 実践例: レスポンシブヒーロー画像

```html
<header class="hero">
  <img
    src="hero-800.jpg"
    srcset="
      hero-400.jpg 400w,
      hero-800.jpg 800w,
      hero-1200.jpg 1200w,
      hero-1600.jpg 1600w,
      hero-2400.jpg 2400w
    "
    sizes="100vw"
    alt="ヒーローバナー"
    loading="eager"
    fetchpriority="high"
    width="2400"
    height="1200"
  >
</header>

<style>
  .hero {
    width: 100%;
  }

  .hero img {
    width: 100%;
    height: auto;
    display: block;
  }
</style>
```

### デバイスピクセル比（DPR）による切り替え

Retina ディスプレイなど高解像度ディスプレイに対応する場合:

```html
<img
  src="image-1x.jpg"
  srcset="
    image-1x.jpg 1x,
    image-2x.jpg 2x,
    image-3x.jpg 3x
  "
  alt="高解像度対応画像"
  width="400"
  height="300"
>
```

### picture 要素との組み合わせ

異なるアスペクト比の画像を切り替える場合は `<picture>` 要素を使用:

```html
<picture>
  <!-- モバイル: 縦長画像 -->
  <source
    media="(max-width: 600px)"
    srcset="
      mobile-400.jpg 400w,
      mobile-800.jpg 800w
    "
    sizes="100vw"
  >

  <!-- タブレット: 正方形画像 -->
  <source
    media="(max-width: 1000px)"
    srcset="
      tablet-600.jpg 600w,
      tablet-1200.jpg 1200w
    "
    sizes="100vw"
  >

  <!-- デスクトップ: 横長画像 -->
  <img
    src="desktop-1200.jpg"
    srcset="
      desktop-1200.jpg 1200w,
      desktop-1600.jpg 1600w,
      desktop-2400.jpg 2400w
    "
    sizes="100vw"
    alt="レスポンシブアートディレクション"
    loading="eager"
    fetchpriority="high"
    width="2400"
    height="1200"
  >
</picture>
```

## 4. 総合的な最適化例

### ECサイトのトップページ

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>ECサイト</title>
</head>
<body>
  <!-- ヒーロー画像: 最優先 -->
  <header>
    <picture>
      <source
        media="(max-width: 600px)"
        srcset="
          hero-mobile-400.jpg 400w,
          hero-mobile-800.jpg 800w
        "
        sizes="100vw"
      >
      <img
        src="hero-desktop-1200.jpg"
        srcset="
          hero-desktop-1200.jpg 1200w,
          hero-desktop-1600.jpg 1600w,
          hero-desktop-2400.jpg 2400w
        "
        sizes="100vw"
        alt="セールバナー"
        loading="eager"
        fetchpriority="high"
        width="2400"
        height="1200"
      >
    </picture>
  </header>

  <!-- 特集商品: ファーストビュー内 -->
  <section class="featured-products">
    <h2>特集商品</h2>
    <div class="product-grid">
      <article class="product-card">
        <img
          src="product-1-400.jpg"
          srcset="
            product-1-400.jpg 400w,
            product-1-800.jpg 800w
          "
          sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
          alt="商品1"
          width="800"
          height="800"
        >
      </article>
      <!-- 他の商品... -->
    </div>
  </section>

  <!-- おすすめ商品: ファーストビュー外 -->
  <section class="recommended-products">
    <h2>おすすめ商品</h2>
    <div class="product-grid">
      <article class="product-card">
        <img
          src="product-10-400.jpg"
          srcset="
            product-10-400.jpg 400w,
            product-10-800.jpg 800w
          "
          sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
          alt="商品10"
          loading="lazy"
          fetchpriority="low"
          width="800"
          height="800"
        >
      </article>
      <!-- 他の商品... -->
    </div>
  </section>

  <!-- フッター -->
  <footer>
    <img
      src="footer-logo.svg"
      alt="ロゴ"
      loading="lazy"
      fetchpriority="low"
      width="200"
      height="50"
    >
  </footer>
</body>
</html>
```

## 5. パフォーマンス計測

### Lighthouse で確認

```bash
# Lighthouseでパフォーマンスを計測
npx lighthouse https://example.com --view
```

**チェックポイント:**
- LCP (Largest Contentful Paint)
- CLS (Cumulative Layout Shift)
- Total Blocking Time

### Chrome DevTools で確認

1. DevTools を開く (F12)
2. Network タブを開く
3. 画像の読み込みタイミングを確認
4. Performance タブで LCP を確認

## まとめ

画像読み込みの最適化は、以下の3つの属性を適切に組み合わせることで実現できます:

**loading 属性:**
- `eager`: ファーストビュー内の重要な画像
- `lazy`: ファーストビュー外の画像

**fetchpriority 属性:**
- `high`: LCP画像、ヒーロー画像
- `low`: 装飾画像、アイコン
- `auto`: 通常の画像（デフォルト）

**srcset 属性:**
- 画面幅に応じた画像の切り替え
- 高解像度ディスプレイ対応
- `sizes` 属性と組み合わせて使用

**最適化の原則:**
1. ファーストビュー内の重要な画像は即座に読み込む
2. ファーストビュー外の画像は遅延読み込み
3. 装飾画像は低優先度で読み込む
4. width と height を必ず指定してCLSを防ぐ
5. レスポンシブ画像で適切なサイズを配信

## ブラウザサポート

### loading 属性

- Chrome 77+
- Edge 79+
- Firefox 75+
- Safari 15.4+
- Opera 64+

### fetchpriority 属性

- Chrome 101+
- Edge 101+
- Firefox 未サポート（2024年1月時点）
- Safari 17.2+
- Opera 87+

**注意:** `fetchpriority` は比較的新しい機能のため、サポートされていないブラウザでは無視されます（エラーにはなりません）。

### srcset 属性

- Chrome 34+
- Edge 12+
- Firefox 38+
- Safari 9+
- Opera 21+

**すべての主要ブラウザでサポート済み**

## 関連リソース

- [performance-optimization.md](./performance-optimization.md) - 総合的なパフォーマンス最適化
- [frontend-tuning.md](./frontend-tuning.md) - フロントエンドチューニング
- [LCP最適化ガイド](https://web.dev/optimize-lcp/)

## 出典

- [画像の loading 属性と fetchpriority 属性の使い方 - 表示速度が劇的に改善](https://ics.media/entry/230519/)
