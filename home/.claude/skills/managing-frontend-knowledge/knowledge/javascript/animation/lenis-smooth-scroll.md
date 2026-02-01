---
title: Lenis - 慣性スクロールライブラリ
category: javascript/animation
tags: [scroll, smooth-scroll, lenis, ux, performance, gsap]
browser_support: 全モダンブラウザ対応
created: 2026-02-01
updated: 2026-02-01
---

# Lenis - 慣性スクロールライブラリ

> 出典: https://ics.media/entry/230804/ (前編), https://ics.media/entry/230817/ (後編)
> 執筆日: 2023-08-04, 2023-08-17
> 追加日: 2026-02-01

Lenisは、滑らかな慣性スクロール体験を実現するJavaScriptライブラリ。macOSのような洗練されたスクロールをWindowsでも実現します。

## 概要

**慣性スクロール（Inertial Scrolling）**:
「スクロール動作を止めた後も、慣性で滑らかに減速しながらスクロールが続く」体験。

**クロスプラットフォームの課題**:
- **macOS**: ネイティブで滑らかなスクロール
- **Windows**: カクカクとしたスクロール挙動

Lenisを導入することで、両プラットフォームで統一された高品質なスクロール体験を提供できます。

## 特徴

### 主な利点

✅ **MIT License**: 商用利用も無料
✅ **position: sticky/fixed対応**: レイアウトを崩さない
✅ **GSAP連携**: ScrollTriggerと組み合わせ可能
✅ **軽量**: 圧縮後約3KB
✅ **タッチデバイス対応**: スマートフォンでもスムーズ

### 使用場面

**適している**:
- ポートフォリオサイト
- ランディングページ
- ストーリーテリングサイト
- スクロールアニメーションと組み合わせたサイト

**避けるべき**:
- 大量のコンテンツを高速スクロールする必要があるサイト
- アクセシビリティを最優先するサイト（ユーザーが混乱する可能性）

## 基本実装

### インストール

```bash
npm install @studio-freight/lenis
```

### 最小限のコード

```javascript
import Lenis from '@studio-freight/lenis';

const lenis = new Lenis();

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
```

これだけで慣性スクロールが有効になります。

## 応用的な使い方

### アンカーリンク対応

```javascript
// アンカーリンクをLenisのスムーズスクロールで処理
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = anchor.getAttribute('href');
    lenis.scrollTo(targetId);
  });
});
```

**CSSセレクターでも指定可能**:

```javascript
lenis.scrollTo('.target-section');
lenis.scrollTo(document.querySelector('.target'));
```

### カスタマイズオプション

```javascript
const lenis = new Lenis({
  // 慣性の強さ（0-1）
  lerp: 0.1, // デフォルト: 0.1（小さいほど慣性が強い）

  // アニメーション時間（秒）
  duration: 1.2,

  // イージング関数
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),

  // スクロール方向（vertical | horizontal）
  orientation: 'vertical',

  // スムーススクロールの速度
  smoothWheel: true,

  // タッチデバイスでもスムーズに
  smoothTouch: false, // デフォルトはfalse（パフォーマンス配慮）

  // ホイールの倍率
  wheelMultiplier: 1,

  // タッチの倍率
  touchMultiplier: 2,
});
```

### lerp（慣性の強さ）の調整

```javascript
// 慣性を強くする（よりゆっくり減速）
const lenis = new Lenis({
  lerp: 0.05, // 値が小さいほど慣性が強い
});

// 慣性を弱くする（すぐに止まる）
const lenis = new Lenis({
  lerp: 0.3,
});
```

**推奨値**:
- ポートフォリオ: `0.05-0.1`（ゆったり）
- コーポレート: `0.15-0.2`（バランス）
- ECサイト: `0.25-0.3`（素早く）

### イージング関数のカスタマイズ

```javascript
const lenis = new Lenis({
  // カスタムイージング（ease-out-quartに相当）
  easing: (x) => 1 - Math.pow(1 - x, 4),
});

// 線形（慣性なし）
const lenis = new Lenis({
  easing: (x) => x,
});

// バウンス効果
const lenis = new Lenis({
  easing: (x) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (x < 1 / d1) {
      return n1 * x * x;
    } else if (x < 2 / d1) {
      return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
  },
});
```

## 実用的なパターン

### モーダル表示時にスクロール停止

```javascript
const modal = document.querySelector('.modal');
const openButton = document.querySelector('.open-modal');
const closeButton = document.querySelector('.close-modal');

openButton.addEventListener('click', () => {
  modal.classList.add('is-open');
  lenis.stop(); // スクロール停止
});

closeButton.addEventListener('click', () => {
  modal.classList.remove('is-open');
  lenis.start(); // スクロール再開
});
```

