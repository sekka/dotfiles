---
title: contrast-color() 関数（自動コントラスト調整）
category: css/theming
tags: [color, contrast, accessibility, oklch, RCS]
browser_support: 未実装（提案段階）
created: 2026-01-31
updated: 2026-01-31
---

## contrast-color() 関数

> 出典: https://lea.verou.me/blog/2024/contrast-color/
> 執筆日: 2024-05-17
> 追加日: 2026-01-31

背景色に対して読みやすいテキスト色を自動的に生成する関数（提案段階）。

### 問題

ユーザー定義やシステム定義の背景色に対して、自動的に読みやすいテキスト色を保証することが不可能でした。

```css
/* 従来の問題 */
.button {
  background: var(--user-color); /* ユーザーが選んだ色 */
  color: ???; /* 何色にすれば読みやすい? */
}
```

### contrast-color() の提案

背景色に応じて、自動的に読みやすいテキスト色を計算。

```css
.button {
  background: var(--user-color);
  color: contrast-color(var(--user-color)); /* 自動で白か黒を選択 */
}
```

### 現在の回避策: Relative Color Syntax

**RCS（Relative Color Syntax）**を使用した実装（現在利用可能）。

```css
--l-threshold: 0.7;
--l: clamp(0, (l / var(--l-threshold) - 1) * -infinity, 1);
color: oklch(from var(--color) var(--l) 0 h);
```

**仕組み:**
- 背景色の明度（l）を閾値（0.7）と比較
- 明度が高い → 黒（l = 0）
- 明度が低い → 白（l = 1）
- `* -infinity` で0か1の二値に変換

### 実践例: ダイナミックボタン

```html
<button style="--bg-color: #ff6b6b;">赤いボタン</button>
<button style="--bg-color: #f0f0f0;">薄いボタン</button>
<button style="--bg-color: #2c3e50;">濃いボタン</button>
```

```css
button {
  background: var(--bg-color);

  /* 明度の閾値 */
  --l-threshold: 0.65;

  /* 明度に基づいて0（黒）か1（白）を計算 */
  --contrast-l: clamp(
    0,
    (l / var(--l-threshold) - 1) * -infinity,
    1
  );

  /* oklchで背景色から派生 */
  color: oklch(from var(--bg-color) var(--contrast-l) 0 h);

  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
}
```

### カスタム閾値の調整

閾値を変更することで、白黒の切り替わりポイントを調整可能。

```css
/* デフォルト: 0.7 */
--l-threshold: 0.7;

/* より明るい背景でも黒文字 */
--l-threshold: 0.8;

/* より暗い背景でも白文字 */
--l-threshold: 0.6;
```

### Relative Color Syntax（RCS）とは

既存の色値から新しい色を導出できるCSS機能。

```css
/* 元の色の明度を変更 */
background: oklch(from var(--color) calc(l * 0.5) c h);

/* 元の色の彩度を下げる */
background: oklch(from var(--color) l calc(c * 0.3) h);

/* 元の色を完全に反転 */
color: oklch(from var(--bg) calc(1 - l) c h);
```

### ブラウザサポート

**Relative Color Syntax:**
- Chrome 119+（2023年11月）
- Firefox 128+（2024年7月）
- Safari 16.4+（2023年3月）
- **83%以上のユーザーが利用可能**（2024年5月時点）

**contrast-color() 関数:**
- まだ実装されていない（提案段階）
- 2024年末までにBaseline達成の見込み

### 実践例: テーマカラー変更

```html
<div class="theme-switcher">
  <button data-theme="primary">Primary</button>
  <button data-theme="success">Success</button>
  <button data-theme="danger">Danger</button>
</div>
```

```css
:root {
  --primary: oklch(0.6 0.2 250);
  --success: oklch(0.65 0.18 145);
  --danger: oklch(0.55 0.22 25);
}

[data-theme="primary"] {
  --theme-color: var(--primary);
}

[data-theme="success"] {
  --theme-color: var(--success);
}

[data-theme="danger"] {
  --theme-color: var(--danger);
}

button {
  background: var(--theme-color);

  /* 自動コントラスト調整 */
  --l-threshold: 0.7;
  --contrast-l: clamp(
    0,
    (l / var(--l-threshold) - 1) * -infinity,
    1
  );
  color: oklch(from var(--theme-color) var(--contrast-l) 0 h);
}
```

### 実践例: ダークモード対応

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg: oklch(0.2 0.05 250);
    --text: oklch(from var(--bg) calc(1 - l) c h); /* 自動で明るい色 */
  }
}

@media (prefers-color-scheme: light) {
  :root {
    --bg: oklch(0.95 0.02 90);
    --text: oklch(from var(--bg) calc(1 - l) c h); /* 自動で暗い色 */
  }
}
```

### 実践例: ユーザー選択カラー

```html
<input type="color" id="color-picker" value="#3498db">
<div class="preview">プレビュー</div>
```

```javascript
const picker = document.getElementById('color-picker');
const preview = document.querySelector('.preview');

picker.addEventListener('input', (e) => {
  preview.style.setProperty('--user-color', e.target.value);
});
```

```css
.preview {
  background: var(--user-color, #3498db);

  /* 自動コントラスト */
  --l-threshold: 0.65;
  --contrast-l: clamp(
    0,
    (l / var(--l-threshold) - 1) * -infinity,
    1
  );
  color: oklch(from var(--user-color, #3498db) var(--contrast-l) 0 h);

  padding: 32px;
  font-size: 24px;
  font-weight: bold;
}
```

### 注意点

#### 1. oklch 色空間が必須

RCSは `oklch()` または `oklab()` で使用することを推奨。

```css
/* ✅ 推奨: oklch */
color: oklch(from var(--color) var(--l) 0 h);

/* ❌ 非推奨: rgb, hsl */
color: hsl(from var(--color) h s calc(l * 0.5));
```

#### 2. フォールバック

非対応ブラウザ向けのフォールバック。

```css
.button {
  background: var(--bg-color);

  /* フォールバック: 固定値 */
  color: white;

  /* RCS対応ブラウザ */
  color: oklch(from var(--bg-color) var(--contrast-l) 0 h);
}
```

#### 3. 閾値の微調整

WCAG AA基準（4.5:1）を満たすには、閾値の調整が必要な場合があります。

```css
/* WCAG AA向けの調整 */
--l-threshold: 0.65; /* デフォルト */
--l-threshold: 0.6;  /* より暗い背景でも白文字 */
```

### WCAG準拠の確認

コントラスト比をDevToolsで確認。

```
Chrome DevTools:
1. 要素を選択
2. Styles パネルで背景色をクリック
3. カラーピッカーで「Contrast ratio」を確認
```

### パフォーマンス

- CSS変数の計算はブラウザネイティブ
- JavaScriptでの計算よりも高速
- リペイント時のみ再計算

### 将来の contrast-color()

提案されている構文（実装待ち）:

```css
.button {
  background: var(--user-color);
  color: contrast-color(var(--user-color)); /* 将来の構文 */
}
```

**機能:**
- 自動でWCAG基準を満たす色を選択
- 白・黒以外の選択肢も指定可能
- 最小コントラスト比の指定が可能

### 関連技術

- [oklch / oklab 色空間](./oklch-color.md)
- [Relative Color Syntax](./relative-color-syntax.md)
- [light-dark() 関数](./light-dark-function.md)
- [カスタムプロパティ](../values/custom-properties.md)

### 参考資料

- [CSS Color Module Level 5](https://drafts.csswg.org/css-color-5/)
- [WCAG 2.1 Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---
