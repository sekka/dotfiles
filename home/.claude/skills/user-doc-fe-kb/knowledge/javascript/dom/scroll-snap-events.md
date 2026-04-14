---
title: スクロールスナップイベント
category: javascript/dom
tags: [scroll-snap, events, scrollsnapchange, 2024]
browser_support: Chrome 129+
created: 2025-01-16
updated: 2025-01-16
---

# スクロールスナップイベント

> 出典: https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> 執筆日: 2024年
> 追加日: 2025-12-17

JavaScript でスクロールスナップの完了を検知。

## 基本的な使い方

```javascript
const container = document.querySelector('.snap-container');

// スナップ完了時
container.addEventListener('scrollsnapchange', (e) => {
  console.log('Snapped to:', e.snapTargetBlock, e.snapTargetInline);
});

// スナップ途中（ターゲットが変わった時）
container.addEventListener('scrollsnapchanging', (e) => {
  console.log('Snapping to:', e.snapTargetBlock, e.snapTargetInline);
});
```

## イベントプロパティ

| プロパティ | 説明 |
|-----------|------|
| `snapTargetBlock` | ブロック方向のスナップターゲット要素 |
| `snapTargetInline` | インライン方向のスナップターゲット要素 |

## ユースケース

### カルーセルのインジケーター

```javascript
const carousel = document.querySelector('.carousel');
const indicators = document.querySelectorAll('.indicator');

carousel.addEventListener('scrollsnapchange', (e) => {
  const index = Array.from(carousel.children).indexOf(e.snapTargetBlock);

  indicators.forEach((indicator, i) => {
    indicator.classList.toggle('active', i === index);
  });
});
```

### スライドカウンター

```javascript
const slider = document.querySelector('.slider');
const counter = document.querySelector('.counter');

slider.addEventListener('scrollsnapchange', (e) => {
  const currentIndex = Array.from(slider.children).indexOf(e.snapTargetBlock) + 1;
  const total = slider.children.length;
  counter.textContent = `${currentIndex} / ${total}`;
});
```

### 自動再生の一時停止

```javascript
const carousel = document.querySelector('.carousel');
let autoplayTimer;

// ユーザーがスクロール中は自動再生を停止
carousel.addEventListener('scrollsnapchanging', () => {
  clearTimeout(autoplayTimer);
});

// スナップ完了後に自動再生を再開
carousel.addEventListener('scrollsnapchange', () => {
  autoplayTimer = setTimeout(() => {
    // 次のスライドへ
  }, 3000);
});
```

## CSS 設定

```css
.snap-container {
  scroll-snap-type: x mandatory;
  overflow-x: scroll;
  display: flex;
}

.snap-item {
  scroll-snap-align: start;
  flex: 0 0 100%;
}
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 129+ |
| Firefox | 未対応 |
| Safari | 未対応 |

## Polyfill

```javascript
// 簡易的なフォールバック
if (!('onscrollsnapchange' in window)) {
  let lastScrollLeft = 0;
  let scrollTimeout;

  container.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (container.scrollLeft !== lastScrollLeft) {
        lastScrollLeft = container.scrollLeft;
        // スナップ完了を検知
        const event = new CustomEvent('scrollsnapchange');
        container.dispatchEvent(event);
      }
    }, 150);
  });
}
```

## 関連ナレッジ

- [CSS Scroll Snap](../../css/layout/scroll-snap.md)
- [Intersection Observer](./intersection-observer.md)
