---
title: dialog要素のcommand/commandfor属性
category: html/modern
tags: [dialog, command, commandfor, modal, popover, closedby, autofocus, 2025]
browser_support: Chrome 132+, Safari 18.2+, Firefox 135+
created: 2026-01-31
updated: 2026-02-01
---

# dialog要素のcommand/commandfor属性

> 出典: https://shimotsuki.wwwxyz.jp/20251227-2003, https://ics.media/entry/250904/
> 執筆日: 2025年12月27日, 2025年9月4日
> 追加日: 2026-01-31
> 更新日: 2026-02-01

JavaScript不要でdialog要素を制御できる新機能。2025年に全モダンブラウザで対応。モーダルUIをシンプルに実装できる進化を続けるHTML要素。

## 概要

`command` および `commandfor` 属性を使用することで、JavaScriptを書かずにbutton要素からdialog要素を制御できます。

**基本構文**:
```html
<button commandfor="modal-dialog" command="show-modal">ダイアログを開く</button>
<dialog id="modal-dialog">
  <p>モーダルダイアログの内容</p>
  <button commandfor="modal-dialog" command="close">閉じる</button>
</dialog>
```

## command属性の値

| 値 | 動作 | 説明 |
|----|------|------|
| `show-modal` | モーダル表示 | `showModal()` と同等 |
| `show-popover` | ポップオーバー表示 | Popover API経由で表示 |
| `hide-popover` | ポップオーバー非表示 | Popover API経由で非表示 |
| `close` | ダイアログを閉じる | `close()` と同等 |

## 表示形式の比較

### ポップオーバー vs モーダル vs 非モーダル

| 特性 | ポップオーバー | モーダル | 非モーダル |
|------|-------------|--------|---------|
| **ダイアログ外の操作** | 可能 | 不可能 | 可能 |
| **フォーカス制御** | ダイアログ内外 | ダイアログ内のみ | ダイアログ内外 |
| **閉じ方** | 外クリック/Esc | 閉じるボタン/Esc | 閉じるボタン等 |
| **背景スクロール** | 可能 | 不可能 | 可能 |
| **用途** | ツールチップ、メニュー | ログイン、確認画面 | お知らせ、チャット |

## 実装例

### ポップオーバーダイアログ

```html
<button commandfor="popover-dialog" command="show-popover">
  ポップオーバーを開く
</button>

<dialog id="popover-dialog" popover="auto">
  <p>ポップオーバーダイアログの内容</p>
  <button commandfor="popover-dialog" command="hide-popover">
    閉じる
  </button>
</dialog>
```

**特徴**:
- ダイアログ外をクリックすると自動的に閉じる
- ページ上の他の要素を操作可能
- Escキーで閉じる

**CSS擬似クラス**:
```css
dialog:popover-open {
  /* ポップオーバーで表示されている状態 */
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
```

### モーダルダイアログ

```html
<button commandfor="modal-dialog" command="show-modal">
  モーダルを開く
</button>

<dialog id="modal-dialog">
  <h2>確認</h2>
  <p>この操作を実行しますか?</p>
  <div class="dialog-actions">
    <button commandfor="modal-dialog" command="close">
      キャンセル
    </button>
    <button type="submit" form="my-form">
      実行
    </button>
  </div>
</dialog>
```

**特徴**:
- ダイアログ外の操作を完全にブロック
- フォーカスがダイアログ内に閉じ込められる
- 背景がオーバーレイで暗くなる（`::backdrop`）

**CSS擬似クラス**:
```css
dialog[open]:modal {
  /* showModal() で表示されている状態 */
  padding: 2rem;
  border-radius: 8px;
  border: none;
}

dialog::backdrop {
  /* モーダル時の背景オーバーレイ */
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
```

### 非モーダルダイアログ

```html
<button commandfor="nonmodal-dialog" command="show">
  非モーダルを開く
</button>

<dialog id="nonmodal-dialog">
  <h2>通知</h2>
  <p>新しいメッセージがあります</p>
  <button commandfor="nonmodal-dialog" command="close">
    閉じる
  </button>
</dialog>
```

**注意**: `command="show"` は現在の仕様では存在しません。非モーダル表示はJavaScript経由で `show()` を呼び出す必要があります。

**CSS擬似クラス**:
```css
dialog[open]:not(:modal) {
  /* show() で表示されている状態（非モーダル） */
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  max-width: 320px;
}
```

## CSS擬似クラスの使い分け

### `:popover-open`

Popover APIで表示されたdialog要素にマッチ。

