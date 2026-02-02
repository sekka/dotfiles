---
title: Virtual Keyboard API（仮想キーボードAPI）
category: javascript/web-apis
tags: [virtual-keyboard, mobile, viewport, keyboard-inset, css-env]
browser_support: Chrome for Android 94+
created: 2026-01-31
updated: 2026-01-31
---

# Virtual Keyboard API（仮想キーボードAPI）

> 出典: https://ishadeed.com/article/virtual-keyboard-api/
> 追加日: 2026-01-31

## 概要

**Virtual Keyboard API** は、モバイルデバイスで仮想キーボードが表示された際に、固定UIエレメント（ヘッダー、ボタン、ナビゲーション）がキーボードの下に隠れてしまう問題を解決するAPI。

## 問題の背景

### 2つのビューポート

モバイルブラウザには2種類のビューポートが存在する:

- **Visual Viewport（ビジュアルビューポート）**: 画面上で実際に表示されている領域
- **Layout Viewport（レイアウトビューポート）**: ページ全体のサイズ（隠れている部分を含む）

**問題**: 仮想キーボードが表示されると、Visual Viewportが縮小し、固定配置されたUI要素がキーボードの下に隠れてしまう。

### 典型的な事例

```html
<!-- CTAボタンが画面下部に固定 -->
<button class="cta">購入する</button>
```

```css
.cta {
  position: fixed;
  bottom: 0;
  width: 100%;
}
```

**問題**: フォーム入力時にキーボードが表示されると、CTAボタンがキーボードの下に隠れ、ユーザーがアクセスできなくなる。

## Virtual Keyboard APIの仕組み

### APIの有効化

```javascript
if ("virtualKeyboard" in navigator) {
  navigator.virtualKeyboard.overlaysContent = true;
}
```

**効果**: キーボードがコンテンツの上にオーバーレイ表示され、Layout Viewportが縮小しなくなる。

### CSS環境変数

キーボードの位置情報を6つのCSS環境変数で取得:

```css
env(keyboard-inset-top)
env(keyboard-inset-right)
env(keyboard-inset-bottom)
env(keyboard-inset-left)
env(keyboard-inset-width)
env(keyboard-inset-height)
```

## 基本的な使い方

### 固定CTA ボタンをキーボードの上に配置

```javascript
if ("virtualKeyboard" in navigator) {
  navigator.virtualKeyboard.overlaysContent = true;
}
```

```css
input {
  font-size: 16px; /* iOSでのズーム防止 */
}

.cta {
  position: fixed;
  bottom: env(keyboard-inset-height, 0);
  width: 100%;
}
```

**動作:**
- キーボード非表示時: `bottom: 0`（デフォルト値）
- キーボード表示時: `bottom: <キーボードの高さ>`（キーボードの上に配置）

### スクロール可能なコンテンツ + 固定要素

```css
body {
  --cta-height: 60px;
  padding-bottom: var(--cta-height);
}

body:has(input:focus) {
  padding-bottom: calc(
    var(--cta-height) + env(keyboard-inset-height, 0)
  );
}
```

**効果**: フォーム入力時に、ページ全体をスクロールできるようにpaddingを調整。

## 実践的なユースケース

### 1. フローティングアクションボタン（FAB）

```css
.fab {
  position: fixed;
  bottom: calc(1rem + env(keyboard-inset-height, 0rem));
  right: 1rem;
}
```

**ポイント**: `0rem` のように単位付きでフォールバック値を指定（Safari対策）。

### 2. チャットインターフェース

```css
.layout {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto env(keyboard-inset-height, 0);
  height: 100dvh;
}

.header {
  grid-row: 1;
}

.messages {
  grid-row: 2;
  overflow-y: auto;
}

.input-area {
  grid-row: 3;
}
```

**効果**: キーボードが表示されても、メッセージ履歴がスクロール可能で、入力エリアがキーボードの上に配置される。

### 3. 比較関数との組み合わせ

```css
/* デスクトップ: 2rem オフセット; モバイル（キーボード表示時）: キーボードの高さ */
.fab {
  bottom: max(2rem, 1rem + env(keyboard-inset-height, 0rem));
}

/* 右端の計算 */
.fab {
  right: min(1rem, 100vw - env(keyboard-inset-width, 0rem));
}
```

### 4. キーボード表示に応じたナビゲーション非表示

```css
.nav {
  position: fixed;
  bottom: 0;
  transition: bottom 0.3s ease;
}

/* キーボード表示時: ナビゲーションを画面外に */
.nav {
  bottom: max(0px, env(keyboard-inset-height, 0) - 100px);
}
```

