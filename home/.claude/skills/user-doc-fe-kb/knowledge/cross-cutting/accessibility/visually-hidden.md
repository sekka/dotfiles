---
title: Visually Hidden（アクセシブルな非表示）
category: cross-cutting/accessibility
tags: [a11y, visually-hidden, screen-reader, accessibility]
browser_support: 全ブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# Visually Hidden（アクセシブルな非表示）

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

視覚的には非表示だが、スクリーンリーダーには読み上げられる。

## 基本的な実装

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## 使用例

```html
<button>
  <svg>...</svg>
  <span class="visually-hidden">メニューを開く</span>
</button>
```

## ユースケース

### アイコンボタン

```html
<button class="icon-button">
  <svg aria-hidden="true">
    <use href="#icon-search"></use>
  </svg>
  <span class="visually-hidden">検索</span>
</button>
```

### スキップリンク

```html
<a href="#main" class="visually-hidden-focusable">
  メインコンテンツへスキップ
</a>
```

```css
.visually-hidden-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### フォームラベル

```html
<label for="search" class="visually-hidden">検索</label>
<input id="search" type="search" placeholder="検索...">
```

## display: none との違い

| プロパティ | 視覚的 | スクリーンリーダー |
|-----------|--------|------------------|
| `display: none` | ❌ 非表示 | ❌ 読み上げられない |
| `visibility: hidden` | ❌ 非表示 | ❌ 読み上げられない |
| `.visually-hidden` | ❌ 非表示 | ✅ 読み上げられる |

## 注意点

- `display: none` や `visibility: hidden` は使わない
- `aria-label` より visually-hidden の方が翻訳されやすい

## 関連ナレッジ

- [ARIA ベストプラクティス](./aria-best-practices.md)
- [アクセシビリティチェックリスト](./accessibility-checklist.md)
