---
title: テキストアニメーションの実装とアクセシビリティ
category: css/animation
tags: [text, animation, accessibility, aria, translate, i18n, 2025]
browser_support: モダンブラウザ
created: 2026-01-19
updated: 2026-01-19
---

# テキストアニメーションの実装とアクセシビリティ

> 出典: https://www.tak-dcxi.com/article/text-animation-considerations-and-implementation-examples
> 執筆日: 2025年
> 追加日: 2026-01-19

テキストを1文字ずつ`span`要素で区切ってアニメーションさせる際のベストプラクティス。アクセシビリティ、機械翻訳、モーション設定への配慮を含む実装ガイドです。

## 4つの主要な配慮事項

1. **スクリーンリーダー対応** - 読み上げ可能なテキストの提供
2. **機械翻訳対応** - 翻訳から除外しつつ代替表示
3. **アニメーション制御** - prefers-reduced-motionへの対応
4. **実装の自動化** - JavaScriptによる効率化

## 基本実装

### HTML構造

```html
<div class="animated-text">
  <span aria-hidden="true" translate="no">
    <span style="--index: 0;">H</span>
    <span style="--index: 1;">e</span>
    <span style="--index: 2;">l</span>
    <span style="--index: 3;">l</span>
    <span style="--index: 4;">o</span>
  </span>
  <span class="visually-hidden">Hello</span>
</div>
```

**ポイント**:
- 外側の`span`に`aria-hidden="true"`と`translate="no"`を付与
- 各文字に`--index`カスタムプロパティを設定
- 代替テキストを視覚的に隠して配置

## CSS実装

### アニメーション

```css
@media (prefers-reduced-motion: no-preference) {
  .animated-text [aria-hidden] span {
    animation: fade 4s ease calc(var(--index) * 0.15s) both infinite;
  }
}

@keyframes fade {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
```

**ポイント**:
- `animation-delay`に`calc(var(--index) * 0.15s)`でカスケード効果
- `prefers-reduced-motion`でアニメーション無効時に対応

### 視覚的に隠す（Visually Hidden）

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**注意**: `display: none`や`visibility: hidden`は使用しない（スクリーンリーダーで読み上げられない）

## アクセシビリティ対応

### 1. スクリーンリーダー対応

アニメーション用の分割テキストを`aria-hidden="true"`で非表示にし、代替テキストをvisually hiddenで提供します。

```html
<!-- アニメーション用（スクリーンリーダーから非表示） -->
<span aria-hidden="true" translate="no">
  <!-- 分割された文字 -->
</span>

<!-- スクリーンリーダー用（視覚的に非表示） -->
<span class="visually-hidden">元のテキスト</span>
```

### 2. prefers-reduced-motion 対応

```css
/* アニメーション設定が「減らす」の場合 */
@media (prefers-reduced-motion: reduce) {
  .animated-text [aria-hidden] span {
    animation: none;
  }
}

/* アニメーション設定が「標準」の場合のみアニメーション */
@media (prefers-reduced-motion: no-preference) {
  .animated-text [aria-hidden] span {
    animation: fade 4s ease calc(var(--index) * 0.15s) both infinite;
  }
}
```

## 機械翻訳対応

### translate属性の使用

```html
<span aria-hidden="true" translate="no">
  <!-- 英語の分割テキスト -->
</span>
```

`translate="no"`で翻訳対象から除外します。

### 言語別の表示切り替え

```html
<div lang="en">
  <span aria-hidden="true" translate="no">
    <span style="--index: 0;">H</span>
    <span style="--index: 1;">e</span>
    <span style="--index: 2;">l</span>
    <span style="--index: 3;">l</span>
    <span style="--index: 4;">o</span>
  </span>
  <span class="visually-hidden">Hello</span>
</div>

<div lang="ja">
  <span aria-hidden="true" translate="no">
    <span style="--index: 0;">こ</span>
    <span style="--index: 1;">ん</span>
    <span style="--index: 2;">に</span>
    <span style="--index: 3;">ち</span>
    <span style="--index: 4;">は</span>
  </span>
  <span class="visually-hidden">こんにちは</span>
</div>
```

