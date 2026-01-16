---
title: 令和のCSS書き方ガイド（2024年版）
category: css
tags: [modern-css, grid, flexbox, gap, selectors, properties, values, media-queries, layout, 2024]
browser_support: iOS Safari 15系以上を基本
created: 2025-01-16
updated: 2025-01-16
---

# 令和のCSS書き方ガイド（2024年版）

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年5月
> 追加日: 2025-01-16

2024年のWeb制作で取り入れるべきモダンなCSS手法をまとめたガイド。iOS Safari 15系以上をサポート対象としています。

---

## レイアウト

### Grid Layout

記事一覧などの格子状のレイアウトはGrid Layoutで実装します。Flexboxに比べ、レスポンシブ時に要素の順番や大きさが変わるケースにも対応でき、`calc()`を使った横幅や余白の複雑な計算も不要になります。

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3列に並べる */
  gap: 40px; /* 子要素の上下左右の間隔 */
}
```

**grid-template-areas を使った配置:**

```css
.grid {
  display: grid;
  grid-template-areas: "thumb title" "thumb description"; /* 付けた名前を並べる */
  grid-template-columns: 300px 1fr; /* 1列目は300px、2列目は余った幅全て */
}

/* gridの子要素 */
.grid_title {
  grid-area: title; /* 名前を付ける */
}
.grid_description {
  grid-area: description;
}
.grid_thumb {
  grid-area: thumb;
}
```

参考:
- [グリッドレイアウトの基礎知識 | ICS MEDIA](https://ics.media/entry/15649/)
- [CSS Grid Layout 完全ガイド](https://zenn.dev/kagan/articles/4f96a97aadfcb8)

### Subgrid

Grid Layoutで並べた各アイテム内の要素の縦位置を揃えたい時にSubgridを使います。説明文の高さがバラバラでも日付の縦位置が同じ位置になるように実装できます。

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3;
  gap: 20px;
}
```

