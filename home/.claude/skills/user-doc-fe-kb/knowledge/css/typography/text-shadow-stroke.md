---
title: text-shadow で複数色の縁取りを実装
category: css/typography
tags: [text-shadow, stroke, outline, multiple-colors, 2025]
browser_support: 全モダンブラウザ対応
created: 2026-01-19
updated: 2026-01-19
---

# text-shadow で複数色の縁取りを実装

> 出典: https://zenn.dev/chot/articles/15fbf9772f26db
> 執筆日: 2025年5月13日
> 追加日: 2026-01-19

複数の `text-shadow` 値を段階的に適用することで、複数色の縁取りや影付き文字を実装する方法。TypeScript で生成関数も提供されています。

## 基本コンセプト

`text-shadow` を多方向から重ねることで、スムーズな縁取りを作成します。

### 4方向の縁取り

```css
.text-stroke-4 {
  text-shadow:
    1px 0 0 #000,    /* 右 */
    -1px 0 0 #000,   /* 左 */
    0 1px 0 #000,    /* 下 */
    0 -1px 0 #000;   /* 上 */
}
```

### 8方向の縁取り（より滑らか）

```css
.text-stroke-8 {
  text-shadow:
    1px 0 0 #000,     /* 右 */
    -1px 0 0 #000,    /* 左 */
    0 1px 0 #000,     /* 下 */
    0 -1px 0 #000,    /* 上 */
    1px 1px 0 #000,   /* 右下 */
    -1px 1px 0 #000,  /* 左下 */
    1px -1px 0 #000,  /* 右上 */
    -1px -1px 0 #000; /* 左上 */
}
```

## 三角関数を使った多方向縁取り

### 斜め方向の計算

3px の縁取りで右斜め上（45度）の場合：

```
x = 3 × cos(45°) ≈ 2.12px
y = -3 × sin(45°) ≈ -2.12px
```

```css
.text-stroke-diagonal {
  text-shadow:
    2.12px -2.12px 0 #000; /* 右斜め上 */
}
```

### 256方向の縁取り（極めて滑らか）

TypeScript による生成例：

```typescript
function generateTextStroke(
  strokes: Array<{ width: number; color: string }>,
  directionCount = 256,
  blur = 0,
  digits = 2
): string {
  const shadows: string[] = [];

  for (const stroke of strokes) {
    for (let i = 0; i < directionCount; i++) {
      const angle = (i / directionCount) * 2 * Math.PI;
      const x = (stroke.width * Math.cos(angle)).toFixed(digits);
      const y = (stroke.width * Math.sin(angle)).toFixed(digits);
      shadows.push(`${x}px ${y}px ${blur}px ${stroke.color}`);
    }
  }

  return shadows.join(', ');
}

// 使用例
const stroke = generateTextStroke([
  { width: 3, color: '#000' }
], 256);

// CSS に適用
element.style.textShadow = stroke;
```

## 複数色の縁取り

### 虹色の7段階縁取り

```typescript
const rainbowStroke = generateTextStroke([
  { width: 1, color: '#FF0000' },  // 赤
  { width: 2, color: '#FF7F00' },  // オレンジ
  { width: 3, color: '#FFFF00' },  // 黄色
  { width: 4, color: '#00FF00' },  // 緑
  { width: 5, color: '#0000FF' },  // 青
  { width: 6, color: '#4B0082' },  // 藍
  { width: 7, color: '#9400D3' }   // 紫
], 256);
```

### 影付き縁取り

```typescript
const strokeWithShadow = generateTextStroke([
  { width: 2, color: '#FFF' }      // 白い縁取り
], 256) + ', 4px 4px 8px rgba(0, 0, 0, 0.5)'; // 影を追加
```

## CSS カスタムプロパティでの実装

### 基本パターン

```css
:root {
  --stroke-width: 3px;
  --stroke-color: #000;
  --stroke-4:
    var(--stroke-width) 0 0 var(--stroke-color),
    calc(var(--stroke-width) * -1) 0 0 var(--stroke-color),
    0 var(--stroke-width) 0 var(--stroke-color),
    0 calc(var(--stroke-width) * -1) 0 var(--stroke-color);
}

.text-stroke {
  text-shadow: var(--stroke-4);
}
```

