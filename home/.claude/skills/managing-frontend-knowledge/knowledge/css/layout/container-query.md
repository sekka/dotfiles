---
title: CSS Container Query（コンテナクエリ）
category: css/layout
tags: [container-query, responsive, component, @container, container-type]
browser_support: Chrome 106+, Safari 16+, Firefox 110+
created: 2025-01-16
updated: 2025-01-16
---

# CSS Container Query（コンテナクエリ）

> 出典: https://ics.media/entry/240617/
> 執筆日: 2024年6月21日（最終更新: 2024年11月22日）
> 追加日: 2025-01-16

## 概要

**Container Query（コンテナクエリ）** は、要素の幅に基づいてスタイルを適用できる CSS の新機能。従来のメディアクエリがビューポート（ブラウザ幅）を基準とするのに対し、**親要素の幅を基準**にできるため、再利用性の高いコンポーネント設計が可能になる。

## メディアクエリとの違い

| 項目 | メディアクエリ | Container Query |
|------|--------------|-----------------|
| 基準 | ビューポート幅 | 親要素の幅 |
| 用途 | ページ全体のレスポンシブ | コンポーネント単位のレスポンシブ |
| 再利用性 | 低い（配置場所に依存） | 高い（親の幅に応じて自動調整） |
| 複数カラム対応 | 困難 | 容易 |

**メディアクエリの問題**:
```css
/* ❌ ビューポート基準なので、親の幅は関係ない */
@media (max-width: 640px) {
  .card {
    flex-direction: column;
  }
}
```

2カラムレイアウトの中では、ビューポート幅が大きくても個々のカラム幅は狭い。メディアクエリでは対応できない。

**Container Queryの解決**:
```css
/* ✅ 親要素の幅を基準にできる */
@container (width <= 640px) {
  .card {
    flex-direction: column;
  }
}
```

親の幅が640px以下なら縦並び、それ以上なら横並びになる。配置場所に関係なく動作する。

## 基本的な使い方

### 1. 親要素に `container-type` を設定

```css
.item_wrapper {
  container-type: inline-size;
}
```

### 2. `@container` で条件を指定

```css
@container (width <= 320px) {
  .item {
    background-color: #222;
    color: #fff;
  }
}
```

### 完全な実装例

```html
<div class="item_wrapper">
  <article class="item">
    <h2>記事タイトル</h2>
    <p>本文...</p>
  </article>
</div>
```

```css
/* コンテナ設定 */
.item_wrapper {
  container-type: inline-size;
}

/* 640px以下: 縦並び */
@container (width <= 640px) {
  .item {
    flex-direction: column;
  }
  .item h2 {
    font-size: 1.2rem;
  }
}

/* 641px以上: 横並び */
@container (width > 640px) {
  .item {
    flex-direction: row;
    gap: 2rem;
  }
  .item h2 {
    font-size: 1.5rem;
  }
}
```

## container-type プロパティ

| 値 | 説明 | ユースケース |
|----|------|-------------|
| `inline-size` | インライン方向の幅を基準 | 横書き文書では水平方向の幅 |
| `size` | width/heightプロパティの幅を基準 | 明示的なサイズ指定が必要な場合 |
| `normal` | 通常のブロック要素（デフォルト） | コンテナクエリを使わない |

**推奨**: `inline-size` を使用（言語・書字方向に依存しない）

### inline-size と size の違い

```css
/* inline-size: テキスト方向の幅 */
.container {
  container-type: inline-size;
  /* 横書きなら水平方向、縦書きなら垂直方向 */
}

/* size: width/heightを基準 */
.container {
  container-type: size;
  width: 100%;  /* widthを明示的に指定する必要がある */
}
```

## 実践的なユースケース

### 1. 再利用可能なカードコンポーネント

```css
/* カードコンポーネントの親 */
.card-wrapper {
  container-type: inline-size;
}

/* 狭い場所: 縦並び */
@container (width <= 320px) {
  .card {
    flex-direction: column;
  }
  .card img {
    width: 100%;
  }
}

/* 広い場所: 横並び */
@container (width > 320px) {
  .card {
    flex-direction: row;
  }
  .card img {
    width: 40%;
  }
}
```

このカードは、1カラムでも2カラムでも、親の幅に応じて自動的に最適なレイアウトになる。

