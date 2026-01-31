---
title: Popover API
category: css/components
tags: [popover, dialog, modal, javascript-free, 2024]
browser_support: Chrome 114+, Firefox 125+, Safari 17+
created: 2025-01-16
updated: 2025-01-16
---

# Popover API

> 出典: https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> 執筆日: 2024年
> 追加日: 2025-12-17

JavaScript 不要でポップオーバーを実装。

## 基本的な使い方

```html
<button popovertarget="menu">メニューを開く</button>
<div id="menu" popover>
  <p>ポップオーバーの内容</p>
</div>
```

## popover 属性

| 値 | 説明 |
|----|------|
| `popover` または `popover="auto"` | 他のポップオーバーを自動で閉じる |
| `popover="manual"` | 手動で閉じるまで開いたまま |

## スタイリング

```css
/* ポップオーバーのスタイル */
[popover] {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 開閉アニメーション */
[popover] {
  opacity: 0;
  transition: opacity 0.3s, display 0.3s allow-discrete;
}

[popover]:popover-open {
  opacity: 1;
}

/* 開始時スタイル */
@starting-style {
  [popover]:popover-open {
    opacity: 0;
  }
}
```

## ユースケース

### ドロップダウンメニュー

```html
<button popovertarget="nav-menu">メニュー</button>
<nav id="nav-menu" popover>
  <ul>
    <li><a href="/home">ホーム</a></li>
    <li><a href="/about">概要</a></li>
    <li><a href="/contact">お問い合わせ</a></li>
  </ul>
</nav>
```

```css
#nav-menu {
  padding: 0.5rem;
  min-width: 200px;
}

#nav-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

#nav-menu a {
  display: block;
  padding: 0.5rem 1rem;
  text-decoration: none;
}
```

### ツールチップ

```html
<button popovertarget="tooltip">
  ℹ️
</button>
<div id="tooltip" popover role="tooltip">
  これはツールチップです
</div>
```

```css
#tooltip {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  max-width: 200px;
}
```

### モーダル風ダイアログ

```html
<button popovertarget="dialog" popovertargetaction="show">
  ダイアログを開く
</button>
<div id="dialog" popover="manual">
  <h2>確認</h2>
  <p>この操作を実行しますか？</p>
  <button popovertarget="dialog" popovertargetaction="hide">
    キャンセル
  </button>
  <button>OK</button>
</div>
```

## popovertargetaction

| 値 | 説明 |
|----|------|
| `toggle` | 開閉を切り替え（デフォルト） |
| `show` | 開く |
| `hide` | 閉じる |

## JavaScript での制御

```javascript
const popover = document.getElementById('menu');

// 開く
popover.showPopover();

// 閉じる
popover.hidePopover();

// トグル
popover.togglePopover();

// イベント
popover.addEventListener('toggle', (e) => {
  console.log(e.newState); // "open" または "closed"
});
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 114+ |
| Firefox | 125+ |
| Safari | 17+ |

## 関連ナレッジ

- [CSS 2025 コンポーネント](./css-2025-components.md) - popover=hint、interestfor 属性
- [Anchor Positioning と Popover API の統合](./anchor-positioning-popover.md) - 実践的な組み合わせパターン
- [dialog 要素](./dialog-element.md)
- [Anchor Positioning](./anchor-positioning.md)
- [@starting-style](../animation/starting-style.md)
