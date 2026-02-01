# リンク、ボタン、フォームのセマンティック

## 概要

リンク（`<a>`）、ボタン（`<button>`）、フォームコントロールは、それぞれ異なるセマンティックな役割を持つ。適切な要素を使うことで、アクセシビリティ、キーボードナビゲーション、スクリーンリーダー対応が自動的に提供される。

**基本原則:**

- **リンク（`<a>`）**: ナビゲーション（別のページ、別のセクションへ移動）
- **ボタン（`<button>`）**: アクション（フォーム送信、モーダル表示、データ操作）
- **クリック可能な`<div>`は使わない**: セマンティクスが失われる

---

## リンク（`<a>`）vs ボタン（`<button>`）

### セマンティックな違い

| 要素 | 役割 | 用途 | キーボード |
|------|------|------|------------|
| `<a>` | ナビゲーション | ページ遷移、アンカーリンク | Enter |
| `<button>` | アクション | フォーム送信、モーダル表示、状態変更 | Enter, Space |

### スクリーンリーダーの読み上げ

```html
<!-- リンク -->
<a href="/about">詳細情報</a>
<!-- 読み上げ: "リンク。詳細情報" -->
<!-- ユーザーの期待: ページ遷移 -->

<!-- ボタン -->
<button>詳細情報</button>
<!-- 読み上げ: "ボタン。詳細情報" -->
<!-- ユーザーの期待: ポップアップ、展開、アクション -->
```

### キーボード操作の違い

```html
<!-- リンク: Enterキーのみ -->
<a href="/account">アカウント</a>

<!-- ボタン: EnterとSpaceキーの両方 -->
<button type="button">アカウント</button>
```

**テスト:**

```javascript
// ボタンはSpaceキーで反応する
button.addEventListener('click', () => {
  console.log('ボタンがクリックされました');
});

// リンクはSpaceキーでスクロールする（クリックイベントは発火しない）
```

---

## 適切な要素の選び方

### デシジョンツリー

```
この操作は何をする？
  ↓
別のページやセクションへ移動？
  YES → <a href="...">
  NO  → 次へ
  ↓
フォームを送信？
  YES → <button type="submit">
  NO  → 次へ
  ↓
状態を変更、モーダル表示、データ操作？
  YES → <button type="button">
  NO  → 再検討（本当にクリック可能である必要がある？）
```

### 実例

#### ✅ 正しい使い方

```html
<!-- ナビゲーション: リンク -->
<a href="/products">商品一覧</a>
<a href="#pricing">料金プランへ</a>

<!-- アクション: ボタン -->
<button type="button" onclick="openModal()">ログイン</button>
<button type="submit">送信</button>
<button type="button" onclick="toggleMenu()">メニュー</button>

<!-- フォーム送信: submitボタン -->
<form>
  <input type="text" name="email">
  <button type="submit">登録</button>
</form>
```

#### ❌ 間違った使い方

```html
<!-- NG: ボタンでページ遷移 -->
<button onclick="location.href='/products'">商品一覧</button>
<!-- リンクを使うべき -->

<!-- NG: リンクでモーダル表示 -->
<a href="#" onclick="openModal(); return false;">ログイン</a>
<!-- ボタンを使うべき -->

<!-- NG: divでクリック可能な要素 -->
<div onclick="submitForm()">送信</div>
<!-- ボタンを使うべき -->

<!-- NG: spanでクリック可能な要素 -->
<span class="button" onclick="doSomething()">クリック</span>
<!-- ボタンを使うべき -->
```

---

## ボタンの種類（`type`属性）

```html
<!-- type="submit": フォームを送信（デフォルト） -->
<form>
  <button type="submit">送信</button>
</form>

<!-- type="button": 何もしない（JavaScriptでアクション） -->
<button type="button" onclick="showModal()">モーダルを開く</button>

<!-- type="reset": フォームをリセット -->
<form>
  <button type="reset">クリア</button>
</form>
```

**重要:** `<form>`内のボタンはデフォルトで`type="submit"`。意図しない送信を防ぐために、明示的に`type="button"`を指定する。

