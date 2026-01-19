---
title: SVG フィルターを使った画像加工
category: css/visual
tags: [svg, filter, image-processing, effects, 2024]
browser_support: Chrome, Edge, Safari, Firefox（ブラウザごとに結果が若干異なる）
created: 2026-01-19
updated: 2026-01-19
---

# SVG フィルターを使った画像加工

> 出典: https://ics.media/entry/241122/
> 執筆日: 2024年11月29日
> 追加日: 2026-01-19

SVG フィルターエフェクトを使った8つの実践的な画像加工テクニック集。CSS の `filter` プロパティ経由で適用でき、コピペで使えます。

## 基本的な使い方

### HTML 構造

```html
<svg width="0" height="0" xmlns="http://www.w3.org/2000/svg">
  <filter id="filter-name">
    <!-- SVG フィルター要素 -->
  </filter>
</svg>

<img src="image.jpg" alt="" style="filter: url(#filter-name)">
```

### CSS での適用

```css
.image {
  filter: url(#filter-name);
}
```

## 実践的なフィルター8選

### 1. 粒状ノイズフィルター

テクスチャ感を追加するノイズエフェクト。

```html
<svg xmlns="http://www.w3.org/2000/svg">
  <filter id="grainy-noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4"/>
    <feBlend mode="multiply" in2="SourceGraphic"/>
  </filter>
</svg>
```

**パラメータ:**
- `baseFrequency`: ノイズの細かさ（大きいほど細かい）
- `numOctaves`: ノイズの複雑さ（大きいほど複雑）

### 2. ガラスエフェクト

歪み効果でガラス越しのような見た目に。

```html
<svg xmlns="http://www.w3.org/2000/svg">
  <filter id="glass-effect">
    <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/>
    <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="20" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>
```

**パラメータ:**
- `scale`: 歪みの強さ（大きいほど強い）

### 3. 波打ち/揺らぎフィルター

色チャンネルの分離と変位マッピングを組み合わせた効果。

```html
<svg xmlns="http://www.w3.org/2000/svg">
  <filter id="wave-sway">
    <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="2" result="noise"/>
    <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"/>
    <feDisplacementMap in="red" in2="noise" scale="5" xChannelSelector="R"/>
  </filter>
</svg>
```

### 4. 和紙テクスチャ効果

照明効果でテクスチャを追加。

```html
<svg xmlns="http://www.w3.org/2000/svg">
  <filter id="washi-paper">
    <feTurbulence type="fractalNoise" baseFrequency="2" numOctaves="3" result="noise"/>
    <feDiffuseLighting in="noise" lighting-color="white" surfaceScale="1">
      <feDistantLight azimuth="45" elevation="60"/>
    </feDiffuseLighting>
    <feBlend mode="multiply" in2="SourceGraphic"/>
  </filter>
</svg>
```

### 5. ポスタリゼーション

色数を減らしてポスター風に。

```html
<svg xmlns="http://www.w3.org/2000/svg">
  <filter id="posterize">
    <feComponentTransfer>
      <feFuncR type="discrete" tableValues="0 0.25 0.5 0.75 1"/>
      <feFuncG type="discrete" tableValues="0 0.25 0.5 0.75 1"/>
      <feFuncB type="discrete" tableValues="0 0.25 0.5 0.75 1"/>
    </feComponentTransfer>
  </filter>
</svg>
```

**カスタマイズ:**
- `tableValues` の値の数が色段階数（上記は5段階）

### 6. グリッチノイズ

色ずれとノイズでグリッチ効果。

```html
<svg xmlns="http://www.w3.org/2000/svg">
  <filter id="glitch-noise">
    <feTurbulence baseFrequency="0.01 0.5" numOctaves="3" result="noise"/>
    <feColorMatrix in="SourceGraphic" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"/>
    <feOffset in="red" dx="3" result="red-offset"/>
    <feDisplacementMap in="red-offset" in2="noise" scale="10"/>
  </filter>
</svg>
```

### 7. ピクセルアート風

タイル化とモーフォロジーでドット絵風に。

```html
<svg xmlns="http://www.w3.org/2000/svg">
  <filter id="pixel-art">
    <feTile in="SourceGraphic" result="tiled"/>
    <feMorphology operator="dilate" radius="2" in="tiled"/>
  </filter>
</svg>
```

**パラメータ:**
- `radius`: ピクセルサイズ（大きいほど粗い）

### 8. 新聞の網点

画像の輝度に応じたドットパターン。

```html
<svg xmlns="http://www.w3.org/2000/svg">
  <filter id="halftone">
    <feColorMatrix type="luminanceToAlpha"/>
    <feTurbulence type="fractalNoise" baseFrequency="30"/>
    <feComponentTransfer>
      <feFuncA type="discrete" tableValues="0 1"/>
    </feComponentTransfer>
    <feComposite operator="in" in2="SourceGraphic"/>
  </filter>
</svg>
```

## 複数フィルターの組み合わせ

```html
<!-- 複数のフィルターを定義 -->
<filter id="combined-effect">
  <feTurbulence type="fractalNoise" baseFrequency="0.8"/>
  <feBlend mode="multiply" in2="SourceGraphic"/>
  <feComponentTransfer>
    <feFuncR type="discrete" tableValues="0 0.5 1"/>
    <feFuncG type="discrete" tableValues="0 0.5 1"/>
    <feFuncB type="discrete" tableValues="0 0.5 1"/>
  </feComponentTransfer>
</filter>
```

## ブラウザ互換性

| ブラウザ | 対応状況 | 備考 |
|---------|---------|------|
| Chrome | ✅ | 全機能対応 |
| Firefox | ✅ | 全機能対応 |
| Safari | ✅ | 全機能対応 |
| Edge | ✅ | 全機能対応 |

**注意**: ブラウザによってレンダリング結果が微妙に異なる場合があるため、実装前にテストを推奨。

## パフォーマンス考慮事項

```css
/* 複雑なフィルターはGPU加速を利用 */
.filtered-image {
  filter: url(#complex-filter);
  will-change: filter; /* アニメーション時のみ */
}

/* スクロール時のパフォーマンス対策 */
@media (prefers-reduced-motion: reduce) {
  .filtered-image {
    filter: none; /* フィルターを無効化 */
  }
}
```

## ユースケース

- アーティスティックな画像加工
- ビンテージ/レトロエフェクト
- クリエイティブなホバーエフェクト
- 背景テクスチャの生成
- ブランディング用の独特な視覚効果

## Tips

### フィルターの強度調整

```html
<filter id="adjustable-filter">
  <feTurbulence baseFrequency="0.8" result="noise"/>
  <feBlend mode="multiply" in2="SourceGraphic" result="blended"/>
  <feComponentTransfer>
    <feFuncA type="linear" slope="0.5"/> <!-- 透明度で強度調整 -->
  </feComponentTransfer>
</filter>
```

### レスポンシブ対応

```css
/* デスクトップのみでフィルター適用 */
@media (min-width: 768px) {
  .image {
    filter: url(#complex-filter);
  }
}

/* モバイルでは軽量なCSS filterを使用 */
@media (max-width: 767px) {
  .image {
    filter: grayscale(0.5) contrast(1.1);
  }
}
```

## 参考リソース

- [MDN: SVG Filters](https://developer.mozilla.org/ja/docs/Web/SVG/Element/filter)
- [SVG Filter Effects](https://www.w3.org/TR/filter-effects-1/)

---
