---
title: border-radius 100vmax
category: css/values
tags: [border-radius, pill-button, shape]
browser_support: 全ブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# border-radius: 100vmax

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

どんなサイズでも完全な丸みを実現。

## 基本的な使い方

```css
.pill-button {
  border-radius: 100vmax;
  padding: 0.5em 1.5em;
}
```

## 50% との違い

`50%` だと楕円になる場合があるが、`100vmax` なら常に端が半円。

```css
/* 50%: 縦横比が異なると楕円になる */
.button {
  border-radius: 50%;
  padding: 10px 30px; /* 楕円になる */
}

/* 100vmax: 常に完全な丸み */
.button {
  border-radius: 100vmax;
  padding: 10px 30px; /* 完璧なピル形状 */
}
```

## ユースケース

### ピルボタン

```css
.pill-button {
  border-radius: 100vmax;
  padding: 0.75rem 2rem;
  background: #667eea;
  color: white;
  border: none;
}
```

### タグ・バッジ

```css
.badge {
  border-radius: 100vmax;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  background: #f0f0f0;
}
```

### 検索ボックス

```css
.search-input {
  border-radius: 100vmax;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
}
```

## 関連ナレッジ

- [clip-path](../visual/clip-path.md)
- [shape() 関数](../visual/shape-function.md)
