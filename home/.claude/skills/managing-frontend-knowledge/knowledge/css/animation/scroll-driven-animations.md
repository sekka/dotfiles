---
title: Scroll-Driven Animations（スクロール方向検出）
category: css/animation
tags: [scroll, animation, header, scroll-direction, 2024]
browser_support: Chrome 115+
created: 2025-01-16
updated: 2025-01-16
---

# Scroll-Driven Animations（スクロール方向でヘッダー表示切替）

> 出典: https://coliss.com/articles/build-websites/operation/css/css-hide-header-when-scrolling-down.html
> 執筆日: 不明
> 追加日: 2025-12-17

CSS Scroll-Driven Animations を使用して、スクロール方向に応じてヘッダーを表示/非表示にするテクニック。JavaScript 不要。

## 基本的な仕組み

1. `--scroll-direction` カスタムプロパティでスクロール方向を検出（-1, 0, 1）
2. Style Queries（`@container style()`）で条件付きスタイル適用
3. `transition-delay: calc(infinity * 1s)` で値を固定化

## コード例

```html
<body>
  <header>Header</header>
  <main>コンテンツ...</main>
</body>
```

```css
@property --scroll-direction {
  syntax: "<integer>";
  inherits: true;
  initial-value: 0;
}

html {
  /* スクロール方向を -1, 0, 1 で表現 */
  animation: detect-scroll linear;
  animation-timeline: scroll();
}

@keyframes detect-scroll {
  from {
    --scroll-direction: -1; /* 上方向 */
  }
  to {
    --scroll-direction: 1; /* 下方向 */
  }
}

body {
  container-type: normal;
}

header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  translate: 0 var(--translate, 0);
  transition: translate 0.3s;
}

/* スクロールしていない時: 値を固定 */
@container style(--scroll-direction: 0) {
  header {
    transition-delay: calc(infinity * 1s);
  }
}

/* 上スクロール時: ヘッダー表示 */
@container style(--scroll-direction: -1) {
  header {
    --translate: 0;
  }
}

/* 下スクロール時: ヘッダー非表示 */
@container style(--scroll-direction: 1) {
  header {
    --translate: -100%;
  }
}
```

## 仕組みの解説

1. **スクロール方向の検出**
   - `animation-timeline: scroll()` でスクロール位置をアニメーションにバインド
   - スクロール開始位置で `--scroll-direction: -1`、終了位置で `1`
   - スクロールしていない時は `0`（初期値）

2. **Style Queries による条件分岐**
   - `@container style(--scroll-direction: X)` で値に応じたスタイルを適用
   - `container-type: normal` でサイズクエリなしのスタイルクエリのみ有効化

3. **transition-delay: infinity の活用**
   - スクロールしていない時（`--scroll-direction: 0`）に `infinity * 1s` の遅延
   - 事実上トランジションが発生せず、現在の位置を維持

## ブラウザ対応

| 機能 | Chrome | Firefox | Safari |
|------|--------|---------|--------|
| Scroll-Driven Animations | 115+ | ❌ | ❌ |
| Style Queries | 111+ | ❌ | 18+ |

**注意:** 2025年時点で Chrome のみフルサポート。Firefox、Safari は非対応。

## プログレッシブエンハンスメント

```css
/* フォールバック: 常にヘッダー表示 */
header {
  position: fixed;
  top: 0;
}

/* Scroll-Driven Animations 対応ブラウザのみ */
@supports (animation-timeline: scroll()) {
  html {
    animation: detect-scroll linear;
    animation-timeline: scroll();
  }
  /* ... 以降のスタイル */
}
```

## ユースケース

- 固定ヘッダーのスクロール連動表示
- 下スクロールでツールバーを隠す
- スクロール方向に応じた UI 変化

## メリット

- **JavaScript 不要**: 純粋な CSS 実装
- **パフォーマンス**: スクロールイベントのリスナー不要
- **スムーズ**: ブラウザのネイティブアニメーション

## 注意点

- ブラウザ対応が限定的（Chrome のみ）
- 複雑な条件分岐には向かない
- デバッグが難しい場合がある

## 関連ナレッジ

- [CSS アニメーション基礎](./animation-basics.md)
- [@property カスタムプロパティ](../values/custom-properties.md)
