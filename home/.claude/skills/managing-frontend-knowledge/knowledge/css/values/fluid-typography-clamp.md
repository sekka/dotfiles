---
title: clamp() によるフルイドタイポグラフィ
category: css/values
tags: [clamp, fluid-typography, viewport-units, responsive, 2025]
browser_support: Chrome 79+, Safari 13.1+, Firefox 75+
created: 2026-01-19
updated: 2026-01-19
---

# clamp() によるフルイドタイポグラフィ

> 出典: https://css-notes.com/layout/fluid-typography
> 執筆日: 2025年12月頃
> 追加日: 2026-01-19

`clamp()` 関数を使用してビューポート範囲全体でフォントサイズを滑らかにスケーリングする手法。メディアクエリを使った段階的なサイズ変更ではなく、連続的なトランジションを実現します。

## 基本概念

**フルイドタイポグラフィ**: ブレークポイントでの急激なサイズ変更ではなく、ビューポート幅に応じてフォントサイズが滑らかに変化します。

### 従来のアプローチ（メディアクエリ）

```css
/* ❌ 段階的な変化 */
h1 {
  font-size: 2rem;
}

@media (min-width: 768px) {
  h1 {
    font-size: 3rem;
  }
}

@media (min-width: 1024px) {
  h1 {
    font-size: 4rem;
  }
}
```

### フルイドアプローチ（clamp()）

```css
/* ✅ 滑らかな変化 */
h1 {
  font-size: clamp(2rem, 8vw, 4rem);
}
```

## clamp() 関数の構文

```css
font-size: clamp(最小値, 推奨値, 最大値);
```

- **最小値**: フォントサイズの下限
- **推奨値**: ビューポート単位（`vw`）を含む式で、スケーリング効果を生成
- **最大値**: フォントサイズの上限

## 実践例

### シンプルな実装

```css
h1 {
  font-size: clamp(2rem, 8vw, 4rem);
}
```

**動作**:
- ビューポート幅 400px 以下: `2rem` （最小値）
- ビューポート幅 400px〜800px: `8vw` （滑らかにスケーリング）
- ビューポート幅 800px 以上: `4rem` （最大値）

### ビューポート境界の計算

#### 最小値が適用される境界

```
ビューポート幅 = 最小値 ÷ vw パーセンテージ
```

例: `2rem ÷ 8vw = 2 ÷ 0.08 = 25em = 400px`

#### 最大値が適用される境界

```
ビューポート幅 = 最大値 ÷ vw パーセンテージ
```

例: `4rem ÷ 8vw = 4 ÷ 0.08 = 50em = 800px`

## オンライン計算ツールの活用

手動計算よりも、**Min-Max-Value Interpolation** のような無料オンライン計算ツールの使用を推奨します。

### おすすめツール

