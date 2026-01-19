---
title: スクロール連動アニメーション（IntersectionObserver）
category: javascript/dom
tags: [scroll, animation, intersection-observer, accessibility, performance, 2025]
browser_support: モダンブラウザ
created: 2026-01-19
updated: 2026-01-19
---

# スクロール連動アニメーション（IntersectionObserver）

> 出典: https://www.tak-dcxi.com/article/scroll-linked-animation-implementation-examples
> 執筆日: 2025年
> 追加日: 2026-01-19

スクロール時に要素が画面内に入ったタイミングでアニメーションを実行する実装パターン。**IntersectionObserver API**を使用した効率的な監視メカニズムです。

## 主な技術

- **IntersectionObserver API** - 要素の可視状態を効率的に監視
- **data属性** - アニメーション状態の管理
- **prefers-reduced-motion** - アクセシビリティ対応
- **CSS Transitions/Animations** - 段階的な表示演出

## 基本実装

### HTML

```html
<div class="fade-in" data-observe-animation>
  <h2>見出し</h2>
  <p>コンテンツ...</p>
</div>
```

### CSS

```css
/* 初期状態 */
[data-observe-animation] {
  opacity: 0;
  transition: opacity 0.6s ease-out;
}

/* アニメーション実行後 */
[data-observe-animation][data-animated="true"] {
  opacity: 1;
}

/* アニメーション無効時はデフォルト表示 */
@media (prefers-reduced-motion: reduce) {
  [data-observe-animation] {
    opacity: 1;
  }
}
```

### JavaScript（TypeScript）

```typescript
const initializeObserveAnimation = () => {
  // prefers-reduced-motionのチェック
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    // アニメーション無効時は全要素を表示状態に
    document.querySelectorAll('[data-observe-animation]').forEach((el) => {
      el.setAttribute('data-animated', 'true');
    });
    return;
  }

  // IntersectionObserverの設定
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 画面内に入ったらアニメーション実行
          entry.target.setAttribute('data-animated', 'true');
          // 一度アニメーションしたら監視を解除（パフォーマンス向上）
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '0px 0px -10% 0px', // 画面下端から10%手前で発火
      threshold: 0,
    }
  );

  // 対象要素を監視
  document.querySelectorAll('[data-observe-animation]').forEach((el) => {
    observer.observe(el);
  });
};

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', initializeObserveAnimation);
```

## IntersectionObserverのオプション

### rootMargin

```typescript
{
  rootMargin: '0px 0px -10% 0px'
}
```

画面下端から10%手前でアニメーションを発火させます。

| 値 | 説明 |
|----|------|
| `'0px'` | 画面に入った瞬間 |
| `'-10% 0px 0px 0px'` | 上から10%入ったとき |
| `'0px 0px -10% 0px'` | 下から10%手前（推奨） |
| `'50px'` | 画面外50px手前 |

### threshold

```typescript
{
  threshold: 0
}
```

| 値 | 説明 |
|----|------|
| `0` | 1pxでも入ったら発火 |
| `0.5` | 50%見えたら発火 |
| `1` | 完全に見えたら発火 |
| `[0, 0.5, 1]` | 複数の閾値を設定 |

## 実装パターン

### フェードイン

```css
[data-observe-animation] {
  opacity: 0;
  transition: opacity 0.6s ease-out;
}

[data-observe-animation][data-animated="true"] {
  opacity: 1;
}
```

### スライドイン（下から）

```css
[data-observe-animation] {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.6s ease-out,
    transform 0.6s ease-out;
}

[data-observe-animation][data-animated="true"] {
  opacity: 1;
  transform: translateY(0);
}
```

### スライドイン（左から）

```css
[data-observe-animation] {
  opacity: 0;
  transform: translateX(-30px);
  transition:
    opacity 0.6s ease-out,
    transform 0.6s ease-out;
}

[data-observe-animation][data-animated="true"] {
  opacity: 1;
  transform: translateX(0);
}
```

### スケールアップ

```css
[data-observe-animation] {
  opacity: 0;
  scale: 0.8;
  transition:
    opacity 0.6s ease-out,
    scale 0.6s ease-out;
}

[data-observe-animation][data-animated="true"] {
  opacity: 1;
  scale: 1;
}
```

### clip-pathによる段階的表示

