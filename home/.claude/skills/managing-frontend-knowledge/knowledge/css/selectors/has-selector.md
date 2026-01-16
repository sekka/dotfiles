---
title: :has() セレクタ（親セレクタ）
category: css/selectors
tags: [has, selector, parent-selector, 2023]
browser_support: Chrome 105+, Firefox 121+, Safari 15.4+
created: 2025-01-16
updated: 2025-01-16
---

# :has() セレクタ

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

親要素を子要素の状態で選択（親セレクタ）。

## 基本的な使い方

```css
/* リンクを含むカードにスタイル */
.card:has(a) {
  cursor: pointer;
}

/* チェックされたラベル */
label:has(input:checked) {
  background-color: #e0f0ff;
}

/* 空でないフォーム */
form:has(input:not(:placeholder-shown)) {
  border-color: green;
}

/* 画像を含む記事 */
article:has(img) {
  display: grid;
  grid-template-columns: 200px 1fr;
}
```

## ユースケース

### カードのクリッカブル領域拡張

```css
.card:has(a) {
  cursor: pointer;
  transition: transform 0.2s;
}

.card:has(a):hover {
  transform: translateY(-4px);
}
```

### フォーム状態の可視化

```css
/* 入力済みフィールドを含むフォーム */
form:has(input:not(:placeholder-shown)) {
  border-left: 4px solid green;
}

/* エラーを含むフォーム */
form:has(.error) {
  border-left: 4px solid red;
}
```

### レイアウトの動的変更

```css
/* 画像がある記事は2カラム */
article:has(img) {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1rem;
}

/* 画像がない記事は1カラム */
article:not(:has(img)) {
  max-width: 600px;
}
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome | 105+ |
| Firefox | 121+ |
| Safari | 15.4+ |

## 注意点

- パフォーマンス: 複雑なセレクタは避ける
- 従来のJavaScript実装より高速

## 関連ナレッジ

- [:is() / :where()](./is-where-selectors.md)
- [CSS Selectors](./selectors-overview.md)
