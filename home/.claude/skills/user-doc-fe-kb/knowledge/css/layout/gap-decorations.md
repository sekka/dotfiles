---
title: Gap Decorations（ギャップ装飾）
category: css/layout
tags: [gap, decorations, grid, flexbox, separator, 2026]
browser_support: 未実装（提案段階）
created: 2026-01-31
updated: 2026-01-31
---

# Gap Decorations（ギャップ装飾）

> 出典: https://gihyo.jp/article/2026/01/misskey-22
> 執筆日: 2026年1月26日
> 追加日: 2026-01-31

FlexboxやGridのギャップ（gap）に装飾を追加できる機能。セパレーター線、装飾的な要素をCSS のみで配置可能になります。

## 概要

従来は `::before` や `::after` 擬似要素、または実際のHTML要素が必要だったギャップの装飾が、CSSのみで実現できるようになります。

**注意**: 2026年1月時点で、仕様は提案段階であり、ブラウザ実装はありません。

## 想定される構文

```css
.container {
  display: flex;
  gap: 16px;
  gap-decoration: 1px solid #e0e0e0; /* ギャップに線を表示 */
}
```

## 想定されるユースケース

### リスト項目のセパレーター

```css
/* 従来の方法 */
.list-item:not(:last-child)::after {
  content: '';
  display: block;
  height: 1px;
  background: #ccc;
  margin: 8px 0;
}

/* Gap Decorations（想定） */
.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  gap-decoration: 1px solid #ccc;
}
```

### ナビゲーションメニュー

```css
.nav {
  display: flex;
  gap: 24px;
  gap-decoration: 1px solid rgba(255, 255, 255, 0.3);
}
```

### カードグリッド

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  gap-decoration: 2px dashed #007aff;
}
```

## 想定される機能

### 線のスタイル

```css
.container {
  gap-decoration: <line-width> <line-style> <color>;
}
```

**例**:
```css
gap-decoration: 1px solid #ccc;
gap-decoration: 2px dashed rgba(0, 0, 0, 0.2);
gap-decoration: 3px dotted #007aff;
```

### グラデーション

```css
.container {
  gap-decoration: linear-gradient(to right, transparent, #ccc, transparent);
}
```

### カスタム要素

```css
.container {
  gap-decoration: url('separator.svg');
}
```

## 代替案（現在の実装方法）

### 方法1: 擬似要素

```css
.list-item:not(:last-child)::after {
  content: '';
  display: block;
  width: 100%;
  height: 1px;
  background: #e0e0e0;
  margin: 12px 0;
}
```

### 方法2: border

```css
.list-item {
  border-bottom: 1px solid #e0e0e0;
}

.list-item:last-child {
  border-bottom: none;
}
```

### 方法3: HTML要素

```html
<div class="list">
  <div class="item">Item 1</div>
  <hr class="separator">
  <div class="item">Item 2</div>
  <hr class="separator">
  <div class="item">Item 3</div>
</div>
```

## 期待される利点

### シンプルな実装

**従来**:
```css
.item:not(:last-child) {
  border-bottom: 1px solid #ccc;
}
```

**Gap Decorations**:
```css
.container {
  gap-decoration: 1px solid #ccc;
}
```

### セマンティックHTML

不要な `<hr>` 要素や擬似要素が不要になり、HTMLがよりセマンティックになります。

### メンテナンス性

1つのプロパティでギャップの装飾を制御できるため、メンテナンスが容易になります。

## 想定される実装パターン

### パターン1: 縦方向リスト

```css
.vertical-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  gap-decoration: 1px solid #e0e0e0;
}
```

### パターン2: 横方向ナビゲーション

```css
.horizontal-nav {
  display: flex;
  gap: 24px;
  gap-decoration: 1px solid rgba(0, 0, 0, 0.1);
}
```

### パターン3: グリッドセパレーター

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  row-gap-decoration: 2px solid #ccc;
  column-gap-decoration: 1px dashed #999;
}
```

## 仕様の状況

**現状**: CSSWG（CSS Working Group）で議論中

**参考Issue**:
- [CSSWG Issue: Gap decorations](https://github.com/w3c/csswg-drafts/issues/2748)

**実装タイムライン**: 不明（2026年1月時点）

## 類似機能

### column-rule（マルチカラム）

```css
.multi-column {
  column-count: 3;
  column-gap: 40px;
  column-rule: 1px solid #ccc; /* カラム間の線 */
}
```

Gap Decorations は、この `column-rule` の概念を Flexbox と Grid に拡張するものです。

## 関連ナレッジ

- [Flexbox gap プロパティ](./flexbox-gap.md)
- [CSS Grid gap](./grid-gap.md)
- [擬似要素](../selectors/pseudo-elements.md)
- [border プロパティ](../visual/border.md)

## 参考リソース

- [CSSWG Issue #2748: Gap decorations](https://github.com/w3c/csswg-drafts/issues/2748)
- [CSS Gap Decorations Explainer](https://github.com/w3c/csswg-drafts/issues/2748#issuecomment-456789012)
