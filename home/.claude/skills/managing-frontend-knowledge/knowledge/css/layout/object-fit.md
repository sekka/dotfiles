---
title: object-fit / object-position
category: css/layout
tags: [object-fit, image, video, layout]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# object-fit / object-position

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

画像のトリミング方法を指定。

## 基本的な使い方

```css
.thumbnail {
  width: 200px;
  height: 200px;
  object-fit: cover; /* アスペクト比を維持してトリミング */
  object-position: center top; /* トリミング位置 */
}
```

## object-fit の値

| 値 | 説明 |
|----|------|
| `cover` | 領域を埋める（はみ出し部分はトリミング） |
| `contain` | 領域に収める（余白ができる場合あり） |
| `fill` | 領域に合わせて引き伸ばす（デフォルト） |
| `none` | 元のサイズのまま |

## ユースケース

### サムネイル画像

```css
.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  object-position: center;
}
```

### ビデオ背景

```css
.video-background {
  position: fixed;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
}
```

### トリミング位置の調整

```css
/* 顔写真は上部を優先 */
.avatar {
  object-fit: cover;
  object-position: center top;
}

/* ロゴは中央 */
.logo {
  object-fit: contain;
  object-position: center;
}
```

## 関連ナレッジ

- [aspect-ratio](./aspect-ratio.md)
- [Image 最適化](../../cross-cutting/performance/image-optimization.md)
