---
title: gap プロパティ
category: css/layout
tags: [gap, flexbox, grid, spacing, margin, layout, 2024]
browser_support: Chrome 84+, Edge 84+, Safari 14.1+, Firefox 63+
created: 2026-01-31
updated: 2026-01-31
---

# gap プロパティ

> 出典: https://ishadeed.com/article/the-gap/
> 執筆日: 2024年
> 追加日: 2026-01-31

`gap` プロパティは、FlexboxとGridレイアウトにおける要素間のスペーシングを制御する。従来の `margin` ベースのスペーシングと比較して、より直感的で保守性の高いレイアウトを実現できる。

## 基本概念

### 従来の margin によるスペーシング

```html
<div class="container">
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
  <div class="item">Item 3</div>
</div>
```

```css
/* 従来の方法: margin でスペーシング */
.container {
  display: flex;
}

.item {
  margin-right: 1rem; /* 右側にマージン */
}

.item:last-child {
  margin-right: 0; /* 最後の要素のマージンを削除 */
}
```

**問題点:**
- 最後の要素の margin を打ち消す必要がある
- ラップ時に調整が複雑
- コードが冗長

### gap によるスペーシング

```css
.container {
  display: flex;
  gap: 1rem; /* アイテム間のスペーシング */
}

/* .item には何も指定しない */
```

**メリット:**
- シンプルな構文
- 最後の要素の扱いが不要
- ラップ時も自動対応
- 保守性が高い

## 詳細な使用例

### 1. Flexbox での gap

#### 水平方向のスペーシング

```css
.flex-row {
  display: flex;
  gap: 1rem; /* アイテム間に 1rem のスペース */
}
```

**動作:**
- アイテム間に均等なスペース
- 最初と最後のアイテムの外側にはスペースなし

#### 垂直方向のスペーシング

```css
.flex-column {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* アイテム間に 1rem のスペース */
}
```

#### 異なる水平・垂直スペーシング

```css
.flex-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem 1rem; /* 行間: 2rem, 列間: 1rem */
  /* row-gap: 2rem; column-gap: 1rem; と同等 */
}
```

**ショートハンド構文:**
```css
gap: <row-gap> <column-gap>;
```

### 2. Grid での gap

#### 均等なスペーシング

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem; /* 行間・列間ともに 1rem */
}
```

#### 異なる行間・列間

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem 1rem; /* 行間: 2rem, 列間: 1rem */
}

/* または */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  row-gap: 2rem;
  column-gap: 1rem;
}
```

### 3. レスポンシブな gap

```css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem; /* モバイル: 小さいスペース */
}

@media (min-width: 768px) {
  .container {
    gap: 1rem; /* タブレット: 中程度のスペース */
  }
}

@media (min-width: 1024px) {
  .container {
    gap: 2rem; /* デスクトップ: 大きいスペース */
  }
}
```

**clamp() との組み合わせ:**

```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: clamp(1rem, 2vw, 2rem); /* 1rem ~ 2rem の間で可変 */
}
```

### 4. 実践的なパターン

#### パターンA: カードグリッド

```html
<div class="card-grid">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
  <div class="card">Card 4</div>
</div>
```

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem; /* カード間のスペース */
}

