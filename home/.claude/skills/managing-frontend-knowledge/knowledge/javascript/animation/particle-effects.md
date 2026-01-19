---
title: パーティクルエフェクトの実装テクニック
category: javascript/animation
tags: [particles, animation, web-animations-api, canvas, webgl, perlin-noise, creative-coding]
browser_support: モダンブラウザ全般
created: 2026-01-19
updated: 2026-01-19
---

# パーティクルエフェクトの実装テクニック

> 出典: https://ics.media/entry/220420/
> 出典: https://ics.media/entry/221216/
> 執筆日: 2022年4月20日、2022年12月16日
> 追加日: 2026-01-19

## 概要

パーティクル (粒子) を使ったアニメーション表現は、センスや才能だけでなく、体系的なテクニックによって実現できます。Web Animations API、Canvas 2D、WebGL/PixiJSを活用した、視覚的に印象的なパーティクルエフェクトの実装方法を解説します。

## 基本テクニック

### テクニック1: 量とランダム性

最も基本的なアプローチは、要素の数を増やし、パラメータにランダム性を持たせることです。

```javascript
// 大量のパーティクルを生成
for (let i = 0; i < 100; i++) {
  const particle = document.createElement('div');
  particle.className = 'particle';

  // ランダムな飛距離
  const distance = Math.random() * 300 + 100;

  // ランダムな色相
  const hue = Math.random() * 360;

  // ランダムなサイズ
  const size = Math.random() * 10 + 5;

  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;

  // アニメーション適用
  animateParticle(particle, distance);
}
```

### テクニック2: 透明度、ブラー、ブレンドモード

CSSの`mix-blend-mode`と`filter`プロパティで洗練された表現を追加します。

```css
.particle {
  mix-blend-mode: screen; /* 光の加算合成 */
  filter: blur(2px);      /* ぼかし効果 */
  opacity: 0.8;
}
```

```javascript
// 透明度のアニメーション
particle.animate([
  { opacity: 1 },
  { opacity: 0 }
], {
  duration: 1000,
  easing: 'ease-out'
});
```

**注意**: これらのプロパティは計算コストが高いため、使用は控えめにしましょう。

## 高度なテクニック

### テクニック3: タイミングと勢い

要素数を最大化するのではなく、少数の要素にイージングと時間差を強調します。

```javascript
// バラバラのタイミングで出現
particles.forEach((particle, index) => {
  particle.animate([
    {
      transform: 'translate(0, 0) scale(0)',
      opacity: 0
    },
    {
      transform: `translate(${getRandomX()}px, ${getRandomY()}px) scale(1)`,
      opacity: 1
    },
    {
      transform: `translate(${getRandomX() * 2}px, ${getRandomY() * 2}px) scale(0.5)`,
      opacity: 0
    }
  ], {
    duration: 2000,
    delay: index * 50, // 時間差
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' // 勢いのあるイージング
  });
});
```

### テクニック4: 制御されたランダム性

完全なランダムではなく、意図的な制約を設けることで洗練された表現になります。

#### 出現率テーブル

レア要素を少なく、コモン要素を多くする。

```javascript
const particleTypes = [
  { type: 'star', weight: 5 },    // レア
  { type: 'circle', weight: 20 }, // コモン
  { type: 'dot', weight: 75 }     // 非常にコモン
];

function getWeightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    if (random < item.weight) return item.type;
    random -= item.weight;
  }
}
```

#### 偏ったランダム値

数学的補正で特定範囲に値を集中させます。

```javascript
// 小さい値に偏らせる (0に近い値が多い)
const biasedRandom = Math.random() ** 1.5;

// 大きい値に偏らせる (1に近い値が多い)
const biasedRandom = Math.random() ** 0.5;

// ベル曲線的な分布 (中央値付近が多い)
function gaussianRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
```

#### 数量の事前決定

確率ではなく、固定数をランダムに選択します。

```javascript
// 100個中、必ず5個だけ特別な要素にする
const specialIndices = new Set();
while (specialIndices.size < 5) {
  specialIndices.add(Math.floor(Math.random() * 100));
}

particles.forEach((particle, index) => {
  if (specialIndices.has(index)) {
    particle.classList.add('special');
  }
});
```

## テキスト粒子化の実装

テキストを粒子に分解し、動的な演出を実現する高度なテクニックです。

### 技術スタック

