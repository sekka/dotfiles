---
url: https://azukiazusa.dev/blog/sibling-index-css-function/
fetched_at: 2026-05-13
title: 兄弟要素のインデックスを返す CSS 関数 sibling-index()
---

# 兄弟要素のインデックスを返す CSS 関数 sibling-index()

**公開日**: 2026年5月6日

## 主要な技術ポイント

### sibling-index() と sibling-count() の基本機能
- `sibling-index()`: 要素の兄弟要素の中でのインデックスを返す（1 始まり）
- `sibling-count()`: 同じ親を持つ要素の総数を返す
- これまでは JavaScript か冗長な CSS カスタムプロパティが必要だった領域をカバー

### 利点
従来の `:nth-child()` は特定パターン選択に特化し、要素自身がインデックスを参照できなかった。`sibling-index()` により純粋な CSS で実現できる。

## コード例と実装パターン

### 1. スタッガーアニメーション
```css
li {
  opacity: 0;
  transform: translateX(-12px);
  animation: slide-in 0.5s ease-out forwards;
  animation-delay: calc(sibling-index() * 120ms);
}

@keyframes slide-in {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### 2. 色相の段階的変化（oklch で均等分散）
```css
li {
  --start: 200;
  --end: 320;
  background: oklch(
    65% 0.15
    calc(
      var(--start) + (var(--end) - var(--start)) /
      (sibling-count() - 1) * (sibling-index() - 1)
    )
  );
}
```
**ポイント**: `sibling-count()` で割って、要素数に関わらず均等に色相分散

### 3. 扇形配置
```css
.card {
  --spread: 60deg;
  --radius: 240px;
  --step: calc(var(--spread) / (sibling-count() - 1));
  --angle: calc(var(--step) * (sibling-index() - 1) - var(--spread) / 2);
  transform: rotate(var(--angle)) translateY(calc(var(--radius) * -1));
  transform-origin: bottom center;
}
```

### 4. 円形メニュー展開（新規パターン）
```css
.menu .item {
  --i: calc(sibling-index() - 1);
  --total: calc(sibling-count() - 1);
  --angle: calc(360deg / var(--total) * var(--i));
  --radius: 110px;
  --delay-step: 70ms;
  transform: rotate(var(--angle)) translateY(0) rotate(calc(var(--angle) * -1));
  opacity: 0;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)
    calc(var(--i) * var(--delay-step)),
    opacity 0.3s ease-out calc(var(--i) * var(--delay-step));
}

.menu:hover .item {
  transform: rotate(var(--angle)) translateY(calc(var(--radius) * -1))
    rotate(calc(var(--angle) * -1));
  opacity: 1;
}
```
**ポイント**: インデックスで遅延制御 + 角度計算で複合アニメーション。cubic-bezier(0.34, 1.56, 0.64, 1) で弾性のある展開

## 実装パターンの特徴

| パターン | 主用途 | 計算要素 |
|---------|--------|---------|
| スタッガー | 波状アニメーション | `sibling-index()` × 時間値 |
| 色相変化 | グラデーション表現 | 比例計算 ÷ `sibling-count()` |
| 扇形/円形 | 空間配置 | 角度 = 360deg ÷ `sibling-count()` |

## calc() との組み合わせの要点
- 四則演算で直接インデックスを利用可能
- `sibling-count()` による動的な要素数対応
- CSS カスタムプロパティと組み合わせで複雑な計算を構築
