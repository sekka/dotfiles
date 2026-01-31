---
title: shape() 関数
category: css/visual
tags: [shape, clip-path, responsive, percentage, 2026]
browser_support: Safari 19.0+
created: 2026-01-31
updated: 2026-01-31
---

# shape() 関数

> 出典: https://gihyo.jp/article/2026/01/misskey-22
> 執筆日: 2026年1月26日
> 追加日: 2026-01-31

パーセンテージ座標でレスポンシブな図形を定義できるCSS関数。`clip-path` や `shape-outside` で使用します。

## 概要

従来の `path()` 関数は絶対座標での定義が必要でしたが、`shape()` ではパーセンテージ座標が使用でき、要素のサイズに応じて自動的にスケールします。

## 基本的な使い方

```css
.element {
  clip-path: shape(
    from 0% 0%,
    line to 100% 0%,
    line to 100% 100%,
    line to 0% 100%,
    close
  );
}
```

## 構文

```css
shape(<fill-rule>, <shape-command>+)
```

### shape-command

| コマンド | 説明 |
|---------|------|
| `move to <x> <y>` | ペンを移動 |
| `line to <x> <y>` | 直線を描画 |
| `curve to <x> <y> using <x1> <y1>` | 2次ベジェ曲線 |
| `curve to <x> <y> using <x1> <y1> <x2> <y2>` | 3次ベジェ曲線 |
| `arc to <x> <y> of <rx> <ry>` | 円弧を描画 |
| `close` | パスを閉じる |

## ユースケース

### 三角形のクリップ

```css
.triangle {
  width: 200px;
  height: 200px;
  background: #667eea;
  clip-path: shape(
    from 50% 0%,
    line to 100% 100%,
    line to 0% 100%,
    close
  );
}
```

### 吹き出し

```css
.speech-bubble {
  width: 300px;
  padding: 20px;
  background: white;
  clip-path: shape(
    from 0% 0%,
    line to 90% 0%,
    line to 100% 50%,
    line to 90% 100%,
    line to 0% 100%,
    close
  );
}
```

### レスポンシブな波形

```css
.wave-shape {
  clip-path: shape(
    from 0% 0%,
    line to 100% 0%,
    curve to 100% 100% using 75% 80%,
    curve to 0% 100% using 25% 120%,
    close
  );
}
```

## 実践例

### ダイアモンド形のカード

```html
<div class="diamond-card">
  <img src="photo.jpg" alt="Photo">
</div>
```

```css
.diamond-card {
  width: 300px;
  height: 300px;
  clip-path: shape(
    from 50% 0%,
    line to 100% 50%,
    line to 50% 100%,
    line to 0% 50%,
    close
  );
}

.diamond-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### 矢印ボタン

```css
.arrow-button {
  padding: 12px 24px 12px 16px;
  background: #007aff;
  color: white;
  clip-path: shape(
    from 0% 0%,
    line to 90% 0%,
    line to 100% 50%,
    line to 90% 100%,
    line to 0% 100%,
    close
  );
}
```

### テキストラップ（shape-outside）

```css
.shaped-float {
  float: left;
  width: 200px;
  height: 200px;
  shape-outside: shape(
    from 0% 0%,
    curve to 100% 0% using 50% -20%,
    line to 100% 100%,
    line to 0% 100%,
    close
  );
}
```

## path() との比較

### path()（従来）

```css
/* 絶対座標 - 固定サイズのみ対応 */
.element {
  clip-path: path('M 0 0 L 200 0 L 200 200 L 0 200 Z');
}
```

**問題点**:
- サイズ変更に対応しない
- レスポンシブデザインに不向き

### shape()（新しい方法）

```css
/* パーセンテージ座標 - 自動スケール */
.element {
  clip-path: shape(
    from 0% 0%,
    line to 100% 0%,
    line to 100% 100%,
    line to 0% 100%,
    close
  );
}
```

**利点**:
- 要素のサイズに自動対応
- レスポンシブデザインに最適

## 複雑な形状の例

### ハート形

```css
.heart {
  width: 200px;
  height: 200px;
  background: crimson;
  clip-path: shape(
    from 50% 30%,
    curve to 100% 0% using 75% 0%,
    curve to 100% 50% using 100% 25%,
    line to 50% 100%,
    line to 0% 50%,
    curve to 0% 0% using 0% 25%,
    curve to 50% 30% using 25% 0%,
    close
  );
}
```

### 星形

```css
.star {
  width: 200px;
  height: 200px;
  background: gold;
  clip-path: shape(
    from 50% 0%,
    line to 61% 35%,
    line to 98% 35%,
    line to 68% 57%,
    line to 79% 91%,
    line to 50% 70%,
    line to 21% 91%,
    line to 32% 57%,
    line to 2% 35%,
    line to 39% 35%,
    close
  );
}
```

## ブラウザサポート

| ブラウザ | バージョン | リリース日 |
|----------|-----------|----------|
| Safari | 19.0+ | 2025年予定 |
| Chrome | 未対応 | 検討中 |
| Firefox | 未対応 | 検討中 |
| Edge | 未対応 | 検討中 |

**現状**: Safariのみ実装予定。仕様は草案段階。

## フォールバック

```css
/* フォールバック: polygon() を使用 */
.element {
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
}

/* Safari 19+ */
@supports (clip-path: shape(from 0% 0%, close)) {
  .element {
    clip-path: shape(
      from 50% 0%,
      line to 100% 100%,
      line to 0% 100%,
      close
    );
  }
}
```

## パフォーマンス

`clip-path` は合成レイヤーで処理されるため、パフォーマンスは良好です。ただし、複雑な曲線を大量に使用する場合は注意が必要です。

## アニメーション

```css
.animated-shape {
  clip-path: shape(
    from 50% 0%,
    line to 100% 100%,
    line to 0% 100%,
    close
  );
  transition: clip-path 0.3s ease;
}

.animated-shape:hover {
  clip-path: shape(
    from 50% 20%,
    line to 90% 100%,
    line to 10% 100%,
    close
  );
}
```

**注意**: `shape()` から `shape()` へのアニメーションは、コマンド数が同じ場合にのみ動作します。

## ツール

### Clippy

[Clippy](https://bennettfeely.com/clippy/) などのオンラインツールで、将来的に `shape()` をサポートする可能性があります。

### Figma プラグイン

SVGパスを `shape()` 構文に変換するプラグインが登場する可能性があります。

## 関連ナレッジ

- [clip-path](./clip-path.md)
- [corner-shape](./corner-shape.md)
- [polygon()](./polygon-function.md)
- [shape-outside](./shape-outside.md)

## 参考リソース

- [CSS Shapes Level 2: shape()](https://drafts.csswg.org/css-shapes-2/#shape-function)
- [MDN: Basic Shapes](https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape)
