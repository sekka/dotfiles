---
title: レスポンシブコーディング手法（TAKLOG方式）
category: meta
tags: [responsive, container-query, clamp, viewport, best-practices, 2025]
browser_support: モダンブラウザ
created: 2026-01-19
updated: 2026-01-19
---

# レスポンシブコーディング手法（TAKLOG方式）

> 出典: https://www.tak-dcxi.com/article/my-blogs-responsive-coding
> 執筆日: 2025年
> 追加日: 2026-01-19

TAKLOGで採用されている5つの核となるレスポンシブ対応戦略。コンテナクエリ、clamp()関数、CSS変数を組み合わせた効率的な実装方法です。

## 5つの核となる戦略

1. **コンテナクエリの優先使用** - ウィンドウサイズではなく親要素のサイズを基準に
2. **clamp()関数によるフォントサイズ指定** - 画面幅に応じた自動調整
3. **em単位での余白設定** - clamp化されたfont-sizeを基準に統一
4. **375px未満のビューポート固定** - 極小端末対応
5. **RespImageLintツール活用** - 画像のsrcset・sizes属性最適化

## 1. コンテナクエリの優先使用

### 従来のメディアクエリ

```css
/* ❌ ビューポート幅で判定 */
@media (width >= 640px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

**問題点**: カードの幅ではなく、ビューポート幅で判定される

### コンテナクエリ

```css
/* ✅ 親要素の幅で判定 */
.card-container {
  container-type: inline-size;
}

@container (inline-size >= 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

**利点**: カードの実際の幅に基づいて判定

### 実装例

```html
<div class="card-container">
  <article class="card">
    <img src="thumbnail.jpg" alt="">
    <div class="card-content">
      <h2>タイトル</h2>
      <p>説明文...</p>
    </div>
  </article>
</div>
```

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* 小さいカード：縦並び */
.card {
  display: flex;
  flex-direction: column;
}

/* 大きいカード：横並び */
@container card (inline-size >= 400px) {
  .card {
    flex-direction: row;
    gap: 1rem;
  }

  .card img {
    width: 200px;
    height: auto;
  }
}
```

## 2. clamp()関数によるフォントサイズ指定

### CSS変数を活用したclamp()計算システム

```css
:root {
  --clamp-viewport-min: 375;
  --clamp-viewport-max: 1280;
}

/* 傾き（slope）の計算 */
:root {
  --clamp-slope: calc(
    (var(--clamp-max) - var(--clamp-min)) /
    (var(--clamp-viewport-max) - var(--clamp-viewport-min))
  );
}

/* clamp()関数の自動生成 */
:root {
  --font-size: clamp(
    calc(var(--clamp-min) * 1px),
    calc(
      (var(--clamp-min) * 1px) +
      (100vi - (var(--clamp-viewport-min) * 1px)) *
      var(--clamp-slope)
    ),
    calc(var(--clamp-max) * 1px)
  );
}
```

### 実装例

```css
/* タイトル要素 */
h1 {
  --clamp-min: 20;
  --clamp-max: 24;
  font-size: var(--font-size);
}

/* 本文 */
p {
  --clamp-min: 14;
  --clamp-max: 16;
  font-size: var(--font-size);
}
```

**ポイント**: `--clamp-min`と`--clamp-max`を指定するだけで、画面幅に応じた滑らかなフォントサイズ調整が機能します。

### clamp()の動作

```css
font-size: clamp(14px, 2vi + 12px, 16px);
/*             ^最小  ^中間値      ^最大 */
```

- 375px未満: 14px（最小値）
- 375px〜1280px: 滑らかに拡大
- 1280px以上: 16px（最大値）

## 3. em単位での余白設定

```css
h1 {
  --clamp-min: 20;
  --clamp-max: 24;
  font-size: var(--font-size);
  margin-block-end: 0.5em; /* font-sizeに連動 */
}

.section {
  --clamp-min: 16;
  --clamp-max: 20;
  font-size: var(--font-size);
  padding-block: 2em; /* font-sizeに連動 */
}
```

**利点**: フォントサイズが変わると余白も自動的に調整されます。

## 4. 375px未満のビューポート固定

### JavaScript実装

```javascript
const minWidth = 375;

const adjustViewport = () => {
  const viewportWidth = window.innerWidth;

  if (viewportWidth < minWidth) {
    // ビューポートを固定
    document.body.style.width = `${minWidth}px`;
    document.body.style.overflowX = 'auto';
  } else {
    // 通常表示
    document.body.style.width = '';
    document.body.style.overflowX = '';
  }
};

// debounce関数
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// リサイズ時に実行
window.addEventListener('resize', debounce(adjustViewport, 250));

// 初期実行
adjustViewport();
```

**目的**: 極端に狭い画面（360px未満など）でのレイアウト崩れを防ぐ

## 5. RespImageLintツール活用

画像の`srcset`と`sizes`属性を最適化します。

### 基本的な実装

```html
<img
  src="image-800.jpg"
  srcset="
    image-400.jpg 400w,
    image-800.jpg 800w,
    image-1200.jpg 1200w
  "
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 1024px) 50vw,
    33vw
  "
  alt="説明文"
