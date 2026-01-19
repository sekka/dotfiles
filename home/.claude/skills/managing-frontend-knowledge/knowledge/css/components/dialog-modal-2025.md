---
title: JavaScriptなしモーダル実装（2025年版）
category: css/components
tags: [dialog, modal, command, commandfor, closedby, 2025]
browser_support: Chrome 134+, Edge 134+
created: 2026-01-19
updated: 2026-01-19
---

# JavaScriptなしモーダル実装（2025年版）

> 出典: https://www.tak-dcxi.com/article/modal-implementation-in-2025
> 執筆日: 2025年
> 追加日: 2026-01-19

Web標準を活用してJavaScriptを最小化したモーダル実装ガイド。2025年2月にHTML仕様にマージされた新しい属性を使用します。

## 主な技術

- **`<dialog>`要素** - HTMLネイティブのモーダルコンポーネント
- **`command`/`commandfor`属性** - 2025年2月にHTML仕様にマージされた新属性
- **`closedby`属性** - Light dismiss機能（背景クリックで閉じる）を制御
- **CSS Transitions** - `display`プロパティのアニメーション対応

## 基本実装

```html
<button commandfor="my-dialog" command="show-modal">
  モーダルを開く
</button>

<dialog id="my-dialog" closedby="any"
        aria-labelledby="my-dialog-heading">
  <h1 id="my-dialog-heading">見出し</h1>
  <p>コンテンツ</p>
  <button commandfor="my-dialog" command="close">
    閉じる
  </button>
</dialog>
```

## command/commandfor 属性

### command 属性の値

| 値 | 説明 |
|----|------|
| `show-modal` | モーダルとして開く |
| `show` | 非モーダルとして開く |
| `close` | 閉じる |

### 使用例

```html
<!-- モーダルを開く -->
<button commandfor="dialog-id" command="show-modal">
  モーダルを開く
</button>

<!-- 非モーダルダイアログを開く -->
<button commandfor="dialog-id" command="show">
  ダイアログを開く
</button>

<!-- 閉じる -->
<button commandfor="dialog-id" command="close">
  閉じる
</button>
```

## closedby 属性

Light dismiss（背景クリックで閉じる）機能を制御します。

| 値 | 説明 |
|----|------|
| `any` | ESCキーまたは背景クリックで閉じる（デフォルト） |
| `closerequest` | ESCキーのみで閉じる |
| `none` | 明示的な閉じるボタンのみ |

```html
<!-- 背景クリックで閉じる -->
<dialog closedby="any">...</dialog>

<!-- ESCキーのみで閉じる -->
<dialog closedby="closerequest">...</dialog>

<!-- 閉じるボタンのみ -->
<dialog closedby="none">...</dialog>
```

## 背景スクロール制御

モーダル表示時に背景のスクロールを抑制します。

```css
:root:has(:modal) {
  overflow: hidden;
}

:root {
  scrollbar-gutter: stable;
}
```

**ポイント**:
- `:root`に適用することで`position: sticky`の動作を保証
- `scrollbar-gutter: stable`でスクロールバーの表示/非表示によるレイアウトシフトを防止
- 非モーダルダイアログは除外される（`:modal`擬似クラスの効果）

## アニメーション

`display`プロパティのトランジションに対応します。

```css
dialog {
  opacity: 0;
  transition: opacity 0.3s, display 0.3s allow-discrete;
}

dialog[open] {
  opacity: 1;
}

@starting-style {
  dialog[open] {
    opacity: 0;
  }
}
```

**ポイント**:
- `transition-behavior: allow-discrete` で`display`のトランジションを有効化
- `@starting-style` で開始時の状態を定義
- **注意**: Firefoxは現在この機能をサポートしていません

### スライドインアニメーション

```css
dialog {
  translate: 0 100vh;
  opacity: 0;
  transition:
    translate 0.4s ease-out,
    opacity 0.4s,
    display 0.4s allow-discrete,
    overlay 0.4s allow-discrete;
}

dialog[open] {
  translate: 0 0;
  opacity: 1;
}

@starting-style {
  dialog[open] {
    translate: 0 100vh;
    opacity: 0;
  }
}
```

## フォーカス管理

`showModal()`メソッド使用時、ブラウザが自動的に処理します：

