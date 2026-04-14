---
title: CSS 2025 エルゴノミクス機能
category: css/modern
tags: [css-2025, attr, text-box, if-function, at-function, corner-shape, shape, ergonomics]
browser_support: 実験的機能（段階的に実装予定）
created: 2026-01-31
updated: 2026-01-31
source: https://coliss.com/articles/build-websites/operation/css/css-in-2025-ergonomics.html
---

# CSS 2025 エルゴノミクス機能

## 概要

CSS 2025 では、開発者の生産性を大幅に向上させる「エルゴノミクス（人間工学）」機能が多数導入されます。`attr()` 拡張、`if()` 関数、`@function` カスタム関数など、より効率的な実装を可能にする機能をまとめます。

---

## attr() 関数の拡張

### 従来の制限

従来の `attr()` は、疑似要素の `content` プロパティでのみ使用可能でした。

```css
/* 従来の使い方 */
a::after {
  content: " (" attr(href) ")";
}
```

### 拡張内容

**すべてのプロパティで使用可能**になり、カラー、長さ、数値など複数のデータ型を解析できるようになりました。

### 実装例

#### 1. カラー値の動的適用

```html
<div data-color="#ff6b6b">赤</div>
<div data-color="#4ecdc4">青緑</div>
<div data-color="#ffe66d">黄色</div>

<style>
  div {
    color: attr(data-color type(<color>), red);
    padding: 1rem;
  }
</style>
```

**構文:**
```css
attr(属性名 type(<型>), デフォルト値)
```

#### 2. id 属性から view-transition-name を自動生成

```html
<div id="hero">ヒーローセクション</div>
<div id="about">概要セクション</div>

<style>
  [id] {
    view-transition-name: attr(id type(<custom-ident>));
  }
</style>
```

**効果:**
- 各要素に個別の `view-transition-name` を書く必要がない
- HTML の `id` 属性と自動的に同期

#### 3. 数値型の活用

```html
<div data-columns="3">グリッド</div>

<style>
  div {
    display: grid;
    grid-template-columns: repeat(attr(data-columns type(<number>), 1), 1fr);
  }
</style>
```

### サポートされる型

| 型 | 説明 | 例 |
|----|------|-----|
| `<color>` | カラー値 | `#ff0000`, `rgb(255,0,0)` |
| `<length>` | 長さ | `10px`, `2rem` |
| `<number>` | 数値 | `3`, `1.5` |
| `<custom-ident>` | カスタム識別子 | `hero`, `sidebar` |
| `<angle>` | 角度 | `45deg`, `0.5turn` |

---

## text-box プロパティ

### 概要

フォントの内部メトリクスを調整し、**テキストの視覚的中央揃え**を実現します。

### 問題点

従来の vertical-align は、数学的中央揃えのみで、視覚的中央揃えではありませんでした。

### 実装例

```css
h1, button {
  text-box: trim-both cap alphabetic;
}
```

**構文:**
- `trim-both`: 上下のトリミング
- `cap`: キャップハイト（大文字の高さ）
- `alphabetic`: ベースライン

### 視覚的な効果

```html
<button>クリック</button>

<style>
  button {
    padding: 0.5em 1em;
    text-box: trim-both cap alphabetic;
    /* 視覚的に完璧な中央揃え */
  }
</style>
```

---

## if() 関数

### 概要

条件式に基づいて異なる値を適用できます。メディアクエリ、スタイルクエリ、サポートクエリを単一行で実装可能。

### 基本構文

```css
プロパティ: if(条件: 真の値; else: 偽の値);
```

### 実装例

#### 1. メディアクエリの簡素化

**従来:**

```css
.responsive-layout {
  flex-direction: column;
}

@media (orientation: landscape) {
  .responsive-layout {
    flex-direction: row;
  }
}
```

**新しい実装:**

```css
.responsive-layout {
  flex-direction: if(media(orientation: landscape): row; else: column);
}
```

#### 2. スタイルクエリとの組み合わせ

```css
.card {
  background: if(style(--theme = dark): black; else: white);
  color: if(style(--theme = dark): white; else: black);
}
```

#### 3. サポートクエリとの組み合わせ

```css
.element {
  display: if(supports(display: grid): grid; else: flex);
}
```

### 複数条件の連結

```css
.element {
  font-size: if(
    media(width >= 1200px): 2rem;
    media(width >= 768px): 1.5rem;
    else: 1rem
  );
}
```

---

## @function カスタム関数

### 概要

CSS 内で独自の関数を定義し、複雑な計算ロジックを再利用できます。

### 基本構文

```css
@function --function-name(--param1, --param2: デフォルト値) {
  result: 計算式;
}
```

### 実装例

#### 1. 反転関数

```css
@function --negate(--value) {
  result: calc(-1 * var(--value));
}

.element {
  margin-top: var(--negate(20px));
  /* margin-top: -20px と同じ */
}
```

