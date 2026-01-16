---
title: Container Query Units（コンテナクエリ単位）
category: css/values
tags: [container-query, units, cqi, cqw, cqh, cqb, cqmin, cqmax, responsive]
browser_support: Chrome 106+, Safari 16+, Firefox 110+
created: 2025-01-16
updated: 2025-01-16
---

# Container Query Units（コンテナクエリ単位）

> 出典:
> - https://azukiazusa.dev/blog/relative-css-units-based-on-container-elements/
> - https://griponminds.jp/blog/how-to-use-container-query-length-units/
> 執筆日: 2023年10月
> 追加日: 2025-01-16

## 概要

**Container Query Units（コンテナクエリ単位）** は、親コンテナのサイズを基準とする相対的なCSS単位。`vw`/`vh`がビューポートを基準とするのに対し、Container Query Unitsは**親要素のサイズを基準**とするため、コンポーネントの再利用性が大幅に向上する。

## 6つの単位

| 単位 | 説明 | 例 |
|------|------|-----|
| `cqw` | コンテナの幅（width）の1% | `1cqw` = コンテナ幅の1% |
| `cqh` | コンテナの高さ（height）の1% | `1cqh` = コンテナ高さの1% |
| `cqi` | コンテナのインラインサイズの1% | 横書き: 幅、縦書き: 高さ |
| `cqb` | コンテナのブロックサイズの1% | 横書き: 高さ、縦書き: 幅 |
| `cqmin` | `cqi`と`cqb`の小さい方の1% | 正方形に近いサイズ調整 |
| `cqmax` | `cqi`と`cqb`の大きい方の1% | 長辺を基準にしたサイズ調整 |

## 基本的な使い方

### 1. コンテナを定義

```css
.container {
  container-type: inline-size;
  /* または size（width/height両方を基準） */
}
```

### 2. 子要素でContainer Query Unitsを使用

```css
.box {
  font-size: 5cqi;  /* コンテナのインラインサイズの5% */
  padding: 2cqi;    /* コンテナのインラインサイズの2% */
  margin: 1cqb;     /* コンテナのブロックサイズの1% */
}
```

### 完全な実装例

```html
<div class="card-container">
  <article class="card">
    <h2>タイトル</h2>
    <p>本文...</p>
  </article>
</div>
```

```css
.card-container {
  container-type: inline-size;
  width: 400px;  /* この幅を基準にcqiが計算される */
}

.card {
  /* コンテナの幅に応じて自動スケール */
  font-size: 4cqi;    /* 400px × 4% = 16px */
  padding: 5cqi;      /* 400px × 5% = 20px */
  border-radius: 1cqi; /* 400px × 1% = 4px */
}
```

コンテナ幅が200pxに変わると：
- `font-size: 8px`（200px × 4%）
- `padding: 10px`（200px × 5%）
- `border-radius: 2px`（200px × 1%）

## 論理プロパティ（cqi / cqb）

### インラインサイズとブロックサイズ

| 書字方向 | inline-size | block-size |
|---------|-------------|-----------|
| 横書き（LTR/RTL） | 幅（width） | 高さ（height） |
| 縦書き | 高さ（height） | 幅（width） |

**cqi/cqb を使う利点**:
- 多言語対応が容易（LTR/RTL自動対応）
- 縦書きレイアウトでも正しく動作
- 将来的な書字方向変更に強い

```css
.container {
  container-type: inline-size;
}

/* 横書き: 幅の5%、縦書き: 高さの5% */
.text {
  font-size: 5cqi;
}

/* 横書き: 高さの10%、縦書き: 幅の10% */
.box {
  padding-block: 10cqb;
}
```

### LTR/RTL対応の例

```css
.card-container {
  container-type: inline-size;
}

.card {
  /* 横書き（英語/日本語）: 左右のpadding
     縦書き: 上下のpadding */
  padding-inline: 5cqi;

  /* 横書き（英語/日本語）: 上下のpadding
     縦書き: 左右のpadding */
  padding-block: 3cqb;
}
```

## 実践的なユースケース

### 1. リキッドレイアウト（流体レイアウト）

**従来のビューポートベース**:
```css
:root {
  --layout-width: 375;
  --fluid-ratio: calc(1 / var(--layout-width) * 100vw);
}

.fluid {
  padding: calc(20 * var(--fluid-ratio));
  font-size: calc(16 * var(--fluid-ratio));
}
```

