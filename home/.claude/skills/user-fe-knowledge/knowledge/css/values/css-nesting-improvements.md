---
title: CSS ネストの仕様改善
category: css/values
tags: [nesting, css-nesting, declarations, 2024]
browser_support: Chrome 120+
created: 2025-01-16
updated: 2025-01-16
---

# CSS ネストの仕様改善

> 出典: https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> 執筆日: 2024年
> 追加日: 2025-12-17

`CSSNestedDeclarations` インターフェイスで、ルール内の宣言配置が正規化。

## 改善内容

従来、CSS ネスト内でプロパティ宣言の順序が制限されていました。改善後は、ネストの後に宣言を書いても正しく適用されるようになりました。

## 改善前の制限

```css
/* 改善前: ネストの後の宣言が無視される場合があった */
.card {
  padding: 1rem;

  &:hover {
    background: #f0f0f0;
  }

  /* この宣言が正しく適用されない可能性があった */
  border-radius: 8px;
}
```

## 改善後

```css
/* 改善後: 宣言の順序が直感的に */
.card {
  padding: 1rem;

  &:hover {
    background: #f0f0f0;
  }

  /* ネストの後に宣言を書いても正しく適用 */
  border-radius: 8px;
}
```

## 推奨される書き方

改善されましたが、可読性のためにはプロパティ宣言をネストの前に書くことが推奨されます。

```css
/* 推奨: プロパティを先に、ネストを後に */
.card {
  padding: 1rem;
  border-radius: 8px;

  &:hover {
    background: #f0f0f0;
  }
}
```

## ユースケース

### 複雑なネスト

```css
.nav {
  display: flex;
  gap: 1rem;

  .nav-item {
    padding: 0.5rem 1rem;

    &:hover {
      background: #f0f0f0;
    }

    .icon {
      margin-right: 0.5rem;
    }
  }

  /* ネストの後でも正しく適用される */
  background: white;
  border-bottom: 1px solid #e0e0e0;
}
```

### メディアクエリとの組み合わせ

```css
.container {
  width: 90%;
  max-width: 1200px;

  @media (width >= 768px) {
    width: 80%;
  }

  /* メディアクエリの後でも適用される */
  margin: 0 auto;
  padding: 2rem;
}
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 120+ |
| Firefox | 117+ |
| Safari | 17.2+ |

## 注意点

- 古いブラウザでは従来の制限が残っているため、プロパティは前に書くことを推奨
- 一貫性のあるコードスタイルを維持することが重要

## 関連ナレッジ

- [CSS Nesting 基礎](./css-nesting-basics.md)
- [CSS セレクタ](../selectors/selectors-overview.md)
