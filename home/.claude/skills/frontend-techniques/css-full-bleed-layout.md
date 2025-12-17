# CSS Full-Bleed レイアウト

<!-- 出典: https://coliss.com/articles/build-websites/operation/css/full-bleed-layout-with-modern-css.html -->

## 概要

記事は中央揃え、画像は画面幅いっぱいに表示する「Full-Bleed」レイアウトを
モダン CSS（コンテナクエリ）でシンプルに実装するテクニック。

## 基本実装（4行で実現）

```css
html {
  container-type: inline-size;
}

main {
  --_m: max(1em, 50cqw - 400px / 2);
  margin-inline: var(--_m);
}

.full-bleed {
  margin-inline: calc(-1 * var(--_m));
}
```

```html
<main>
  <p>中央揃えのコンテンツ...</p>
  <img class="full-bleed" src="image.jpg" alt="" />
  <p>中央揃えのコンテンツ...</p>
</main>
```

## 仕組み

### なぜ `cqw` を使うのか

`100vw` はスクロールバーの幅を含むため、横スクロールが発生する問題がある。
`cqw`（コンテナクエリ幅）を使うことでスクロールバーを除いた正確な幅を取得できる。

```css
html {
  container-type: inline-size; /* html をコンテナとして設定 */
}
```

### マージン計算の仕組み

```
--_m: max(1em, 50cqw - 400px / 2)
```

- `50cqw` = 画面幅の50%
- `400px / 2` = コンテンツ最大幅の半分
- `50cqw - 400px / 2` = コンテンツ外側の余白
- `max(1em, ...)` = 最小マージンを確保

### ネガティブマージンで全幅に

```css
.full-bleed {
  margin-inline: calc(-1 * var(--_m));
}
```

計算したマージンを負の値にすることで、要素を画面端まで拡張。

## カスタマイズ可能な実装

```css
main {
  --w: 600px; /* コンテンツ最大幅 */
  --m: 1em; /* 最小マージン */
  margin-inline: max(var(--m), 50cqw - var(--w) / 2);
}

.full-bleed {
  margin-inline: min(-1 * var(--m), var(--w) / 2 - 50cqw);
}
```

## 背景だけ全幅にする場合

コンテンツは中央揃えのまま、背景色だけ画面幅いっぱいにする:

```css
.full-background {
  border-image: conic-gradient(pink 0 0) fill 0 / / 0 100vw;
  padding-block: 10px;
}
```

`border-image` の outset 機能を使って背景を水平方向に拡張。

## 完全な実装例

```css
html {
  container-type: inline-size;
}

main {
  --content-width: 700px;
  --min-margin: 1.5rem;
  --_margin: max(var(--min-margin), 50cqw - var(--content-width) / 2);

  margin-inline: var(--_margin);
}

/* 画像を全幅に */
.full-bleed {
  margin-inline: calc(-1 * var(--_margin));
  width: calc(100% + var(--_margin) * 2);
}

/* 背景だけ全幅に */
.full-bg {
  border-image: conic-gradient(var(--bg-color, #f5f5f5) 0 0) fill 0 / / 0 100vw;
  padding-block: 2rem;
}
```

```html
<main>
  <h1>タイトル</h1>
  <p>本文コンテンツ...</p>

  <img class="full-bleed" src="hero.jpg" alt="全幅画像" />

  <p>本文コンテンツ...</p>

  <section class="full-bg" style="--bg-color: #e8f4f8">
    <p>背景だけ全幅のセクション</p>
  </section>
</main>
```

## ブラウザ対応

| 機能               | Chrome | Firefox | Safari | Edge |
| ------------------ | ------ | ------- | ------ | ---- |
| `container-type`   | 105+   | 110+    | 16+    | 105+ |
| `cqw` 単位         | 105+   | 110+    | 16+    | 105+ |

## 従来手法との比較

| 手法                       | メリット                 | デメリット                     |
| -------------------------- | ------------------------ | ------------------------------ |
| `calc(50% - 50vw)`         | シンプル                 | スクロールバー問題あり         |
| CSS Grid                   | 柔軟性が高い             | マークアップが複雑になる       |
| **コンテナクエリ（本手法）** | シンプル＆スクロールバー対応 | 比較的新しいブラウザが必要     |

## 関連リンク

- [MDN: container-type](https://developer.mozilla.org/ja/docs/Web/CSS/container-type)
- [MDN: Container query length units](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries#container_query_length_units)
