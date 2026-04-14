---
title: backdrop-filter（背後フィルター）
category: css/visual
tags: [backdrop-filter, blur, frosted-glass, visual-effects]
browser_support: Chrome 76+, Safari 9+, Firefox 103+
created: 2025-01-16
updated: 2025-01-16
---

# backdrop-filter

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

要素の背後にフィルタを適用（すりガラス効果など）。

## 基本的な使い方

```css
.glass {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}
```

## ユースケース

### すりガラス効果（Frosted Glass）

```css
.modal {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px) saturate(180%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

### ナビゲーションバー

```css
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### カード

```css
.card {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(15px) brightness(1.1);
  color: white;
}
```

## filter との違い

- **filter**: 要素自体にフィルタを適用
- **backdrop-filter**: 要素の背後にフィルタを適用

```css
/* filter: 要素全体がぼける */
.element {
  filter: blur(10px);
}

/* backdrop-filter: 背後のみぼける */
.element {
  backdrop-filter: blur(10px);
}
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 76+ |
| Safari | 9+ |
| Firefox | 103+ |

## パフォーマンス注意

`backdrop-filter` は負荷が高いため、多用すると性能に影響する可能性あり。

## 関連ナレッジ

- [filter](./filter.md)
- [Glassmorphism デザイン](../../cross-cutting/design-patterns/glassmorphism.md)
