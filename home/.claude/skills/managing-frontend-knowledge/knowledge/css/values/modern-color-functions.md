---
title: モダンCSSカラー関数
category: css/values
tags: [color, hsl, hwb, lab, lch, oklch, color-space, design-system]
browser_support: 部分的対応（関数により異なる）
created: 2025-01-16
updated: 2025-01-16
---

# モダンCSSカラー関数

> 出典: https://zenn.dev/takanorip/articles/b2f3261fa66bad
> 執筆日: 2022年1月31日（2022年4月22日更新）
> 追加日: 2025-01-16

CSS Color Module Level 4 で導入された新しいカラー関数群。

## 色空間の種類

### sRGB色空間

従来からある標準的な色空間。

#### rgb() 関数

```css
/* 従来の記法 */
.old {
  color: rgb(255, 0, 0);
  background: rgba(0, 128, 255, 0.5);
}

/* モダンな記法（スペース区切り） */
.modern {
  color: rgb(255 0 0);
  background: rgb(0 128 255 / 0.5); /* アルファ値はスラッシュで区切る */
}
```

#### 16進数表記

```css
.hex {
  color: #ff0000; /* 赤 */
  background: #0080ff80; /* 半透明の青（8桁表記でアルファ値指定） */
}
```

### HSL色空間

> **Hue（色相）、Saturation（彩度）、Lightness（明度）**

直感的な色の調整が可能。デザインシステムで統一感のあるカラーパレットを作成するのに有効。

#### hsl() 関数

```css
.hsl-example {
  /* 色相180度（シアン）、彩度100%、明度50% */
  color: hsl(180 100% 50%);

  /* アルファ値付き */
  background: hsl(180 100% 50% / 0.5);
}
```

#### デザインシステムでの活用

CSS変数と組み合わせて、色相を固定しながら明度を変化させることで統一感のあるパレットを作成。

```css
:root {
  --primary-hue: 210; /* ブルー系 */
  --primary-saturation: 80%;
}

.color-scale {
  /* 明度を変えて色のスケールを作成 */
  --color-50: hsl(var(--primary-hue) var(--primary-saturation) 95%);
  --color-100: hsl(var(--primary-hue) var(--primary-saturation) 90%);
  --color-200: hsl(var(--primary-hue) var(--primary-saturation) 80%);
  --color-300: hsl(var(--primary-hue) var(--primary-saturation) 70%);
  --color-400: hsl(var(--primary-hue) var(--primary-saturation) 60%);
  --color-500: hsl(var(--primary-hue) var(--primary-saturation) 50%);
  --color-600: hsl(var(--primary-hue) var(--primary-saturation) 40%);
  --color-700: hsl(var(--primary-hue) var(--primary-saturation) 30%);
  --color-800: hsl(var(--primary-hue) var(--primary-saturation) 20%);
  --color-900: hsl(var(--primary-hue) var(--primary-saturation) 10%);
}
```

#### ダイナミックな色調整

```css
.button {
  --base-hue: 200;
  background: hsl(var(--base-hue) 70% 50%);
}

.button:hover {
  /* 明度を下げて暗くする */
  background: hsl(var(--base-hue) 70% 40%);
}

.button:active {
  /* さらに暗く */
  background: hsl(var(--base-hue) 70% 30%);
}
```

### HWB色空間

> **Hue（色相）、Whiteness（白の量）、Blackness（黒の量）**

HSLより直感的なカラーピッカーとして機能。

#### hwb() 関数

```css
.hwb-example {
  /* 色相180度、白0%、黒0% = 純粋なシアン */
  color: hwb(180 0% 0%);

  /* 色相180度、白50%、黒0% = 明るいシアン */
  background: hwb(180 50% 0%);

  /* 色相180度、白0%、黒50% = 暗いシアン */
  border-color: hwb(180 0% 50%);
}
```

#### HSLとの比較

```css
/* 同じ色を表現 */
.hsl-version {
  color: hsl(180 100% 50%); /* 純粋なシアン */
}

.hwb-version {
  color: hwb(180 0% 0%); /* 純粋なシアン */
}

/* 明るくする場合 */
.hsl-lighter {
  color: hsl(180 100% 75%); /* 明度を上げる */
}

.hwb-lighter {
  color: hwb(180 50% 0%); /* 白を混ぜる（より直感的） */
}
```

### Lab色空間

> **Lightness（明度）、a軸（緑-赤）、b軸（青-黄）**

知覚的に均一な色空間。人間が知覚できる全色域にアクセス可能。

#### lab() 関数

```css
.lab-example {
  /* 明度50%、a軸50（赤方向）、b軸-50（青方向） = 紫っぽい赤 */
  color: lab(50% 50 -50);

  /* アルファ値付き */
  background: lab(70% 30 -20 / 0.5);
}
```

#### sRGBで表現できない色

```css
/* sRGBの色域を超えた鮮やかな赤 */
.vivid-red {
  color: lab(50% 70 50);
}

/* sRGBの色域を超えた鮮やかな緑 */
.vivid-green {
  color: lab(80% -80 80);
}
```

### LCH色空間

> **Lightness（明度）、Chroma（彩度）、Hue（色相）**

Labの円柱座標版。HSLと同じように色相で指定できるが、知覚的に均一。

#### lch() 関数

```css
.lch-example {
  /* 明度50%、彩度100、色相180度（シアン） */
  color: lch(50% 100 180);

  /* アルファ値付き */
  background: lch(70% 80 270 / 0.5);
}
```

#### HSLとの違い

