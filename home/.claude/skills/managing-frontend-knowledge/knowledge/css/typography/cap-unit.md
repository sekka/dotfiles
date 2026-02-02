---
title: cap 単位
category: css/typography
tags: [cap, font-relative, units, typography, vertical-align, 2024]
browser_support: Chrome 124+, Edge 124+, Safari 17.4+, Firefox 97+
created: 2026-01-31
updated: 2026-01-31
---

# cap 単位

> 出典: https://ishadeed.com/article/css-cap-unit/
> 執筆日: 2024年
> 追加日: 2026-01-31

`cap` は、フォントの大文字高さ（capital height）に基づく相対単位。従来の `em` や `rem` と異なり、実際の大文字の高さを基準とするため、タイポグラフィの精密な調整が可能になる。

## 基本概念

### フォントメトリクスの理解

```
┌─────────────────┐ ← ascender（アセンダー）
│   h  b  d       │
├─────────────────┤ ← cap height（キャップハイト）
│   H  A          │
├─────────────────┤ ← x-height（エックスハイト）
│   x  a          │
├─────────────────┤ ← baseline（ベースライン）
│   p  g  y       │
└─────────────────┘ ← descender（ディセンダー）
```

**cap height（キャップハイト）:**
- 大文字「H」や「A」の高さ
- フォントごとに異なる
- `1cap` = そのフォントの大文字高さ

### 従来の単位との違い

```css
/* em/rem: font-size 基準 */
.text {
  font-size: 16px;
  padding: 0.5em; /* 8px（font-size の半分） */
}

/* cap: 大文字高さ基準 */
.text {
  font-size: 16px;
  padding: 0.5cap; /* 大文字高さの半分（通常は 11-12px 程度） */
}
```

**特徴:**
- `em`: font-size 全体が基準（ascender + descender 含む）
- `cap`: 大文字の高さのみが基準
- よりタイトな調整が可能

## 詳細な使用例

### 1. アイコンと大文字テキストの垂直揃え

#### 問題: アイコンとテキストのズレ

```html
<button class="btn">
  <svg class="icon" width="20" height="20">...</svg>
  BUTTON
</button>
```

```css
/* 従来の方法: 手動調整 */
.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  margin-top: -2px; /* 微調整が必要 */
}
```

**問題点:**
- フォントが変わると調整が必要
- font-size が変わると再調整が必要

#### 解決策: cap 単位

```css
.btn {
  display: flex;
  align-items: baseline; /* ベースライン揃え */
  gap: 0.5rem;
  font-size: 16px;
}

.icon {
  width: 1cap; /* 大文字高さと同じ */
  height: 1cap;
  vertical-align: baseline;
}
```

**メリット:**
- フォント変更に自動対応
- font-size 変更に自動対応
- 手動調整不要

### 2. バッジとラベルのサイズ調整

```html
<span class="badge">NEW</span>
<h2>Product Name</h2>
```

```css
.badge {
  display: inline-block;
  padding: 0.25cap 0.5cap; /* 大文字高さ基準 */
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase; /* 大文字化 */
  background: #ff5722;
  color: white;
  border-radius: 0.25cap;
  vertical-align: 0.5cap; /* 大文字高さの半分上げる */
}
```

**動作:**
- バッジのパディングが大文字高さに比例
- 隣接するテキストとの視覚的バランスが自然

### 3. タイポグラフィスケールでの応用

```css
/* 見出しと本文の大文字高さを揃える */
h1 {
  font-size: 3rem;
  line-height: 1.2;
  margin-bottom: 1cap; /* 大文字高さ分のマージン */
}

p {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1cap; /* h1 と同じ視覚的間隔 */
}
```

**効果:**
- フォントサイズが異なっても、視覚的に統一された間隔
- タイポグラフィリズムの維持

### 4. ボタンとフォームの高さ調整

```css
/* 大文字高さベースのボタン高さ */
.btn {
  padding: 0.75cap 1.5cap;
  font-size: 1rem;
  text-transform: uppercase;
  border-radius: 0.5cap;
}

/* フォーム要素の高さ統一 */
input,
select,
button {
  height: 3cap; /* 大文字高さの3倍 */
  padding: 0 1cap;
  font-size: 1rem;
}
```