>
```

### RespImageLintの使用

```bash
npx respImageLint path/to/images
```

最適な`srcset`と`sizes`属性を提案してくれます。

## 実装の注意点

### 1. 詳細度が0

CSS変数は詳細度が0のため、リセットCSSの`inherit`で上書きされる可能性があります。

```css
/* リセットCSS */
* {
  font-size: inherit; /* CSS変数を上書き */
}

/* 対策：!importantを使用 */
h1 {
  font-size: var(--font-size) !important;
}
```

### 2. コンテナクエリの制限

```css
/* ❌ 基準要素自体には適用不可 */
.card {
  container-type: inline-size;
  /* この要素自体にはコンテナクエリを適用できない */
}

/* ✅ 子要素に適用 */
.card-inner {
  /* コンテナクエリ適用可能 */
}
```

余分な`div`要素が必要になる場合があります。

### 3. デザイン分業時の調整

デザイナーとの細かいすり合わせが必要です。

- フォントサイズの最小値・最大値
- ビューポート範囲の設定
- 余白の比率

## コンテナクエリ単位

```css
/* コンテナの幅に基づく単位 */
.card {
  padding: 2cqi; /* Container Query Inline */
}

/* コンテナの高さに基づく単位 */
.card {
  min-height: 30cqb; /* Container Query Block */
}
```

| 単位 | 説明 |
|------|------|
| `cqi` | コンテナのインライン方向の1% |
| `cqb` | コンテナのブロック方向の1% |
| `cqw` | コンテナ幅の1% |
| `cqh` | コンテナ高さの1% |
| `cqmin` | `cqi`と`cqb`の小さい方 |
| `cqmax` | `cqi`と`cqb`の大きい方 |

## 完全な実装例

```css
:root {
  /* グローバル設定 */
  --clamp-viewport-min: 375;
  --clamp-viewport-max: 1280;

  /* 傾き計算 */
  --clamp-slope: calc(
    (var(--clamp-max) - var(--clamp-min)) /
    (var(--clamp-viewport-max) - var(--clamp-viewport-min))
  );

  /* clamp関数 */
  --font-size: clamp(
    calc(var(--clamp-min) * 1px),
    calc(
      (var(--clamp-min) * 1px) +
      (100vi - (var(--clamp-viewport-min) * 1px)) *
      var(--clamp-slope)
    ),
    calc(var(--clamp-max) * 1px)
  );
}

/* コンテナクエリの設定 */
.article-container {
  container-type: inline-size;
  container-name: article;
}

/* 見出し */
h1 {
  --clamp-min: 24;
  --clamp-max: 32;
  font-size: var(--font-size);
  margin-block-end: 0.5em;
}

/* 本文 */
p {
  --clamp-min: 14;
  --clamp-max: 16;
  font-size: var(--font-size);
  margin-block-end: 1em;
  line-height: 1.7;
}

/* コンテナクエリでレイアウト変更 */
@container article (inline-size >= 640px) {
  .article-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }
}
```

## ユースケース

この手法が適している場面：

- モバイルとデスクトップ間でサイズ比率を統一したい場合
- デザイン・実装を単一担当する案件
- コンポーネント単位で独立したレスポンシブ対応が必要な場合

## ブラウザ対応

| 機能 | Chrome | Firefox | Safari |
|------|--------|---------|--------|
| コンテナクエリ | 105+ | 110+ | 16+ |
| `clamp()` | 79+ | 75+ | 13.1+ |
| `vi`単位 | 108+ | 101+ | 15.4+ |
| コンテナクエリ単位 | 105+ | 110+ | 16+ |

## 関連ナレッジ

- [clamp()関数](../css/values/clamp.md)
- [Container Queries](../css/layout/container-query.md)
- [時代遅れのCSS技術](../css/outdated-techniques.md)
- [CSS変数の活用](../css/values/custom-properties.md)

## 参考リンク

- [MDN: CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)
- [MDN: clamp()](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp)
- [RespImageLint](https://ausi.github.io/respimagelint/)
- [Container Query Units](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries#container_query_length_units)
