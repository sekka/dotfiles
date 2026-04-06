---
title: スクロールチェイン回避（overscroll-behavior）
category: css/components
tags: [overscroll-behavior, dialog, modal, scroll-chaining, backdrop]
browser_support: Chrome 144+
created: 2026-01-31
updated: 2026-01-31
source: https://coliss.com/articles/build-websites/operation/css/how-to-avoid-scroll-chaining-with-css.html
---

# スクロールチェイン回避（overscroll-behavior）

## 概要

モーダルやダイアログ表示時の「スクロールチェイン」問題を、Chrome 144 以降では `overscroll-behavior: contain` で解決できます。

---

## スクロールチェインの問題点

### 問題の詳細

モーダルやダイアログが開いている際、ユーザーがそのコンテンツをスクロールして終点に達すると、**背後のページまでスクロールしてしまう**現象が発生します。

### 視覚的な説明

```
1. モーダル内でスクロール ↓
2. モーダルの最下部に到達 ↓
3. さらにスクロール続行 ↓
4. 背後のページがスクロールされる（意図しない挙動）
```

### ユーザー体験への影響

- **意図しないコンテンツの変更**: ユーザーが見たい情報が失われる
- **混乱**: モーダルを閉じたら別の場所にスクロールされている
- **操作ミス**: 特にモバイルで顕著

---

## 従来の overscroll-behavior の制限

### 制約

従来の `overscroll-behavior` は、**スクロール可能なコンテナに対してのみ機能**していました。

```css
/* 従来の方法 */
.scrollable-modal {
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

**問題点:**
- 少なくとも1ピクセルのオーバーフロー状態が必要
- コンテンツが短い場合は機能しない
- スクロールが不要な場合に対応できない

---

## Chrome 144 での改善

### 変更内容

Chrome 144（2026年1月リリース予定）では、**スクロール不可のコンテナでも機能**するよう仕様が改定されます。

### 実装方法

```css
dialog {
  overscroll-behavior: contain;
}

dialog::backdrop {
  overflow: hidden;
  overscroll-behavior: contain;
}
```

**重要ポイント:**
- `::backdrop` に `overflow: hidden;` を設定
- これにより、スクロール不可のスクロールコンテナが生成される
- チェイン現象を防止

---

## 実装例

### 基本的な実装

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    dialog {
      border: none;
      border-radius: 8px;
      padding: 2rem;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;

      /* スクロールチェイン防止 */
      overscroll-behavior: contain;
    }

    dialog::backdrop {
      background: rgba(0,0,0,0.5);

      /* 重要: overflow: hidden を設定 */
      overflow: hidden;
      overscroll-behavior: contain;
    }

    /* ページ本体に十分な高さを持たせる */
    body {
      min-height: 200vh;
      padding: 2rem;
    }
  </style>
</head>
<body>
  <h1>スクロールチェイン防止のデモ</h1>

  <button onclick="document.getElementById('demo-dialog').showModal()">
    モーダルを開く
  </button>

  <dialog id="demo-dialog">
    <h2>モーダルタイトル</h2>
    <p>この中でスクロールしても、背後のページはスクロールしません。</p>
    <p style="height: 100vh;">十分な高さのコンテンツ</p>
    <button onclick="this.closest('dialog').close()">閉じる</button>
  </dialog>

  <div style="height: 200vh;">
    <p>ページコンテンツ</p>
  </div>
</body>
</html>
```

### モバイル対応

```css
dialog {
  overscroll-behavior: contain;

  /* モバイルでのスクロール最適化 */
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

dialog::backdrop {
  overflow: hidden;
  overscroll-behavior: contain;

  /* モバイルでのタッチ操作最適化 */
  touch-action: none;
}
```

---

## 他の要素への応用

### サイドバー

