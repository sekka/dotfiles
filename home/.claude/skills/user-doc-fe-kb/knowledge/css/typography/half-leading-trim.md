---
title: ハーフレディング（Half-Leading）の除去
category: css/typography
tags: [typography, line-height, half-leading, spacing, 2025]
browser_support: Chrome 109+, Safari 16.4+, Firefox 120+
created: 2026-01-19
updated: 2026-01-19
---

# ハーフレディング（Half-Leading）の除去

> 出典: https://css-notes.com/tips/trim-half-leading
> 執筆日: 2025年12月22日
> 追加日: 2026-01-19

`line-height` によって文字の上下に生成される不要な余白（ハーフレディング）を CSS で除去する手法。ボックスの padding が不揃いに見える問題を解決できます。

## ハーフレディングとは

**Half-Leading（ハーフレディング）** は、`line-height` で設定した行の高さと、実際の文字の高さ（`1em`）の差を、上下に均等に配分したスペースのことです。

```
┌─────────────────┐
│  ハーフレディング  │ ← line-height で生成される余白
├─────────────────┤
│   文字本体（1em） │
├─────────────────┤
│  ハーフレディング  │ ← line-height で生成される余白
└─────────────────┘
```

### 問題点

```css
.box {
  padding: 1rem;
  line-height: 1.5;
}
```

このとき、視覚的には padding の上下が不揃いに見えます。実際には padding は均等ですが、**ハーフレディングが加わる**ため、文字の上下に余分なスペースが生まれます。

## 解決策：ハーフレディングの除去

### 基本的な実装

```css
.trim-half-leading {
  --half-leading: calc((1lh - 1em) / 2);
  margin-block: calc(-1 * var(--half-leading));
}
```

### 動作原理

1. **`1lh`**: `line-height` の実際の高さ（行の高さ）
2. **`1em`**: フォントサイズ（文字本体の高さ）
3. **`1lh - 1em`**: 行の高さと文字の高さの差（= 全体のレディング）
4. **`/ 2`**: 上下に均等配分されるため、2で割る
5. **`-1 *`**: 負のマージンで打ち消す

## 実践例

### ボタン内のテキスト

```html
<button class="button">
  <span class="trim">ボタン</span>
</button>
```

```css
.button {
  padding: 0.75rem 1.5rem;
  line-height: 1.5;
}

.trim {
  --half-leading: calc((1lh - 1em) / 2);
  margin-block: calc(-1 * var(--half-leading));
  display: block;
}
```

**結果**: padding の上下が視覚的に均等に見える

### カード内の見出し

```html
<div class="card">
  <h2 class="trim">タイトル</h2>
  <p>説明文...</p>
</div>
```

```css
.card {
  padding: 2rem;
}

.card h2 {
  --half-leading: calc((1lh - 1em) / 2);
  margin-block: calc(-1 * var(--half-leading)) 1rem;
  font-size: 1.5rem;
  line-height: 1.4;
}
```

## 英語テキストでの最適化

### cap 単位の使用

英語など欧文フォントの場合、**キャップハイト（大文字の高さ）** を基準にする方が視覚的に正確です。

```css
.trim-cap {
  --half-leading: calc((1lh - 1cap) / 2);
  margin-block: calc(-1 * var(--half-leading));
}
```

### em vs cap の違い

| 単位 | 基準 | 適用 |
|------|------|------|
| `1em` | フォントサイズ全体 | 日本語、混在テキスト |
| `1cap` | 大文字の高さ | 英語、欧文のみ |

```css
/* 日本語テキスト */
.jp-text {
  --half-leading: calc((1lh - 1em) / 2);
  margin-block: calc(-1 * var(--half-leading));
}

/* 英語テキスト */
.en-text {
  --half-leading: calc((1lh - 1cap) / 2);
  margin-block: calc(-1 * var(--half-leading));
}
```

## 高度な応用

### ユーティリティクラス

```css
.trim-top {
  --half-leading: calc((1lh - 1em) / 2);
  margin-top: calc(-1 * var(--half-leading));
}

.trim-bottom {
  --half-leading: calc((1lh - 1em) / 2);
  margin-bottom: calc(-1 * var(--half-leading));
}

.trim-both {
  --half-leading: calc((1lh - 1em) / 2);
  margin-block: calc(-1 * var(--half-leading));
}
```

### カスタムプロパティでの調整

```css
:root {
  --base-line-height: 1.6;
}

.trim {
  line-height: var(--base-line-height);
  --half-leading: calc((1lh - 1em) / 2);
  margin-block: calc(-1 * var(--half-leading));
}
```

## 注意点

### 1. line-height の継承

```css
/* ❌ 親の line-height が影響する */
.parent {
  line-height: 2;
}

.child {
  /* 親の line-height: 2 が適用される */
  --half-leading: calc((1lh - 1em) / 2);
  margin-block: calc(-1 * var(--half-leading));
}

/* ✅ 明示的に line-height を指定 */
.child {
  line-height: 1.5;
  --half-leading: calc((1lh - 1em) / 2);
  margin-block: calc(-1 * var(--half-leading));
}
```

### 2. 複数行テキスト

```css
/* 単一行の見出しに適用 */
h1 {
  --half-leading: calc((1lh - 1em) / 2);
  margin-block: calc(-1 * var(--half-leading)) 1rem;
}

/* ❌ 複数行の本文には不適切 */
p {
  /* 行間が詰まりすぎる */
  --half-leading: calc((1lh - 1em) / 2);
  margin-block: calc(-1 * var(--half-leading));
}
```

**推奨**: 見出しやボタンなど、**単一行が想定される要素**にのみ適用。

### 3. フォントによる違い

```css
/* フォントごとに調整が必要な場合 */
.font-a {
  --half-leading: calc((1lh - 1em) / 2);
}

.font-b {
  /* フォントBは descent が深いため、微調整 */
  --half-leading: calc((1lh - 1em) / 2 + 0.05em);
}
```

## ブラウザサポート

| ブラウザ | `lh` 単位 | `cap` 単位 |
|---------|----------|-----------|
| Chrome | 109+ (2023年1月) | 109+ |
| Safari | 16.4+ (2023年3月) | 16.4+ |
| Firefox | 120+ (2023年11月) | 120+ |

**フォールバック**:

```css
/* フォールバック: 古いブラウザでは何もしない */
@supports (margin-block: 1lh) {
  .trim {
    --half-leading: calc((1lh - 1em) / 2);
    margin-block: calc(-1 * var(--half-leading));
  }
}
```

## ユースケース

- ボタン内のテキスト
- カード/ボックス内の見出し
- バッジ・ラベル
- タブメニューの項目
- ナビゲーションリンク

## 関連テクニック

### text-box-trim（実験的）

将来的には `text-box-trim` プロパティで標準化される可能性があります。

```css
/* 実験的機能（2026年1月時点で未対応） */
.trim-future {
  text-box-trim: both;
  text-box-edge: cap alphabetic;
}
```

## 参考リソース

- [MDN: lh unit](https://developer.mozilla.org/ja/docs/Web/CSS/length#lh)
- [MDN: cap unit](https://developer.mozilla.org/ja/docs/Web/CSS/length#cap)
- [CSS Text Module Level 4: text-box-trim](https://drafts.csswg.org/css-text-4/#text-box-trim)

---
