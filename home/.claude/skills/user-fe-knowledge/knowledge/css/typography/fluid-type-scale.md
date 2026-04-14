---
title: Fluid Type Scale - clamp() によるレスポンシブタイポグラフィ
category: css/typography
tags: [fluid-typography, clamp, responsive, viewport-units, type-scale]
browser_support: すべてのモダンブラウザ（Chrome 79+、Firefox 75+、Safari 13.1+）
created: 2026-01-31
updated: 2026-01-31
source: https://coliss.com/articles/build-websites/operation/css/fluid-type-scale-generator.html
---

# Fluid Type Scale - clamp() によるレスポンシブタイポグラフィ

## 概要

流体タイポグラフィ（Fluid Typography）は、固定値の代わりに **CSS で単一の流体値を定義**し、ビューポートサイズに応じた最適なフォントサイズをレンダリングする手法です。メディアクエリ不要で、より効率的な実装が可能です。

---

## 基本的な実装

### clamp() 関数の構文

```css
font-size: clamp(最小値, 流動値, 最大値);
```

**動作:**
- ビューポートが小さい → 最小値を適用
- ビューポートが中間 → 流動値を計算
- ビューポートが大きい → 最大値を適用

### 基本例

```css
p {
  font-size: clamp(1rem, calc(0.75rem + 1vw), 1.5rem);
}
```

**動作（ルート要素16px時）:**
- 360px ビューポート: 16px（最小値）
- 800px ビューポート: 20px（流動値）
- 1280px ビューポート: 24px（最大値）

---

## 従来の方法との比較

### 従来（メディアクエリ）

```css
p {
  font-size: 1rem;
}

@media (min-width: 768px) {
  p {
    font-size: 1.25rem;
  }
}

@media (min-width: 1024px) {
  p {
    font-size: 1.5rem;
  }
}
```

**問題点:**
- 段階的な変化（ガクッとサイズが変わる）
- 複数のブレークポイント管理が必要
- コードが冗長

### 新しい方法（clamp()）

```css
p {
  font-size: clamp(1rem, 0.75rem + 1vw, 1.5rem);
}
```

**利点:**
- 滑らかな変化
- メディアクエリ不要
- 1行で完結

---

## Size Matters ツール

### 概要

Size Matters は、3ステップで `clamp()` コードを生成するオンラインツールです。

