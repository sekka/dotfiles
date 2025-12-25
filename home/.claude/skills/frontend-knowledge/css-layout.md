# CSS レイアウト

Grid, Flexbox, 配置、Container Queries に関するナレッジ集。

---

## モダン CSS レイアウト

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

### Grid Layout

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

/* 自動配置 */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}
```

### Subgrid

親グリッドのトラックを子要素が継承。カード内の要素を揃えるのに便利。

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3; /* 3行分を使用 */
  gap: 10px;
}
```

```html
<div class="card-grid">
  <article class="card">
    <h2>タイトル</h2>
    <p>説明文...</p>
    <a href="#">詳細を見る</a>
  </article>
  <!-- 他のカードも同じ行の高さに揃う -->
</div>
```

**ブラウザ対応:** Chrome 117+, Firefox 71+, Safari 16+

### gap（Flexbox / Grid 共通）

```css
.flex {
  display: flex;
  gap: 20px; /* 要素間の余白 */
}

.grid {
  display: grid;
  gap: 20px 40px; /* row-gap column-gap */
}
```

`margin` を使わずに要素間の余白を統一できる。

### 中央配置パターン

```css
/* Grid で中央配置（最もシンプル） */
.center-grid {
  display: grid;
  place-content: center;
}

/* Flexbox で中央配置 */
.center-flex {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* position: absolute で中央配置 */
.center-absolute {
  position: absolute;
  inset: 0;
  margin: auto;
  width: fit-content;
  height: fit-content;
}

/* 水平中央のみ */
.center-horizontal {
  margin-inline: auto;
}
```

### inset プロパティ

`top`, `right`, `bottom`, `left` の一括指定。

```css
/* 4方向すべて0 */
.overlay {
  position: absolute;
  inset: 0;
}

/* top right bottom left（時計回り） */
.element {
  position: absolute;
  inset: 10px 20px 30px 40px;
}

/* 上下 左右 */
.element {
  position: absolute;
  inset: 10px 20px;
}
```

### margin-inline / margin-block

論理プロパティ。横書きでは `inline` = 左右、`block` = 上下。

```css
/* 水平中央寄せ */
.element {
  margin-inline: auto;
}

/* 上下の余白 */
.element {
  margin-block: 20px;
}

/* padding も同様 */
.element {
  padding-inline: 20px;
  padding-block: 10px;
}
```

### width: fit-content

コンテンツ幅に合わせつつ、中央寄せも可能。

```css
.button {
  width: fit-content;
  margin-inline: auto;
}

/* min/max も使える */
.element {
  width: fit-content;
  min-width: 200px;
  max-width: 100%;
}
```

### 全幅要素（親の padding を突き抜ける）

```css
/* 親要素に左右 padding がある場合に全幅にする */
.full-width {
  width: 100vw;
  margin-inline: calc(50% - 50vw);
}
```

**注意:** `100vw` はスクロールバーを含むため横スクロールが発生する場合あり。
詳細は [Full-Bleed レイアウト](./css-full-bleed-layout.md) を参照。

### フッター固定（Sticky Footer）

コンテンツが少なくてもフッターを画面下部に配置。

```css
body {
  min-height: 100dvh;
}

footer {
  position: sticky;
  top: 100%;
}
```

または Flexbox 版:

```css
body {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
```

---

## 関連ナレッジ

- [Full-Bleed レイアウト](./css-full-bleed-layout.md) - コンテナクエリを使った全幅レイアウト
