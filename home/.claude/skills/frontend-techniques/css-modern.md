# モダン CSS プロパティ

clamp, 論理プロパティ, 新しい単位, セレクタ, 視覚効果に関するナレッジ集。

---

## 令和の CSS プロパティ

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

### clamp()（レスポンシブな値）

最小値、推奨値、最大値を指定。メディアクエリなしでレスポンシブ対応。

```css
/* フォントサイズ */
.text {
  font-size: clamp(16px, 4vw, 24px);
}

/* 余白 */
.section {
  padding: clamp(20px, 5vw, 60px);
}

/* コンテナ幅 */
.container {
  width: clamp(320px, 90%, 1200px);
  margin-inline: auto;
}
```

### ビューポート単位（svh, dvh, lvh）

モバイルのアドレスバーを考慮した単位。

| 単位 | 説明 |
|------|------|
| `svh` | Small - アドレスバー表示時の高さ |
| `dvh` | Dynamic - アドレスバーの表示/非表示に追従 |
| `lvh` | Large - アドレスバー非表示時の高さ |

```css
/* メインビジュアル */
.hero {
  height: 100svh; /* 安全な高さ */
}

/* フルスクリーン要素 */
.fullscreen {
  height: 100dvh; /* 動的に変化 */
}
```

**推奨:** 通常は `svh` が安全。`dvh` はリサイズ時に要素がジャンプする可能性あり。

### :has() セレクタ

親要素を子要素の状態で選択（親セレクタ）。

```css
/* リンクを含むカードにスタイル */
.card:has(a) {
  cursor: pointer;
}

/* チェックされたラベル */
label:has(input:checked) {
  background-color: #e0f0ff;
}

/* 空でないフォーム */
form:has(input:not(:placeholder-shown)) {
  border-color: green;
}

/* 画像を含む記事 */
article:has(img) {
  display: grid;
  grid-template-columns: 200px 1fr;
}
```

**ブラウザ対応:** Chrome 105+, Firefox 121+, Safari 15.4+

### :is() / :where() セレクタ

複数セレクタをまとめて記述。

```css
/* :is() - 詳細度は最も高いセレクタに合わせる */
.post :is(h2, h3, h4, h5, h6) {
  font-weight: bold;
  line-height: 1.4;
}

/* :where() - 詳細度は常に 0 */
:where(.post, .article) p {
  line-height: 1.8;
}
```

**使い分け:**
- `:is()` - 通常のセレクタ
- `:where()` - リセットCSS、上書きしやすくしたい場合

### object-fit / object-position

画像のトリミング方法を指定。

```css
.thumbnail {
  width: 200px;
  height: 200px;
  object-fit: cover; /* アスペクト比を維持してトリミング */
  object-position: center top; /* トリミング位置 */
}
```

| 値 | 説明 |
|----|------|
| `cover` | 領域を埋める（はみ出し部分はトリミング） |
| `contain` | 領域に収める（余白ができる場合あり） |
| `fill` | 領域に合わせて引き伸ばす（デフォルト） |
| `none` | 元のサイズのまま |

### aspect-ratio

アスペクト比を指定。CLS 対策にも有効。

```css
.video-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.square {
  aspect-ratio: 1; /* 正方形 */
}

/* 画像と組み合わせ */
.thumbnail {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}
```

### transform 独立プロパティ

`transform` を分割して記述可能。個別にアニメーションできる。

```css
.element {
  translate: 10px 20px;
  scale: 1.5;
  rotate: 45deg;
}

/* 個別にアニメーション */
.element {
  transition: translate 0.3s, scale 0.2s;
}

.element:hover {
  translate: 0 -10px;
  scale: 1.1;
}
```

### filter

画像やエレメントに視覚効果を適用。

```css
/* ぼかし */
.blur {
  filter: blur(10px);
}

/* グレースケール */
.grayscale {
  filter: grayscale(100%);
}

/* 複数の効果 */
.photo {
  filter: brightness(1.1) contrast(1.1) saturate(1.2);
}

/* ホバーで効果解除 */
.photo {
  filter: grayscale(100%);
  transition: filter 0.3s;
}

.photo:hover {
  filter: grayscale(0);
}
```

### backdrop-filter

要素の背後にフィルタを適用（すりガラス効果など）。

```css
.glass {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}
```

### mix-blend-mode

要素と背景の合成モード。

```css
.overlay-text {
  mix-blend-mode: difference;
  color: white;
}

.multiply {
  mix-blend-mode: multiply;
}
```

