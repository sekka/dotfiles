# CSS 3D Transform - WebGLを使わない3D表現

## 概要

CSS 3D Transformを使うと、JavaScriptライブラリやWebGLを使わずに、CSSだけで立体的な表現が可能になります。`perspective`と`transform`プロパティを組み合わせることで、カードの裏返しアニメーション、パララックス効果、3D空間での配置など、視覚的に魅力的な表現を実現できます。

## 基本的な使い方

### perspectiveプロパティ

`perspective`は「目からの距離」を決めるプロパティで、変形させる要素の**親要素**に指定します。値が小さいほど強い遠近感が得られます。

```css
/* 親要素に指定 */
.container {
  perspective: 600px; /* 目からの距離 */
  perspective-origin: 50% 50%; /* 視点の位置（デフォルトは中央） */
}

/* 子要素を3D変形 */
.card {
  transform: rotateY(45deg);
  transform-style: preserve-3d; /* 3D空間を保持 */
}
```

### カードの裏返しアニメーション

実用例として、オンラインショップの決済画面でよく見るクレジットカード入力フォームを実装できます。

```html
<div class="card-container">
  <div class="card">
    <div class="card-front">
      カード番号を入力
    </div>
    <div class="card-back">
      セキュリティコード
    </div>
  </div>
</div>
```

```css
.card-container {
  perspective: 1000px;
}

.card {
  position: relative;
  width: 300px;
  height: 200px;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card:hover {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden; /* 裏面を非表示 */
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-back {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  transform: rotateY(180deg); /* 最初から裏返しておく */
}
```

### 3D空間での要素配置

複数の要素を3D空間に配置してパララックス効果を作成：

```css
.scene {
  perspective: 800px;
  perspective-origin: 50% 50%;
}

.layer-1 {
  transform: translateZ(0px); /* 基準面 */
}

.layer-2 {
  transform: translateZ(100px); /* 手前 */
}

.layer-3 {
  transform: translateZ(-100px); /* 奥 */
}
```

### 三角関数を使った円形配置

CSS `sin()`と`cos()`を使って、要素を円周上に等間隔で配置：

```css
.circle-item {
  --angle: calc(var(--index) * 360deg / var(--total));
  --radius: 200px;

  position: absolute;
  left: calc(50% + cos(var(--angle)) * var(--radius));
  top: calc(50% + sin(var(--angle)) * var(--radius));
  transform: translate(-50%, -50%);
}
```

```html
<div class="circle-container">
  <div class="circle-item" style="--index: 0; --total: 6;"></div>
  <div class="circle-item" style="--index: 1; --total: 6;"></div>
  <div class="circle-item" style="--index: 2; --total: 6;"></div>
  <div class="circle-item" style="--index: 3; --total: 6;"></div>
  <div class="circle-item" style="--index: 4; --total: 6;"></div>
  <div class="circle-item" style="--index: 5; --total: 6;"></div>
</div>
```

## 使用場面

- **カード型UI**: 裏返しアニメーション（決済フォーム、カードゲーム）
- **パララックス効果**: 奥行きのあるスクロール演出
- **プロダクトビューアー**: 商品を回転させて見せる
- **インタラクティブなナビゲーション**: 3D的に展開するメニュー
- **ローディングアニメーション**: 立方体の回転など

## ブラウザサポート

### CSS 3D Transform

- Chrome: 12+
- Firefox: 10+
- Safari: 4+
- Edge: 12+

### CSS 三角関数（sin, cos）

- Chrome: 111+ (2023年3月)
- Firefox: 110+ (2023年2月)
- Safari: 15.4+ (2022年3月)
- Edge: 111+ (2023年3月)

**注意:** IE11では非サポート。フォールバックとして2D表現を用意することを推奨。

## パフォーマンスの注意点

- `transform: translateZ(0)`でGPUアクセラレーションを有効化
- 多数の要素に3D変形を適用する場合はパフォーマンスに注意
- `will-change: transform`で事前に最適化を指示（使いすぎに注意）

```css
.optimized {
  transform: translateZ(0); /* GPU加速 */
  will-change: transform; /* アニメーション前に指定 */
}
```

## 出典

- [もう誤魔化さない！ CSS Transform完全入門(3D編) - ICS MEDIA](https://ics.media/entry/210519/)
- [頑張らない3D表現！ WebGLを使わずにウェブサイトで3Dを実現するCSSテクニック - ICS MEDIA](https://ics.media/entry/230519/)
- [CSSの三角関数を理解しよう！ sin()とcos()でできる表現 - ICS MEDIA](https://ics.media/entry/230126/)
