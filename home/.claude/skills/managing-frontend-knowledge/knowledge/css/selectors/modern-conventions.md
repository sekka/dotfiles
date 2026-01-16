---
title: モダンCSS記法の再考
category: css/selectors
tags: [bem, aria, data-attributes, css-architecture, accessibility, testing]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# モダンCSS記法の再考

> 出典: https://zenn.dev/okamoai/articles/ae39b3838d1b75
> 執筆日: 2024年
> 追加日: 2025-01-16

BEM修飾子をWAI-ARIA属性とカスタムデータ属性に置き換える現代的なアプローチ。

## 問題の背景：BEM修飾子の課題

### 従来のBEMアプローチ

```html
<button class="button button--primary button--is-pressed">
  Primary Button
</button>
```

```css
.button {
  background-color: gray;
}

.button.button--primary {
  background-color: blue;
}

.button.button--is-pressed {
  background-color: darkblue;
}
```

**問題点:**
1. **詳細度の増加**: `.button.button--primary` は詳細度が高くなる
2. **クラス名の肥大化**: 複数の修飾子で可読性が低下
3. **テスト可能性の低さ**: テストツールがセマンティックな状態を認識できない
4. **アクセシビリティの欠如**: スクリーンリーダーが状態を認識できない

## 解決策：セマンティック属性の活用

### 推奨アプローチ

```html
<button class="button" data-level="primary" aria-pressed="true">
  Primary Button
</button>
```

```css
.button {
  background-color: gray;
}

.button[data-level="primary"] {
  background-color: blue;
}

.button[aria-pressed="true"] {
  background-color: darkblue;
}
```

**メリット:**
1. **詳細度の統一**: 属性セレクタは詳細度が一定
2. **HTMLの可読性向上**: 状態が明確
3. **アクセシビリティ向上**: スクリーンリーダーが状態を認識
4. **テスタビリティ向上**: Testing Library や Playwright が属性を利用可能

## WAI-ARIA属性の活用

### 優先順位

> **原則:** WAI-ARIA属性で極力表現し、それで表現できないものはカスタムデータ属性を使用

### ARIA属性の例

#### aria-pressed（トグルボタン）

```html
<button class="toggle-button" aria-pressed="false">
  オフ
</button>
```

```css
.toggle-button[aria-pressed="true"] {
  background-color: #0066cc;
  color: white;
}

.toggle-button[aria-pressed="false"] {
  background-color: #f0f0f0;
  color: #333;
}
```

#### aria-expanded（アコーディオン）

```html
<button class="accordion-trigger" aria-expanded="false">
  詳細を表示
</button>
```

```css
.accordion-trigger[aria-expanded="true"]::after {
  content: "▼";
}

.accordion-trigger[aria-expanded="false"]::after {
  content: "▶";
}
```

#### aria-current（ナビゲーション）

```html
<nav>
  <a href="/" aria-current="page">ホーム</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>
```

```css
nav a[aria-current="page"] {
  font-weight: bold;
  text-decoration: underline;
  color: #0066cc;
}
```

#### aria-disabled（無効状態）

```html
<button class="button" aria-disabled="true">
  送信
</button>
```

```css
.button[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

### ARIA属性の選び方

| 状態 | ARIA属性 |
|------|----------|
| オン/オフ | `aria-pressed` |
| 開閉 | `aria-expanded` |
| 現在地 | `aria-current` |
| 無効 | `aria-disabled` |
| 選択 | `aria-selected` |
| チェック | `aria-checked` |
| 隠す | `aria-hidden` |

## カスタムデータ属性の活用

### ARIA で表現できない場合

```html
<button class="button" data-variant="primary" data-size="large">
  Large Primary Button
</button>
```

```css
.button {
  padding: 0.5rem 1rem;
  background-color: gray;
}

.button[data-variant="primary"] {
  background-color: blue;
}

.button[data-variant="secondary"] {
  background-color: lightgray;
}

.button[data-size="large"] {
  padding: 1rem 2rem;
  font-size: 1.25rem;
}