.card {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

#### パターンB: ナビゲーションメニュー

```html
<nav class="navbar">
  <a href="#">Home</a>
  <a href="#">About</a>
  <a href="#">Services</a>
  <a href="#">Contact</a>
</nav>
```

```css
.navbar {
  display: flex;
  gap: 2rem; /* リンク間のスペース */
  padding: 1rem;
  background: #333;
}

.navbar a {
  color: white;
  text-decoration: none;
}
```

#### パターンC: フォームレイアウト

```html
<form class="form">
  <div class="form-group">
    <label for="name">Name</label>
    <input type="text" id="name">
  </div>
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email">
  </div>
  <button type="submit">Submit</button>
</form>
```

```css
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* フォーム要素間のスペース */
  max-width: 400px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* ラベルと入力欄のスペース */
}

input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```

#### パターンD: タグリスト

```html
<div class="tags">
  <span class="tag">HTML</span>
  <span class="tag">CSS</span>
  <span class="tag">JavaScript</span>
  <span class="tag">React</span>
</div>
```

```css
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem; /* タグ間のスペース */
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #e0e0e0;
  border-radius: 4px;
  font-size: 0.875rem;
}
```

### 5. 高度な応用例

#### パターンA: 非対称グリッド

```css
.asymmetric-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  gap: 2rem 1rem; /* 行間: 2rem, 列間: 1rem */
}

.large {
  grid-row: span 2; /* 2行にまたがる */
}
```

#### パターンB: サイドバーレイアウト

```css
.layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem; /* サイドバーとメインコンテンツの間 */
  min-height: 100vh;
}

.sidebar {
  background: #f5f5f5;
  padding: 1rem;
}

.main {
  padding: 1rem;
}
```

#### パターンC: 聖杯レイアウト（Holy Grail）

```css
.holy-grail {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  gap: 1rem; /* 全ての要素間にスペース */
  min-height: 100vh;
}

.header { grid-area: header; }
.nav { grid-area: nav; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
```

## margin との比較

### margin ベースのスペーシング

```css
/* 従来の方法 */
.container {
  display: flex;
  flex-wrap: wrap;
  margin: -0.5rem; /* ネガティブマージンで相殺 */
}

.item {
  margin: 0.5rem; /* 全方向にマージン */
}
```

**問題点:**
- ネガティブマージンが必要
- コンテナの幅計算が複雑
- 保守性が低い

### gap ベースのスペーシング

```css
/* gap を使用 */
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem; /* シンプル */
}

/* .item には何も指定しない */
```

**メリット:**
- ネガティブマージン不要
- コンテナの幅が直感的
- 保守性が高い

### パフォーマンス比較

```css
/* margin: 要素ごとに計算 */
.item {
  margin-right: 1rem;
}
.item:last-child {
  margin-right: 0; /* セレクタの再計算 */
}

/* gap: コンテナで一括計算 */
.container {
  gap: 1rem; /* 計算が効率的 */
}
```

## アクセシビリティ考慮事項

### 1. 十分なタッチターゲット間隔

```css
/* モバイル: タッチターゲット間に十分なスペース */
.nav {
  display: flex;
  gap: 1rem; /* 最低44pxのタッチターゲット + スペース */
}

.nav a {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 2. フォーカス表示の確保

```css
.nav {
  display: flex;
  gap: 0.5rem; /* フォーカスリングが重ならないスペース */
}

.nav a:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px; /* アウトラインとアイテムの間隔 */
}
```

### 3. リーディング（行間）の最適化

```css
.text-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem; /* 列間を広く */
}

.text-columns p {
  line-height: 1.6; /* 読みやすい行間 */
}
```

## ブラウザサポート

### Flexbox での gap

| ブラウザ | バージョン |
|----------|-----------|
| Chrome | 84+ |
| Edge | 84+ |
| Safari | 14.1+ |
| Firefox | 63+ |

### Grid での gap

| ブラウザ | バージョン |
|----------|-----------|
| Chrome | 57+ |
| Edge | 16+ |
| Safari | 10.1+ |
| Firefox | 52+ |

**フォールバック（Flexbox）:**

```css
/* 古いブラウザ: margin */
.container {
  display: flex;
  flex-wrap: wrap;
  margin: -0.5rem; /* ネガティブマージン */
}

.item {
  margin: 0.5rem;
}

/* モダンブラウザ: gap */
@supports (gap: 1rem) {
  .container {
    margin: 0;
    gap: 1rem;
  }

  .item {
    margin: 0;
  }
}
```

## よくある質問

### Q1. gap は padding の代わりになるのか？

**A:** いいえ、gap は要素間のスペース、padding は要素内部のスペース。

```css
.container {
  display: flex;
  gap: 1rem; /* 要素間 */
  padding: 2rem; /* コンテナ内部 */
}

