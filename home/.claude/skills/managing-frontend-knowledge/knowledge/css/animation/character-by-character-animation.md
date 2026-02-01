---
title: 1文字ずつ変化するテキストアニメーション（HTML+CSS）
category: css/animation
tags: [animation, text-effects, transition-delay, accessibility, css-variables]
browser_support: モダンブラウザ全対応
created: 2025-02-01
updated: 2025-02-01
---

# 1文字ずつ変化するテキストアニメーション（HTML+CSS）

## カスタムプロパティとtransition-delayで実現する段階的エフェクト

> 出典: https://ics.media/entry/250131/
> 執筆日: 2025-01-31
> 追加日: 2025-02-01

HTMLとCSSのみで、ホバー時に1文字ずつ順番に変化するテキストアニメーションを実装できる。CSS変数 `--index` と `transition-delay` を組み合わせることで、JavaScriptなしで実現。

### 基本的な実装パターン

#### HTML構造

```html
<div class="animated-text">
  <span class="letter" style="--index: 0">H</span>
  <span class="letter" style="--index: 1">e</span>
  <span class="letter" style="--index: 2">l</span>
  <span class="letter" style="--index: 3">l</span>
  <span class="letter" style="--index: 4">o</span>
</div>
```

#### CSS（基本）

```css
.letter {
  display: inline-block;
  transition: text-shadow 0.2s ease;
  transition-delay: calc(var(--index) * 0.05s);
}

.animated-text:hover .letter {
  text-shadow: 0 0 10px rgba(255, 100, 0, 0.8);
}
```

**仕組み**:
- `--index: 0, 1, 2...` で各文字に番号を振る
- `calc(var(--index) * 0.05s)` で遅延時間を計算（0s, 0.05s, 0.1s...）
- ホバー時に順番にエフェクトが適用される

### 実践例1: 交互の回転方向

```css
.letter {
  display: inline-block;
  transition: transform 0.3s ease;
  transition-delay: calc(var(--index) * 0.05s);
}

/* 偶数番目: 時計回り */
.animated-text:hover .letter:nth-child(even) {
  transform: rotate(15deg);
}

/* 奇数番目: 反時計回り */
.animated-text:hover .letter:nth-child(odd) {
  transform: rotate(-15deg);
}
```

### 実践例2: グラデーションカラー変化

```css
.letter {
  display: inline-block;
  color: #333;
  transition: color 0.3s ease;
  transition-delay: calc(var(--index) * 0.05s);
}

.animated-text:hover .letter {
  color: hsl(calc(var(--index) * 30), 70%, 50%);
  /* --indexに応じて色相を変化 */
}
```

### 実践例3: 揺れるアニメーション（keyframes）

```html
<div class="sway-text">
  <span class="letter" style="--index: 0">S</span>
  <span class="letter" style="--index: 1">w</span>
  <span class="letter" style="--index: 2">a</span>
  <span class="letter" style="--index: 3">y</span>
</div>
```

```css
@keyframes sway {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(10deg);
  }
  75% {
    transform: rotate(-10deg);
  }
}

.letter {
  display: inline-block;
}

.sway-text:hover .letter {
  animation: sway 0.6s ease-in-out;
  animation-delay: calc(var(--index) * 0.1s);
}
```

### 実践例4: グリッチ効果

```css
@keyframes glitch {
  0%, 100% {
    transform: translate(0);
    opacity: 1;
  }
  20% {
    transform: translate(-2px, 2px);
    opacity: 0.8;
  }
  40% {
    transform: translate(2px, -2px);
    opacity: 0.6;
  }
  60% {
    transform: translate(-2px, -2px);
    opacity: 0.8;
  }
  80% {
    transform: translate(2px, 2px);
    opacity: 0.9;
  }
}

.glitch-text:hover .letter {
  animation: glitch 0.3s ease;
  animation-delay: calc(var(--index) * 0.02s);
}
```

### 実践例5: スケール+透明度

```css
.letter {
  display: inline-block;
  transform: scale(1);
  opacity: 1;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
  transition-delay: calc(var(--index) * 0.05s);
}

.scale-text:hover .letter {
  transform: scale(1.3);
  opacity: 0.5;
}
```

### アクセシビリティ配慮（必須）

#### 1. aria-hidden でスクリーンリーダーから隠す

