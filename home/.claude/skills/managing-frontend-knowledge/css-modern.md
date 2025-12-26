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

### shape() 関数（clip-path の新しい記法）

> 出典: https://ics.media/entry/250703/
> 執筆日: 2025-07-03
> 追加日: 2025-12-17

2025年に追加された `shape()` 関数。従来の `path()` より扱いやすい設計。

**従来の path() との違い:**

| 機能 | path() | shape() |
|------|--------|---------|
| 単位 | SVG 座標のみ | px, %, em, rem 等 |
| calc() | ❌ | ✅ |
| CSS 変数 | ❌ | ✅ |
| 構文 | SVG パス文法 | コマンドベース |

**使用可能なコマンド:**

| コマンド | 説明 | 例 |
|----------|------|-----|
| `from` | 描画開始点 | `from 0% 0%` |
| `move` | 次のコマンド位置 | `move to 50% 50%` |
| `line` | 直線描画 | `line to 100% 0%` |
| `curve` | ベジェ曲線 | `curve to 100% 100% with 50% 0%` |
| `smooth` | 滑らかな曲線接続 | `smooth to 0% 100%` |
| `arc` | 円弧描画 | `arc to 100% 50% of 50px` |
| `close` | 描画終了（始点に戻る） | `close` |

**基本構文:**

```css
.element {
  clip-path: shape(from 0% 0%, line to 100% 0%, line to 100% 100%, close);
}
```

**角丸な額縁風クリッピング:**

```css
.frame {
  --radius: 20px;
  --border: 10px;

  clip-path: shape(
    /* 外側の角丸矩形 */
    from var(--radius) 0%,
    line to calc(100% - var(--radius)) 0%,
    arc to 100% var(--radius) of var(--radius),
    line to 100% calc(100% - var(--radius)),
    arc to calc(100% - var(--radius)) 100% of var(--radius),
    line to var(--radius) 100%,
    arc to 0% calc(100% - var(--radius)) of var(--radius),
    line to 0% var(--radius),
    arc to var(--radius) 0% of var(--radius),
    close
  );
}
```

**波形クリッピング:**

```css
.wave {
  clip-path: shape(
    from 0% 100%,
    line to 0% 30%,
    curve to 50% 30% with 25% 0%,
    curve to 100% 30% with 75% 60%,
    line to 100% 100%,
    close
  );
}
```

**アニメーション対応:**

```css
.morph {
  clip-path: shape(from 0% 0%, line to 100% 0%, line to 100% 100%, line to 0% 100%, close);
  transition: clip-path 0.5s ease;
}

.morph:hover {
  clip-path: shape(from 50% 0%, line to 100% 50%, line to 50% 100%, line to 0% 50%, close);
}
```

**CSS 変数との組み合わせ（インタラクティブ）:**

```css
.spotlight {
  --x: 50%;
  --y: 50%;
  --size: 100px;

  clip-path: shape(
    /* 星型などの複雑な形状を --x, --y を中心に配置 */
    from calc(var(--x) - var(--size)) var(--y),
    line to calc(var(--x) + var(--size)) var(--y),
    /* ... */
    close
  );
}
```

```javascript
// マウス追従
element.addEventListener('mousemove', (e) => {
  const rect = element.getBoundingClientRect();
  element.style.setProperty('--x', `${e.clientX - rect.left}px`);
  element.style.setProperty('--y', `${e.clientY - rect.top}px`);
});
```

**ブラウザ対応:**

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 135+（2025年4月） |
| Safari | 18.4+（2025年3月） |
| Firefox | Nightly のみ |

**プログレッシブエンハンスメント:**

```css
/* フォールバック: 基本的な polygon */
.element {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

/* shape() 対応ブラウザのみ */
@supports (clip-path: shape(from 0 0, line to 0 0)) {
  .element {
    clip-path: shape(/* ... */);
  }
}
```

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

### Noto Sans JP 実装ガイド

> 出典: https://ics.media/entry/250718/
> 執筆日: 2025-07-18
> 追加日: 2025-12-17

2025年現在の Noto Sans JP の OS 搭載状況と最適な実装方法。

**OS 搭載状況（2025年）:**

| OS | 搭載状況 |
|----|----------|
| Windows 11 | ✅ Noto Sans JP + Noto Serif JP（バリアブル） |
| Windows 10 | ✅ 2025年4月アップデートで追加 |
| Android 15+ | ✅ Noto Sans CJK JP（バリアブル） |
| Android 14以前 | △ 固定ウェイトのみ |
| iOS/macOS | ❌ 未搭載（ウェブフォント必須） |

