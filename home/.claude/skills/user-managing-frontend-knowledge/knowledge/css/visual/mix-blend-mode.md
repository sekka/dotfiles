---
title: mix-blend-mode
category: css/visual
tags: [mix-blend-mode, blend, visual-effects, composition]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# mix-blend-mode

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

要素と背景の合成モード。

## 基本的な使い方

```css
.overlay-text {
  mix-blend-mode: difference;
  color: white;
}

.multiply {
  mix-blend-mode: multiply;
}
```

## 合成モード一覧

| モード | 説明 | 用途 |
|--------|------|------|
| `normal` | 通常（デフォルト） | - |
| `multiply` | 乗算 | 暗い合成 |
| `screen` | スクリーン | 明るい合成 |
| `overlay` | オーバーレイ | コントラスト強調 |
| `darken` | 比較（暗） | 暗い方を採用 |
| `lighten` | 比較（明） | 明るい方を採用 |
| `color-dodge` | 覆い焼き | ハイライト強調 |
| `color-burn` | 焼き込み | シャドウ強調 |
| `hard-light` | ハードライト | 強いコントラスト |
| `soft-light` | ソフトライト | 柔らかいコントラスト |
| `difference` | 差の絶対値 | 反転効果 |
| `exclusion` | 除外 | 低コントラスト反転 |
| `hue` | 色相 | 色相のみ適用 |
| `saturation` | 彩度 | 彩度のみ適用 |
| `color` | カラー | 色相+彩度を適用 |
| `luminosity` | 輝度 | 輝度のみ適用 |

## ユースケース

### テキストの反転効果

```css
.hero-text {
  position: fixed;
  color: white;
  mix-blend-mode: difference;
  /* 背景に応じて色が反転 */
}
```

### 画像オーバーレイ

```css
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ff6b6b;
  mix-blend-mode: multiply;
  opacity: 0.7;
}
```

### デュオトーン効果

```css
.duotone {
  position: relative;
}

.duotone::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  mix-blend-mode: color;
}
```

## パフォーマンス

合成モードは GPU で処理されるため、パフォーマンスは良好。ただし多用すると負荷が高くなる。

## 関連ナレッジ

- [filter](./filter.md)
- [backdrop-filter](./backdrop-filter.md)
