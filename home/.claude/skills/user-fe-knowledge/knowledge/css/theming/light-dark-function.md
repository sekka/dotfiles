---
title: light-dark() 関数
category: css/theming
tags: [light-dark, dark-mode, theming, color-scheme, 2024]
browser_support: Chrome 123+, Firefox 120+, Safari 17.5+
created: 2025-01-16
updated: 2025-01-16
---

# light-dark() 関数

> 出典: https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> 執筆日: 2024年
> 追加日: 2025-12-17

ライト/ダークテーマの値を一括指定。

## 基本的な使い方

```css
:root {
  color-scheme: light dark;  /* 必須: light-dark() を有効化 */
}

body {
  background-color: light-dark(#ffffff, #1a1a1a);
  color: light-dark(#333333, #f0f0f0);
}

.card {
  border: 1px solid light-dark(#e0e0e0, #404040);
  box-shadow: 0 2px 4px light-dark(rgba(0,0,0,0.1), rgba(0,0,0,0.3));
}
```

## 従来の方法との比較

```css
/* 従来: メディアクエリが必要 */
body {
  background: #ffffff;
  color: #333333;
}

@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a1a;
    color: #f0f0f0;
  }
}

/* light-dark(): シンプル */
:root {
  color-scheme: light dark;
}

body {
  background: light-dark(#ffffff, #1a1a1a);
  color: light-dark(#333333, #f0f0f0);
}
```

## ユースケース

### カラーシステム

```css
:root {
  color-scheme: light dark;

  --bg-primary: light-dark(#ffffff, #1a1a1a);
  --bg-secondary: light-dark(#f5f5f5, #2a2a2a);
  --text-primary: light-dark(#333333, #f0f0f0);
  --text-secondary: light-dark(#666666, #b0b0b0);
  --border: light-dark(#e0e0e0, #404040);
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

### ボーダーとシャドウ

```css
.card {
  background: light-dark(white, #2a2a2a);
  border: 1px solid light-dark(#ddd, #444);
  box-shadow: 0 2px 8px light-dark(
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.4)
  );
}
```

### アイコンカラー

```css
.icon {
  fill: light-dark(#333, #f0f0f0);
}

.icon-accent {
  fill: light-dark(#0066cc, #66a3ff);
}
```

## color-scheme の必須性

`light-dark()` を使用するには、`color-scheme` プロパティが必須です。

```css
/* これがないと light-dark() は動作しない */
:root {
  color-scheme: light dark;
}
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 123+ |
| Firefox | 120+ |
| Safari | 17.5+ |

## フォールバック

```css
/* フォールバック */
body {
  background: #ffffff;
  color: #333333;
}

@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a1a;
    color: #f0f0f0;
  }
}

/* light-dark() 対応ブラウザ */
@supports (background: light-dark(white, black)) {
  :root {
    color-scheme: light dark;
  }

  body {
    background: light-dark(#ffffff, #1a1a1a);
    color: light-dark(#333333, #f0f0f0);
  }
}
```

## 関連ナレッジ

- [OKLCH カラー](./oklch-color.md) - 知覚的均一性を持つ色空間、ダークモード対応
- [Dark Mode 実装](./dark-mode-implementation.md)
- [color-scheme プロパティ](./color-scheme.md)
