---
title: clip-path（クリッピング）
category: css/visual
tags: [clip-path, clipping, shape, visual-effects]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# clip-path

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

要素の表示領域をクリップ。

## 基本的な使い方

```css
/* 三角形 */
.triangle {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

/* 円形 */
.circle {
  clip-path: circle(50%);
}

/* 斜めカット */
.diagonal {
  clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
}
```

## クリッピング関数

| 関数 | 説明 | 例 |
|------|------|-----|
| `circle()` | 円形 | `circle(50%)` |
| `ellipse()` | 楕円 | `ellipse(40% 50%)` |
| `inset()` | 矩形（内側） | `inset(10px 20px)` |
| `polygon()` | 多角形 | `polygon(x1 y1, x2 y2, ...)` |
| `path()` | SVGパス | `path('M10,10 L...')` |

## ユースケース

### 画像のシェイプ加工

```css
.avatar {
  clip-path: circle(50%);
}

.hexagon {
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}
```

### 斜めセクション

```css
.diagonal-section {
  clip-path: polygon(0 0, 100% 0, 100% 90%, 0 100%);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rem 2rem;
}
```

### ホバーアニメーション

```css
.reveal {
  clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
  transition: clip-path 0.5s;
}

.reveal:hover {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
```

## ツール

ジェネレーター: [Clippy](https://bennettfeely.com/clippy/)

## 関連ナレッジ

- [shape() 関数](./shape-function.md)
- [mask-composite](./mask-composite.md)
