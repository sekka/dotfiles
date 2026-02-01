# HTML inert属性

## 概要

`inert`は、HTML要素とその子孫全体を「非活性」にするグローバル属性。非活性になった要素は、フォーカス、クリック、選択が不可能になり、アクセシビリティツリーからも除外される。

モーダルダイアログやドロワーが開いているときに、背景コンテンツへのアクセスを防ぐために主に使用される。

**対応HTMLバージョン:** HTML Living Standard（2026年1月29日更新）

---

## 基本的な使い方

### 構文

```html
<!-- Boolean属性として使用 -->
<div inert>
  このコンテンツは非活性です
</div>

<!-- JavaScriptで動的に設定 -->
<script>
  const element = document.querySelector('.modal-background');
  element.inert = true;  // 非活性化
  element.inert = false; // 活性化
</script>
```

---

## 実装例

### ケース1: モーダルダイアログ

モーダルが開いているときに、背景コンテンツへのフォーカスを防ぐ。

```html
<body>
  <!-- メインコンテンツ -->
  <main id="main-content">
    <h1>メインページ</h1>
    <button id="open-modal">モーダルを開く</button>
    <a href="/about">About</a>
  </main>

  <!-- モーダル -->
  <div id="modal" role="dialog" aria-modal="true" hidden>
    <h2>モーダルタイトル</h2>
    <p>これはモーダルの内容です</p>
    <button id="close-modal">閉じる</button>
  </div>
</body>

<script>
  const mainContent = document.getElementById('main-content');
  const modal = document.getElementById('modal');
  const openBtn = document.getElementById('open-modal');
  const closeBtn = document.getElementById('close-modal');

  openBtn.addEventListener('click', () => {
    // モーダルを表示
    modal.hidden = false;

    // 背景を非活性化
    mainContent.inert = true;

    // モーダル内の最初の要素にフォーカス
    closeBtn.focus();
  });

  closeBtn.addEventListener('click', () => {
    // モーダルを非表示
    modal.hidden = true;

    // 背景を活性化
    mainContent.inert = false;

    // 元のボタンにフォーカスを戻す
    openBtn.focus();
  });
</script>
```

**CSS（視覚的なフィードバック）:**

```css
/* inert属性がある要素をグレーアウト */
[inert] {
  opacity: 0.5;
  pointer-events: none;
  user-select: none;
}

/* モーダルのオーバーレイ */
#modal::before {
  content: '';
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: -1;
}
```

---

### ケース2: オフキャンバス・ドロワー

サイドバーが開いているときに、メインコンテンツを非活性化。

```html
<body>
  <aside id="sidebar" hidden>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <button id="close-sidebar">閉じる</button>
    </nav>
  </aside>

  <main id="main">
    <button id="open-sidebar">メニューを開く</button>
    <h1>メインコンテンツ</h1>
  </main>
</body>

<script>
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main');
  const openBtn = document.getElementById('open-sidebar');
  const closeBtn = document.getElementById('close-sidebar');

  openBtn.addEventListener('click', () => {
    sidebar.hidden = false;
    main.inert = true;  // メインコンテンツを非活性化
  });

  closeBtn.addEventListener('click', () => {
    sidebar.hidden = true;
    main.inert = false;  // メインコンテンツを活性化
  });
</script>
```

---

### ケース3: ローディング中の非活性化

フォームを送信中、UIを非活性化して二重送信を防ぐ。

```html
<form id="payment-form">
  <label>
    カード番号
    <input type="text" name="card" required>
  </label>
  <button type="submit">支払う</button>
</form>

<div id="loading-overlay" hidden>
  <p>処理中...</p>
</div>

<script>
  const form = document.getElementById('payment-form');
  const overlay = document.getElementById('loading-overlay');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // フォーム全体を非活性化
    form.inert = true;
    overlay.hidden = false;

    try {
      await processPayment(new FormData(form));
      alert('支払い完了');
    } catch (error) {
      alert('エラーが発生しました');
    } finally {
      // フォームを活性化
      form.inert = false;
      overlay.hidden = true;
    }
  });

  async function processPayment(data) {
    // 支払い処理（ダミー）
    return new Promise(resolve => setTimeout(resolve, 2000));
  }
</script>
```

---

## `inert`が与える影響

### 1. フォーカス不可

`inert`属性がある要素とその子孫は、Tab キーでフォーカスできない。

```html
<div inert>
  <button>このボタンはフォーカスできない</button>
  <a href="/link">このリンクもフォーカスできない</a>
  <input type="text">  <!-- フォーカス不可 -->
</div>
```

### 2. クリック不可

ポインターイベント（クリック、タップ）に反応しない。

**注意:** `inert`だけではクリックを完全に防げない。`pointer-events: none`を併用推奨。

```css
[inert] {
  pointer-events: none;
}
```

### 3. 選択不可

テキスト選択ができない。

```css
[inert] {
  user-select: none;
}
```

### 4. アクセシビリティツリーから除外

スクリーンリーダーが`inert`要素を読み上げない。`aria-hidden="true"`と同様の効果。

---

## アクセシビリティ考慮事項

### 必須: 視覚的なフィードバック

