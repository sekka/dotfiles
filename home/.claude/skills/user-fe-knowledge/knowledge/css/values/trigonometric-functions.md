---
title: CSS三角関数 (sin/cos)
category: css/values
tags: [trigonometry, sin, cos, tan, asin, acos, atan, calc, math, animation]
browser_support: Chrome 111+, Edge 111+, Firefox 110+, Safari 15.4+
created: 2026-01-19
updated: 2026-01-19
---

# CSS三角関数 (sin/cos)

> 出典: https://ics.media/entry/230126/
> 執筆日: 2023年2月2日（2024年11月22日更新）
> 追加日: 2026-01-19

## 概要

CSS三角関数を使用すると、「角度と半径が分かっている円周上の点の位置」を計算できます。2023年3月から主要ブラウザで利用可能になり、JavaScriptを使わずに円形配置やローディングアニメーションなどの表現が可能になりました。

## ブラウザサポート

- Chrome 111+ (2023年3月)
- Edge 111+ (2023年3月)
- Firefox 110+ (2023年2月)
- Safari 15.4+ (2022年3月)

## 基本構文

CSS三角関数は`calc()`関数内で使用します。

```css
.element {
  /* サイン関数 */
  --y: calc(sin(45deg) * 100px);

  /* コサイン関数 */
  --x: calc(cos(45deg) * 100px);

  /* タンジェント関数 */
  --tan-value: calc(tan(30deg) * 50px);
}
```

## 利用可能な三角関数

- `sin()` - サイン（正弦）
- `cos()` - コサイン（余弦）
- `tan()` - タンジェント（正接）
- `asin()` - アークサイン（逆正弦）
- `acos()` - アークコサイン（逆余弦）
- `atan()` - アークタンジェント（逆正接）
- `atan2()` - 2引数のアークタンジェント

## 実装例

### 1. ローディングアニメーション

8個の円を等間隔に円形配置する例です。

```html
<div class="loader">
  <div class="dot" style="--index: 0;"></div>
  <div class="dot" style="--index: 1;"></div>
  <div class="dot" style="--index: 2;"></div>
  <div class="dot" style="--index: 3;"></div>
  <div class="dot" style="--index: 4;"></div>
  <div class="dot" style="--index: 5;"></div>
  <div class="dot" style="--index: 6;"></div>
  <div class="dot" style="--index: 7;"></div>
</div>

<style>
  .loader {
    position: relative;
    width: 100px;
    height: 100px;
  }

  .dot {
    position: absolute;
    width: 10px;
    height: 10px;
    background: #3498db;
    border-radius: 50%;

    /* 角度を計算 (360度 / 8個) */
    --angle: calc(360deg / 8 * var(--index));

    /* 円周上の座標を計算 (半径30px) */
    --x: calc(cos(var(--angle)) * 30px);
    --y: calc(sin(var(--angle)) * 30px);

    /* 中心から配置 */
    left: calc(50% + var(--x) - 5px);
    top: calc(50% + var(--y) - 5px);

    /* アニメーション遅延 */
    animation: pulse 1.5s ease-in-out infinite;
    animation-delay: calc(var(--index) * 0.1s);
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.5; }
  }
</style>
```

### 2. 円形メニュー

扇形（200°〜340°）にメニュー項目を配置する例です。

```html
<nav class="circular-menu">
  <button class="menu-item" style="--index: 0;">ホーム</button>
  <button class="menu-item" style="--index: 1;">検索</button>
  <button class="menu-item" style="--index: 2;">設定</button>
  <button class="menu-item" style="--index: 3;">プロフィール</button>
  <button class="menu-item" style="--index: 4;">ログアウト</button>
</nav>

<style>
  .circular-menu {
    position: relative;
    width: 300px;
    height: 300px;
  }

  .menu-item {
    position: absolute;

    /* 開始角度200度、終了角度340度、5個配置 */
    --start-angle: 200deg;
    --angle-range: 140deg; /* 340deg - 200deg */
    --angle: calc(var(--start-angle) + (var(--angle-range) / 4 * var(--index)));

    /* 半径100px */
    --radius: 100px;
    --x: calc(cos(var(--angle)) * var(--radius));
    --y: calc(sin(var(--angle)) * var(--radius));

    left: calc(50% + var(--x));
    top: calc(50% + var(--y));
    transform: translate(-50%, -50%);

    padding: 8px 16px;
    background: #2ecc71;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .menu-item:hover {
    transform: translate(-50%, -50%) scale(1.1);
  }
</style>
```