```css
/* 英語環境では英語版のみ表示 */
:lang(en) [lang="ja"] {
  display: none;
}

/* 日本語環境では日本語版のみ表示 */
:lang(ja) [lang="en"] {
  display: none;
}
```

## JavaScript自動化

### TypeScript実装例

```typescript
const initializeTextAnimation = (element: HTMLElement) => {
  const text = element.textContent || '';
  const container = document.createElement('span');
  container.setAttribute('aria-hidden', 'true');
  container.setAttribute('translate', 'no');

  // 文字を分割してspanで包む
  text.split('').forEach((char, index) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.setProperty('--index', String(index));
    container.appendChild(span);
  });

  // 代替テキスト
  const alternative = document.createElement('span');
  alternative.className = 'visually-hidden';
  alternative.textContent = text;

  // 元の内容を置き換え
  element.textContent = '';
  element.appendChild(container);
  element.appendChild(alternative);
};

// 使用例
document.querySelectorAll('[data-text-animation]').forEach((el) => {
  initializeTextAnimation(el as HTMLElement);
});
```

## 実装パターン

### フェードイン/アウト

```css
@keyframes fade {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.animated-text [aria-hidden] span {
  animation: fade 4s ease calc(var(--index) * 0.15s) both infinite;
}
```

### スライドイン

```css
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animated-text [aria-hidden] span {
  animation: slide-in 0.5s ease calc(var(--index) * 0.1s) both;
}
```

### カラフルなアニメーション

```css
@keyframes colorful {
  0%, 100% {
    color: #ff6b6b;
  }
  25% {
    color: #4ecdc4;
  }
  50% {
    color: #45b7d1;
  }
  75% {
    color: #f9ca24;
  }
}

.animated-text [aria-hidden] span {
  animation: colorful 3s ease calc(var(--index) * 0.2s) both infinite;
}
```

## ユースケース

- ブランドロゴやメインビジュアルのテキスト演出
- ヒーローセクションのタイトルアニメーション
- 言語対応が必要なグローバルサイト
- アクセシビリティ要件の厳しいプロジェクト

## 実装時の注意点

### 1. パフォーマンス

多数の要素をアニメーションさせる場合、`will-change`プロパティの使用を検討します。

```css
.animated-text [aria-hidden] span {
  will-change: opacity, transform;
}
```

ただし、**使いすぎに注意**してください。

### 2. 長いテキストへの対応

長いテキストの場合、遅延時間の計算に上限を設けます。

```css
.animated-text [aria-hidden] span {
  animation-delay: min(calc(var(--index) * 0.1s), 3s);
}
```

### 3. レイアウトシフト防止

アニメーション前のレイアウトシフトを防ぐため、最小高さを設定します。

```css
.animated-text {
  min-height: 1.5em;
}
```

## ブラウザ対応

| 機能 | Chrome | Firefox | Safari |
|------|--------|---------|--------|
| CSS Custom Properties | ○ | ○ | ○ |
| `aria-hidden` | ○ | ○ | ○ |
| `translate` 属性 | ○ | ○ | ○ |
| `:lang()` 擬似クラス | ○ | ○ | ○ |
| `prefers-reduced-motion` | ○ | ○ | ○ |

全モダンブラウザでサポートされています。

## 関連ナレッジ

- [Scroll-driven Animations](./scroll-driven-animations.md)
- [View Transitions](./view-transitions.md)
- [@starting-style](./starting-style.md)
- [視覚的に隠すテクニック](../../cross-cutting/accessibility/visually-hidden.md)

## 参考リンク

- [MDN: aria-hidden](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-hidden)
- [MDN: translate attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/translate)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [完全な実装例（TypeScript）](https://gist.github.com/tak-dcxi/text-animation-example)
