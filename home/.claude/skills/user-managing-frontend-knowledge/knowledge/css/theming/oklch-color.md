---
title: OKLCH カラー - 知覚的均一性を持つ色空間
category: css/theming
tags: [oklch, color, oklab, hue, lightness, chroma, gradients, accessibility]
browser_support: すべてのモダンブラウザ（Safari 15.4+、Chrome 111+、Firefox 113+）
created: 2026-01-31
updated: 2026-01-31
source: https://coliss.com/articles/build-websites/operation/css/about-oklch-color.html
---

# OKLCH カラー - 知覚的均一性を持つ色空間

## 概要

OKLCH は、**明度（Lightness）、彩度（Chroma）、色相（Hue）** の3つの値で構成される色モデルです。知覚的に均一になるように設計されており、従来のHSLやRGBよりも直感的で一貫性のある色管理が可能です。

---

## 基礎構造

### OKLCH の3要素

```css
color: oklch(L C H);
```

- **L (Lightness)**: 明度（0% = 黒、100% = 白）
- **C (Chroma)**: 彩度（0 = 無彩色、0.4 = 高彩度）
- **H (Hue)**: 色相（0-360度）

### 基本例

```css
.blue {
  color: oklch(50% 0.2 250);
  /* 明度50%、彩度0.2、色相250度（青） */
}

.red {
  color: oklch(60% 0.25 30);
  /* 明度60%、彩度0.25、色相30度（赤） */
}

.green {
  color: oklch(55% 0.18 150);
  /* 明度55%、彩度0.18、色相150度（緑） */
}
```

---

## 知覚的均一性の利点

### 問題点（HSL の場合）

従来の HSL では、同じ明度値（例: L=50%）でも、色によって見た目の明るさが大きく異なります。

```css
/* HSL: 同じ明度50%でも見た目が異なる */
.yellow { color: hsl(60, 100%, 50%); }  /* 明るく見える */
.blue { color: hsl(240, 100%, 50%); }    /* 暗く見える */
```

### 解決策（OKLCH の場合）

OKLCH では、同じ明度値を使用すれば、**異なる色でも見た目の明るさが統一**されます。

```css
/* OKLCH: 同じ明度60%で見た目が統一される */
.yellow { color: oklch(60% 0.2 100); }
.blue { color: oklch(60% 0.2 250); }
.red { color: oklch(60% 0.2 30); }
```

**効果:**
- 視覚的に一貫した色セット
- アクセシビリティの向上
- デザインシステムでの色管理が容易

---

## トーンの統一方法

### 単色のシェード作成

明度値のみを調整することで、色相や彩度を変えずにトーンを生成できます。

```css
:root {
  --blue-100: oklch(90% 0.1 250);
  --blue-200: oklch(80% 0.12 250);
  --blue-300: oklch(70% 0.14 250);
  --blue-400: oklch(60% 0.16 250);
  --blue-500: oklch(50% 0.18 250);
  --blue-600: oklch(40% 0.16 250);
  --blue-700: oklch(30% 0.14 250);
  --blue-800: oklch(20% 0.12 250);
  --blue-900: oklch(10% 0.1 250);
}
```

**特徴:**
- 色相（250度）が一貫
- 彩度も段階的に調整
- 視覚的に均一なグラデーション

### HSL との比較

**HSL（問題あり）:**

```css
:root {
  --blue-100: hsl(240, 100%, 95%);
  --blue-500: hsl(240, 100%, 50%);
  --blue-900: hsl(240, 100%, 10%);
}
```

**問題点:**
- 明度50%の青が他の色より暗く見える
- 一貫性のない視覚的明るさ

**OKLCH（解決）:**

```css
:root {
  --blue-100: oklch(95% 0.05 250);
  --blue-500: oklch(50% 0.18 250);
  --blue-900: oklch(10% 0.1 250);
}
```

**利点:**
- 視覚的に均一な明るさ
- 色相が一貫

---

## グラデーション改善

### 問題点（RGB グラデーション）

RGB ベースのグラデーションでは、中間色が「汚れた」灰色になることがあります。

```css
/* RGB: 中間が灰色になる */
.gradient-rgb {
  background: linear-gradient(to right, #ff0000, #0000ff);
  /* 赤 → 灰色 → 青 */
}
```

### 解決策（OKLCH グラデーション）

OKLCH は**明度・彩度・色相に基づいて計算**されるため、視覚的に優れたグラデーションが可能です。

```css
/* OKLCH: 滑らかなグラデーション */
.gradient-oklch {
  background: linear-gradient(
    to right,
    oklch(60% 0.25 30),   /* 赤 */
    oklch(60% 0.2 250)    /* 青 */
  );
}
```

### 注意点: 予期せぬ色相の迂回

色相環を長い方向に回ってしまう場合、`longer hue` や OKLab を使用します。

