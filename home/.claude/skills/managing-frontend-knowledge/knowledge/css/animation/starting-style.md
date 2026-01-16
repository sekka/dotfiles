---
title: @starting-style 規則
category: css/animation
tags: [starting-style, animation, entry-animation, 2024]
browser_support: Chrome 117+, Safari 17.5+, Firefox 129+
created: 2025-01-16
updated: 2025-01-16
---

# @starting-style 規則

> 出典: https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> 執筆日: 2024年
> 追加日: 2025-12-17

要素の初期スタイルを定義し、表示時のトランジションを実現。

## 基本的な使い方

```css
dialog {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s, transform 0.3s, display 0.3s allow-discrete;
}

/* 非表示時 */
dialog:not([open]) {
  opacity: 0;
  transform: translateY(-20px);
}

/* 表示開始時のスタイル（ここからトランジション） */
@starting-style {
  dialog[open] {
    opacity: 0;
    transform: translateY(-20px);
  }
}
```

## 動作原理

従来、`display: none` から `display: block` への変化にトランジションを適用できませんでした。`@starting-style` を使うと、要素が DOM に追加された瞬間の初期スタイルを定義でき、そこからトランジションが開始されます。

## ユースケース

### モーダルの登場アニメーション

```css
dialog {
  opacity: 1;
  scale: 1;
  transition: opacity 0.3s, scale 0.3s, display 0.3s allow-discrete;
}

dialog:not([open]) {
  opacity: 0;
  scale: 0.9;
}

@starting-style {
  dialog[open] {
    opacity: 0;
    scale: 0.9;
  }
}
```

### ポップオーバーのフェードイン

```css
[popover] {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.2s, transform 0.2s, display 0.2s allow-discrete;
}

[popover]:not(:popover-open) {
  opacity: 0;
  transform: translateY(10px);
}

@starting-style {
  [popover]:popover-open {
    opacity: 0;
    transform: translateY(10px);
  }
}
```

### トーストメッセージ

```css
.toast {
  opacity: 1;
  translate: 0 0;
  transition: opacity 0.3s, translate 0.3s;
}

.toast.hidden {
  opacity: 0;
  translate: 0 -20px;
}

@starting-style {
  .toast {
    opacity: 0;
    translate: 0 -20px;
  }
}
```

## transition-behavior: allow-discrete

`display` や `content-visibility` などの離散的なプロパティにトランジションを適用するには、`allow-discrete` が必要です。

```css
dialog {
  transition: opacity 0.3s, display 0.3s allow-discrete;
}
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 117+ |
| Safari | 17.5+ |
| Firefox | 129+ |

## フォールバック

```css
/* フォールバック: アニメーションなし */
dialog[open] {
  display: block;
}

/* @starting-style 対応ブラウザ */
@supports (transition-behavior: allow-discrete) {
  dialog {
    opacity: 1;
    transition: opacity 0.3s, display 0.3s allow-discrete;
  }

  dialog:not([open]) {
    opacity: 0;
  }

  @starting-style {
    dialog[open] {
      opacity: 0;
    }
  }
}
```

## 関連ナレッジ

- [interpolate-size](./interpolate-size.md)
- [Popover API](../components/popover-api.md)
- [dialog 要素](../components/dialog-element.md)