**Container Query Unitsベース（推奨）**:
```css
.card-container {
  --inline-size: 200;
  --fluid-ratio: calc(1 / var(--inline-size) * 100cqi);
  container-type: inline-size;
}

.card {
  padding: calc(20 * var(--fluid-ratio));
  font-size: calc(16 * var(--fluid-ratio));
}
```

**利点**:
- コンテナ幅に応じて自動スケール
- 複数カラムレイアウトでも各カードが独立して適応
- 配置場所を変えても再計算不要

### 2. レスポンシブフォントサイズ

```css
.text-container {
  container-type: inline-size;
}

.heading {
  /* 最小12px、コンテナ幅の5%、最大32px */
  font-size: clamp(12px, 5cqi, 32px);
}

.body {
  /* 最小14px、コンテナ幅の3%、最大18px */
  font-size: clamp(14px, 3cqi, 18px);
}
```

### 3. アスペクト比を保持しつつ隣接要素の高さを揃える

**問題**: `aspect-ratio`だけではグリッド内で高さがバラバラになる

```css
/* ❌ 高さが揃わない */
.card {
  aspect-ratio: 16 / 9;
}
```

**解決**: `min-block-size` with `cqi`

```css
.card-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  container-type: inline-size;
}

.card-item {
  /* 16:9のアスペクト比を維持 */
  min-block-size: calc(9 / 16 * 50cqi);
}
```

**理由**:
- `50cqi` = グリッド列の幅（コンテナの50%）
- `9 / 16 * 50cqi` = 16:9のアスペクト比に対応する高さ
- コンテンツがオーバーフローしても、隣接要素と高さが揃う

### 4. Masonryライクレイアウト

```css
.masonry-container {
  container-type: inline-size;
}

.masonry {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 2cqi;  /* コンテナ幅に応じた間隔 */
}

.masonry-item {
  aspect-ratio: 1;
  font-size: max(12px, 2cqi);  /* 最小12px保証 */
}

/* 一部のアイテムを大きく */
.masonry-item:nth-child(3n) {
  grid-column: span 2;
  grid-row: span 2;
}
```

**利点**:
- `gap`がコンテナ幅に応じて自動調整
- フォントサイズもアイテムサイズに比例
- レスポンシブ対応が不要

### 5. カード内の要素スケーリング

```css
.card-wrapper {
  container-type: inline-size;
}

.card {
  padding: 5cqi;
  border-radius: 2cqi;
}

.card-image {
  width: 100%;
  height: 40cqi;  /* 常にカード幅の40% */
  object-fit: cover;
}

.card-title {
  font-size: 6cqi;
  margin-block: 3cqi;
}

.card-body {
  font-size: 4cqi;
  line-height: 1.6;
}

.card-button {
  padding: 2cqi 4cqi;
  font-size: 3.5cqi;
  border-radius: 1cqi;
}
```

**特徴**:
- カード全体がコンテナ幅に比例してスケール
- どこに配置しても見た目のバランスが保たれる
- メディアクエリ不要

## cqmin / cqmax の活用

### cqmin: 正方形に近い要素

```css
.container {
  container-type: size;
}

.square-ish {
  /* 短辺を基準にサイズ調整 */
  width: 80cqmin;
  height: 80cqmin;
  font-size: 5cqmin;
}
```

コンテナが `400px × 600px` の場合：
- `80cqmin` = `400px × 80% = 320px`（短辺基準）

### cqmax: 長辺を基準

```css
.container {
  container-type: size;
}

.banner {
  /* 長辺を基準にサイズ調整 */
  font-size: 10cqmax;
  padding: 2cqmax;
}
```

コンテナが `400px × 600px` の場合：
- `10cqmax` = `600px × 10% = 60px`（長辺基準）

## container-type の使い分け

| 値 | 参照する軸 | ユースケース |
|----|----------|-------------|
| `inline-size` | インライン軸のみ | 横スクロール防止、幅ベースのレイアウト |
| `size` | インライン + ブロック | cqh, cqb, cqmin, cqmax を使う場合 |

```css
/* inline-size: cqi, cqw のみ使用可能 */
.container-inline {
  container-type: inline-size;
}

.item {
  font-size: 5cqi;  /* ✅ OK */
  padding: 2cqh;    /* ❌ 効かない */
}

/* size: すべての単位が使用可能 */
.container-full {
  container-type: size;
}

.item {
  font-size: 5cqi;   /* ✅ OK */
  padding: 2cqh;     /* ✅ OK */
  width: 50cqmin;    /* ✅ OK */
}
```

