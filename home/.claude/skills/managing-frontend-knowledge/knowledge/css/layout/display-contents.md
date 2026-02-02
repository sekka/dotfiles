---
title: display contents
category: css/layout
tags: [display, contents, flexbox, grid, layout, dom, accessibility, 2024]
browser_support: Chrome 58+, Edge 79+, Safari 11.1+, Firefox 59+
created: 2026-01-31
updated: 2026-01-31
---

# display: contents

> 出典: https://ishadeed.com/article/display-contents/
> 執筆日: 2024年
> 追加日: 2026-01-31

`display: contents` は、要素のボックスを削除しつつ子要素はそのまま保持する特殊なCSS値。レイアウトコンテナ（FlexboxやGrid）と組み合わせることで、不要なラッパー要素を視覚的に「透明」にできる。

## 基本概念

### 通常のボックスモデル

```html
<div class="container">
  <div class="wrapper">
    <p>Item 1</p>
    <p>Item 2</p>
  </div>
</div>
```

```css
.container {
  display: flex;
  gap: 1rem;
}
```

**レンダリング結果:**
- `.container` はFlexコンテナ
- `.wrapper` がFlexアイテム（1つのボックス）
- `<p>` は `.wrapper` の子（Flexレイアウトに直接参加しない）

### display: contents 適用

```css
.wrapper {
  display: contents; /* ボックスを削除 */
}
```

**レンダリング結果:**
- `.wrapper` のボックスが消える
- `<p>` が `.container` の直接の子として扱われる
- `<p>` がFlexアイテムになる

**視覚的には:**
```html
<!-- 実際のDOM -->
<div class="container">
  <div class="wrapper">
    <p>Item 1</p>
    <p>Item 2</p>
  </div>
</div>

<!-- レイアウトツリー上の扱い -->
<div class="container">
  <p>Item 1</p>
  <p>Item 2</p>
</div>
```

## 詳細な使用例

### 1. Flexboxでの不要なラッパー削除

#### 問題: ラッパーがレイアウトを妨げる

```html
<nav class="navbar">
  <div class="logo">Logo</div>
  <div class="nav-links">
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </div>
</nav>
```

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

**問題:**
- `.nav-links` がFlexアイテムになり、リンクがまとまってしまう
- リンク間のスペーシングが難しい

#### 解決策: display: contents

```css
.nav-links {
  display: contents; /* ラッパーを透明化 */
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem; /* リンク間のスペーシング */
}
```

**結果:**
- `.logo` がFlexアイテム
- 各 `<a>` が独立したFlexアイテム
- `gap` がリンク間に適用される

### 2. Grid レイアウトでの応用

#### パターンA: グリッドアイテムのグループ化

```html
<div class="grid">
  <div class="header">Header</div>
  <div class="main-group">
    <div class="sidebar">Sidebar</div>
    <div class="content">Content</div>
  </div>
  <div class="footer">Footer</div>
</div>
```

```css
.grid {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
}

.main-group {
  display: contents; /* グループを透明化 */
}

.header {
  grid-column: 1 / -1; /* 全幅 */
}

.footer {
  grid-column: 1 / -1; /* 全幅 */
}
```

**結果:**
- `.main-group` のボックスが消える
- `.sidebar` と `.content` が直接グリッドアイテムになる
- グリッドレイアウトが意図通りに動作

#### パターンB: 条件付きグループ化

```html
<div class="card-grid">
  <div class="featured">
    <div class="card">Featured 1</div>
    <div class="card">Featured 2</div>
  </div>
  <div class="card">Regular 1</div>
  <div class="card">Regular 2</div>
</div>
```

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

/* デスクトップ: 注目カードをグループ化 */
.featured {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: span 2; /* 2カラム占有 */
}

