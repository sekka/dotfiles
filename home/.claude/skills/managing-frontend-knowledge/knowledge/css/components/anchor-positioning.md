---
title: Anchor Positioning
category: css/components
tags: [anchor, positioning, popover, tooltip, 2024]
browser_support: Chrome 125+
created: 2025-01-16
updated: 2025-01-16
---

# Anchor Positioning

> 出典: https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> 執筆日: 2024年
> 追加日: 2025-12-17

要素を他の要素に相対的に配置する宣言的方法。ポップオーバーやツールチップに最適。

## 基本的な使い方

```css
/* アンカー要素 */
.anchor {
  anchor-name: --my-anchor;
}

/* 配置される要素 */
.tooltip {
  position: fixed;
  position-anchor: --my-anchor;
  position-area: block-end;  /* アンカーの下に配置 */
}
```

## position-area の値

| 値 | 配置 |
|----|------|
| `block-start` | 上 |
| `block-end` | 下 |
| `inline-start` | 左 |
| `inline-end` | 右 |
| `center` | 中央 |

## ユースケース

### ツールチップ

```css
.button {
  anchor-name: --button;
}

.tooltip {
  position: fixed;
  position-anchor: --button;
  position-area: block-start; /* ボタンの上 */
  margin-bottom: 8px;
}
```

### ドロップダウンメニュー

```css
.menu-button {
  anchor-name: --menu;
}

.dropdown {
  position: fixed;
  position-anchor: --menu;
  position-area: block-end inline-start; /* 左下 */
  margin-top: 4px;
}
```

### コンテキストメニュー

```css
.trigger {
  anchor-name: --context;
}

.context-menu {
  position: fixed;
  position-anchor: --context;
  position-area: inline-end block-start; /* 右上 */
}
```

## 従来の方法との比較

```javascript
// 従来: JavaScript が必要
const button = document.querySelector('.button');
const tooltip = document.querySelector('.tooltip');

const rect = button.getBoundingClientRect();
tooltip.style.top = `${rect.bottom + 8}px`;
tooltip.style.left = `${rect.left}px`;
```

```css
/* Anchor Positioning: CSS のみ */
.button {
  anchor-name: --button;
}

.tooltip {
  position: fixed;
  position-anchor: --button;
  position-area: block-end;
  margin-top: 8px;
}
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 125+ |
| Firefox | フラグ付き |
| Safari | 未対応 |

## Polyfill

Anchor Positioning は Polyfill が提供されています:
```html
<script src="https://unpkg.com/@oddbird/css-anchor-positioning"></script>
```

## 関連ナレッジ

- [Popover API](./popover-api.md)
- [Tooltip パターン](../../cross-cutting/design-patterns/tooltip.md)
