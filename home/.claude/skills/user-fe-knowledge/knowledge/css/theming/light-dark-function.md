---
title: light-dark() 関数
category: css/theming
tags: [light-dark, dark-mode, theming, color-scheme, image, 2024, 2026]
browser_support: Chrome 123+ (色), Chrome 148+ (画像/フラグ), Firefox 120+, Safari 17.5+
created: 2025-01-16
updated: 2026-05-18
---

# light-dark() 関数

> 出典:
> - https://coliss.com/articles/build-websites/operation/css/css-in-2024.html (2024)
> - https://coliss.com/articles/build-websites/operation/css/light-dark-support-images.html (2026-03-26) — 画像サポート追加
>
> 追加日: 2025-12-17 / 更新: 2026-05-18

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

## 画像（`<image>`）サポート（2026 追加）

Chrome 148+（フラグ有効時）から `light-dark()` が画像値も受け取れるようになった。Firefox は 150 で対応予定、Safari は未対応。

### 従来パターン（CSS 変数 + メディアクエリ）

```css
:root { --bg-image: url(light-pattern.png); }
@media (prefers-color-scheme: dark) {
  :root { --bg-image: url(dark-pattern.png); }
}
.element { background-image: var(--bg-image); }
```

### 新パターン

```css
.element {
  color-scheme: light dark;
  background-image: light-dark(
    url(light-pattern.png),
    url(dark-pattern.png)
  );
}
```

### 制限事項

- 2 つの引数は **同じ型** である必要がある（色×色、画像×画像のみ）
- 色と画像の混在は不可（パーサーが事前に型を解決する必要があるため）

### フォールバック検出

```css
@supports (background-image: light-dark(
  linear-gradient(white, white),
  linear-gradient(black, black))) {
  /* 画像サポート環境のみ */
}
```

### ローカル `color-scheme` の利点

`@media (prefers-color-scheme)` 方式と違い、要素レベルの `color-scheme` 指定を正確に反映する。テーマトグルでルートだけ切り替えるような UI にも対応しやすい。

## 関連ナレッジ

- [OKLCH カラー](./oklch-color.md) - 知覚的均一性を持つ色空間、ダークモード対応
- [Dark Mode 実装](./dark-mode-implementation.md)
- [color-scheme プロパティ](./color-scheme.md)
