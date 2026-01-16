---
title: mask-composite（マスクの合成）
category: css/visual
tags: [mask, composite, visual-effects, 2024]
browser_support: Chrome 120+, Safari 15.4+, Firefox 53+
created: 2025-01-16
updated: 2025-01-16
---

# mask-composite（マスクの合成）

> 出典: https://ics.media/entry/241025/
> 執筆日: 2024-10-25
> 追加日: 2025-12-17

複数のマスク画像を組み合わせる方法を指定。2024年に主要ブラウザでサポート。

## 基本構文

```css
.element {
  mask-image: url(mask1.svg), url(mask2.svg);
  mask-composite: <値>;
}
```

## 値の種類

| 値 | 説明 | 用途 |
|----|------|------|
| `add` | マスク領域を結合 | 複数形状の統合 |
| `subtract` | 2番目を1番目から除去 | 穴あけ効果 |
| `intersect` | 重なる部分のみ表示 | 共通部分の切り出し |
| `exclude` | 重なる部分を除外 | ドーナツ形状など |

## 中央に穴を開ける

```css
.center-hole {
  mask-image:
    linear-gradient(#000, #000),        /* ベース（全体） */
    url("circle.svg");                   /* 穴の形状 */
  mask-repeat: no-repeat;
  mask-position: 0 0, center center;
  mask-size: 100% 100%, 200px 200px;
  mask-composite: exclude;              /* 穴を開ける */
}
```

## 幾何学的パターン

```css
.geometric {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  mask-image:
    radial-gradient(circle at 25% 25%, #000 50px, transparent 50px),
    radial-gradient(circle at 75% 75%, #000 50px, transparent 50px);
  mask-composite: add;                  /* 円を結合 */
}
```

## グラデーションマスクの組み合わせ

```css
.fade-edges {
  mask-image:
    linear-gradient(to right, transparent, #000 20%, #000 80%, transparent),
    linear-gradient(to bottom, transparent, #000 20%, #000 80%, transparent);
  mask-composite: intersect;            /* 両方が不透明な部分のみ表示 */
}
```

## スクロール連動アニメーション

```html
<div class="scroll-container">
  <div class="content">
    <div class="mask-element"></div>
  </div>
</div>
```

```css
.mask-element {
  mask-image:
    linear-gradient(#000, #000),
    radial-gradient(circle, #000 0, #000 100px, transparent 100px);
  mask-position: 0 0, center center;
  mask-composite: exclude;
  transition: mask-size 0.1s;
}
```

```javascript
const scrollContainer = document.querySelector(".scroll-container");
const maskElement = document.querySelector(".mask-element");

scrollContainer.addEventListener("scroll", (e) => {
  const scrollRatio = e.target.scrollTop / 100;
  const size = 100 + scrollRatio * 50; // 100px から拡大
  maskElement.style.maskSize = `100% 100%, ${size}px ${size}px`;
});
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 120+ |
| Safari | 15.4+ |
| Firefox | 53+ |

## メリット

- **レスポンシブ対応**: CSS だけで柔軟なマスク表現
- **アニメーション可能**: transition/animation と組み合わせ可能
- **軽量**: Canvas や JavaScript 不要

## 注意点

- Safari では `-webkit-mask-composite` が必要な場合あり
- 古い Safari の値は異なる（`source-over`, `source-out` 等）

```css
/* クロスブラウザ対応 */
.element {
  -webkit-mask-composite: xor;      /* Safari（古い構文） */
  mask-composite: exclude;          /* 標準 */
}
```

## 関連ナレッジ

- [clip-path](./clip-path.md)
- [CSS Filter](./filter.md)
