---
title: :has() セレクタ（親セレクタ）
category: css/selectors
tags: [has, selector, parent-selector, 2023, user-invalid, hover, anchor-positioning]
browser_support: Chrome 105+, Firefox 121+, Safari 15.4+
created: 2025-01-16
updated: 2026-02-01
---

# :has() セレクタ

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5, https://ics.media/entry/240808/
> 執筆日: 2024年, 2024-08-08
> 追加日: 2025-12-17 / 統合日: 2026-02-01

親要素を子要素の状態で選択（親セレクタ）。`:has()` により、HTML の親子関係を超えたスタイリングが可能になり、従来 JavaScript が必要だった表現が CSS のみで実現可能。

## 基本的な使い方

```css
/* リンクを含むカードにスタイル */
.card:has(a) {
  cursor: pointer;
}

/* チェックされたラベル */
label:has(input:checked) {
  background-color: #e0f0ff;
}

/* 空でないフォーム */
form:has(input:not(:placeholder-shown)) {
  border-color: green;
}

/* 画像を含む記事 */
article:has(img) {
  display: grid;
  grid-template-columns: 200px 1fr;
}
```

## ユースケース

### カードのクリッカブル領域拡張

```css
.card:has(a) {
  cursor: pointer;
  transition: transform 0.2s;
}

.card:has(a):hover {
  transform: translateY(-4px);
}
```

### フォーム状態の可視化

```css
/* 入力済みフィールドを含むフォーム */
form:has(input:not(:placeholder-shown)) {
  border-left: 4px solid green;
}

/* エラーを含むフォーム */
form:has(.error) {
  border-left: 4px solid red;
}
```

### レイアウトの動的変更

```css
/* 画像がある記事は2カラム */
article:has(img) {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1rem;
}

/* 画像がない記事は1カラム */
article:not(:has(img)) {
  max-width: 600px;
}
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome | 105+ |
| Firefox | 121+ |
| Safari | 15.4+ |

## 実用例（ICS MEDIA より）

### 1. フォームバリデーションのスタイリング

`:user-invalid` と組み合わせてエラーメッセージとラベルをスタイリング。

```html
<div class="formItem">
  <label class="formItem_label">メールアドレス</label>
  <input class="formItem_textForm" type="email" required>
  <p class="formItem_errorMessage">正しいメールアドレスを入力してください</p>
</div>
```

```css
/* エラーがあるフォームアイテムのラベルを赤に */
.formItem:has(.formItem_textForm:user-invalid) .formItem_label {
  color: red;
}

/* エラーメッセージは通常非表示 */
.formItem_errorMessage {
  display: none;
}

/* エラーがある場合のみ表示 */
.formItem:has(.formItem_textForm:user-invalid) .formItem_errorMessage {
  display: block;
  color: red;
  font-size: 0.875rem;
}
```

**メリット:** HTML 構造を変更せずに、入力状態に応じたスタイリングが可能。

### 2. ハンバーガーメニューの制御

JavaScript でクラスを切り替えるだけで、複数の要素を制御。

```html
<body>
  <button class="hamburgerButton"></button>
  <aside class="sidePanel"></aside>
  <main class="mainContents"></main>
</body>
```

```css
/* ハンバーガーボタンが開いている時、サイドパネルを表示 */
body:has(.hamburgerButton.isOpen) .sidePanel {
  transform: translateX(0);
}

/* メインコンテンツをずらす */
body:has(.hamburgerButton.isOpen) .mainContents {
  margin-left: 250px;
}
```

```javascript
const button = document.querySelector('.hamburgerButton');
button.addEventListener('click', () => {
  button.classList.toggle('isOpen');
});
```

**メリット:** 1つのクラス切り替えで複数要素のスタイルを変更可能。

### 3. モーダルのスクロール制御

`<dialog>` が開いている時、背景のスクロールを防止しつつ、スクロールバーのガタつきを防ぐ。

```css
/* ダイアログが開いている時、bodyのスクロールを無効化 */
body:has(dialog[open]) {
  overflow: hidden;
  /* スクロールバーの幅を確保してガタつき防止 */
  scrollbar-gutter: stable;
}
```

**`scrollbar-gutter: stable` の効果:**
- スクロールバーが消えても幅を確保
- コンテンツが横にズレない

### 4. マウスストーカー（カーソル追従）

リンクにホバーした時、カスタムカーソルを拡大。

```html
<div class="stalker"></div>
<a href="#">リンク</a>
```

```css
.stalker {
  position: fixed;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 255, 0.5);
  pointer-events: none;
  transition: transform 0.2s;
}

/* リンクにホバー時、ストーカーを拡大 */
body:has(a:hover) .stalker {
  transform: scale(2);
}
```

```javascript
document.addEventListener('mousemove', (e) => {
  const stalker = document.querySelector('.stalker');
  stalker.style.left = e.clientX + 'px';
  stalker.style.top = e.clientY + 'px';
});
```

**メリット:** 個別の要素にイベントハンドラを追加する必要がない。

### 5. Anchor Positioning との連携

`:has()` と CSS Anchor Positioning API を組み合わせて、ホバー時のアニメーションを実装。

```html
<button class="anchor" popovertarget="tooltip">ホバーしてね</button>
<div id="tooltip" popover anchor="anchor" class="tooltip">ツールチップ</div>
```

```css
.tooltip {
  position: absolute;
  position-anchor: --anchor;
  bottom: anchor(top);
  left: anchor(center);
  transform: translateX(-50%) translateY(-8px);
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
}

/* アンカー要素にホバー時、ツールチップを表示 */
body:has(.anchor:hover) .tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
```

**メリット:** ツールチップの位置をアンカーに自動的に追従させつつ、ホバー検出は `:has()` で実現。

## パフォーマンスに関する注意

標準的なページ量では、`:has()` によるパフォーマンス劣化は測定可能な範囲では発生しない（記事での検証結果）。

**注意が必要な場合:**
- 極端に複雑なセレクタ（`:has(:has(:has(...)))`）
- 大量の要素に対する頻繁な DOM 変更

## 注意点

- パフォーマンス: 複雑なセレクタは避ける
- 従来のJavaScript実装より高速
- JavaScript との組み合わせで、より柔軟な制御が可能
- `scrollbar-gutter: stable` で、スクロールバーのガタつきを防ぐ

## ブラウザサポート（更新）

| ブラウザ | バージョン | リリース日 |
|----------|-----------|-----------|
| Chrome/Edge | 105+ | 2022年9月 |
| Safari | 15.4+ | 2022年3月 |
| Firefox | 121+ | 2023年12月 |

**2025年9月時点:** 全モダンブラウザで安定動作。

## 関連ナレッジ

- [:is() / :where()](./is-where-selectors.md)
- [:user-invalid 擬似クラス](./user-validation-pseudo-classes.md)
- [CSS Anchor Positioning](../components/anchor-positioning.md)
- [CSS Nesting](../modern/css-nesting.md)
- [Popover API](../components/popover.md)

## 参考リンク

- [:has() - CSS - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)
- [scrollbar-gutter - CSS - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-gutter)
- [CSS Anchor Positioning - Chrome Developers](https://developer.chrome.com/blog/anchor-positioning-api/)
