---
title: Augmented UI デザインの実装（clip-path & mask）
category: css/visual
tags: [clip-path, mask, mask-composite, grid, advanced, 2024]
browser_support: Firefox（最良）, Chrome/Safari（一部バグあり）
created: 2026-01-19
updated: 2026-01-19
---

# Augmented UI デザインの実装

> 出典: https://zenn.dev/ixkaito/articles/augmented-ui
> 執筆日: 2024年9月17日
> 追加日: 2026-01-19

CSS の `clip-path`、`mask`、`mask-composite` を組み合わせて、複雑な Augmented UI（拡張UI）デザインを実装する方法。画像の切り抜きや特殊な形状のコンポーネントを CSS のみで実現できます。

## 基本コンセプト

2×2 のグリッドレイアウトで画像を配置し、CSS マスクで複雑な形状を作り出します。

### HTML 構造

```html
<div class="container">
  <img src="image.jpg" alt="" class="image image-1">
  <img src="image.jpg" alt="" class="image image-2">
  <img src="image.jpg" alt="" class="image image-3">
  <img src="image.jpg" alt="" class="image image-4">
  <div class="text">
    <h2>タイトル</h2>
    <p>説明文...</p>
  </div>
</div>
```

## 実装テクニック

### 1. Grid レイアウトによる配置

```css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  width: 600px;
  height: 400px;
  position: relative;
}
```

### 2. 画像の絶対配置と重ね合わせ

```css
.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
}
```

### 3. clip-path による基本的な切り抜き

```css
/* Chrome のバグ対応: -1px でレンダリング問題を回避 */
.image-1 {
  clip-path: inset(-1px 50% 50% -1px);
}

.image-2 {
  clip-path: inset(-1px -1px 50% 50%);
}

.image-3 {
  clip-path: inset(50% 50% -1px -1px);
}

.image-4 {
  clip-path: inset(50% -1px -1px 50%);
}
```

### 4. mask による複雑な形状の実現

#### SVG データ URL による円形マスク

```css
.image {
  --circle-mask: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50%" cy="50%" r="40%"/></svg>');
  mask: var(--circle-mask);
}
```

#### 扇形マスクの作成

```css
.image {
  --sector-mask: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><path d="M 50% 50% L 100% 0% A 50% 50% 0 0 1 100% 100% Z"/></svg>');
  mask: var(--sector-mask);
}
```

### 5. mask-composite による形状の合成

```css
.image-1 {
  mask-image:
    linear-gradient(#000 0 0),  /* 矩形マスク */
    var(--circle-mask);          /* 円形マスク */
  mask-composite: subtract;      /* 円形を矩形から引く */
}
```

#### Firefox vs Safari/Chrome の違い

```css
/* Firefox: 仕様通りの動作 */
.image {
  mask-composite: subtract;
}

/* Safari: exclude のような動作（バグ） */
.image {
  mask-composite: subtract; /* 結果は同じでも内部処理が異なる */
}
```

### 6. テキスト領域に応じた動的な切り抜き

```css
.text {
  grid-column: 1 / 3;
  grid-row: 2 / 3;
  padding: 20px;
  z-index: 1;
}

/* テキスト量が増えると画像の切り抜きも変化 */
.image-3,
.image-4 {
  mask: linear-gradient(to bottom,
    transparent 0%,
    transparent calc(50% + var(--text-height)),
    #000 calc(50% + var(--text-height))
  );
}
```

## 実践的な応用例

### 角丸付きの斜め切り抜き

```css
.augmented-card {
  clip-path: inset(-1px);
  mask-image:
    linear-gradient(#000 0 0),
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><circle cx="80%" cy="20%" r="15%"/></svg>');
  mask-composite: subtract;
}
```

### レスポンシブ対応

```css
@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }

  .image {
    clip-path: inset(-1px);
    mask: none; /* モバイルではシンプルな表示 */
  }
}
```

## ブラウザ互換性と注意点

### ブラウザサポート

| ブラウザ | 対応状況 | 備考 |
|---------|---------|------|
| Firefox | ✅ 最良 | 仕様通りの動作 |
| Chrome | ⚠️ 一部バグ | `clip-path` と `mask-composite` にバグあり |
| Safari | ⚠️ 一部バグ | `mask-composite` が `exclude` のように動作 |

### Chrome のバグ対処

```css
/* ❌ Chrome でレンダリングバグ */
.image {
  clip-path: inset(0 50% 50% 0);
}

/* ✅ -1px でバグを回避 */
.image {
  clip-path: inset(-1px 50% 50% -1px);
}
```

### ネガティブマージンによる小数値問題の回避

```css
.container {
  margin: -1px; /* 小数点以下のピクセルずれを吸収 */
}
```

## ユースケース

- ゲームUI風のデザイン
- SF/サイバーパンク系のデザイン
- 複雑な形状のカードコンポーネント
- ダイナミックな画像レイアウト
- テキスト量に応じて変化するデザイン

## パフォーマンス考慮事項

- 複雑な `mask` はレンダリング負荷が高い
- アニメーション時は `will-change` を検討
- モバイルではシンプルなフォールバックを提供

```css
/* パフォーマンス最適化 */
.augmented-element {
  will-change: mask-position;
}

/* アニメーション終了後はリセット */
.augmented-element:not(:hover) {
  will-change: auto;
}
```

## 参考リソース

- [MDN: clip-path](https://developer.mozilla.org/ja/docs/Web/CSS/clip-path)
- [MDN: mask](https://developer.mozilla.org/ja/docs/Web/CSS/mask)
- [MDN: mask-composite](https://developer.mozilla.org/ja/docs/Web/CSS/mask-composite)

---