**メリット:**
- テキストとボタンの高さが視覚的に一致
- フォント変更に自動対応

### 5. グリッドレイアウトでの行高さ調整

```css
.grid {
  display: grid;
  grid-template-rows: 2cap 1fr 2cap; /* ヘッダー、コンテンツ、フッター */
  gap: 1cap;
}

.header {
  font-size: 1.5rem;
  text-transform: uppercase;
  display: flex;
  align-items: center;
}
```

**動作:**
- ヘッダーの高さが大文字高さの2倍
- フォントサイズが変わっても比例して調整

## 実践的なパターン

### パターン1: アイコンボタン

```html
<button class="icon-btn">
  <svg class="icon">...</svg>
  <span class="label">SAVE</span>
</button>
```

```css
.icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5cap;
  padding: 0.75cap 1.25cap;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5cap;
  cursor: pointer;
}

.icon {
  width: 1cap;
  height: 1cap;
  fill: currentColor;
}
```

### パターン2: カードヘッダー

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">TITLE</h3>
    <span class="card-badge">NEW</span>
  </div>
  <div class="card-body">Content</div>
</div>
```

```css
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 1cap;
  border-bottom: 1px solid #e0e0e0;
}

.card-title {
  font-size: 1.25rem;
  text-transform: uppercase;
  margin: 0;
}

.card-badge {
  padding: 0.25cap 0.5cap;
  font-size: 0.75rem;
  text-transform: uppercase;
  background: #ff5722;
  color: white;
  border-radius: 0.25cap;
}
```

### パターン3: データテーブルの行高さ

```css
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  padding: 1cap;
  text-align: left;
  text-transform: uppercase;
  font-size: 0.875rem;
  font-weight: 600;
  background: #f5f5f5;
  border-bottom: 2px solid #ddd;
}

.table td {
  padding: 1cap;
  border-bottom: 1px solid #e0e0e0;
}
```

**効果:**
- セルの高さが大文字高さに比例
- 視覚的に統一された行間

## アクセシビリティ考慮事項

### 1. 最小サイズの確保

```css
/* NG: 小さすぎるクリック領域 */
.btn {
  padding: 0.25cap 0.5cap; /* タッチターゲットが小さい */
}

/* OK: 最小44x44pxを確保 */
.btn {
  padding: 0.75cap 1.5cap;
  min-width: 44px;
  min-height: 44px;
}
```

### 2. コントラスト比の維持

```css
.badge {
  padding: 0.25cap 0.5cap;
  font-size: 0.75rem;
  background: #ff5722;
  color: white; /* コントラスト比 4.5:1 以上を確保 */
}
```

### 3. ズーム対応

```css
/* cap 単位はズームに自動対応 */
.text {
  font-size: 16px; /* ユーザーがズームすると拡大 */
  padding: 0.5cap; /* 比例して拡大 */
}
```

## ブラウザサポート

| ブラウザ | バージョン | 備考 |
|----------|-----------|------|
| Chrome | 124+ | 2024年5月リリース |
| Edge | 124+ | Chromiumベース |
| Safari | 17.4+ | 2024年3月リリース |
| Firefox | 97+ | 2022年2月リリース |

**フォールバック:**

```css
/* フォールバック: em 単位 */
.btn {
  padding: 0.5em 1em;
}

/* 対応ブラウザ: cap 単位 */
@supports (padding: 1cap) {
  .btn {
    padding: 0.75cap 1.5cap;
  }
}
```

## 他の単位との比較

### cap vs em

```css
.text {
  font-size: 16px;
}

/* em: font-size 全体が基準 */
.em-example {
  padding: 0.5em; /* 8px（16px の半分） */
}

/* cap: 大文字高さが基準 */
.cap-example {
  padding: 0.5cap; /* 約 5.6px（フォント依存） */
}
```

**使い分け:**
- `em`: 全体的なスケーリング
- `cap`: タイトな垂直調整

### cap vs ex（x-height）

```css
/* ex: 小文字 "x" の高さ */
.ex-example {
  padding: 0.5ex;
}

