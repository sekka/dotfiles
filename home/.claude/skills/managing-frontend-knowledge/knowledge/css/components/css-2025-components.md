---
title: CSS 2025 コンポーネント機能
category: css/components
tags: [css-2025, dialog, command, popover, select, carousel, interestfor]
browser_support: Chrome 134+（段階的に実装中）
created: 2026-01-31
updated: 2026-01-31
source: https://coliss.com/articles/build-websites/operation/css/css-in-2025-components.html
---

# CSS 2025 コンポーネント機能

## 概要

CSS 2025 では、JavaScriptなしでUIコンポーネントを実装できる機能が多数導入されます。dialog + commandfor/command属性、closedby属性、popover=hint、CSSカルーセルなどをまとめます。

---

## Dialog + commandfor/command 属性

### 概要

JavaScriptなしでモーダルを制御できます。

### 基本構文

```html
<button commandfor="ダイアログID" command="アクション">ボタン</button>
<dialog id="ダイアログID">内容</dialog>
```

### 実装例

#### 1. 基本的なモーダル

```html
<button commandfor="my-dialog" command="show-modal">モーダルを開く</button>

<dialog id="my-dialog">
  <h2>モーダルタイトル</h2>
  <p>モーダルの内容</p>
  <button commandfor="my-dialog" command="close">閉じる</button>
</dialog>
```

**組み込みアクション:**
- `show-modal`: モーダルとして表示
- `showModal`: 同上（エイリアス）
- `close`: ダイアログを閉じる

#### 2. 複数のモーダル

```html
<button commandfor="dialog-1" command="show-modal">ダイアログ1</button>
<button commandfor="dialog-2" command="show-modal">ダイアログ2</button>

<dialog id="dialog-1">
  <h2>ダイアログ1</h2>
  <button commandfor="dialog-1" command="close">閉じる</button>
</dialog>

<dialog id="dialog-2">
  <h2>ダイアログ2</h2>
  <button commandfor="dialog-2" command="close">閉じる</button>
</dialog>
```

### 従来の JavaScript 実装との比較

**従来（JavaScript）:**

```html
<button id="openBtn">モーダルを開く</button>

<dialog id="my-dialog">
  <h2>モーダル</h2>
  <button id="closeBtn">閉じる</button>
</dialog>

<script>
  const dialog = document.getElementById('my-dialog');
  document.getElementById('openBtn').addEventListener('click', () => {
    dialog.showModal();
  });
  document.getElementById('closeBtn').addEventListener('click', () => {
    dialog.close();
  });
</script>
```

**新しい実装（HTML のみ）:**

```html
<button commandfor="my-dialog" command="show-modal">モーダルを開く</button>

<dialog id="my-dialog">
  <h2>モーダル</h2>
  <button commandfor="my-dialog" command="close">閉じる</button>
</dialog>
```

---

## closedby 属性

### 概要

ダイアログを閉じる動作を制御します（Chrome 134+）。

### オプション

| 値 | 説明 | ユースケース |
|----|------|-------------|
| `none` | 閉じる操作を許可しない | 必須アクション |
| `closerequest` | ESCキーで閉じる（デフォルト） | 標準的なモーダル |
| `any` | ESC + 外側クリックで閉じる | 柔軟なUI |

### 実装例

#### 1. 外側クリックで閉じる

```html
<dialog id="my-dialog" closedby="any">
  <h2>外側をクリックで閉じられます</h2>
  <p>ESCキーでも閉じられます</p>
</dialog>
```

#### 2. 閉じる操作を禁止

```html
<dialog id="important-dialog" closedby="none">
  <h2>重要な通知</h2>
  <p>必ずボタンから閉じてください</p>
  <button commandfor="important-dialog" command="close">同意する</button>
</dialog>
```

#### 3. ESCキーのみで閉じる

```html
<dialog id="standard-dialog" closedby="closerequest">
  <h2>標準的なモーダル</h2>
  <p>ESCキーで閉じられます</p>
</dialog>
```

---

## popover=hint

### 概要

ツールチップやプレビューカード向けの新しいポップオーバータイプ。

### 基本構文

```html
<button interestfor="ヒントID">ホバー</button>
<div id="ヒントID" popover="hint">ヒント内容</div>
```

### 実装例

#### 1. ツールチップ

```html
<button interestfor="tooltip-1">ヘルプ</button>
<div id="tooltip-1" popover="hint">
  ここにヘルプテキストが表示されます
</div>

<style>
  [popover="hint"] {
    background: black;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: none;
  }
</style>
```

#### 2. プレビューカード

```html
<a href="/article/1" interestfor="preview-1">記事タイトル</a>
<div id="preview-1" popover="hint">
  <img src="thumbnail.jpg" alt="サムネイル">
  <h3>記事のプレビュー</h3>
  <p>記事の概要文...</p>
</div>

<style>
  [popover="hint"] {
    max-width: 300px;
    padding: 1rem;
    background: white;
    border: 1px solid #ccc;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
</style>
```

### 利点

- **複数のヒントを同時表示**: 他のポップオーバーを閉じない
- **リンク要素にも配置可能**: `<a>` タグにも使用できる
- **階層的なUI**: ネストされたヒントが共存可能

---

## appearance: base-select

### 概要

`select` 要素を完全カスタマイズ可能にします。

### 基本構文

```css
select {
  &::picker(select) {
    appearance: base-select;
  }
}
```

### 実装例

#### 1. カスタムスタイルのselect

