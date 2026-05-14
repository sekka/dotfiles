---
title: attr() 拡張（content 以外での使用）
category: css/values
tags: [attr, attribute, dynamic, data-attribute, 2025, 2026]
browser_support: Chrome/Edge 133+ (2025-02), Firefox 149 Beta
created: 2026-01-31
updated: 2026-05-13
---

# attr() 拡張（content 以外での使用）

> 出典:
> - https://gihyo.jp/article/2026/01/misskey-22 (執筆 2026-01-26)
> - https://ics.media/entry/260326/ — ICS 岩間 日菜「CSSの attr() 関数が進化！」(2025-03-26)
>
> 追加日: 2026-01-31 / 更新: 2026-05-13

HTML 属性の値を、`content` プロパティ以外でも使用できるようにする CSS 機能の拡張。
**Chrome / Edge 133（2025年2月）で実装済み**、Firefox 149 Beta が部分対応。

## 概要

従来、`attr()` は `content` プロパティでのみ使用可能だったが、拡張により `width`、`color`、`transform` など、あらゆる CSS プロパティで属性値を参照できる。これにより `style` 属性や個別クラスを大幅に減らせる。

## 構文（type() 関数）

```
attr(<attribute-name> <type-or-unit>?, <fallback>?)
```

### 単位指定（直接）
```
attr(data-size px)
attr(data-angle deg)
attr(data-progress %)
```

### type() による型指定（推奨）
```
attr(data-color type(<color>))
attr(data-size type(<number>), 1)
attr(data-width type(<length>), 100px)
```

### サポートされる型

| 型 | 説明 |
|----|------|
| `type(<color>)` | 色 |
| `type(<length>)` | 長さ（px, em など） |
| `type(<number>)` | 数値 |
| `type(<percentage>)` | パーセント |
| `type(<integer>)` | 整数 |
| `type(<angle>)` | 角度（deg, rad など） |
| `type(<time>)` | 時間（s, ms） |
| `type(<url>)` | URL |
| `type(<string>)` | 文字列（デフォルト） |

## 従来の制限

```css
/* ✅ 従来も使用可能 */
a::after {
  content: attr(href);
}

/* ✅ Chrome 133+ で使用可能 */
.box {
  width: attr(data-width px);
  color: attr(data-color type(<color>));
}
```

## 実用パターン

### パターン1: 動的サイズ（ICS 例）

```html
<p class="item" data-size="0.8">ニュース！</p>
<p class="item" data-size="1.2" data-color="orange">ビッグニュース！</p>
```

```css
.item {
  font-size: calc(attr(data-size type(<number>), 1) * 1rem);
  padding: calc(attr(data-size type(<number>), 1) * 0.7rem)
           calc(attr(data-size type(<number>), 1) * 1.2rem);
  background: attr(data-color type(<color>), gray);
}
```

### パターン2: 動的プログレスバー

```html
<div class="bar" data-value="60"></div>
```

```css
.bar::before {
  content: '';
  display: block;
  width: attr(data-value %);
  height: 100%;
  background: #28a745;
  transition: width 0.3s ease;
}
```

```javascript
range.addEventListener("input", () => {
  bar.setAttribute("data-value", range.value);
});
```

### パターン3: テーマ切り替え

```html
<article data-theme="dark" data-accent="#007aff">
  <h2>記事タイトル</h2>
</article>
```

```css
article {
  --accent: attr(data-accent type(<color>), #007aff);
  border-left: 4px solid var(--accent);
}

article h2 {
  color: var(--accent);
}
```

### パターン4: アイコンサイズ

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

## フォールバック値

```css
.element {
  /* data-width がない場合は 100px */
  width: attr(data-width px, 100px);

  /* data-color がない場合は #333 */
  color: attr(data-color type(<color>), #333);
}
```

フォールバックは必ず指定するのが安全。属性が無い／値が不正な場合のレンダリング崩れを防げる。

## 従来の方法との比較

### JavaScript + カスタムプロパティ（従来）

```javascript
const progress = document.querySelector('.progress');
progress.style.setProperty('--progress', progress.dataset.value + '%');
```

```css
.progress::before {
  width: var(--progress);
}
```

### attr() 拡張（推奨）

```css
.progress::before {
  width: attr(data-value %);
}
```

→ JavaScript の介入が不要になる。データ属性とスタイルの関連が宣言的に。

## ブラウザサポート

| ブラウザ | バージョン | 対応時期 |
|----------|-----------|----------|
| Chrome | 133+ | 2025年2月 |
| Edge | 133+ | 2025年2月 |
| Firefox | 149 Beta（実験的） | 2026年〜 |
| Safari | 未対応 | 検討中 |

**フォールバック戦略**: 未対応ブラウザでもエラーにはならず、宣言が無視される。

```css
.element {
  /* フォールバック先に従来の値を */
  width: 100px;
  width: attr(data-width px, 100px);
}
```

## 仕様の状況

**CSSWG 仕様**: [CSS Values and Units Level 5: attr()](https://drafts.csswg.org/css-values-5/#attr-notation)

## 期待される利点

1. **JavaScript 不要** — 動的なスタイリングが CSS のみで完結
2. **パフォーマンス向上** — JavaScript の介入が減りレンダリング負荷低減
3. **宣言的** — HTML 属性でスタイル制御、よりセマンティック
4. **メンテナンス性** — データとスタイルの関連が明確

## 関連ナレッジ

- [カスタムプロパティ（CSS変数）](./custom-properties.md)
- [conditional-if-function](./conditional-if-function.md)

## 参考リソース

- [ICS: CSS の attr() 関数が進化！](https://ics.media/entry/260326/)
- [CSS Values and Units Level 5: attr()](https://drafts.csswg.org/css-values-5/#attr-notation)
- [MDN: attr()](https://developer.mozilla.org/en-US/docs/Web/CSS/attr)
