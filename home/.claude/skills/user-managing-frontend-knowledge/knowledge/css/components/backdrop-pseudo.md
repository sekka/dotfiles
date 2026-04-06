---
title: ::backdrop 疑似要素の改善
category: css/components
tags: [backdrop, dialog, pseudo-element, custom-properties, 2024]
browser_support: Chrome 122+
created: 2025-01-16
updated: 2025-01-16
---

# ::backdrop 疑似要素の改善

> 出典: https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> 執筆日: 2024年
> 追加日: 2025-12-17

ダイアログ要素のカスタムプロパティへアクセス可能に。

## 従来の制限

Chrome 121以前は、`::backdrop` 疑似要素から親要素のカスタムプロパティにアクセスできませんでした。

```css
/* Chrome 121以前: 動作しない */
dialog {
  --backdrop-color: rgba(0, 0, 0, 0.5);
}

dialog::backdrop {
  background: var(--backdrop-color);  /* 継承されない */
}
```

## Chrome 122+での改善

```css
dialog {
  --backdrop-color: rgba(0, 0, 0, 0.5);
}

dialog::backdrop {
  background: var(--backdrop-color);  /* Chrome 122+ で動作 */
}
```

## ユースケース

### テーマカラー対応のバックドロップ

```css
dialog {
  --theme-backdrop: rgba(102, 126, 234, 0.3);
}

dialog::backdrop {
  background: var(--theme-backdrop);
  backdrop-filter: blur(4px);
}
```

### ダークモード対応

```css
dialog {
  --backdrop-light: rgba(0, 0, 0, 0.5);
  --backdrop-dark: rgba(255, 255, 255, 0.1);
}

@media (prefers-color-scheme: light) {
  dialog::backdrop {
    background: var(--backdrop-light);
  }
}

@media (prefers-color-scheme: dark) {
  dialog::backdrop {
    background: var(--backdrop-dark);
  }
}
```

### 動的なバックドロップ

```javascript
// JavaScript でカスタムプロパティを変更
dialog.style.setProperty('--backdrop-color', 'rgba(255, 0, 0, 0.5)');
```

```css
dialog::backdrop {
  background: var(--backdrop-color, rgba(0, 0, 0, 0.5));
  transition: background 0.3s;
}
```

## 複数のダイアログ

```css
.dialog-warning {
  --backdrop-color: rgba(255, 193, 7, 0.3);
}

.dialog-error {
  --backdrop-color: rgba(244, 67, 54, 0.3);
}

.dialog-success {
  --backdrop-color: rgba(76, 175, 80, 0.3);
}

dialog::backdrop {
  background: var(--backdrop-color, rgba(0, 0, 0, 0.5));
}
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 122+ |
| Firefox | 対応済み |
| Safari | 対応済み |

## 関連ナレッジ

- [dialog 要素](./dialog-element.md)
- [CSS Custom Properties](../values/css-variables.md)
