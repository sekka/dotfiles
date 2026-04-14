---
title: ruby-align プロパティ
category: css/typography
tags: [ruby, japanese, typography, 2024]
browser_support: Chrome 128+
created: 2025-01-16
updated: 2025-01-16
---

# ruby-align プロパティ

> 出典: https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> 執筆日: 2024年
> 追加日: 2025-12-17

ルビテキストの配置を制御。

## 基本的な使い方

```css
ruby {
  ruby-align: space-between;  /* center | space-around | space-between | start */
}
```

## 値の種類

| 値 | 説明 |
|----|------|
| `center` | 中央揃え（デフォルト） |
| `space-around` | 均等配置（両端に余白） |
| `space-between` | 均等配置（両端は余白なし） |
| `start` | 開始位置揃え |

## 使用例

```html
<ruby>
  漢字<rt>かんじ</rt>
</ruby>
```

```css
/* 中央揃え */
ruby {
  ruby-align: center;
}

/* 均等配置 */
ruby {
  ruby-align: space-between;
}
```

## 視覚的な違い

```
center:
漢  字
かんじ

space-between:
漢  字
か んじ
```

## ユースケース

### 日本語の読み仮名

```css
.article ruby {
  ruby-align: space-between;
  ruby-position: over;
}
```

### 縦書きテキスト

```css
.vertical-text {
  writing-mode: vertical-rl;
}

.vertical-text ruby {
  ruby-align: center;
  ruby-position: right;
}
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 128+ |
| Firefox | 38+ |
| Safari | 一部対応 |

## 関連ナレッジ

- [ruby-position](./ruby-position.md)
- [日本語タイポグラフィ](./japanese-typography.md)