**重要:** `inert`属性は、デフォルトで視覚的な変化を与えない。ユーザーがどの部分が非活性かを視覚的に理解できるよう、CSSで明示的にスタイルを適用すること。

**推奨スタイル:**

```css
[inert] {
  opacity: 0.5;              /* 半透明 */
  filter: grayscale(1);      /* グレースケール */
  pointer-events: none;      /* クリック不可 */
  user-select: none;         /* 選択不可 */
}
```

**悪い例（視覚的フィードバックなし）:**

```html
<div inert>
  <!-- ユーザーには活性状態と区別がつかない -->
  <button>クリックできそうに見えるが、実際には無効</button>
</div>
```

### フォーカストラップとの併用

`inert`は、モーダル内でフォーカスを閉じ込める「フォーカストラップ」と併用するのが一般的。

```javascript
// フォーカストラップの実装例
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
}

// モーダルを開くときに使用
openModal.addEventListener('click', () => {
  modal.hidden = false;
  mainContent.inert = true;  // 背景を非活性化
  trapFocus(modal);          // モーダル内にフォーカスを閉じ込める
});
```

### WCAG 2.2 準拠

`inert`は、WCAG 2.2の以下の達成基準を満たすために役立つ:

- **2.4.3 Focus Order**: フォーカス順序が論理的であること
- **2.1.2 No Keyboard Trap**: キーボードでフォーカスを抜けられること
- **4.1.2 Name, Role, Value**: UI要素の状態が適切に伝わること

---

## `aria-modal`との違い

| 属性 | 効果 | 推奨用途 |
|------|------|----------|
| `inert` | 要素を完全に非活性化（フォーカス、クリック、アクセシビリティツリー） | モーダルの背景コンテンツ |
| `aria-modal="true"` | スクリーンリーダーにモーダルであることを通知（フォーカスは制御しない） | モーダル自体 |

**併用が推奨:**

```html
<body>
  <main inert>
    <!-- 背景コンテンツ -->
  </main>

  <div role="dialog" aria-modal="true">
    <!-- モーダル -->
  </div>
</body>
```

---

## JavaScriptでの操作

### プロパティとして使用

```javascript
const element = document.querySelector('.sidebar');

// 非活性化
element.inert = true;

// 状態を確認
if (element.inert) {
  console.log('要素は非活性です');
}

// 活性化
element.inert = false;
```

### 属性として使用

```javascript
// 属性を追加
element.setAttribute('inert', '');

// 属性を削除
element.removeAttribute('inert');

// 属性の有無を確認
if (element.hasAttribute('inert')) {
  console.log('非活性です');
}
```

---

## ブラウザサポート

**2026年時点:**

- Chrome 102+（2022年5月）
- Firefox 112+（2023年4月）
- Safari 15.5+（2022年5月）
- Edge 102+（2022年5月）

**iOS Safari:** 15.5+（2022年5月）

**全ブラウザで安定サポート:** すべてのモダンブラウザで利用可能（2022年3月以降）

**IE11:** 非対応（ポリフィル必要）

### ポリフィル

古いブラウザ対応が必要な場合:

```bash
npm install wicg-inert
```

```javascript
import 'wicg-inert';
```

---

## 注意事項

### `pointer-events`との併用

`inert`だけでは、`pointer-events`を明示的に設定した要素のクリックを防げない可能性がある。CSSで追加の制御を推奨。

```css
[inert] {
  pointer-events: none !important;
}
```

### パフォーマンス

`inert`は、要素とその子孫すべてに影響するため、大きなDOMツリーに適用するとパフォーマンスに影響する可能性がある。

**推奨:**

```html
<!-- Good: 必要な部分だけ非活性化 -->
<body>
  <main inert>...</main>
  <dialog>...</dialog>
</body>

<!-- Bad: body全体を非活性化（dialogも含まれる） -->
<body inert>
  <main>...</main>
  <dialog>...</dialog>
</body>
```

---

## まとめ

**`inert`を使うべき場面:**

- モーダルダイアログの背景コンテンツ
- オフキャンバス・ドロワーのメインコンテンツ
- ローディング中のフォーム
- ウィザード形式UIの未到達ステップ

**必須の実装:**

1. CSSで視覚的なフィードバックを提供
2. フォーカストラップと併用
3. モーダルを閉じたらフォーカスを元の位置に戻す

---

## 出典

- [HTML inert global attribute - MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert)
- [The inert attribute - HTML Standard, Edition for Web Developers](https://html.spec.whatwg.org/dev/interaction.html)
- [The inert attribute | Articles | web.dev](https://web.dev/articles/inert)
- [Using the HTML inert property to manage user focus - LogRocket Blog](https://blog.logrocket.com/using-html-inert-property-manage-user-focus/)
- [HTML inert Attribute | 12 Days of Web](https://12daysofweb.dev/2024/html-inert-attribute)
- [When should you (still) use inert HTML attribute? - Bogdan on Digital Accessibility](https://cerovac.com/a11y/2023/07/when-should-you-still-use-inert-html-attribute/)
- [Why you should start using the inert attribute when coding your next modal window - Stefany Newman](https://medium.com/@web-accessibility-education/why-you-should-start-using-the-inert-attribute-when-coding-your-next-modal-window-ed9400b1e12a)
