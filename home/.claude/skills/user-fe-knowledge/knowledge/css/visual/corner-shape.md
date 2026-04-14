---
title: corner-shape プロパティ
category: css/visual
tags: [corner-shape, squircle, border-radius, rounded-corners, 2026]
browser_support: Safari 18.2+
created: 2026-01-31
updated: 2026-01-31
---

# corner-shape プロパティ

> 出典: https://gihyo.jp/article/2026/01/misskey-22
> 執筆日: 2026年1月26日
> 追加日: 2026-01-31

角の形状を定義するCSSプロパティ。通常の円形の丸みだけでなく、「Squircle（スクワークル）」と呼ばれる滑らかな曲線も実現できます。

## 概要

`border-radius` で作成される通常の円弧とは異なる、より滑らかで自然な角の形状を定義できます。

## 基本的な使い方

```css
.element {
  border-radius: 20px;
  corner-shape: round; /* デフォルト */
}

.squircle {
  border-radius: 20px;
  corner-shape: squircle; /* Squircle形状 */
}
```

## corner-shape の値

| 値 | 説明 |
|----|------|
| `round` | 標準の円弧（デフォルト） |
| `squircle` | Squircle（超楕円曲線）|
| `angle` | 鋭角な角 |

## Squircle とは

**Squircle**（スクワークル）は「Square（正方形）」と「Circle（円）」を組み合わせた造語で、円よりも直線に近い部分が長く、角の部分で滑らかに曲がる形状です。

### 視覚的な違い

```css
/* 通常の丸み（円弧） */
.round {
  border-radius: 40px;
  corner-shape: round;
}

/* Squircle（より自然な曲線） */
.squircle {
  border-radius: 40px;
  corner-shape: squircle;
}
```

**特徴**:
- より有機的で自然な見た目
- Appleのデザイン言語で広く使用
- アイコン、カード、ボタンに最適

## ユースケース

### カード UI

```css
.card {
  width: 300px;
  height: 200px;
  border-radius: 24px;
  corner-shape: squircle;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### アイコン

```css
.app-icon {
  width: 80px;
  height: 80px;
  border-radius: 18px;
  corner-shape: squircle;
  overflow: hidden;
}
```

### ボタン

```css
.button {
  padding: 12px 24px;
  border-radius: 12px;
  corner-shape: squircle;
  background: #007aff;
  color: white;
}
```

## 実践例

### iOS風アイコングリッド

```html
<div class="app-grid">
  <div class="app-icon">📱</div>
  <div class="app-icon">⚙️</div>
  <div class="app-icon">📷</div>
</div>
```

```css
.app-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  corner-shape: squircle;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}
```

### モダンカードデザイン

```css
.product-card {
  border-radius: 32px;
  corner-shape: squircle;
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
```

## angle 値の使用

```css
.sharp-corner {
  border-radius: 20px;
  corner-shape: angle; /* 鋭角な角 */
}
```

**用途**: 幾何学的なデザイン、ダイヤモンド形状など。

## 従来の方法との比較

### SVGやクリップパス（従来）

```css
/* 複雑な clip-path が必要 */
.squircle-fallback {
  clip-path: path('M 0,20 C 0,5 5,0 20,0 L 80,0 C 95,0 100,5 100,20 L 100,80 C 100,95 95,100 80,100 L 20,100 C 5,100 0,95 0,80 Z');
}
```

### corner-shape（新しい方法）

```css
/* シンプルで直感的 */
.squircle-modern {
  border-radius: 20px;
  corner-shape: squircle;
}
```

## ブラウザサポート

| ブラウザ | バージョン | リリース日 |
|----------|-----------|----------|
| Safari | 18.2+ | 2024年12月 |
| Chrome | 未対応 | 検討中 |
| Firefox | 未対応 | 検討中 |
| Edge | 未対応 | 検討中 |

**現状**: Safariのみ実装。仕様は草案段階。

## フォールバック

```css
/* デフォルト: 通常の丸み */
.element {
  border-radius: 20px;
}

/* Safari 18.2+ */
@supports (corner-shape: squircle) {
  .element {
    corner-shape: squircle;
  }
}
```

### SVGフォールバック（より精密に）

```html
<svg class="squircle-bg" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" rx="20" />
</svg>
```

## アクセシビリティ

`corner-shape` は視覚的な装飾であり、アクセシビリティへの影響はありません。

## パフォーマンス

`border-radius` と同様、GPUアクセラレーションが効きます。大量の要素で使用してもパフォーマンス問題は少ないです。

## デザインシステムへの統合

```css
/* デザイントークン */
:root {
  --corner-radius-sm: 8px;
  --corner-radius-md: 16px;
  --corner-radius-lg: 24px;
  --corner-shape: squircle;
}

.card {
  border-radius: var(--corner-radius-lg);
  corner-shape: var(--corner-shape);
}
```

## 関連ナレッジ

- [border-radius](./border-radius.md)
- [clip-path](./clip-path.md)
- [shape()](./shape-function.md)
- [Apple Human Interface Guidelines](../../design-guidelines/hig/ios-design.md)

## 参考リソース

- [CSS Backgrounds and Borders Level 4: corner-shape](https://drafts.csswg.org/css-backgrounds-4/#corner-shaping)
- [Figma: Squircle plugin](https://www.figma.com/community/plugin/763070852025980606/Squircle)
