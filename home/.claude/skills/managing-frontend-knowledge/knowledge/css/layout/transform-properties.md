---
title: 独立したCSSトランスフォームプロパティ
category: css/layout
tags: [transform, translate, rotate, scale, modern-css, 2025]
browser_support: Chrome 104+, Firefox 72+, Safari 14.1+
created: 2025-01-16
updated: 2026-01-19
---

# 独立したCSSトランスフォームプロパティ

> 出典:
> - https://www.tak-dcxi.com/article/are-you-still-using-the-transform-property (2025年)
> - https://zenn.dev/necscat/articles/bc9bba54babaf5 (2024年)
> 追加日: 2025-12-17
> 更新日: 2026-01-19

従来の`transform`プロパティから独立した`translate`、`rotate`、`scale`プロパティへの移行ガイド。傾斜(skew)以外は独立したプロパティで指定できます。

## 従来の方法の問題点

```css
/* ❌ 従来の方法 */
.button {
  transform: translateY(0);
  transition: transform 0.2s;
}

.button:hover {
  /* 全体を上書きする必要がある */
  transform: translateY(-4px) scale(1.05);
}
```

**問題点**: 一部の変形のみを変更する場合でも、すべての変形を再指定する必要があります。

## 独立したプロパティ

### 基本的な使い方

```css
/* ✅ 独立したプロパティ */
.button {
  translate: 0 0;
  scale: 1;
  rotate: 0deg;
  transition: translate 0.2s, scale 0.2s;
}

.button:hover {
  /* 必要な部分のみ変更 */
  translate: 0 -4px;
  scale: 1.05;
}
```

## プロパティ別の詳細

### translate

```css
/* X軸のみ */
.element {
  translate: 100px;
}

/* X軸とY軸 */
.element {
  translate: 100px 50px;
}

/* X軸、Y軸、Z軸 */
.element {
  translate: 100px 50px 10px;
}

/* パーセンテージも使用可能 */
.element {
  translate: 50% 0;
}
```

**transform との対応**:

| translate | transform |
|-----------|-----------|
| `translate: 100px` | `transform: translateX(100px)` |
| `translate: 100px 50px` | `transform: translate(100px, 50px)` |
| `translate: 100px 50px 10px` | `transform: translate3d(100px, 50px, 10px)` |

### rotate

```css
/* 2D回転 */
.element {
  rotate: 90deg;
}

/* 3D回転（X軸） */
.element {
  rotate: x 45deg;
}

/* 3D回転（Y軸） */
.element {
  rotate: y 45deg;
}

/* 3D回転（Z軸） */
.element {
  rotate: z 90deg;
}

/* 3D回転（任意の軸） */
.element {
  rotate: 1 1 0 45deg;
}
```

**transform との対応**:

| rotate | transform |
|--------|-----------|
| `rotate: 90deg` | `transform: rotate(90deg)` |
| `rotate: x 45deg` | `transform: rotateX(45deg)` |
| `rotate: y 45deg` | `transform: rotateY(45deg)` |
| `rotate: z 90deg` | `transform: rotateZ(90deg)` |

### scale

```css
/* 等倍スケール */
.element {
  scale: 1.5;
}

/* X軸とY軸を個別に指定 */
.element {
  scale: 1.5 0.8;
}

/* X軸、Y軸、Z軸 */
.element {
  scale: 1.5 0.8 2;
}
```

**transform との対応**:

| scale | transform |
|-------|-----------|
| `scale: 1.5` | `transform: scale(1.5)` |
| `scale: 1.5 0.8` | `transform: scale(1.5, 0.8)` |
| `scale: 1.5 0.8 2` | `transform: scale3d(1.5, 0.8, 2)` |

## skewには独立プロパティがない

```css
/* skewは従来のtransformを使用 */
.element {
  transform: skewX(10deg);
}

/* 他の変形と組み合わせる場合 */
.element {
  translate: 0 -4px;
  scale: 1.05;
  transform: skewX(10deg);
}
```

**注意**: skewと他のプロパティを併用する場合、適用順序に注意が必要です。

## 実装パターン

### ボタンのホバーアニメーション

```css
.button {
  translate: 0 0;
  scale: 1;
  transition: translate 0.2s, scale 0.2s;
}

.button:hover {
  translate: 0 -2px;
  scale: 1.05;
}

.button:active {
  translate: 0 1px;
  scale: 0.98;
}
```

### カードのホバーアニメーション

```css
.card {
  translate: 0 0;
  transition: translate 0.3s ease-out;
}

.card:hover {
  translate: 0 -8px;
}
```

### シェブロンの移動

```css
.button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.button-icon {
  translate: 0 0;
  transition: translate 0.2s;
}

.button:hover .button-icon {
  translate: 4px 0; /* 右に移動 */
}
```