参考: [Subgrid が全ブラウザで利用可能に](https://zenn.dev/tonkotsuboy_com/articles/css-subgrid-all-browsers)

**ブラウザ対応:** iOS Safari 15.8以下はサポート外 ([Can I use](https://caniuse.com/css-subgrid))

### gap プロパティ

Flexboxで横並びにした要素の余白を調整するなら`gap`プロパティを使います。`margin`を使うと、`calc`や`:nth-of-type`などの記述が発生するので複雑になってしまいます。

```css
.flex {
  display: flex;
  gap: 20px;
}
```

---

## モダンセレクタ

### :has / :is / :where

便利な擬似クラスがここ数年で追加されました。

参考: [CSS新しいセレクタの使い方](https://b-risk.jp/blog/2023/06/new-selector/)

**:has() - 子要素の有無に応じてスタイルを変更:**

CSSだけで子要素の有無に応じてスタイルを変えられます（これまではJSを使っていました）。

```css
/* .card の中に a が含まれているなら背景を赤に、含まれていないなら青にする */
.card {
  background-color: blue;
}
.card:has(a) {
  background-color: red;
}
```

**:is() / :where() - 記述の簡略化:**

親要素や前方隣接要素の状態に応じた記述が楽になります。

```css
.post:is(h2, h3, h4, h5, h6) {
  font-weight: bold;
}

/* 従来の書き方 */
.post h2, .post h3, .post h4, .post h5, .post h6 {
  font-weight: bold;
}
```

**Sassでの便利な使い方:**

```.radio {
  span {
    background-color: blue; // 未選択の時
    &:is(input:checked + span) {
      background-color: red; // 選択済みの時
    }
  }
}
```

参考: [CSS :is(), :where()の便利な使い方](https://zenn.dev/kagan/articles/css-is-where-tips)

---

## 画像関連プロパティ

### object-fit

`background-size`プロパティの挙動を使うために画像を`background-image`プロパティで読み込むのは古い手法です。昨今では`<img>`で読み込んだ画像に対して`object-fit`を使うことで、`background-size`と全く同じ挙動を再現できます。

`<img>`を使えば遅延読み込みなどの恩恵を受けられるので、画像はできるだけ`<img>`で読み込むようにしましょう。

```css
.img {
  width: 100px;
  height: 100px;
  object-fit: cover;
}
```

### aspect-ratio

画像の比率を制御するには`aspect-ratio`プロパティを使います。`padding-top`を%で指定する昔ながらの手法もありますが、`aspect-ratio`のほうが記述が簡潔で分かりやすいです。

```css
.img {
  width: 100px;
  aspect-ratio: 16/9; /* 縦横比を16:9に */
  object-fit: cover; /* coverを指定しないと画像の縦横比が崩れる */
  object-position: center top; /* 必要に応じて画像の位置を調整 */
}
```

---

## レイアウト関連プロパティ

### inset

親要素全体に自身のサイズを広げる場合、`inset`プロパティを使うと記述が簡潔になります。`inset`は`top` `left` `right` `bottom`を一括指定するショートハンドプロパティです。

```css
.element {
  position: absolute;
  inset: 0;
  margin: auto;
}
```

### margin-inline: auto

横幅を指定している要素の左右中央寄せは`margin-inline: auto`を使います。

```css
.element {
  margin-inline: auto;
}
```

参考: [margin-inline: autoで中央寄せ](https://zenn.dev/tonkotsuboy_com/articles/margin-inline_auto)

### place-content: center

横幅を指定しない要素の左右中央寄せは`place-content: center`を使います。

```css
.parent {
  display: grid;
  place-content: center;
}
```

参考: [CSS Gridで簡単に中央寄せ](https://zenn.dev/tonkotsuboy_com/articles/css-grid-centering)

### width: fit-content

`width: fit-content`を指定すると自身の横幅が子要素の横幅と同じ値になります。つまり、`width`に固定値を指定しなくても`margin-inline: auto`などで中央配置できるようになります。

```css
/* ひとつの要素で中央配置が可能に！ */
.target {
  width: fit-content;
  margin-inline: auto;
}
```

参考: [width: fit-contentの使い方](https://iwacode.i-design-creative.com/css-fit-content/)

---

## テキスト関連

### word-break

文字列がはみ出ないように折り返しを`word-break: break-word`で制御している方は多いと思いますが、現在は非推奨です。

```css
body {
  overflow-wrap: anywhere;
  word-break: normal;
  line-break: strict;
}
```

参考: [文字列の折り返し最新事情 | ICS MEDIA](https://ics.media/entry/240411/)

---

## アニメーション・変形

### transform の独立プロパティ

`transform`プロパティの`translate`や`rotate`は独立プロパティになったので、以下のように指定できます。

```css
.element {
  translate: 10px;
  scale: 1.5;
  rotate: 45deg;
}
```

参考: [transform の独立プロパティ | ICS MEDIA](https://ics.media/entry/230309/)

**複数の変形を行っている場合の記述も簡潔に:**

```css
.icon {
  translate: 10px;
  rotate: 45deg;
}
a:hover .icon {
  rotate: 90deg; /* translateを再指定する必要なし */
}
```

### transition

`transition`プロパティを使う時はアニメーションを適用させたいプロパティを必ず指定します。

プロパティを指定しないで`transition: all 0.3s`のようにすると全てのプロパティにアニメーションが適用されるので、ページ読み込み時やレスポンシブ時に変な挙動になることがあります。

```css
.fadein {
  transition: opacity 0.3s;
}
```

---

## ビジュアルエフェクト

### filter

`filter`プロパティを使うことで、画像をぼかしたり暗くしたりすることができます。hover時に画像をぼかすような処理も、ぼかし用の画像に切り替えるのではなくCSSだけで完結するので、画像が運用時に変わってもぼかし用の画像作成が不要になります。

```css
.photo {
  filter: blur(10px);
}
```

参考: [filter を使ったボカシ表現 | ICS MEDIA](https://ics.media/entry/15393/#ボカシを使った表現)

### mix-blend-mode

Figmaなどのデザインツールの機能にある描画モード（乗算、スクリーン、オーバーレイなど）をブラウザ上でも再現できるのが`mix-blend-mode`プロパティです。`filter`プロパティと同様に、元画像に手を加えずに加工ができるので運用が楽になります。

```css
.photo {
  mix-blend-mode: overlay;
}
```

参考: [mix-blend-mode の使い方 | ICS MEDIA](https://ics.media/entry/7258/)

### clip-path

三角形などの図形を描画するには`clip-path`プロパティを使います。三角形を作るには`border`を使った昔ながらの手法がありますが`clip-path`のほうが直感的に扱えます。

```css
.triangle {
  clip-path: polygon(100% 50%, 0 0, 0 100%);
  width: 100px;
  height: 100px;
  background-color: red;
}
```

便利なジェネレーター: https://bennettfeely.com/clippy/

---

## CSS値と関数

### currentColor

`currentColor`を値として指定すると、現在の`color`プロパティの値が参照されます。

参考: [currentColor の活用方法](https://zenn.dev/rabee/articles/css-tips-currentcolor)

**ボタンのhover時に自動的にアイコン色も変わる例:**

```css
.button {
  color: white;
}
.button:hover {
  color: blue;
}
.button svg {
  fill: currentColor; /* 通常時はwhite、hover時はblue */
}
```

### clamp()

`clamp`関数はvwなどの動的な値に対して最大（最小）値を設定できます。

例えば、フォントサイズにvwを指定すると大きく（小さく）なりすぎることがありますが、`clamp`関数を使うことで最大（最小）の文字サイズを指定できるようになります。

```css
.text {
  font-size: clamp(16px, 5vw, 20px); /* ベースサイズは5vw、最小16px、最大20px */
}
```

便利なジェネレーター: https://min-max-calculator.9elements.com/

### svh（Small Viewport Height）

要素の高さを画面いっぱいにするには100vhではなく100svhを指定します。`vh`はiOSのアドレスバーの高さを含んでしまうので「画面の高さ＋アドレスバーの高さ」になってしまいますが、`svh`はアドレスバーの高さを含まない純粋な「画面の高さ」のみを取得できます。

```css
.main-visual {
  height: 100svh;
}
```

参考: [svh, dvh, lvhが全ブラウザ対応](https://zenn.dev/tonkotsuboy_com/articles/svh-dvh-lvh-for-all-browser)

### border-radius: 100vmax

完全な角丸のボタンを実装する時の`border-radius`には9999pxなどの大きい数値を指定するのではなく`100vmax`を指定することで、ボタンがどんな大きさになっても完全な角丸を保てるようになります。

```css
.button {
  border-radius: 100vmax;
}
```

---

## メディアクエリ

### @media (min-width: 768px)

昨今のブラウザではメディア種別の`screen`を省略しても「画面」と認識してくれるので、メディアクエリの`screen and`は省略しても問題ありません。

```css
@media (min-width: 768px) {
  .element { ... }
}
```

**range記法:**

2023年にリリースされた新しい記述方法。

```css
@media (width <= 768px) {
  .element { ... }
}
```

参考: [CSS メディアクエリのrange記法](https://zenn.dev/tonkotsuboy_com/articles/css-range-syntax)

**ブラウザ対応:** iOS Safari 16.3以下はサポート外のため、使う場合はコンパイラを挟むことを推奨 ([Can I use](https://caniuse.com/css-media-range-syntax))

### any-hover: hover

スマホやタブレットなどタップで操作をする端末ではhover処理は無効にします。

タップデバイスを判定するにはメディア特性の`any-hover: hover`を使います。昨今は小さいノートパソコンや大きいスマホなどがあるので、画面幅で判定するのはよろしくありません。

```css
@media (any-hover: hover) {
  .button:hover {
    background-color: red;
  }
}
```

参考: [モバイルでのhover無効化と実装例](https://www.tak-dcxi.com/article/disable-hover-on-mobile-and-hover-implementation-example)

### prefers-reduced-motion: reduce

メディア特性の`prefers-reduced-motion`を使うことで、デバイス設定で「視差効果を減らす」が有効かどうかを判定できます。

ユーザーは過度なアニメーションを求めていない場合もあるので、ユーザー側でアニメーションのON/OFFを選択できるように実装してあげることが大切です。

```css
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    transition-duration: 1ms !important;
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

参考:
- [prefers-reduced-motionの使い方](https://www.webcreatorbox.com/tech/prefers-reduced-motion)
- [視覚効果を減らす設定への対応](https://accessible-usable.net/2021/09/entry_210919.html)

---

## 高度なレイアウトテクニック

### 親要素にpaddingがある状態で子要素を画面幅いっぱいにする

親要素の左右に`padding`が指定されている状態で、子要素の幅を画面幅と同じにする場合は`calc`と`vw`を使って実装します。

```css
.wrapper {
  padding-left: 40px;
  padding-right: 40px;
}
.photo {
  width: 100vw;
  margin-inline: calc(50% - 50vw);
}
```

従来の書き方だと、以下のように`padding`の値に応じて子要素の`width`や`margin`の値も変わってしまいます。`calc`と`vw`を使うことで再定義が不要になります。

### コンテンツ幅から片方だけ画面の端まではみ出しているレイアウト

```css
.片方だけはみ出させる要素（左配置の場合） {
  width: 50vw;
  margin-left: calc((50vw - 50%) * -1);
}
.片方だけはみ出させる要素（右配置の場合） {
  width: 50vw;
  margin-right: -50vw;
}

/* 反対側の要素には`width: 50%`を、これらの親要素には`display: flex`を指定します */
```

詳しくは CodePen をご覧ください: https://codepen.io/dadada-dadada/pen/JjOXqPZ

### メインコンテンツが少ない状態でもフッターを画面最下部に固定

コンテンツ量が少なくてもフッターを画面最下部に固定するレイアウト手法です。

```css
body {
  min-height: 100dvh;
}
footer {
  position: sticky;
  top: 100%;
}
```

参考: https://twitter.com/d151005/status/1729690789343527077?s=20

---

## 著者の推奨する優先順位

記事の最後で、著者が「まずはこれだけでも取り入れて」として推奨している項目：

**1. 画像**
- Lazy loadingで遅延読み込み
- Picture要素で画像の出し分け
- Img要素で読み込み、object-fit、aspect-ratioを使う

**2. レイアウト**
- Grid Layoutを使う
- Flexboxの間隔はgapを使う
- calc()とvwを組み合わせてレイアウトを組む

---

## 関連ナレッジ

- [Grid Layout 基礎](./layout/layout-basics.md)
- [:has セレクタ](./selectors/has-selector.md)
- [:is / :where セレクタ](./selectors/is-where-selectors.md)
- [Container Queries](./layout/container-query.md)
- [Visually Hidden](../cross-cutting/accessibility/visually-hidden.md)
- [prefers-reduced-motion](./animation/prefers-reduced-motion.md)

---

## ブラウザ対応

当記事では「iOS Safari バージョン15系以上」でサポートされている技術を基本的に紹介しています。しかし、15系や16系でサポートされていない技術も少しだけ含まれているので、その場合は補足をしております。

必ず [Can I use](https://caniuse.com/) などでブラウザサポート状況を確認してから実務に取り入れてください。
