---
title: :is() / :where() セレクタ
category: css/selectors
tags: [is, where, selector, specificity]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# :is() / :where() セレクタ

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

複数セレクタをまとめて記述。

## 基本的な使い方

```css
/* :is() - 詳細度は最も高いセレクタに合わせる */
.post :is(h2, h3, h4, h5, h6) {
  font-weight: bold;
  line-height: 1.4;
}

/* :where() - 詳細度は常に 0 */
:where(.post, .article) p {
  line-height: 1.8;
}
```

## 使い分け

- **:is()** - 通常のセレクタ
- **:where()** - リセットCSS、上書きしやすくしたい場合

## 詳細度の違い

```css
/* :is() の詳細度 = 最も高いセレクタの詳細度 */
:is(#id, .class) {
  /* 詳細度: 1,0,0 (id の詳細度) */
}

/* :where() の詳細度 = 常に 0 */
:where(#id, .class) {
  /* 詳細度: 0,0,0 */
}
```

## ユースケース

### 見出しの一括スタイル

```css
/* 従来 */
.post h2, .post h3, .post h4 {
  color: #333;
}

/* :is() 使用 */
.post :is(h2, h3, h4) {
  color: #333;
}
```

### リセットCSS

```css
/* 詳細度0なので簡単に上書き可能 */
:where(h1, h2, h3, h4, h5, h6) {
  margin: 0;
  font-weight: inherit;
}
```

## 関連ナレッジ

- [:has()](./has-selector.md)
- [CSS Specificity](./specificity.md)