### ローディングスピナー

```css
@keyframes spin {
  to {
    rotate: 360deg;
  }
}

.spinner {
  rotate: 0deg;
  animation: spin 1s linear infinite;
}
```

### モーダルの表示アニメーション

```css
.modal {
  translate: 0 100vh;
  scale: 0.9;
  opacity: 0;
  transition:
    translate 0.3s ease-out,
    scale 0.3s ease-out,
    opacity 0.3s;
}

.modal[open] {
  translate: 0 0;
  scale: 1;
  opacity: 1;
}
```

## transformとの併用

独立したプロパティと`transform`は併用できます。

```css
.element {
  translate: 100px 0;
  scale: 1.5;
  transform: skewX(10deg);
}
```

**適用順序**: `translate` → `rotate` → `scale` → `transform`

## 利点

### 1. 部分的な更新が容易

```css
/* ✅ 必要な部分のみ変更 */
.button:hover {
  translate: 0 -4px;
  /* scaleやrotateは変更不要 */
}

/* ❌ 従来の方法：全体を再指定 */
.button:hover {
  transform: translateY(-4px) scale(1) rotate(0deg);
}
```

### 2. アニメーションの制御が簡単

```css
.element {
  transition: translate 0.2s, scale 0.3s;
}

.element:hover {
  translate: 0 -4px;
  scale: 1.1;
}
```

各変形に異なるトランジション時間を設定できます。

### 3. 可読性の向上

```css
/* ✅ 意図が明確 */
.element {
  translate: 100px 0;
  scale: 1.5;
  rotate: 45deg;
}

/* ❌ 一行に詰め込まれている */
.element {
  transform: translateX(100px) scale(1.5) rotate(45deg);
}
```

## 実装時の注意点

### 1. X軸Y軸の両方を指定する必要がある場合

```css
/* translate */
.element {
  translate: 100px 0; /* X軸とY軸を両方指定 */
}

/* scale */
.element {
  scale: 1.5 1; /* X軸とY軸を両方指定 */
}
```

`translate`や`scale`には軸ごとの個別プロパティがないため、両方を明示する必要があります。

### 2. skewの扱い

```css
/* skewには独立プロパティがない */
.element {
  translate: 100px 0;
  transform: skewX(10deg);
}
```

### 3. パフォーマンス

独立したプロパティでも、GPUアクセラレーションは同様に機能します。

```css
/* どちらもGPUアクセラレーションされる */
.element {
  translate: 0 0; /* ✅ */
  transform: translateY(0); /* ✅ */
}
```

### 4. transition-propertyの指定

```css
.element {
  transition-property: translate, scale, rotate;
  transition-duration: 0.2s;
}
```

各プロパティを個別に指定する必要があります。

## ブラウザ対応

| ブラウザ | translate | rotate | scale |
|---------|-----------|--------|-------|
| Chrome | 104+ | 104+ | 104+ |
| Edge | 104+ | 104+ | 104+ |
| Firefox | 72+ | 72+ | 72+ |
| Safari | 14.1+ | 14.1+ | 14.1+ |

**iOS Safari**: 14.5以降で利用可能

## 移行ガイド

### ステップ1: 単純な置き換え

```css
/* 変更前 */
.element {
  transform: translateY(10px);
}

/* 変更後 */
.element {
  translate: 0 10px;
}
```

### ステップ2: 複数の変形を分離

```css
/* 変更前 */
.element {
  transform: translateY(10px) scale(1.1) rotate(5deg);
}

/* 変更後 */
.element {
  translate: 0 10px;
  scale: 1.1;
  rotate: 5deg;
}
```

### ステップ3: アニメーションの最適化

```css
/* 変更前 */
.element {
  transform: translateY(0);
  transition: transform 0.2s;
}

.element:hover {
  transform: translateY(-4px) scale(1.05);
}

/* 変更後 */
.element {
  translate: 0 0;
  scale: 1;
  transition: translate 0.2s, scale 0.2s;
}

.element:hover {
  translate: 0 -4px;
  scale: 1.05;
}
```

## 関連ナレッジ

- [時代遅れのCSS技術](../outdated-techniques.md)
- [CSSアニメーション基礎](../animation/animation-basics.md)
- [View Transitions](../animation/view-transitions.md)

## 参考リンク

- [MDN: translate](https://developer.mozilla.org/en-US/docs/Web/CSS/translate)
- [MDN: rotate](https://developer.mozilla.org/en-US/docs/Web/CSS/rotate)
- [MDN: scale](https://developer.mozilla.org/en-US/docs/Web/CSS/scale)
- [Can I use: CSS individual transform properties](https://caniuse.com/mdn-css_properties_translate)
