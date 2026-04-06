---
title: ブラウザ固有のワークアラウンド
category: cross-cutting/browser-compat
tags: [browser-compat, safari, ios, workarounds]
browser_support: 特定バージョン向け
created: 2025-01-16
updated: 2025-01-16
---

# ブラウザ固有のワークアラウンド

特定ブラウザ/バージョンのバグや挙動への対処法。将来のアップデートで不要になる可能性あり。

---

## iOS 26 Safari ステータスバー/タブバーの透過問題

> 出典: https://qiita.com/kskwtnk/items/df4d6b15f6df7026cfeb
> 執筆日: 不明
> 追加日: 2025-12-17
> 対象: iOS 26 Safari

iOS 26 Safari でステータスバー（上部）とタブバー（下部）が透過し、背景コンテンツが透けて見える問題への対処法。

### 問題

- ステータスバーとタブバーが透明になる
- 背景色やコンテンツが透けて見える
- 他のブラウザ（Arc 等）では発生しない

### 解決策

`mix-blend-mode: lighten` を使った固定要素で透過を防ぐ。

```html
<!-- body の直下に配置 -->
<div class="ios-status-bar-fix"></div>
<div class="ios-tab-bar-fix"></div>
```

```css
/* ステータスバー対策（上部） */
.ios-status-bar-fix {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px; /* 最低5px必要（4px以下は効果なし） */
  background-color: #000;
  mix-blend-mode: lighten;
  pointer-events: none;
  z-index: 9999;
}

/* タブバー対策（下部） */
.ios-tab-bar-fix {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px; /* 最低4px必要（3px以下は効果なし） */
  background-color: #000;
  mix-blend-mode: lighten;
  pointer-events: none;
  z-index: 9999;
}
```

### なぜ動作するのか

- `mix-blend-mode: lighten` は背景とオーバーレイを比較し、明るい方を表示
- 黒（#000）のオーバーレイは表示色に影響を与えない
- 透過を防ぎつつ、見た目は変わらない

### 重要なポイント

| 要素 | 最小高さ | 理由 |
|------|----------|------|
| ステータスバー | 5px | 4px以下は効果なし |
| タブバー | 4px | 3px以下は効果なし |

### iOS Safari のみに適用する場合

```css
/* iOS Safari 判定（User Agent に依存） */
@supports (-webkit-touch-callout: none) {
  .ios-status-bar-fix,
  .ios-tab-bar-fix {
    display: block;
  }
}
```

または JavaScript で判定:

```javascript
function isIOSSafari() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isWebkit = /WebKit/.test(ua);
  const isNotChrome = !/CriOS/.test(ua);
  return isIOS && isWebkit && isNotChrome;
}

if (isIOSSafari()) {
  document.body.classList.add("ios-safari");
}
```

```css
.ios-status-bar-fix,
.ios-tab-bar-fix {
  display: none;
}

.ios-safari .ios-status-bar-fix,
.ios-safari .ios-tab-bar-fix {
  display: block;
}
```

### 注意

- **一時的なワークアラウンド**: 将来の Safari アップデートで修正される可能性あり
- 定期的に問題が解消されたか確認し、不要になったら削除する

---
