---
title: Fluid for Tailwind CSS（clamp による流動的レスポンシブ）
category: css/values
tags: [tailwind, clamp, responsive, fluid, 2024]
browser_support: 全モダンブラウザ対応（clamp()対応ブラウザ）
created: 2026-01-19
updated: 2026-01-19
---

# Fluid for Tailwind CSS

> 出典: https://zenn.dev/chot/articles/01e615b50bc62a
> 執筆日: 2024年10月11日
> 追加日: 2026-01-19

Tailwind CSS で `clamp()` 関数を使ったスムーズな流動的レスポンシブデザインを実現する「Fluid for Tailwind CSS」プラグインの紹介と、その背後にある CSS の仕組み。

## 従来のレスポンシブの課題

### ブレークポイント方式の問題

```css
/* ❌ 段階的に変化するため、カクついて見える */
.button {
  padding: 16px;
}

@media (min-width: 768px) {
  .button {
    padding: 32px;
  }
}
```

**問題点**: ブレークポイントで急激に値が変わるため、滑らかでない。

## Fluid for Tailwind CSS の解決策

### clamp() による流動的なスケーリング

```css
/* ✅ 画面幅に応じて滑らかに変化 */
.button {
  padding: clamp(16px, 2vw + 8px, 32px);
}
```

### プラグインのインストール

```bash
npm install -D fluid-tailwind
```

### tailwind.config.ts の設定

```typescript
import fluid, { extract, screens, fontSize } from "fluid-tailwind";

export default {
  content: {
    files: ["./src/**/*.{ts,tsx}"],
    extract, // Fluid プラグイン用の抽出関数
  },
  theme: {
    screens, // Fluid 対応のスクリーン設定
    fontSize, // Fluid 対応のフォントサイズ
  },
  plugins: [
    fluid, // Fluid プラグインを追加
  ],
};
```

## 使用方法

### 基本構文

```
~[class]-[minimum]/[maximum]
```

- `~`: Fluid プレフィックス
- `[class]`: Tailwind のユーティリティクラス
- `[minimum]`: 最小値
- `[maximum]`: 最大値

### 実践例

#### パディングの流動的変化

```html
<!-- 16px 〜 32px の間で流動的に変化 -->
<button class="~px-4/8 ~py-4/8">
  Fluid button
</button>
```

生成される CSS:
```css
.~px-4\/8 {
  padding-left: clamp(1rem, 0.6957rem + 1.087vw, 2rem);
  padding-right: clamp(1rem, 0.6957rem + 1.087vw, 2rem);
}

.~py-4\/8 {
  padding-top: clamp(1rem, 0.6957rem + 1.087vw, 2rem);
  padding-bottom: clamp(1rem, 0.6957rem + 1.087vw, 2rem);
}
```

#### フォントサイズの流動的変化

```html
<!-- sm (0.875rem) 〜 2xl (1.5rem) の間で変化 -->
<h1 class="~text-sm/2xl">
  Fluid heading
</h1>
```

#### マージンの流動的変化

```html
<!-- 8px 〜 24px の間で変化 -->
<div class="~mb-2/6">
  Fluid margin
</div>
```

### 複数プロパティの組み合わせ

```html
<div class="bg-sky-500 rounded ~px-4/8 ~py-4/8 ~text-sm/2xl">
  パディングとフォントサイズが両方流動的に変化
</div>
```

## clamp() の仕組み

### clamp() の構文

```css
clamp(minimum, preferred, maximum)
```

- **minimum**: 最小値
- **preferred**: 優先値（通常は vw や % を含む計算式）
- **maximum**: 最大値

### 計算式の例

```css
/* 16px 〜 32px の間で、画面幅に応じて線形に変化 */
padding: clamp(16px, 0.6957rem + 1.087vw, 32px);
```

**計算方法**:
1. 最小画面幅（例: 320px）で 16px
2. 最大画面幅（例: 1280px）で 32px
3. その間は線形補間で計算

### ビューポート単位の活用

```css
/* vw: ビューポート幅の1% */
width: clamp(300px, 50vw, 800px);

/* vh: ビューポート高さの1% */
height: clamp(200px, 30vh, 600px);

/* vmin: vw と vh の小さい方 */
font-size: clamp(1rem, 5vmin, 3rem);
```

## 実践的なパターン

### カードコンポーネント

```html
<div class="~p-4/8 ~rounded-lg/2xl ~text-sm/lg bg-white shadow">
  <h2 class="~text-lg/2xl font-bold ~mb-2/4">タイトル</h2>
  <p class="~text-sm/base">説明文...</p>
</div>
```

### ヒーローセクション

```html
<section class="~py-12/24 ~px-6/12">
  <h1 class="~text-3xl/6xl font-bold ~mb-4/8">
    Welcome
  </h1>
  <p class="~text-base/xl ~mb-6/12">
    サブタイトル
  </p>
</section>
```

### レスポンシブグリッド

```html
<div class="grid ~gap-4/8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <div class="~p-4/6">Item 1</div>
  <div class="~p-4/6">Item 2</div>
  <div class="~p-4/6">Item 3</div>
</div>
```

## 利点と使い分け

### Fluid の利点

- ✅ 滑らかで自然な変化
- ✅ ブレークポイント不要
- ✅ あらゆる画面サイズで最適
- ✅ コード量の削減

### 従来のブレークポイントが適切な場合

- レイアウトの大きな変更（1カラム ⇔ 2カラム）
- 表示/非表示の切り替え
- Flexbox の direction 変更

### 併用が最適

```html
<!-- レイアウト: ブレークポイント -->
<!-- サイズ: Fluid -->
<div class="grid grid-cols-1 md:grid-cols-2 ~gap-4/8">
  <div class="~p-4/8">Content</div>
</div>
```

## 注意点

### 極端な画面サイズでの挙動

```css
/* ❌ 極端に小さい/大きい画面で不適切な値になる */
padding: clamp(4px, 10vw, 100px);

/* ✅ 適切な最小/最大値を設定 */
padding: clamp(16px, 5vw, 64px);
```

### アクセシビリティ

```css
/* ✅ フォントサイズは最小 16px 以上を推奨 */
font-size: clamp(1rem, 2vw, 2rem);

/* ❌ 小さすぎる最小値は避ける */
font-size: clamp(0.5rem, 2vw, 2rem);
```

## ブラウザサポート

| ブラウザ | 対応バージョン |
|---------|--------------|
| Chrome | 79+ (2019年12月) |
| Firefox | 75+ (2020年4月) |
| Safari | 13.1+ (2020年3月) |
| Edge | 79+ (2020年1月) |

**現在**: 全モダンブラウザで安心して使用可能。

## 参考リソース

- [Fluid for Tailwind CSS 公式](https://github.com/barvian/fluid-tailwind)
- [MDN: clamp()](https://developer.mozilla.org/ja/docs/Web/CSS/clamp)
- [Modern Fluid Typography Using CSS Clamp](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/)

---
