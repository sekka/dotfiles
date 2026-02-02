# CSS overscroll-behavior（スクロール連鎖の防止）

## 概要

`overscroll-behavior`は、スクロール領域の境界に到達したときのブラウザの挙動を制御するCSSプロパティ。

**主な用途:**

- モーダルダイアログ内のスクロールが背景にスクロール連鎖するのを防ぐ
- スクロール可能なサイドバーから背景へのスクロール波及を防ぐ
- スマートフォンのプルトゥリフレッシュを無効化

**スクロール連鎖（Scroll Chaining）とは:**

モーダル内でスクロールし、端に到達すると、背景のページが代わりにスクロールしてしまう現象。

---

## 基本的な使い方

### 構文

```css
/* 単一値（x, y両方に適用） */
overscroll-behavior: auto;      /* デフォルト */
overscroll-behavior: contain;   /* スクロール連鎖を防ぐ */
overscroll-behavior: none;      /* スクロール連鎖とバウンス効果を防ぐ */

/* 個別指定 */
overscroll-behavior-x: contain;
overscroll-behavior-y: contain;

/* 両軸を個別指定 */
overscroll-behavior: contain auto;
/* x軸: contain, y軸: auto */
```

### プロパティ値

| 値 | 説明 | 効果 |
|----|------|------|
| `auto` | デフォルト。スクロール連鎖が発生する。 | スクロールが親要素に伝播 |
| `contain` | 要素内でスクロールを封じ込める。親要素へのスクロール連鎖を防ぐ。 | スクロール連鎖なし、バウンス効果あり（iOS） |
| `none` | スクロール連鎖を防ぎ、バウンス効果も無効化。 | スクロール連鎖なし、バウンス効果なし |

---

## 実装例

### ケース1: モーダルダイアログ

モーダル内でスクロールしても、背景がスクロールしないようにする。

**HTML:**

```html
<body>
  <!-- メインコンテンツ -->
  <main class="main-content">
    <h1>メインページ</h1>
    <p>長いコンテンツ...</p>
  </main>

  <!-- モーダル -->
  <dialog id="modal">
    <h2>モーダルタイトル</h2>
    <div class="modal-body">
      <p>長いコンテンツ...</p>
      <p>スクロール可能</p>
      <!-- ... 大量のコンテンツ ... -->
    </div>
    <button id="close">閉じる</button>
  </dialog>
</body>
```

**CSS:**

```css
dialog {
  /* モーダル内でスクロール連鎖を防ぐ */
  overscroll-behavior: contain;
  overflow-y: auto;
  max-height: 80vh;
}

.modal-body {
  padding: 1rem;
}

/* モーダルが開いているときに背景をスクロール不可にする */
body:has(dialog[open]) {
  overflow: hidden;
}
```

**JavaScript:**

```javascript
const modal = document.getElementById('modal');
const closeBtn = document.getElementById('close');

// モーダルを開く
function openModal() {
  modal.showModal();
}

// モーダルを閉じる
closeBtn.addEventListener('click', () => {
  modal.close();
});
```

**重要:** `overscroll-behavior`は**スクロールコンテナにのみ有効**。つまり、`overflow: auto`または`overflow: scroll`が設定されている要素にのみ適用される。

---

### ケース2: サイドバー

スクロール可能なサイドバーから、メインコンテンツへのスクロール連鎖を防ぐ。

**HTML:**

```html
<div class="layout">
  <aside class="sidebar">
    <nav>
      <a href="#1">項目1</a>
      <a href="#2">項目2</a>
      <!-- ... 大量のリンク ... -->
    </nav>
  </aside>

  <main class="content">
    <h1>メインコンテンツ</h1>
    <p>長いコンテンツ...</p>
  </main>
</div>
```

**CSS:**

```css
.layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 250px;
  overflow-y: auto;

  /* サイドバー内でスクロールを封じ込める */
  overscroll-behavior-y: contain;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}
```

---

### ケース3: Chrome 144+でのダイアログ対応

Chrome 144以降では、`<dialog>`要素と`::backdrop`の両方に`overscroll-behavior: contain`を設定することで、ページスクロールを防げる。

**CSS:**

```css
dialog {
  overscroll-behavior: contain;
  overflow-y: auto;
}

dialog::backdrop {
  overscroll-behavior: contain;
}
```