```css
dialog:popover-open {
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
```

### `:modal`

`showModal()` で表示されたdialog要素にマッチ。

```css
dialog:modal {
  max-width: 600px;
  margin: auto;
}

dialog:modal::backdrop {
  background: rgba(0, 0, 0, 0.6);
}
```

### `[open]:not(:modal)`

`show()` で表示された非モーダルdialog要素にマッチ。

```css
dialog[open]:not(:modal) {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
```

## 従来の方法との比較

### 従来（JavaScript必須）

```html
<button id="open-btn">ダイアログを開く</button>
<dialog id="my-dialog">
  <p>内容</p>
  <button id="close-btn">閉じる</button>
</dialog>

<script>
const dialog = document.getElementById('my-dialog');
document.getElementById('open-btn').addEventListener('click', () => {
  dialog.showModal();
});
document.getElementById('close-btn').addEventListener('click', () => {
  dialog.close();
});
</script>
```

### 新しい方法（JavaScript不要）

```html
<button commandfor="my-dialog" command="show-modal">
  ダイアログを開く
</button>
<dialog id="my-dialog">
  <p>内容</p>
  <button commandfor="my-dialog" command="close">
    閉じる
  </button>
</dialog>
```

**メリット**:
- JavaScriptコードが不要
- 宣言的でHTMLのみで完結
- パフォーマンスの向上（イベントリスナー不要）
- 保守性の向上

## 実用的なパターン

### 確認ダイアログ

```html
<form id="delete-form" action="/delete" method="post">
  <button type="button" commandfor="confirm-dialog" command="show-modal">
    削除
  </button>
</form>

<dialog id="confirm-dialog">
  <h2>削除の確認</h2>
  <p>本当にこのアイテムを削除しますか？</p>
  <div class="dialog-actions">
    <button commandfor="confirm-dialog" command="close">
      キャンセル
    </button>
    <button type="submit" form="delete-form" commandfor="confirm-dialog" command="close">
      削除する
    </button>
  </div>
</dialog>
```

### ツールチップ風ポップオーバー

```html
<button commandfor="help-tip" command="show-popover">
  <span aria-hidden="true">?</span>
  <span class="sr-only">ヘルプを表示</span>
</button>

<dialog id="help-tip" popover="auto">
  <p>このフィールドには有効なメールアドレスを入力してください。</p>
</dialog>

<style>
dialog#help-tip:popover-open {
  position: absolute;
  max-width: 250px;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
```

## アクセシビリティ

### ARIA属性の補完

command/commandfor属性を使用する場合でも、適切なARIA属性を追加することを推奨します。

```html
<button
  commandfor="my-dialog"
  command="show-modal"
  aria-haspopup="dialog"
  aria-controls="my-dialog"
>
  開く
</button>

<dialog
  id="my-dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">タイトル</h2>
  <p id="dialog-description">説明文</p>
  <button commandfor="my-dialog" command="close">
    閉じる
  </button>
</dialog>
```

### スクリーンリーダー対応

- モーダル表示時、フォーカスは自動的にダイアログ内に移動
- Escキーで閉じる動作は標準で提供される
- `aria-modal="true"` は自動的に適用される（モーダルの場合）

## ブラウザ対応

| 機能 | Chrome/Edge | Firefox | Safari | 備考 |
|------|------------|---------|--------|------|
| **command/commandfor属性** | 132+ | 135+ | 18.2+ | 2025年12月に全対応 |
| **closedby属性** | 134+ | 141+ | 未対応 | light dismiss制御 |
| **autofocus属性** | 79+ | 110+ | 15.4+ | 自動フォーカス |
| **dialog要素自体** | 37+ | 98+ | 15.4+ | 2022年頃から全対応 |

### 詳細なブラウザサポート

**command属性**:
- Chrome 135+
- Safari 26.2+
- Firefox 144+

**closedby属性**:
- Chrome 134+
- Edge 134+
- Firefox 141+
- Safari: 未対応（2026年2月時点）

**autofocus属性**:
- Chrome 79+
- Firefox 110+
- Safari 15.4+

**互換性の確保**:

```javascript
// フォールバック（古いブラウザ対応）
if (!('commandfor' in HTMLButtonElement.prototype)) {
  document.querySelectorAll('button[commandfor]').forEach(btn => {
    const targetId = btn.getAttribute('commandfor');
    const command = btn.getAttribute('command');
    const target = document.getElementById(targetId);

    btn.addEventListener('click', () => {
      if (command === 'show-modal') {
        target.showModal();
      } else if (command === 'close') {
        target.close();
      } else if (command === 'show-popover') {
        target.showPopover();
      } else if (command === 'hide-popover') {
        target.hidePopover();
      }
    });
  });
}
```

