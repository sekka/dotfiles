---
title: スクロール可能方向を示すシャドウとフェードアウト
category: css/animation
tags: [scroll, shadow, fade, mask, scroll-timeline, @property, 2025]
browser_support: Chrome 115+, Safari 26.0+（Firefox は未対応）
created: 2026-01-19
updated: 2026-01-19
---

# スクロール可能方向を示すシャドウとフェードアウト

> 出典: https://css-notes.com/tips/scroll-hint-shadow
> 執筆日: 2025年12月22日
> 追加日: 2026-01-19

CSS のスクロール駆動アニメーションを使って、JavaScript なしでスクロール可能な方向をシャドウやフェードアウトで視覚的に示す手法。

## 基本コンセプト

スクロールコンテナの端に、以下の視覚効果を表示：
- **フェードアウト**: コンテンツが続いていることを示唆
- **シャドウ**: スクロール方向を矢印のように示す

## 1. フェードアウト方式

### 基本実装

```css
.u-scFade\:y {
  mask-image: linear-gradient(
    to bottom,
    transparent,
    black 2rem,
    black calc(100% - 2rem),
    transparent
  );
  animation: scFade-y linear;
  animation-timeline: scroll();
}

@keyframes scFade-y {
  0% {
    mask-image: linear-gradient(
      to bottom,
      black,
      black calc(100% - 2rem),
      transparent
    );
  }
  100% {
    mask-image: linear-gradient(
      to bottom,
      transparent,
      black 2rem,
      black
    );
  }
}
```

### 動作原理

1. **スクロール位置 0%（最上部）**: 下端のみフェードアウト
2. **スクロール位置 50%（中間）**: 上下両端ともフェードアウト
3. **スクロール位置 100%（最下部）**: 上端のみフェードアウト

### 横スクロール版

```css
.u-scFade\:x {
  mask-image: linear-gradient(
    to right,
    transparent,
    black 2rem,
    black calc(100% - 2rem),
    transparent
  );
  animation: scFade-x linear;
  animation-timeline: scroll(x);
}

@keyframes scFade-x {
  0% {
    mask-image: linear-gradient(
      to right,
      black,
      black calc(100% - 2rem),
      transparent
    );
  }
  100% {
    mask-image: linear-gradient(
      to right,
      transparent,
      black 2rem,
      black
    );
  }
}
```

## 2. シャドウ方式

### 基本実装

```css
/* ラッパー（親要素） */
.u-scShadow {
  position: relative;
}

/* スクロールコンテナ */
.u-scShadow\:y {
  animation: scShadow-y linear;
  animation-timeline: scroll();
}

/* 擬似要素でシャドウを表示 */
.u-scShadow::before,
.u-scShadow::after {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  height: 1rem;
  pointer-events: none;
  transition: opacity 0.3s;
}

.u-scShadow::before {
  top: 0;
  box-shadow: inset 0 1rem 1rem -1rem rgba(0, 0, 0, 0.3);
}

.u-scShadow::after {
  bottom: 0;
  box-shadow: inset 0 -1rem 1rem -1rem rgba(0, 0, 0, 0.3);
}

@keyframes scShadow-y {
  0% {
    --shadow-top: 0;
    --shadow-bottom: 1;
  }
  100% {
    --shadow-top: 1;
    --shadow-bottom: 0;
  }
}
```

### @property を使った実装

```css
@property --shadow-top {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}

@property --shadow-bottom {
  syntax: '<number>';
  inherits: false;
  initial-value: 1;
}

.u-scShadow::before {
  opacity: var(--shadow-top);
}

.u-scShadow::after {
  opacity: var(--shadow-bottom);
}
```

## 実践例

### 縦スクロールリスト

```html
<div class="scroll-container u-scFade:y">
  <ul class="list">
    <li>アイテム 1</li>
    <li>アイテム 2</li>
    <!-- ... -->
    <li>アイテム 20</li>
  </ul>
</div>
```

```css
.scroll-container {
  height: 300px;
  overflow-y: auto;
  mask-image: linear-gradient(
    to bottom,
    transparent,
    black 2rem,
    black calc(100% - 2rem),
    transparent
  );
  animation: scFade-y linear;
  animation-timeline: scroll();
}
```

