---
title: Three.js + WebGPUでStable Fluids流体シミュレーション
category: javascript/patterns
tags: [threejs, webgpu, webgl, stable-fluids, simulation, tsl]
browser_support: WebGPU環境（WebGLフォールバック）
created: 2026-02-01
updated: 2026-02-01
---

# Three.js + WebGPUでStable Fluids流体シミュレーション

## Three.jsとWebGPUによる2D流体シミュレーション

> 出典: https://ics.media/entry/250916/
> 執筆日: 2025-09-16
> 追加日: 2026-02-01

Three.js（r176+）とWebGPUを使用して、Stable Fluidsアルゴリズムによる2D流体シミュレーションを実装。リアルタイムのインタラクティブな流体表現をブラウザで実現できる。

### コード例

**基本セットアップ（TypeScript + Vite）:**

```typescript
import * as THREE from 'three';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

const renderer = new WebGPURenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
```

**テクスチャベースのGPU計算:**

```typescript
import { texture, uniform, vec2, vec4 } from 'three/tsl';

// 速度場をテクスチャに格納
const velocityTexture = new THREE.DataTexture(
  new Float32Array(256 * 256 * 4),
  256, 256,
  THREE.RGBAFormat,
  THREE.FloatType
);

// フラグメントシェーダーで物理計算
const velocityNode = texture(velocityTexture);
```

**ピンポンバッファ技法:**

```typescript
class PingPongBuffer {
  readTarget: THREE.WebGPURenderTarget;
  writeTarget: THREE.WebGPURenderTarget;

  constructor(width: number, height: number) {
    this.readTarget = new THREE.WebGPURenderTarget(width, height);
    this.writeTarget = new THREE.WebGPURenderTarget(width, height);
  }

  swap() {
    [this.readTarget, this.writeTarget] = [this.writeTarget, this.readTarget];
  }
}
```

**6ステップの計算パイプライン:**

```typescript
function simulateFluid() {
  // 1. 外力適用（マウス入力など）
  applyExternalForce();
  velocityBuffer.swap();

  // 2. 移流計算（速度場の伝播）
  advect();
  velocityBuffer.swap();

  // 3. 発散計算
  computeDivergence();

  // 4. 圧力計算（ポアソン方程式）
  solvePressure();

  // 5. 速度場更新（発散ゼロに）
  updateVelocity();
  velocityBuffer.swap();

  // 6. ビジュアルレンダリング
  render();
}
```

**TSL（Three.js Shading Language）での実装:**

```typescript
import { Fn, texture, vec2, vec4 } from 'three/tsl';

const advectionShader = Fn(() => {
  const uv = vec2(gl_FragCoord.xy / resolution);
  const velocity = texture(velocityTexture, uv).xy;

  // バックトレース
  const prevUV = uv - velocity * deltaTime;
  const prevVelocity = texture(velocityTexture, prevUV).xy;

  return vec4(prevVelocity, 0.0, 1.0);
});
```

**RGBAチャンネルへのエンコード:**

```typescript
// R: 速度X, G: 速度Y, B: 圧力, A: 発散
const encodeData = (vx: number, vy: number, pressure: number, divergence: number) => {
  return new Float32Array([vx, vy, pressure, divergence]);
};
```

### 計算パイプライン詳細

**1. 外力適用（External Force）:**

```typescript
const applyForce = Fn(() => {
  const uv = vec2(gl_FragCoord.xy / resolution);
  const mousePos = uniform(vec2(mouse.x, mouse.y));
  const dist = length(uv - mousePos);

  if (dist < 0.1) {
    const force = uniform(vec2(mouseDelta.x, mouseDelta.y));
    velocity += force * 0.1;
  }

  return vec4(velocity, 0.0, 1.0);
});
```

**2. 移流計算（Advection）:**

速度場が自身を伝播させる計算。セミ・ラグランジアン法を使用。

**3. 発散計算（Divergence）:**

速度場の発散を計算。流体の圧縮性を表す。

**4. 圧力計算（Pressure Solve）:**

