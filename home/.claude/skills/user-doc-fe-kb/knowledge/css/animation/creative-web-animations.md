---
title: クリエイティブWeb制作のCSS・アニメーション技法
category: css/animation
tags: [CSS, animation, Web Animations API, GSAP, creative]
browser_support: 全モダンブラウザ対応
created: 2026-01-31
updated: 2026-01-31
---

# クリエイティブWeb制作のCSS・アニメーション技法

> 出典: https://gihyo.jp/article/2022/09/tfc006-css_tech
> 執筆日: 2022-09-01
> 追加日: 2026-01-31

池田泰延氏がTechFeed Conference 2022で講演した内容。クリエイティブなウェブサイト制作で活用できるCSS・アニメーション技法を解説。

---

## デモサイト: ColorPalletVisualizer

**概要**: マテリアルデザインなどの色定義をデータビジュアライゼーション化したサイト。

**実装技術**:
- スクロール連動アニメーション
- WebGL
- Vue.js
- DOMアニメーション

---

## アニメーション技術の選択

### 主な選択肢

| 技術 | 特徴 | 使用場面 |
|------|------|---------|
| **CSS Transitions** | シンプル、パフォーマンス良好 | ホバー、状態変化 |
| **CSS Animations** | キーフレームベース、宣言的 | ループアニメ、複雑な動き |
| **Web Animations API** | **タイミング制御が柔軟** | インタラクティブ、精密制御 |
| **トゥイーン系JSライブラリ** (GSAP等) | 高機能、複雑なシーケンス | プロレベルのアニメーション |

### 推奨: Web Animations API

**理由**:
- タイミング制御の柔軟性が高い
- JavaScriptから制御しやすい
- パフォーマンスも良好

---

## 実装パターン: 矩形装飾による演出

### 基本コンセプト

1. **疑似要素で四角形を配置**
2. **左から右に動かす**
3. **オーバーフロー制御でテキストの端で切る**
4. **遅延効果で順番に表示**

### HTML

```html
<div class="text-effect-container">
  <h1 class="animated-text">クリエイティブデザイン</h1>
  <p class="animated-text">美しいアニメーション</p>
  <p class="animated-text">インタラクティブ体験</p>
</div>
```

### CSS

```css
.text-effect-container {
  overflow: hidden; /* 矩形を端で切る */
}

.animated-text {
  position: relative;
  opacity: 0; /* 初期状態は非表示 */
}

.animated-text::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background-color: #ff6b6b; /* 矩形の色 */
  z-index: 1;
}
```

### JavaScript (Web Animations API)

```javascript
// 要素を取得
const elements = document.querySelectorAll('.animated-text');

// 各要素にアニメーションを適用
elements.forEach((el, index) => {
  // 疑似要素の代わりにdivを追加（Web Animations APIでは疑似要素を直接制御できない）
  const rect = document.createElement('div');
  rect.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #ff6b6b;
    z-index: 1;
  `;
  el.style.position = 'relative';
  el.appendChild(rect);

  // 遅延を設定（順番に表示）
  const delay = index * 150; // 150ms間隔

  // 矩形のアニメーション（左から右へ）
  rect.animate(
    [
      { transform: 'translateX(-100%)' },
      { transform: 'translateX(0%)', offset: 0.5 },
      { transform: 'translateX(100%)' }
    ],
    {
      duration: 800,
      delay: delay,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards'
    }
  );

  // テキストのフェードイン
  el.animate(
    [
      { opacity: 0 },
      { opacity: 1 }
    ],
    {
      duration: 600,
      delay: delay + 300, // 矩形より少し遅れて表示
      fill: 'forwards'
    }
  );
});
```

---

## Web Animations API の詳細

### 基本構文

```javascript
element.animate(keyframes, options);
```

**keyframes**: アニメーションの状態を配列で指定

```javascript
[
  { transform: 'translateX(0)', opacity: 1 },
  { transform: 'translateX(100px)', opacity: 0 }
]
```

**options**: タイミングやイージングを指定

```javascript
{
  duration: 1000,        // 継続時間（ms）
  delay: 500,            // 開始遅延（ms）
  easing: 'ease-in-out', // イージング
  iterations: Infinity,  // 繰り返し回数
  direction: 'alternate',// 方向（normal, reverse, alternate）
  fill: 'forwards'       // 終了後の状態（none, forwards, backwards, both）
}
```

### イージング関数

```javascript
// 組み込みイージング
'linear'
'ease'
'ease-in'
'ease-out'
'ease-in-out'

