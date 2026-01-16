---
title: paint-order プロパティ
category: css/typography
tags: [paint-order, stroke, text-stroke, svg]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# paint-order プロパティ

> 出典: https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> 執筆日: 2024年
> 追加日: 2025-12-17

テキストストロークの描画順序を制御。

## 基本的な使い方

```css
/* ストロークを塗りの後ろに */
h1 {
  paint-order: stroke fill;
  color: white;
  -webkit-text-stroke: 4px black;
}
```

## 値の種類

| 値 | 説明 |
|----|------|
| `normal` | fill → stroke → markers（デフォルト） |
| `stroke fill` | stroke → fill → markers |
| `fill stroke markers` | 明示的に順序指定 |

## 視覚的な違い

```css
/* normal: ストロークが塗りの上に描画される */
.text-normal {
  paint-order: normal;
  color: white;
  -webkit-text-stroke: 4px black;
}
/* 結果: 白い文字の上に黒い縁取り → 文字が細く見える */

/* stroke fill: ストロークが塗りの下に描画される */
.text-stroke-first {
  paint-order: stroke fill;
  color: white;
  -webkit-text-stroke: 4px black;
}
/* 結果: 黒い縁取りの上に白い文字 → 文字が太く、縁取りが均一 */
```

## ユースケース

### 見出しの縁取り

```css
h1 {
  paint-order: stroke fill;
  color: #fff;
  -webkit-text-stroke: 3px #333;
  font-size: 4rem;
  font-weight: 900;
}
```

### SVG テキスト

```css
text {
  paint-order: stroke fill;
  fill: yellow;
  stroke: black;
  stroke-width: 2;
}
```

### アウトラインテキスト

```css
.outline-text {
  paint-order: stroke fill;
  color: transparent;
  -webkit-text-stroke: 2px #333;
}

.outline-text:hover {
  color: #333;
}
```

## -webkit-text-stroke との組み合わせ

```css
.fancy-text {
  /* ストロークを先に描画 */
  paint-order: stroke fill;

  /* テキスト色 */
  color: #fff;

  /* ストロークの設定 */
  -webkit-text-stroke: 3px #0066cc;

  /* 影を追加 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
```

## ブラウザ対応

主要ブラウザで対応済み（Chrome, Firefox, Safari, Edge）。

## 関連ナレッジ

- [text-stroke](./text-stroke.md)
- [SVG Text](../../svg/svg-text.md)
