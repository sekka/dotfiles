---
url: https://ics.media/entry/260326/
fetched_at: 2026-05-13
title: CSSのattr()関数が進化！ HTML属性値を参照する新しい使い方
---

# CSS attr() 関数の拡張構文

**著者**: 岩間 日菜（株式会社ICS）
**公開日**: 2025年3月26日（取得結果）

## 何が変わったか
従来、`attr()` は `::before`/`::after` の `content` プロパティのみで利用可能だった。
Chrome・Edge 133 以降では、**すべての CSS プロパティで使用できるように拡張**された。

## 利点
- "個別の `style` 属性やクラスを減らせる"
- HTML の属性値を CSS の値として直接利用可能

## コード例

### 基本的な使い方
```css
/* 数値型で計算に使用 */
.item {
  font-size: calc(attr(data-size type(<number>), 1) * 1rem);
  padding: calc(attr(data-size type(<number>), 1) * 0.7rem)
           calc(attr(data-size type(<number>), 1) * 1.2rem);
}

/* 色型として解釈 */
.item {
  background: attr(data-color type(<color>), gray);
}
```

```html
<p class="item" data-size="0.8">ニュース！</p>
<p class="item" data-size="1.2" data-color="orange">ビッグニュース！</p>
```

### 進捗バー実装例
```css
.bar::before {
  width: attr(data-value %);
}
```

```javascript
range.addEventListener("input", () => {
  bar.setAttribute("data-value", range.value);
});
```

## 構文形式
```
attr(属性名 単位)              /* px, deg, % など */
attr(属性名 単位, フォールバック値)
attr(属性名 type(型))
attr(属性名 type(型), フォールバック値)
```

### サポートされる型
- `type(<color>)` — 色
- `type(<length>)` — 長さ
- `type(<number>)` — 数値
- `type(<percentage>)` — パーセンテージ

## ブラウザサポート
- **対応**: Chrome・Edge 133以上（2025年2月〜）
- **部分対応**: Firefox 149 Beta（実験的機能）
