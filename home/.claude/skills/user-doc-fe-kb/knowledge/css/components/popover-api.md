---
title: Popover API
category: css/components
tags: [popover, dialog, modal, javascript-free, toast, tooltip, 2024]
browser_support: Chrome 114+, Firefox 125+, Safari 17+
created: 2025-01-16
updated: 2026-02-01
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

## 4つの実用ユースケース

> 出典: https://ics.media/entry/230530/
> 執筆日: 2023-05-30
> 追加日: 2026-02-01

### 1. シンプルなポップオーバー（HTML属性のみ）

**最小限の実装**:

```html
<button popovertarget="simple-popover">開く</button>
<div id="simple-popover" popover>
  ポップオーバーの内容
</div>
```

**特徴**:
- JavaScriptなし
- 自動的にトップレイヤーに配置
- Escキーで閉じる
- 背景クリックで閉じる（light dismiss）

### 2. トースト通知（popover="manual"）

**実装**:

```html
<button id="show-toast">通知を表示</button>
<div id="toast" popover="manual">
  通知メッセージ
</div>
```

```javascript
const showToastButton = document.getElementById('show-toast');
const toast = document.getElementById('toast');

showToastButton.addEventListener('click', () => {
  toast.showPopover();

  // 3秒後に自動で閉じる
  setTimeout(() => {
    toast.hidePopover();
  }, 3000);
});
```

**popover="manual" の特徴**:
- 背景クリックで閉じない
- Escキーで閉じない
- 明示的に `hidePopover()` を呼ぶまで開いたまま
- 複数のmanualポップオーバーを同時表示可能

**スタイル例**:

```css
#toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  background: #333;
  color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
```

### 3. 階層メニュー（ネストされたポップオーバー）

**実装**:

```html
<button popovertarget="menu1">メニュー</button>

<div id="menu1" popover>
  <ul>
    <li><a href="#">項目1</a></li>
    <li>
      <button popovertarget="submenu">サブメニュー ▶</button>
    </li>
  </ul>
</div>

<div id="submenu" popover>
  <ul>
    <li><a href="#">サブ項目1</a></li>
    <li><a href="#">サブ項目2</a></li>
  </ul>
</div>
```

**動作**:
- 親ポップオーバーを閉じると子も自動で閉じる
- 子ポップオーバーを開いても親は閉じない
- 自然な階層構造

### 4. ツールチップ（CSS Anchor Positioning連携）

**実装**:

```html
<button id="help-button" popovertarget="tooltip">
  ヘルプ
</button>

<div id="tooltip" popover anchor="help-button">
  このボタンはヘルプを表示します
</div>
```

```css
#tooltip {
  position: absolute;
  position-anchor: --help-button;
  bottom: anchor(top);
  left: anchor(center);
  translate: -50% -8px;

  padding: 0.5rem 1rem;
  background: #333;
  color: #fff;
  border-radius: 4px;
  font-size: 0.875rem;
}

/* 吹き出しの三角形 */
#tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  translate: -50% 0;
  border: 6px solid transparent;
  border-top-color: #333;
}
```

**注意**: CSS Anchor Positioningは Chrome 125+, Safari未対応（2023年5月時点）。フォールバックが必要。

## toggleイベント

**ポップオーバーの開閉状態を監視**:

```javascript
const popover = document.getElementById('my-popover');

popover.addEventListener('toggle', (event) => {
  console.log('新しい状態:', event.newState); // "open" または "closed"
  console.log('古い状態:', event.oldState);

  if (event.newState === 'open') {
    // 開いたときの処理
    console.log('ポップオーバーが開きました');
  } else {
    // 閉じたときの処理
    console.log('ポップオーバーが閉じました');
  }
});
```

**実用例: アニメーション制御**:

```javascript
popover.addEventListener('toggle', (event) => {
  if (event.newState === 'open') {
    popover.classList.add('fade-in');
  } else {
    popover.classList.add('fade-out');
  }
});
```

## ポップオーバー vs モーダル vs ダイアログ

| 特性 | Popover | Modal (dialog) | 非モーダル (dialog) |
|------|---------|---------------|-------------------|
| **背景操作** | 可能 | 不可能 | 可能 |
| **自動閉じ** | あり（light dismiss） | なし | なし |
| **Esc閉じ** | あり | あり | あり |
| **フォーカストラップ** | なし | あり | なし |
| **用途** | メニュー、ツールチップ | 確認画面、ログイン | 通知、チャット |

**選択基準**:
- ユーザーの注意を強く引く → Modal
- 補足情報を表示 → Popover
- 他の操作と並行 → 非モーダル or Popover

## 関連ナレッジ

- [CSS 2025 コンポーネント](./css-2025-components.md) - popover=hint、interestfor 属性
- [Anchor Positioning と Popover API の統合](./anchor-positioning-popover.md) - 実践的な組み合わせパターン
- [dialog 要素](../../html/dialog-command.md)
- [Anchor Positioning](./anchor-positioning.md)
- [@starting-style](../animation/starting-style.md)