```html
<!-- 悪い例 -->
<form>
  <button onclick="addItem()">アイテムを追加</button>
  <!-- type="submit"になり、クリックするとフォームが送信される -->
</form>

<!-- 良い例 -->
<form>
  <button type="button" onclick="addItem()">アイテムを追加</button>
  <!-- type="button"で、フォーム送信を防ぐ -->
</form>
```

---

## フォーカス管理

### デフォルトでフォーカス可能な要素

以下の要素は、デフォルトでTab順序に含まれ、キーボードでフォーカス可能:

- `<a href="...">`（href属性が必須）
- `<button>`
- `<input>`
- `<select>`
- `<textarea>`
- `<details>`
- `<summary>`
- `[tabindex="0"]`を持つ任意の要素

### `tabindex`の使い方

```html
<!-- tabindex="0": Tab順序に追加 -->
<div tabindex="0" role="button" onclick="doSomething()">
  クリック可能なdiv（非推奨、ボタンを使うべき）
</div>

<!-- tabindex="-1": フォーカス可能だがTab順序から除外 -->
<div tabindex="-1" id="error-message">
  エラーメッセージ（プログラムでフォーカスを設定）
</div>

<script>
  // JavaScriptでフォーカスを設定
  document.getElementById('error-message').focus();
</script>

<!-- tabindex="1以上": 非推奨（Tab順序が壊れる） -->
<button tabindex="1">最初にフォーカス</button>
<button tabindex="2">次にフォーカス</button>
<!-- 自然な順序が壊れるため使わない -->
```

**ルール:**

- `tabindex="0"`: フォーカス可能にしたい場合（ただし、本来はボタンを使うべき）
- `tabindex="-1"`: プログラムでフォーカスを設定する場合
- `tabindex="1以上"`: **絶対に使わない**（アクセシビリティを壊す）

---

## フォームとラベル

### `<label>`の重要性

すべてのフォームコントロールには、`<label>`が必要。

```html
<!-- 良い例: forとidを対応させる -->
<label for="email">メールアドレス</label>
<input type="email" id="email" name="email">

<!-- 良い例: label内にinputを配置 -->
<label>
  メールアドレス
  <input type="email" name="email">
</label>

<!-- 悪い例: ラベルなし -->
<input type="email" placeholder="メールアドレス">
<!-- スクリーンリーダーがラベルを読み上げられない -->
```

**メリット:**

- スクリーンリーダーが「メールアドレス。入力欄」と読み上げる
- ラベルをクリックすると入力欄にフォーカス（タッチデバイスで便利）
- WCAG 2.2準拠

### プレースホルダーはラベルの代わりにならない

```html
<!-- NG: プレースホルダーだけ -->
<input type="email" placeholder="メールアドレス">
<!-- 問題:
  - 入力を始めるとプレースホルダーが消える
  - 低コントラスト（視認性が悪い）
  - スクリーンリーダーが読み上げない場合がある
-->

<!-- OK: ラベルとプレースホルダーの併用 -->
<label for="email">メールアドレス</label>
<input type="email" id="email" placeholder="example@example.com">
```

---

## アクセシビリティ考慮事項

### ボタンのアクセシブルな名前

ボタンには、明確なラベルが必要。

```html
<!-- 良い例: テキストでラベル -->
<button type="button">ログイン</button>

<!-- 良い例: aria-labelでラベル（アイコンボタン） -->
<button type="button" aria-label="メニューを開く">
  <svg>...</svg>
</button>

<!-- 悪い例: ラベルなし -->
<button type="button">
  <svg>...</svg>
</button>
<!-- スクリーンリーダーが何のボタンか分からない -->
```

### リンクのアクセシブルな名前

```html
<!-- 良い例: 明確なリンクテキスト -->
<a href="/products">商品一覧を見る</a>

<!-- 悪い例: 曖昧なリンクテキスト -->
<a href="/products">こちら</a>
<!-- 「こちら」では何へのリンクか分からない -->

<!-- 良い例: aria-labelで補足 -->
<a href="/products" aria-label="商品一覧を見る">
  こちら
</a>
```