```css
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

### フルスクリーンメニュー

```css
.fullscreen-menu {
  position: fixed;
  inset: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: white;
}
```

### ドロワー

```css
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 300px;
  overflow-y: auto;
  overscroll-behavior: contain;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.drawer.open {
  transform: translateX(0);
}
```

---

## ブラウザサポート

### 現在のサポート状況

- **Chrome 144+**: サポート済み
- **Firefox**: 未サポート（実装予定）
- **Safari**: 未サポート（実装予定）
- **Edge**: Chrome ベースのため 144+ でサポート

### プログレッシブエンハンスメント

```css
dialog {
  overscroll-behavior: contain;

  /* フォールバック（Chrome 143 以前） */
  @supports not (overscroll-behavior: contain) {
    /* JavaScript でスクロール制御 */
  }
}
```

---

## JavaScript フォールバック

Chrome 143 以前や他のブラウザでは、JavaScript でのフォールバックが必要です。

```javascript
const dialog = document.querySelector('dialog');

dialog.addEventListener('wheel', (event) => {
  const isScrollable = dialog.scrollHeight > dialog.clientHeight;
  const isAtTop = dialog.scrollTop === 0;
  const isAtBottom = dialog.scrollTop + dialog.clientHeight >= dialog.scrollHeight;

  if (!isScrollable) {
    event.preventDefault();
    return;
  }

  if ((isAtTop && event.deltaY < 0) || (isAtBottom && event.deltaY > 0)) {
    event.preventDefault();
  }
}, { passive: false });
```

---

## 完全な実装例

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      min-height: 200vh;
      font-family: system-ui, -apple-system, sans-serif;
    }

    dialog {
      border: none;
      border-radius: 12px;
      padding: 0;
      max-width: 600px;
      max-height: 80vh;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);

      /* スクロールチェイン防止 */
      overscroll-behavior: contain;
    }

    dialog::backdrop {
      background: rgba(0,0,0,0.6);
      overflow: hidden;
      overscroll-behavior: contain;
    }

    .dialog-header {
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
    }

    .dialog-content {
      padding: 1.5rem;
      overflow-y: auto;
      max-height: 60vh;
    }

    .dialog-footer {
      padding: 1.5rem;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
    }

    .btn-primary {
      background: #0070f3;
      color: white;
    }

    .btn-secondary {
      background: #eee;
      color: #333;
    }
  </style>
</head>
<body>
  <h1>スクロールチェイン防止のデモ</h1>
  <p>モーダル内でスクロールしても、背後のページはスクロールしません。</p>

  <button class="btn-primary" onclick="document.getElementById('demo-dialog').showModal()">
    モーダルを開く
  </button>

  <dialog id="demo-dialog">
    <div class="dialog-header">
      <h2>長いコンテンツのモーダル</h2>
    </div>
    <div class="dialog-content">
      <p>このモーダル内でスクロールを試してください。</p>
      <p>最下部に到達しても、背後のページはスクロールしません。</p>
      <div style="height: 100vh;">
        <p>十分な高さのコンテンツ...</p>
      </div>
      <p>モーダルの最下部です。</p>
    </div>
    <div class="dialog-footer">
      <button class="btn-secondary" onclick="this.closest('dialog').close()">
        キャンセル
      </button>
      <button class="btn-primary" onclick="this.closest('dialog').close()">
        OK
      </button>
    </div>
  </dialog>

  <div style="padding: 2rem;">
    <p>ページコンテンツ</p>
    <div style="height: 150vh; background: linear-gradient(to bottom, #f0f0f0, #d0d0d0);">
      スクロール可能な領域
    </div>
  </div>
</body>
</html>
```

---

## 参考資料

- [overscroll-behavior - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior)
- [CSS Overflow Module Level 3](https://drafts.csswg.org/css-overflow-3/#overscroll-behavior-properties)
- [Chrome 144 Release Notes](https://developer.chrome.com/blog/new-in-chrome-144)

---

## 関連ナレッジ

- [dialog 要素](../../html/modern/dialog.md)
- [CSS 2025 コンポーネント](./css-2025-components.md)
- [モーダル UI パターン](../../cross-cutting/ux/modal-patterns.md)