## 制限事項

### command属性でサポートされていない操作

以下の操作は引き続きJavaScriptが必要です：

- 非モーダル表示（`show()`）
- 戻り値付きで閉じる（`close(returnValue)`）
- カスタムアニメーション
- 条件付き表示制御

### 複雑なバリデーション

フォーム送信前のバリデーションなど、複雑なロジックが必要な場合はJavaScriptと併用します。

```html
<dialog id="form-dialog">
  <form id="my-form">
    <input type="email" required>
    <button type="submit">送信</button>
  </form>
</dialog>

<script>
document.getElementById('my-form').addEventListener('submit', (e) => {
  e.preventDefault();
  // バリデーション
  if (isValid()) {
    document.getElementById('form-dialog').close('submitted');
  }
});
</script>
```

## closedby属性による背景クリック対応

> 出典: https://techracho.bpsinc.jp/hachi8833/2026_01_30/156001
> 執筆日: 2026-01-30
> 追加日: 2026-02-01

`closedby` 属性でダイアログを背景クリックで閉じる動作を制御できます。

```html
<dialog id="confirmDialog" closedby="any">
  <form method="dialog">
    <h2>確認</h2>
    <p>この操作を実行しますか?</p>
    <button formmethod="dialog">キャンセル</button>
    <button type="submit" autofocus>確認</button>
  </form>
</dialog>
```

**closedbyの値**:
- `none`: 背景クリックで閉じない（デフォルト）
- `any`: 背景クリックで閉じる（light dismiss）
- `closerequest`: Escキーと明示的なclose要求のみ

**ブラウザサポート**:
- Chrome/Edge: 134+
- Safari: 未サポート（2026年1月時点）
- Firefox: 141+

## アニメーション対応

### @starting-styleによるエントリーアニメーション

`@starting-style` ルールで、ダイアログ表示時のアニメーションを実装できます。

```css
dialog {
  transition: opacity 0.3s, scale 0.3s;
  opacity: 1;
  scale: 1;
}

@starting-style {
  dialog[open] {
    opacity: 0;
    scale: 0.9;
  }
}

dialog:not([open]) {
  opacity: 0;
  scale: 0.9;
}
```

**ブラウザサポート**:
- Chrome/Edge: 117+
- Safari: 17.5+
- Firefox: 129+

### allow-discreteキーワード

`display` や `overlay` などの離散プロパティをアニメーションするには `allow-discrete` キーワードが必要です。

```css
dialog {
  transition:
    opacity 0.3s,
    display 0.3s allow-discrete,
    overlay 0.3s allow-discrete;
}
```

**ブラウザサポート**:
- Chrome/Edge: 117+
- Safari: 17.4+
- Firefox: 129+

### 非対称なエントリー/イグジットアニメーション

エントリーとイグジットで異なるアニメーション時間を設定できます。

```css
/* エントリー: 速い */
@starting-style {
  dialog[open] {
    opacity: 0;
    transition: opacity 0.15s;
  }
}

/* イグジット: ゆっくり */
dialog:not([open]) {
  opacity: 0;
  transition: opacity 0.5s;
}
```

### isolateプロパティでz-index競合を防止

`isolate` プロパティで新しいスタッキングコンテキストを作成し、z-index競合を回避します。

```css
dialog {
  isolate: isolate;
}
```

## Tailwind CSS v4との統合

Tailwind CSS v4の `@utility` ディレクティブでカスタムユーティリティを定義できます。

```css
@utility dialog-starting {
  @starting-style {
    &[open] {
      opacity: 0;
      scale: 0.9;
    }
  }
}

@utility dialog-animated {
  transition: opacity 0.3s, scale 0.3s allow-discrete;

  &:not([open]) {
    opacity: 0;
    scale: 0.9;
  }
}
```

使用例:
```html
<dialog class="dialog-starting dialog-animated" closedby="any">
  <!-- 内容 -->
</dialog>
```

## 関連ナレッジ

- [dialog要素の基本](./dialog.md)
- [Popover API](../css/components/popover-api.md)
- [モーダルダイアログのアクセシビリティ](../cross-cutting/accessibility/modal-dialog.md)
- [フォーカストラップ](../cross-cutting/accessibility/focus-trap.md)
- [CSSアニメーション](../css/animation/)
- [@starting-style](../css/animation/starting-style.md)