/* モバイル: グループを解除 */
@media (max-width: 768px) {
  .featured {
    display: contents; /* ラッパーを削除 */
  }
}
```

### 3. セマンティックHTMLとの組み合わせ

#### 問題: dl/dt/dd のスタイリング

```html
<dl class="info-list">
  <div>
    <dt>Name</dt>
    <dd>John Doe</dd>
  </div>
  <div>
    <dt>Email</dt>
    <dd>john@example.com</dd>
  </div>
</dl>
```

**HTML仕様:**
- `<dl>` の直接の子は `<dt>` と `<dd>` であるべき
- しかし、グループ化のため `<div>` でラップしたい

#### 解決策

```css
.info-list {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1rem;
}

.info-list > div {
  display: contents; /* div を透明化 */
}

dt {
  font-weight: bold;
}

dd {
  margin: 0;
}
```

**結果:**
- セマンティクスを保ちつつグループ化
- グリッドレイアウトが正しく適用される

### 4. リスト要素のフラット化

```html
<ul class="tags">
  <li class="tag-group">
    <span class="tag">HTML</span>
    <span class="tag">CSS</span>
  </li>
  <li class="tag-group">
    <span class="tag">JavaScript</span>
  </li>
</ul>
```

```css
.tags {
  display: flex;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
}

.tag-group {
  display: contents; /* li を透明化 */
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #e0e0e0;
  border-radius: 4px;
  font-size: 0.875rem;
}
```

**結果:**
- 各 `.tag` が直接Flexアイテムになる
- グループ化は保ちつつ、視覚的にはフラット

## アクセシビリティ上の注意点

### 問題: セマンティクスの喪失

`display: contents` を適用した要素は、一部のブラウザ（特に古いバージョン）でアクセシビリティツリーから削除される場合がある。

#### 影響を受ける要素

```html
<!-- 問題: button のロールが失われる可能性 -->
<button style="display: contents;">
  <span class="icon">🔍</span>
  <span class="text">Search</span>
</button>

<!-- 問題: list のセマンティクスが失われる -->
<ul style="display: contents;">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

**対策:**

```html
<!-- 明示的にロールを指定 -->
<button style="display: contents;" role="button">
  <span class="icon">🔍</span>
  <span class="text">Search</span>
</button>

<!-- または、div でラップして display: contents を適用 -->
<button>
  <div style="display: contents;">
    <span class="icon">🔍</span>
    <span class="text">Search</span>
  </div>
</button>
```

### 安全な使用パターン

```html
<!-- OK: セマンティック要素にロールを明示 -->
<nav role="navigation" style="display: contents;">
  <a href="#">Link 1</a>
  <a href="#">Link 2</a>
</nav>

<!-- OK: 非セマンティック要素（div, span） -->
<div style="display: contents;">
  <p>Content 1</p>
  <p>Content 2</p>
</div>

<!-- NG: フォーム要素 -->
<fieldset style="display: contents;">
  <!-- アクセシビリティ問題 -->
</fieldset>
```

### ブラウザサポート状況（アクセシビリティ）

| ブラウザ | アクセシビリティツリー対応 |
|----------|--------------------------|
| Chrome 89+ | 修正済み |
| Firefox 70+ | 修正済み |
| Safari 16+ | 修正済み |
| Edge 89+ | 修正済み |

**推奨事項:**
- セマンティック要素には慎重に使用
- 必要に応じて `role` 属性を明示
- スクリーンリーダーでテスト

## パフォーマンス考慮事項

### レンダリングパフォーマンス

`display: contents` は再計算を引き起こす可能性がある。

```css
/* 頻繁に切り替えるのは避ける */
.wrapper {
  display: contents;
}

.wrapper.expanded {
  display: block; /* 再レイアウトが発生 */
}
```

**対策:**
- 静的なレイアウトで使用
- 動的な切り替えが必要な場合は、パフォーマンステストを実施

## ブラウザサポート

| ブラウザ | バージョン | 備考 |
|----------|-----------|------|
| Chrome | 58+ | フル対応 |
| Edge | 79+ | フル対応 |
| Safari | 11.1+ | フル対応 |
| Firefox | 59+ | フル対応 |

