# CSS 独立した transform プロパティ - translate / rotate / scale

## 概要

従来、CSS変形は`transform: translateX(100px) rotate(45deg) scale(1.2);`のようにまとめて指定していましたが、独立した`translate`、`rotate`、`scale`プロパティを使うことで、個別にアニメーションさせることが可能になりました。これにより、アニメーションコードがシンプルになり、より豊かな表現ができます。

## 基本的な使い方

### 従来の transform（一括指定）

```css
/* 従来: transformプロパティにまとめて指定 */
.element {
  transform: translateX(100px) rotate(45deg) scale(1.2);
}

/* アニメーション時に全て上書きする必要がある */
.element:hover {
  transform: translateX(200px) rotate(45deg) scale(1.2);
  /* rotate と scale も書かないと消えてしまう */
}
```

### 独立したプロパティ（個別指定）

```css
/* 新方式: 個別に指定 */
.element {
  translate: 100px 0;
  rotate: 45deg;
  scale: 1.2;
}

/* アニメーション時は変更したいプロパティだけ指定 */
.element:hover {
  translate: 200px 0;
  /* rotate と scale はそのまま保持される */
}
```

## 実用例: リッチなホバーエフェクト

独立したプロパティを使うことで、複雑なアニメーションを簡潔に記述できます。

```html
<div class="card">
  <img src="product.jpg" alt="商品画像">
  <h3>商品名</h3>
</div>
```

```css
.card {
  /* 初期状態 */
  translate: 0 0;
  rotate: 0deg;
  scale: 1;
  transition: translate 0.3s ease, rotate 0.3s ease, scale 0.3s ease;
}

.card:hover {
  /* ホバー時は各プロパティを個別にアニメーション */
  translate: 0 -10px; /* 上に浮く */
  rotate: 2deg; /* 少し回転 */
  scale: 1.05; /* 拡大 */
}

.card img {
  scale: 1;
  transition: scale 0.3s ease;
}

.card:hover img {
  scale: 1.1; /* 画像だけさらに拡大 */
}
```

## 複数要素の連動アニメーション

親要素と子要素で異なる変形を独立してアニメーションさせる。

```html
<div class="container">
  <div class="box">
    <div class="inner">
      <p>コンテンツ</p>
    </div>
  </div>
</div>
```

```css
.box {
  translate: 0 0;
  rotate: 0deg;
  scale: 1;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.box:hover {
  translate: 20px 0; /* 右に移動 */
  rotate: 5deg; /* 回転 */
}

.inner {
  rotate: 0deg;
  transition: rotate 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.box:hover .inner {
  rotate: -10deg; /* 親と逆方向に回転して面白い動き */
}
```

## アニメーションの順番制御

独立したプロパティでは、CSS Animation で個別のタイミングを制御できます。

```css
@keyframes fancy-entrance {
  0% {
    translate: -100px 0;
    rotate: -180deg;
    scale: 0;
    opacity: 0;
  }
  50% {
    translate: 0 0;
    /* rotate と scale はまだ変化中 */
  }
  100% {
    translate: 0 0;
    rotate: 0deg;
    scale: 1;
    opacity: 1;
  }
}

.element {
  animation: fancy-entrance 1s ease-out;
}
```

## transition-delay で時間差を付ける

```css
.card {
  translate: 0 0;
  rotate: 0deg;
  scale: 1;

  /* 各プロパティに異なる遅延を設定 */
  transition-property: translate, rotate, scale;
  transition-duration: 0.3s, 0.3s, 0.3s;
  transition-delay: 0s, 0.1s, 0.2s; /* 順番に発火 */
}

.card:hover {
  translate: 0 -20px;
  rotate: 5deg;
  scale: 1.1;
}
```

## 3D変形との組み合わせ

```css
.element {
  /* 3D空間での変形も個別指定可能 */
  translate: 0 0 100px; /* X, Y, Z */
  rotate: x 45deg; /* X軸回転 */
  scale: 1.2;

  transform-style: preserve-3d;
  transition: all 0.5s ease;
}

.element:hover {
  translate: 0 0 200px;
  rotate: y 180deg; /* Y軸回転に変更 */
}
```

## 従来の transform との併用

独立したプロパティと従来の`transform`は併用できますが、`transform`が最後に適用されます。

```css
.element {
  translate: 100px 0;
  rotate: 45deg;
  scale: 1.2;

  /* transform は最後に適用される */
  transform: skewX(10deg);

  /* 最終的な変形順序:
     1. translate
     2. rotate
     3. scale
     4. transform (skewX)
  */
}
```

**推奨:** 混乱を避けるため、独立プロパティと`transform`の併用は避ける。

## 使用場面

- **ホバーエフェクト**: カード、ボタン、画像など
- **ローディングアニメーション**: スピナー、パルス効果
- **スクロールトリガー**: 要素が画面に入ったときの演出
- **インタラクティブUI**: ドラッグ、スワイプ操作
- **複雑な連動アニメーション**: 親子要素が異なる動きをする

## ブラウザサポート

- Chrome: 104+ (2022年8月)
- Edge: 104+ (2022年8月)
- Safari: 14.1+ (2021年4月)
- Firefox: 72+ (2020年1月)

**注意:** IE11では非サポート。フォールバックとして従来の`transform`を用意。

```css
/* フォールバック */
.element {
  transform: translateX(100px) rotate(45deg) scale(1.2);
}

/* モダンブラウザ */
@supports (translate: 100px) {
  .element {
    transform: none;
    translate: 100px 0;
    rotate: 45deg;
    scale: 1.2;
  }
}
```

## パフォーマンスの注意点

- 独立プロパティも`transform`と同様にGPU加速される
- `translate`、`rotate`、`scale`はリフローを引き起こさないため高速
- 多数の要素をアニメーションさせる場合は`will-change`を検討

```css
.optimized {
  will-change: translate, rotate, scale;
}

/* アニメーション完了後は解除 */
.optimized.animation-done {
  will-change: auto;
}
```

## 出典

- [独立したCSS translate・rotate・scaleプロパティだからできる、豊かなアニメーションテクニック！ - ICS MEDIA](https://ics.media/entry/230309/)
- [MDN Web Docs: translate](https://developer.mozilla.org/en-US/docs/Web/CSS/translate)
- [MDN Web Docs: rotate](https://developer.mozilla.org/en-US/docs/Web/CSS/rotate)
- [MDN Web Docs: scale](https://developer.mozilla.org/en-US/docs/Web/CSS/scale)
