---
title: attr() 拡張（content 以外での使用）
category: css/values
tags: [attr, attribute, dynamic, data-attribute, 2026]
browser_support: 提案段階（一部ブラウザで試験実装）
created: 2026-01-31
updated: 2026-01-31
---

# attr() 拡張（content 以外での使用）

> 出典: https://gihyo.jp/article/2026/01/misskey-22
> 執筆日: 2026年1月26日
> 追加日: 2026-01-31

HTML属性の値を、`content` プロパティ以外でも使用できるようにする CSS 機能の拡張。

## 概要

従来、`attr()` 関数は `content` プロパティでのみ使用可能でしたが、拡張により `width`、`color`、`transform` など、あらゆるCSSプロパティで属性値を参照できるようになります。

## 従来の制限

```css
/* ✅ 現在使用可能 */
a::after {
  content: attr(href);
}

/* ❌ 従来は使用不可 */
.box {
  width: attr(data-width px); /* エラー */
  color: attr(data-color color); /* エラー */
}
```

## 拡張後の構文（提案）

```css
attr(<attribute-name> <type>?, <fallback>?)
```

### 型指定

| 型 | 説明 |
|----|------|
| `string` | 文字列（デフォルト） |
| `color` | 色 |
| `url` | URL |
| `integer` | 整数 |
| `number` | 数値 |
| `length` | 長さ（px, em など） |
| `angle` | 角度（deg, rad など） |
| `time` | 時間（s, ms） |
| `percentage` | パーセント |

## 想定されるユースケース

### データ属性から幅を取得

```html
<div class="progress-bar" data-progress="75"></div>
```

```css
.progress-bar {
  width: attr(data-progress %);
  background: linear-gradient(to right, #007aff attr(data-progress %), transparent 0);
}
```

### カスタムカラー

```html
<div class="card" data-theme-color="#667eea"></div>
```

```css
.card {
  border-color: attr(data-theme-color color);
  background: linear-gradient(135deg, attr(data-theme-color color), transparent);
}
```

### アニメーション時間

```html
<div class="animated" data-duration="2"></div>
```

```css
.animated {
  animation: slide-in attr(data-duration s) ease-out;
}
```

### レスポンシブサイズ

```html
<img src="icon.svg" data-size="64" alt="">
```

```css
img {
  width: attr(data-size px);
  height: attr(data-size px);
}
```

## フォールバック値

```css
.element {
  /* data-width がない場合は 100px */
  width: attr(data-width px, 100px);

  /* data-color がない場合は #333 */
  color: attr(data-color color, #333);
}
```

## 実用パターン

### パターン1: 動的プログレスバー

```html
<div class="progress" data-value="60" data-color="#28a745">
  <span class="progress-label">60%</span>
</div>
```

```css
.progress {
  position: relative;
  width: 100%;
  height: 24px;
  background: #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
}

.progress::before {
  content: '';
  position: absolute;
  width: attr(data-value %);
  height: 100%;
  background: attr(data-color color);
  transition: width 0.3s ease;
}
```

### パターン2: テーマ切り替え

```html
<article data-theme="dark" data-accent="#007aff">
  <h2>記事タイトル</h2>
  <p>記事本文...</p>
</article>
```

```css
article {
  --accent: attr(data-accent color, #007aff);
  border-left: 4px solid var(--accent);
}

article h2 {
  color: var(--accent);
}
```

### パターン3: アイコンサイズ

```html
<svg class="icon" data-size="32">
  <use href="#icon-star" />
</svg>
```

```css
.icon {
  width: attr(data-size px, 24px);
  height: attr(data-size px, 24px);
}
```

## 従来の方法との比較

### JavaScript（従来）

```javascript
// 従来: JavaScript で属性を読み取り、CSSに適用
const progress = document.querySelector('.progress');
const value = progress.getAttribute('data-value');
progress.style.setProperty('--progress', value + '%');
```

```css
.progress::before {
  width: var(--progress);
}
```

### attr() 拡張（提案）

```css
/* CSS のみ */
.progress::before {
  width: attr(data-value %);
}
```

## ブラウザサポート

| ブラウザ | content 以外での attr() |
|----------|----------------------|
| Chrome | 未対応（検討中） |
| Firefox | 未対応（検討中） |
| Safari | 未対応（検討中） |
| Edge | 未対応（検討中） |

**現状**: すべてのブラウザで `content` プロパティのみ対応。拡張版は提案段階。

## 仕様の状況

**CSSWG 仕様**: [CSS Values and Units Level 4: attr()](https://drafts.csswg.org/css-values-4/#attr-notation)

**ステータス**: Working Draft（作業草案）

## 代替案（現在の実装方法）

### カスタムプロパティ + JavaScript

```html
<div class="card" style="--width: 300px; --color: #667eea;"></div>
```

```css
.card {
  width: var(--width);
  border-color: var(--color);
}
```

```javascript
// JavaScriptで動的に設定
element.style.setProperty('--width', '300px');
element.style.setProperty('--color', '#667eea');
```

### データ属性 + カスタムプロパティ

```javascript
// data-* を読み取ってカスタムプロパティに設定
document.querySelectorAll('[data-width]').forEach(el => {
  el.style.setProperty('--width', el.dataset.width + 'px');
});
```

## 期待される利点

### 1. JavaScript 不要

動的なスタイリングが CSS のみで完結。

### 2. パフォーマンス向上

JavaScript の介入が減り、レンダリングパフォーマンスが向上。

### 3. 宣言的

HTML属性でスタイルを制御でき、よりセマンティックに。

### 4. メンテナンス性

データとスタイルの関連が明確になる。

## 関連ナレッジ

- [カスタムプロパティ（CSS変数）](./custom-properties.md)
- [データ属性](../../html/semantic/data-attributes.md)
- [content プロパティ](../typography/content.md)

## 参考リソース

- [CSS Values and Units Level 4: attr()](https://drafts.csswg.org/css-values-4/#attr-notation)
- [MDN: attr()](https://developer.mozilla.org/en-US/docs/Web/CSS/attr)
- [Can I Use: CSS attr() for all properties](https://caniuse.com/css-attr-all-properties)