- モーダル内の最初のフォーカス可能要素にフォーカス
- モーダル外の要素を`inert`化（操作不可）
- 閉じた際に元の要素にフォーカス復帰

**カスタム実装は不要**です。

## アクセシビリティ

### aria-labelledby

モーダルの見出しをラベルとして関連付けます。

```html
<dialog aria-labelledby="dialog-heading">
  <h1 id="dialog-heading">確認</h1>
  <p>この操作を実行しますか？</p>
</dialog>
```

### aria-describedby

追加の説明テキストを関連付けます。

```html
<dialog aria-labelledby="dialog-heading"
        aria-describedby="dialog-description">
  <h1 id="dialog-heading">削除確認</h1>
  <p id="dialog-description">
    この操作は取り消せません。本当に削除しますか？
  </p>
</dialog>
```

## 実装例

### 確認ダイアログ

```html
<button commandfor="confirm-dialog" command="show-modal">
  削除
</button>

<dialog id="confirm-dialog" closedby="none"
        aria-labelledby="confirm-heading">
  <h1 id="confirm-heading">削除確認</h1>
  <p>このアイテムを削除しますか？</p>
  <div class="dialog-actions">
    <button commandfor="confirm-dialog" command="close">
      キャンセル
    </button>
    <button class="danger" commandfor="confirm-dialog" command="close">
      削除
    </button>
  </div>
</dialog>
```

### フォームダイアログ

```html
<button commandfor="form-dialog" command="show-modal">
  新規作成
</button>

<dialog id="form-dialog" closedby="any"
        aria-labelledby="form-heading">
  <form method="dialog">
    <h1 id="form-heading">新規アイテム作成</h1>
    <label>
      名前:
      <input type="text" name="name" required>
    </label>
    <div class="dialog-actions">
      <button type="submit" value="cancel"
              commandfor="form-dialog" command="close">
        キャンセル
      </button>
      <button type="submit" value="ok">
        作成
      </button>
    </div>
  </form>
</dialog>
```

## ブラウザ対応

| ブラウザ | `<dialog>` | `command` | `closedby` |
|---------|-----------|-----------|-----------|
| Chrome/Edge | 37+ | 135+ | 134+ |
| Safari | 15.4+ | ✗ | ✗ |
| Firefox | 98+ | ✗ | ✗ |

### Polyfill

Safari/Firefoxで`command`と`closedby`属性を使用するにはPolyfillが必要です。

```html
<!-- command属性のPolyfill -->
<script src="https://unpkg.com/invokers-polyfill"></script>

<!-- closedby属性のPolyfill -->
<script src="https://unpkg.com/dialog-closedby-polyfill"></script>
```

## 実装時の注意点

### 1. 背景スクロール制御は :root に適用

```css
/* ✅ 推奨 */
:root:has(:modal) {
  overflow: hidden;
}

/* ❌ 非推奨 */
body:has(:modal) {
  overflow: hidden;
}
```

**理由**: `body`に適用すると`position: sticky`が機能しなくなる

### 2. アニメーションはFirefox未対応

Firefoxでは`display`のトランジションがサポートされていません。プログレッシブエンハンスメントとして実装してください。

```css
@supports (transition-behavior: allow-discrete) {
  dialog {
    transition: opacity 0.3s, display 0.3s allow-discrete;
  }
}
```

### 3. フォーカス管理はブラウザに任せる

`showModal()`を使用する場合、カスタムのフォーカス管理は不要です。

## ユースケース

この実装方法が適している場面：

- 標準的なWebサイトやアプリケーション
- JavaScript依存を最小化したい案件
- アクセシビリティを重視する開発
- 軽量な実装が求められるシナリオ

**注意**: 複雑なWebアプリケーションでUIライブラリを使用する場合は、この手法の適用性は限定されます。

## 関連ナレッジ

- [Popover API](./popover-api.md)
- [Anchor Positioning と Popover API の統合](./anchor-positioning-popover.md)
- [@starting-style](../animation/starting-style.md)

## 参考リンク

- [MDN: <dialog>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
- [MDN: :modal](https://developer.mozilla.org/en-US/docs/Web/CSS/:modal)
- [HTML Spec: Invokers (command/commandfor)](https://html.spec.whatwg.org/multipage/interaction.html#invokers)
- [WHATWG: closedby attribute](https://github.com/whatwg/html/pull/10737)
