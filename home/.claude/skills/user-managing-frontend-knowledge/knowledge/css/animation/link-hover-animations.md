---
title: "リンクテキストのホバー時アニメーション11選"
category: css/animation
tags: [css, animation, hover, link, text-effects, transition, transform]
browser_support: "Modern browsers, Safari 18.0+ for backdrop-filter without prefix"
created: 2026-02-01
updated: 2026-02-01
---

# リンクテキストのホバー時アニメーション11選

## 概要

HTML と CSS のみで実装できる、リンクテキストのホバー時アニメーション集。ユーザーエクスペリエンスを向上させるインタラクティブなデザインパターン。

> 出典: [HTMLとCSSでつくる！ リンクテキストのホバー時アニメーション11選 - ICS MEDIA](https://ics.media/entry/240801/)
> 執筆日: 2024-08-01
> 追加日: 2026-02-01

## 基本的なHTML構造

全てのパターンで共通の HTML:

```html
<a href="#" class="text">LINK TEXT</a>
```

## 11のアニメーションパターン

### 1. 文字間隔の拡張

ホバー時に `letter-spacing` を広げる。

```css
.text {
  letter-spacing: 0.05em;
  transition: letter-spacing 0.3s ease;
}

.text:hover {
  letter-spacing: 0.2em;
}
```

**ユースケース:** シンプルで上品な演出

### 2. 縦回転

テキストを縦方向に回転。

```css
.text {
  display: inline-block;
  transition: transform 0.3s ease;
}

.text:hover {
  transform: rotateX(360deg);
}
```

**ユースケース:** 動きのあるナビゲーション

### 3. 背景色付き回転

回転しながら背景色を変更。

```css
.text {
  display: inline-block;
  padding: 0.5em 1em;
  background-color: transparent;
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.text:hover {
  transform: rotate(360deg);
  background-color: #007bff;
  color: white;
}
```

**ユースケース:** 強調したいCTA（Call to Action）

### 4. 3D 回転（perspective）

3D空間での回転効果。

```css
.text {
  display: inline-block;
  perspective: 1000px;
  transition: transform 0.5s ease;
}

.text:hover {
  transform: rotateY(180deg);
}
```

**ユースケース:** 先進的なデザイン

### 5. 円の出現

テキストの背後に円が出現。

```css
.text {
  position: relative;
  display: inline-block;
  z-index: 1;
}

.text::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: rgba(0, 123, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
  z-index: -1;
}

.text:hover::before {
  width: 120%;
  height: 150%;
}
```

**ユースケース:** 視覚的インパクト

### 6. 流れる下線

グラデーションの下線がスライド。

```css
.text {
  position: relative;
  background-image: linear-gradient(to right, #007bff 0%, #00d4ff 100%);
  background-position: 0 100%;
  background-size: 0% 2px;
  background-repeat: no-repeat;
  transition: background-size 0.3s ease;
}

.text:hover {
  background-size: 100% 2px;
}
```

**ユースケース:** モダンなリンク装飾

### 7. テキスト色のスライド

色が左から右にスライド。

```css
.text {
  position: relative;
  background: linear-gradient(to right, #007bff 50%, #333 50%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 100%;
  background-position: 100%;
  transition: background-position 0.3s ease;
}

.text:hover {
  background-position: 0%;
}
```

**ユースケース:** 洗練されたテキストエフェクト

### 8. 色と背景のスライド

テキスト色と背景色が同時にスライド。

```css
.text {
  position: relative;
  color: #333;
  background: linear-gradient(to right, white 50%, #007bff 50%);
  background-size: 200% 100%;
  background-position: 100%;
  padding: 0.5em 1em;
  transition: background-position 0.3s ease, color 0.3s ease;
}

.text:hover {
  background-position: 0%;
  color: white;
}
```

**ユースケース:** ボタン風リンク

### 9. 背景画像での色遷移

`background-image` でカラフルな遷移。

```css
.text {
  position: relative;
  background-image: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f7b731);
  background-size: 400% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.text:hover {
  animation-play-state: paused;
}
```

**ユースケース:** クリエイティブな演出

### 10. 一瞬のぼかし

ホバー時に一瞬ぼかす。

```css
.text {
  transition: filter 0.2s ease;
}

.text:hover {
  filter: blur(4px);
  animation: blur-in 0.2s ease forwards;
}

@keyframes blur-in {
  to { filter: blur(0); }
}
```

**ユースケース:** 繊細なインタラクション

### 11. 背景のぼかし

`backdrop-filter` で背景をぼかす。

```css
.text {
  position: relative;
  padding: 0.5em 1em;
}

.text::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(0px);
  transition: backdrop-filter 0.3s ease;
  z-index: -1;
  border-radius: 4px;
}

.text:hover::before {
  backdrop-filter: blur(10px);
}
```

**ブラウザサポート注意:**
- Safari 18.0 以前は `-webkit-backdrop-filter` が必要
- Safari 18.0+ ではプレフィックス不要

**ユースケース:** ガラスモーフィズム風デザイン

## アクセシビリティ考慮

### タッチデバイスでの無効化

ホバーできないデバイスでアニメーションを無効化。

```css
@media (any-hover: hover) {
  .text:hover {
    /* ホバーアニメーション */
  }
}
```

**理由:**
- タッチデバイスではホバー状態が持続する可能性
- 意図しないアニメーションを防ぐ

### モーション軽減の考慮

アニメーションを好まないユーザーへの配慮。

```css
@media (prefers-reduced-motion: reduce) {
  .text {
    transition: none;
    animation: none;
  }
}
```

## パフォーマンス最適化

### GPU アクセラレーション

`transform` と `opacity` を優先的に使用。

```css
.text {
  /* ✅ GPU アクセラレーション対応 */
  transform: translateX(0);
  opacity: 1;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.text:hover {
  transform: translateX(10px);
  opacity: 0.8;
}
```

### 避けるべきプロパティ

```css
.text {
  /* ❌ レイアウトを引き起こす（重い） */
  width: 100px;
  height: 50px;
  transition: width 0.3s ease, height 0.3s ease;
}
```

**理由:** `width`, `height`, `top`, `left` などはリフローを引き起こし、パフォーマンスが低下。

### will-change の使用

複雑なアニメーションには `will-change` を使用。

```css
.text {
  will-change: transform;
}

.text:hover {
  transform: rotate(360deg);
}
```

**注意:** 過度な使用は逆効果。必要な場合のみ適用。

## 組み合わせ例

複数のエフェクトを組み合わせる。

```css
.text {
  position: relative;
  display: inline-block;
  letter-spacing: 0.05em;
  background: linear-gradient(to right, #007bff 50%, #333 50%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 100%;
  background-position: 100%;
  transition:
    letter-spacing 0.3s ease,
    background-position 0.3s ease,
    transform 0.3s ease;
}

.text:hover {
  letter-spacing: 0.2em;
  background-position: 0%;
  transform: translateY(-2px);
}
```

**効果:**
- 文字間隔拡張 + 色スライド + 上方向移動

## ユースケース

- **ナビゲーションリンク:** シンプルなホバー効果
- **CTAボタン:** 強調したいリンク
- **フッターリンク:** 控えめなアニメーション
- **ポートフォリオサイト:** クリエイティブな演出
- **ランディングページ:** 目を引くインタラクション

## 注意点

### ブラウザサポート

- `backdrop-filter`: Safari 18.0+ でプレフィックス不要
- `background-clip: text`: 全モダンブラウザ対応（-webkit-プレフィックス必要）
- `letter-spacing`: 全ブラウザ対応

### アニメーション時間

- **短い（0.2s）:** すばやいフィードバック
- **中程度（0.3s）:** バランスの取れた演出
- **長い（0.5s以上）:** ゆったりとした動き

### イージング関数

- `ease`: 自然な加減速
- `ease-in-out`: 滑らかな開始と終了
- `cubic-bezier()`: カスタム曲線

## 関連技術

- **CSS Transitions:** プロパティの変化をアニメーション
- **CSS Animations (@keyframes):** 複雑なアニメーション定義
- **CSS Transform:** 要素の変形
- **CSS Filter:** 視覚効果の適用
- **backdrop-filter:** 背景のぼかし効果
- **background-clip:** 背景のクリッピング
- **@media (any-hover):** ホバー可能デバイスの判定
- **@media (prefers-reduced-motion):** モーション軽減の設定

## 参考リンク

- [transition - CSS - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/transition)
- [transform - CSS - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [backdrop-filter - CSS - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
- [prefers-reduced-motion - CSS - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [background-clip - CSS - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip)
