---
title: CSS レイアウト基礎
category: css/layout
tags: [grid, flexbox, layout, positioning, subgrid]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

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

#### Subgrid でリンクの入れ子を実現

> 出典: https://zenn.dev/ixkaito/articles/nested-links-using-subgrid
> 執筆日: 2024年3月28日
> 追加日: 2026-01-19

カード全体をクリッカブルにしながら、内部のタグリンクも独立して機能させるパターン。

```html
<div class="card">
  <a href="/article/1" class="link">
    <h2>記事タイトル</h2>
    <p>記事の説明文...</p>
    <div class="tags">
      <a href="/tag/css">CSS</a>
      <a href="/tag/html">HTML</a>
    </div>
  </a>
</div>
```

```css
/* 親グリッド */
.card {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 16px;
  padding: 20px;
  border: 1px solid #ccc;
}

/* カード全体リンク */
.link {
  grid-row: 1 / 4; /* 全行を占有 */
  display: grid;
  grid-template-rows: subgrid; /* 親のグリッドトラックを継承 */
  text-decoration: none;
  color: inherit;
}

/* タグリンク領域 */
.tags {
  pointer-events: none; /* リンクの入れ子を無効化 */
}

.tags a {
  pointer-events: auto; /* タグリンクのみ有効化 */
}
```

**ポイント:**
- `.link` が `grid-row: 1 / 4` で全体を覆う
- `grid-template-rows: subgrid` で親のグリッド構造を継承
- `pointer-events` でクリックイベントを制御

**アクセシビリティ:**
- セマンティックな HTML 構造を維持
- Tab キーによるフォーカス移動が自然
- スクリーンリーダーで正しく読み上げられる

### gap（Flexbox / Grid 共通）

> 出典（追加情報）: https://zenn.dev/tonkotsuboy_com/articles/2021-css-new-features
> Flexbox での gap サポート: Safari 14（2021年4月）で全モダンブラウザ対応完了

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

#### 歴史的背景

- **Grid**: 当初から `gap` が使用可能
- **Flexbox**: Safari 14（2021年4月）で対応完了
- Chrome 84, Firefox 63 では先行してサポート

#### 従来の方法（margin ハック）との比較

**従来の方法:**

```css
.flex-container {
  display: flex;
  flex-wrap: wrap;
  margin: -10px; /* ネガティブマージン */
}

.flex-item {
  margin: 10px;
}
```

**問題点:**
- 親要素にネガティブマージンが必要
- 最初/最後の要素の扱いが複雑
- 複数行レイアウトでの余白調整が困難

**gap を使った方法（推奨）:**

```css
.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px; /* シンプル */
}

/* 子要素に margin 不要 */
.flex-item {
  /* margin なし */
}
```

#### 複数行Flexboxでの使用例

```css
/* カードグリッド */
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card {
  flex: 1 1 calc(33.333% - 14px); /* gap を考慮した幅計算 */
  min-width: 250px;
}
```

**ポイント:**
- `gap` は要素間にのみ適用される（最初/最後の要素の外側には適用されない）
- `flex-wrap: wrap` との組み合わせで、複数行の余白も自動調整

#### row-gap / column-gap の個別指定

```css
.flex-horizontal {
  display: flex;
  column-gap: 20px; /* 水平方向のみ */
}

.flex-vertical {
  display: flex;
  flex-direction: column;
  row-gap: 20px; /* 垂直方向のみ */
}

.flex-both {
  display: flex;
  flex-wrap: wrap;
  row-gap: 30px; /* 行間 */
  column-gap: 20px; /* 列間 */
}

/* 短縮記法 */
.flex-both {
  display: flex;
  flex-wrap: wrap;
  gap: 30px 20px; /* row column */
}
```

#### ブラウザ対応

- **Grid での gap**: 全モダンブラウザ対応
- **Flexbox での gap**:
  - Chrome 84+ (2020年7月)
  - Firefox 63+ (2018年10月)
  - Safari 14+ (2021年4月) ← 最後に対応
  - Edge 84+

**現在:** 全モダンブラウザで安心して使用可能

### Flexbox/Grid の子要素オーバーフロー対策

> 出典: https://qiita.com/hrel11/items/fe402e3a7ed63d8cbe58
> 執筆日: 2025年11月10日
> 追加日: 2026-01-19

Flexbox や Grid の子要素が親からはみ出る問題の解決策。

#### 問題の原因

```css
/* ❌ 子要素が親をはみ出す */
.flex-container {
  display: flex;
}

.flex-item {
  /* min-width のデフォルト値は auto */
  /* コンテンツ幅を基準にするため、親を超える */
}
```

Flexbox/Grid の子要素は `min-width: auto`（デフォルト）により、コンテンツの最小幅を維持しようとする。そのため、長いテキストや画像が親をはみ出す。

#### 解決策：3つのフェーズ

**Phase 1: min-width: 0 を設定**

```css
/* ✅ 子要素が親に収まる */
.flex-container {
  display: flex;
}

.flex-item {
  min-width: 0; /* または Tailwind: min-w-0 */
}
```

**Phase 2: テキストの扱いを選択**

```css
/* テキストを折り返す */
.flex-item {
  min-width: 0;
  overflow-wrap: break-word; /* または Tailwind: wrap-break-word */
}

/* スクロール可能にする */
.flex-item {
  min-width: 0;
  overflow-x: scroll;
}

/* 省略記号で切り詰める */
.flex-item {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; /* または Tailwind: truncate */
}
```

**Phase 3: overflow 制御**

```css
/* 見切れた部分を非表示 */
.flex-item {
  min-width: 0;
  overflow: hidden; /* または Tailwind: overflow-hidden */
}
```

#### 実践例

```html
<div class="flex-container">
  <div class="flex-item">
    <p>とても長いテキストが入ります...</p>
  </div>
</div>
```

```css
.flex-container {
  display: flex;
  width: 300px;
}

.flex-item {
  min-width: 0; /* Step 1 */
  overflow-wrap: break-word; /* Step 2 */
  overflow: hidden; /* Step 3 */
}
```

#### Grid でも同様

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.grid-item {
  min-width: 0; /* Grid でも必要 */
}
```

#### Tailwind CSS での実装

```html
<!-- Tailwind の場合 -->
<div class="flex">
  <div class="min-w-0 overflow-hidden truncate">
    長いテキスト...
  </div>
</div>
```

**注意**: `min-width: 0` を設定すると、子要素は親の幅を超えないが、コンテンツがはみ出る可能性がある。必ず Phase 2/3 の対処も併用すること。

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
詳細は [Full-Bleed レイアウト](./full-bleed-layout.md) を参照。

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

- [Full-Bleed レイアウト](./full-bleed-layout.md) - コンテナクエリを使った全幅レイアウト
- [Grid Layout 詳細](./grid-advanced.md)
- [Flexbox パターン](./flexbox-patterns.md)