// カスタム cubic-bezier
'cubic-bezier(0.4, 0, 0.2, 1)' // Material Design のイージング
```

### アニメーション制御

```javascript
const animation = element.animate(/* keyframes, options */);

// 一時停止
animation.pause();

// 再生
animation.play();

// キャンセル
animation.cancel();

// 逆再生
animation.reverse();

// 再生速度変更
animation.playbackRate = 2; // 2倍速
```

---

## 遅延効果のパターン

### パターン1: 固定間隔

```javascript
elements.forEach((el, index) => {
  el.animate(keyframes, {
    duration: 500,
    delay: index * 100 // 100ms間隔
  });
});
```

### パターン2: 指数的遅延

```javascript
elements.forEach((el, index) => {
  el.animate(keyframes, {
    duration: 500,
    delay: Math.pow(1.5, index) * 50 // 徐々に間隔が広がる
  });
});
```

### パターン3: ランダム遅延

```javascript
elements.forEach((el) => {
  el.animate(keyframes, {
    duration: 500,
    delay: Math.random() * 1000 // 0〜1000msのランダム
  });
});
```

---

## 推奨ツール・ライブラリ

### Chrome DevTools アニメーションパネル

**用途**: アニメーションの検証・調整

**使い方**:
1. DevTools を開く（F12）
2. `Cmd + Shift + P`（Mac）または `Ctrl + Shift + P`（Windows）
3. "Show Animations" と入力
4. アニメーションパネルが表示される

**機能**:
- アニメーションの再生速度調整
- タイムライン表示
- イージングカーブの可視化

### GSAP (GreenSock Animation Platform)

**特徴**: テキスト分解表示対応、プロレベルのアニメーション制御

**例**: テキストを一文字ずつアニメーション

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.0/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.0/TextPlugin.min.js"></script>

<h1 id="split-text">クリエイティブ</h1>

<script>
// SplitText（GSAP プラグイン）で一文字ずつ分解
const text = new SplitText("#split-text", { type: "chars" });

// 一文字ずつフェードイン
gsap.from(text.chars, {
  opacity: 0,
  y: 50,
  stagger: 0.05, // 50ms間隔
  duration: 0.8,
  ease: "power2.out"
});
</script>
```

### Tween24

**特徴**: ICS開発のクリエイティブ特化ライブラリ

**GitHub**: https://github.com/a24/tween24js

**例**:

```javascript
import { Tween24 } from 'tween24';

Tween24.tween(element, 1, Tween24.ease.expoOut)
  .x(100)
  .rotation(360)
  .play();
```

---

## ベストプラクティス

### 1. 楽しんで制作する

**池田氏の提言**: 「楽しんで制作する」姿勢が重要。

- 技術選択に固執しすぎない
- 実験的に試す
- 失敗を恐れない

### 2. パフォーマンスを意識

```javascript
// ❌ レイアウトを変更するプロパティ（重い）
element.animate([
  { width: '100px' },
  { width: '200px' }
], { duration: 500 });

// ✅ transform を使用（軽い）
element.animate([
  { transform: 'scale(1)' },
  { transform: 'scale(2)' }
], { duration: 500 });
```

**軽いプロパティ**: `transform`, `opacity`
**重いプロパティ**: `width`, `height`, `margin`, `padding`

### 3. アクセシビリティ配慮

```css
/* モーション軽減モードに対応 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```javascript
// JavaScript でも配慮
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  element.animate(keyframes, options);
}
```

---

## ユースケース

- **ランディングページ**: 視覚的インパクト
- **ブランドサイト**: 独自性の演出
- **ポートフォリオサイト**: クリエイティブスキルのアピール
- **データビジュアライゼーション**: 情報の動的表現

---

## 参考リンク

- [Web Animations API - MDN](https://developer.mozilla.org/ja/docs/Web/API/Web_Animations_API)
- [GSAP 公式サイト](https://greensock.com/gsap/)
- [Tween24 GitHub](https://github.com/a24/tween24js)
- [Chrome DevTools - Animations](https://developer.chrome.com/docs/devtools/css/animations/)