### スクロール速度を取得してアニメーションに反映

```javascript
lenis.on('scroll', (e) => {
  // スクロール速度（velocity）を取得
  const speed = Math.abs(e.velocity);

  // 速度に応じて要素を回転
  const rotation = speed * 10;
  element.style.transform = `rotate(${rotation}deg)`;
});
```

**velocity（速度）**:
- 正の値: 下/右方向へのスクロール
- 負の値: 上/左方向へのスクロール
- 絶対値が大きいほど速い

### タッチデバイス対応

```javascript
const lenis = new Lenis({
  smoothTouch: true, // タッチでもスムーズスクロール有効
  touchMultiplier: 2, // タッチの感度（デフォルト: 2）
});
```

**注意**:
`smoothTouch: true` はパフォーマンスに影響する可能性があります。特にローエンドのスマートフォンでは慎重に検討してください。

### GSAP ScrollTriggerとの連携

```javascript
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();

// LenisとGSAPを同期
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// ScrollTriggerを使用
gsap.to('.box', {
  scrollTrigger: {
    trigger: '.box',
    start: 'top center',
    end: 'bottom center',
    scrub: true,
  },
  x: 500,
});
```

## パフォーマンス最適化

### requestAnimationFrameの最適化

```javascript
let rafId;

function raf(time) {
  lenis.raf(time);
  rafId = requestAnimationFrame(raf);
}

rafId = requestAnimationFrame(raf);

// ページ離脱時にクリーンアップ
window.addEventListener('beforeunload', () => {
  cancelAnimationFrame(rafId);
  lenis.destroy();
});
```

### 特定要素のみスムーススクロール適用

```javascript
const lenis = new Lenis({
  wrapper: document.querySelector('.smooth-scroll-container'),
  content: document.querySelector('.smooth-scroll-content'),
});
```

## アクセシビリティ配慮

### prefers-reduced-motionへの対応

```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const lenis = new Lenis({
  lerp: prefersReducedMotion ? 1 : 0.1, // モーション軽減時は慣性なし
  duration: prefersReducedMotion ? 0 : 1.2,
});
```

### キーボード操作の保持

Lenisはデフォルトでキーボードスクロール（矢印キー、PageUp/Down、Space、Home/End）に対応しています。

```javascript
// キーボードスクロールを無効化したい場合
const lenis = new Lenis({
  syncTouch: false, // タッチとマウスを同期しない
});
```

## 注意事項

### 過度な慣性は逆効果

**問題**:
「スクロール距離が意図より大きくなり、目的の位置を通り過ぎる」

**対策**:
- `lerp` を大きめに設定（0.15-0.2）
- `duration` を短めに設定（1秒以下）
- ユーザーテストで確認

### iOSでの挙動

iOSのSafariでは、ネイティブのバウンススクロールと競合する場合があります。

```css
/* iOSのバウンススクロールを無効化 */
html,
body {
  overscroll-behavior: none;
}
```

## ブラウザサポート

| ブラウザ | サポート |
|---------|---------|
| Chrome | ✅ 全バージョン |
| Firefox | ✅ 全バージョン |
| Safari | ✅ 全バージョン |
| Edge | ✅ 全バージョン |
| iOS Safari | ✅ iOS 10+ |
| Android Chrome | ✅ Android 5+ |

## 代替ライブラリとの比較

| ライブラリ | ファイルサイズ | position:sticky対応 | ライセンス |
|-----------|-------------|-------------------|----------|
| **Lenis** | ~3KB | ✅ | MIT（無料） |
| Locomotive Scroll | ~11KB | ❌ | MIT（無料） |
| Smooth Scrollbar | ~24KB | ✅ | MIT（無料） |

## まとめ

| 項目 | 推奨設定 |
|------|---------|
| **基本的なサイト** | `lerp: 0.1`, `duration: 1` |
| **ポートフォリオ** | `lerp: 0.05`, `duration: 1.5` |
| **ECサイト** | `lerp: 0.25`, `duration: 0.8` |
| **アクセシビリティ重視** | `prefers-reduced-motion` チェック |
| **GSAP連携** | `gsap.ticker` と同期 |

## 関連ナレッジ

- [requestAnimationFrame](./animation.md)
- [スクロール連動アニメーション](../dom/scroll-linked-animation.md)
- [GSAP ScrollTrigger](./gsap-scrolltrigger.md)
- [パフォーマンス最適化](../../cross-cutting/performance/performance-optimization.md)
- [prefers-reduced-motion](../../cross-cutting/accessibility/prefers-reduced-motion.md)
