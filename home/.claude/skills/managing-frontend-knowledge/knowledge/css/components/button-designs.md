---
title: CSSボタンデザインパターン
category: css/components
tags: [button, ui, design, gradient, neumorphism, hover, accessibility]
browser_support: 全モダンブラウザ対応
created: 2026-02-01
updated: 2026-02-01
---

# CSSボタンデザインパターン

> 出典: https://ics.media/entry/230629/
> 執筆日: 2023-06-29
> 追加日: 2026-02-01

JavaScriptなしで実装できる、シンプルで使いやすいCSSボタンデザイン集。コピー&ペーストで使える実用的なパターン。

## 基本原則

### 1. `<a>` と `<button>` の両方で使える

```html
<!-- リンクとして -->
<a href="/page" class="btn">ボタン</a>

<!-- ボタンとして -->
<button class="btn">ボタン</button>
```

### 2. JavaScript不要

全てのデザインはCSSのみで実装。

### 3. アクセシビリティ配慮

- キーボード操作可能
- スクリーンリーダー対応
- `prefers-reduced-motion` 対応

## タッチデバイス対応

### 問題: ホバーがタッチ時に発火

「ホバーが無効なタッチデバイスでは、タッチ時にホバーが発火してしまう」問題があります。

**解決策**:

```css
/* NG: タッチデバイスでホバーが残る */
.button:hover {
  background: #ccc;
}

/* OK: ホバー可能なデバイスのみ */
@media (any-hover: hover) {
  .button:hover {
    background: #ccc;
  }
}
```

## デザインパターン

### 1. グラデーション枠線ボタン

**特徴**: グラデーションの枠線、ホバーで塗りつぶし

```html
<a href="#" class="buttonOutlineGradient">
  グラデーション枠線
</a>
```

```css
.buttonOutlineGradient {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  position: relative;
  background: #fff;
  border-radius: 8px;

  /* グラデーション枠線 */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 2px;
    border-radius: 8px;
    background: linear-gradient(135deg, #6fa24a, #15a1cc);
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  /* ホバー時に塗りつぶし */
  @media (any-hover: hover) {
    &:hover {
      color: #fff;

      &::before {
        -webkit-mask: none;
        mask: none;
      }
    }
  }
}
```

**ブラウザサポート**:
- Chrome/Edge: 全バージョン
- Safari: 全バージョン
- Firefox: 全バージョン

### 2. 光る枠線ボタン（conic-gradient）

**特徴**: `conic-gradient` で円錐グラデーション、アニメーション

```html
<button class="buttonGlow">
  光る枠線
</button>
```

```css
@property --angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

.buttonGlow {
  padding: 1rem 2rem;
  position: relative;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 8px;
    background: conic-gradient(
      from var(--angle),
      #ff0080,
      #7928ca,
      #ff0080
    );
    z-index: -1;
    animation: rotate 3s linear infinite;
  }

  @media (any-hover: hover) {
    &:hover::before {
      filter: blur(10px);
    }
  }
}

@keyframes rotate {
  to {
    --angle: 360deg;
  }
}
```

**ブラウザサポート**:
- `@property`: Chrome/Edge 85+, Safari 16.4+, Firefox 128+
- `conic-gradient`: Chrome/Edge 69+, Safari 12.1+, Firefox 83+

**フォールバック**:

```css
/* 古いブラウザ向け */
@supports not (background: conic-gradient(#fff, #000)) {
  .buttonGlow::before {
    background: linear-gradient(90deg, #ff0080, #7928ca);
  }
}
```

### 3. ニューモーフィズムボタン

**特徴**: `box-shadow` で立体感

```html
<button class="buttonNeumorphism">
  ニューモーフィズム
</button>
```

```css
.buttonNeumorphism {
  padding: 1rem 2rem;
  background: #e0e5ec;
  color: #333;
  border: none;
  border-radius: 16px;
  font-weight: 600;
  cursor: pointer;

  /* 立体感 */
  box-shadow:
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.5);

  transition: box-shadow 0.2s;

  @media (any-hover: hover) {
    &:hover {
      /* 押し込まれた感じ */
      box-shadow:
        inset 4px 4px 8px rgba(163, 177, 198, 0.6),
        inset -4px -4px 8px rgba(255, 255, 255, 0.5);
    }
  }

  &:active {
    box-shadow:
      inset 4px 4px 8px rgba(163, 177, 198, 0.6),
      inset -4px -4px 8px rgba(255, 255, 255, 0.5);
  }
}
```

