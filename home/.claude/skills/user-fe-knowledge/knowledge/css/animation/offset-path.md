# CSS offset プロパティ - パスに沿ったアニメーション

## 概要

CSS `offset`プロパティを使うと、要素を任意のパス（直線、曲線、円、SVGパス）に沿って配置・移動させることができます。`animation`や`transition`と組み合わせることで、一見複雑に見えるアニメーションを簡単に実装できます。観覧車、ジェットコースター、円形メニューなど、創造的な表現が可能です。

## 基本的な使い方

### offset プロパティの構成

`offset`は以下の5つのサブプロパティを持つショートハンドプロパティです。

- `offset-path`: 要素を配置・移動させるパス
- `offset-distance`: パス上での位置（0%〜100%）
- `offset-rotate`: パスに沿った回転角度
- `offset-anchor`: 要素のどの点をパスに沿わせるか
- `offset-position`: パスの開始位置

### 円形のパスを作る

```css
.element {
  /* 円形のパス（半径200px） */
  offset-path: circle(200px);

  /* パス上の位置（0%が開始点、100%が終点） */
  offset-distance: 0%;

  /* 要素の向きを固定（0degで固定、autoでパスに沿って回転） */
  offset-rotate: 0deg;
}
```

### アニメーションで動かす

```css
@keyframes move-on-path {
  from {
    offset-distance: 0%;
  }
  to {
    offset-distance: 100%;
  }
}

.moving-element {
  offset-path: circle(200px);
  offset-rotate: 0deg;
  animation: move-on-path 5s linear infinite;
}
```

## 実用例: 観覧車の実装

観覧車のゴンドラを円周上に配置し、回転させるアニメーション。

```html
<div class="ferris-wheel">
  <div class="gondola" style="--index: 0;"></div>
  <div class="gondola" style="--index: 1;"></div>
  <div class="gondola" style="--index: 2;"></div>
  <div class="gondola" style="--index: 3;"></div>
  <div class="gondola" style="--index: 4;"></div>
  <div class="gondola" style="--index: 5;"></div>
</div>
```

```css
.ferris-wheel {
  position: relative;
  width: 400px;
  height: 400px;
}

.gondola {
  width: 40px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;

  /* 円形パス（半径180px）*/
  offset-path: path('M 200,20 A 180,180 0 1,1 200,380 A 180,180 0 1,1 200,20 Z');

  /* CSS変数で各ゴンドラの位置を計算（6等分） */
  offset-distance: calc(var(--index) * 100% / 6);

  /* ゴンドラの向きは固定（揺れないように） */
  offset-rotate: 0deg;
}

/* ホバーでゴンドラを揺らす */
.gondola:hover {
  animation: swing 0.5s ease-in-out;
}

@keyframes swing {
  0%, 100% { offset-rotate: 0deg; }
  25% { offset-rotate: 10deg; }
  75% { offset-rotate: -10deg; }
}

/* 観覧車全体を回転 */
.ferris-wheel {
  animation: rotate-wheel 20s linear infinite;
}

@keyframes rotate-wheel {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

**ポイント:**
- SVGの`path()`構文で円形パスを定義（`Z`で閉じる）
- CSS変数`--index`で各ゴンドラの位置を均等に配置
- `offset-distance`をパーセント単位で指定
- `offset-rotate: 0deg`でゴンドラの向きを固定

## SVGパスを使った複雑な軌道

SVGの`path()`構文を使うことで、自由な曲線を描けます。

```css
.roller-coaster {
  /* 曲線的なコースター軌道 */
  offset-path: path('M 50,200 C 100,50 200,50 250,200 S 400,350 450,200');
  offset-distance: 0%;
  animation: ride 10s ease-in-out infinite;
}

@keyframes ride {
  0%, 100% {
    offset-distance: 0%;
  }
  50% {
    offset-distance: 100%;
  }
}
```

## パスに沿って回転させる

`offset-rotate: auto`で、要素がパスの方向に自動的に回転します。

```css
.car {
  offset-path: path('M 50,50 L 200,50 L 200,200 L 50,200 Z');
  offset-distance: 0%;
  offset-rotate: auto; /* パスの方向に自動回転 */
  animation: drive 8s linear infinite;
}

@keyframes drive {
  to {
    offset-distance: 100%;
  }
}
```

## 楕円形のパス

```css
.element {
  /* 楕円形のパス（横幅300px、縦幅150px） */
  offset-path: ellipse(150px 75px);
  offset-distance: 0%;
  animation: orbit 6s linear infinite;
}

@keyframes orbit {
  to {
    offset-distance: 100%;
  }
}
```

## 使用場面

- **ローディングアニメーション**: 円形に配置された要素が回転
- **装飾的なアニメーション**: 観覧車、ジェットコースター、惑星の軌道
- **インタラクティブなUI**: カーソルに追従する要素がパスに沿って動く
- **スクロール演出**: パスに沿って要素が出現
- **ナビゲーションメニュー**: 円形に展開するメニュー

## ブラウザサポート

- Chrome: 116+ (2023年8月) - `offset-path: path()` など完全サポート
- Edge: 116+ (2023年8月)
- Safari: 16.0+ (2022年9月)
- Firefox: 72+ (2020年1月) - 基本的なサポート

**注意:**
- `offset-path: circle()`, `ellipse()`, `polygon()` はChrome 116以降
- それ以前のバージョンでは `path()` のみ使用可能
- 機能検出を推奨

```css
@supports (offset-path: circle(50%)) {
  /* circle()がサポートされている場合 */
  .element {
    offset-path: circle(200px);
  }
}
```

## パフォーマンスの注意点

- `offset`プロパティはGPU加速されるため、パフォーマンスは良好
- 多数の要素に適用する場合は`will-change: offset-distance`を検討
- 複雑なSVGパスは計算コストが高いため、シンプルなパスを優先

```css
.optimized {
  will-change: offset-distance;
}
```

## 出典

- [CSSのoffsetプロパティで、楽しいパスアニメーションを作ろう - ICS MEDIA](https://ics.media/entry/230327/)
- [MDN Web Docs: offset](https://developer.mozilla.org/en-US/docs/Web/CSS/offset)
- [MDN Web Docs: offset-path](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-path)