```html
<select>
  <option>オプション1</option>
  <option>オプション2</option>
  <option>オプション3</option>
</select>

<style>
  select {
    appearance: none;
    padding: 0.5rem 2rem 0.5rem 1rem;
    border: 2px solid #4CAF50;
    border-radius: 4px;
    background: white;
    font-size: 1rem;

    &::picker(select) {
      appearance: base-select;
    }
  }
</style>
```

#### 2. オプション内にHTML要素を含む

```html
<select>
  <option>
    <img src="flag-us.png" alt="US">
    United States
  </option>
  <option>
    <img src="flag-jp.png" alt="JP">
    Japan
  </option>
</select>
```

#### 3. selectedcontent で選択状態を制御

```html
<select>
  <selectedcontent>選択中: <slot></slot></selectedcontent>
  <option>オプション1</option>
  <option>オプション2</option>
</select>
```

---

## CSS カルーセル

### 概要

`::scroll-button()` と `::scroll-marker()` 疑似要素でカルーセルを実装します。

### ::scroll-button() 疑似要素

```css
.carousel::scroll-button(left) {
  content: "⬅" / "Scroll Left";
  background: white;
  border: 1px solid #ccc;
  padding: 0.5rem;
}

.carousel::scroll-button(right) {
  content: "➡" / "Scroll Right";
  background: white;
  border: 1px solid #ccc;
  padding: 0.5rem;
}
```

### ::scroll-marker() 疑似要素

```css
.carousel > li::scroll-marker {
  width: 1em;
  height: 1em;
  border-radius: 50%;
  background: #ccc;
}

.carousel > li::scroll-marker:target-current {
  background: black;
}
```

### 実装例

```html
<ul class="carousel">
  <li>スライド1</li>
  <li>スライド2</li>
  <li>スライド3</li>
</ul>

<style>
  .carousel {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
  }

  .carousel > li {
    flex: 0 0 100%;
    scroll-snap-align: center;
  }

  /* スクロールボタン */
  .carousel::scroll-button(left) {
    content: "⬅" / "前へ";
  }

  .carousel::scroll-button(right) {
    content: "➡" / "次へ";
  }

  /* インジケーター */
  .carousel > li::scroll-marker {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ccc;
  }

  .carousel > li::scroll-marker:target-current {
    background: #333;
  }
</style>
```

---

## interestfor 属性

### 概要

ホバー・フォーカスで要素に「関心」を示した際にトリガーします。

### 基本構文

```html
<button interestfor="ターゲットID">ボタン</button>
<div id="ターゲットID" popover="hint">内容</div>
```

### 遅延設定

```html
<button interestfor="delayed-hint" interest-delay="1000">ホバーを1秒保持</button>
<div id="delayed-hint" popover="hint">1秒後に表示</div>
```

**デフォルト:** 0.5秒（500ms）

### イベント

```javascript
document.getElementById('target').addEventListener('interest', (event) => {
  console.log('Interest event triggered');
});
```

### ユースケース

- **ツールチップ**: ホバー時に表示
- **プレビューカード**: リンクホバー時にプレビュー
- **コンテキストメニュー**: 長押しでメニュー表示
- **キーボード対応**: フォーカス時にも動作

---

## 統合例

すべての機能を組み合わせた実装例：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* モーダル */
    dialog {
      border: none;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }

    dialog::backdrop {
      background: rgba(0,0,0,0.5);
    }

    /* ポップオーバーヒント */
    [popover="hint"] {
      background: black;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: none;
    }

    /* カルーセル */
    .carousel {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
    }

    .carousel > li {
      flex: 0 0 100%;
      scroll-snap-align: center;
      list-style: none;
    }

    .carousel::scroll-button(left) {
      content: "⬅";
    }

    .carousel::scroll-button(right) {
      content: "➡";
    }

    .carousel > li::scroll-marker {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #ccc;
    }

    .carousel > li::scroll-marker:target-current {
      background: #333;
    }
  </style>
</head>
<body>
  <!-- モーダル -->
  <button commandfor="my-dialog" command="show-modal">モーダルを開く</button>
  <dialog id="my-dialog" closedby="any">
    <h2>モーダル</h2>
    <p>外側クリックまたはESCで閉じられます</p>
    <button commandfor="my-dialog" command="close">閉じる</button>
  </dialog>

  <!-- ツールチップ -->
  <button interestfor="tooltip">ヘルプ</button>
  <div id="tooltip" popover="hint">ここにヘルプが表示されます</div>

  <!-- カルーセル -->
  <ul class="carousel">
    <li>スライド1</li>
    <li>スライド2</li>
    <li>スライド3</li>
  </ul>
</body>
</html>
```

---

## 参考資料

- [commandfor/command - HTML Spec](https://html.spec.whatwg.org/#the-commandfor-attribute)
- [closedby - HTML Spec](https://github.com/whatwg/html/pull/10529)
- [popover=hint - HTML Spec](https://github.com/whatwg/html/pull/10309)
- [CSS Carousel - CSS Spec](https://drafts.csswg.org/css-overflow-5/)
- [interestfor - HTML Spec](https://github.com/whatwg/html/pull/10583)

---

## 関連ナレッジ

- [CSS 2025 エルゴノミクス](../modern/css-2025-ergonomics.md)
- [CSS 2025 インタラクション](../animation/css-2025-interactions.md)
- [dialog 要素](../../html/modern/dialog.md)
- [Popover API](./popover.md)
