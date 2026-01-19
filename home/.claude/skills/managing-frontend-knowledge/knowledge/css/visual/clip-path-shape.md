---
title: clip-path の shape() 関数
category: css/visual
tags: [clip-path, shape, mask, border-radius, modern-css, 2025]
browser_support: 最新ブラウザで順次対応中
created: 2026-01-19
updated: 2026-01-19
---

# clip-path の shape() 関数

> 出典: https://zenn.dev/achamaro/articles/5cfbaad7fef44c
> 執筆日: 2025年7月7日
> 追加日: 2026-01-19

CSS `clip-path` プロパティの新しい `shape()` 関数を使った角丸マスキング手法。従来の SVG ベースのマスク処理に代わる、より簡潔な実装方法。

## 基本的な使い方

### 従来の方法（SVG）

```css
/* ❌ 従来は SVG で複雑な記述が必要 */
.element {
  clip-path: url(#custom-shape);
}
```

### shape() を使った方法

```css
/* ✅ shape() でシンプルに記述 */
.element {
  clip-path: shape(from 0% 0%, line to 100% 0%, smooth to 100% 100%, line to 0% 100%);
}
```

## smooth キーワードによる角丸

`smooth` キーワードを使用すると、ベジェ曲線で滑らかな角丸を実現できます。

```css
.card {
  clip-path: shape(
    from 0% 0%,
    line to 100% 0%,
    smooth to 100% 100%,  /* 右下を角丸 */
    line to 0% 100%,
    smooth to 0% 0%       /* 左上を角丸 */
  );
}
```

## カスタムプロパティとの組み合わせ

```css
.mask {
  --size: 20px;
  clip-path: shape(
    from var(--size) 0%,
    smooth to 100% var(--size),
    smooth to calc(100% - var(--size)) 100%,
    smooth to 0% calc(100% - var(--size))
  );
}

/* Tailwind CSS との統合例 */
@utility mask-* {
  --size: --value(--radius-*);
}
```

## 重要な制限事項

### %指定での楕円問題

```css
/* ❌ % 指定では縦横それぞれが基準になるため楕円になる */
.element {
  width: 300px;
  height: 150px;
  clip-path: shape(smooth 10% 10%);
  /* 横30px、縦15pxの異なる半径になる */
}
```

### 解決策：コンテナクエリ単位を使用

```css
/* ✅ cqmin を使って正円を維持 */
.element {
  container-type: size;
  clip-path: shape(smooth 50cqmin 50cqmin);
  /* 常に短辺を基準にするため正円 */
}
```

## コード例

### 基本的な角丸カード

```css
.card {
  container-type: size;
  clip-path: shape(
    from 0% 0%,
    line to 100% 0%,
    smooth 50cqmin 50cqmin to 100% 100%,
    line to 0% 100%
  );
}
```

### 複数の角を個別に制御

```css
.custom-shape {
  container-type: size;
  --radius-tl: 20cqmin; /* 左上 */
  --radius-tr: 10cqmin; /* 右上 */
  --radius-br: 30cqmin; /* 右下 */
  --radius-bl: 5cqmin;  /* 左下 */

  clip-path: shape(
    from 0% 0%,
    smooth var(--radius-tr) var(--radius-tr) to 100% 0%,
    smooth var(--radius-br) var(--radius-br) to 100% 100%,
    smooth var(--radius-bl) var(--radius-bl) to 0% 100%,
    smooth var(--radius-tl) var(--radius-tl) to 0% 0%
  );
}
```

## ユースケース

- 複雑な形状のカードデザイン
- 画像の動的なマスキング
- アニメーション対応の形状変化
- SVG を使わない軽量なマスク実装

## 注意点

- **ブラウザサポート**: `shape()` は比較的新しい仕様のため、最新ブラウザの対応を確認する必要があります
- **fallback**: 非対応ブラウザ向けに `border-radius` や従来の `clip-path: polygon()` を併用することを推奨
- **パフォーマンス**: 複雑な `shape()` はレンダリング負荷が高くなる可能性があるため、必要に応じて最適化を検討

## フォールバック戦略

```css
/* 非対応ブラウザ用 */
.element {
  border-radius: 20px;
}

/* shape() 対応ブラウザ */
@supports (clip-path: shape(from 0% 0%)) {
  .element {
    border-radius: 0;
    clip-path: shape(smooth 50cqmin 50cqmin);
  }
}
```

## 参考

- [CSS Shapes Module Level 2](https://drafts.csswg.org/css-shapes-2/)
- [MDN: clip-path](https://developer.mozilla.org/ja/docs/Web/CSS/clip-path)

---