#### 2. 条件付き角丸

```css
@function --conditional-radius(--distance) {
  result: if(
    style(--distance > 100px): 0px;
    else: 16px
  );
}

.card {
  --distance: 50px;
  border-radius: var(--conditional-radius(var(--distance)));
}
```

#### 3. レスポンシブスケール

```css
@function --responsive-scale(--base, --scale) {
  result: calc(var(--base) * var(--scale, 1));
}

h1 {
  font-size: var(--responsive-scale(2rem, 1.5));
}
```

---

## shape() 関数

### 概要

複雑な非多角形シェイプを `clip-path` で実装できます。SVG より管理しやすく、レスポンシブにも対応。

### 実装例

#### 旗の波状エッジ

```css
.flag {
  clip-path: shape(
    from 0% 20px,
    curve to 100% 20px via 50% 0%,
    line to 100% calc(100% - 20px),
    curve to 0% calc(100% - 20px) via 50% 100%,
    close
  );
}
```

#### カスタムボタンシェイプ

```css
.custom-button {
  clip-path: shape(
    from 10px 0%,
    line to calc(100% - 10px) 0%,
    curve to 100% 50% via calc(100% + 10px) 25%,
    curve to calc(100% - 10px) 100% via calc(100% + 10px) 75%,
    line to 10px 100%,
    curve to 0% 50% via -10px 75%,
    curve to 10px 0% via -10px 25%,
    close
  );
}
```

### SVG との比較

| 方法 | メリット | デメリット |
|------|---------|-----------|
| SVG | ブラウザサポート広い | CSS から制御しにくい |
| `shape()` | レスポンシブ、保守性高 | 新しい機能 |

---

## corner-shape プロパティ

### 概要

`border-radius` で標準的な丸角以外に、`bevel`（面取り）、`notch`（切り欠き）、`scoop`（すくい）、`squircle`（スクワークル）などの形状を実装できます。

### 実装例

```css
.card {
  corner-shape: squircle;
  border-radius: 16px;
}

.button {
  corner-shape: notch;
  border-radius: 8px;
}

.image {
  corner-shape: scoop;
  border-radius: 20px;
}
```

### 形状の種類

| 形状 | 説明 | ユースケース |
|------|------|-------------|
| `round` | 標準的な丸角 | 一般的なカード |
| `bevel` | 面取り | モダンなデザイン |
| `notch` | 切り欠き | ボタン、タグ |
| `scoop` | すくい形 | 柔らかい印象 |
| `squircle` | スクワークル | Apple デザイン |

### アニメーション

```css
.card {
  corner-shape: round;
  border-radius: 16px;
  transition: corner-shape 0.3s ease;
}

.card:hover {
  corner-shape: squircle;
}
```

---

## 範囲構文（スタイルクエリ + if()）

### 概要

`>`、`<`、`>=`、`<=` などの比較演算子が使用可能になります。

### 実装例

#### 1. スタイルクエリでの範囲指定

```css
@container style(--rain-percent > 45%) {
  .weather-card {
    background: blue;
  }
}

@container style(--rain-percent <= 45%) {
  .weather-card {
    background: yellow;
  }
}
```

#### 2. if() 関数での比較

```css
.element {
  background: if(style(--temperature > 30): red; else: blue);
}
```

#### 3. 複数条件の組み合わせ

```css
@container style((--width >= 300px) and (--width < 600px)) {
  .card {
    columns: 2;
  }
}
```

---

## ワークフロー効率の向上

これらの機能により、以下のワークフローが大幅に改善されます：

### Before（従来）

```css
/* 複数の@mediaブロック */
.element {
  flex-direction: column;
}

@media (min-width: 768px) {
  .element {
    flex-direction: row;
  }
}

/* JavaScript で動的スタイル */
<script>
  if (theme === 'dark') {
    element.style.background = 'black';
  }
</script>
```

### After（CSS 2025）

```css
.element {
  flex-direction: if(media(width >= 768px): row; else: column);
  background: if(style(--theme = dark): black; else: white);
}
```

**利点:**
- JavaScript 依存の削減
- 単一プロパティでロジック集約
- 保守性の向上

---

## 参考資料

- [CSS Working Group Drafts](https://drafts.csswg.org/)
- [attr() - CSS Spec](https://drafts.csswg.org/css-values-5/#attr-notation)
- [if() function - CSS Spec](https://drafts.csswg.org/css-conditional-5/#funcdef-if)
- [@function - CSS Spec](https://drafts.csswg.org/css-functions-1/)

---

## 関連ナレッジ

- [CSS 2025 インタラクション](../animation/css-2025-interactions.md)
- [CSS 2025 コンポーネント](../components/css-2025-components.md)
- [モダンCSS値](../values/README.md)