```css
/* OKLab を使用（推奨） */
.gradient-oklab {
  background: linear-gradient(
    in oklab,
    oklch(60% 0.25 30),
    oklch(60% 0.2 250)
  );
}
```

---

## 実装とブラウザサポート

### ブラウザサポート

| ブラウザ | サポート状況 |
|---------|------------|
| Chrome | 111+ |
| Firefox | 113+ |
| Safari | 15.4+ |
| Edge | 111+ |

**結論:** すべてのモダンブラウザで広くサポートされています。

### フォールバック

古いブラウザ対応には `@supports` ルールを使用します。

```css
.element {
  /* フォールバック（古いブラウザ） */
  background: #3b82f6;

  /* モダンブラウザ */
  @supports (color: oklch(0% 0 0)) {
    background: oklch(60% 0.2 250);
  }
}
```

または、16進数カラーコードを併記：

```css
.element {
  background: #3b82f6; /* フォールバック */
  background: oklch(60% 0.2 250); /* モダンブラウザ */
}
```

---

## 実用例

### カラーパレット生成

```css
:root {
  /* プライマリカラー（青） */
  --primary-50: oklch(95% 0.05 250);
  --primary-100: oklch(90% 0.1 250);
  --primary-200: oklch(80% 0.12 250);
  --primary-300: oklch(70% 0.14 250);
  --primary-400: oklch(60% 0.16 250);
  --primary-500: oklch(50% 0.18 250);
  --primary-600: oklch(40% 0.16 250);
  --primary-700: oklch(30% 0.14 250);
  --primary-800: oklch(20% 0.12 250);
  --primary-900: oklch(10% 0.1 250);

  /* セカンダリカラー（オレンジ） */
  --secondary-50: oklch(95% 0.05 50);
  --secondary-500: oklch(50% 0.18 50);
  --secondary-900: oklch(10% 0.1 50);
}
```

### アクセシブルなコントラスト

```css
.button {
  /* 背景色 */
  background: oklch(50% 0.18 250);

  /* 自動的に適切なコントラストの文字色 */
  color: oklch(95% 0.05 250);
  /* コントラスト比が一定以上に保たれる */
}
```

### ダークモード対応

```css
:root {
  --bg-color: oklch(98% 0.02 250);
  --text-color: oklch(20% 0.05 250);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: oklch(15% 0.05 250);
    --text-color: oklch(90% 0.05 250);
  }
}
```

---

## OKLab との使い分け

### OKLab とは

OKLCH の基盤となる色空間で、**L（明度）、a（緑-赤軸）、b（青-黄軸）** で構成されます。

### 使い分けの指針

| ユースケース | 推奨 | 理由 |
|-------------|------|------|
| 単色のシェード | OKLCH | 色相・彩度が直感的 |
| グラデーション | OKLab | 予期せぬ色相の迂回を回避 |
| アニメーション | OKLCH | 色相の回転が明確 |

### 実装例

```css
/* OKLCH: 単色のシェード */
.shades {
  --shade-1: oklch(90% 0.1 250);
  --shade-2: oklch(50% 0.18 250);
  --shade-3: oklch(10% 0.1 250);
}

/* OKLab: グラデーション */
.gradient {
  background: linear-gradient(
    in oklab,
    oklch(60% 0.25 30),
    oklch(60% 0.2 250)
  );
}
```

---

## よくある質問

### Q1: OKLCH と OKLab の違いは？

- **OKLCH**: 円筒座標系（明度、彩度、色相）
- **OKLab**: 直交座標系（明度、a軸、b軸）

OKLCH の方が人間にとって直感的です。

### Q2: 彩度の最大値は？

彩度の最大値は色相によって異なりますが、一般的に **0.4** が高彩度の目安です。

### Q3: 古いブラウザでの表示は？

`@supports` や16進数フォールバックを使用することで、古いブラウザでも基本的な色が表示されます。

### Q4: パフォーマンスへの影響は？

OKLCH はブラウザネイティブの実装なので、パフォーマンスへの影響はありません。

---

## ツール

### カラーピッカー

- [OKLCH Color Picker](https://oklch.com/)
- [Evil Martians OKLCH Picker](https://oklch.evilmartians.io/)

### カラーパレット生成

- [Huetone](https://huetone.ardov.me/)
- [Palettte App](https://palettte.app/)

---

## 参考資料

- [OKLCH in CSS - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch)
- [A perceptual color space for image processing](https://bottosson.github.io/posts/oklab/)
- [OKLCH Color Picker](https://oklch.com/)

---

## 関連ナレッジ

- [light-dark() 関数](./light-dark.md)
- [CSS カラーシステム](./color-system.md)
- [アクセシビリティとコントラスト](../../cross-cutting/accessibility/color-contrast.md)
- [ダークモード実装](./dark-mode.md)
