---
title: モバイルでのホバー無効化とany-hoverメディア特性
category: css
tags: [hover, any-hover, media-query, mobile, accessibility, 2025]
browser_support: モダンブラウザ
created: 2026-01-19
updated: 2026-01-19
---

# モバイルでのホバー無効化とany-hoverメディア特性

> 出典: https://www.tak-dcxi.com/article/disable-hover-on-mobile-and-hover-implementation-example
> 執筆日: 2025年
> 追加日: 2026-01-19

タッチデバイスでのホバー動作の問題を解決するCSS メディア特性`any-hover`の活用ガイド。画面幅ではなく入力デバイスの種類で判定します。

## タッチデバイスでのホバーの問題

タッチデバイスでホバー状態が継続すると：

- UIの予期しない振る舞い
- ユーザー体験の混乱
- アクセシビリティの低下

## any-hoverメディア特性

### 基本的な使い方

```css
@media (any-hover: hover) {
  .button:hover {
    background-color: var(--background-hover);
  }
}
```

ホバー可能なデバイスでのみホバースタイルを適用します。

### any-hover vs hover

| メディア特性 | 判定基準 |
|------------|---------|
| `any-hover: hover` | **いずれかの**入力デバイスがホバー対応 |
| `hover: hover` | **主な**入力デバイスがホバー対応 |

**推奨**: `any-hover`を使用（マウス接続時のタブレットにも対応）

## 推奨される実装パターン

### 基本実装

```css
/* すべての状態に共通のスタイル */
.button {
  background-color: var(--background);
  color: var(--text);
  transition-property: background-color, color;
  transition-duration: 0.2s;
}

/* フォーカス表示 */
.button:focus-visible {
  background-color: var(--background-focus);
  outline: 2px solid var(--outline-color);
  outline-offset: 2px;
}

/* ホバー対応デバイスのみ */
@media (any-hover: hover) {
  .button:hover {
    background-color: var(--background-hover);
  }
}
```

### focus-visibleとhoverの統合

```css
.button {
  background-color: #3b82f6;
  transition-property: background-color;
  transition-duration: 0.2s;
}

/* キーボードフォーカス */
.button:focus-visible {
  background-color: #2563eb;
  outline: 2px solid #1d4ed8;
  outline-offset: 2px;
}

/* マウスホバー（ホバー対応デバイスのみ） */
@media (any-hover: hover) {
  .button:hover {
    background-color: #2563eb;
  }
}
```

**ポイント**: `:focus-visible`と`:hover`に同じスタイルを適用することで、キーボードユーザーとマウスユーザーの両方に適切なフィードバックを提供します。

## 画面幅での判定を避ける理由

```css
/* ❌ 非推奨：画面幅で判定 */
@media (width >= 640px) {
  .button:hover {
    background-color: var(--background-hover);
  }
}
```

**問題点**:
- 小型ポインターデバイス（小型PC）で動作しない
- 大型タッチデバイス（大型タブレット）でホバーが発生
- マウス接続時のタブレットに対応できない

```css
/* ✅ 推奨：入力デバイスで判定 */
@media (any-hover: hover) {
  .button:hover {
    background-color: var(--background-hover);
  }
}
```

## transition-propertyの明示的指定

### 問題のある実装

```css
/* ❌ 非推奨：transition-propertyを省略 */
.button {
  background-color: #3b82f6;
  transition-duration: 0.2s;
  /* transition-property: all; がデフォルト */
}

@media (width >= 640px) {
  .button {
    font-size: 1.2rem; /* ブレイクポイント跨ぎでアニメーション発生 */
  }
}

@media (any-hover: hover) {
  .button:hover {
    background-color: #2563eb;
  }
}
```

**問題**: ブレイクポイントを跨ぐときに`font-size`もアニメーションしてしまう。

### 推奨される実装

```css
/* ✅ 推奨：transition-propertyを明示 */
.button {
  background-color: #3b82f6;
  transition-property: background-color;
  transition-duration: 0.2s;
}

@media (width >= 640px) {
  .button {
    font-size: 1.2rem; /* アニメーションしない */
  }
}

@media (any-hover: hover) {
  .button:hover {
    background-color: #2563eb;
  }
}
```