### 動的に変更可能な縁取り

```css
.text-dynamic {
  --stroke-width: 2px;
  --stroke-color: #FF0000;
  text-shadow:
    var(--stroke-width) 0 0 var(--stroke-color),
    calc(var(--stroke-width) * -1) 0 0 var(--stroke-color),
    0 var(--stroke-width) 0 var(--stroke-color),
    0 calc(var(--stroke-width) * -1) 0 var(--stroke-color);
}

.text-dynamic:hover {
  --stroke-width: 4px;
  --stroke-color: #0000FF;
}
```

## 実践的な使用例

### ロゴテキスト

```css
.logo {
  font-size: 3rem;
  font-weight: bold;
  color: #FFD700;
  text-shadow:
    2px 0 0 #000, -2px 0 0 #000,
    0 2px 0 #000, 0 -2px 0 #000,
    2px 2px 0 #000, -2px 2px 0 #000,
    2px -2px 0 #000, -2px -2px 0 #000;
}
```

### ヒーローセクションのタイトル

```css
.hero-title {
  font-size: 4rem;
  color: #FFF;
  text-shadow:
    /* 黒い縁取り */
    1px 0 0 #000, -1px 0 0 #000,
    0 1px 0 #000, 0 -1px 0 #000,
    1px 1px 0 #000, -1px 1px 0 #000,
    1px -1px 0 #000, -1px -1px 0 #000,
    /* 影 */
    4px 4px 12px rgba(0, 0, 0, 0.7);
}
```

### アニメーション対応

```css
@keyframes stroke-pulse {
  0%, 100% {
    text-shadow:
      2px 0 0 #FF0000, -2px 0 0 #FF0000,
      0 2px 0 #FF0000, 0 -2px 0 #FF0000;
  }
  50% {
    text-shadow:
      4px 0 0 #0000FF, -4px 0 0 #0000FF,
      0 4px 0 #0000FF, 0 -4px 0 #0000FF;
  }
}

.animated-stroke {
  animation: stroke-pulse 2s ease-in-out infinite;
}
```

## パフォーマンス考慮事項

### 256方向の縁取りは重い

```css
/* ❌ 256方向は処理が重い */
.heavy-stroke {
  text-shadow: /* 256個の値 */;
}

/* ✅ 8〜16方向で十分滑らか */
.light-stroke {
  text-shadow: /* 8個の値 */;
}
```

### will-change の活用

```css
.animated-text {
  will-change: text-shadow; /* アニメーション時のみ */
}

.animated-text:not(:hover) {
  will-change: auto; /* 不要時は解除 */
}
```

## ユースケース

- ロゴやヘッドラインの強調
- 背景画像の上での可読性向上
- ゲームUIやエフェクト
- アーティスティックなタイポグラフィ
- クリスマスやイベント用の装飾テキスト

## Tips

### ぼかしの追加

```css
.stroke-with-blur {
  text-shadow:
    /* 縁取り（blur なし） */
    2px 0 0 #000, -2px 0 0 #000,
    0 2px 0 #000, 0 -2px 0 #000,
    /* 外側のぼかし */
    0 0 8px rgba(0, 0, 0, 0.5);
}
```

### グラデーション風の縁取り

```css
.gradient-stroke {
  text-shadow:
    1px 0 0 #FF0000,
    2px 0 0 #FF7F00,
    3px 0 0 #FFFF00,
    4px 0 0 #00FF00;
}
```

### レスポンシブ対応

```css
.responsive-stroke {
  font-size: clamp(2rem, 5vw, 4rem);
  text-shadow:
    calc(0.05em) 0 0 #000,
    calc(-0.05em) 0 0 #000,
    0 calc(0.05em) 0 #000,
    0 calc(-0.05em) 0 #000;
}
```

## 参考リソース

- [MDN: text-shadow](https://developer.mozilla.org/ja/docs/Web/CSS/text-shadow)
- [CSS Text Decoration Module Level 3](https://www.w3.org/TR/css-text-decor-3/)

---
