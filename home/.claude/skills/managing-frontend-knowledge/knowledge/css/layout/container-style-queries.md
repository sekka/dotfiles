---
title: "CSS Container Style Queries - style() 関数"
category: css/layout
tags: [css, container-queries, style-queries, css-variables, responsive-design]
browser_support: "Chrome/Edge 111+, Safari 18.0+, Firefox (未対応)"
created: 2026-02-01
updated: 2026-02-01
---

# CSS Container Style Queries - style() 関数

## 概要

Container Style Queries は、CSS 変数の値に基づいて条件的にスタイルを適用する機能。従来のクラスベースのバリエーション管理に代わる、よりシンプルなアプローチ。

> 出典: [CSSのコンテナースタイルクエリーstyle()の使い方 - ICS MEDIA](https://ics.media/entry/240723/)
> 執筆日: 2024-07-23
> 追加日: 2026-02-01

**なぜ有用か:**
- 1つのクラスで異なるバリエーションを管理
- CSS 変数の値で条件分岐
- HTML のクラス名を増やさずに済む

## 従来の方法との比較

### 従来: BEM によるクラス分け

```html
<button class="button">Primary</button>
<button class="button button--secondary">Secondary</button>
```

```css
.button {
  color: #fff;
  background-color: #3223B3;
  padding: 1em 2em;
  border: none;
  border-radius: 4px;
}

.button--secondary {
  color: #3223B3;
  background-color: #EBE9FC;
}
```

**課題:**
- クラス名が増える
- HTML が冗長になる

### Container Style Queries を使った方法

```html
<button class="button">Primary</button>
<button class="button" style="--secondary: true;">Secondary</button>
```

```css
.button {
  color: #fff;
  background-color: #3223B3;
  padding: 1em 2em;
  border: none;
  border-radius: 4px;
}

@container style(--secondary: true) {
  .button {
    color: #3223B3;
    background-color: #EBE9FC;
  }
}
```

**メリット:**
- クラス名が1つで済む
- CSS 変数で柔軟にバリエーション管理

## 基本構文

```css
@container style(--variable-name: value) {
  /* スタイル */
}
```

**パラメータ:**
- `--variable-name`: CSS 変数名
- `value`: 条件となる値（文字列の場合はクォート不要）

## 実用例

### 1. ボタンのバリエーション管理

```css
.button {
  color: #fff;
  background-color: #3223B3;
  padding: 1em 2em;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* セカンダリボタン */
@container style(--secondary: true) {
  .button {
    color: #3223B3;
    background-color: #EBE9FC;
  }

  .button:hover {
    background-color: #D5D1F7;
  }
}

/* アウトラインボタン */
@container style(--outline: true) {
  .button {
    color: #3223B3;
    background-color: transparent;
    border: 2px solid #3223B3;
  }

  .button:hover {
    background-color: #EBE9FC;
  }
}

/* 危険なアクション */
@container style(--danger: true) {
  .button {
    background-color: #d32f2f;
  }

  .button:hover {
    background-color: #b71c1c;
  }
}
```

**HTML:**

```html
<button class="button">Primary</button>
<button class="button" style="--secondary: true;">Secondary</button>
<button class="button" style="--outline: true;">Outline</button>
<button class="button" style="--danger: true;">Delete</button>
```

### 2. カードコンポーネントのレイアウト切り替え

```css
.card {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

/* 横並びレイアウト */
@container style(--layout: horizontal) {
  .card {
    flex-direction: row;
  }

  .card img {
    width: 200px;
    height: auto;
  }
}
```

**HTML:**

```html
<div class="card">
  <img src="..." alt="">
  <div class="card-content">...</div>
</div>

<div class="card" style="--layout: horizontal;">
  <img src="..." alt="">
  <div class="card-content">...</div>
</div>
```

### 3. テーマの切り替え

```css
.component {
  color: #333;
  background-color: #fff;
}

@container style(--theme: dark) {
  .component {
    color: #fff;
    background-color: #1a1a1a;
  }
}

@container style(--theme: high-contrast) {
  .component {
    color: #000;
    background-color: #fff;
    border: 2px solid #000;
  }
}
```

### 4. 動的フォントサイズ（Container Query Units との併用）

Container Query Units (`cqw`, `cqh`) と組み合わせて、親要素の幅に応じた動的なフォントサイズ調整。

```css
.container {
  container-type: inline-size;
  width: 100%;
}

.text {
  font-size: clamp(1rem, 5cqw, 3rem);
}
```

**`cqw` の説明:**
- Container Query Width の略
- 親要素の幅の1%を表す単位
- `5cqw` = 親要素の幅の5%

**`clamp()` の役割:**
- `clamp(最小値, 推奨値, 最大値)`
- フォントサイズを最小1rem、最大3remに制限しつつ、親要素の幅に応じて動的に拡縮

**ブラウザサポート（Container Query Units）:**
- Chrome: 105+
- Safari: 16.0+
- Firefox: 110+

## ブラウザサポート

### Container Style Queries (`style()`)

| ブラウザ | バージョン | リリース日 |
|----------|-----------|-----------|
| Chrome/Edge | 111+ | 2023年3月 |
| Safari | 18.0+ | 2024年9月 |
| Firefox | 未対応 | - |

**注意:** Firefox は現時点で未対応（2026年2月時点）。

### Container Query Units (`cqw`, `cqh`)

| ブラウザ | バージョン |
|----------|-----------|
| Chrome | 105+ |
| Safari | 16.0+ |
| Firefox | 110+ |

## 注意点

### 1. ブラウザサポートの確認

Firefox が未対応のため、本番環境での使用には注意が必要。

**フォールバック:**

```css
/* フォールバック */
.button--secondary {
  color: #3223B3;
  background-color: #EBE9FC;
}

/* Container Style Queries 対応ブラウザ */
@supports (container-type: inline-size) {
  @container style(--secondary: true) {
    .button {
      color: #3223B3;
      background-color: #EBE9FC;
    }
  }
}
```

### 2. CSS 変数の値は文字列として扱われる

```css
/* ✅ 正しい */
@container style(--secondary: true) { }

/* ❌ 間違い（クォート不要） */
@container style(--secondary: "true") { }
```

### 3. 複数条件の組み合わせ

論理演算子 `and`, `or`, `not` が使用可能。

```css
/* AND */
@container style(--secondary: true) and style(--large: true) {
  .button {
    font-size: 1.5rem;
  }
}

/* OR */
@container style(--secondary: true) or style(--outline: true) {
  .button {
    border: 2px solid #3223B3;
  }
}

/* NOT */
@container not style(--disabled: true) {
  .button:hover {
    background-color: #2519a0;
  }
}
```

### 4. container-type の指定は不要

Container Style Queries では `container-type` の指定は不要（サイズベースのクエリとは異なる）。

## ユースケース

- **コンポーネントライブラリ:** バリエーション管理
- **デザインシステム:** テーマやモードの切り替え
- **レスポンシブコンポーネント:** 親要素の幅に応じたレイアウト変更
- **条件的スタイリング:** 状態に応じた表示切り替え

## Container Queries（サイズベース）との違い

| 特徴 | Container Style Queries | Container Queries (サイズ) |
|------|------------------------|---------------------------|
| **条件** | CSS 変数の値 | 親要素のサイズ（width/height） |
| **構文** | `@container style(--var: value)` | `@container (width > 400px)` |
| **container-type** | 不要 | 必要 (`inline-size` or `size`) |
| **用途** | バリエーション管理 | レスポンシブレイアウト |

**併用例:**

```css
.container {
  container-type: inline-size;
}

/* サイズベース */
@container (width > 600px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

/* スタイルベース */
@container style(--dark: true) {
  .card {
    background-color: #1a1a1a;
    color: #fff;
  }
}
```

## 関連技術

- **CSS Container Queries:** 親要素のサイズに基づくスタイリング
- **CSS Variables (Custom Properties):** カスタムプロパティ
- **Container Query Units:** `cqw`, `cqh`, `cqi`, `cqb`
- **CSS `clamp()` 関数:** 動的なサイズ調整
- **CSS `@supports`:** 機能検出

## 参考リンク

- [CSS Container Queries - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)
- [Container Style Queries - Chrome Developers](https://developer.chrome.com/blog/style-queries/)
- [clamp() - CSS - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp)
- [CSS Container Query Units - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries#container_query_length_units)
