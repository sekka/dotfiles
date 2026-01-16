---
title: line-clamp と overflow: clip の組み合わせ
category: css/typography
tags: [line-clamp, overflow, text-truncation, hanging-punctuation, webkit]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# line-clamp と overflow: clip の組み合わせ

> 出典: https://yuheiy.com/2024-12-06-overflow-clip-for-line-clamp
> 執筆日: 2024年12月6日
> 追加日: 2025-01-16

`-webkit-line-clamp` と `hanging-punctuation` を組み合わせる際の正しい実装方法。

## 問題の背景

### 従来の実装（問題あり）

```css
p {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden; /* 問題: hanging-punctuation が切れる */
  hanging-punctuation: allow-end;
}
```

**問題点:**
- `overflow: hidden` を使うと `hanging-punctuation: allow-end` で行末に配置された句読点が視覚的に切れてしまう
- 約物（句読点）が意図した位置に表示されない

## 解決策: overflow: clip を使用

### 推奨実装

```css
p {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow-y: clip; /* overflow: hidden の代わりに clip を使用 */
  hanging-punctuation: allow-end;
}
```

**ポイント:**
- `overflow-y: clip` を使うことで、`hanging-punctuation` が正しく機能する
- `overflow: clip` だと水平方向にもclipが適用されてしまうため、`overflow-y: clip` が推奨

## 詳細な解説

### line-clamp の動作原理

`-webkit-line-clamp` は `overflow-y` だけで動作する。

```css
/* これでも動く */
p {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow-y: hidden; /* overflow-y だけで十分 */
}
```

### overflow: hidden の副作用

`overflow: hidden` を使うと、`overflow-x: hidden` も同時に適用される。

```css
/* overflow: hidden は以下と同じ */
overflow-x: hidden;
overflow-y: hidden;
```

**問題:**
- 水平方向のスクロールが可能になってしまう
- `hanging-punctuation` で行末からはみ出た句読点が切り取られる

### overflow-y: clip のメリット

```css
/* 推奨 */
overflow-y: clip;
```

- 垂直方向のみをクリップ
- 水平方向はそのまま（スクロール不可）
- `hanging-punctuation` が正しく表示される

## 比較例

### overflow: hidden（問題あり）

```css
.text-truncate-hidden {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  hanging-punctuation: allow-end;
}
```

```
結果: 「こんにちは、世界。」
      「今日はいい天気です。」
      「明日も晴れるでしょ... [句読点が切れる]
```

### overflow-y: clip（推奨）

```css
.text-truncate-clip {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow-y: clip;
  hanging-punctuation: allow-end;
}
```

```
結果: 「こんにちは、世界。」
      「今日はいい天気です。」
      「明日も晴れるでしょう。」 [句読点が正しく表示]
```

## ブラウザ対応

### overflow: clip

- Chrome 90+
- Firefox 81+
- Safari 16+

**フォールバック不要:** `overflow: hidden` からの移行でも問題なし（`clip` は `hidden` とほぼ同じ動作）

### hanging-punctuation

- Safari 10+
- Chrome/Edge: 未対応（プログレッシブエンハンスメント）
- Firefox: 未対応

**プログレッシブエンハンスメント:**
```css
p {
  /* 基本スタイル（全ブラウザ） */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow-y: clip;

  /* Safari でのみ効果あり */
  hanging-punctuation: allow-end;
}
```

## 完全な実装例

```css
.article-excerpt {
  /* 基本設定 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;

  /* overflow 制御 */
  overflow-y: clip; /* hidden ではなく clip */

  /* 行間・フォント設定 */
  line-height: 1.6;
  font-size: 1rem;

  /* 約物制御（Safari のみ） */
  hanging-punctuation: allow-end;

  /* 省略記号のカスタマイズ（実験的） */
  /* text-overflow: ellipsis; は line-clamp には不要 */
}
```

## 注意点

### text-overflow: ellipsis は不要

`-webkit-line-clamp` を使う場合、`text-overflow: ellipsis` は自動的に適用される。

```css
/* 不要な記述 */
p {
  -webkit-line-clamp: 3;
  text-overflow: ellipsis; /* 不要 */
}

/* 正しい記述 */
p {
  -webkit-line-clamp: 3; /* これだけで省略記号が表示される */
}
```

### overflow-x の挙動

`overflow-y: clip` を使っても、`overflow-x` は `visible` のまま。

```css
p {
  overflow-y: clip;
  /* overflow-x: visible; ← デフォルト */
}
```

これにより、水平方向のスクロールバーが表示されない。

## 関連ナレッジ

- [hanging-punctuation](./hanging-punctuation.md)
- [text-overflow](./text-overflow.md)
- [overflow プロパティ](../visual/overflow.md)