ポアソン方程式を反復法（Jacobi法）で解く。

**5. 速度場更新（Gradient Subtraction）:**

圧力勾配を速度場から引いて発散ゼロに。

**6. ビジュアルレンダリング:**

計算結果をカラーマッピングや画像ワープで視覚化。

### 4つのビジュアライゼーション例

**1. 流体背景との合成（屈折効果）:**

```typescript
const refractionShader = Fn(() => {
  const uv = vec2(gl_FragCoord.xy / resolution);
  const velocity = texture(velocityTexture, uv).xy;

  // 速度場で画像をワープ
  const distortedUV = uv + velocity * 0.1;
  const color = texture(backgroundTexture, distortedUV);

  return vec4(color.rgb, 1.0);
});
```

**2. 速度場のカラーマップ:**

```typescript
const colorMapShader = Fn(() => {
  const uv = vec2(gl_FragCoord.xy / resolution);
  const velocity = texture(velocityTexture, uv).xy;
  const speed = length(velocity);

  // 速度を色に変換
  const color = vec3(
    speed * 2.0,
    abs(velocity.x),
    abs(velocity.y)
  );

  return vec4(color, 1.0);
});
```

**3. 画像ワープ（フローと同期）:**

```typescript
const warpShader = Fn(() => {
  const uv = vec2(gl_FragCoord.xy / resolution);
  const velocity = texture(velocityTexture, uv).xy;

  const warpedUV = uv + velocity * warpStrength;
  const color = texture(imageTexture, warpedUV);

  return vec4(color.rgb, 1.0);
});
```

**4. ペイント混合シミュレーション:**

インクや絵の具が混ざる様子をピクセル変位で表現。

### ユースケース

- **インタラクティブ背景**: マウス操作で流体をかき乱す
- **データビジュアライゼーション**: 流れの可視化
- **アートプロジェクト**: ジェネラティブアート
- **教育コンテンツ**: 物理シミュレーションの学習
- **ゲーム演出**: 水や煙の表現

### 注意点

**パフォーマンス:**

- グリッドサイズは256×256が推奨（512×512は重い）
- WebGPU環境で最適化される
- WebGLフォールバック時はやや遅い

**ブラウザサポート:**

- **WebGPU**: Chrome 113+, Edge 113+（2023年5月）
- **WebGLフォールバック**: 全モダンブラウザ
- 自動フォールバックで広い互換性

**Three.jsバージョン:**

- r176以降が必須
- TSL（Three.js Shading Language）を使用
- WebGPURendererを使用

**物理計算の制限:**

- 2D流体のみ（3Dは実装複雑）
- 粘性や温度は考慮していない
- リアルタイム性を優先した簡略化

### 実践例

**マウスインタラクション:**

```typescript
let mouse = { x: 0, y: 0 };
let mouseDelta = { x: 0, y: 0 };

canvas.addEventListener('mousemove', (e) => {
  const newMouseX = e.clientX / window.innerWidth;
  const newMouseY = 1.0 - e.clientY / window.innerHeight;

  mouseDelta.x = newMouseX - mouse.x;
  mouseDelta.y = newMouseY - mouse.y;

  mouse.x = newMouseX;
  mouse.y = newMouseY;
});
```

**レスポンシブ対応:**

```typescript
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  // テクスチャも再生成
  velocityBuffer.resize(width, height);
});
```

### 関連技術

- **WebGPU**: GPU計算API
- **WebGL**: WebGPUのフォールバック
- **TSL**: Three.js Shading Language
- **Navier-Stokes方程式**: 流体力学の基礎方程式
- **Stable Fluidsアルゴリズム**: Jos Stam氏の手法

### 参考リンク

- [ICS MEDIA - Three.js Stable Fluids](https://ics.media/entry/250916/)
- [GitHub - デモソースコード](https://github.com/ics-creative/250916_threejs-stable-fluids)
- [Jos Stam - Stable Fluids論文](https://www.dgp.toronto.edu/public_user/stam/reality/Research/pdf/ns.pdf)
- [Three.js公式サイト](https://threejs.org/)

---
