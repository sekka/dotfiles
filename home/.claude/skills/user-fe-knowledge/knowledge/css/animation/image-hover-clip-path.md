---
title: 画像ホバーで拡大＋clip-path マスク
category: css/animation
tags: [hover, clip-path, inset, scale, image, mask, transition, 2026]
browser_support: 全モダンブラウザ (clip-path inset + scale)
created: 2026-05-18
updated: 2026-05-18
---

# 画像ホバーで拡大＋clip-path マスク

> 出典: https://coliss.com/articles/build-websites/operation/css/css-image-hover-scaley-mask.html
> 追加日: 2026-05-18

画像ホバー時に拡大しつつ、`overflow: hidden` の親要素を使わずに `clip-path: inset()` で直接クリッピングする手法。`img` タグ単体で完結し、ラッパー `div` が不要。

## 基本コード

```css
img {
  transition: scale 0.4s ease, clip-path 0.4s ease;
}

img:hover {
  scale: 1.2;
  clip-path: inset(10% 10% 10% 10% round 20px);
}
```

```html
<img src="..." width="600" height="600" alt="...">
```

## なぜ `overflow: hidden` ラッパー不要なのか

| 従来手法 | clip-path 手法 |
|----------|----------------|
| `<div style="overflow:hidden"><img></div>` | `<img>` 単体 |
| ラッパーが拡大領域を切り抜く | `img` 自身がクリップ領域を持つ |
| 角丸はラッパー側に `border-radius` | `clip-path` の `round` で完結 |

DOM がフラットになり、命名も不要になる。

## clip-path: inset() の構文

```
inset(<top> <right> <bottom> <left> round <radius>)
```

- 内側からのオフセットを指定（`%` / `px`）
- `round` で角丸を付与（`border-radius` と同じ書式）
- 4 値・3 値・2 値・1 値の省略形可（margin/padding と同じルール）

```css
/* 全方向 10% */
clip-path: inset(10%);

/* 上下 5% 左右 15% */
clip-path: inset(5% 15%);

/* 角丸 */
clip-path: inset(10% round 20px);

/* 楕円的な角丸 */
clip-path: inset(10% round 20px / 10px);
```

## アクセシビリティ — prefers-reduced-motion

OS 側でモーション削減が有効な場合はアニメーションを無効化:

```css
img {
  transition: scale 0.4s ease, clip-path 0.4s ease;
}

img:hover {
  scale: 1.2;
  clip-path: inset(10% round 20px);
}

@media (prefers-reduced-motion: reduce) {
  img {
    transition: none;
  }
  img:hover {
    scale: 1;
    clip-path: none;
  }
}
```

## 応用パターン

### 中央から開く

```css
img {
  clip-path: inset(50% 50% 50% 50% round 20px);
  transition: clip-path 0.6s ease;
}

img:hover {
  clip-path: inset(0% 0% 0% 0% round 20px);
}
```

### 横方向のみシュリンク

```css
img:hover {
  scale: 1.15;
  clip-path: inset(0 10% round 12px);
}
```

### グリッドギャラリーで一括適用

```css
.gallery img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  transition: scale 0.4s, clip-path 0.4s;
}

.gallery img:hover {
  scale: 1.2;
  clip-path: inset(8% round 16px);
}
```

## 注意点

- `scale` プロパティは独立した変換軸として `transform` と併用可能（`independent-transforms`）
- `clip-path` でクリップした領域は**ヒットテストにも影響する** — クリップ外はホバー判定外。`img:hover` の判定は元の矩形のままなので問題ないが、`:hover` 中にクリップで縮むと再判定が起きてフリッカーする場合あり → `transition` を `clip-path` に必ず付ける
- パフォーマンス: `clip-path` の補間はコンポジターレイヤで処理されないブラウザもあるため、大量要素では注意

## 関連ナレッジ

- [clip-path](../visual/clip-path.md)
- [clip-path-shape (shape() 関数)](../visual/clip-path-shape.md)
- [independent-transforms (scale プロパティ)](./independent-transforms.md)
- [elastic-hover](./elastic-hover.md)

## 参考リソース

- [Coliss: シンプルなCSSで画像のホバー時に拡大＆マスク処理](https://coliss.com/articles/build-websites/operation/css/css-image-hover-scaley-mask.html)
- [MDN: clip-path](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path)
