---
title: field-sizing プロパティ
category: css/components
tags: [field-sizing, forms, auto-size, 2024]
browser_support: Chrome 123+, Firefox Nightly
created: 2025-01-16
updated: 2025-01-16
---

# field-sizing プロパティ

> 出典: https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> 執筆日: 2024年
> 追加日: 2025-12-17

コンテンツに応じて入力フィールドが自動サイズ変更される機能。JavaScript 不要。

## 基本的な使い方

```css
textarea, select, input {
  field-sizing: content;
}
```

## 動作

- `field-sizing: content` を指定すると、入力内容に応じてフィールドが自動的に拡張
- テキストエリアの高さ、セレクトボックスの幅などが動的に調整される

## ユースケース

### 自動拡張テキストエリア

```css
textarea {
  field-sizing: content;
  min-height: 3lh; /* 最小3行 */
  max-height: 10lh; /* 最大10行 */
}
```

### 自動幅調整セレクト

```css
select {
  field-sizing: content;
  min-width: 120px;
}
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 123+ |
| Firefox | Nightly のみ |
| Safari | 未対応 |

## 従来の方法

```javascript
// JavaScript が必要だった
textarea.addEventListener('input', (e) => {
  e.target.style.height = 'auto';
  e.target.style.height = e.target.scrollHeight + 'px';
});
```

## 関連ナレッジ

- [Forms ベストプラクティス](./forms-best-practices.md)
- [interpolate-size](../animation/interpolate-size.md)
