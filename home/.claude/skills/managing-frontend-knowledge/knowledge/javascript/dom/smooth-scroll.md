---
title: スムーススクロール実装（JavaScript版）
category: javascript/dom
tags: [smooth-scroll, scrollIntoView, accessibility, navigation, 2025]
browser_support: モダンブラウザ
created: 2026-01-19
updated: 2026-01-19
---

# スムーススクロール実装（JavaScript版）

> 出典: https://www.tak-dcxi.com/article/smooth-scroll-implementation-example
> 執筆日: 2025年
> 追加日: 2026-01-19

JavaScriptを使用したページ内スムーススクロールの実装パターン。CSSの`scroll-behavior: smooth`ではなくJSで実装する理由と詳細な実装方法を解説します。

## CSSのscroll-behavior: smoothを避ける理由

### 5つの問題点

1. **全リンクが対象** - ページ内全アンカーリンクがスムーススクロールになる
2. **外部リンク時も動作** - ブックマークからのアクセスでも発生
3. **Tab操作で問題** - フォーカス移動に視覚が追いつかない
4. **scrollTo()メソッドへの影響** - 意図しないスムーススクロール
5. **ページ内検索への影響** - 検索結果表示も遅延

### CSS実装の問題例

```css
/* ❌ 問題のある実装 */
html {
  scroll-behavior: smooth;
}
```

この実装では、すべてのスクロール動作が影響を受けます。

## JavaScript実装の基本

### HTML

```html
<!-- 固定ヘッダー -->
<header data-fixed-header>
  <!-- ナビゲーション -->
</header>

<!-- スムーススクロールリンク -->
<a href="#section1" data-smooth-scroll>セクション1へ</a>

<!-- ターゲットセクション -->
<section id="section1">
  <h2>セクション1</h2>
</section>
```

### TypeScript実装

```typescript
const initializeSmoothScroll = () => {
  // prefers-reduced-motionのチェック
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // 固定ヘッダーのサイズ取得
  const getHeaderBlockSize = (): string => {
    const header = document.querySelector('[data-fixed-header]') as HTMLElement;
    if (!header) return '0px';

    const position = getComputedStyle(header).position;
    if (position === 'fixed' || position === 'sticky') {
      return `${header.offsetHeight}px`;
    }
    return '0px';
  };

  const headerBlockSize = getHeaderBlockSize();

  // スクロール実行
  const scrollToTarget = (element: HTMLElement, hash: string): void => {
    // scroll-marginでオフセット調整
    element.style.scrollMarginBlockStart = headerBlockSize;

    // スクロール実行
    element.scrollIntoView({
      behavior: prefersReducedMotion ? 'instant' : 'smooth',
      block: 'start',
      inline: 'nearest',
    });

    // フォーカス移動（スクロールは発生させない）
    element.focus({ preventScroll: true });

    // URLフラグメント更新
    history.pushState(null, '', hash);
  };

  // クリックイベントのハンドリング
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest<HTMLAnchorElement>('[data-smooth-scroll]');

    if (!link) return;

    // スムーススクロール無効フラグがある場合はスキップ
    if (link.dataset.smoothScroll === 'disabled') return;

    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    e.preventDefault();

    // #topまたは#の場合はページトップへ
    if (href === '#' || href === '#top') {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'instant' : 'smooth',
      });
      history.pushState(null, '', href);
      return;
    }

    // ターゲット要素の取得
    const id = decodeURIComponent(href.slice(1));
    const element = document.getElementById(id);

    if (!element) return;

    scrollToTarget(element, href);
  });
};

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', initializeSmoothScroll);
```

## 主要機能の実装

### 1. 固定ヘッダー対応

```typescript
const getHeaderBlockSize = (): string => {
  const header = document.querySelector('[data-fixed-header]') as HTMLElement;
  if (!header) return '0px';

  const position = getComputedStyle(header).position;

  // 固定または粘着配置の場合のみサイズを返す
  if (position === 'fixed' || position === 'sticky') {
    return `${header.offsetHeight}px`;
  }

  return '0px';
};
```

`scroll-margin-block-start`を使用してオフセット調整します。

```typescript
element.style.scrollMarginBlockStart = headerBlockSize;
```

### 2. prefers-reduced-motion 対応

```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

element.scrollIntoView({
  behavior: prefersReducedMotion ? 'instant' : 'smooth',
});
```

アニメーション設定が「減らす」の場合は即時スクロールします。

### 3. フォーカス管理

```typescript
// フォーカス移動（スクロールは発生させない）
element.focus({ preventScroll: true });
```

`preventScroll: true`で意図的にスクロールを抑制します。

### 4. URLフラグメントの更新

```typescript
// ブラウザ履歴に追加
history.pushState(null, '', hash);
```

ブラウザの戻る/進むボタンでの動作を保証します。

### 5. 特殊文字対応

```typescript
// URLエンコードされたIDに対応
const id = decodeURIComponent(href.slice(1));
const element = document.getElementById(id);
```

日本語や特殊文字を含むIDでも正しく動作します。

### 6. #top対応

```typescript
// #topまたは#の場合はページトップへ
if (href === '#' || href === '#top') {
  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion ? 'instant' : 'smooth',
  });
  history.pushState(null, '', href);
  return;
}
```

