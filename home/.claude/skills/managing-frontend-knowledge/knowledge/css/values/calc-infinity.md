---
title: calc(infinity)の使い方
category: css/values
tags: [calc, infinity, z-index, border-radius, transition, 2025]
browser_support: モダンブラウザ
created: 2026-01-19
updated: 2026-01-19
---

# calc(infinity)の使い方

> 出典: https://www.tak-dcxi.com/article/use-of-calc-infinity
> 執筆日: 2025年
> 追加日: 2026-01-19

`calc(infinity)`は、各プロパティの上限値を取得する値です。実質的に各プロパティの最大値として機能します。

## calc(infinity)とは

**実質的に各プロパティの上限値を取得する値**として動作します。

```css
.element {
  z-index: calc(infinity);
  /* 実質的にz-indexの最大値 2,147,483,647 */
}
```

## プロパティ別の上限値

### z-index

```css
.element {
  z-index: calc(infinity);
  /* 実際の値: 2,147,483,647 */
}
```

**上限**: 2,147,483,647

### width / height

```css
.element {
  width: calc(infinity * 1px);
  height: calc(infinity * 1px);
  /* 実際の値: 33,554,428px */
}
```

**上限**: 33,554,428px

### animation-delay / transition-delay

```css
.element {
  animation-delay: calc(infinity * 1s);
  /* 実際の値: 約2.99615e+306分 */
}
```

**上限**: 約2.99615e+306分（実質無限）

## ユースケース

### 1. z-indexの最大値設定

```css
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: calc(infinity);
}
```

**注意点**:
- `<dialog>`要素や最上位レイヤーは上書きできない
- スタッキングコンテキストの制限は依然として適用される

#### スタッキングコンテキストの制約

```html
<div style="position: relative; z-index: 1;">
  <div style="position: absolute; z-index: calc(infinity);">
    <!-- 親のz-index: 1のコンテキスト内でのみ最上位 -->
  </div>
</div>
<div style="position: relative; z-index: 2;">
  <!-- こちらの方が上に表示される -->
</div>
```

### 2. border-radiusの最大値

```css
.pill-button {
  border-radius: calc(infinity * 1px);
}
```

要素の高さに関わらず、常に完全な丸みを維持します。

**従来の方法との比較**:

```css
/* ❌ 従来の方法（記述量が少ない） */
.pill-button {
  border-radius: 999em;
}

/* ✅ calc(infinity)を使用 */
.pill-button {
  border-radius: calc(infinity * 1px);
}
```

**注意**: 従来の`999em`の方が記述量が少ないため、実用性は限定的です。

### 3. transition-delayで実質的な無効化

```css
/* オートフィル時の背景色変化を抑制 */
input:-webkit-autofill {
  transition-property: background-color;
  transition-delay: calc(infinity * 1s);
}
```

約2.99615e+306分（実質無限）の遅延により、トランジションを事実上無効化します。

**ユースケース**: ブラウザのオートフィル背景色変更を抑制

### 4. アニメーションの永続的な停止

```css
.paused {
  animation-play-state: paused;
  animation-delay: calc(infinity * 1s);
}
```

## 実装パターン

### ローディングオーバーレイ

```css
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: calc(infinity);
}
```

**注意**: `<dialog>`要素のモーダルより下に表示されます。

### カスタムモーダル（非標準）

```css
.custom-modal {
  position: fixed;
  inset: 0;
  z-index: calc(infinity);
}

.custom-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: calc(infinity - 1); /* エラー：計算不可 */
}
```

**注意**: `calc(infinity - 1)`のような計算はできません。

### ピル型ボタン

```css
.pill-button {
  padding: 0.5rem 1.5rem;
  border-radius: calc(infinity * 1px);
  background: #3b82f6;
  color: white;
}
```

### オートフィル背景色の抑制

```css
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  /* 背景色を維持 */
  -webkit-box-shadow: 0 0 0 30px white inset;

  /* トランジションを実質無効化 */
  transition-property: background-color, color;
  transition-delay: calc(infinity * 1s);
}
```

## calc(infinity)の制限

### 1. z-indexの限界

```css
/* ❌ 以下を上書きできない */
dialog::backdrop { /* 最上位レイヤー */ }
dialog[open] { /* 最上位レイヤー */ }
```

最上位レイヤー（top layer）の要素は`calc(infinity)`でも上書きできません。

### 2. スタッキングコンテキスト

```css
/* 親要素のz-indexに制約される */
.parent {
  position: relative;
  z-index: 1;
}

.child {
  position: absolute;
  z-index: calc(infinity);
  /* 親のz-index: 1のコンテキスト内でのみ有効 */
}
```

### 3. 計算の制限

```css
/* ❌ エラー：計算不可 */
.element {
  z-index: calc(infinity - 1);
  z-index: calc(infinity / 2);
}

/* ✅ 単位の掛け算のみ可能 */
.element {
  width: calc(infinity * 1px);
  animation-delay: calc(infinity * 1s);
}
```

## 代替案

### z-indexの管理

```css
/* CSS変数で管理 */
:root {
  --z-index-base: 1000;
  --z-index-modal: 2000;
  --z-index-toast: 3000;
}

.modal {
  z-index: var(--z-index-modal);
}
```

### border-radiusの管理

```css
/* 大きな値を使用 */
.pill-button {
  border-radius: 9999px; /* または 999em */
}
```

### transition無効化

```css
/* transition: noneを使用 */
input:-webkit-autofill {
  transition: none;
}
```

## 実装時の注意点

### 1. 銀の弾丸ではない

`calc(infinity)`はすべての状況で最上位を保証するわけではありません。

### 2. 可読性の考慮

```css
/* ❌ 意図が不明確 */
.element {
  z-index: calc(infinity);
}

/* ✅ コメントで意図を明記 */
.element {
  /* 最大のz-indexを設定（ただしtop layer以下） */
  z-index: calc(infinity);
}
```

### 3. メンテナンス性

CSS変数での明示的な値管理の方が、将来的なメンテナンスが容易です。

## ブラウザ対応

| ブラウザ | calc(infinity) |
|---------|----------------|
| Chrome | ○ |
| Edge | ○ |
| Firefox | ○ |
| Safari | ○ |

全モダンブラウザでサポートされています。

## 関連ナレッジ

- [z-index管理](./z-index-management.md)
- [時代遅れのCSS技術](../outdated-techniques.md)
- [CSS変数の活用](./custom-properties.md)

## 参考リンク

- [MDN: calc()](https://developer.mozilla.org/en-US/docs/Web/CSS/calc)
- [CSS Values and Units Module Level 4](https://www.w3.org/TR/css-values-4/)
- [Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)
