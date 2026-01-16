---
title: interpolate-size プロパティ
category: css/animation
tags: [interpolate-size, animation, auto, height, 2024]
browser_support: Chrome 129+
created: 2025-01-16
updated: 2025-01-16
---

# interpolate-size プロパティ

> 出典: https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> 執筆日: 2024年
> 追加日: 2025-12-17

`height: auto` や `width: auto` へのアニメーションを実現。

## 基本的な使い方

```css
:root {
  interpolate-size: allow-keywords;
}

.accordion-content {
  height: 0;
  overflow: hidden;
  transition: height 0.3s;
}

.accordion.open .accordion-content {
  height: auto;
}
```

## 動作原理

従来、`height: 0` から `height: auto` へのトランジションは不可能でした。`interpolate-size: allow-keywords` を指定することで、`auto` などのキーワード値へのアニメーションが可能になります。

## ユースケース

### アコーディオン

```css
:root {
  interpolate-size: allow-keywords;
}

.accordion-content {
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease-out;
}

.accordion[open] .accordion-content {
  height: auto;
}
```

### 展開可能なカード

```css
.card {
  height: 200px;
  overflow: hidden;
  transition: height 0.4s;
}

.card.expanded {
  height: auto;
}
```

### トグル可能なサイドバー

```css
.sidebar {
  width: 0;
  transition: width 0.3s;
}

.sidebar.open {
  width: auto;
  max-width: 300px;
}
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 129+ |
| Firefox | 未対応 |
| Safari | 未対応 |

## フォールバック

```css
:root {
  interpolate-size: allow-keywords;
}

/* 非対応ブラウザ用 */
@supports not (interpolate-size: allow-keywords) {
  .accordion-content {
    max-height: 0;
    transition: max-height 0.3s;
  }

  .accordion.open .accordion-content {
    max-height: 1000px; /* 十分な高さを指定 */
  }
}
```

## 関連ナレッジ

- [@starting-style](./starting-style.md)
- [CSS Transitions](./transitions.md)
