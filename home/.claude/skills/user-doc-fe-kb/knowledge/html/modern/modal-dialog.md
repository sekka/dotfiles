# モーダルダイアログの実装（dialog要素）

## 概要

`<dialog>`要素は、モーダルやポップアップを実装するためのネイティブHTML要素。JavaScript、CSS、アクセシビリティの実装が組み込まれており、カスタム実装よりも簡単で安全。

**主な利点:**

- **アクセシビリティ**: ARIA属性、キーボードナビゲーション、フォーカストラップが自動
- **ネイティブAPI**: `.showModal()`, `.close()`, `::backdrop`疑似要素
- **セマンティック**: スクリーンリーダーが自動的にモーダルと認識

**2022年3月以降、全モダンブラウザでサポート。**

---

## 基本的な使い方

### HTML構造

```html
<dialog id="my-dialog">
  <h2>ダイアログタイトル</h2>
  <p>ダイアログの内容</p>
  <button id="close-btn">閉じる</button>
</dialog>

<button id="open-btn">ダイアログを開く</button>
```

### JavaScript

```javascript
const dialog = document.getElementById('my-dialog');
const openBtn = document.getElementById('open-btn');
const closeBtn = document.getElementById('close-btn');

// モーダルとして開く
openBtn.addEventListener('click', () => {
  dialog.showModal();
});

// 閉じる
closeBtn.addEventListener('click', () => {
  dialog.close();
});

// Escキーで閉じる（自動サポート）
// 背景クリックで閉じる（カスタム実装が必要）
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) {
    dialog.close();
  }
});
```

### CSS

```css
/* デフォルトでは中央配置されない場合がある */
dialog {
  max-width: 600px;
  padding: 2rem;
  border: none;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

/* 背景（::backdrop疑似要素） */
dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

/* アニメーション */
dialog[open] {
  animation: fadeIn 0.2s ease-out;
}

dialog::backdrop {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

---

## `.showModal()` vs `.show()`

### `.showModal()`（モーダルダイアログ）

```javascript
dialog.showModal();
```

**特徴:**

- 背景が`::backdrop`疑似要素で覆われる
- フォーカスがダイアログ内に閉じ込められる（フォーカストラップ）
- Escキーでダイアログが閉じる
- `aria-modal="true"`が自動設定される
- 背景コンテンツが`inert`になる（クリック、フォーカス不可）

**推奨用途:** モーダルダイアログ（背景を無効化する必要がある場合）

### `.show()`（非モーダルダイアログ）

```javascript
dialog.show();
```

**特徴:**

- 背景が有効のまま
- フォーカストラップなし
- Escキーで閉じない
- `::backdrop`疑似要素なし

**推奨用途:** ポップオーバー、ツールチップ（背景と同時に操作したい場合）

---

## アクセシビリティ考慮事項

### 自動的に提供される機能

`<dialog>`要素は、以下を自動的に処理:

1. **`role="dialog"`と`aria-modal="true"`の設定**
2. **フォーカストラップ**: ダイアログ内でフォーカスが循環
3. **Escキーで閉じる**
4. **背景を`inert`化**: スクリーンリーダーが背景を読み上げない

### 追加すべきARIA属性

```html
<dialog id="settings-dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description">
  <h2 id="dialog-title">設定</h2>
  <p id="dialog-description">アプリケーションの設定を変更します</p>

  <!-- コンテンツ -->

  <button type="button" onclick="this.closest('dialog').close()">
    閉じる
  </button>
</dialog>
```

**重要:**

- `aria-labelledby`: ダイアログのタイトルを指定（スクリーンリーダーが最初に読み上げる）
- `aria-describedby`: ダイアログの説明を指定

### フォーカス管理

ダイアログを開いたときに、適切な要素にフォーカスを設定する。

```javascript
openBtn.addEventListener('click', () => {
  dialog.showModal();

  // 最初のフォーカス可能な要素にフォーカス
  const firstFocusable = dialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  firstFocusable?.focus();
});
```

**ダイアログを閉じたら元の位置にフォーカスを戻す:**

```javascript
let previouslyFocused;

openBtn.addEventListener('click', () => {
  previouslyFocused = document.activeElement;
  dialog.showModal();
});

