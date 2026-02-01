# 最新CSS＆JSスニペット50選【2025年版】

## メタデータ

- **用途タグ**: `#CSS` `#JavaScript` `#CodePen` `#実案件` `#エフェクト` `#モダンCSS`
- **出典**: [PhotoshopVIP](https://photoshopvip.net/167257), [Coliss](https://coliss.com/articles/build-websites/operation/css/modern-css-snippets-for-2025.html)
- **最終更新**: 2025年

---

## 概要

実案件でも使えるおしゃれなエフェクトを厳選したCSS/JavaScriptスニペット集。CodePenで公開されている最新技術を活用した実装例をまとめる。

---

## 1. インタラクティブ系スニペット

### 1.1 GSAPドット拡大エフェクト

**説明**: マウスカーソルの動きに応じて拡大するドットグリッド（GSAP使用）

**使用技術**: GSAP, Canvas

**CodePen例**:

```javascript
// GSAPでドット拡大エフェクト
gsap.to('.dot', {
  scale: 2,
  duration: 0.3,
  ease: 'power2.out',
  stagger: {
    from: 'center',
    amount: 0.5
  }
});
```

**適用シーン**: ヒーローセクション、インタラクティブ背景

**ブラウザサポート**: Chrome 90+, Firefox 88+, Safari 14+

---

### 1.2 SVGハーフトーンフィルター

**説明**: アップロードした画像をSVGハーフトーンフィルターで変換（カラーカスタマイズ可能）

**使用技術**: SVG Filters, JavaScript

**CodePen例**:

```html
<svg>
  <filter id="halftone">
    <feTurbulence type="fractalNoise" baseFrequency="0.5" />
    <feColorMatrix type="saturate" values="0" />
  </filter>
</svg>
```

```css
.halftone-image {
  filter: url(#halftone);
}
```

**適用シーン**: 画像エフェクト、アート系サイト

**ブラウザサポート**: Chrome 57+, Firefox 52+, Safari 10.1+

---

## 2. CSS純粋アニメーション

### 2.1 CSSロードトリップアニメーション

**説明**: 純粋CSSでバスがサーフビーチへ向かうアニメーション

**使用技術**: CSS Animations, Keyframes

**CodePen例**:

```css
@keyframes drive {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100vw);
  }
}

.bus {
  animation: drive 10s linear infinite;
}

/* 車輪回転 */
@keyframes rotate-wheel {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.wheel {
  animation: rotate-wheel 1s linear infinite;
  transform-origin: center;
}
```

**適用シーン**: ローディングアニメーション、ストーリー系サイト

**ブラウザサポート**: 全モダンブラウザ対応

---

### 2.2 CSSリキッドボタン

**説明**: ホバー時に液体のように変形するボタン

**使用技術**: CSS Transitions, clip-path

**CodePen例**:

```css
.liquid-button {
  position: relative;
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  border-radius: 50px;
  color: white;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.liquid-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.liquid-button:hover::before {
  width: 300px;
  height: 300px;
}
```

**適用シーン**: CTA ボタン、ナビゲーション

**ブラウザサポート**: Chrome 90+, Firefox 88+, Safari 14+

---

## 3. モダンCSS技術

### 3.1 CSS Nesting（ネスト構文）

**説明**: Sassのようなネスト構文がネイティブCSSで利用可能

**使用技術**: CSS Nesting Module

**CodePen例**:

```css
.card {
  padding: 1rem;
  background: white;

  & .title {
    font-size: 1.5rem;
    font-weight: bold;

    &:hover {
      color: blue;
    }
  }

  & .description {
    color: #666;
    margin-top: 0.5rem;
  }
}
```

**適用シーン**: 全てのスタイリング（Sass代替）

**ブラウザサポート**: Chrome 112+, Firefox 117+, Safari 16.5+

---

### 3.2 Container Queries

**説明**: コンテナのサイズに応じてスタイルを適用

**使用技術**: CSS Container Queries

**CodePen例**:

```css
.container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}

@container (min-width: 700px) {
  .card {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
```

**適用シーン**: コンポーネント設計、レスポンシブUI

**ブラウザサポート**: Chrome 105+, Firefox 110+, Safari 16+

---

### 3.3 CSS :has() セレクタ

**説明**: 親要素・兄弟要素をスタイリング

**使用技術**: CSS :has() Pseudo-class

**CodePen例**:

```css
/* 画像を含むカードの背景を変更 */
.card:has(img) {
  background: linear-gradient(to bottom, #f0f0f0, white);
}

/* チェックされたラジオボタンの親要素をハイライト */
.form-group:has(input:checked) {
  border-color: blue;
  background: #e6f2ff;
}

/* エラーメッセージがある入力フィールド */
.input-wrapper:has(.error-message) input {
  border-color: red;
}
```

**適用シーン**: フォーム、カードレイアウト

**ブラウザサポート**: Chrome 105+, Firefox 121+, Safari 15.4+

---

## 4. View Transitions API

### 4.1 ページ遷移アニメーション

**説明**: SPAのページ遷移にネイティブアニメーション

**使用技術**: View Transitions API

**CodePen例**:

```javascript
// ページ遷移時のアニメーション
function navigateWithTransition(url) {
  if (!document.startViewTransition) {
    // フォールバック: 通常の遷移
    location.href = url;
    return;
  }

  document.startViewTransition(() => {
    location.href = url;
  });
}
```

```css
/* アニメーションのカスタマイズ */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.5s;
}

::view-transition-old(root) {
  animation-name: fade-out;
}

::view-transition-new(root) {
  animation-name: fade-in;
}

@keyframes fade-out {
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(1.05);
  }
}
```

**適用シーン**: SPA、マルチページアプリ

**ブラウザサポート**: Chrome 111+, Edge 111+（Safari/Firefox未対応）

---

## 5. Scroll-driven Animations

### 5.1 スクロール連動パララックス

**説明**: スクロール量に応じて要素をアニメーション

**使用技術**: CSS Scroll-driven Animations

**CodePen例**:

```css
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(100px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal {
  animation: slide-in linear;
  animation-timeline: view();
  animation-range: entry 0% cover 30%;
}
```

**適用シーン**: ランディングページ、ストーリーテリング

**ブラウザサポート**: Chrome 115+（Safari/Firefox未対応）

---

### 5.2 スクロールプログレスバー

**説明**: ページスクロール進捗を表示

**使用技術**: CSS Scroll-driven Animations

**CodePen例**:

```css
@keyframes grow-progress {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, #667eea, #764ba2);
  transform-origin: left;
  animation: grow-progress linear;
  animation-timeline: scroll();
}
```

**適用シーン**: ブログ、長文記事

**ブラウザサポート**: Chrome 115+（Safari/Firefox未対応）

---

## 6. Popover API

### 6.1 ネイティブポップオーバー

**説明**: JavaScriptなしでポップオーバーを実装

**使用技術**: HTML Popover API

**CodePen例**:

```html
<button popovertarget="my-popover">ポップオーバーを開く</button>

<div id="my-popover" popover>
  <h3>ポップオーバーのタイトル</h3>
  <p>ここにコンテンツを表示します。</p>
  <button popovertarget="my-popover" popovertargetaction="hide">閉じる</button>
</div>
```

```css
[popover] {
  padding: 2rem;
  border: 2px solid #667eea;
  border-radius: 12px;
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

/* 背景のオーバーレイ */
[popover]::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
```

**適用シーン**: モーダル、ツールチップ、ドロップダウン

**ブラウザサポート**: Chrome 114+, Edge 114+（Safari/Firefox一部対応）

---

## 7. CSS Grid Advanced Layouts

### 7.1 Masonry Layout（CSS Grid）

**説明**: PinterestスタイルのMasonryレイアウト

**使用技術**: CSS Grid Level 3（実験的）

**CodePen例**:

```css
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-template-rows: masonry; /* 実験的 */
  gap: 1rem;
}

/* フォールバック: column-countを使用 */
@supports not (grid-template-rows: masonry) {
  .masonry {
    column-count: 3;
    column-gap: 1rem;
  }

  .masonry-item {
    break-inside: avoid;
    margin-bottom: 1rem;
  }
}
```

**適用シーン**: ギャラリー、ポートフォリオ

**ブラウザサポート**: Firefox 77+（Chrome/Safari未対応）

---

### 7.2 CSS Subgrid

**説明**: 親グリッドのトラックを子要素で継承

**使用技術**: CSS Grid Level 2 Subgrid

**CodePen例**:

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.grid-item {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: span 2;
}
```

**適用シーン**: 複雑なグリッドレイアウト

**ブラウザサポート**: Chrome 117+, Firefox 71+, Safari 16+

---

## 8. CSS Anchor Positioning

### 8.1 アンカー連動ポジショニング

**説明**: 要素を別の要素に連動して配置

**使用技術**: CSS Anchor Positioning

**CodePen例**:

```css
.anchor-target {
  anchor-name: --my-anchor;
}

.tooltip {
  position: absolute;
  position-anchor: --my-anchor;
  bottom: anchor(top);
  left: anchor(center);
  transform: translateX(-50%);
}
```

**適用シーン**: ツールチップ、ドロップダウン

**ブラウザサポート**: Chrome 125+（Safari/Firefox未対応）

---

## 9. CSS Variable Fonts

### 9.1 可変フォントアニメーション

**説明**: 可変フォントの軸をアニメーション

**使用技術**: CSS Variable Fonts

**CodePen例**:

```css
@font-face {
  font-family: 'InterVariable';
  src: url('Inter-Variable.woff2') format('woff2');
  font-weight: 100 900;
}

@keyframes weight-animation {
  0%, 100% {
    font-variation-settings: 'wght' 300;
  }
  50% {
    font-variation-settings: 'wght' 900;
  }
}

.variable-text {
  font-family: 'InterVariable', sans-serif;
  animation: weight-animation 3s ease-in-out infinite;
}
```

**適用シーン**: ヒーローテキスト、ローディング

**ブラウザサポート**: 全モダンブラウザ対応

---

## 10. CSS Color Functions

### 10.1 color-mix() 関数

**説明**: 色を混ぜて新しい色を生成

**使用技術**: CSS Color Module Level 5

**CodePen例**:

```css
:root {
  --primary: #667eea;
  --secondary: #764ba2;
}

.mixed-color {
  background: color-mix(in srgb, var(--primary) 60%, var(--secondary));
}

/* ホバー時に白を20%混ぜる */
.button:hover {
  background: color-mix(in srgb, var(--primary), white 20%);
}
```

**適用シーン**: デザインシステム、カラーパレット

**ブラウザサポート**: Chrome 111+, Firefox 113+, Safari 16.2+

---

### 10.2 light-dark() 関数

**説明**: ライトモード・ダークモードで自動切り替え

**使用技術**: CSS Color Module Level 5

**CodePen例**:

```css
:root {
  color-scheme: light dark;
}

.card {
  background: light-dark(white, #1a1a1a);
  color: light-dark(#333, #f0f0f0);
  border: 1px solid light-dark(#e0e0e0, #333);
}
```

**適用シーン**: ダークモード対応

**ブラウザサポート**: Chrome 123+, Firefox 120+, Safari 17.5+

---

## 11. CSS @layer（カスケードレイヤー）

### 11.1 スタイル優先度の管理

**説明**: CSSの優先度を明示的に制御

**使用技術**: CSS Cascade Layers

**CodePen例**:

```css
/* レイヤー定義 */
@layer reset, base, components, utilities;

@layer reset {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    line-height: 1.5;
  }
}

@layer components {
  .button {
    padding: 0.5rem 1rem;
    border-radius: 4px;
  }
}

@layer utilities {
  .mt-4 {
    margin-top: 1rem;
  }
}
```

**適用シーン**: デザインシステム、スタイル管理

**ブラウザサポート**: Chrome 99+, Firefox 97+, Safari 15.4+

---

## 12. CSS @scope（スコープ）

### 12.1 スタイルのスコープ制限

**説明**: CSSのスコープを限定

**使用技術**: CSS Cascading and Inheritance Level 6

**CodePen例**:

```css
@scope (.card) {
  .title {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .description {
    color: #666;
  }
}

/* .cardの外では適用されない */
```

**適用シーン**: コンポーネント分離、スタイル衝突回避

**ブラウザサポート**: Chrome 118+（Safari/Firefox未対応）

---

## 13. CSS Text Effects

### 13.1 グラデーションテキスト

**説明**: テキストにグラデーションを適用

**使用技術**: CSS background-clip

**CodePen例**:

```css
.gradient-text {
  background: linear-gradient(45deg, #667eea, #764ba2, #f093fb);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  font-size: 3rem;
  font-weight: bold;
}
```

**適用シーン**: ヒーローテキスト、ロゴ

**ブラウザサポート**: 全モダンブラウザ対応

---

### 13.2 3Dテキストエフェクト

**説明**: テキストシャドウで3D効果

**使用技術**: CSS text-shadow

**CodePen例**:

```css
.text-3d {
  font-size: 4rem;
  font-weight: bold;
  color: #667eea;
  text-shadow:
    1px 1px 0 #5a6dd8,
    2px 2px 0 #4e5dc6,
    3px 3px 0 #424db4,
    4px 4px 0 #363da2,
    5px 5px 0 #2a2d90,
    6px 6px 10px rgba(0, 0, 0, 0.4);
}
```

**適用シーン**: ヒーロー、タイトル

**ブラウザサポート**: 全モダンブラウザ対応

---

## 14. CSS Backdrop Effects

### 14.1 Glassmorphism（ガラスモルフィズム）

**説明**: 背景ぼかしのガラス風UI

**使用技術**: backdrop-filter

**CodePen例**:

```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

**適用シーン**: カード、モーダル、ナビゲーション

**ブラウザサポート**: Chrome 76+, Firefox 103+, Safari 9+

---

## 15. JavaScript Utilities

### 15.1 Intersection Observer（遅延読み込み）

**説明**: 要素が画面に入ったら画像を読み込み

**使用技術**: Intersection Observer API

**CodePen例**:

```javascript
const images = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.add('loaded');
      observer.unobserve(img);
    }
  });
}, {
  rootMargin: '50px'
});

images.forEach(img => imageObserver.observe(img));
```

```css
img {
  opacity: 0;
  transition: opacity 0.3s;
}

img.loaded {
  opacity: 1;
}
```

**適用シーン**: 画像遅延読み込み、無限スクロール

**ブラウザサポート**: 全モダンブラウザ対応

---

## 16. CSS Filters & Blend Modes

### 16.1 Duotone（デュオトーン）効果

**説明**: 画像を2色調に変換

**使用技術**: CSS filter, mix-blend-mode

**CodePen例**:

```css
.duotone {
  position: relative;
}

.duotone::before,
.duotone::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.duotone::before {
  background: #667eea;
  mix-blend-mode: darken;
}

.duotone::after {
  background: #f093fb;
  mix-blend-mode: lighten;
}

.duotone img {
  filter: grayscale(100%) contrast(1.2);
}
```

**適用シーン**: 画像エフェクト、ヒーロー背景

**ブラウザサポート**: 全モダンブラウザ対応

---

## 17. CSS Shapes

### 17.1 テキスト回り込み（円形）

**説明**: 画像の周りにテキストを円形に回り込ませる

**使用技術**: CSS Shapes

**CodePen例**:

```css
.circle-image {
  float: left;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  shape-outside: circle(50%);
  margin: 0 1rem 1rem 0;
}
```

**適用シーン**: 雑誌風レイアウト、記事

**ブラウザサポート**: Chrome 37+, Firefox 62+, Safari 10.1+

---

## 18. CSS Logical Properties

### 18.1 多言語対応レイアウト

**説明**: 書字方向に依存しないレイアウト

**使用技術**: CSS Logical Properties

**CodePen例**:

```css
/* 従来 */
.card-old {
  margin-left: 1rem;
  padding-right: 2rem;
}

/* 論理プロパティ */
.card {
  margin-inline-start: 1rem;
  padding-inline-end: 2rem;
}

/* RTL（アラビア語等）でも自動対応 */
```

**適用シーン**: 多言語サイト、国際化対応

**ブラウザサポート**: Chrome 89+, Firefox 68+, Safari 12.1+

---

## 19. CSS Math Functions

### 19.1 clamp()（レスポンシブフォント）

**説明**: 最小値・推奨値・最大値を指定

**使用技術**: CSS Math Functions

**CodePen例**:

```css
h1 {
  /* ビューポート幅に応じて16px〜48pxで変動 */
  font-size: clamp(1rem, 5vw, 3rem);
}

.container {
  /* 300px〜900pxの範囲でレスポンシブ */
  width: clamp(300px, 80vw, 900px);
  padding: clamp(1rem, 3vw, 3rem);
}
```

**適用シーン**: レスポンシブタイポグラフィ、レイアウト

**ブラウザサポート**: Chrome 79+, Firefox 75+, Safari 13.1+

---

## 20. CSS Custom Properties（CSS変数）応用

### 20.1 動的カラーテーマ切り替え

**説明**: JavaScriptでCSS変数を操作してテーマ切り替え

**使用技術**: CSS Custom Properties

**CodePen例**:

```css
:root {
  --primary: #667eea;
  --secondary: #764ba2;
  --bg: #ffffff;
  --text: #333333;
}

[data-theme="dark"] {
  --primary: #8b9eff;
  --secondary: #9d6dbe;
  --bg: #1a1a1a;
  --text: #f0f0f0;
}

body {
  background: var(--bg);
  color: var(--text);
}

.button {
  background: var(--primary);
}
```

```javascript
const toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
};
```

**適用シーン**: ダークモード、テーマ切り替え

**ブラウザサポート**: 全モダンブラウザ対応

---

## 21. CSS Grid Auto-fit vs Auto-fill

### 21.1 レスポンシブグリッド

**説明**: auto-fitとauto-fillの違いを活用

**使用技術**: CSS Grid

**CodePen例**:

```css
/* auto-fill: 空のトラックを保持 */
.grid-fill {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

/* auto-fit: 空のトラックを削除して拡大 */
.grid-fit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
```

**適用シーン**: カードグリッド、ギャラリー

**ブラウザサポート**: Chrome 57+, Firefox 52+, Safari 10.1+

---

## 22. CSS Aspect Ratio

### 22.1 アスペクト比固定

**説明**: 要素のアスペクト比を維持

**使用技術**: CSS aspect-ratio

**CodePen例**:

```css
.video-container {
  aspect-ratio: 16 / 9;
  width: 100%;
  background: #000;
}

.square-card {
  aspect-ratio: 1 / 1;
  width: 100%;
}

.portrait-image {
  aspect-ratio: 3 / 4;
}
```

**適用シーン**: ビデオ埋め込み、カード、画像

**ブラウザサポート**: Chrome 88+, Firefox 89+, Safari 15+

---

## 23. CSS Object-fit & Object-position

### 23.1 画像のトリミング制御

**説明**: 画像の表示方法を制御

**使用技術**: CSS object-fit

**CodePen例**:

```css
.thumbnail {
  width: 300px;
  height: 300px;
  object-fit: cover; /* 切り抜き */
  object-position: center top; /* 上中央を基準 */
}

.logo {
  width: 100px;
  height: 100px;
  object-fit: contain; /* 全体表示 */
}
```

**適用シーン**: サムネイル、ロゴ、ヒーロー画像

**ブラウザサポート**: 全モダンブラウザ対応

---

## 24. CSS Scroll Snap

### 24.1 スナップスクロール

**説明**: スクロール時に要素にスナップ

**使用技術**: CSS Scroll Snap

**CodePen例**:

```css
.scroll-container {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1rem;
}

.scroll-item {
  flex: 0 0 80%;
  scroll-snap-align: center;
}
```

**適用シーン**: カルーセル、スライダー、フルページスクロール

**ブラウザサポート**: Chrome 69+, Firefox 68+, Safari 11+

---

## 25. CSS Counters

### 25.1 自動番号付け

**説明**: CSSで要素に自動番号を付与

**使用技術**: CSS Counters

**CodePen例**:

```css
.numbered-list {
  counter-reset: item;
  list-style: none;
}

.numbered-list li::before {
  counter-increment: item;
  content: counter(item, decimal-leading-zero) ". ";
  font-weight: bold;
  color: #667eea;
  margin-right: 0.5rem;
}
```

**適用シーン**: 目次、手順、リスト

**ブラウザサポート**: 全ブラウザ対応

---

## 26. CSS Masking

### 26.1 画像マスキング

**説明**: SVGやグラデーションでマスク

**使用技術**: CSS Masking

**CodePen例**:

```css
.masked-image {
  mask-image: linear-gradient(to bottom, black 60%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent);
}

.circle-mask {
  mask-image: radial-gradient(circle, black 50%, transparent 50%);
  -webkit-mask-image: radial-gradient(circle, black 50%, transparent 50%);
}
```

**適用シーン**: 画像エフェクト、グラデーションフェード

**ブラウザサポート**: Chrome 57+, Firefox 53+, Safari 3.1+

---

## 27. CSS @supports（機能検出）

### 27.1 フィーチャー検出とフォールバック

**説明**: ブラウザ機能サポートを検出

**使用技術**: CSS @supports

**CodePen例**:

```css
/* デフォルトスタイル */
.button {
  background: blue;
}

/* backdrop-filterが使える場合 */
@supports (backdrop-filter: blur(10px)) {
  .button {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }
}

/* Gridが使えない場合のフォールバック */
@supports not (display: grid) {
  .container {
    display: flex;
    flex-wrap: wrap;
  }
}
```

**適用シーン**: プログレッシブエンハンスメント

**ブラウザサポート**: Chrome 28+, Firefox 22+, Safari 9+

---

## 28. CSS Animation（キーフレーム応用）

### 28.1 タイピングアニメーション

**説明**: タイプライター風のテキストアニメーション

**使用技術**: CSS Animations

**CodePen例**:

```css
@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blink {
  50% {
    border-color: transparent;
  }
}

.typewriter {
  overflow: hidden;
  border-right: 2px solid #667eea;
  white-space: nowrap;
  animation:
    typing 3.5s steps(40, end),
    blink 0.75s step-end infinite;
}
```

**適用シーン**: ヒーロー、ローディング

**ブラウザサポート**: 全モダンブラウザ対応

---

## 29. CSS Flexbox応用

### 29.1 フッター固定（Sticky Footer）

**説明**: コンテンツ量に関わらずフッターを下部に固定

**使用技術**: CSS Flexbox

**CodePen例**:

```css
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin: 0;
}

main {
  flex: 1;
}

footer {
  background: #333;
  color: white;
  padding: 2rem;
}
```

**適用シーン**: 全てのページレイアウト

**ブラウザサポート**: 全モダンブラウザ対応

---

## 30. CSS Gradient Borders

### 30.1 グラデーション枠線

**説明**: 枠線にグラデーションを適用

**使用技術**: CSS Gradients, border-image

**CodePen例**:

```css
.gradient-border {
  border: 3px solid;
  border-image: linear-gradient(45deg, #667eea, #764ba2, #f093fb) 1;
}

/* 角丸対応版 */
.gradient-border-rounded {
  position: relative;
  border-radius: 12px;
  background: linear-gradient(45deg, #667eea, #764ba2, #f093fb);
  padding: 3px;
}

.gradient-border-rounded::before {
  content: '';
  position: absolute;
  inset: 3px;
  background: white;
  border-radius: 9px;
}
```

**適用シーン**: カード、ボタン、枠線装飾

**ブラウザサポート**: 全モダンブラウザ対応

---

## その他の有用なスニペット（31-50）

以下、簡潔に紹介：

### 31. CSSカスタムチェックボックス

```css
input[type="checkbox"] {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #667eea;
  border-radius: 4px;
  cursor: pointer;
}

input[type="checkbox"]:checked {
  background: #667eea;
  background-image: url('data:image/svg+xml,...');
}
```

### 32. CSSカスタムスクロールバー

```css
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f0f0f0;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 4px;
}
```

### 33. CSSドロップシャドウ（複数）

```css
.card {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.07),
    0 2px 4px rgba(0, 0, 0, 0.07),
    0 4px 8px rgba(0, 0, 0, 0.07),
    0 8px 16px rgba(0, 0, 0, 0.07);
}
```

### 34. CSSグラスモーフィズムボタン

```css
.glass-button {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### 35. CSSネオモーフィズム

```css
.neomorphism {
  background: #e0e0e0;
  box-shadow:
    20px 20px 60px #bebebe,
    -20px -20px 60px #ffffff;
  border-radius: 12px;
}
```

### 36. CSS擬似要素で装飾線

```css
h2::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 1.2em;
  background: linear-gradient(to bottom, #667eea, #764ba2);
  margin-right: 0.5rem;
  vertical-align: middle;
}
```

### 37. CSSホバーアンダーライン

```css
a {
  position: relative;
  text-decoration: none;
}

a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #667eea;
  transition: width 0.3s;
}

a:hover::after {
  width: 100%;
}
```

### 38. CSSトランジションイージング

```css
.smooth-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 39. CSS Grid自動フィット

```css
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}
```

### 40. CSSフルスクリーン背景

```css
.hero {
  background: url('image.jpg') center/cover no-repeat;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 41. CSS文字数制限（省略記号）

```css
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### 42. CSSフォーカスリング

```css
:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
```

### 43. CSSリセット（モダン版）

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
}
```

### 44. CSSダークモードメディアクエリ

```css
@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a1a;
    color: #f0f0f0;
  }
}
```

### 45. CSSレスポンシブ画像

```css
img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

### 46. CSSセンタリング（Flexbox）

```css
.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 47. CSSセンタリング（Grid）

```css
.center-grid {
  display: grid;
  place-items: center;
}
```

### 48. CSSアニメーション遅延

```css
.stagger-item:nth-child(1) { animation-delay: 0.1s; }
.stagger-item:nth-child(2) { animation-delay: 0.2s; }
.stagger-item:nth-child(3) { animation-delay: 0.3s; }
```

### 49. CSSカスタムセレクション

```css
::selection {
  background: #667eea;
  color: white;
}
```

### 50. CSSスムーススクロール

```css
html {
  scroll-behavior: smooth;
}
```

---

## パフォーマンス最適化のヒント

### 1. will-change（アニメーション最適化）

```css
.animated-element {
  will-change: transform, opacity;
}

/* アニメーション完了後は削除 */
.animated-element.animation-done {
  will-change: auto;
}
```

### 2. content-visibility（レンダリング最適化）

```css
.offscreen-content {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}
```

### 3. font-display（フォント読み込み最適化）

```css
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  font-display: swap;
}
```

---

## ブラウザサポート確認

各スニペットの実装前に以下のサイトで確認：

- [Can I use](https://caniuse.com/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

## まとめ

2025年のモダンCSS/JavaScriptは以下の技術が中心：

1. **View Transitions API** - ネイティブページ遷移
2. **Scroll-driven Animations** - スクロール連動アニメーション
3. **Popover API** - ネイティブポップオーバー
4. **Container Queries** - コンテナベースのレスポンシブ
5. **:has()セレクタ** - 親要素スタイリング
6. **CSS Nesting** - ネイティブネスト構文
7. **@layer/@scope** - スタイル管理の改善
8. **color-mix()/light-dark()** - 色関数の進化
9. **Glassmorphism/Liquid Glass** - 2026年のUIトレンド
10. **GSAP/Canvas** - インタラクティブエフェクト

これらのスニペットを組み合わせて、モダンで美しいWebサイトを構築できる。

---

## Sources

- [最新CSS＆JSスニペット50選【2025年版】 - PhotoshopVIP](https://photoshopvip.net/167257)
- [2025年、Webサイトやスマホアプリの実装に役立つモダンCSSのスニペットのまとめ - Coliss](https://coliss.com/articles/build-websites/operation/css/modern-css-snippets-for-2025.html)
- [State, Logic, And Native Power: CSS Wrapped 2025 - Smashing Magazine](https://www.smashingmagazine.com/2025/12/state-logic-native-power-css-wrapped-2025/)