### 4. アンダーラインアニメーションボタン

**特徴**: ホバーで下線が伸びる

```html
<a href="#" class="buttonUnderline">
  アンダーライン
</a>
```

```css
.buttonUnderline {
  display: inline-block;
  padding: 0.5rem 0;
  text-decoration: none;
  color: #333;
  font-weight: 600;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: right top;
    transition: transform 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  }

  @media (any-hover: hover) {
    &:hover::after {
      transform: scaleX(1);
      transform-origin: left top;
    }
  }
}
```

**タイミング調整**:

```css
/* 速く伸びて、ゆっくり縮む */
.buttonUnderline::after {
  transition: transform 0.2s cubic-bezier(0.19, 1, 0.22, 1);
}

.buttonUnderline:hover::after {
  transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
}
```

### 5. アイコン付きボタン

**特徴**: SVGアイコン + テキスト

```html
<button class="buttonIcon">
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 0L12.2451 7.75486L20 10L12.2451 12.2451L10 20L7.75486 12.2451L0 10L7.75486 7.75486L10 0Z"/>
  </svg>
  アイコン付き
</button>
```

```css
.buttonIcon {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  @media (any-hover: hover) {
    &:hover {
      background: #0056b3;
    }
  }

  /* アイコンのみの場合 */
  &.iconOnly {
    padding: 0.75rem;

    svg {
      margin: 0;
    }
  }
}
```

**アクセシビリティ**:

```html
<!-- アイコンのみの場合は aria-label を必ず付ける -->
<button class="buttonIcon iconOnly" aria-label="お気に入りに追加">
  <svg><!-- ハートアイコン --></svg>
</button>
```

### 6. 円形アイコンボタン

**特徴**: アイコンのみの円形ボタン

```html
<button class="buttonCircle" aria-label="共有">
  <svg width="20" height="20"><!-- 共有アイコン --></svg>
</button>
```

```css
.buttonCircle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.2s;

  @media (any-hover: hover) {
    &:hover {
      background: #e0e0e0;
      transform: scale(1.1);
    }
  }

  &:active {
    transform: scale(0.95);
  }
}
```

### 7. テキスト選択を無効化

**問題**: `button` 要素の文字がダブルクリックで選択されてしまう

**解決策**:

```css
button {
  user-select: none;
  -webkit-user-select: none;
}
```

## 共通のベーススタイル

```css
/* リセット */
button {
  appearance: none;
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  user-select: none;
}

/* フォーカススタイル（アクセシビリティ） */
button:focus-visible,
a:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* 無効状態 */
button:disabled,
a.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

## アクセシビリティチェックリスト

- [ ] キーボードでフォーカス可能
- [ ] フォーカス時に視覚的インジケーター表示
- [ ] スクリーンリーダーで目的が理解できる
- [ ] `prefers-reduced-motion` でアニメーション無効化
- [ ] 十分なコントラスト比（WCAG AA: 4.5:1以上）
- [ ] タップターゲットサイズ（最低44x44px）

## prefers-reduced-motionへの対応

```css
@media (prefers-reduced-motion: reduce) {
  .buttonUnderline::after,
  .buttonGlow::before,
  .buttonCircle {
    transition: none;
    animation: none;
  }
}
```

## まとめ

| パターン | 用途 | 複雑度 |
|---------|------|--------|
| グラデーション枠線 | CTA、強調 | 中 |
| 光る枠線 | プレミアム感 | 高 |
| ニューモーフィズム | モダンUI | 低 |
| アンダーライン | テキストリンク | 低 |
| アイコン付き | アクション明示 | 低 |
| 円形アイコン | ツールバー | 低 |

## 関連ナレッジ

- [グラデーション](../visual/gradients.md)
- [box-shadow](../visual/box-shadow.md)
- [transition](../animation/transitions.md)
- [アクセシビリティ](../../cross-cutting/accessibility/web-accessibility-basics-2024.md)
- [prefers-reduced-motion](../../cross-cutting/accessibility/prefers-reduced-motion.md)