## 実装パターン

### リンク

```css
a {
  color: #3b82f6;
  text-decoration: underline;
  transition-property: color;
  transition-duration: 0.2s;
}

@media (any-hover: hover) {
  a:hover {
    color: #2563eb;
  }
}

a:focus-visible {
  outline: 2px solid #1d4ed8;
  outline-offset: 2px;
}
```

### カード

```css
.card {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition-property: box-shadow, transform;
  transition-duration: 0.2s;
}

@media (any-hover: hover) {
  .card:hover {
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}
```

### ナビゲーション

```css
.nav-item {
  color: #6b7280;
  transition-property: color, background-color;
  transition-duration: 0.2s;
}

.nav-item:focus-visible {
  color: #111827;
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

@media (any-hover: hover) {
  .nav-item:hover {
    color: #111827;
    background-color: #f3f4f6;
  }
}
```

### アイコンボタン

```css
.icon-button {
  background: transparent;
  border-radius: 0.375rem;
  transition-property: background-color;
  transition-duration: 0.2s;
}

.icon-button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

@media (any-hover: hover) {
  .icon-button:hover {
    background-color: #f3f4f6;
  }
}
```

## アクセシビリティ考慮事項

### 1. focus-visibleとhoverの両対応

```css
/* キーボードユーザー向け */
.button:focus-visible {
  background-color: var(--background-focus);
}

/* マウスユーザー向け */
@media (any-hover: hover) {
  .button:hover {
    background-color: var(--background-hover);
  }
}
```

### 2. prefers-reduced-motionへの配慮

```css
.button {
  transition-property: background-color;
  transition-duration: 0.2s;
}

@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none;
  }
}
```

### 3. コントラスト比の確保

ホバー状態でもWCAG 2.1のコントラスト比4.5:1以上を維持します。

```css
.button {
  background-color: #3b82f6; /* 青 */
  color: white; /* コントラスト比: 4.5:1 */
}

@media (any-hover: hover) {
  .button:hover {
    background-color: #2563eb; /* より濃い青 */
    /* コントラスト比: 7.3:1 */
  }
}
```

## 複合的な入力デバイス対応

### タブレット + マウス

```css
/* タブレット単体ではホバーなし */
@media (any-hover: none) {
  .button {
    /* タップ用の大きいターゲット */
    min-height: 44px;
  }
}

/* マウス接続時はホバー有効 */
@media (any-hover: hover) {
  .button:hover {
    background-color: var(--background-hover);
  }
}
```

### デスクトップ + タッチスクリーン

```css
/* ホバー対応があればホバースタイル適用 */
@media (any-hover: hover) {
  .button:hover {
    background-color: var(--background-hover);
  }
}

/* タッチ操作も考慮したターゲットサイズ */
.button {
  min-height: 44px;
  min-width: 44px;
}
```

## 実装時の注意点

### 1. touch-actionの設定

```css
.button {
  touch-action: manipulation;
}
```

ダブルタップズームを防止します。

### 2. active状態の提供

```css
.button:active {
  transform: scale(0.98);
}
```

タップ時のフィードバックを提供します。

### 3. hoverとactiveの順序

```css
/* ✅ 正しい順序 */
.button:hover { /* ホバー */ }
.button:focus-visible { /* フォーカス */ }
.button:active { /* アクティブ */ }
```

## ブラウザ対応

| メディア特性 | Chrome | Firefox | Safari | Edge |
|------------|--------|---------|--------|------|
| `any-hover` | 41+ | 64+ | 9+ | 16+ |
| `hover` | 38+ | 64+ | 9+ | 12+ |

全モダンブラウザでサポートされています。

## 関連ナレッジ

- [アクセシビリティ対応タブメニュー](../html/accessible-tab-menu.md)
- [クリックターゲット領域](../cross-cutting/accessibility/click-target-areas.md)
- [HTML/CSSテクニック集](../cross-cutting/html-css-techniques.md)

## 参考リンク

- [MDN: any-hover](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/any-hover)
- [MDN: hover](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover)
- [MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)
- [WCAG 2.1: 2.5.5 Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
