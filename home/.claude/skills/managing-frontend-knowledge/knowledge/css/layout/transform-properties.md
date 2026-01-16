---
title: transform 独立プロパティ
category: css/layout
tags: [transform, translate, scale, rotate, animation]
browser_support: Chrome 104+, Safari 14.1+, Firefox 72+
created: 2025-01-16
updated: 2025-01-16
---

# transform 独立プロパティ

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

`transform` を分割して記述可能。個別にアニメーションできる。

## 基本的な使い方

```css
.element {
  translate: 10px 20px;
  scale: 1.5;
  rotate: 45deg;
}

/* 個別にアニメーション */
.element {
  transition: translate 0.3s, scale 0.2s;
}

.element:hover {
  translate: 0 -10px;
  scale: 1.1;
}
```

## 従来の方法との比較

```css
/* 従来: 全て一緒に指定 */
.element {
  transform: translateX(10px) translateY(20px) scale(1.5) rotate(45deg);
}

/* 個別アニメーションが困難 */
.element:hover {
  transform: translateX(0) translateY(-10px) scale(1.1) rotate(45deg);
  /* rotate を維持するため全て書く必要がある */
}

/* 独立プロパティ: 個別に指定可能 */
.element {
  translate: 10px 20px;
  scale: 1.5;
  rotate: 45deg;
}

.element:hover {
  translate: 0 -10px;
  scale: 1.1;
  /* rotate は自動的に維持される */
}
```

## プロパティ一覧

| プロパティ | 説明 | 例 |
|-----------|------|-----|
| `translate` | 移動 | `translate: 10px 20px` |
| `scale` | 拡大縮小 | `scale: 1.5` または `scale: 1.5 2` |
| `rotate` | 回転 | `rotate: 45deg` |

## ユースケース

### カードホバーエフェクト

```css
.card {
  translate: 0 0;
  scale: 1;
  transition: translate 0.3s, scale 0.3s;
}

.card:hover {
  translate: 0 -8px;
  scale: 1.02;
}
```

### アニメーション

```css
@keyframes float {
  0%, 100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -20px;
  }
}

.floating {
  animation: float 3s ease-in-out infinite;
}
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 104+ |
| Safari | 14.1+ |
| Firefox | 72+ |

## 関連ナレッジ

- [CSS Animations](../animation/animation-basics.md)
- [CSS Transitions](../animation/transitions.md)
