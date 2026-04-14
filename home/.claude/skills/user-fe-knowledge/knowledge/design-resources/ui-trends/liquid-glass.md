# Liquid Glass UI - iOS 26 デザイントレンド

## メタデータ

- **用途タグ**: `#iOS26` `#Glassmorphism` `#Apple` `#UIDesign` `#2026Trend` `#LiquidDesign`
- **出典**:
  - [UI Design Trend 2026 #2: Glassmorphism and Liquid Design Make a Comeback - Medium](https://medium.com/design-bootcamp/ui-design-trend-2026-2-glassmorphism-and-liquid-design-make-a-comeback-50edb60ca81e)
  - [Liquid Glass UI: iOS 26 Redesign - DesignMonks](https://www.designmonks.co/blog/liquid-glass-ui)
  - [Apple introduces a delightful and elegant new software design - Apple Newsroom](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/)
  - [Glassmorphism in 2025: How Apple's Liquid Glass is reshaping interface design - EverydayUX](https://www.everydayux.net/glassmorphism-apple-liquid-glass-interface-design/)
  - [Liquid Glass is here — how should designers respond? - LogRocket](https://blog.logrocket.com/ux-design/apple-liquid-glass-ui/)
- **最終更新**: 2026年1月

---

## 概要

**Liquid Glass**は、Apple が WWDC 2025 で発表した新しいソフトウェアデザイン言語。iOS 26、iPadOS 26、macOS Tahoe 26、watchOS 26、tvOS 26 に採用される。

ガラスの透過性・屈折・深度・モーション応答性を模倣し、コンテンツ・光・インタラクションに応じて動的に変化する次世代マテリアルシステム。

---

## Liquid Glassとは

### 定義

Liquid Glassは、**ガラスの物理特性を模倣した動的マテリアルシステム**。以下の特性を持つ：

1. **Translucency（透過性）**: 背景が透けて見える
2. **Refraction（屈折）**: 光が曲がる
3. **Depth（深度）**: レイヤーの重なり
4. **Motion Responsiveness（モーション応答）**: インタラクションに応じて変形
5. **Content Adaptation（コンテンツ適応）**: コンテンツに応じてマテリアルが変化

---

### GlassmorphismとLiquid Glassの違い

| 観点 | Glassmorphism | Liquid Glass |
|------|---------------|--------------|
| **透過性** | 静的な半透明 | 動的に変化する透過 |
| **屈折** | 単純なぼかし | 光の屈折を再現 |
| **エッジ** | 固定された境界 | ソフトフェード |
| **深度** | 平面的 | 多層レイヤー |
| **動き** | 静的 | 流動的 |
| **精度** | 概念的 | リアリスティック |

**Liquid Glassの方が洗練されており、ガラスの物理特性をより正確に再現する。**

---

## デザイン哲学

### Appleの意図

Liquid Glassは、iOS 7（2013年）でJony Iveが導入したフラットデザインから、**より表現的でスキューモーフィックな要素**へのシフトを示している。

#### 目標

1. **Focus on Content（コンテンツへの集中）**: マテリアルが動的に変化してコンテンツを強調
2. **Delight and Elegance（喜びと優雅さ）**: 流動的で生き生きとしたインターフェース
3. **Haptic Feedback（触覚フィードバック）**: インタラクションに応じた即座の視覚的反応

---

### 主要な使用箇所（iOS 26）

Apple は iOS 26 で以下の箇所に Liquid Glass を適用：

1. **Navigation Bars（ナビゲーションバー）**: スクロールに応じて透過性が変化
2. **Page Overlays（ページオーバーレイ）**: モーダル、ポップオーバー
3. **Control Center（コントロールセンター）**: 背景とのブレンド
4. **Widgets（ウィジェット）**: ホーム画面の背景との調和

---

## 技術実装

### CSS実装例

#### 基本的なLiquid Glassスタイル

```css
.liquid-glass {
  /* 背景の半透明 */
  background: rgba(255, 255, 255, 0.15);

  /* 背景ぼかし + 彩度強調 */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  /* 境界線のソフトフェード */
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;

  /* 複数レイヤーのシャドウで深度表現 */
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.5),
    inset 0 -1px 1px rgba(0, 0, 0, 0.05);
}
```

---

#### ダークモード対応

```css
:root {
  --glass-bg: rgba(255, 255, 255, 0.15);
  --glass-border: rgba(255, 255, 255, 0.25);
  --glass-shadow: rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  --glass-bg: rgba(0, 0, 0, 0.3);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-shadow: rgba(0, 0, 0, 0.4);
}

.liquid-glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 8px 32px var(--glass-shadow);
}
```

---

#### インタラクティブな変化（ホバー・フォーカス）

```css
.liquid-glass-interactive {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;

  /* スムーズな遷移 */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.liquid-glass-interactive:hover {
  /* ホバー時に透過性を増す */
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);

  /* シャドウを強調 */
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.6);

  /* 軽く浮き上がる */
  transform: translateY(-2px);
}

.liquid-glass-interactive:active {
  /* 押下時に透過性を下げる */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);

  /* シャドウを小さく */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  /* 押し込み */
  transform: translateY(0);
}
```

---

#### スクロール連動の透過性変化（Navigation Bar）

```css
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  padding: 1rem 2rem;

  /* 初期状態: 完全透明 */
  background: rgba(255, 255, 255, 0);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);

  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar.scrolled {
  /* スクロール後: Liquid Glass */
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
```

```javascript
// スクロール検出
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});
```

---

#### 屈折効果（Lensing Effect）

```css
.liquid-glass-lens {
  position: relative;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 24px;
  overflow: hidden;
}

/* 光の屈折を模倣する擬似要素 */
.liquid-glass-lens::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.3) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.liquid-glass-lens:hover::before {
  opacity: 1;
}

/* 屈折エッジのハイライト */
.liquid-glass-lens::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  mask: linear-gradient(135deg, black 0%, transparent 50%, black 100%);
  -webkit-mask: linear-gradient(135deg, black 0%, transparent 50%, black 100%);
  pointer-events: none;
}
```

---

#### カードレイアウト例

```html
<div class="liquid-glass-card">
  <img src="image.jpg" alt="Card Image" />
  <div class="card-content">
    <h3>カードタイトル</h3>
    <p>カードの説明文がここに入ります。</p>
  </div>
</div>
```

```css
.liquid-glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.liquid-glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.liquid-glass-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
}

.card-content h3 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.card-content p {
  margin: 0;
  color: rgba(0, 0, 0, 0.7);
}
```

---

#### モーダル/ポップオーバー

```css
.liquid-glass-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 500px;
  width: 90%;

  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow:
    0 16px 64px rgba(0, 0, 0, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.6);

  padding: 2rem;
}

/* 背景オーバーレイもLiquid Glass */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
```

---

## デザインガイドライン

### 適切な使用箇所

#### 推奨

1. **Navigation Bars**: スクロール時の動的変化
2. **Modals & Popovers**: 前面レイヤーとして
3. **Cards**: コンテンツの強調
4. **Control Panels**: ダッシュボード、設定
5. **Widgets**: ホーム画面、ダッシュボード

#### 非推奨

1. **Primary Content Area**: 本文テキスト領域（可読性低下）
2. **Form Inputs**: 入力フィールド（入力内容が見づらい）
3. **Small Elements**: アイコン、ボタン（効果が分かりにくい）
4. **Dense Information**: テーブル、リスト（情報密度が高い箇所）

---

### カラーパレット

Liquid Glassは背景に依存するため、背景カラーの選定が重要。

#### 推奨背景

```css
/* グラデーション背景 */
.background-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 画像背景 */
.background-image {
  background: url('image.jpg') center/cover no-repeat;
}

/* 単色背景 */
.background-solid {
  background: #f0f0f0;
}
```

#### 避けるべき背景

- 純白（#FFFFFF）: 効果が見えにくい
- 真っ黒（#000000）: 暗すぎて視認性低下
- パターン過多: 背景が複雑すぎるとガラス効果が台無し

---

### タイポグラフィ

Liquid Glass上のテキストは、可読性を最優先に。

```css
.liquid-glass-text {
  /* テキストシャドウで可読性向上 */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  /* 十分なコントラスト */
  color: rgba(0, 0, 0, 0.85);
}

/* ダークモード */
[data-theme="dark"] .liquid-glass-text {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
```

---

### アクセシビリティ

Liquid Glassは視覚的に美しいが、アクセシビリティに注意。

#### コントラスト比

**WCAG 2.1 AAA基準**: テキストとガラス背景のコントラスト比 7:1 以上

```css
/* 悪い例: コントラスト不足 */
.bad-glass {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

/* 良い例: 十分なコントラスト */
.good-glass {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(0, 0, 0, 0.9);
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}
```

#### スクリーンリーダー対応

```html
<div class="liquid-glass-card" role="article" aria-labelledby="card-title">
  <h3 id="card-title">カードタイトル</h3>
  <p>カードの説明</p>
</div>
```

---

## パフォーマンス最適化

### backdrop-filterのコスト

`backdrop-filter`は**GPU集約的**なプロパティ。パフォーマンスに注意。

#### 最適化テクニック

```css
.liquid-glass-optimized {
  /* will-changeでGPU最適化をヒント */
  will-change: backdrop-filter, transform;

  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  /* transform3dでGPUアクセラレーション */
  transform: translate3d(0, 0, 0);
}

/* アニメーション完了後はwill-changeを削除 */
.liquid-glass-optimized.animation-done {
  will-change: auto;
}
```

#### フォールバック

```css
/* backdrop-filterが使えない場合のフォールバック */
@supports not (backdrop-filter: blur(20px)) {
  .liquid-glass {
    background: rgba(255, 255, 255, 0.9);
  }
}
```

---

### モバイル最適化

モバイルデバイスでは、backdrop-filterのパフォーマンスが低下する可能性。

```css
/* デスクトップのみLiquid Glass */
@media (min-width: 768px) {
  .liquid-glass-desktop-only {
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
  }
}

/* モバイルは単色背景 */
@media (max-width: 767px) {
  .liquid-glass-desktop-only {
    background: rgba(255, 255, 255, 0.95);
  }
}
```

---

## 批判と懸念

### 可読性の低下

**批判**: Liquid Glassは視覚的に美しいが、テキストの可読性が低下する可能性。

**対策**: テキスト領域には使用せず、装飾的な要素に限定。

---

### 開発者の負担

**批判**: Liquid Glassの実装は複雑で、開発者に負担。

**対策**: 再利用可能なコンポーネントライブラリを構築。

```css
/* 再利用可能なユーティリティクラス */
.glass-light {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.glass-dark {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-rounded { border-radius: 16px; }
.glass-shadow { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); }
```

---

### 注意散漫

**批判**: 過度なエフェクトはユーザーの注意を散漫にする。

**対策**: 控えめに使用し、コンテンツを強調する目的でのみ使用。

---

## ブラウザサポート

| プロパティ | Chrome | Firefox | Safari | Edge |
|-----------|--------|---------|--------|------|
| `backdrop-filter` | 76+ | 103+ | 9+ | 79+ |
| `-webkit-backdrop-filter` | 76+ | - | 9+ | 79+ |

**注意**: Firefoxは2023年以降、`backdrop-filter`を標準サポート。

---

## デザインツール

### Figma プラグイン

- **Glassmorphism**: ガラス効果を自動生成
- **Backdrop Blur**: 背景ぼかしのプレビュー

### CSS ジェネレーター

- [Glassmorphism.com](https://glassmorphism.com/): CSSコード生成
- [CSS Glass Generator](https://css.glass/): カスタマイズ可能

---

## まとめ

### Liquid Glassの本質

- **動的なマテリアル**: 静的なGlassmorphismを超えた、流動的で生き生きとしたUI
- **コンテンツファースト**: マテリアルがコンテンツを強調する役割
- **Appleの哲学**: フラットデザインからの進化、スキューモーフィズムへの回帰

### 実装のベストプラクティス

1. **控えめに使用**: 装飾的な要素に限定
2. **可読性を優先**: テキスト領域には使用しない
3. **パフォーマンス最適化**: `will-change`、フォールバック
4. **アクセシビリティ**: コントラスト比を確保
5. **レスポンシブ対応**: モバイルではシンプルに

### 2026年のトレンド

Liquid Glassは、2026年のUIデザインで**主流のトレンド**になると予測される。Glassmorphismとliquid-like interactionsの融合により、よりリアルで触覚的なインターフェースが実現する。

---

## Sources

- [UI Design Trend 2026 #2: Glassmorphism and Liquid Design Make a Comeback - Medium](https://medium.com/design-bootcamp/ui-design-trend-2026-2-glassmorphism-and-liquid-design-make-a-comeback-50edb60ca81e)
- [Liquid Glass UI: iOS 26 Redesign - Features & Criticisms - DesignMonks](https://www.designmonks.co/blog/liquid-glass-ui)
- [Glassmorphism: What It Is and How to Use It in 2026 - The Inverness Design Studio](https://invernessdesignstudio.com/glassmorphism-what-it-is-and-how-to-use-it-in-2026)
- [Apple introduces a delightful and elegant new software design - Apple](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/)
- [Liquid Glass 2026: Apple's New Design Language Explained + Developer Guide - Medium](https://medium.com/@expertappdevs/liquid-glass-2026-apples-new-design-language-6a709e49ca8b)
- [Glassmorphism in 2025: How Apple's Liquid Glass is reshaping interface design - EverydayUX](https://www.everydayux.net/glassmorphism-apple-liquid-glass-interface-design/)
- [Mobile UI Trends 2026: Glassmorphism to Spatial Computing - Sanjay Dey](https://www.sanjaydey.com/mobile-ui-trends-2026-glassmorphism-spatial-computing/)
- [Liquid Glass is here — how should designers respond? - LogRocket Blog](https://blog.logrocket.com/ux-design/apple-liquid-glass-ui/)
- [Why Liquid Glass Might Be the Next iOS Design Trend and How To Build It Today - Medium](https://medium.com/write-a-catalyst/why-liquid-glass-might-be-the-next-ios-design-trend-and-how-to-build-it-today-e4599be06463)
