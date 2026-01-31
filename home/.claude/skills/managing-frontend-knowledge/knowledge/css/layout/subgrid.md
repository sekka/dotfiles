---
title: CSS Subgrid
category: css/layout
tags: [subgrid, grid, layout, 2024]
browser_support: Chrome 117+, Firefox 71+, Safari 16+
created: 2026-01-31
updated: 2026-01-31
---

# CSS Subgrid

> 出典: https://speakerdeck.com/tonkotsuboy_com/lu-ye-sanniwen-ku-2024nian-zui-xin-csstorendotoshi-jian-tekunituku
> 執筆日: 2024-06
> 追加日: 2026-01-31

子グリッドが親グリッドのトラック（行・列）を継承できる機能。複雑なレイアウトで要素を揃えるのが劇的に簡単になる。

## なぜSubgridが必要なのか

**従来の問題点:**
```html
<div class="parent-grid">
  <div class="card">
    <h2>見出し（長さバラバラ）</h2>
    <p>本文</p>
    <button>ボタン</button>
  </div>
  <div class="card">
    <h2>短い見出し</h2>
    <p>本文</p>
    <button>ボタン</button>
  </div>
</div>
```

```css
/* ❌ 従来: カード内のボタン位置がバラバラ */
.parent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.card {
  display: grid; /* 独立したグリッド */
  grid-template-rows: auto 1fr auto;
  /* 親グリッドとは無関係 */
}
```

**Subgridのメリット:**
- **揃う**: 親グリッドのトラックを共有し、カード間で要素が揃う
- **保守性**: 親のグリッド定義を変更すれば、子も自動的に追従
- **レスポンシブ**: メディアクエリで親を変更するだけでOK

## 基本的な使い方

```css
.parent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto 1fr auto;
  gap: 1rem;
}

.card {
  display: grid;
  /* 親の列トラックを継承 */
  grid-template-columns: subgrid;
  /* 親の行トラックを継承 */
  grid-template-rows: subgrid;
}
```

## 列のSubgrid

親の**列トラック**を継承。

```html
<div class="grid-container">
  <div class="item">
    <img src="image.jpg">
    <h3>タイトル</h3>
    <p>説明文</p>
  </div>
  <div class="item">
    <img src="image.jpg">
    <h3>タイトル</h3>
    <p>説明文</p>
  </div>
</div>
```

```css
.grid-container {
  display: grid;
  grid-template-columns: 100px 1fr; /* 画像列・テキスト列 */
  gap: 1rem;
}

.item {
  display: grid;
  grid-template-columns: subgrid; /* 親の2列を継承 */
  grid-column: span 2; /* 親の2列分を使用 */
}

.item img {
  grid-column: 1; /* 1列目（100px） */
}

.item h3,
.item p {
  grid-column: 2; /* 2列目（1fr） */
}
```

## 行のSubgrid

親の**行トラック**を継承。カードレイアウトで最も有用。

```html
<div class="cards">
  <div class="card">
    <h2>見出し（長さバラバラ）</h2>
    <p>本文テキスト</p>
    <button>ボタン</button>
  </div>
  <div class="card">
    <h2>短い見出し</h2>
    <p>本文テキスト</p>
    <button>ボタン</button>
  </div>
  <div class="card">
    <h2>とても長い見出しで複数行になる場合もあります</h2>
    <p>本文テキスト</p>
    <button>ボタン</button>
  </div>
</div>
```

```css
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto 1fr auto; /* 見出し・本文・ボタン */
  gap: 1rem;
}

.card {
  display: grid;
  grid-template-rows: subgrid; /* 親の3行を継承 */
  grid-row: span 3; /* 親の3行分を使用 */
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

.card h2 {
  grid-row: 1; /* 1行目（auto） */
}

.card p {
  grid-row: 2; /* 2行目（1fr）- 伸縮して揃う */
}

.card button {
  grid-row: 3; /* 3行目（auto）- 全カードで下揃え */
}
```

**結果:**
- 見出しの高さが異なっても、全カードのボタンが同じ位置に揃う
- 本文が伸縮して調整される

## 行・列の両方でSubgrid

```html
<div class="calendar">
  <div class="week">
    <div class="day">1</div>
    <div class="day">2</div>
    <div class="day">3</div>
  </div>
  <div class="week">
    <div class="day">4</div>
    <div class="day">5</div>
    <div class="day">6</div>
  </div>
</div>
```

```css
.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr); /* 7列（週） */
  grid-template-rows: repeat(5, 100px); /* 5行（週） */
  gap: 2px;
}

.week {
  display: grid;
  grid-template-columns: subgrid; /* 親の列を継承 */
  grid-template-rows: subgrid; /* 親の行を継承 */
  grid-column: span 7; /* 7列使用 */
  grid-row: span 1; /* 1行使用 */
}

.day {
  background-color: #f3f4f6;
  padding: 0.5rem;
}
```

## gap の継承

Subgridは親の `gap` を継承できる。

