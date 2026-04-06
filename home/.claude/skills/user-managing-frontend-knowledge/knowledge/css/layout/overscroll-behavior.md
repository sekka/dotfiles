---
title: overscroll-behavior - スクロール連鎖の防止
category: css/layout
tags: [overscroll-behavior, scroll, modal, scroll-chaining, pull-to-refresh, overscroll]
browser_support: Chrome 65+, Firefox 59+, Edge 79+, Safari 16.0+
created: 2026-01-19
updated: 2026-01-19
---

# overscroll-behavior - スクロール連鎖の防止

> 出典: https://ics.media/entry/221024/
> 執筆日: 2022年10月27日
> 追加日: 2026-01-19

## 概要

`overscroll-behavior`は、スクロール可能な要素がコンテンツの端に達したときの動作を制御するCSSプロパティです。Safari 16（2022年9月リリース）で対応したことにより、全主要ブラウザで利用可能になりました。

モーダルダイアログやハンバーガーメニューなどで、内部コンテンツのスクロール時に背景までスクロールしてしまう「スクロール連鎖（scroll chaining）」を防ぐことができます。

## ブラウザサポート

- Chrome 65+ (2018年3月)
- Firefox 59+ (2018年3月)
- Edge 79+ (2020年1月)
- Safari 16.0+ (2022年9月)

## 構文

```css
.element {
  overscroll-behavior: auto; /* デフォルト */
  overscroll-behavior: contain; /* スクロール連鎖を防止 */
  overscroll-behavior: none; /* 連鎖とオーバースクロール効果の両方を無効化 */
}
```

### 個別軸の指定

```css
.element {
  overscroll-behavior-x: contain; /* 横スクロールのみ制御 */
  overscroll-behavior-y: contain; /* 縦スクロールのみ制御 */
}
```

## プロパティ値

### auto（デフォルト）

通常のスクロール動作です。スクロールが端に達すると、親要素にスクロールが伝播します。

```css
.modal {
  overscroll-behavior: auto; /* デフォルト値 */
}
```

### contain

スクロール連鎖を防止しますが、オーバースクロール効果（バウンス効果など）は維持します。

```css
.modal {
  overscroll-behavior: contain;
}
```

### none

スクロール連鎖とオーバースクロール効果の両方を無効化します。

```css
.modal {
  overscroll-behavior: none;
}
```

## 実装例

### 1. モーダルダイアログのスクロール連鎖防止

モーダル内のスクロールが背景に伝播しないようにします。

```html
<dialog class="modal" open>
  <div class="modal-content">
    <h2>モーダルタイトル</h2>
    <p>長いコンテンツ...</p>
    <p>長いコンテンツ...</p>
    <!-- 繰り返し -->
  </div>
</dialog>

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;

    /* スクロール連鎖を防止 */
    overscroll-behavior: contain;

    /* わずかにスクロール可能にする（Safariの挙動対策） */
    height: calc(100% + 1px);
  }
</style>
```

**重要:** Safari等では`height: calc(100% + 1px)`により、要素を1px分スクロール可能にすることで`overscroll-behavior`が正しく動作します。

### 2. ハンバーガーメニュー

サイドメニューのスクロールが背景に影響しないようにします。

```html
<nav class="sidebar">
  <ul>
    <li><a href="#">メニュー1</a></li>
    <li><a href="#">メニュー2</a></li>
    <!-- 多数のメニュー項目 -->
  </ul>
</nav>

<style>
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 300px;
    height: 100%;
    background: #333;
    overflow-y: auto;

    /* スクロール連鎖を防止 */
    overscroll-behavior: contain;
  }
</style>
```

### 3. Pull-to-Refresh の無効化

モバイルブラウザで、画面トップでのスクロールによるリフレッシュ動作を防ぎます。

```css
body {
  /* ページ全体のPull-to-Refreshを無効化 */
  overscroll-behavior-y: none;
}
```

### 4. 横スクロールカルーセル

横スクロール要素で、縦スクロールへの伝播を防ぎます。

