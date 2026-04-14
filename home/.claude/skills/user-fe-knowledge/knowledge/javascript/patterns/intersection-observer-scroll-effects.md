---
title: IntersectionObserver スクロールエフェクト
category: javascript/patterns
tags: [JavaScript, IntersectionObserver, scroll, animation, CSS variables]
browser_support: Chrome 51+, Firefox 55+, Safari 12.1+
created: 2026-01-31
updated: 2026-01-31
---

# IntersectionObserver スクロールエフェクト

> 出典: https://coliss.com/articles/build-websites/operation/work/intersection-observer-scrolling-effects.html
> 執筆日: 2022-08-23
> 追加日: 2026-01-31

IntersectionObserverとCSSカスタムプロパティを組み合わせて、スクロール時のアニメーション効果を実装する。

---

## 基本パターン: スケーリング効果

### HTML

```html
<ul class="scroll-effects">
  <li class="card">カード 1</li>
  <li class="card">カード 2</li>
  <li class="card">カード 3</li>
</ul>
```

### JavaScript

```javascript
// 監視対象の要素を取得
const cards = document.querySelectorAll('.card');

// IntersectionObserver を作成
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    // CSS変数を更新
    entry.target.style.setProperty(
      '--shown',
      entry.isIntersecting ? 1 : 0
    );
  });
}, {
  threshold: 0.5 // 要素の50%が表示されたら発火
});

// 各カードを監視
cards.forEach(card => observer.observe(card));
```

### CSS

```css
.card {
  /* デフォルト値: 非表示状態 */
  --shown: 0;

  /* スケール計算: 0.25（最小） + 0.75 * --shown */
  scale: calc(0.25 + (var(--shown, 0) * 0.75));

  /* スムーズな遷移 */
  transition: scale 0.3s ease-out;
}
```

**仕組み**:
- 要素が画面外: `--shown: 0` → `scale: 0.25`
- 要素が画面内: `--shown: 1` → `scale: 1`

---

## パターン2: ジッパー効果（交互方向の動き）

### HTML

```html
<ul class="zipper-effects">
  <li class="card">カード 1</li>
  <li class="card">カード 2</li>
  <li class="card">カード 3</li>
  <li class="card">カード 4</li>
</ul>
```

### JavaScript

```javascript
const cards = document.querySelectorAll('.card');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.style.setProperty(
      '--shown',
      entry.isIntersecting ? 1 : 0
    );
  });
}, {
  threshold: 0.3
});

cards.forEach(card => observer.observe(card));
```

### CSS

```css
.card {
  --shown: 0;
  --distance: 250%; /* 移動距離 */

  /* 左から右へスライドイン */
  transform: translateX(
    calc((var(--distance) * -1) + (var(--shown, 0) * var(--distance)))
  );

  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 4の倍数番目は右から左へ */
li:nth-of-type(4n) .card {
  --distance: -250%;
}
```

**仕組み**:
- 奇数カード: 左から右（`--distance: 250%`）
- 偶数（4の倍数）カード: 右から左（`--distance: -250%`）

---

## パターン3: 回転エフェクト

### JavaScript

```javascript
const cards = document.querySelectorAll('.card');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.style.setProperty(
      '--shown',
      entry.isIntersecting ? 1 : 0
    );
  });
});

cards.forEach(card => observer.observe(card));
```

### CSS

```css
.card {
  --shown: 0;

  /* 回転: 0deg から 360deg */
  rotate: calc(var(--shown, 0) * 360deg);

  /* 透明度: 0 から 1 */
  opacity: var(--shown, 0);

  transition: rotate 0.6s ease-out, opacity 0.6s ease-out;
}
```

---

## パターン4: フェードイン＋スライドアップ

### JavaScript

```javascript
const cards = document.querySelectorAll('.card');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.style.setProperty(
      '--shown',
      entry.isIntersecting ? 1 : 0
    );
  });
}, {
  rootMargin: '-100px' // ビューポートの100px手前で発火
});

cards.forEach(card => observer.observe(card));
```

### CSS