/* cap: 大文字 "H" の高さ */
.cap-example {
  padding: 0.5cap;
}
```

**使い分け:**
- `ex`: 小文字中心のテキスト
- `cap`: 大文字中心のテキスト（ボタン、見出し等）

### cap vs lh（line-height）

```css
/* lh: 行高さ */
.lh-example {
  margin-bottom: 1lh; /* 行高さ分のマージン */
}

/* cap: 大文字高さ */
.cap-example {
  margin-bottom: 1cap; /* 大文字高さ分のマージン */
}
```

**使い分け:**
- `lh`: 行間の調整
- `cap`: 垂直方向の精密な調整

## パフォーマンス考慮事項

### フォント読み込み

`cap` はフォントメトリクスに依存するため、Webフォントの読み込み前は正確な値が計算できない。

```css
/* フォント読み込み前のレイアウトシフト対策 */
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  font-display: swap; /* フォント読み込み中はフォールバックフォント */
}

.text {
  font-family: 'CustomFont', sans-serif;
  padding: 0.5cap; /* フォールバックフォントの cap が一時的に使われる */
}
```

**対策:**
- `font-display: swap` でフォント読み込み中のフォールバック
- `size-adjust` で font-size を調整してレイアウトシフトを軽減

## よくある質問

### Q1. cap はどの文字を基準にするのか？

**A:** 大文字「H」の高さが基準（フォントのメトリクス定義による）。

### Q2. 日本語フォントでも使えるのか？

**A:** はい、ただし日本語フォントは欧文フォントと異なるメトリクスを持つため、期待通りにならない場合がある。

```css
/* 欧文と日本語でフォントを分ける */
.text {
  font-family: 'Roboto', 'Noto Sans JP', sans-serif;
}

/* 英字部分のみ cap 単位で調整 */
.text::first-letter {
  font-size: 2cap; /* ドロップキャップ */
}
```

### Q3. cap と ch（文字幅）の違いは？

**A:**
- `cap`: 大文字の高さ（垂直方向）
- `ch`: 文字「0」の幅（水平方向）

```css
/* ch: 文字幅ベース */
.input {
  width: 20ch; /* "0" 20個分の幅 */
}

/* cap: 大文字高さベース */
.input {
  height: 3cap; /* 大文字高さの3倍 */
}
```

### Q4. 古いブラウザでのフォールバックは？

**A:** `@supports` でフォールバックを実装。

```css
/* デフォルト: em 単位 */
.btn {
  padding: 0.5em 1em;
}

/* cap 対応ブラウザ */
@supports (padding: 1cap) {
  .btn {
    padding: 0.75cap 1.5cap;
  }
}
```

## まとめ

`cap` 単位は、大文字高さを基準とした精密なタイポグラフィ調整を可能にする。

**使用すべきケース:**
- アイコンとテキストの垂直揃え
- 大文字中心のUI（ボタン、バッジ、ラベル）
- タイポグラフィスケールの統一

**注意点:**
- Webフォント読み込み前は不正確な値になる
- 日本語フォントでは期待通りにならない場合がある
- `@supports` でフォールバックを実装

**比較表:**

| 単位 | 基準 | 用途 |
|------|------|------|
| `em` | font-size | 全体的なスケーリング |
| `rem` | root font-size | グローバルなスケーリング |
| `cap` | 大文字高さ | 垂直方向の精密調整 |
| `ex` | 小文字高さ | 小文字中心の調整 |
| `lh` | 行高さ | 行間の調整 |
| `ch` | 文字幅 | 水平方向の調整 |

## 関連ナレッジ

- [lh 単位](./lh-unit.md)
- [ex 単位](./ex-unit.md)
- [ch 単位](./ch-unit.md)
- [Fluid Typography](./fluid-typography.md)
- [Webフォント最適化](./webfont-optimization.md)

## 参考資料

- [Ahmad Shadeed: CSS cap unit](https://ishadeed.com/article/css-cap-unit/)
- [MDN: CSS length units](https://developer.mozilla.org/en-US/docs/Web/CSS/length)
- [Can I use: cap unit](https://caniuse.com/mdn-css_types_length_cap)
- [Font metrics explained](https://www.smashingmagazine.com/2020/07/css-techniques-legibility/)
