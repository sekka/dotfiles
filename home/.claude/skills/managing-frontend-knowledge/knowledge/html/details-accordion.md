---
title: details 要素の排他的アコーディオン
category: html
tags: [details, accordion, name-attribute, 2024]
browser_support: Chrome 120+, Firefox 130+, Safari 17.2+
created: 2025-01-16
updated: 2025-01-16
---

# details 要素の排他的アコーディオン

> 出典: https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> 執筆日: 2024年
> 追加日: 2025-12-17

複数の `details` 要素に同じ `name` 属性を付与すると、1つ開くと他は自動で閉じる。

## 基本的な使い方

```html
<details name="faq">
  <summary>質問1</summary>
  <p>回答1</p>
</details>
<details name="faq">
  <summary>質問2</summary>
  <p>回答2</p>
</details>
<details name="faq">
  <summary>質問3</summary>
  <p>回答3</p>
</details>
```

## 動作

同じ `name` 属性を持つ `details` 要素は、1つだけが開いた状態になります。別の要素を開くと、既に開いていた要素は自動的に閉じます。

## ユースケース

### FAQ セクション

```html
<section class="faq">
  <h2>よくある質問</h2>
  <details name="faq">
    <summary>配送にはどのくらいかかりますか？</summary>
    <p>通常3-5営業日でお届けします。</p>
  </details>
  <details name="faq">
    <summary>返品は可能ですか？</summary>
    <p>商品到着後30日以内であれば返品可能です。</p>
  </details>
  <details name="faq">
    <summary>支払い方法は？</summary>
    <p>クレジットカード、銀行振込に対応しています。</p>
  </details>
</section>
```

### 設定パネル

```html
<div class="settings">
  <details name="settings">
    <summary>アカウント設定</summary>
    <!-- アカウント設定フォーム -->
  </details>
  <details name="settings">
    <summary>通知設定</summary>
    <!-- 通知設定フォーム -->
  </details>
  <details name="settings">
    <summary>プライバシー設定</summary>
    <!-- プライバシー設定フォーム -->
  </details>
</div>
```

## スタイリング

```css
details {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.5rem;
}

summary {
  cursor: pointer;
  font-weight: 600;
  user-select: none;
}

summary:hover {
  color: #0066cc;
}

details[open] summary {
  margin-bottom: 1rem;
}
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 120+ |
| Firefox | 130+ |
| Safari | 17.2+ |

## 関連ナレッジ

- [::details-content](./details-content-pseudo.md)
- [Accordion パターン](../cross-cutting/design-patterns/accordion.md)