### 2. 複数カラムレイアウト

```html
<div class="layout">
  <aside class="sidebar">
    <div class="card-wrapper">
      <div class="card">...</div>
    </div>
  </aside>
  <main class="content">
    <div class="card-wrapper">
      <div class="card">...</div>
    </div>
  </main>
</div>
```

```css
.layout {
  display: grid;
  grid-template-columns: 300px 1fr;
}

.card-wrapper {
  container-type: inline-size;
}

/* サイドバー内（300px）: 縦並び */
/* メインコンテンツ内（広い）: 横並び */
@container (width <= 640px) {
  .card {
    flex-direction: column;
  }
}
```

**メディアクエリでは不可能だった動作**:
- ビューポート960px時、サイドバー内カードは縦並び（親が300px）
- ビューポート960px時、メインコンテンツ内カードは横並び（親が660px）

### 3. 動的レイアウト変更への対応

```css
/* 1カラム⇔2カラムの切り替え */
.layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.item-wrapper {
  container-type: inline-size;
}

@container (width <= 400px) {
  .item {
    padding: 1rem;
    font-size: 0.9rem;
  }
}

@container (width > 400px) {
  .item {
    padding: 2rem;
    font-size: 1rem;
  }
}
```

カラム数が変わっても、各アイテムは親の幅に応じて自動調整される。

## 制限事項と注意点

### 1. インライン要素には使えない

```css
/* ❌ インライン要素にcontainer-typeは設定できない */
button {
  container-type: inline-size;  /* 無効 */
}

/* ✅ ラッパーを追加 */
.button-wrapper {
  container-type: inline-size;
}
```

**注意が必要な要素**:
- `<button>`
- `<a>`（display: inlineの場合）
- `<span>`

### 2. 画像の条件付き出し分けは未対応（2024年6月時点）

```html
<!-- ❌ Container Query条件は使えない -->
<picture>
  <source srcset="large.jpg" media="(min-width: 640px)">
  <img src="small.jpg" alt="">
</picture>
```

`media`属性はメディアクエリ（ビューポート基準）のみ対応。Container Query条件は使えない。

**代替案**: CSSで画像を切り替える

```css
.image-wrapper {
  container-type: inline-size;
}

.image {
  content: url('small.jpg');
}

@container (width > 640px) {
  .image {
    content: url('large.jpg');
  }
}
```

### 3. ネストの考慮

```css
/* 親コンテナ */
.outer {
  container-type: inline-size;
}

/* 子コンテナ */
.inner {
  container-type: inline-size;
}

/* どちらのコンテナを参照する？ */
@container (width <= 640px) {
  .item {
    /* 最も近い親コンテナを参照 */
  }
}
```

**デフォルト動作**: 最も近い親の `container-type` が設定された要素を参照

**明示的な指定**（後述の「名前付きコンテナ」参照）:
```css
.outer {
  container-type: inline-size;
  container-name: outer;
}

@container outer (width <= 640px) {
  .item {
    /* outerコンテナを参照 */
  }
}
```

## 名前付きコンテナ

複数のコンテナがある場合、名前を付けて明示的に参照できる。

```css
/* コンテナに名前を付ける */
.sidebar {
  container-type: inline-size;
  container-name: sidebar;
}

.main {
  container-type: inline-size;
  container-name: main;
}

/* 特定のコンテナを参照 */
@container sidebar (width <= 300px) {
  .card {
    font-size: 0.9rem;
  }
}

@container main (width > 800px) {
  .card {
    font-size: 1.2rem;
  }
}
```

## 比較演算子

Container Queryでは、範囲指定の構文が使える（Media Queries Level 4）。

```css
/* 従来の書き方 */
@container (min-width: 320px) and (max-width: 640px) {
  /* ... */
}

/* 範囲指定構文（推奨） */
@container (320px <= width <= 640px) {
  /* ... */
}

/* その他の演算子 */
@container (width > 640px) { /* より大きい */ }
@container (width >= 640px) { /* 以上 */ }
@container (width < 640px) { /* より小さい */ }
@container (width <= 640px) { /* 以下 */ }
```

## ブラウザサポート