- [Min-Max-Value Interpolation Calculator](https://min-max-calculator.9elements.com/)
- [Fluid Type Scale Calculator](https://www.fluid-type-scale.com/)
- [Utopia Fluid Calculator](https://utopia.fyi/type/calculator/)

### ツールの使い方

1. 希望する最小ビューポート幅と最小フォントサイズを入力（例: 400px, 2rem）
2. 希望する最大ビューポート幅と最大フォントサイズを入力（例: 800px, 4rem）
3. 自動的に `clamp()` 式を生成

## デザインシステムへの統合

### ベースフルイドサイズの定義

```css
:root {
  /* ベースフルイドサイズ */
  --fz--base: clamp(1rem, 0.5rem + 1vw, 1.5rem);

  /* 派生サイズ（比例計算） */
  --fz--sm: calc(var(--fz--base) * 0.875);
  --fz--lg: calc(var(--fz--base) * 1.25);
  --fz--xl: calc(var(--fz--base) * 1.5);
  --fz--2xl: calc(var(--fz--base) * 2);
}

body {
  font-size: var(--fz--base);
}

h1 { font-size: var(--fz--2xl); }
h2 { font-size: var(--fz--xl); }
h3 { font-size: var(--fz--lg); }
small { font-size: var(--fz--sm); }
```

**利点**: すべてのフォントサイズがビューポート全体で一様に適応します。

## 高度な実装パターン

### パターン1: 線形補間

```css
/* 320px〜1200px 間で 16px〜24px にスケーリング */
.fluid-text {
  font-size: clamp(1rem, 0.909rem + 0.909vw, 1.5rem);
}
```

### パターン2: 複数のブレークポイント

異なる範囲で異なるスケーリング率を使用する場合、`min()` や `max()` と組み合わせます：

```css
.complex-fluid {
  font-size: clamp(
    1rem,
    min(2vw, 1rem + 1.5vw),
    3rem
  );
}
```

### パターン3: スペーシングへの応用

```css
:root {
  /* フルイドスペーシング */
  --space--xs: clamp(0.5rem, 0.25rem + 0.5vw, 1rem);
  --space--sm: clamp(1rem, 0.5rem + 1vw, 2rem);
  --space--md: clamp(2rem, 1rem + 2vw, 4rem);
  --space--lg: clamp(4rem, 2rem + 4vw, 8rem);
}

section {
  padding-block: var(--space--lg);
  gap: var(--space--md);
}
```

## 注意点と制限

### 1. `:root` での使用時の注意

```css
/* ❌ ブラウザのフォントサイズ設定を無視する可能性 */
:root {
  font-size: clamp(14px, 2vw, 20px);
}

/* ✅ rem を含めてユーザー設定を尊重 */
:root {
  font-size: clamp(0.875rem, 0.875rem + 0.5vw, 1.25rem);
}
```

### 2. アクセシビリティ考慮

```css
/* ユーザーのズーム設定を尊重 */
body {
  font-size: clamp(
    1rem,          /* 最小値は rem 単位 */
    1rem + 0.5vw,  /* rem を含む */
    1.5rem         /* 最大値も rem 単位 */
  );
}
```

**重要**: `px` だけでなく `rem` を使用することで、ブラウザのフォントサイズ設定が反映されます。

### 3. 極端なビューポートへの対応

```css
/* 非常に小さい画面や大きい画面での制限 */
h1 {
  font-size: clamp(
    1.5rem,        /* スマートフォンでも読みやすい */
    2vw + 1rem,    /* 中間でスケーリング */
    4rem           /* 大画面でも過度に大きくならない */
  );
}
```

## 実用例

### ブログ記事のタイポグラフィ

```css
article {
  --fluid-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);

  font-size: var(--fluid-base);
  line-height: 1.6;
}

article h1 {
  font-size: clamp(2rem, 1.5rem + 2.5vw, 3.5rem);
  line-height: 1.2;
  margin-block: clamp(1rem, 0.5rem + 2vw, 3rem);
}

article h2 {
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem);
  margin-block: clamp(0.75rem, 0.5rem + 1vw, 2rem);
}

article p {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.5vw, 1.25rem);
}
```

### ヒーローセクション

```css
.hero {
  padding-block: clamp(3rem, 5vw, 8rem);
}

.hero__title {
  font-size: clamp(2.5rem, 5vw, 6rem);
  letter-spacing: -0.02em;
}

.hero__subtitle {
  font-size: clamp(1rem, 2vw, 1.5rem);
  margin-top: clamp(1rem, 2vw, 2rem);
}
```

### カードコンポーネント

```css
.card {
  padding: clamp(1rem, 2vw, 2rem);
  border-radius: clamp(0.5rem, 1vw, 1rem);
}

.card__title {
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  margin-bottom: clamp(0.5rem, 1vw, 1rem);
}

.card__text {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
}
```

## ブラウザサポート

| ブラウザ | バージョン | 備考 |
|---------|----------|------|
| Chrome | 79+ (2019年12月) | ✅ 完全サポート |
| Safari | 13.1+ (2020年3月) | ✅ 完全サポート |
| Firefox | 75+ (2020年4月) | ✅ 完全サポート |
| Edge | 79+ (2020年1月) | ✅ Chromiumベース |

**現在**: 全モダンブラウザで安心して使用可能。

### フォールバック（レガシーブラウザ対応）

```css
.heading {
  /* フォールバック: 固定サイズ */
  font-size: 2rem;

  /* モダンブラウザ: フルイド */
  font-size: clamp(1.5rem, 2vw + 1rem, 3rem);
}
```

## 比較: clamp() vs メディアクエリ

| 特徴 | clamp() | メディアクエリ |
|------|---------|---------------|
| スケーリング | 連続的 | 段階的 |
| コード量 | 1行 | 複数行 |
| ブレークポイント | 不要 | 必要 |
| 柔軟性 | 高い | 中程度 |
| 保守性 | 良好 | 複雑化しやすい |

## ユースケース

- ランディングページのヒーロータイトル
- ブログ記事の本文タイポグラフィ
- レスポンシブなカードコンポーネント
- ナビゲーションメニューのフォントサイズ
- セクション間のスペーシング

## 参考リソース

- [MDN: clamp()](https://developer.mozilla.org/ja/docs/Web/CSS/clamp)
- [CSS Tricks: Linearly Scale font-size with CSS clamp()](https://css-tricks.com/linearly-scale-font-size-with-css-clamp-based-on-the-viewport/)
- [Utopia: Fluid Responsive Design](https://utopia.fyi/)
- [Modern Fluid Typography Using CSS Clamp](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/)

## 関連ナレッジ

- [Fluid Type Scale](../typography/fluid-type-scale.md) - Size Matters ツールを使った詳細な実装
- [レスポンシブデザイン](../../cross-cutting/responsive/README.md)

---
