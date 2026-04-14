---
title: スクロールバーのカスタマイズとレイアウト対応
category: css/layout
tags: [scrollbar, scrollbar-width, scrollbar-color, webkit-scrollbar, layout-shift, 2024]
browser_support: Chrome, Firefox, Safari (部分対応)
created: 2026-01-19
updated: 2026-01-19
---

# スクロールバーのカスタマイズとレイアウト対応

> 出典: https://www.tak-dcxi.com/article/scroll-bar-related-etcetera
> 執筆日: 2024年
> 追加日: 2026-01-19

スクロールバーのCSSカスタマイズ、レイアウトシフト防止、モーダル開閉時の対応など、スクロールバーに関する包括的なガイドです。

## スクロールバーカスタマイズの2つの方法

### 1. W3C標準仕様

```css
.scroller {
  /* 色指定 */
  scrollbar-color: #888 #f5f5f5;
  /*             ^移動部分 ^背景 */

  /* 太さ指定 */
  scrollbar-width: thin; /* auto | thin | none */
}
```

**ブラウザ対応**: Chrome 121+, Firefox 64+, Edge 121+
**Safari**: 未対応（2024年時点）

### 2. WebKitベンダープレフィックス

```css
.scroller::-webkit-scrollbar {
  width: 8px; /* 縦スクロールバーの幅 */
  height: 8px; /* 横スクロールバーの高さ */
}

.scroller::-webkit-scrollbar-track {
  background: #f5f5f5; /* 背景色 */
}

.scroller::-webkit-scrollbar-thumb {
  background: #888; /* 移動部分の色 */
  border-radius: 4px;
}

.scroller::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```

**ブラウザ対応**: Chrome, Edge, Safari
**Firefox**: 未対応

## クロスブラウザ対応

### スクロールバー非表示化

```css
/* W3C標準 */
@supports not selector(::-webkit-scrollbar) {
  .scroller {
    scrollbar-width: none;
  }
}

/* WebKit */
@supports selector(::-webkit-scrollbar) {
  .scroller::-webkit-scrollbar {
    display: none;
  }
}
```

### デザインカスタマイズ

```css
/* W3C標準 */
@supports (scrollbar-color: auto) {
  .scroller {
    scrollbar-color: #888 #f5f5f5;
    scrollbar-width: thin;
  }
}

/* WebKit */
@supports selector(::-webkit-scrollbar) {
  .scroller::-webkit-scrollbar {
    width: 8px;
  }

  .scroller::-webkit-scrollbar-track {
    background: #f5f5f5;
  }

  .scroller::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
}
```

## アクセシビリティ対応

### 強制カラーモードへの配慮

```css
@media not (forced-colors: active) {
  .scroller {
    scrollbar-color: #888 #f5f5f5;
  }

  .scroller::-webkit-scrollbar-thumb {
    background: #888;
  }

  .scroller::-webkit-scrollbar-track {
    background: #f5f5f5;
  }
}
```

**重要**: 強制カラーモード時の表示不具合を防止します。

## スクロールバー幅の取得

### JavaScriptでの計算

```javascript
const getScrollbarWidth = () => {
  return window.innerWidth - document.documentElement.clientWidth;
};

// CSSカスタムプロパティに格納
document.documentElement.style.setProperty(
  '--scrollbar-width',
  `${getScrollbarWidth()}px`
);
```

### レイアウトシフト防止

```css
:root {
  --scrollbar-width: 0px; /* デフォルト値 */
}

/* モーダル開閉時のガタツキ防止 */
body:has(dialog[open]) {
  overflow: hidden;
  padding-inline-end: var(--scrollbar-width, 0);
}
```

## 実装パターン

### 1. カスタムスクロールバーのデザイン

```css
.custom-scroller {
  overflow-y: auto;
}

/* W3C標準 */
@supports (scrollbar-color: auto) {
  .custom-scroller {
    scrollbar-color: #3b82f6 #e5e7eb;
    scrollbar-width: thin;
  }
}

/* WebKit */
@supports selector(::-webkit-scrollbar) {
  .custom-scroller::-webkit-scrollbar {
    width: 10px;
  }

  .custom-scroller::-webkit-scrollbar-track {
    background: #e5e7eb;
    border-radius: 5px;
  }

  .custom-scroller::-webkit-scrollbar-thumb {
    background: #3b82f6;
    border-radius: 5px;
  }

  .custom-scroller::-webkit-scrollbar-thumb:hover {
    background: #2563eb;
  }
}
```

### 2. スクロールバーを非表示にしつつスクロール可能