```html
<div class="carousel">
  <div class="carousel-item">Item 1</div>
  <div class="carousel-item">Item 2</div>
  <div class="carousel-item">Item 3</div>
  <!-- 繰り返し -->
</div>

<style>
  .carousel {
    display: flex;
    overflow-x: auto;
    gap: 16px;

    /* 横スクロール端での縦スクロール連鎖を防止 */
    overscroll-behavior-x: contain;
  }

  .carousel-item {
    min-width: 300px;
    height: 200px;
    background: #3498db;
    border-radius: 8px;
  }
</style>
```

### 5. ネストされたスクロール領域

複数のスクロール領域が入れ子になっている場合の制御です。

```html
<div class="outer-scroll">
  <div class="inner-scroll">
    <p>内部のスクロールコンテンツ...</p>
  </div>
</div>

<style>
  .outer-scroll {
    height: 400px;
    overflow-y: auto;
    background: #ecf0f1;
    padding: 20px;
  }

  .inner-scroll {
    height: 200px;
    overflow-y: auto;
    background: white;
    padding: 10px;

    /* 内部スクロールが外部に伝播しないようにする */
    overscroll-behavior: contain;
  }
</style>
```

## ブラウザ間の挙動差異

### html/body要素への適用

ブラウザファミリーにより、`html`と`body`要素への適用で挙動が異なります。

```css
/* Chrome/Edge/Firefox */
html {
  overscroll-behavior: none; /* 効果あり */
}

/* Safari */
body {
  overscroll-behavior: none; /* 効果あり */
}

/* 両方に適用する安全な方法 */
html, body {
  overscroll-behavior: none;
}
```

### Safariでの最小スクロール量の必要性

Safariでは、要素が実際にスクロール可能でないと`overscroll-behavior`が動作しない場合があります。

```css
.modal-content {
  overscroll-behavior: contain;

  /* 1px分スクロール可能にする */
  height: calc(100% + 1px);
  /* または */
  padding-bottom: 1px;
}
```

## ユースケース

1. **モーダルダイアログ** - 背景のスクロール防止
2. **ハンバーガーメニュー** - サイドメニューのスクロール独立化
3. **Pull-to-Refresh無効化** - カスタムリフレッシュUIの実装
4. **カルーセル** - 横スクロール時の縦スクロール連鎖防止
5. **チャットUI** - メッセージ履歴のスクロール独立化
6. **画像ギャラリー** - ズーム時のスクロール制御

## 従来の対策との比較

### JavaScript による body 固定（従来）

```javascript
// モーダル表示時
document.body.style.overflow = 'hidden';

// モーダル非表示時
document.body.style.overflow = '';
```

**問題点:**
- スクロール位置が失われる
- ページ全体のレイアウトシフトが発生
- JavaScriptが必須

### overscroll-behavior（現代）

```css
.modal {
  overscroll-behavior: contain;
}
```

**利点:**
- スクロール位置が保持される
- レイアウトシフトなし
- CSSのみで完結
- パフォーマンスが良い

## 注意事項

- Safari 16未満では使用できません（iOS 16未満のデバイスに注意）
- `overflow: hidden`とは異なり、要素自体のスクロールは可能です
- スクロールイベントのバブリングには影響しません
- Safariでは要素が実際にスクロール可能である必要があります

## containとnoneの使い分け

- **contain:** オーバースクロール効果（バウンス）を残したい場合
- **none:** Pull-to-Refreshなど、すべてのオーバースクロール動作を無効化したい場合

```css
/* モーダル: バウンス効果は残す */
.modal {
  overscroll-behavior: contain;
}

/* ゲームUI: すべて無効化 */
.game-canvas {
  overscroll-behavior: none;
}
```

## 参考リンク

- [overscroll-behavior - MDN](https://developer.mozilla.org/ja/docs/Web/CSS/overscroll-behavior)
- [CSS Overscroll Behavior Module Level 1](https://www.w3.org/TR/css-overscroll-1/)
- [Can I use: overscroll-behavior](https://caniuse.com/css-overscroll-behavior)