### 横スクロールカルーセル

```html
<div class="carousel u-scFade:x">
  <div class="carousel-item">Item 1</div>
  <div class="carousel-item">Item 2</div>
  <div class="carousel-item">Item 3</div>
</div>
```

```css
.carousel {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  mask-image: linear-gradient(
    to right,
    transparent,
    black 2rem,
    black calc(100% - 2rem),
    transparent
  );
  animation: scFade-x linear;
  animation-timeline: scroll(x);
}

.carousel-item {
  flex: 0 0 200px;
}
```

### シャドウ付きスクロールエリア

```html
<div class="u-scShadow">
  <div class="u-scShadow:y scroll-content">
    <!-- コンテンツ -->
  </div>
</div>
```

```css
.u-scShadow {
  position: relative;
  height: 400px;
}

.scroll-content {
  height: 100%;
  overflow-y: auto;
  animation: scShadow-y linear;
  animation-timeline: scroll();
}
```

## 応用パターン

### グラデーション範囲のカスタマイズ

```css
.custom-fade {
  mask-image: linear-gradient(
    to bottom,
    transparent,
    black 4rem,  /* 上端のフェード範囲を広げる */
    black calc(100% - 4rem),
    transparent
  );
}
```

### カラーシャドウ

```css
.colored-shadow::before {
  box-shadow: inset 0 1rem 2rem -1rem rgba(59, 130, 246, 0.5); /* 青色 */
}

.colored-shadow::after {
  box-shadow: inset 0 -1rem 2rem -1rem rgba(59, 130, 246, 0.5);
}
```

### フェードとシャドウの併用

```html
<div class="u-scShadow">
  <div class="u-scFade:y u-scShadow:y scroll-area">
    <!-- コンテンツ -->
  </div>
</div>
```

## ブラウザサポート

| 機能 | Chrome | Safari | Firefox |
|------|--------|--------|---------|
| `animation-timeline: scroll()` | 115+ (2023年8月) | 26.0+ (2025年) | ❌ 未対応 |
| `@property` | 85+ (2020年8月) | 16.4+ (2023年3月) | 128+ (2024年7月) |
| `mask-image` | 120+ | 15.4+ | 53+ |

### フォールバック

```css
/* フォールバック: 常に両端をフェード */
.scroll-container {
  mask-image: linear-gradient(
    to bottom,
    transparent,
    black 2rem,
    black calc(100% - 2rem),
    transparent
  );
}

/* スクロール駆動アニメーション対応ブラウザのみ */
@supports (animation-timeline: scroll()) {
  .scroll-container {
    animation: scFade-y linear;
    animation-timeline: scroll();
  }
}
```

## パフォーマンス考慮事項

```css
/* GPU アクセラレーションの活用 */
.scroll-container {
  will-change: mask-image; /* アニメーション中のみ */
}

/* スクロール停止時は will-change を解除 */
.scroll-container:not(:hover):not(:focus-within) {
  will-change: auto;
}
```

## アクセシビリティ

### モーション軽減

```css
@media (prefers-reduced-motion: reduce) {
  .u-scFade\:y,
  .u-scShadow\:y {
    animation: none;
  }

  /* 静的なフェードのみ表示 */
  .u-scFade\:y {
    mask-image: linear-gradient(
      to bottom,
      transparent,
      black 2rem,
      black calc(100% - 2rem),
      transparent
    );
  }
}
```

## ユースケース

- チャット履歴のスクロールリスト
- 商品カルーセル
- サイドバーナビゲーション
- モーダル内の長いコンテンツ
- データテーブルの横スクロール

## Tips

### スクロールスナップとの併用

```css
.carousel {
  scroll-snap-type: x mandatory;
  animation: scFade-x linear;
  animation-timeline: scroll(x);
}

.carousel-item {
  scroll-snap-align: start;
}
```

### スムーススクロール

```css
.scroll-container {
  scroll-behavior: smooth;
  animation: scFade-y linear;
  animation-timeline: scroll();
}
```

## 参考リソース

- [MDN: animation-timeline](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline)
- [MDN: @property](https://developer.mozilla.org/ja/docs/Web/CSS/@property)
- [CSS Scroll-driven Animations](https://scroll-driven-animations.style/)

---