HTML仕様に準拠してページトップへのスクロールを実装します。

## マークアップ属性

### data-smooth-scroll

```html
<!-- スムーススクロールを有効化 -->
<a href="#section1" data-smooth-scroll>セクション1へ</a>

<!-- 特定のリンクで無効化 -->
<a href="#section2" data-smooth-scroll="disabled">セクション2へ</a>
```

### data-fixed-header

```html
<!-- 固定ヘッダー -->
<header data-fixed-header>
  <!-- ナビゲーション -->
</header>
```

## 実装パターン

### 目次からのセクション移動

```html
<nav>
  <ul>
    <li><a href="#intro" data-smooth-scroll>はじめに</a></li>
    <li><a href="#features" data-smooth-scroll>特徴</a></li>
    <li><a href="#usage" data-smooth-scroll>使い方</a></li>
  </ul>
</nav>

<section id="intro">
  <h2>はじめに</h2>
</section>
```

### トップへ戻るボタン

```html
<a href="#top" data-smooth-scroll class="back-to-top">
  ページトップへ
</a>
```

### 固定ヘッダー下でのオフセット調整

```html
<header data-fixed-header style="height: 60px;">
  <!-- ナビゲーション -->
</header>

<section id="section1">
  <!-- scroll-margin-block-startが自動で60pxに設定される -->
  <h2>セクション1</h2>
</section>
```

## scrollIntoViewのオプション

```typescript
element.scrollIntoView({
  behavior: 'smooth',  // 'auto' | 'instant' | 'smooth'
  block: 'start',      // 'start' | 'center' | 'end' | 'nearest'
  inline: 'nearest',   // 'start' | 'center' | 'end' | 'nearest'
});
```

### behavior

| 値 | 説明 |
|----|------|
| `'auto'` | ブラウザのデフォルト動作 |
| `'instant'` | 即時スクロール |
| `'smooth'` | スムーススクロール |

### block（垂直方向の位置）

| 値 | 説明 |
|----|------|
| `'start'` | 要素の上端を表示領域の上端に |
| `'center'` | 要素の中央を表示領域の中央に |
| `'end'` | 要素の下端を表示領域の下端に |
| `'nearest'` | 最小限のスクロール |

### inline（水平方向の位置）

| 値 | 説明 |
|----|------|
| `'start'` | 要素の左端を表示領域の左端に |
| `'center'` | 要素の中央を表示領域の中央に |
| `'end'` | 要素の右端を表示領域の右端に |
| `'nearest'` | 最小限のスクロール（推奨） |

## アクセシビリティ考慮事項

### 1. キーボード操作への配慮

```typescript
// Tabキー操作時はフォーカスを移動するだけ
element.focus({ preventScroll: true });
```

### 2. スクリーンリーダー対応

フォーカスを移動することで、スクリーンリーダーが適切にコンテンツを読み上げます。

```html
<!-- フォーカス可能な要素にする -->
<section id="section1" tabindex="-1">
  <h2>セクション1</h2>
</section>
```

### 3. スキップリンク

```html
<a href="#main-content" data-smooth-scroll class="skip-link">
  本文へスキップ
</a>

<main id="main-content" tabindex="-1">
  <!-- メインコンテンツ -->
</main>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

## パフォーマンス最適化

### 1. イベント委譲

```typescript
// 個別にリスナーを追加しない
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-smooth-scroll]');
  if (!link) return;
  // 処理...
});
```

### 2. デバウンス（リサイズ時）

```typescript
let resizeTimer: number;

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // ヘッダーサイズの再計算
    headerBlockSize = getHeaderBlockSize();
  }, 250);
});
```

## 実装時の注意点

### 1. ページ読み込み時のハッシュフラグメント対応

```typescript
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash;
  if (hash) {
    // ページ読み込み完了後にスクロール
    setTimeout(() => {
      const element = document.getElementById(hash.slice(1));
      if (element) {
        scrollToTarget(element, hash);
      }
    }, 100);
  }
});
```

### 2. 動的コンテンツへの対応

```typescript
// MutationObserverで監視
const observer = new MutationObserver(() => {
  // ヘッダーサイズの再計算
  headerBlockSize = getHeaderBlockSize();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
```

## ブラウザ対応

| ブラウザ | scrollIntoView | scroll-margin | preventScroll |
|---------|----------------|---------------|---------------|
| Chrome | 61+ | 69+ | 67+ |
| Edge | 79+ | 79+ | 79+ |
| Firefox | 36+ | 68+ | 68+ |
| Safari | 15.4+ | 14.1+ | 15.4+ |

## 関連ナレッジ

- [Scroll-driven Animations](../../css/animation/scroll-driven-animations.md)
- [スクロール連動アニメーション](./scroll-linked-animation.md)
- [スクロールバー関連](../../css/layout/scrollbar.md)

## 参考リンク

- [MDN: Element.scrollIntoView()](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView)
- [MDN: scroll-margin](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin)
- [MDN: History.pushState()](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState)
- [完全な実装例（TypeScript）](https://gist.github.com/tak-dcxi/1c5f8d34d750c1cfeaa8e9be1d402d34)