.item {
  padding: 1rem; /* アイテム内部 */
}
```

### Q2. gap は negative（負の値）にできるのか？

**A:** いいえ、gap は負の値を持てない。

```css
.container {
  gap: -1rem; /* 無効 */
  gap: 1rem; /* 有効 */
}
```

### Q3. gap はパーセント値が使えるのか？

**A:** はい、パーセント値も使用可能。

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5%; /* コンテナ幅の5% */
}
```

### Q4. row-gap と column-gap の違いは？

**A:**
- `row-gap`: 行間のスペース（縦方向）
- `column-gap`: 列間のスペース（横方向）
- `gap`: 両方のショートハンド

```css
/* ショートハンド */
.container {
  gap: 2rem 1rem; /* row-gap: 2rem, column-gap: 1rem */
}

/* 個別指定 */
.container {
  row-gap: 2rem;
  column-gap: 1rem;
}
```

### Q5. gap と justify-content の違いは？

**A:**
- `gap`: 要素間のスペース
- `justify-content`: 余白の配分方法

```css
/* gap: 要素間に固定スペース */
.container {
  display: flex;
  gap: 1rem;
}

/* justify-content: 余白を均等配分 */
.container {
  display: flex;
  justify-content: space-between; /* 要素間に均等な余白 */
}

/* 併用も可能 */
.container {
  display: flex;
  gap: 1rem; /* 最小スペース */
  justify-content: space-between; /* 余白があればさらに配分 */
}
```

## パフォーマンス考慮事項

### レイアウトの再計算

`gap` はレイアウトプロパティのため、変更時に再計算が発生する。

```css
/* アニメーション非推奨 */
.container {
  gap: 1rem;
  transition: gap 0.3s; /* レイアウトシフトが発生 */
}

.container:hover {
  gap: 2rem; /* 再計算が発生 */
}
```

**対策:**
- アニメーションは `transform` や `opacity` で実装
- `gap` の動的変更は最小限に

### CSS 変数との組み合わせ

```css
:root {
  --gap-sm: 0.5rem;
  --gap-md: 1rem;
  --gap-lg: 2rem;
}

.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--gap-md); /* CSS変数で一括管理 */
}

@media (min-width: 768px) {
  .container {
    gap: var(--gap-lg);
  }
}
```

## まとめ

`gap` プロパティは、FlexboxとGridレイアウトにおけるスペーシングをシンプルかつ保守的に実装できる。

**使用すべきケース:**
- Flexboxでの要素間スペーシング
- Gridでの行間・列間スペーシング
- レスポンシブなスペーシング調整

**メリット:**
- `margin` ベースより直感的
- 最後の要素の扱いが不要
- ラップ時も自動対応
- コードが簡潔

**注意点:**
- Flexbox の `gap` は Chrome 84+ から対応
- 負の値は使用不可
- アニメーションは非推奨（レイアウトシフト）

**比較表:**

| 項目 | margin | gap |
|------|--------|-----|
| 構文 | 冗長 | シンプル |
| 最後の要素 | 打ち消しが必要 | 不要 |
| ラップ対応 | 複雑 | 自動 |
| パフォーマンス | やや劣る | 優れる |
| ブラウザサポート | 古いブラウザ対応 | モダンブラウザのみ |

## 関連ナレッジ

- [Flexbox 基礎](./flexbox-basics.md)
- [Grid 基礎](./grid-basics.md)
- [レスポンシブスペーシング](../values/responsive-spacing.md)
- [CSS 変数](../modern/css-variables.md)

## 参考資料

- [Ahmad Shadeed: CSS gap](https://ishadeed.com/article/the-gap/)
- [MDN: gap](https://developer.mozilla.org/en-US/docs/Web/CSS/gap)
- [Can I use: gap for flexbox](https://caniuse.com/flexbox-gap)
- [Can I use: gap for grid](https://caniuse.com/css-grid)