**URL:** [Size Matters](https://www.size-matters.tools/)

### 使い方

#### Step 1: 設定

- **ベースサイズ**: 16px（デフォルト）
- **スケール比**: 1.2（Minor Third）、1.25（Major Third）など
- **最小ビューポート**: 360px
- **最大ビューポート**: 1280px

#### Step 2: 確認

各デバイスでのプレビューを表示：
- モバイル（360px）
- タブレット（768px）
- デスクトップ（1280px）

#### Step 3: エクスポート

CSS、SCSS、JSON など複数形式で出力。

---

## 実装例

### CSS 変数を活用した実装

```css
:root {
  /* ベース設定 */
  --font-size-base: 16px;
  --viewport-min: 360px;
  --viewport-max: 1280px;

  /* タイポグラフィスケール */
  --font-size-xs: clamp(0.75rem, 0.359rem + 1.739vw, 1.75rem);
  --font-size-s: clamp(0.875rem, 0.484rem + 1.739vw, 2rem);
  --font-size-m: clamp(1rem, 0.609rem + 1.739vw, 2.25rem);
  --font-size-l: clamp(1.25rem, 0.859rem + 1.739vw, 2.75rem);
  --font-size-xl: clamp(1.5rem, 1.109rem + 1.739vw, 3.25rem);
  --font-size-2xl: clamp(2rem, 1.609rem + 1.739vw, 4.25rem);

  /* 行高も自動調整 */
  --line-height-xs: 1.4;
  --line-height-m: 1.55;
  --line-height-xl: 1.2;
}
```

### 使用例

```css
body {
  font-size: var(--font-size-m);
  line-height: var(--line-height-m);
}

h1 {
  font-size: var(--font-size-2xl);
  line-height: var(--line-height-xl);
}

h2 {
  font-size: var(--font-size-xl);
  line-height: var(--line-height-xl);
}

h3 {
  font-size: var(--font-size-l);
  line-height: var(--line-height-m);
}

p {
  font-size: var(--font-size-m);
  line-height: var(--line-height-m);
}

small {
  font-size: var(--font-size-xs);
  line-height: var(--line-height-xs);
}
```

---

## 計算式の理解

### clamp() の流動値計算

```css
font-size: clamp(1rem, 0.75rem + 1vw, 1.5rem);
```

**流動値の計算:**
```
0.75rem + 1vw
```

**ビューポート幅 800px の場合:**
```
0.75rem + (800px * 0.01) = 0.75rem + 8px = 12px + 8px = 20px
```

### 計算式の導出

最小値と最大値から流動値を計算する式：

```
流動値 = 最小値 + (最大値 - 最小値) * (100vw - 最小ビューポート) / (最大ビューポート - 最小ビューポート)
```

**例:**
- 最小値: 1rem (16px)
- 最大値: 1.5rem (24px)
- 最小ビューポート: 360px
- 最大ビューポート: 1280px

```
流動値 = 1rem + (1.5rem - 1rem) * (100vw - 360px) / (1280px - 360px)
       = 1rem + 0.5rem * (100vw - 360px) / 920px
       ≈ 0.609rem + 0.543vw
```

---

## スケール比の選択

### タイポグラフィスケール

| スケール名 | 比率 | 用途 |
|-----------|------|------|
| Minor Second | 1.067 | 控えめ |
| Major Second | 1.125 | やや控えめ |
| Minor Third | 1.2 | バランス型 |
| Major Third | 1.25 | 標準的 |
| Perfect Fourth | 1.333 | やや強調 |
| Perfect Fifth | 1.5 | 強調 |
| Golden Ratio | 1.618 | 調和的 |

### 実装例（Major Third: 1.25）

```css
:root {
  --scale: 1.25;

  --font-size-base: 1rem;
  --font-size-1: calc(var(--font-size-base) * var(--scale));      /* 1.25rem */
  --font-size-2: calc(var(--font-size-1) * var(--scale));         /* 1.5625rem */
  --font-size-3: calc(var(--font-size-2) * var(--scale));         /* 1.953rem */
  --font-size-4: calc(var(--font-size-3) * var(--scale));         /* 2.441rem */
}
```

---

## ベストプラクティス

### 1. 最小値と最大値の適切な設定

```css
/* Good: 適度な範囲 */
font-size: clamp(1rem, 0.75rem + 1vw, 1.5rem);

/* Bad: 範囲が広すぎる */
font-size: clamp(0.5rem, 0.5rem + 5vw, 5rem);
```

### 2. 行高の調整

大きなフォントサイズでは行高を小さく、小さなフォントサイズでは行高を大きくします。

```css
h1 {
  font-size: clamp(2rem, 1.609rem + 1.739vw, 4.25rem);
  line-height: 1.2; /* 大きな見出しは行高を小さく */
}

p {
  font-size: clamp(1rem, 0.609rem + 1.739vw, 2.25rem);
  line-height: 1.6; /* 本文は行高を大きく */
}
```

### 3. CSS 変数で一元管理

```css
:root {
  --font-size-h1: clamp(2rem, 1.609rem + 1.739vw, 4.25rem);
  --font-size-h2: clamp(1.5rem, 1.109rem + 1.739vw, 3.25rem);
  --font-size-body: clamp(1rem, 0.609rem + 1.739vw, 2.25rem);
}

h1 { font-size: var(--font-size-h1); }
h2 { font-size: var(--font-size-h2); }
p { font-size: var(--font-size-body); }
```

---

## アクセシビリティへの配慮

### 1. 最小値は16px以上を推奨

```css
/* Good */
p {
  font-size: clamp(1rem, 0.75rem + 1vw, 1.5rem);
  /* 最小値: 16px */
}

/* Bad */
p {
  font-size: clamp(0.75rem, 0.5rem + 1vw, 1.5rem);
  /* 最小値: 12px（小さすぎる） */
}
```

### 2. ユーザーのフォントサイズ設定を尊重

```css
/* rem 単位を使用（ユーザー設定を尊重） */
p {
  font-size: clamp(1rem, 0.75rem + 1vw, 1.5rem);
}

/* px 単位を避ける */
p {
  font-size: clamp(16px, 12px + 1vw, 24px); /* 避ける */
}
```

---

## 完全な実装例

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      /* タイポグラフィスケール */
      --font-size-xs: clamp(0.75rem, 0.659rem + 0.408vw, 0.875rem);
      --font-size-s: clamp(0.875rem, 0.784rem + 0.408vw, 1rem);
      --font-size-m: clamp(1rem, 0.909rem + 0.408vw, 1.125rem);
      --font-size-l: clamp(1.25rem, 1.159rem + 0.408vw, 1.375rem);
      --font-size-xl: clamp(1.5rem, 1.409rem + 0.408vw, 1.625rem);
      --font-size-2xl: clamp(2rem, 1.909rem + 0.408vw, 2.125rem);
      --font-size-3xl: clamp(2.5rem, 2.409rem + 0.408vw, 2.625rem);

      /* 行高 */
      --line-height-tight: 1.2;
      --line-height-normal: 1.5;
      --line-height-relaxed: 1.75;
    }

    body {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: var(--font-size-m);
      line-height: var(--line-height-normal);
      padding: 2rem;
    }

    h1 {
      font-size: var(--font-size-3xl);
      line-height: var(--line-height-tight);
      margin-bottom: 1rem;
    }

    h2 {
      font-size: var(--font-size-2xl);
      line-height: var(--line-height-tight);
      margin-bottom: 0.75rem;
    }

    h3 {
      font-size: var(--font-size-xl);
      line-height: var(--line-height-normal);
      margin-bottom: 0.5rem;
    }

    p {
      font-size: var(--font-size-m);
      line-height: var(--line-height-relaxed);
      margin-bottom: 1rem;
    }

    small {
      font-size: var(--font-size-xs);
      line-height: var(--line-height-normal);
    }
  </style>
</head>
<body>
  <h1>流体タイポグラフィ</h1>
  <h2>ビューポートに応じて滑らかにサイズが変化</h2>
  <h3>メディアクエリ不要</h3>
  <p>
    この段落のフォントサイズは、ビューポート幅に応じて滑らかに変化します。
    ブラウザのウィンドウサイズを変更して確認してください。
  </p>
  <p><small>小さなテキスト</small></p>
</body>
</html>
```

---

## 参考資料

- [Size Matters - Fluid Type Scale Generator](https://www.size-matters.tools/)
- [clamp() - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp)
- [Modern Fluid Typography Using CSS Clamp](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/)
- [Type Scale - A Visual Calculator](https://typescale.com/)

---

## 関連ナレッジ

- [Webフォント最適化](./webfont-optimization-google-fonts.md)
- [レスポンシブデザイン](../../cross-cutting/responsive/README.md)
- [アクセシビリティとタイポグラフィ](../../cross-cutting/accessibility/typography.md)
