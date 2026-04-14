---
title: View Transitions API
category: css/animation
tags: [view-transitions, animation, spa, mpa, page-transition]
browser_support: Chrome 111+, Safari 18+, Firefox 144+ (SPA)
created: 2025-01-16
updated: 2025-01-16
---

# View Transitions API

> 出典: https://ics.media/entry/230510/
> 執筆日: 2023年5月
> 追加日: 2025-01-16

連続性のある画面遷移アニメーションを実現するウェブの新技術。

## 概要

View Transitions APIは、シンプルでスムーズな**連続性のある**アニメーションを実現する。従来のフェードイン/アウトだけでなく、要素が移動・拡大・縮小しながら遷移するアニメーションが可能。

## 主な用途

- マルチページ間の画面遷移
- モーダルダイアログの表示
- スライドショー
- UIマイクロインタラクション
- ブラウザ履歴（戻る/進む）に連動したアニメーション

## 基本実装（SPA）

### シンプルな例

```javascript
// DOM変更をView Transitionでラップ
document.startViewTransition(() => {
  // DOMを変更
  document.querySelector('#view-index').hidden = true;
  document.querySelector('#view-detail').hidden = false;
});
```

これだけで、デフォルトのクロスフェードアニメーションが適用される。

### 要素を指定してアニメーション

```html
<img src="photo.jpg" class="photo-thumbnail" />
```

```css
.photo-thumbnail {
  /* view-transition-name で要素を識別 */
  view-transition-name: photo-example;

  /* contain: paint が必須 */
  contain: paint;
}

.photo-detail {
  view-transition-name: photo-example;
  contain: paint;
}
```

**重要:** 同じ`view-transition-name`を持つ要素がアニメーションでつながる。

### アニメーションのカスタマイズ

```css
/* デフォルトのアニメーション */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}

/* 特定の要素のアニメーション */
::view-transition-old(photo-example) {
  animation: fade-out 0.5s;
}

::view-transition-new(photo-example) {
  animation: fade-in 0.5s;
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## マルチページアプリ (MPA) の実装

```css
/* CSSで有効化 */
@view-transition {
  navigation: auto;
}
```

これだけで、ページ遷移時に自動的にView Transitionが適用される。

### 同一origin制約

MPAでのView Transitionsは同一オリジン内でのみ機能。

```
✅ https://example.com/page1 → https://example.com/page2
❌ https://example.com → https://other-site.com
```

## 実践例

### 画像ギャラリー

```html
<div class="gallery">
  <img src="1.jpg" style="view-transition-name: photo-1" />
  <img src="2.jpg" style="view-transition-name: photo-2" />
</div>

<div class="lightbox" hidden>
  <img src="1.jpg" style="view-transition-name: photo-1" />
</div>
```

```javascript
function openLightbox(photoId) {
  document.startViewTransition(() => {
    document.querySelector('.gallery').hidden = true;
    document.querySelector('.lightbox').hidden = false;
  });
}
```

### モーダルダイアログ

```css
dialog {
  view-transition-name: modal-dialog;
  contain: paint;
}

::view-transition-new(modal-dialog) {
  animation: scale-up 0.3s ease-out;
}

@keyframes scale-up {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### ブラウザ履歴対応

```javascript
// 戻る/進むボタンの検知
window.addEventListener('popstate', () => {
  document.startViewTransition(() => {
    // 状態を復元
    restoreState();
  });
});
```

## ブラウザ対応

### SPAサポート
- Chrome 111+ (2023年3月)
- Edge 111+
- Safari 18.0+ (2024年9月)
- Firefox 144+ (2025年予定)

### MPAサポート
- Chrome 126+ (2024年5月)
- Edge 126+
- Safari 18.2+ (2024年12月)
- Firefox: 未対応

### フォールバック

```javascript
if (document.startViewTransition) {
  document.startViewTransition(() => {
    updateDOM();
  });
} else {
  // View Transitions未対応
  updateDOM();
}
```

## パフォーマンス考慮事項

### contain: paint の重要性

```css
.animated-element {
  view-transition-name: my-element;

  /* 必須: パフォーマンス最適化 */
  contain: paint;
}
```

`contain: paint`により、ブラウザが要素の描画範囲を最適化できる。

### アニメーション時間

```css
/* 推奨: 200-400ms */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}
```

## 関連ナレッジ

- [Scoped View Transitions](./scoped-view-transitions.md) - 部分的なビュー遷移（Chrome 140+）
- [Scroll-driven Animations](./scroll-driven-animations.md)
- [CSS アニメーション基礎](./animation-basics.md)
- [CSS 2025 インタラクション](./css-2025-interactions.md) - ネストされたビュー遷移グループ