| ブラウザ | サポート開始 | 備考 |
|---------|------------|------|
| Chrome | 106（2022年10月） | Chromium系も同様 |
| Edge | 106（2022年10月） | - |
| Safari | 16.0（2022年9月） | iOS Safariも対応 |
| Firefox | 110（2023年2月） | - |

**互換性確認**: [Can I use: CSS Container Queries](https://caniuse.com/css-container-queries)

**フォールバック**:
```css
/* Container Query非対応ブラウザ用 */
.card {
  flex-direction: column;
}

/* Container Query対応ブラウザ */
@supports (container-type: inline-size) {
  .card-wrapper {
    container-type: inline-size;
  }

  @container (width > 640px) {
    .card {
      flex-direction: row;
    }
  }
}
```

## ベストプラクティス

### 1. コンポーネント単位で設計

Container Queryは「コンポーネントがどこに配置されても適切に表示される」ことを目指す。

```css
/* ❌ ページ固有の設計 */
.sidebar .card {
  flex-direction: column;
}

/* ✅ コンポーネント自体が適応 */
.card-wrapper {
  container-type: inline-size;
}

@container (width <= 640px) {
  .card {
    flex-direction: column;
  }
}
```

### 2. メディアクエリと併用

```css
/* ページ全体のレイアウト: メディアクエリ */
@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

/* コンポーネント内部: Container Query */
.card-wrapper {
  container-type: inline-size;
}

@container (width <= 320px) {
  .card {
    flex-direction: column;
  }
}
```

適材適所で使い分けることで、保守性の高いコードになる。

### 3. デザインシステムとの統合

```css
/* デザインシステムのコンポーネント */
:root {
  --breakpoint-card-small: 320px;
  --breakpoint-card-medium: 640px;
}

.card-wrapper {
  container-type: inline-size;
}

@container (width <= var(--breakpoint-card-small)) {
  .card { /* ... */ }
}

@container (width > var(--breakpoint-card-small)) and (width <= var(--breakpoint-card-medium)) {
  .card { /* ... */ }
}
```

## 実践的な応用パターン

> 出典: https://zenn.dev/stellarcreate/articles/css-container-query-responsive-design
> 執筆日: 2025年11月18日
> 追加日: 2026-01-19

### 多言語レイアウト対応

テキスト長が異なる多言語サイトで、自動的に最適なレイアウトに切り替わる。

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card-content {
    display: flex;
    flex-direction: row;
  }
}

@container card (max-width: 399px) {
  .card-content {
    display: flex;
    flex-direction: column;
  }
}
```

**利点**: 英語（短いテキスト）と日本語（長いテキスト）で、カードの幅が自動調整される。

### アニメーション制御

Container Query を使ってアニメーションパターンを切り替える（JavaScript 不要）。

```css
.animation-container {
  container-type: inline-size;
}

/* 狭い場合: シンプルなアニメーション */
@container (max-width: 500px) {
  .animated-element {
    animation: simple-fade 1s ease-in-out;
  }
}

/* 広い場合: 複雑なアニメーション */
@container (min-width: 501px) {
  .animated-element {
    animation: complex-slide 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
}
```

### 無限ループの回避

**注意**: サイズ変更が連鎖的にスタイル更新を引き起こすパターンを避ける。

```css
/* ❌ 無限ループの例 */
.container {
  container-type: inline-size;
}

@container (min-width: 500px) {
  .item {
    width: 100%; /* コンテナサイズが変わる → 再評価 → ループ */
  }
}

/* ✅ 安全な実装 */
.container {
  container-type: inline-size;
}

@container (min-width: 500px) {
  .item {
    padding: 2rem; /* サイズは変わらない */
    font-size: 1.2rem;
  }
}
```

**ルール**: Container Query 内でコンテナ自身のサイズを変更するスタイルを適用しない。

### Container Query Units の活用

コンテナサイズに相対的な単位を使用:

```css
.container {
  container-type: inline-size;
}

.item {
  /* cqi: コンテナのインライン方向の1% */
  padding: 2cqi;
  font-size: calc(1rem + 1cqi);
}
```

**利点**: ブレークポイントなしで流動的にサイズが変化。

## 参考リソース

- [MDN: CSS Container Queries](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_container_queries)
- [Can I use: CSS Container Queries](https://caniuse.com/css-container-queries)
- [CSS Containment Module Level 3（仕様）](https://www.w3.org/TR/css-contain-3/)

---