dialog.addEventListener('close', () => {
  previouslyFocused?.focus();
});
```

---

## iOS Safari対策

### 問題点

iOS SafariとVoiceOverには、`<dialog>`要素に関するアクセシビリティ問題がある:

1. **VoiceOverがダイアログ外に移動できる**: フォーカストラップが機能しない
2. **`aria-modal`が正しく動作しない**: 背景コンテンツがスクリーンリーダーから隠れない
3. **`display: none`でフォーカスが移動しない**: `visibility`を使う必要がある

**出典:**

- [The current state of modal dialog accessibility - TPGi](https://www.tpgi.com/the-current-state-of-modal-dialog-accessibility/)
- [What's new in web accessibility - WWDC22 - Apple Developer](https://developer.apple.com/videos/play/wwdc2022/10153/)

### 対策1: `inert`属性を明示的に設定

```javascript
const mainContent = document.getElementById('main-content');

openBtn.addEventListener('click', () => {
  dialog.showModal();

  // iOS Safari対策: 背景を明示的に非活性化
  mainContent.inert = true;
});

dialog.addEventListener('close', () => {
  mainContent.inert = false;
});
```

### 対策2: `visibility`でダイアログを表示/非表示

```css
dialog:not([open]) {
  visibility: hidden;
  /* display: none を使わない */
}
```

### 対策3: フォーカストラップを手動実装

iOS Safariでは、フォーカストラップが機能しないことがあるため、手動で実装する。

```javascript
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift+Tab: 最初の要素にいたら最後に移動
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: 最後の要素にいたら最初に移動
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });

  // 最初の要素にフォーカス
  firstElement.focus();
}

// 使用例
openBtn.addEventListener('click', () => {
  dialog.showModal();
  trapFocus(dialog);
});
```

**出典:** [Mastering Accessible Modals with ARIA and Keyboard Navigation - The A11Y Collective](https://www.a11y-collective.com/blog/modal-accessibility/)

---

## 背景クリックで閉じる

デフォルトでは、背景をクリックしてもダイアログは閉じない。これを実装する:

```javascript
dialog.addEventListener('click', (e) => {
  // クリックされた要素がdialog自身（背景）の場合
  if (e.target === dialog) {
    dialog.close();
  }
});
```

**CSS（背景クリック領域を拡大）:**

```css
dialog {
  padding: 0;
}

dialog::backdrop {
  cursor: pointer;
}

/* ダイアログ本体 */
.dialog-content {
  padding: 2rem;
  cursor: default;
}
```

**HTML:**

```html
<dialog id="my-dialog">
  <div class="dialog-content">
    <h2>タイトル</h2>
    <p>内容</p>
    <button onclick="this.closest('dialog').close()">閉じる</button>
  </div>
</dialog>
```

---

## フォームの統合

`<dialog>`内の`<form method="dialog">`は、送信時にダイアログを自動的に閉じる。

```html
<dialog id="confirm-dialog">
  <form method="dialog">
    <h2>確認</h2>
    <p>本当に削除しますか？</p>

    <!-- value属性の値がdialog.returnValueに設定される -->
    <button type="submit" value="cancel">キャンセル</button>
    <button type="submit" value="confirm" autofocus>削除</button>
  </form>
</dialog>

<script>
  const confirmDialog = document.getElementById('confirm-dialog');

  function deleteItem() {
    confirmDialog.showModal();
  }

  confirmDialog.addEventListener('close', () => {
    if (confirmDialog.returnValue === 'confirm') {
      // 削除処理
      console.log('アイテムを削除しました');
    } else {
      console.log('キャンセルしました');
    }
  });
</script>
```

**メリット:**

- フォーム送信でダイアログが自動的に閉じる
- `returnValue`で選択された値を取得できる
- JavaScriptの記述が減る

---

## スクロール連鎖の防止

モーダル内でスクロールしても、背景がスクロールしないようにする。

**CSS:**

```css
dialog {
  overscroll-behavior: contain;
  overflow-y: auto;
  max-height: 80vh;
}

/* Chrome 144+では、::backdropにも設定 */
dialog::backdrop {
  overscroll-behavior: contain;
}