### 3. サイン波テキスト

文字を波状に配置する例です。

```html
<div class="wave-text">
  <span style="--index: 0;">W</span>
  <span style="--index: 1;">A</span>
  <span style="--index: 2;">V</span>
  <span style="--index: 3;">E</span>
  <span style="--index: 4;"> </span>
  <span style="--index: 5;">T</span>
  <span style="--index: 6;">E</span>
  <span style="--index: 7;">X</span>
  <span style="--index: 8;">T</span>
</div>

<style>
  .wave-text {
    display: flex;
    font-size: 2rem;
    font-weight: bold;
    color: #e74c3c;
  }

  .wave-text span {
    display: inline-block;

    /* 各文字の位置に基づいて角度を計算 */
    --angle: calc(var(--index) * 30deg);

    /* Y座標をサイン波で計算 */
    --y: calc(sin(var(--angle)) * 20px);

    transform: translateY(var(--y));
    animation: wave 2s ease-in-out infinite;
    animation-delay: calc(var(--index) * 0.1s);
  }

  @keyframes wave {
    0%, 100% { transform: translateY(var(--y)); }
    50% { transform: translateY(calc(var(--y) * -1)); }
  }
</style>
```

### 4. 回転する時計の針

```css
.clock-hand {
  position: absolute;
  width: 2px;
  height: 80px;
  background: black;
  left: 50%;
  top: 50%;
  transform-origin: top center;

  /* 12時間 = 360度、現在時刻を --hour 変数で指定 */
  --hour-angle: calc((var(--hour) / 12) * 360deg - 90deg);

  /* 針の先端座標 */
  --tip-x: calc(cos(var(--hour-angle)) * 80px);
  --tip-y: calc(sin(var(--hour-angle)) * 80px);

  transform: rotate(var(--hour-angle)) translate(-50%, 0);
}
```

## カスタムプロパティとの組み合わせ

CSS三角関数は、カスタムプロパティと組み合わせることで動的な計算が可能になります。

```css
:root {
  --angle: 45deg;
  --radius: 100px;
}

.element {
  --x: calc(cos(var(--angle)) * var(--radius));
  --y: calc(sin(var(--angle)) * var(--radius));

  position: absolute;
  left: calc(50% + var(--x));
  top: calc(50% + var(--y));
}
```

## ラジアンと度数

CSSでは角度の単位として、度数（`deg`）とラジアン（`rad`）の両方が使用できます。

```css
.element {
  /* 度数 */
  --value1: calc(sin(90deg)); /* 1 */

  /* ラジアン (π/2 ≈ 1.5708) */
  --value2: calc(sin(1.5708rad)); /* 1 */

  /* turn単位 (1回転 = 360deg) */
  --value3: calc(sin(0.25turn)); /* 1 */
}
```

## ユースケース

- **円形配置:** ローディングインジケーター、メニュー、アイコン配置
- **波形表現:** テキストアニメーション、グラフィックエフェクト
- **時計UI:** 時計の針、タイマー表示
- **軌道アニメーション:** 惑星の公転、衛星の軌道
- **物理演算:** 振り子、弾道計算のシミュレーション

## 注意事項

- `calc()`関数内でのみ使用可能です
- 三角関数の結果は数値（単位なし）なので、長さの単位（`px`など）を掛ける必要があります
- パフォーマンスは良好ですが、大量の要素で複雑な計算を行う場合はJavaScriptの使用も検討してください
- Safari 15.4以降で対応していますが、iOS 15.4以前のデバイスでは使用できません

## 参考リンク

- [CSS Values and Units Module Level 4 - Trigonometric Functions](https://www.w3.org/TR/css-values-4/#trig-funcs)
- [sin() - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/sin)
- [cos() - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/cos)
- [tan() - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/tan)