```css
.parent {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem; /* 親のgap */
}

.child {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: span 3;
  /* gap: 2rem; - 自動的に継承される */
}

/* 子で gap を上書きすることも可能 */
.child-custom-gap {
  display: grid;
  grid-template-columns: subgrid;
  gap: 1rem; /* 親のgapを上書き */
}
```

## 実践例

### カードグリッドのレイアウト

```html
<div class="product-grid">
  <article class="product-card">
    <img src="product1.jpg" alt="商品1">
    <h3>商品名（長さバラバラ）</h3>
    <p class="price">¥1,200</p>
    <p class="description">商品説明テキスト</p>
    <button>カートに追加</button>
  </article>
  <!-- 他のカード -->
</div>
```

```css
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-template-rows: 200px auto auto 1fr auto; /* 画像・見出し・価格・説明・ボタン */
  gap: 2rem 1rem;
}

.product-card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 5; /* 5行分 */
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.product-card img {
  grid-row: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card h3 {
  grid-row: 2;
  font-size: 1.125rem;
}

.product-card .price {
  grid-row: 3;
  font-size: 1.5rem;
  font-weight: bold;
}

.product-card .description {
  grid-row: 4;
  color: #6b7280;
}

.product-card button {
  grid-row: 5;
  /* 全カードで下揃え */
}
```

### フォームレイアウト

```html
<form class="contact-form">
  <div class="form-group">
    <label for="name">お名前</label>
    <input type="text" id="name" required>
    <span class="error-message">必須項目です</span>
  </div>
  <div class="form-group">
    <label for="email">メールアドレス</label>
    <input type="email" id="email" required>
    <span class="error-message">有効なメールアドレスを入力してください</span>
  </div>
</form>
```

```css
.contact-form {
  display: grid;
  grid-template-columns: 150px 1fr; /* ラベル・入力欄 */
  grid-template-rows: repeat(auto-fill, auto auto); /* ラベル+入力・エラー */
  gap: 1rem 2rem;
}

.form-group {
  display: grid;
  grid-template-columns: subgrid;
  grid-template-rows: subgrid;
  grid-column: span 2;
  grid-row: span 2;
}

.form-group label {
  grid-column: 1;
  grid-row: 1;
  align-self: center;
}

.form-group input {
  grid-column: 2;
  grid-row: 1;
}

.form-group .error-message {
  grid-column: 2;
  grid-row: 2;
  font-size: 0.875rem;
  color: #ef4444;
}
```

### レスポンシブなSubgrid

```css
.cards {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
}

/* モバイル: 1カラム */
@media (max-width: 768px) {
  .cards {
    grid-template-columns: 1fr;
  }
}

/* タブレット: 2カラム */
@media (min-width: 769px) and (max-width: 1024px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* デスクトップ: 3カラム */
@media (min-width: 1025px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Subgrid は親の変更に自動追従 */
.card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3;
}
```

## 名前付きグリッドラインとの組み合わせ

```css
.parent {
  display: grid;
  grid-template-columns: [sidebar-start] 200px [sidebar-end content-start] 1fr [content-end];
  grid-template-rows: [header-start] auto [header-end main-start] 1fr [main-end];
}

.child {
  display: grid;
  grid-template-columns: subgrid;
  grid-template-rows: subgrid;
  grid-column: sidebar-start / content-end;
  grid-row: header-start / main-end;
}

.child-content {
  grid-column: content-start / content-end;
  grid-row: main-start / main-end;
}
```

## ユースケース

- **カードグリッド**: ECサイトの商品一覧、ブログカード
- **フォーム**: ラベルと入力欄の揃え
- **ダッシュボード**: ウィジェットの整列
- **テーブル風レイアウト**: データグリッド
- **カレンダー**: 日付セルの整列
- **ギャラリー**: 画像とキャプションの揃え

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 117+ |
| Firefox | 71+ |
| Safari | 16+ |

**注意:** Firefoxは最も早く実装（2019年）、Safari・Chromeは2023年に対応。

## フォールバック

```css
/* フォールバック: 通常のグリッド */
.card {
  display: grid;
  grid-template-rows: auto 1fr auto;
}

/* Subgrid 対応ブラウザ */
@supports (grid-template-rows: subgrid) {
  .cards {
    grid-template-rows: auto 1fr auto;
  }

  .card {
    grid-template-rows: subgrid;
    grid-row: span 3;
  }
}
```

## 注意点

- **span 必須**: Subgridを使うには `grid-column: span N` または `grid-row: span N` が必要
- **gap の考慮**: 親のgapも継承されることを忘れずに
- **入れ子の深さ**: 過度に深い入れ子は避ける（パフォーマンス）

## 従来手法との比較

| 手法 | メリット | デメリット |
|------|---------|-----------|
| **Flexbox** | シンプル | 2次元の整列が困難 |
| **独立グリッド** | 柔軟 | カード間で揃わない |
| **Subgrid** | 完全に揃う | 新しいブラウザのみ |

## 関連ナレッジ

- [CSS Grid 基礎](./grid-basics.md)
- [Grid レイアウトパターン](./grid-patterns.md)
- [レスポンシブデザイン](../../cross-cutting/responsive/responsive-design.md)
