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

## anchor-size() 関数

> 出典: https://ics.media/entry/251215/
> 執筆日: 2025年12月15日
> 追加日: 2026-01-19

**機能**: アンカー要素の寸法に基づいて相対的なサイズ指定を可能にします。

```css
.style {
  position: absolute;
  width: anchor-size(width);
  height: anchor-size(height);
}
```

**構文**:
```css
anchor-size(<size-reference>)
```

**指定可能な値**:
- `width`: アンカー要素の幅
- `height`: アンカー要素の高さ
- `inline`: インライン方向のサイズ
- `block`: ブロック方向のサイズ

**実用例: スケーリングツールチップ**

```css
/* アンカー要素（アニメーションでスケールするアイコン） */
.heart-icon {
  position: absolute;
  animation: pulse-heart 10s ease-in-out infinite;
  anchor-name: --tooltip-anchor;
}

/* ツールチップ（アイコンのサイズに追従） */
.tooltip {
  position: absolute;
  width: calc(anchor-size(width) * 4);
  height: calc(anchor-size(width) * 2.5);
  position-anchor: --tooltip-anchor;
}
```

**ユースケース**:
- アンカー要素に追従する装飾要素
- リサイズやアニメーションの変化に自動対応するUI
- JavaScript不要な自動サイズ同期

**ブラウザサポート**:
- Chrome/Edge: 125+（2024年5月）
- Safari: 26.0+（2025年9月）
- Firefox: 147+（2026年1月）

## ブラウザ対応

| ブラウザ | バージョン | 備考 |
|----------|-----------|------|
| Chrome/Edge | 125+ | anchor-size() 対応 |
| Firefox | 147+ | 2026年1月対応 |
| Safari | 26.0+ | 2025年9月対応 |

## Polyfill

Anchor Positioning は Polyfill が提供されています:
```html
<script src="https://unpkg.com/@oddbird/css-anchor-positioning"></script>
```

## 関連ナレッジ

- [Anchor Positioning と Popover API の統合](./anchor-positioning-popover.md) - 実践的な組み合わせパターン
- [Popover API](./popover-api.md)
- [Tooltip パターン](../../cross-cutting/design-patterns/tooltip.md)