.button[data-size="small"] {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
```

### 命名規則

```html
<!-- コンポーネント名-プロパティ名 -->
<div class="card" data-card-variant="outlined" data-card-elevation="2">
  ...
</div>

<!-- または、短縮形 -->
<div class="card" data-variant="outlined" data-elevation="2">
  ...
</div>
```

**推奨:** スコープが明確な場合は短縮形を使用

## ダイナミックスタイリング

### CSS カスタムプロパティとの組み合わせ

```html
<div class="tooltip" style="--top: 100px; --left: 50px;">
  ツールチップ
</div>
```

```css
.tooltip {
  --top: 0;
  --left: 0;
  position: absolute;
  top: var(--top);
  left: var(--left);
}
```

### JavaScript での制御

```javascript
const button = document.querySelector('.button');

// ARIA属性の更新
button.setAttribute('aria-pressed', 'true');

// data属性の更新
button.dataset.variant = 'primary';

// CSS変数の更新
button.style.setProperty('--custom-color', '#ff0000');
```

## Testing Library との統合

### セマンティックな属性でテスト

```javascript
import { render, screen } from '@testing-library/react';

test('ボタンが押された状態になる', async () => {
  render(<ToggleButton />);

  const button = screen.getByRole('button', { pressed: false });
  await userEvent.click(button);

  expect(button).toHaveAttribute('aria-pressed', 'true');
});
```

### data属性でのテスト

```javascript
test('プライマリボタンが表示される', () => {
  render(<Button variant="primary" />);

  const button = screen.getByRole('button');
  expect(button).toHaveAttribute('data-variant', 'primary');
});
```

## Playwright との統合

### ARIA属性でのセレクタ

```javascript
// aria-pressed でセレクト
await page.locator('[aria-pressed="true"]').click();

// role と aria-current でセレクト
await page.locator('a[aria-current="page"]').click();
```

### data属性でのセレクタ

```javascript
// data属性でセレクト
await page.locator('[data-testid="submit-button"]').click();
await page.locator('[data-variant="primary"]').click();
```

## 詳細度の比較

### BEM修飾子（従来）

```css
.button { /* 詳細度: 0,1,0 */ }
.button.button--primary { /* 詳細度: 0,2,0 */ }
.button.button--primary.button--large { /* 詳細度: 0,3,0 */ }
```

**問題:** 詳細度が累積的に増加

### 属性セレクタ（推奨）

```css
.button { /* 詳細度: 0,1,0 */ }
.button[data-variant="primary"] { /* 詳細度: 0,2,0 */ }
.button[data-variant="primary"][data-size="large"] { /* 詳細度: 0,3,0 */ }
```

**改善:** 詳細度は増加するが、単一のクラスベースで管理可能

### :where() を使った詳細度ゼロ

```css
.button { /* 詳細度: 0,1,0 */ }
.button:where([data-variant="primary"]) { /* 詳細度: 0,1,0 */ }
.button:where([data-variant="primary"][data-size="large"]) { /* 詳細度: 0,1,0 */ }
```

**最適:** すべて同じ詳細度

## 完全な実装例

### コンポーネント設計

```html
<button
  class="button"
  data-variant="primary"
  data-size="large"
  aria-pressed="false"
>
  送信
</button>
```

### CSS

```css
.button {
  /* ベーススタイル */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;

  /* デフォルト値 */
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #f0f0f0;
  color: #333;
}

/* バリアント */
.button:where([data-variant="primary"]) {
  background-color: #0066cc;
  color: white;
}

.button:where([data-variant="secondary"]) {
  background-color: #6c757d;
  color: white;
}

.button:where([data-variant="danger"]) {
  background-color: #dc3545;
  color: white;
}

/* サイズ */
.button:where([data-size="small"]) {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.button:where([data-size="large"]) {
  padding: 1rem 2rem;
  font-size: 1.25rem;
}

/* 状態 */
.button:where([aria-pressed="true"]) {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.button:where([aria-disabled="true"]) {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* ホバー */
.button:hover:not([aria-disabled="true"]) {
  filter: brightness(0.9);
}
```

### JavaScript

```javascript
class Button {
  constructor(element) {
    this.element = element;
    this.pressed = false;
    this.init();
  }

  init() {
    this.element.addEventListener('click', () => this.toggle());
  }

  toggle() {
    this.pressed = !this.pressed;
    this.element.setAttribute('aria-pressed', this.pressed);
  }

  disable() {
    this.element.setAttribute('aria-disabled', 'true');
  }

  enable() {
    this.element.setAttribute('aria-disabled', 'false');
  }
}
```

## ブラウザ対応

- 属性セレクタ: 全ブラウザ対応
- `:where()`: Chrome 88+, Safari 14+, Firefox 84+
- ARIA属性: 全モダンブラウザ対応

## 関連ナレッジ

- [:where() セレクタ](./where-selector.md)
- [CSS詳細度](./specificity.md)
- [カスタムプロパティ](../values/css-custom-properties.md)
