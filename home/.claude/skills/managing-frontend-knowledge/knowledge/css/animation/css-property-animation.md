---
title: "@property を使った CSS アニメーション"
category: css/animation
tags: [css, @property, animation, keyframes, math-functions]
browser_support: "Chrome/Edge 85+, Safari 16.4+, Firefox 128+"
created: 2026-02-01
updated: 2026-02-01
---

# @property を使った CSS アニメーション

## 概要

`@property` は CSS 変数に型定義、初期値、継承設定を可能にする CSS ルール。これにより、CSS 変数をアニメーション可能にし、数学的な表現や複雑な動きの計算が可能になる。

> 出典: [意外？ @propertyがCSSアニメーションを激変させる理由 - ICS MEDIA](https://ics.media/entry/241219/)
> 執筆日: 2024-12-19
> 追加日: 2026-02-01

## 基本構文

```css
@property --custom-color {
  syntax: "<color>";
  inherits: false;
  initial-value: #f00;
}
```

**パラメータ:**
- `syntax`: 変数の型を指定（`<color>`, `<length>`, `<number>`, `<angle>` など）
- `inherits`: 継承設定（true/false）
- `initial-value`: 初期値

## 主要な革新

`@property` により CSS 変数の型を定義することで、従来の CSS アニメーションでは困難だった数学的表現や複雑な動きの計算が可能になる。

**従来の方法との違い:**
- 通常の CSS 変数（`--variable`）は型がなく、アニメーション時に補間されない
- `@property` で型を定義することで、アニメーションの各フレームで正しく補間される

## 実用例

### 1. 円運動

三角関数（cos/sin）を角度変数と組み合わせて使用:

```css
@property --angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

.circle-motion {
  translate:
    calc(cos(var(--angle)) * 100px)
    calc(sin(var(--angle)) * 100px);
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  to { --angle: 360deg; }
}
```

**ユースケース:**
- ローディングアニメーション
- 惑星の公転表現
- 回転するメニュー項目

### 2. ハート型のパス

複雑なパラメトリック曲線を実現:

```css
@property --t {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}

.heart-path {
  translate:
    calc(16 * pow(sin(var(--t)), 3) * 1px)
    calc((13 * cos(var(--t)) - 5 * cos(2 * var(--t)) - 2 * cos(3 * var(--t)) - cos(4 * var(--t))) * -1px);
  animation: heart 5s linear infinite;
}

@keyframes heart {
  to { --t: 6.28; } /* 2π */
}
```

**ユースケース:**
- 「いいね」アニメーション
- バレンタインデーのキャンペーンサイト
- 特殊な軌跡を描く演出

### 3. スパイラルアニメーション

対数螺旋の動き:

```css
@property --spiral-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

@property --spiral-radius {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}

.spiral {
  translate:
    calc(cos(var(--spiral-angle)) * var(--spiral-radius) * 1px)
    calc(sin(var(--spiral-angle)) * var(--spiral-radius) * 1px);
  animation: spiral 4s ease-out infinite;
}

@keyframes spiral {
  to {
    --spiral-angle: 720deg; /* 2回転 */
    --spiral-radius: 200;
  }
}
```

**ユースケース:**
- パーティクルエフェクト
- ギャラクシー風の背景
- スクロール演出

### 4. 色のアニメーション

HSL 色空間での色相回転:

```css
@property --hue {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}

.color-animation {
  background: hsl(var(--hue), 100%, 50%);
  animation: hue-rotate 10s linear infinite;
}

@keyframes hue-rotate {
  to { --hue: 360; }
}
```

**ユースケース:**
- グラデーション背景のアニメーション
- レインボーエフェクト
- テーマカラーの遷移

### 5. 物理シミュレーション

バウンスボールの軌跡、減衰振動など:

```css
@property --bounce-height {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

.bouncing-ball {
  translate: 0 var(--bounce-height);
  animation: bounce 2s ease-out infinite;
}

@keyframes bounce {
  0%, 100% { --bounce-height: 0px; }
  50% { --bounce-height: -200px; }
}
```

**より自然な減衰を追加:**

```css
@property --damping {
  syntax: "<number>";
  inherits: false;
  initial-value: 1;
}

.bouncing-ball-damped {
  translate: 0 calc(var(--bounce-height) * var(--damping));
  animation:
    bounce 2s ease-out infinite,
    damping 2s ease-out infinite;
}

@keyframes damping {
  to { --damping: 0.2; }
}
```

**ユースケース:**
- ゲーム風UI
- インタラクティブな演出
- 物理エンジン風の表現

## 注意点

### ブラウザサポート

- **Chrome/Edge:** 85+ (2020年8月)
- **Safari:** 16.4+ (2023年3月)
- **Firefox:** 128+ (2024年7月)

### パフォーマンス

- 複雑な計算式は CPU 負荷が高くなる可能性がある
- `will-change: transform` を使用してGPUアクセラレーションを有効化
- 多数の要素に適用する場合は注意が必要

### フォールバック

`@property` 非対応ブラウザでは、通常の CSS 変数として扱われるが、アニメーションは動作しない。

```css
/* フォールバック例 */
@supports (syntax: "<angle>") {
  @property --angle {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
  }

  .animated {
    animation: rotate 3s linear infinite;
  }
}

@supports not (syntax: "<angle>") {
  .animated {
    /* 静的スタイルまたは代替アニメーション */
    transform: rotate(45deg);
  }
}
```

## 関連技術

- **CSS Variables:** カスタムプロパティの基本
- **CSS Animation (@keyframes):** アニメーション定義
- **CSS Math Functions:** `calc()`, `sin()`, `cos()`, `pow()` など
- **CSS `<angle>` 型:** 角度の単位（deg, rad, grad, turn）
- **CSS `<length>` 型:** 長さの単位（px, em, rem など）

## 参考リンク

- [CSS Properties and Values API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Properties_and_Values_API)
- [@property - CSS - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@property)
- [CSS Values and Units - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units)