**出典:** [Modern CSS Daily - overscroll-behavior](https://modern-css.davecross.co.uk/2025/08/09/overscroll-behavior/)

---

### ケース4: プルトゥリフレッシュの無効化

スマートフォンでプルトゥリフレッシュを無効化する。

**CSS:**

```css
body {
  /* 上方向のスクロール連鎖を防ぐ */
  overscroll-behavior-y: contain;
}
```

**注意:** これにより、ブラウザ標準のプルトゥリフレッシュが無効化される。カスタムのリフレッシュ機能を実装する場合に有用。

---

## `overscroll-behavior`の制限

### スクロールコンテナにのみ有効

**重要:** `overscroll-behavior`は、`overflow: auto`または`overflow: scroll`が設定されている要素にのみ有効。スクロールバーがない要素には効果がない。

**NG例:**

```css
.non-scrollable {
  overscroll-behavior: contain;
  /* overflow指定がないため、効果なし */
}
```

**OK例:**

```css
.scrollable {
  overflow-y: auto;
  overscroll-behavior: contain;
  /* スクロールバーがあるため、効果あり */
}
```

**出典:** [CSS overscroll-behavior Only Affects Scroll Containers - Ben Nadel](https://www.bennadel.com/blog/4440-css-overscroll-behavior-only-affects-scroll-containers.htm)

---

## `contain` vs `none`

| 値 | スクロール連鎖 | バウンス効果（iOS） | プルトゥリフレッシュ |
|----|---------------|-------------------|-------------------|
| `contain` | 防ぐ | 許可 | 防ぐ |
| `none` | 防ぐ | 防ぐ | 防ぐ |

**推奨:**

- **モーダル、サイドバー**: `contain`（ユーザーエクスペリエンスを維持）
- **カスタムスクロール実装**: `none`（完全制御）

---

## アクセシビリティ考慮事項

### スクロール可能であることを明示

`overscroll-behavior`を使う場合、スクロール可能な領域であることを視覚的に明示する。

```css
.modal-body {
  overflow-y: auto;
  overscroll-behavior: contain;

  /* スクロールバーを常に表示（任意） */
  overflow-y: scroll;
}

/* スクロール可能なことを示すグラデーション */
.modal-body::after {
  content: '';
  position: sticky;
  bottom: 0;
  height: 2rem;
  background: linear-gradient(transparent, white);
  pointer-events: none;
}
```

### キーボードナビゲーション

`overscroll-behavior`を使っても、キーボードでのスクロールは正常に動作する。

```css
.modal {
  overscroll-behavior: contain;
  /* 矢印キー、PageUp/Down、Homeキー等は正常に動作 */
}
```

---

## パフォーマンス

`overscroll-behavior`は、GPUアクセラレーションを使用するため、パフォーマンスへの影響は最小限。

---

## 実践的なパターン

### Defensive CSS: スクロール連鎖対策

**問題:**

モーダル内の長いリストをスクロールし、端に到達すると背景がスクロールしてしまう。

**解決策:**

```css
.modal {
  overscroll-behavior-y: contain;
  overflow-y: auto;
}
```

**出典:** [Defensive CSS - Scroll chaining](https://defensivecss.dev/tip/scroll-chain/)

---

### CSS-Tricks: ページスクロールを防ぐ

モーダルが開いているときに、ページ全体のスクロールを防ぐ。

**アプローチ1: bodyに`overflow: hidden`**

```css
body.modal-open {
  overflow: hidden;
}
```

**アプローチ2: モーダルに`overscroll-behavior`**

```css
.modal {
  overscroll-behavior: contain;
}
```

**推奨:** 両方を併用。

```css
/* モーダルが開いたら背景スクロールを無効化 */
body.modal-open {
  overflow: hidden;
}

/* モーダル内でスクロール連鎖を防ぐ */
.modal {
  overscroll-behavior: contain;
  overflow-y: auto;
}
```

**出典:** [Prevent Page Scrolling When a Modal is Open - CSS-Tricks](https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/)

---

## Ahmad Shadeed: スクロール連鎖を防ぐ

モーダルのオーバーレイにも`overscroll-behavior`を設定する。

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  overscroll-behavior: contain;
}

.modal-content {
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

**出典:** [Prevent Scroll Chaining With Overscroll Behavior - Ahmad Shadeed](https://ishadeed.com/article/prevent-scroll-chaining-overscroll-behavior/)

---

## ブラウザサポート

**デスクトップ:**

- Chrome 63+（2017年12月）
- Firefox 59+（2018年3月）
- Safari 16+（2022年9月）
- Edge 79+（2020年1月）

**モバイル:**

- Chrome Android 63+
- Safari iOS 16+
- Samsung Internet 8+

**注意:**

- Safari 15以前は非サポート
- IE11非サポート

**Can I Use:** [overscroll-behavior](https://caniuse.com/css-overscroll-behavior)

---

## まとめ

**`overscroll-behavior`を使うべき場面:**

- モーダルダイアログ
- スクロール可能なサイドバー
- カルーセル、画像ギャラリー
- カスタムプルトゥリフレッシュ実装

**必須条件:**

- 要素が`overflow: auto`または`overflow: scroll`を持つこと

**推奨値:**

- **モーダル、サイドバー**: `contain`
- **カスタムスクロール**: `none`

**併用推奨:**

```css
/* モーダルが開いたら背景スクロールを防ぐ */
body.modal-open {
  overflow: hidden;
}

/* モーダル内でスクロール連鎖を防ぐ */
.modal {
  overscroll-behavior: contain;
  overflow-y: auto;
}
```

---

## 出典

- [overscroll-behavior - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior)
- [Prevent Scroll Chaining With Overscroll Behavior - Ahmad Shadeed](https://ishadeed.com/article/prevent-scroll-chaining-overscroll-behavior/)
- [CSS overscroll behavior - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Overscroll_behavior)
- [Prevent Page Scrolling When a Modal is Open - CSS-Tricks](https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/)
- [overscroll-behavior | CSS-Tricks](https://css-tricks.com/almanac/properties/o/overscroll-behavior/)
- [CSS overscroll-behavior Only Affects Scroll Containers - Ben Nadel](https://www.bennadel.com/blog/4440-css-overscroll-behavior-only-affects-scroll-containers.htm)
- [Defensive CSS - Scroll chaining](https://defensivecss.dev/tip/scroll-chain/)
- [overscroll-behavior - Modern CSS Daily](https://modern-css.davecross.co.uk/2025/08/09/overscroll-behavior/)