**互換性テーブル:**
- IE11: 未対応
- 古いブラウザ向けフォールバック不要（グレースフルデグラデーション）

```css
/* フォールバック不要: display: contents 非対応ブラウザでは通常のブロックとして表示 */
.wrapper {
  display: contents;
}
```

## よくある質問

### Q1. display: contents と visibility: hidden の違いは？

**A:**
- `display: contents`: ボックスのみ削除、子要素は表示
- `visibility: hidden`: 要素全体（子含む）を非表示

```css
/* display: contents */
.wrapper {
  display: contents; /* ボックス削除、子は表示 */
}

/* visibility: hidden */
.wrapper {
  visibility: hidden; /* 要素全体が非表示 */
}
```

### Q2. display: none との違いは？

**A:**
- `display: contents`: 子要素は残る
- `display: none`: 要素全体（子含む）が削除

```css
/* display: contents */
.wrapper {
  display: contents; /* 子要素は表示される */
}

/* display: none */
.wrapper {
  display: none; /* 子要素も削除 */
}
```

### Q3. padding や margin は適用される？

**A:** いいえ、ボックスが削除されるため、padding/margin/border は無視される。

```css
.wrapper {
  display: contents;
  padding: 1rem; /* 無視される */
  margin: 1rem; /* 無視される */
  border: 1px solid red; /* 無視される */
  background: blue; /* 無視される */
}
```

### Q4. flexbox や grid の子要素にも使える？

**A:** はい、Flexアイテムやグリッドアイテムに適用できる。

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.grid-item {
  display: contents; /* このアイテムの子がグリッドアイテムになる */
}
```

## 実践的なパターン

### パターン1: カードグリッドのレスポンシブ対応

```html
<div class="grid">
  <div class="card-group">
    <div class="card">Card 1</div>
    <div class="card">Card 2</div>
  </div>
  <div class="card">Card 3</div>
</div>
```

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* デスクトップ: グループ化 */
@media (min-width: 768px) {
  .card-group {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: span 2;
  }
}

/* モバイル: フラット化 */
@media (max-width: 767px) {
  .card-group {
    display: contents;
  }
}
```

### パターン2: ナビゲーションのモバイル対応

```html
<nav class="navbar">
  <div class="logo">Logo</div>
  <div class="nav-wrapper">
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </div>
</nav>
```

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* デスクトップ: ラッパーを削除 */
@media (min-width: 768px) {
  .nav-wrapper {
    display: contents;
  }

  .navbar {
    gap: 2rem;
  }
}

/* モバイル: ラッパーでグループ化 */
@media (max-width: 767px) {
  .nav-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
```

## まとめ

`display: contents` は、不要なラッパー要素を視覚的に削除する強力なツール。

**使用すべきケース:**
- FlexboxやGridでラッパーが邪魔な場合
- セマンティックHTMLを保ちつつレイアウトを最適化
- レスポンシブデザインでのグループ化/フラット化の切り替え

**注意点:**
- アクセシビリティツリーからの削除に注意
- セマンティック要素には `role` 属性を明示
- padding/margin/border は無視される

**アクセシビリティチェックリスト:**
- [ ] セマンティック要素に適用していないか確認
- [ ] 必要に応じて `role` 属性を追加
- [ ] スクリーンリーダーでテスト

## 関連ナレッジ

- [Flexbox基礎](./flexbox-basics.md)
- [Grid基礎](./grid-basics.md)
- [subgrid](./subgrid.md)
- [アクセシビリティベストプラクティス](../../cross-cutting/accessibility/aria-best-practices.md)

## 参考資料

- [Ahmad Shadeed: CSS display: contents](https://ishadeed.com/article/display-contents/)
- [MDN: display](https://developer.mozilla.org/en-US/docs/Web/CSS/display)
- [Can I use: display: contents](https://caniuse.com/css-display-contents)
- [Accessibility concerns with display: contents](https://hidde.blog/more-accessible-markup-with-display-contents/)
