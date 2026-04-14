---
title: clamp()（レスポンシブな値）
category: css/values
tags: [clamp, responsive, fluid-typography, 2024]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# clamp()（レスポンシブな値）

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

最小値、推奨値、最大値を指定。メディアクエリなしでレスポンシブ対応。

## 基本的な使い方

```css
/* フォントサイズ */
.text {
  font-size: clamp(16px, 4vw, 24px);
}

/* 余白 */
.section {
  padding: clamp(20px, 5vw, 60px);
}

/* コンテナ幅 */
.container {
  width: clamp(320px, 90%, 1200px);
  margin-inline: auto;
}
```

## 構文

```css
clamp(最小値, 推奨値, 最大値)
```

- **最小値**: これより小さくならない
- **推奨値**: 通常はこの値（ビューポートに応じて変化）
- **最大値**: これより大きくならない

## ユースケース

### フルードタイポグラフィ

```css
h1 {
  font-size: clamp(2rem, 5vw, 4rem);
}

p {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
}
```

### レスポンシブ余白

```css
.card {
  padding: clamp(1rem, 3vw, 2rem);
  gap: clamp(0.5rem, 2vw, 1.5rem);
}
```

### コンテナ幅の制御

```css
.wrapper {
  width: clamp(320px, 90%, 1200px);
  margin-inline: auto;
}
```

## メリット

- メディアクエリ不要
- 滑らかなレスポンシブ対応
- コード量削減

## 注意点

- 最小値・最大値を適切に設定しないと、極端なサイズになる可能性
- `vw` 使用時はアクセシビリティ（ズーム対応）に注意

## 関連ナレッジ

- [ビューポート単位](./viewport-units.md)
- [min/max 関数](./min-max-functions.md)