```css
.hidden-scrollbar {
  overflow: auto;
  scrollbar-width: none; /* Firefox */
}

.hidden-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}
```

### 3. 全幅要素の実装（親要素からはみ出す）

```css
.full-width {
  width: 100vw;
  margin-inline: calc(50% - (50vi - var(--scrollbar-width) / 2));
}
```

**解説**: `100vw`からスクロールバー幅を引いた値を使用し、正確な全幅を実現します。

### 4. ダークモード対応

```css
@media (prefers-color-scheme: dark) {
  .scroller {
    scrollbar-color: #4b5563 #1f2937;
  }

  .scroller::-webkit-scrollbar-track {
    background: #1f2937;
  }

  .scroller::-webkit-scrollbar-thumb {
    background: #4b5563;
  }
}
```

HTMLで`color-scheme`を設定することで、システムのスクロールバーも自動対応します。

```html
<meta name="color-scheme" content="light dark">
```

## Interop 2024とScrollbar Styling

**Interop 2024**プロジェクトにScrollbar Stylingが追加されました。

将来的には**Safariも W3C標準プロパティをサポート開始**する可能性が高いです。

## モーダル開閉時の対応

### 問題点

モーダル表示時に`overflow: hidden`を適用すると、スクロールバーが消えてレイアウトシフトが発生します。

### 解決策

```css
/* スクロールバー幅を事前に確保 */
:root {
  scrollbar-gutter: stable;
}

/* モーダル表示時 */
body:has(dialog[open]) {
  overflow: hidden;
  padding-inline-end: var(--scrollbar-width, 0);
}
```

**`scrollbar-gutter: stable`**: スクロールバーの有無に関わらず、常にスクロールバー用のスペースを確保します。

## WebKitスクロールバー疑似要素

### 利用可能な疑似要素

| 疑似要素 | 説明 |
|---------|------|
| `::-webkit-scrollbar` | スクロールバー全体 |
| `::-webkit-scrollbar-track` | 背景トラック |
| `::-webkit-scrollbar-thumb` | 移動部分（つまみ） |
| `::-webkit-scrollbar-button` | 上下の矢印ボタン |
| `::-webkit-scrollbar-corner` | 縦横スクロールバーの交差部分 |

### 詳細なカスタマイズ例

```css
.advanced-scroller::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.advanced-scroller::-webkit-scrollbar-track {
  background: linear-gradient(90deg, #f5f5f5, #e5e7eb);
}

.advanced-scroller::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #3b82f6, #2563eb);
  border-radius: 6px;
  border: 2px solid #e5e7eb;
}

.advanced-scroller::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #2563eb, #1d4ed8);
}

.advanced-scroller::-webkit-scrollbar-corner {
  background: #e5e7eb;
}
```

## 実装時の注意点

### 1. アクセシビリティ優先

```css
/* カスタマイズは強制カラーモード以外で適用 */
@media not (forced-colors: active) {
  .scroller {
    scrollbar-color: #888 #f5f5f5;
  }
}
```

### 2. コントラスト比の確保

スクロールバーのつまみと背景のコントラスト比は3:1以上を推奨します。

### 3. ホバー状態の提供

```css
.scroller::-webkit-scrollbar-thumb:hover {
  background: #555; /* より濃い色 */
}
```

### 4. プログレッシブエンハンスメント

```css
/* デフォルトのスクロールバー */
.scroller {
  overflow: auto;
}

/* カスタマイズは対応ブラウザのみ */
@supports (scrollbar-color: auto) {
  .scroller {
    scrollbar-color: #888 #f5f5f5;
  }
}
```

## ブラウザ対応

| プロパティ | Chrome | Firefox | Safari | Edge |
|-----------|--------|---------|--------|------|
| `scrollbar-color` | 121+ | 64+ | ✗ | 121+ |
| `scrollbar-width` | 121+ | 64+ | ✗ | 121+ |
| `::-webkit-scrollbar` | ○ | ✗ | ○ | ○ |
| `scrollbar-gutter` | 94+ | 97+ | ✗ | 94+ |

## 関連ナレッジ

- [強制カラーモード対応](../../cross-cutting/accessibility/forced-colors-mode.md)
- [レスポンシブコーディング](../../meta/responsive-coding.md)
- [モーダル実装（2025年版）](../components/dialog-modal-2025.md)

## 参考リンク

- [MDN: scrollbar-color](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color)
- [MDN: scrollbar-width](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-width)
- [MDN: ::-webkit-scrollbar](https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-scrollbar)
- [Interop 2024: Scrollbar Styling](https://wpt.fyi/results/css/css-scrollbars)