/* モーダルが開いているときに背景スクロールを無効化 */
body:has(dialog[open]) {
  overflow: hidden;
}
```

**出典:** [CSS overscroll-behavior](https://modern-css.davecross.co.uk/2025/08/09/overscroll-behavior/)

---

## アニメーション

### フェードイン/フェードアウト

```css
dialog {
  opacity: 0;
  transition: opacity 0.2s ease-out;
}

dialog[open] {
  opacity: 1;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0);
  transition: background 0.2s ease-out;
}

dialog[open]::backdrop {
  background: rgba(0, 0, 0, 0.5);
}
```

### スライドイン

```css
@keyframes slideIn {
  from {
    transform: translateY(-100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

dialog[open] {
  animation: slideIn 0.3s ease-out;
}
```

---

## ブラウザサポート

**デスクトップ:**

- Chrome 37+（2014年）
- Firefox 98+（2022年3月）
- Safari 15.4+（2022年3月）
- Edge 79+（2020年）

**モバイル:**

- Chrome Android 37+
- Safari iOS 15.4+
- Samsung Internet 3+

**全モダンブラウザでサポート（2022年3月以降）**

**Can I Use:** [dialog element](https://caniuse.com/dialog)

### ポリフィル

古いブラウザ対応が必要な場合:

```bash
npm install dialog-polyfill
```

```javascript
import dialogPolyfill from 'dialog-polyfill';

const dialog = document.querySelector('dialog');
dialogPolyfill.registerDialog(dialog);
```

---

## まとめ

**`<dialog>`要素を使うべき理由:**

- ネイティブのアクセシビリティサポート
- フォーカストラップ、Escキー、`::backdrop`が自動
- カスタム実装よりシンプル

**必須の実装:**

1. `aria-labelledby`と`aria-describedby`を設定
2. ダイアログを閉じたら元の位置にフォーカスを戻す
3. iOS Safari対策（`inert`の明示的設定、フォーカストラップ）
4. スクロール連鎖を防ぐ（`overscroll-behavior: contain`）

**推奨パターン:**

```html
<dialog id="my-dialog" aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <h2 id="dialog-title">タイトル</h2>
  <p id="dialog-desc">説明文</p>
  <form method="dialog">
    <button value="cancel">キャンセル</button>
    <button value="ok" autofocus>OK</button>
  </form>
</dialog>
```

```javascript
const dialog = document.getElementById('my-dialog');
let previouslyFocused;

function openDialog() {
  previouslyFocused = document.activeElement;
  dialog.showModal();
  document.getElementById('main-content').inert = true;
}

dialog.addEventListener('close', () => {
  document.getElementById('main-content').inert = false;
  previouslyFocused?.focus();
});
```

```css
dialog {
  overscroll-behavior: contain;
  overflow-y: auto;
  max-height: 80vh;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  overscroll-behavior: contain;
}

body:has(dialog[open]) {
  overflow: hidden;
}
```

---

## 出典

- [The current state of modal dialog accessibility - TPGi](https://www.tpgi.com/the-current-state-of-modal-dialog-accessibility/)
- [The HTML Dialog Element: Your Native Solution for Accessible Modals and Popups - DEV](https://dev.to/ilham-bouktir/the-html-dialog-element-your-native-solution-for-accessible-modals-and-popups-308p)
- [Why you should use the Native Dialog Element - OIDAISDES](https://www.oidaisdes.org/native-dialog-element.en/)
- [Accessible Modal Dialogs - GitHub: scottaohara](https://github.com/scottaohara/accessible_modal_window)
- [Mastering Accessible Modals with ARIA and Keyboard Navigation - The A11Y Collective](https://www.a11y-collective.com/blog/modal-accessibility/)
- [What's new in web accessibility - WWDC22 - Apple Developer](https://developer.apple.com/videos/play/wwdc2022/10153/)
- [Introducing the Dialog Element | WebKit](https://webkit.org/blog/12209/introducing-the-dialog-element/)
- [The HTML Dialog Element: A Native Solution for Accessible Modal Interactions - Schalk Neethling](https://schalkneethling.com/posts/html-dialog-native-solution-for-accessible-modal-interactions/)
