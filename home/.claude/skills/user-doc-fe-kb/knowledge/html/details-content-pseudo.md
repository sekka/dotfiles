---
title: ::details-content 疑似要素
category: html
tags: [details, pseudo-element, animation, 2024]
browser_support: Chrome 131+
created: 2025-01-16
updated: 2025-01-16
---

# ::details-content 疑似要素

> 出典: https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> 執筆日: 2024年
> 追加日: 2025-12-17

details 要素のコンテンツ部分をスタイリング。水平レイアウトも可能に。

## 基本的な使い方

```css
details::details-content {
  padding: 1rem;
  background: #f5f5f5;
  transition: height 0.3s;
}
```

## 水平アコーディオン

```css
details {
  display: flex;
  flex-direction: row;
}

details::details-content {
  width: 0;
  overflow: hidden;
  transition: width 0.3s;
}

details[open]::details-content {
  width: auto;
}
```

## ユースケース

### アニメーション付きアコーディオン

```css
details::details-content {
  padding: 0 1rem;
  transition: padding 0.3s, background 0.3s;
  background: transparent;
}

details[open]::details-content {
  padding: 1rem;
  background: #f9f9f9;
}
```

### サイドバー展開

```css
details {
  display: flex;
  height: 100vh;
}

summary {
  writing-mode: vertical-rl;
  padding: 1rem;
}

details::details-content {
  width: 0;
  overflow: hidden;
  transition: width 0.4s;
}

details[open]::details-content {
  width: 300px;
}
```

### カードの展開

```css
.card details::details-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s, padding 0.3s;
  padding: 0 1rem;
}

.card details[open]::details-content {
  max-height: 500px;
  padding: 1rem;
}
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 131+ |
| Firefox | 未対応 |
| Safari | 未対応 |

## 注意点

- 非常に新しい機能のため、ブラウザ対応が限定的
- フォールバックを用意することを推奨

```css
/* フォールバック */
details > *:not(summary) {
  padding: 1rem;
}

/* ::details-content 対応ブラウザ */
@supports (selector(::details-content)) {
  details::details-content {
    padding: 1rem;
  }
}
```

## 関連ナレッジ

- [details 排他的アコーディオン](./details-accordion.md)
- [CSS Transitions](../css/animation/transitions.md)