### フォーカスの視覚的表示

キーボードユーザーのために、フォーカスを視覚的に表示する。

```css
/* デフォルトのフォーカスリングを保持 */
button:focus-visible {
  outline: 2px solid blue;
  outline-offset: 2px;
}

/* フォーカスリングを消さない */
/* NG */
button:focus {
  outline: none; /* アクセシビリティ違反 */
}
```

**`:focus-visible`を使う:**

```css
/* マウスクリックではフォーカスリングを表示しない */
/* キーボード操作では表示する */
button:focus-visible {
  outline: 2px solid blue;
}
```

---

## インタラクティブ要素のベストプラクティス

### 1. セマンティックHTMLを優先

```html
<!-- Good -->
<button type="button" onclick="doSomething()">クリック</button>

<!-- Bad -->
<div class="button" onclick="doSomething()">クリック</div>
<!-- 理由:
  - キーボード操作ができない
  - スクリーンリーダーがボタンと認識しない
  - フォーカス不可
-->
```

### 2. `href`属性のないリンクは使わない

```html
<!-- Bad -->
<a onclick="doSomething()">クリック</a>
<!-- href属性がないため、フォーカス不可 -->

<!-- Bad -->
<a href="#" onclick="doSomething(); return false;">クリック</a>
<!-- リンクをボタンとして使っている（セマンティクス違反） -->

<!-- Good -->
<button type="button" onclick="doSomething()">クリック</button>
```

### 3. `disabled`属性の使い方

```html
<!-- ボタンを無効化 -->
<button type="submit" disabled>送信</button>

<!-- リンクは無効化できない（aria-disabledを使う） -->
<a href="/next" aria-disabled="true" onclick="return false;">次へ</a>
```

**CSS:**

```css
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

a[aria-disabled="true"] {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}
```

### 4. フォームの送信ボタンは1つ

複数の送信ボタンがある場合、`formaction`を使う。

```html
<form action="/save" method="post">
  <input type="text" name="title">

  <!-- デフォルトの送信先: /save -->
  <button type="submit">保存</button>

  <!-- 別の送信先: /publish -->
  <button type="submit" formaction="/publish">公開</button>
</form>
```

---

## まとめ

**選択ガイド:**

```
操作の目的は？
  ↓
別のページ/セクションへ移動
  → <a href="...">

フォーム送信
  → <button type="submit">

その他のアクション（モーダル、状態変更）
  → <button type="button">

クリック可能なdiv/span
  → 絶対に使わない（ボタンを使う）
```

**アクセシビリティチェックリスト:**

- [ ] リンクとボタンを適切に使い分けている
- [ ] すべてのボタンにラベルがある
- [ ] すべてのフォームコントロールに`<label>`がある
- [ ] フォーカスリングを消していない
- [ ] キーボードで全ての操作ができる
- [ ] スクリーンリーダーで適切に読み上げられる

---

## ブラウザサポート

**基本的なHTML要素:**

- `<a>`, `<button>`, `<input>`: すべてのブラウザでサポート

**`:focus-visible`:**

- Chrome 86+
- Firefox 85+
- Safari 15.4+
- Edge 86+

**`aria-disabled`:**

- すべてのモダンブラウザ（IE11含む）

---

## 出典

- [Semantic HTML | web.dev](https://web.dev/learn/html/semantic-html)
- [Focus | web.dev](https://web.dev/learn/html/focus)
- [Modern Frontend Accessibility: A 2026 Developer's Guide - Medium](https://medium.com/design-bootcamp/modern-frontend-accessibility-a-2026-developers-guide-b2de10d01d22)
- [The Semantics of a Click - Simone Viani](https://medium.com/@flik185/the-semantics-of-a-click-2043c85b8195)
- [How to use buttons, anchors, and inputs semantically - Niquette.ca](https://niquette.ca/articles/button-or-anchor/)
- [A Web Developer's Guide to Buttons vs Links - The A11Y Collective](https://www.a11y-collective.com/blog/button-vs-link/)
- [Button | Semantic UI](https://semantic-ui.com/elements/button.html)
