---
title: currentColor
category: css/values
tags: [currentColor, color, inheritance]
browser_support: 全ブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# currentColor

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

親要素の `color` を参照。

## 基本的な使い方

```css
.button {
  color: #0066cc;
  border: 1px solid currentColor;
}

.button svg {
  fill: currentColor;
}

/* ホバーで色が変わると全て連動 */
.button:hover {
  color: #004499;
}
```

## ユースケース

### アイコンとテキストの色統一

```css
.link {
  color: #0066cc;
}

.link svg {
  fill: currentColor; /* テキスト色と自動的に同期 */
}

.link:hover {
  color: #004499; /* SVGも自動的に変わる */
}
```

### ボーダーとテキストの色連動

```css
.tag {
  color: #ff6b6b;
  border: 2px solid currentColor;
  background: transparent;
}

.tag:hover {
  color: white;
  background: #ff6b6b;
  /* ボーダーは white になる */
}
```

### テーマカラーの一元管理

```css
.card {
  --theme-color: #667eea;
  color: var(--theme-color);
}

.card-icon {
  fill: currentColor;
}

.card-border {
  border-top: 3px solid currentColor;
}
```

## メリット

- DRYな色管理
- テーマ変更が容易
- SVGアイコンの色制御に最適

## 関連ナレッジ

- [CSS Variables](./css-variables.md)
- [Color Functions](./color-functions.md)
