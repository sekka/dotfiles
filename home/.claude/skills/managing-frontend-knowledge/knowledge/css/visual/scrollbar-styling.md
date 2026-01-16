---
title: scrollbar-color と scrollbar-width
category: css/visual
tags: [scrollbar, styling, customization, 2024]
browser_support: Chrome 121+, Firefox 64+
created: 2025-01-16
updated: 2025-01-16
---

# scrollbar-color と scrollbar-width

> 出典: https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> 執筆日: 2024年
> 追加日: 2025-12-17

標準化されたスクロールバーのスタイル設定。

## 基本的な使い方

```css
.scroller {
  scrollbar-color: hotpink navy;  /* thumb track */
  scrollbar-width: thin;          /* auto | thin | none */
}
```

## scrollbar-width

| 値 | 説明 |
|----|------|
| `auto` | デフォルト幅 |
| `thin` | 細いスクロールバー |
| `none` | スクロールバーを非表示 |

```css
/* 細いスクロールバー */
.narrow-scroll {
  scrollbar-width: thin;
}

/* スクロールバーを隠す */
.hidden-scroll {
  scrollbar-width: none;
}
```

## scrollbar-color

```css
/* thumb と track の色を指定 */
.colorful-scroll {
  scrollbar-color: #667eea #f0f0f0;
}

/* 単色 */
.simple-scroll {
  scrollbar-color: auto;
}
```

## ダークモード対応

```css
.scroller {
  scrollbar-color: light-dark(#888 #eee, #666 #222);
  scrollbar-width: thin;
}
```

または

```css
@media (prefers-color-scheme: light) {
  .scroller {
    scrollbar-color: #888 #eee;
  }
}

@media (prefers-color-scheme: dark) {
  .scroller {
    scrollbar-color: #666 #222;
  }
}
```

## WebKit 固有のスタイリング（補足）

```css
/* WebKit 系ブラウザ（Safari, Chrome） */
.scroller::-webkit-scrollbar {
  width: 12px;
}

.scroller::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.scroller::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 6px;
}

.scroller::-webkit-scrollbar-thumb:hover {
  background: #666;
}
```

## 推奨パターン

```css
/* 標準プロパティを優先 */
.scroller {
  scrollbar-width: thin;
  scrollbar-color: #888 #f0f0f0;
}

/* WebKit フォールバック */
.scroller::-webkit-scrollbar {
  width: 8px;
}

.scroller::-webkit-scrollbar-thumb {
  background: #888;
}

.scroller::-webkit-scrollbar-track {
  background: #f0f0f0;
}
```

## ブラウザ対応

| ブラウザ | scrollbar-color | scrollbar-width |
|----------|----------------|-----------------|
| Chrome/Edge | 121+ | 121+ |
| Firefox | 64+ | 64+ |
| Safari | 未対応 | 未対応 |

## 関連ナレッジ

- [Overflow スクロール](../layout/overflow.md)
- [Custom Scrollbar パターン](../../cross-cutting/design-patterns/custom-scrollbar.md)
