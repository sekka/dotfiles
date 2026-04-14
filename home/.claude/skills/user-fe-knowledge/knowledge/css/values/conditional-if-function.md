---
title: CSS if() 関数
category: css/values
tags: [if, conditional, css-values, css-variables, style-queries]
browser_support: Chrome 137+, Edge 137+（2025年5月予定）
created: 2025-01-16
updated: 2025-01-16
---

# CSS if() 関数

> 出典: https://ics.media/entry/250919/
> 執筆日: 2025年
> 追加日: 2025-01-16

CSSに分岐機能を追加する新しい関数。条件に応じて異なる値を返す。

## 基本構文

```css
.element {
  property: if(condition: value-if-true; else: value-if-false;);
}
```

## 条件指定の方法

### style() - カスタムプロパティの値で判定

```css
.button {
  background-color: if(
    style(--variant: primary): blue;
    style(--variant: secondary): gray;
    else: black;
  );
}
```

### media() - メディアクエリで判定

```css
.box {
  background-color: if(
    media(width <= 768px): red;
    media(width <= 1024px): orange;
    else: blue;
  );
}
```

### @supports - 機能サポートで判定

```css
.element {
  display: if(
    supports(display: grid): grid;
    else: flex;
  );
}
```

## 従来技術との比較

### クラス名による分岐（従来）

```css
.button {
  background-color: blue;
}

.button.button--secondary {
  background-color: gray;
}

.button.button--danger {
  background-color: red;
}
```

**問題点:**
- 詳細度が上がる
- クラス名の組み合わせが複雑化
- ラッパー要素が必要な場合がある

### if() 関数（新しい方法）

```css
.button {
  background-color: if(
    style(--variant: primary): blue;
    style(--variant: secondary): gray;
    style(--variant: danger): red;
    else: blue;
  );
}
```

```html
<button class="button" style="--variant: primary">Primary</button>
<button class="button" style="--variant: danger">Danger</button>
```

**メリット:**
- 詳細度を上げない
- ラッパー要素不要
- CSS変数で柔軟に制御

## ユースケース

### デザインシステムのバリアント管理

```css
.card {
  padding: if(
    style(--size: small): 0.5rem;
    style(--size: large): 2rem;
    else: 1rem;
  );

  border-width: if(
    style(--variant: outlined): 1px;
    else: 0;
  );
}
```

### グローバル状態管理

```css
:root {
  --theme: light;
}

.app {
  background: if(
    style(--theme: dark): #1a1a1a;
    else: #ffffff;
  );

  color: if(
    style(--theme: dark): #ffffff;
    else: #000000;
  );
}
```

### レスポンシブデザイン

```css
.container {
  display: if(
    media(width <= 768px): block;
    else: flex;
  );

  gap: if(
    media(width <= 768px): 1rem;
    else: 2rem;
  );
}
```

### 機能検出

```css
.grid {
  display: if(
    supports(display: grid): grid;
    supports(display: flex): flex;
    else: block;
  );
}
```

## コンテナスタイルクエリとの比較

### コンテナスタイルクエリ

```css
.card {
  background: blue;
}

@container style(--variant: primary) {
  .card {
    background: red;
  }
}
```

**問題点:** 詳細度が上がる

### if() 関数

```css
.card {
  background: if(
    style(--variant: primary): red;
    else: blue;
  );
}
```

**メリット:** 詳細度を維持

## 複雑な条件分岐

```css
.element {
  background: if(
    style(--level: 1) and media(prefers-color-scheme: dark): #333;
    style(--level: 2) and media(prefers-color-scheme: dark): #555;
    style(--level: 1): #eee;
    style(--level: 2): #ccc;
    else: white;
  );
}
```

## 注意点と制約

### CSS変数の管理が重要

if()関数はCSS変数に依存するため、変数の命名規則とスコープ管理が重要。

```css
/* 悪い例: グローバルに散在 */
.button { --variant: primary; }
.card { --variant: outlined; }

/* 良い例: 意味的な名前空間 */
.button { --button-variant: primary; }
.card { --card-variant: outlined; }
```

### 複雑なCSSを生む可能性

過度に複雑な分岐は可読性を損なう。

```css
/* 避けるべき: 過度に複雑 */
.element {
  color: if(
    style(--a: 1) and style(--b: 2) and media(width > 1000px): red;
    style(--a: 1) and style(--c: 3): blue;
    style(--d: 4) or style(--e: 5): green;
    else: black;
  );
}

/* 推奨: シンプルな分岐 */
.element {
  color: if(
    style(--theme: dark): white;
    else: black;
  );
}
```

### デバッグの難易度

ブラウザの開発者ツールでの値の追跡が難しい場合がある。

## ブラウザ対応

- Chrome 137+（2025年5月リリース予定）
- Edge 137+（2025年5月リリース予定）
- Safari: 未対応
- Firefox: 未対応

**現状:** 実験的機能。プロダクション使用は2026年以降を推奨。

## 関連ナレッジ

- [CSS変数（カスタムプロパティ）](./css-custom-properties.md)
- [コンテナクエリ](../layout/container-query.md)
- [メディアクエリ](./media-queries-modern.md)