```css
.card {
  --shown: 0;

  /* Y軸移動: 50px から 0px */
  transform: translateY(calc((1 - var(--shown, 0)) * 50px));

  /* 透明度: 0 から 1 */
  opacity: var(--shown, 0);

  transition: transform 0.5s ease-out, opacity 0.5s ease-out;
}
```

---

## 応用: 遅延効果（Stagger）

### JavaScript

```javascript
const cards = document.querySelectorAll('.card');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      // 遅延を設定
      entry.target.style.transitionDelay = `${index * 0.1}s`;
      entry.target.style.setProperty('--shown', 1);
    } else {
      entry.target.style.transitionDelay = '0s';
      entry.target.style.setProperty('--shown', 0);
    }
  });
});

cards.forEach(card => observer.observe(card));
```

### CSS

```css
.card {
  --shown: 0;

  transform: translateY(calc((1 - var(--shown, 0)) * 30px));
  opacity: var(--shown, 0);

  transition: transform 0.4s ease-out, opacity 0.4s ease-out;
  /* transition-delay は JavaScript で動的に設定 */
}
```

---

## IntersectionObserver オプション

### threshold

**定義**: 要素のどれくらいが表示されたら発火するか。

```javascript
const observer = new IntersectionObserver(callback, {
  threshold: 0.5 // 50%表示で発火
});

// 複数の閾値を設定
const observer = new IntersectionObserver(callback, {
  threshold: [0, 0.25, 0.5, 0.75, 1] // 各段階で発火
});
```

### rootMargin

**定義**: ビューポートの範囲を拡張または縮小。

```javascript
const observer = new IntersectionObserver(callback, {
  rootMargin: '100px' // ビューポートより100px外側で発火
});

const observer = new IntersectionObserver(callback, {
  rootMargin: '-100px' // ビューポートより100px内側で発火
});

// 上下左右を個別指定
const observer = new IntersectionObserver(callback, {
  rootMargin: '100px 0px -100px 0px' // 上右下左
});
```

### root

**定義**: 監視のルート要素（デフォルトはビューポート）。

```javascript
const container = document.querySelector('.scroll-container');

const observer = new IntersectionObserver(callback, {
  root: container // コンテナ内でのスクロールを監視
});
```

---

## パフォーマンス最適化

### 1. unobserve で監視解除

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.setProperty('--shown', 1);

      // アニメーション完了後、監視解除
      observer.unobserve(entry.target);
    }
  });
});
```

### 2. will-change で最適化

```css
.card {
  /* アニメーション対象プロパティを事前に通知 */
  will-change: transform, opacity;
}

/* アニメーション完了後は削除 */
.card.animated {
  will-change: auto;
}
```

### 3. transform を優先使用

```css
/* ❌ レイアウトを変更（重い） */
.card {
  left: calc(var(--shown, 0) * 100px);
}

/* ✅ transform を使用（軽い） */
.card {
  transform: translateX(calc(var(--shown, 0) * 100px));
}
```

---

## アクセシビリティ配慮

### prefers-reduced-motion 対応

```css
/* モーション軽減モードではアニメーションを無効化 */
@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
```

```javascript
// JavaScript でも配慮
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  const observer = new IntersectionObserver(/* ... */);
  cards.forEach(card => observer.observe(card));
}
```

---

## ブラウザサポート

| ブラウザ | バージョン |
|---------|-----------|
| Chrome | 51+ |
| Firefox | 55+ |
| Safari | 12.1+ |
| Edge | 15+ |

**Polyfill**: https://github.com/w3c/IntersectionObserver/tree/main/polyfill

---

## ユースケース

- グリッド/リストビューのアニメーション
- ランディングページのセクション表示
- 無限スクロールの実装
- 遅延読み込み（Lazy Load）
- スクロール進捗の追跡

---

## 参考リンク

- [IntersectionObserver - MDN](https://developer.mozilla.org/ja/docs/Web/API/Intersection_Observer_API)
- [CSS カスタムプロパティ - MDN](https://developer.mozilla.org/ja/docs/Web/CSS/Using_CSS_custom_properties)
- [CodePen デモ](https://codepen.io/search/pens?q=intersection+observer)
