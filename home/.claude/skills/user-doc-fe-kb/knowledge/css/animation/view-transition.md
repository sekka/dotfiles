---
title: @view-transition 規則（MPA対応）
category: css/animation
tags: [view-transition, page-transition, mpa, animation, 2024]
browser_support: Chrome 126+, Safari 18+
created: 2025-01-16
updated: 2025-01-16
---

# @view-transition 規則

> 出典: https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> 執筆日: 2024年
> 追加日: 2025-12-17

クロスドキュメント間（MPA）でのビューアニメーション。SPA 化せずにページ遷移アニメーション。

## 基本的な使い方

```css
/* 両方のページで定義 */
@view-transition {
  navigation: auto;
}

/* トランジション対象の指定 */
.hero-image {
  view-transition-name: hero;
}

/* アニメーションのカスタマイズ */
::view-transition-old(hero) {
  animation: fade-out 0.3s ease-out;
}

::view-transition-new(hero) {
  animation: fade-in 0.3s ease-in;
}
```

## 動作

従来、ページ遷移時のアニメーションは SPA（Single Page Application）でしか実現できませんでした。`@view-transition` を使うと、MPA（Multi Page Application）でもページ遷移アニメーションが可能になります。

## ユースケース

### ヒーロー画像の遷移

```css
/* page-a.html と page-b.html の両方に */
@view-transition {
  navigation: auto;
}

.hero {
  view-transition-name: hero;
}
```

### カードからの詳細ページ展開

```css
/* リストページ */
.card {
  view-transition-name: card-1;
}

/* 詳細ページ */
.detail-hero {
  view-transition-name: card-1; /* 同じ名前 */
}

::view-transition-old(card-1),
::view-transition-new(card-1) {
  animation-duration: 0.5s;
  animation-timing-function: ease-in-out;
}
```

### ナビゲーションのフェード

```css
@view-transition {
  navigation: auto;
}

/* デフォルトのフェードをカスタマイズ */
::view-transition-old(root) {
  animation: fade-out 0.2s ease-out;
}

::view-transition-new(root) {
  animation: fade-in 0.2s ease-in;
}

@keyframes fade-out {
  to {
    opacity: 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 126+ |
| Safari | 18+ |
| Firefox | 未対応 |

## プログレッシブエンハンスメント

```css
@supports (view-transition-name: none) {
  @view-transition {
    navigation: auto;
  }

  .hero {
    view-transition-name: hero;
  }
}
```

## 注意点

- 同一オリジン内のみ動作
- HTTPS 必須
- ブラウザによっては設定が必要

## 関連ナレッジ

- [Page Transitions](./page-transitions.md)
- [SPA vs MPA](../../cross-cutting/architecture/spa-vs-mpa.md)