### clip-path

要素の表示領域をクリップ。

```css
/* 三角形 */
.triangle {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

/* 円形 */
.circle {
  clip-path: circle(50%);
}

/* 斜めカット */
.diagonal {
  clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
}
```

ジェネレーター: [Clippy](https://bennettfeely.com/clippy/)

### currentColor

親要素の `color` を参照。

```css
.button {
  color: #0066cc;
  border: 1px solid currentColor;
}

.button svg {
  fill: currentColor;
}

/* ホバーで色が変わると全て連動 */
.button:hover {
  color: #004499;
}
```

### border-radius: 100vmax

どんなサイズでも完全な丸みを実現。

```css
.pill-button {
  border-radius: 100vmax;
  padding: 0.5em 1.5em;
}
```

`50%` だと楕円になる場合があるが、`100vmax` なら常に端が半円。

### Visually Hidden（アクセシブルな非表示）

視覚的には非表示だが、スクリーンリーダーには読み上げられる。

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

```html
<button>
  <svg>...</svg>
  <span class="visually-hidden">メニューを開く</span>
</button>
```

### メディアクエリの新しい書き方

```css
/* 範囲構文（Chrome 104+, Firefox 63+, Safari 16.4+） */
@media (width >= 768px) {
  /* ... */
}

@media (768px <= width < 1024px) {
  /* ... */
}

/* ホバー可能なデバイスのみ */
@media (any-hover: hover) {
  .button:hover {
    background-color: #0055aa;
  }
}

/* モーション軽減設定 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ダークモード */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #f0f0f0;
  }
}
```

---

## mask-composite（マスクの合成）

> 出典: https://ics.media/entry/241025/
> 執筆日: 2024-10-25
> 追加日: 2025-12-17

複数のマスク画像を組み合わせる方法を指定。2024年に主要ブラウザでサポート。

### 基本構文

```css
.element {
  mask-image: url(mask1.svg), url(mask2.svg);
  mask-composite: <値>;
}
```

### 値の種類

| 値 | 説明 | 用途 |
|----|------|------|
| `add` | マスク領域を結合 | 複数形状の統合 |
| `subtract` | 2番目を1番目から除去 | 穴あけ効果 |
| `intersect` | 重なる部分のみ表示 | 共通部分の切り出し |
| `exclude` | 重なる部分を除外 | ドーナツ形状など |

### 中央に穴を開ける

```css
.center-hole {
  mask-image:
    linear-gradient(#000, #000),        /* ベース（全体） */
    url("circle.svg");                   /* 穴の形状 */
  mask-repeat: no-repeat;
  mask-position: 0 0, center center;
  mask-size: 100% 100%, 200px 200px;
  mask-composite: exclude;              /* 穴を開ける */
}
```

### 幾何学的パターン

```css
.geometric {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  mask-image:
    radial-gradient(circle at 25% 25%, #000 50px, transparent 50px),
    radial-gradient(circle at 75% 75%, #000 50px, transparent 50px);
  mask-composite: add;                  /* 円を結合 */
}
```

### グラデーションマスクの組み合わせ

```css
.fade-edges {
  mask-image:
    linear-gradient(to right, transparent, #000 20%, #000 80%, transparent),
    linear-gradient(to bottom, transparent, #000 20%, #000 80%, transparent);
  mask-composite: intersect;            /* 両方が不透明な部分のみ表示 */
}
```

### スクロール連動アニメーション

```html
<div class="scroll-container">
  <div class="content">
    <div class="mask-element"></div>
  </div>
</div>
```

```css
.mask-element {
  mask-image:
    linear-gradient(#000, #000),
    radial-gradient(circle, #000 0, #000 100px, transparent 100px);
  mask-position: 0 0, center center;
  mask-composite: exclude;
  transition: mask-size 0.1s;
}
```

```javascript
const scrollContainer = document.querySelector(".scroll-container");
const maskElement = document.querySelector(".mask-element");

scrollContainer.addEventListener("scroll", (e) => {
  const scrollRatio = e.target.scrollTop / 100;
  const size = 100 + scrollRatio * 50; // 100px から拡大
  maskElement.style.maskSize = `100% 100%, ${size}px ${size}px`;
});
```

### ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 120+ |
| Safari | 15.4+ |
| Firefox | 53+ |

### メリット

- **レスポンシブ対応**: CSS だけで柔軟なマスク表現
- **アニメーション可能**: transition/animation と組み合わせ可能
- **軽量**: Canvas や JavaScript 不要

### 注意点

- Safari では `-webkit-mask-composite` が必要な場合あり
- 古い Safari の値は異なる（`source-over`, `source-out` 等）

```css
/* クロスブラウザ対応 */
.element {
  -webkit-mask-composite: xor;      /* Safari（古い構文） */
  mask-composite: exclude;          /* 標準 */
}
```

---

## Scroll-Driven Animations（スクロール方向でヘッダー表示切替）

> 出典: https://coliss.com/articles/build-websites/operation/css/css-hide-header-when-scrolling-down.html
> 執筆日: 不明
> 追加日: 2025-12-17

CSS Scroll-Driven Animations を使用して、スクロール方向に応じてヘッダーを表示/非表示にするテクニック。JavaScript 不要。

### 基本的な仕組み

1. `--scroll-direction` カスタムプロパティでスクロール方向を検出（-1, 0, 1）
2. Style Queries（`@container style()`）で条件付きスタイル適用
3. `transition-delay: calc(infinity * 1s)` で値を固定化

### コード例

```html
<body>
  <header>Header</header>
  <main>コンテンツ...</main>
</body>
```

```css
@property --scroll-direction {
  syntax: "<integer>";
  inherits: true;
  initial-value: 0;
}

html {
  /* スクロール方向を -1, 0, 1 で表現 */
  animation: detect-scroll linear;
  animation-timeline: scroll();
}

@keyframes detect-scroll {
  from {
    --scroll-direction: -1; /* 上方向 */
  }
  to {
    --scroll-direction: 1; /* 下方向 */
  }
}

body {
  container-type: normal;
}

header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  translate: 0 var(--translate, 0);
  transition: translate 0.3s;
}

/* スクロールしていない時: 値を固定 */
@container style(--scroll-direction: 0) {
  header {
    transition-delay: calc(infinity * 1s);
  }
}

/* 上スクロール時: ヘッダー表示 */
@container style(--scroll-direction: -1) {
  header {
    --translate: 0;
  }
}

/* 下スクロール時: ヘッダー非表示 */
@container style(--scroll-direction: 1) {
  header {
    --translate: -100%;
  }
}
```

### 仕組みの解説

1. **スクロール方向の検出**
   - `animation-timeline: scroll()` でスクロール位置をアニメーションにバインド
   - スクロール開始位置で `--scroll-direction: -1`、終了位置で `1`
   - スクロールしていない時は `0`（初期値）

2. **Style Queries による条件分岐**
   - `@container style(--scroll-direction: X)` で値に応じたスタイルを適用
   - `container-type: normal` でサイズクエリなしのスタイルクエリのみ有効化

3. **transition-delay: infinity の活用**
   - スクロールしていない時（`--scroll-direction: 0`）に `infinity * 1s` の遅延
   - 事実上トランジションが発生せず、現在の位置を維持

### ブラウザ対応

| 機能 | Chrome | Firefox | Safari |
|------|--------|---------|--------|
| Scroll-Driven Animations | 115+ | ❌ | ❌ |
| Style Queries | 111+ | ❌ | 18+ |

**注意:** 2025年時点で Chrome のみフルサポート。Firefox、Safari は非対応。

### プログレッシブエンハンスメント

```css
/* フォールバック: 常にヘッダー表示 */
header {
  position: fixed;
  top: 0;
}

/* Scroll-Driven Animations 対応ブラウザのみ */
@supports (animation-timeline: scroll()) {
  html {
    animation: detect-scroll linear;
    animation-timeline: scroll();
  }
  /* ... 以降のスタイル */
}
```

### ユースケース

- 固定ヘッダーのスクロール連動表示
- 下スクロールでツールバーを隠す
- スクロール方向に応じた UI 変化

### メリット

- **JavaScript 不要**: 純粋な CSS 実装
- **パフォーマンス**: スクロールイベントのリスナー不要
- **スムーズ**: ブラウザのネイティブアニメーション

### 注意点

- ブラウザ対応が限定的（Chrome のみ）
- 複雑な条件分岐には向かない
- デバッグが難しい場合がある

---

## 関連ナレッジ

- [CSS @scope](./css-scope.md) - スコープ付きスタイル
- [CSS でウィンドウサイズ取得](./css-viewport-size.md) - @property と三角関数
- [JavaScript アニメーション](./js-animation.md) - 指数平滑法など
