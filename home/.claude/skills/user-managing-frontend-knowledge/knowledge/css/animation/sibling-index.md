---
title: sibling-index() / sibling-count()
category: css/animation
tags: [sibling-index, sibling-count, animation, stagger, 2026]
browser_support: Safari 18.2+ (sibling-count), Safari 19.0+ (sibling-index)
created: 2026-01-31
updated: 2026-01-31
---

# sibling-index() / sibling-count()

> 出典: https://gihyo.jp/article/2026/01/misskey-22
> 執筆日: 2026年1月26日
> 追加日: 2026-01-31

要素のインデックスや兄弟要素の数を取得し、スタッガーアニメーション（段階的に遅延するアニメーション）を実装できるCSS関数。

## 概要

従来はJavaScriptで要素の順番を計算していたスタッガーアニメーションが、CSSのみで実装可能になります。

## 基本的な使い方

### sibling-count()

兄弟要素の総数を返します。

```css
.item {
  /* 兄弟要素が10個なら 10 を返す */
  --total: sibling-count();
}
```

### sibling-index()

要素のインデックス（0始まり）を返します。

```css
.item {
  /* 最初の要素は 0、次は 1、... */
  --index: sibling-index();
}
```

## ユースケース

### スタッガーアニメーション

```css
.list-item {
  --index: sibling-index();
  animation: fade-in 0.3s ease-out;
  animation-delay: calc(var(--index) * 0.05s);
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### プログレスバー

```css
.progress-segment {
  --index: sibling-index();
  --total: sibling-count();
  --progress: calc(var(--index) / var(--total));

  width: calc(100% / var(--total));
  opacity: calc(0.3 + var(--progress) * 0.7);
}
```

### カラーグラデーション

```css
.card {
  --index: sibling-index();
  --total: sibling-count();
  --hue: calc(var(--index) / var(--total) * 360);

  background: hsl(var(--hue), 70%, 50%);
}
```

## 従来の方法との比較

### JavaScript（従来）

```javascript
const items = document.querySelectorAll('.item');
items.forEach((item, index) => {
  item.style.animationDelay = `${index * 0.05}s`;
});
```

### CSS（sibling-index()）

```css
.item {
  --index: sibling-index();
  animation-delay: calc(var(--index) * 0.05s);
}
```

## 実践例

### カード一覧のスタッガー表示

```html
<div class="card-grid">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

```css
.card {
  --index: sibling-index();
  opacity: 0;
  animation: slide-up 0.4s ease-out forwards;
  animation-delay: calc(var(--index) * 0.1s);
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### リスト項目の波紋エフェクト

```css
.list-item {
  --index: sibling-index();
  --total: sibling-count();
  --delay: calc(var(--index) / var(--total) * 1s);

  animation: wave 2s ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes wave {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

## ブラウザサポート

| ブラウザ | sibling-count() | sibling-index() |
|----------|----------------|----------------|
| Safari | 18.2+ (2024年12月) | 19.0+ (2025年) |
| Chrome | 未対応 | 未対応 |
| Firefox | 未対応 | 未対応 |
| Edge | 未対応 | 未対応 |

**現状**: Safariのみ実装。他ブラウザは検討中。

## フォールバック

```css
/* フォールバック: 固定の遅延時間 */
.item {
  animation-delay: 0.1s;
}

/* Safari 18.2+ */
@supports (width: sibling-count()) {
  .item {
    --index: sibling-index();
    animation-delay: calc(var(--index) * 0.05s);
  }
}
```

## 注意点

### パフォーマンス

大量の要素（100個以上）でスタッガーアニメーションを使用する場合、パフォーマンスに影響する可能性があります。

### 動的な要素追加

JavaScriptで動的に要素を追加した場合、自動的に再計算されます。

```javascript
// 新しい要素を追加
const newItem = document.createElement('div');
newItem.className = 'item';
container.appendChild(newItem);
// → sibling-index() は自動更新される
```

## 関連ナレッジ

- [CSS カスタムプロパティ](../values/custom-properties.md)
- [CSS アニメーション](./animation-basics.md)
- [Stagger Animations パターン](../../cross-cutting/design-patterns/stagger-animations.md)

## 参考リソース

- [CSS Values and Units: sibling-index()](https://drafts.csswg.org/css-values-5/#funcdef-sibling-index)
- [WebKit Feature Status](https://webkit.org/status/)