```css
/* HSL: 知覚的に不均一（色相により明るさが異なって見える） */
.hsl-colors {
  --red: hsl(0 100% 50%);
  --green: hsl(120 100% 50%);
  --blue: hsl(240 100% 50%);
  /* 同じ明度50%でも、緑が明るく、青が暗く見える */
}

/* LCH: 知覚的に均一（同じ明度なら同じ明るさに見える） */
.lch-colors {
  --red: lch(50% 100 0);
  --green: lch(50% 100 120);
  --blue: lch(50% 100 240);
  /* すべて同じ明るさに知覚される */
}
```

### OKLCH色空間

LCHの改良版。より知覚的に均一で、sRGB色域内での色再現性が向上。

```css
.oklch-example {
  /* OKLCHの基本構文 */
  color: oklch(0.7 0.15 180);

  /* アルファ値付き */
  background: oklch(0.5 0.2 270 / 0.5);
}
```

**LCHとの違い:**
- 明度の範囲: 0-1（LCHは0-100%）
- 彩度の範囲: 0-0.4程度（LCHは0-150程度）
- より正確な知覚的均一性

## カラー関数の比較

| 色空間 | 直感性 | 知覚的均一性 | 色域 | 用途 |
|--------|--------|-------------|------|------|
| RGB | 低 | 低 | sRGB | 従来の色指定 |
| HSL | 高 | 低 | sRGB | デザインシステム、動的な色調整 |
| HWB | 高 | 低 | sRGB | カラーピッカー、直感的な色指定 |
| Lab | 中 | 高 | 広色域 | 色差計算、正確な色表現 |
| LCH | 高 | 高 | 広色域 | デザインシステム、広色域対応 |
| OKLCH | 高 | 最高 | 広色域 | モダンなデザインシステム |

## 実践的な使用例

### デザインシステムのカラーパレット

```css
:root {
  /* ベースカラーをLCHで定義 */
  --primary-l: 60%;
  --primary-c: 80;
  --primary-h: 210;

  /* 明度を変えてスケールを生成 */
  --primary-50: lch(95% var(--primary-c) var(--primary-h));
  --primary-100: lch(90% var(--primary-c) var(--primary-h));
  --primary-200: lch(80% var(--primary-c) var(--primary-h));
  --primary-300: lch(70% var(--primary-c) var(--primary-h));
  --primary-400: lch(60% var(--primary-c) var(--primary-h));
  --primary-500: lch(50% var(--primary-c) var(--primary-h));
  --primary-600: lch(40% var(--primary-c) var(--primary-h));
  --primary-700: lch(30% var(--primary-c) var(--primary-h));
  --primary-800: lch(20% var(--primary-c) var(--primary-h));
  --primary-900: lch(10% var(--primary-c) var(--primary-h));
}
```

### ダークモード対応

```css
:root {
  /* ライトモード */
  --text-color: lch(20% 10 270);
  --bg-color: lch(98% 5 270);
}

@media (prefers-color-scheme: dark) {
  :root {
    /* ダークモード（色相を保ちながら明度を反転） */
    --text-color: lch(90% 10 270);
    --bg-color: lch(15% 5 270);
  }
}
```

### 動的な色生成

```css
.interactive-element {
  --base-l: 60%;
  --base-c: 80;
  --base-h: 200;

  background: lch(var(--base-l) var(--base-c) var(--base-h));
  transition: background 0.2s;
}

.interactive-element:hover {
  /* 明度を下げる */
  --base-l: 50%;
}

.interactive-element:active {
  /* さらに明度を下げる */
  --base-l: 40%;
}

.interactive-element.disabled {
  /* 彩度を下げてグレーっぽくする */
  --base-c: 20;
}
```

## ブラウザ対応

### 記事執筆時点（2022年1月）

- **rgb() / hsl()**: 全モダンブラウザ対応
- **hwb()**: Firefox、Safari のみ
- **lab() / lch()**: Safari のみ

### 更新情報（2022年4月）

- **Chrome 101**: hwb() サポート追加

### 現在（2025年1月）

- **rgb() / hsl()**: 全ブラウザ対応
- **hwb()**: Chrome 101+, Firefox 96+, Safari 15+
- **lab() / lch()**: Chrome 111+, Firefox 113+, Safari 15+
- **oklch()**: Chrome 111+, Firefox 113+, Safari 15.4+

### フォールバック戦略

```css
.element {
  /* フォールバック（従来のRGB） */
  background: rgb(51 153 255);

  /* モダンブラウザ用（LCH） */
  background: lch(60% 80 240);
}
```

### @supports での分岐

```css
.element {
  background: hsl(210 80% 60%);
}

@supports (color: lch(60% 80 240)) {
  .element {
    background: lch(60% 80 240);
  }
}
```

## 注意点

### 色域外の色

Lab/LCH/OKLCHで指定した色が、ディスプレイの色域外の場合、ブラウザが自動的にクリッピングまたはマッピングする。

```css
/* 広色域ディスプレイでは鮮やかに、sRGBディスプレイでは自動調整 */
.vivid-color {
  color: lch(60% 150 180);
}
```

### パフォーマンス

カラー関数自体のパフォーマンス影響は無視できるレベル。ただし、CSS変数を多用した動的な色生成は、過度に使用するとパフォーマンスに影響する可能性がある。

## 関連ナレッジ

- [OKLCH カラー](../theming/oklch-color.md) - 知覚的均一性を持つ色空間
- [CSS変数（カスタムプロパティ）](./css-custom-properties.md)
- [カラーテーマ設計](../theming/color-scheme.md)
- [light-dark() 関数](../theming/light-dark.md)
