# CSS 三角関数 - sin() / cos() / tan()

## 概要

CSS に三角関数 `sin()`, `cos()`, `tan()`, `asin()`, `acos()`, `atan()`, `atan2()` が導入され、数学的な計算がCSS内で可能になりました。特に `sin()` と `cos()` を使うことで、要素を円周上に等間隔で配置する、円形のアニメーションを作成するなど、創造的な表現が簡単に実装できます。

## 基本的な使い方

### 円周上の位置計算

角度と半径が分かれば、円周上の座標を計算できます。

```css
.element {
  --angle: 60deg;
  --radius: 200px;

  /* X座標 = cos(角度) × 半径 */
  left: calc(50% + cos(var(--angle)) * var(--radius));

  /* Y座標 = sin(角度) × 半径 */
  top: calc(50% + sin(var(--angle)) * var(--radius));

  /* 中心からの配置 */
  transform: translate(-50%, -50%);
}
```

### サポートされている三角関数

```css
.element {
  /* 基本的な三角関数 */
  --sin-value: sin(45deg);      /* サイン */
  --cos-value: cos(45deg);      /* コサイン */
  --tan-value: tan(45deg);      /* タンジェント */

  /* 逆三角関数 */
  --asin-value: asin(0.5);      /* アークサイン */
  --acos-value: acos(0.5);      /* アークコサイン */
  --atan-value: atan(1);        /* アークタンジェント */
  --atan2-value: atan2(1, 1);   /* アークタンジェント2 */
}
```

## 実用例: 円形配置ナビゲーション

要素を円周上に等間隔で配置するナビゲーションメニュー。

```html
<div class="circular-menu">
  <button class="menu-item" style="--index: 0;">Home</button>
  <button class="menu-item" style="--index: 1;">About</button>
  <button class="menu-item" style="--index: 2;">Services</button>
  <button class="menu-item" style="--index: 3;">Portfolio</button>
  <button class="menu-item" style="--index: 4;">Contact</button>
</div>
```

```css
.circular-menu {
  position: relative;
  width: 400px;
  height: 400px;
}

.menu-item {
  --total: 5; /* 総アイテム数 */
  --radius: 150px; /* 円の半径 */
  --angle: calc(var(--index) * 360deg / var(--total));

  position: absolute;

  /* 円周上の位置を計算 */
  left: calc(50% + cos(var(--angle)) * var(--radius));
  top: calc(50% + sin(var(--angle)) * var(--radius));

  /* 要素の中心を基準点にする */
  transform: translate(-50%, -50%);

  /* スタイリング */
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.menu-item:hover {
  transform: translate(-50%, -50%) scale(1.2);
}
```

## ローディングアニメーション

円周上に配置した要素を順番にアニメーションさせる。

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
```

```css
.loader {
  position: relative;
  width: 100px;
  height: 100px;
}

.dot {
  --total: 8;
  --radius: 40px;
  --angle: calc(var(--index) * 360deg / var(--total));

  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #667eea;

  /* 円周上に配置 */
  left: calc(50% + cos(var(--angle)) * var(--radius));
  top: calc(50% + sin(var(--angle)) * var(--radius));
  transform: translate(-50%, -50%);

  /* 順番にアニメーション */
  animation: pulse 1.2s ease-in-out infinite;
  animation-delay: calc(var(--index) * 0.15s);
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.2;
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
}
```

## 波形アニメーション

`sin()`を使って波のような動きを作成。

```css
@keyframes wave {
  from {
    --progress: 0;
  }
  to {
    --progress: 360;
  }
}

.wave-element {
  --progress: 0;
  --amplitude: 50px; /* 振幅 */

  /* sin()で上下に波打つ動き */
  transform: translateY(calc(sin(calc(var(--progress) * 1deg)) * var(--amplitude)));

  animation: wave 2s linear infinite;
}
```

## 楕円形の配置

円ではなく楕円形に配置する場合は、X軸とY軸で異なる半径を使います。

```css
.ellipse-item {
  --angle: calc(var(--index) * 360deg / var(--total));
  --radius-x: 200px; /* 横方向の半径 */
  --radius-y: 100px; /* 縦方向の半径 */

  left: calc(50% + cos(var(--angle)) * var(--radius-x));
  top: calc(50% + sin(var(--angle)) * var(--radius-y));
  transform: translate(-50%, -50%);
}
```

## 回転する要素の配置

時計の文字盤のように、回転しながら配置する。

```css
.clock {
  position: relative;
  width: 300px;
  height: 300px;
}

.hour-mark {
  --hour: var(--index); /* 0-11 */
  --angle: calc(var(--hour) * 30deg); /* 360deg / 12 = 30deg */
  --radius: 120px;

  position: absolute;
  left: calc(50% + cos(var(--angle) - 90deg) * var(--radius));
  top: calc(50% + sin(var(--angle) - 90deg) * var(--radius));
  transform: translate(-50%, -50%);

  /* 数字を常に水平に保つ */
  rotate: calc(var(--angle) * -1);
}
```

**ポイント:** 12時の位置から始めるため `-90deg` でオフセット。

## 使用場面

- **円形ナビゲーション**: メニューアイテムを円形に配置
- **ローディングアニメーション**: ドットが円周上を移動
- **データビジュアライゼーション**: 円グラフ、レーダーチャート
- **時計・タイマー**: 時計の針、カウントダウン
- **装飾的なアニメーション**: 波形、螺旋、パターン

## ブラウザサポート

- Chrome: 111+ (2023年3月)
- Edge: 111+ (2023年3月)
- Safari: 15.4+ (2022年3月)
- Firefox: 110+ (2023年2月)

**注意:** IE11や古いブラウザでは非サポート。フォールバックを用意すること。

```css
/* フォールバック: 固定値で配置 */
.menu-item:nth-child(1) { left: 200px; top: 50px; }
.menu-item:nth-child(2) { left: 300px; top: 150px; }
/* ... */

/* モダンブラウザ: 三角関数で動的に計算 */
@supports (top: sin(0deg)) {
  .menu-item {
    left: calc(50% + cos(var(--angle)) * var(--radius));
    top: calc(50% + sin(var(--angle)) * var(--radius));
  }
}
```

## パフォーマンスの注意点

- CSS三角関数は計算コストが低く、パフォーマンスへの影響は軽微
- アニメーションと組み合わせる場合は`transform`を使うことでGPU加速を活用
- 大量の要素に適用する場合は、CSS変数の計算回数を最小化

```css
/* 計算を事前に行う */
.menu-item {
  --angle-rad: calc(var(--index) * 6.28318 / var(--total)); /* 2π */
  --x: calc(cos(var(--angle-rad)) * var(--radius));
  --y: calc(sin(var(--angle-rad)) * var(--radius));

  left: calc(50% + var(--x));
  top: calc(50% + var(--y));
}
```

## 出典

- [CSSの三角関数を理解しよう！ sin()とcos()でできる表現 - ICS MEDIA](https://ics.media/entry/230126/)
- [MDN Web Docs: sin()](https://developer.mozilla.org/en-US/docs/Web/CSS/sin)
- [MDN Web Docs: cos()](https://developer.mozilla.org/en-US/docs/Web/CSS/cos)
- [MDN Web Docs: tan()](https://developer.mozilla.org/en-US/docs/Web/CSS/tan)