**Apple 環境の制約:**
- iOS/macOS には Noto Sans JP 未搭載
- Safari は `local()` 参照をブロックするため、ウェブフォント導入が必須

**Google Fonts での導入:**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap" rel="stylesheet">
```

```css
body {
  font-family: "Noto Sans JP", sans-serif;
}
```

**ローカルフォント優先（パフォーマンス重視）:**

Windows/Android ではローカルフォントを優先し、Apple 環境のみウェブフォントを配信。

```css
/* ローカルフォントを先に参照 */
@font-face {
  font-family: "Local Noto Sans JP";
  src: local("Noto Sans JP");
}

body {
  font-family: "Local Noto Sans JP", "Noto Sans JP", sans-serif;
}
```

**font-feature-settings 対応状況:**

| 機能 | Google Fonts | Windows/Android 搭載版 |
|------|--------------|------------------------|
| `palt`（プロポーショナル詰め） | ✅ | ✅ |
| `pwid`（プロポーショナル幅） | ❌ | ✅ |

```css
/* プロポーショナル詰め */
.tight {
  font-feature-settings: "palt" 1;
}
```

**実装方針の選択:**

| 方針 | メリット | デメリット |
|------|----------|------------|
| Google Fonts 統一 | 全環境で一貫した表示 | 配信容量増加 |
| ローカル優先 | 高速表示（Windows/Android） | Apple 環境で追加読み込み |
| sans-serif のみ | 最速、フォント読み込みなし | OS によってフォントが異なる |

**推奨設定（バランス型）:**

```css
@font-face {
  font-family: "Noto Sans JP";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: local("Noto Sans JP"),
       url(https://fonts.gstatic.com/...) format("woff2");
}

body {
  font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN",
               "Hiragino Sans", Meiryo, sans-serif;
}
```

**注意点:**
- Adobe Fonts では「源ノ角ゴシック」として提供
- バリアブルフォントは `wght@100..900` で全ウェイト指定可能
- `font-display: swap` で FOIT（Flash of Invisible Text）を回避

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

## text-box（テキスト上下の余白調整）

> 出典: https://ics.media/entry/250319/
> 執筆日: 2025-03-19
> 追加日: 2025-12-17

テキスト要素の上下に生じる余分なスペース（ハーフ・レディング）を調整するプロパティ。2024年末〜2025年初頭に主要ブラウザでサポート。

### ハーフ・レディングとは

`line-height` 指定時、フォントサイズより行全体が大きくなると余分なスペースが発生。

```
例: font-size: 60px, line-height: 2 の場合
行の高さ: 120px
レディング: 120px - 60px = 60px
ハーフ・レディング: 60px ÷ 2 = 30px（上下それぞれに追加）
```

この余白がデザイン上の「ズレ」の原因になる。

### プロパティ

**text-box-trim**: どこをトリムするか

| 値 | 説明 |
|----|------|
| `none` | 初期値（トリムしない） |
| `trim-both` | 上下両方をトリム |
| `trim-start` | 上側のみトリム |
| `trim-end` | 下側のみトリム |

**text-box-edge**: トリムの基準線

| 値 | 説明 |
|----|------|
| `text` | フォントのアセンダー/ディセンダーライン基準 |
| `cap` | 英大文字の上限を基準 |
| `alphabetic` | 英小文字の下限（ベースライン）を基準 |
| `ex` | 英小文字 x の高さを基準 |

### ショートハンド構文

```css
/* text-box: <trim値> <上の基準> <下の基準> */
.text {
  text-box: trim-both cap alphabetic;
}

/* 上下同じ基準の場合は1つでOK */
.text {
  text-box: trim-both text;
}
```

### 実用例

**背景付きラベルのテキスト中央揃え**

```css
/* 従来: テキストが数px下にずれる */
.label {
  padding: 8px 16px;
  background: #333;
  color: white;
}

/* text-box使用: 上下均等に配置 */
.label {
  padding: 8px 16px;
  background: #333;
  color: white;
  text-box: trim-both cap alphabetic;
}
```

**アイコン + テキストの垂直中央揃え**

```css
.button {
  display: flex;
  align-items: center;
  gap: 8px;
}

.button-text {
  text-box: trim-both cap alphabetic;
}
```

**見出しの上下余白を詰める**

```css
h1 {
  font-size: 3rem;
  line-height: 1.2;
  text-box: trim-both cap alphabetic;
  margin-block: 0;
}
```

### ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 133+（2025年2月） |
| Safari | 18.2+（2024年12月） |
| Firefox | ❌ 未対応 |

### プログレッシブエンハンスメント

```css
.label {
  padding: 12px 16px; /* フォールバック: 余裕を持たせる */
}

@supports (text-box: trim-both cap alphabetic) {
  .label {
    padding: 8px 16px;
    text-box: trim-both cap alphabetic;
  }
}
```

### 注意点

- **フォントによる差異**: フォントごとにメトリクスが異なるため、見え方が変わる場合がある
- **日本語フォント**: Noto Sans Japanese 等では完全な統一が困難なケースも
- **継承**: 子要素にも影響するため、必要な箇所のみに適用

### ユースケース

- タグ/ラベルのテキスト中央配置
- アイコンとテキストの垂直揃え
- 見出しの余白最適化
- ボタン内テキストの位置調整
- カード内の要素配置

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

## 2024年の CSS 新機能まとめ

> 出典: https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> 執筆日: 2024年
> 追加日: 2025-12-17

### field-sizing プロパティ

コンテンツに応じて入力フィールドが自動サイズ変更される機能。JavaScript 不要。

```css
textarea, select, input {
  field-sizing: content;
}
```

**ブラウザ対応:** Chrome 123+, Firefox (Nightly), Safari (未対応)

### interpolate-size プロパティ

`height: auto` や `width: auto` へのアニメーションを実現。

```css
:root {
  interpolate-size: allow-keywords;
}

.accordion-content {
  height: 0;
  overflow: hidden;
  transition: height 0.3s;
}

.accordion.open .accordion-content {
  height: auto;
}
```

**ブラウザ対応:** Chrome 129+

### details 要素の排他的アコーディオン

複数の `details` 要素に同じ `name` 属性を付与すると、1つ開くと他は自動で閉じる。

```html
<details name="faq">
  <summary>質問1</summary>
  <p>回答1</p>
</details>
<details name="faq">
  <summary>質問2</summary>
  <p>回答2</p>
</details>
<details name="faq">
  <summary>質問3</summary>
  <p>回答3</p>
</details>
```

**ブラウザ対応:** Chrome 120+, Firefox 130+, Safari 17.2+

### ::details-content 疑似要素

details 要素のコンテンツ部分をスタイリング。水平レイアウトも可能に。

```css
details::details-content {
  padding: 1rem;
  background: #f5f5f5;
  transition: height 0.3s;
}

/* 水平アコーディオン */
details {
  display: flex;
  flex-direction: row;
}

details::details-content {
  width: 0;
  overflow: hidden;
}

details[open]::details-content {
  width: auto;
}
```

**ブラウザ対応:** Chrome 131+

### Anchor Positioning

要素を他の要素に相対的に配置する宣言的方法。ポップオーバーやツールチップに最適。

```css
/* アンカー要素 */
.anchor {
  anchor-name: --my-anchor;
}

/* 配置される要素 */
.tooltip {
  position: fixed;
  position-anchor: --my-anchor;
  position-area: block-end;  /* アンカーの下に配置 */
}

/* position-area の値 */
/* block-start, block-end, inline-start, inline-end など */
```

**ブラウザ対応:** Chrome 125+, Firefox (フラグ), Safari (未対応)

### scrollbar-color と scrollbar-width

標準化されたスクロールバーのスタイル設定。

```css
.scroller {
  scrollbar-color: hotpink navy;  /* thumb track */
  scrollbar-width: thin;          /* auto | thin | none */
}

/* ダークモード対応 */
.scroller {
  scrollbar-color: light-dark(#888 #eee, #666 #222);
}
```

**ブラウザ対応:** Chrome 121+, Firefox 64+, Safari 未対応（一部）

### @view-transition 規則

クロスドキュメント間（MPA）でのビューアニメーション。SPA 化せずにページ遷移アニメーション。

```css
/* 両方のページで定義 */
@view-transition {
  navigation: auto;
}

/* トランジション対象の指定 */
.hero-image {
  view-transition-name: hero;
}

/* アニメーションのカスタマイズ */
::view-transition-old(hero) {
  animation: fade-out 0.3s ease-out;
}

::view-transition-new(hero) {
  animation: fade-in 0.3s ease-in;
}
```

**ブラウザ対応:** Chrome 126+, Safari 18+

### スクロールスナップイベント

JavaScript でスクロールスナップの完了を検知。

```javascript
const container = document.querySelector('.snap-container');

// スナップ完了時
container.addEventListener('scrollsnapchange', (e) => {
  console.log('Snapped to:', e.snapTargetBlock, e.snapTargetInline);
});

// スナップ途中（ターゲットが変わった時）
container.addEventListener('scrollsnapchanging', (e) => {
  console.log('Snapping to:', e.snapTargetBlock, e.snapTargetInline);
});
```

**ブラウザ対応:** Chrome 129+

### ::backdrop 疑似要素の改善

ダイアログ要素のカスタムプロパティへアクセス可能に。

```css
dialog {
  --backdrop-color: rgba(0, 0, 0, 0.5);
}

dialog::backdrop {
  background: var(--backdrop-color);  /* Chrome 122+ で動作 */
}
```

**ブラウザ対応:** Chrome 122+

### light-dark() 関数

ライト/ダークテーマの値を一括指定。

```css
:root {
  color-scheme: light dark;  /* 必須: light-dark() を有効化 */
}

body {
  background-color: light-dark(#ffffff, #1a1a1a);
  color: light-dark(#333333, #f0f0f0);
}

.card {
  border: 1px solid light-dark(#e0e0e0, #404040);
  box-shadow: 0 2px 4px light-dark(rgba(0,0,0,0.1), rgba(0,0,0,0.3));
}
```

**ブラウザ対応:** Chrome 123+, Firefox 120+, Safari 17.5+

### Popover API

JavaScript 不要でポップオーバーを実装。

```html
<button popovertarget="menu">メニューを開く</button>
<div id="menu" popover>
  <p>ポップオーバーの内容</p>
</div>
```

```css
/* ポップオーバーのスタイル */
[popover] {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 開閉アニメーション */
[popover] {
  opacity: 0;
  transition: opacity 0.3s, display 0.3s allow-discrete;
}

[popover]:popover-open {
  opacity: 1;
}

/* 開始時スタイル */
@starting-style {
  [popover]:popover-open {
    opacity: 0;
  }
}
```

**属性:**
- `popover` または `popover="auto"`: 他のポップオーバーを自動で閉じる
- `popover="manual"`: 手動で閉じるまで開いたまま

**ブラウザ対応:** Chrome 114+, Firefox 125+, Safari 17+

### @starting-style 規則

要素の初期スタイルを定義し、表示時のトランジションを実現。

```css
dialog {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s, transform 0.3s, display 0.3s allow-discrete;
}

/* 非表示時 */
dialog:not([open]) {
  opacity: 0;
  transform: translateY(-20px);
}

/* 表示開始時のスタイル（ここからトランジション） */
@starting-style {
  dialog[open] {
    opacity: 0;
    transform: translateY(-20px);
  }
}
```

**ブラウザ対応:** Chrome 117+, Safari 17.5+, Firefox 129+

### ruby-align プロパティ

ルビテキストの配置を制御。

```css
ruby {
  ruby-align: space-between;  /* center | space-around | space-between | start */
}
```

**ブラウザ対応:** Chrome 128+

### paint-order プロパティ

テキストストロークの描画順序を制御。

```css
/* ストロークを塗りの後ろに */
h1 {
  paint-order: stroke fill;
  color: white;
  -webkit-text-stroke: 4px black;
}
```

| 値 | 説明 |
|----|------|
| `normal` | fill → stroke → markers（デフォルト） |
| `stroke fill` | stroke → fill → markers |
| `fill stroke markers` | 明示的に順序指定 |

**ブラウザ対応:** 主要ブラウザ対応済み

### CSS ネストの仕様改善

`CSSNestedDeclarations` インターフェイスで、ルール内の宣言配置が正規化。

```css
/* 改善後: 宣言の順序が直感的に */
.card {
  padding: 1rem;

  &:hover {
    background: #f0f0f0;
  }

  /* ネストの後に宣言を書いても正しく適用 */
  border-radius: 8px;
}
```

---

## 関連ナレッジ

- [CSS @scope](./css-scope.md) - スコープ付きスタイル
- [CSS でウィンドウサイズ取得](./css-viewport-size.md) - @property と三角関数
- [JavaScript アニメーション](./js-animation.md) - 指数平滑法など