```html
<div class="animated-text">
  <!-- 装飾用（スクリーンリーダーは無視） -->
  <span aria-hidden="true">
    <span class="letter" style="--index: 0">H</span>
    <span class="letter" style="--index: 1">e</span>
    <span class="letter" style="--index: 2">l</span>
    <span class="letter" style="--index: 3">l</span>
    <span class="letter" style="--index: 4">o</span>
  </span>

  <!-- スクリーンリーダー用（視覚的に非表示） -->
  <span class="sr-only">Hello</span>
</div>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**理由**: 分割された文字を1文字ずつ読み上げると「エイチ、イー、エル、エル、オー」となり意味が通じない。

#### 2. translate="no" で翻訳を防ぐ

```html
<div class="animated-text" translate="no">
  <!-- 文字分割されたテキスト -->
</div>
```

**理由**: Google翻訳などで各文字が個別に翻訳され、意図しない結果になるのを防ぐ。

### モーション軽減対応

```css
@media (prefers-reduced-motion: reduce) {
  .letter {
    transition: none !important;
    animation: none !important;
  }
}
```

### JavaScriptでの自動分割（オプション）

```html
<div class="animated-text" data-text="Hello World"></div>
```

```javascript
const elements = document.querySelectorAll('.animated-text');

elements.forEach(el => {
  const text = el.dataset.text;
  const letters = text.split('').map((char, index) => {
    if (char === ' ') {
      return '<span class="space"> </span>';
    }
    return `<span class="letter" style="--index: ${index}">${char}</span>`;
  }).join('');

  // 装飾用
  const decorative = `<span aria-hidden="true">${letters}</span>`;
  // スクリーンリーダー用
  const accessible = `<span class="sr-only">${text}</span>`;

  el.innerHTML = decorative + accessible;
});
```

### パフォーマンス最適化

```css
.letter {
  display: inline-block;
  will-change: transform; /* GPU加速 */
  transition: transform 0.3s ease;
  transition-delay: calc(var(--index) * 0.05s);
}

/* アニメーション終了後にwill-changeを解除 */
.animated-text:not(:hover) .letter {
  will-change: auto;
}
```

### レスポンシブ対応

```css
/* デスクトップ */
.letter {
  transition-delay: calc(var(--index) * 0.05s);
}

/* モバイル: 高速化 */
@media (max-width: 768px) {
  .letter {
    transition-delay: calc(var(--index) * 0.03s);
    transition-duration: 0.15s;
  }
}
```

### 複数行テキストの対応

```html
<div class="multiline-text">
  <div class="line">
    <span class="letter" style="--index: 0">H</span>
    <span class="letter" style="--index: 1">e</span>
    <span class="letter" style="--index: 2">l</span>
    <span class="letter" style="--index: 3">l</span>
    <span class="letter" style="--index: 4">o</span>
  </div>
  <div class="line">
    <span class="letter" style="--index: 5">W</span>
    <span class="letter" style="--index: 6">o</span>
    <span class="letter" style="--index: 7">r</span>
    <span class="letter" style="--index: 8">l</span>
    <span class="letter" style="--index: 9">d</span>
  </div>
</div>
```

```css
.line {
  display: block;
}

.letter {
  display: inline-block;
  transition: color 0.3s ease;
  transition-delay: calc(var(--index) * 0.05s);
}

.multiline-text:hover .letter {
  color: #ff6347;
}
```

### フォーカス時の発火

```css
/* ホバーだけでなくフォーカスでも */
.animated-text:hover .letter,
.animated-text:focus-within .letter {
  transform: scale(1.2);
}
```

### ブラウザサポート

- ✅ CSS変数（`--index`）: モダンブラウザ全対応（IE11未対応）
- ✅ `calc()`, `transition-delay`: モダンブラウザ全対応
- ✅ `nth-child()`: 全ブラウザ対応

### ユースケース

- **見出し**: ヒーローセクションのタイトル
- **ナビゲーション**: メニュー項目のホバーエフェクト
- **ロゴ**: ブランド名のインタラクティブ表示
- **CTA（Call to Action）**: ボタンテキストの強調
- **ローディング**: 文字が順番に現れる演出

### 注意点

- **パフォーマンス**: 大量の文字では重くなる可能性
- **アクセシビリティ**: 必ず `aria-hidden` と `.sr-only` を使用
- **SEO**: テキストは正常にクロール可能（DOM内に存在）
- **翻訳**: `translate="no"` で誤翻訳を防ぐ

### 制限事項

- **動的テキスト**: JavaScriptで分割する必要あり
- **CMS連携**: 自動分割スクリプトが必要
- **日本語**: 文字数が多い場合、手動分割は困難

### 参考資料

- [CSS Variables - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [transition-delay - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-delay)
- [ARIA - Accessible Rich Internet Applications](https://www.w3.org/WAI/ARIA/apg/)

---
