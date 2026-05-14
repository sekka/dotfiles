---
source_url: https://azukiazusa.dev/blog/automatic-contrast-adjustment-with-contrast-color-function
title: contrast-color() 関数を使用した自動コントラスト調整
author: azukiazusa1
published: 2026-04-28
captured: 2026-05-13
status: inbox
---

# contrast-color() による自動コントラスト調整

## 出典
- URL: https://azukiazusa.dev/blog/automatic-contrast-adjustment-with-contrast-color-function
- 著者: azukiazusa1
- 公開: 2026-04-28

## 関数の概要

`contrast-color()` 関数は指定した色に対して「白または黒のいずれがより高いコントラスト比を持つか自動判断し、適切な色を返す」機能。動的に変わる背景色やユーザーカスタムテーマでも、常にアクセシブルな色合いを確保できる。

## 基本構文

```css
.element {
  --bg-color: attr(data-bg-color type(<color>));
  background-color: var(--bg-color);
  color: contrast-color(var(--bg-color));
}
```

## フォールバック付き実装

```css
.element {
  background-color: var(--bg-color);
  color: white;
}

@supports (color: contrast-color(red)) {
  .element {
    color: contrast-color(var(--bg-color));
  }
}
```

## ダークモード対応

```css
:root {
  --bg-color: white;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: black;
  }
}

.element {
  background-color: var(--bg-color);
  color: contrast-color(var(--bg-color));
}
```

## color-mix() との組み合わせ

```css
.element {
  --bg-color: oklch(50% 0.1 270);
  background-color: var(--bg-color);
  color: color-mix(
    in srgb,
    contrast-color(var(--bg-color)) 80%,
    var(--bg-color) 20%
  );
}
```

## if() との組み合わせ

```css
@property --contrast-color {
  syntax: "<color>";
  initial-value: white;
  inherits: true;
}

.element {
  --bg-color: attr(data-bg-color type(<color>));
  background-color: var(--bg-color);
  --contrast-color: contrast-color(var(--bg-color));
  color: if(
    style(--contrast-color: black): oklch(43.5% 0.029 321.78) ;
      else: oklch(86.9% 0.005 56.366)
  );
}
```

## ブラウザサポート
- Chrome v147 以降で実装確認

## 注意点
- 白と黒のコントラスト比が同じ場合には白が返される
- 中間色（#2277d3 等）では数値上黒が推奨でも視覚的に白の方が見やすいケースあり
- 完全なアクセシビリティ保証ではない（文字サイズ・太さ・フォントで変動）
- prefers-contrast: more への追加対応が必要
- WCAG AA: 4.5:1, AAA: 7:1 の別途検証推奨

## ユースケース
- GitHub のラベル機能のようなユーザー選択背景色
- 動的テーマシステム
- ユーザー生成コンテンツの背景色対応