**効果**: キーボードが表示されると、ナビゲーションが画面外にスライドアウト。

## ブラウザサポート

| ブラウザ | サポート |
|---------|---------|
| Chrome for Android | 94+（2021年9月） |
| Safari iOS | 未サポート |
| Firefox Android | 未サポート |

**現状**: Chrome for Androidのみ対応。

### フォールバック戦略

必ず `env()` にデフォルト値を指定:

```css
/* ✅ 正しい */
.element {
  bottom: env(keyboard-inset-height, 0);
}

/* ❌ デフォルト値なし */
.element {
  bottom: env(keyboard-inset-height);
}
```

**重要**: Safariでの崩れを防ぐため、比較関数（`min()`、`max()`）と組み合わせる場合は、単位付きの値を使用:

```css
/* ✅ Safariで動作 */
bottom: max(2rem, 1rem + env(keyboard-inset-height, 0rem));

/* ❌ Safariで崩れる可能性 */
bottom: max(2rem, 1rem + env(keyboard-inset-height, 0));
```

## ベストプラクティス

### 1. 慎重に使用する

Virtual Keyboard APIは**必要な場合にのみ使用**する。長いフォームや複数のセクションがあるページでは、オーバーレイモードがスクロールを妨げる可能性がある。

### 2. iOS ズーム防止

```css
input {
  font-size: 16px; /* 16px未満だとiOSでズームされる */
}
```

### 3. アクセシビリティの確保

- 入力フィールドが常に表示されるようにする
- スクリーン幅が狭い場合でもスクロール可能にする
- キーボード非表示時も正常に機能するようにする

### 4. 実機テストの実施

- 様々なキーボード高さでテスト
- 複数のAndroidデバイスで確認
- キーボード表示/非表示の切り替え時のアニメーションを確認

## 代替手段（標準化中）

### Viewport Meta Tag（提案中）

```html
<meta name="viewport" content="interactive-widget=resizes-content">
```

**将来的な標準**: JavaScriptなしでCSSのみで対応できる可能性がある（現時点では未実装）。

## 使用を避けるべきケース

以下のようなページでは、Virtual Keyboard APIを使用しない:

- 長いフォーム（複数のステップがある場合）
- 縦スクロールが多いページ
- 入力完了時に全体を確認する必要があるコンテンツ

**理由**: オーバーレイモードがスクロールを阻害し、ユーザーが全体を確認できなくなる。

## 実装例

### 完全な実装（EC決済ページ）

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>決済フォーム</title>
  <style>
    body {
      margin: 0;
      padding: 0 1rem 80px;
      font-family: system-ui, sans-serif;
    }

    .form-field {
      margin-bottom: 1rem;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      font-size: 16px; /* iOS ズーム防止 */
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .cta {
      position: fixed;
      bottom: env(keyboard-inset-height, 0);
      left: 0;
      right: 0;
      padding: 1rem;
      background: #007bff;
      color: white;
      border: none;
      font-size: 1rem;
      transition: bottom 0.3s ease;
    }

    /* キーボード表示時のbodyパディング調整 */
    body:has(input:focus) {
      padding-bottom: calc(80px + env(keyboard-inset-height, 0));
    }
  </style>
</head>
<body>
  <h1>お支払い情報</h1>

  <div class="form-field">
    <label for="card-number">カード番号</label>
    <input type="text" id="card-number" inputmode="numeric">
  </div>

  <div class="form-field">
    <label for="expiry">有効期限</label>
    <input type="text" id="expiry" placeholder="MM/YY">
  </div>

  <div class="form-field">
    <label for="cvv">セキュリティコード</label>
    <input type="text" id="cvv" inputmode="numeric" maxlength="3">
  </div>

  <button class="cta">支払いを確定</button>

  <script>
    if ("virtualKeyboard" in navigator) {
      navigator.virtualKeyboard.overlaysContent = true;
    }
  </script>
</body>
</html>
```

## 参考リソース

- [MDN: VirtualKeyboard API](https://developer.mozilla.org/en-US/docs/Web/API/VirtualKeyboard_API)
- [WICG: Virtual Keyboard Specification](https://wicg.github.io/virtual-keyboard/)
- [Can I use: Virtual Keyboard API](https://caniuse.com/mdn-api_virtualkeyboard)

## 関連ナレッジ

- [Viewport Units](../../css/values/viewport-units-scrollbar-aware.md) - ビューポート単位（dvh、svh）
- [CSS Environment Variables](../../css/values/env-variables.md) - CSS env() 関数

---