1. **Canvas 2D**: テキストをピクセルデータに変換
2. **WebGL/PixiJS**: 大量のパーティクルを高速描画
3. **GSAP**: トゥイーン制御とアニメーション
4. **Perlin Noise**: 自然な乱数生成

### ステップ1: テキストの画像化

```javascript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// テキストを描画
ctx.font = '128px Arial';
ctx.fillStyle = 'white';
ctx.fillText('HELLO', 0, 128);

// ピクセルデータを取得
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const pixels = imageData.data;
```

### ステップ2: 粒子生成

透明でないピクセル座標にスプライトを配置します。

```javascript
const particles = [];

for (let y = 0; y < canvas.height; y++) {
  for (let x = 0; x < canvas.width; x++) {
    const index = (y * canvas.width + x) * 4;
    const alpha = pixels[index + 3]; // アルファ値

    if (alpha > 0) {
      // 透明でないピクセル位置にパーティクル生成
      const particle = new PIXI.Sprite(texture);
      particle.x = x;
      particle.y = y;
      particle.alpha = alpha / 255; // 元画像の透明度を保持
      particles.push(particle);
    }
  }
}
```

### ステップ3: 拡散表現

```javascript
particles.forEach(particle => {
  // 元の位置を保存
  particle.originX = particle.x;
  particle.originY = particle.y;

  // ランダムな方向に拡散
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * 200;

  particle.x += Math.cos(angle) * distance;
  particle.y += Math.sin(angle) * distance;
});
```

### ステップ4: 風の効果 (Perlin Noise)

規則性のある乱数で、波打つような自然な動きを実現します。

```javascript
import { createNoise2D } from 'simplex-noise';

const noise2D = createNoise2D();

particles.forEach((particle, index) => {
  // Perlin Noiseで風の影響を計算
  const noiseX = noise2D(index * 0.01, Date.now() * 0.001);
  const noiseY = noise2D(index * 0.01 + 1000, Date.now() * 0.001);

  // 元の位置 + ノイズ値
  gsap.to(particle, {
    x: particle.originX + noiseX * 100,
    y: particle.originY + noiseY * 100,
    duration: 2,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true
  });
});
```

## Web Animations API 基本パターン

```javascript
const particle = document.querySelector('.particle');

particle.animate([
  {
    transform: 'translate(0, 0) scale(1)',
    opacity: 1,
    offset: 0
  },
  {
    transform: 'translate(100px, -50px) scale(1.5)',
    opacity: 0.5,
    offset: 0.7
  },
  {
    transform: 'translate(200px, 100px) scale(0)',
    opacity: 0,
    offset: 1
  }
], {
  duration: 2000,
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  fill: 'forwards'
});
```

## パフォーマンス最適化

### 大量パーティクルの描画

- **CSS**: 100個程度まで
- **Canvas 2D**: 1000個程度まで
- **WebGL/PixiJS**: 10000個以上も可能

### 最適化テクニック

```javascript
// requestAnimationFrame で描画を最適化
function animate() {
  particles.forEach(particle => {
    particle.update();
    particle.render();
  });

  requestAnimationFrame(animate);
}

// オブジェクトプールで再利用
class ParticlePool {
  constructor(size) {
    this.pool = Array.from({ length: size }, () => new Particle());
    this.activeParticles = [];
  }

  spawn() {
    const particle = this.pool.pop();
    if (particle) {
      this.activeParticles.push(particle);
      return particle;
    }
  }

  recycle(particle) {
    const index = this.activeParticles.indexOf(particle);
    if (index > -1) {
      this.activeParticles.splice(index, 1);
      this.pool.push(particle);
    }
  }
}
```

## 重要な原則

> 「決めるところはキッチリ決めてしまう方が、意図した表現に近づける」

完全なランダム性ではなく、意図的な制約とランダム性のバランスが重要です。

## まとめ

パーティクルエフェクトは、以下のテクニックを組み合わせることで実現できます:

1. **基本**: 量とランダム性、透明度とブレンドモード
2. **高度**: タイミングと勢い、制御されたランダム性
3. **応用**: テキスト粒子化、Perlin Noise、WebGL描画

センスに頼るのではなく、体系的なテクニックと数学的なアプローチで、プロフェッショナルなパーティクルエフェクトを作成できます。

## 関連技術

- Web Animations API
- Canvas 2D API
- WebGL/PixiJS
- GSAP
- Perlin Noise / Simplex Noise