**注意**: `container-type: size` は高さを含むため、子要素の高さに影響を与える可能性がある。

## ビューポート単位との比較

| 単位 | 基準 | 用途 |
|------|------|------|
| `vw` / `vh` | ビューポート | ページ全体のレスポンシブ |
| `cqi` / `cqb` | コンテナ | コンポーネント単位のレスポンシブ |

**ビューポート単位の問題**:
```css
/* ❌ ビューポート基準なので、狭いカラムでも大きい */
.card {
  font-size: 5vw;
}
```

サイドバー（300px幅）でもメインコンテンツ（900px幅）でも同じサイズになる。

**Container Query Unitsの解決**:
```css
.card-wrapper {
  container-type: inline-size;
}

/* ✅ コンテナ幅に応じて自動調整 */
.card {
  font-size: 5cqi;
}
```

サイドバー内では小さく、メインコンテンツ内では大きく表示される。

## 実装時の注意点

### 1. 最小・最大値の設定

```css
/* ❌ 極端に小さい/大きいサイズになる可能性 */
.text {
  font-size: 5cqi;
}

/* ✅ clamp()で範囲を制限 */
.text {
  font-size: clamp(12px, 5cqi, 32px);
}
```

### 2. コンテナの明示的なサイズ指定

```css
/* ❌ コンテナにサイズがないと計算できない */
.container {
  container-type: inline-size;
  /* widthがautoの場合、cqiが効かない可能性 */
}

/* ✅ 明示的にサイズを指定 */
.container {
  container-type: inline-size;
  width: 100%;
  max-width: 800px;
}
```

### 3. パフォーマンス考慮

Container Query Unitsは動的に計算されるため、過度に使用するとパフォーマンスに影響する可能性がある。

```css
/* ❌ すべてのプロパティに使用 */
.item {
  font-size: 3cqi;
  padding: 2cqi;
  margin: 1cqi;
  border-width: 0.5cqi;
  border-radius: 1cqi;
  gap: 1.5cqi;
  /* ... */
}

/* ✅ 主要なプロパティのみに使用 */
.item {
  font-size: 3cqi;
  padding: 2cqi;
  border-radius: 4px;  /* 固定値 */
}
```

### 4. calc() との組み合わせ

```css
.container {
  --base-size: 16;
  container-type: inline-size;
}

.text {
  /* 基準値 × コンテナ比率 */
  font-size: calc(var(--base-size) * 1px * 0.05 * 100cqi / 100);

  /* シンプルな書き方 */
  font-size: clamp(12px, 5cqi, 32px);
}
```

## ブラウザサポート

| ブラウザ | サポート開始 |
|---------|------------|
| Chrome | 106（2022年10月） |
| Safari | 16（2022年9月） |
| Firefox | 110（2023年2月） |
| Edge | 106（2022年10月） |

**フォールバック**:
```css
.text {
  /* フォールバック */
  font-size: 1rem;

  /* Container Query Units */
  font-size: 5cqi;
}

/* または @supports */
@supports (font-size: 1cqi) {
  .text {
    font-size: 5cqi;
  }
}
```

## ベストプラクティス

### 1. デザインシステムとの統合

```css
:root {
  --container-fluid-ratio-sm: 0.03;  /* 3% */
  --container-fluid-ratio-md: 0.04;  /* 4% */
  --container-fluid-ratio-lg: 0.05;  /* 5% */
}

.card-wrapper {
  container-type: inline-size;
}

.card-title {
  font-size: calc(100cqi * var(--container-fluid-ratio-lg));
}

.card-body {
  font-size: calc(100cqi * var(--container-fluid-ratio-md));
}
```

### 2. メディアクエリとの併用

```css
/* ページレベル: メディアクエリ */
@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

/* コンポーネントレベル: Container Query Units */
.card-wrapper {
  container-type: inline-size;
}

.card {
  padding: 5cqi;
  font-size: clamp(14px, 4cqi, 20px);
}
```

### 3. アクセシビリティ配慮

```css
.text {
  /* 最小フォントサイズを保証 */
  font-size: max(16px, 4cqi);
}

/* ユーザーのフォント設定を尊重 */
@media (prefers-reduced-motion: reduce) {
  .animated-text {
    font-size: 1rem;  /* 固定値に戻す */
  }
}
```

## 参考リソース

- [MDN: CSS Container Queries](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_container_queries)
- [Can I use: CSS Container Query Units](https://caniuse.com/css-container-query-units)

---
