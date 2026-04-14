---
title: filter（フィルター効果）
category: css/visual
tags: [filter, visual-effects, blur, grayscale]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# filter

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

画像やエレメントに視覚効果を適用。

## 基本的な使い方

```css
/* ぼかし */
.blur {
  filter: blur(10px);
}

/* グレースケール */
.grayscale {
  filter: grayscale(100%);
}

/* 複数の効果 */
.photo {
  filter: brightness(1.1) contrast(1.1) saturate(1.2);
}

/* ホバーで効果解除 */
.photo {
  filter: grayscale(100%);
  transition: filter 0.3s;
}

.photo:hover {
  filter: grayscale(0);
}
```

## フィルター関数一覧

| 関数 | 説明 | 例 |
|------|------|-----|
| `blur()` | ぼかし | `blur(5px)` |
| `brightness()` | 明るさ | `brightness(1.2)` (120%) |
| `contrast()` | コントラスト | `contrast(1.5)` |
| `grayscale()` | グレースケール | `grayscale(100%)` |
| `hue-rotate()` | 色相回転 | `hue-rotate(90deg)` |
| `invert()` | 色反転 | `invert(100%)` |
| `opacity()` | 不透明度 | `opacity(0.5)` |
| `saturate()` | 彩度 | `saturate(2)` |
| `sepia()` | セピア | `sepia(100%)` |
| `drop-shadow()` | ドロップシャドウ | `drop-shadow(2px 2px 4px rgba(0,0,0,0.5))` |

## ユースケース

### ホバーエフェクト

```css
.image-card {
  filter: grayscale(100%) brightness(0.8);
  transition: filter 0.3s;
}

.image-card:hover {
  filter: grayscale(0%) brightness(1);
}
```

### 画像の最適化

```css
/* 写真を少し明るく、コントラスト高く */
.photo {
  filter: brightness(1.05) contrast(1.1);
}
```

### ダークモード対応

```css
@media (prefers-color-scheme: dark) {
  img {
    filter: brightness(0.8) contrast(1.2);
  }
}
```

## 関連ナレッジ

- [backdrop-filter](./backdrop-filter.md)
- [mix-blend-mode](./mix-blend-mode.md)