```css
[data-observe-animation] {
  clip-path: inset(0 0 100% 0);
  transition: clip-path 0.8s ease-out;
}

[data-observe-animation][data-animated="true"] {
  clip-path: inset(0);
}
```

## アクセシビリティ対応

### 1. prefers-reduced-motion 対応

```css
@media (prefers-reduced-motion: reduce) {
  [data-observe-animation] {
    opacity: 1 !important;
    transform: none !important;
    scale: 1 !important;
    transition: none !important;
  }
}
```

```typescript
// JavaScript側でも対応
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  // アニメーションをスキップ
  document.querySelectorAll('[data-observe-animation]').forEach((el) => {
    el.setAttribute('data-animated', 'true');
  });
  return;
}
```

### 2. JavaScript無効環境への対応

`display: none`や`visibility: hidden`は避け、`opacity: 0`で隠します。

```css
/* ✅ 推奨：JS無効でも表示される */
[data-observe-animation] {
  opacity: 0;
}

/* ❌ 非推奨：JS無効時に非表示のまま */
[data-observe-animation] {
  display: none;
}
```

### 3. フォーカス管理

Tab操作中のアニメーション実行を制限する検討が必要です。

```typescript
let isTabNavigating = false;

document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    isTabNavigating = true;
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !isTabNavigating) {
      entry.target.setAttribute('data-animated', 'true');
      observer.unobserve(entry.target);
    }
  });
});
```

## パフォーマンス最適化

### 1. 一度アニメーションしたら監視を解除

```typescript
if (entry.isIntersecting) {
  entry.target.setAttribute('data-animated', 'true');
  observer.unobserve(entry.target); // 監視解除
}
```

### 2. rootMarginを適切に設定

```typescript
{
  rootMargin: '0px 0px -10% 0px' // 少し手前で発火
}
```

画面に入る直前にアニメーションを開始することで、スムーズな体験を提供します。

### 3. will-changeの慎重な使用

```css
/* アニメーション直前のみ適用 */
[data-observe-animation]:not([data-animated="true"]) {
  will-change: opacity, transform;
}

[data-observe-animation][data-animated="true"] {
  will-change: auto;
}
```

## 段階的な実行（Stagger Effect）

複数の子要素を順番にアニメーションさせます。

```html
<div data-observe-animation>
  <div class="item" style="--index: 0;">項目1</div>
  <div class="item" style="--index: 1;">項目2</div>
  <div class="item" style="--index: 2;">項目3</div>
</div>
```

```css
[data-observe-animation] .item {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.4s ease-out,
    transform 0.4s ease-out;
  transition-delay: calc(var(--index) * 0.1s);
}

[data-observe-animation][data-animated="true"] .item {
  opacity: 1;
  transform: translateY(0);
}
```

## 実装時の注意点

### 1. display: noneやvisibility: hiddenを避ける

```css
/* ❌ 非推奨 */
[data-observe-animation] {
  display: none;
}

/* ✅ 推奨 */
[data-observe-animation] {
  opacity: 0;
}
```

**理由**: `display: none`はページ内検索やSEOに悪影響を与えます。

### 2. スクリプト無効環境への配慮

```html
<noscript>
  <style>
    [data-observe-animation] {
      opacity: 1 !important;
    }
  </style>
</noscript>
```

### 3. scripting メディア特性の活用

```css
/* JavaScript有効時のみアニメーション */
@media (scripting: enabled) {
  [data-observe-animation] {
    opacity: 0;
  }
}

/* JavaScript無効時は常に表示 */
@media (scripting: none) {
  [data-observe-animation] {
    opacity: 1 !important;
  }
}
```

**注意**: iOS 17以降で対応。非対応環境への配慮が必要です。

## ブラウザ対応

| ブラウザ | IntersectionObserver | scripting メディア特性 |
|---------|---------------------|---------------------|
| Chrome | 51+ | 120+ |
| Edge | 15+ | 120+ |
| Firefox | 55+ | 113+ |
| Safari | 12.1+ | 17+ |

## 関連ナレッジ

- [Scroll-driven Animations](../../css/animation/scroll-driven-animations.md)
- [テキストアニメーション](../../css/animation/text-animation.md)
- [prefers-reduced-motion対応](../accessibility/grayscale-testing.md)

## 参考リンク

- [MDN: IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [完全な実装例（TypeScript）](https://gist.github.com/tak-dcxi/scroll-animation-example)
