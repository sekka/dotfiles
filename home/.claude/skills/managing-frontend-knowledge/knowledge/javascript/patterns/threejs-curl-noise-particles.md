---
title: Three.js + Curl Noiseによる3Dパーティクル
category: javascript/patterns
tags: [threejs, curl-noise, particles, webgl, post-processing, animation]
browser_support: WebGL対応の全モダンブラウザ（モバイル含む）
created: 2026-02-01
updated: 2026-02-01
---

# Three.js + Curl Noiseによる3Dパーティクル

## Three.jsとCurl Noiseで流体的なパーティクルアニメーション

> 出典: https://ics.media/entry/251120/
> 執筆日: 2025-11-20
> 追加日: 2026-02-01

Three.js（r181）とCurl Noiseを使用して、流体的で自然な動きをするパーティクルアニメーションを実装。Curl Noiseはベクトル場のサンプリングで回転成分を近似し、渦を描くような美しい動きを生成する。

### コード例

**パーティクル初期化:**

```typescript
import * as THREE from 'three';

const MAX = 2400; // パーティクル数
const range = 100; // 配置範囲

const positions = new Float32Array(MAX * 3);

for (let i = 0; i < MAX; i++) {
  positions[i * 3 + 0] = THREE.MathUtils.randFloatSpread(range);
  positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(range);
  positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(range);
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
```

**Curl Noise実装（6点サンプリング）:**

```typescript
import { noise3D } from './perlin-noise'; // Perlin Noiseライブラリ

function curlNoise(x: number, y: number, z: number, epsilon = 0.01): THREE.Vector3 {
  // 6点サンプリングで回転成分を近似
  const curl = new THREE.Vector3();

  // ∂z/∂y - ∂y/∂z
  curl.x =
    (noise3D(x, y + epsilon, z) - noise3D(x, y - epsilon, z)) / (2 * epsilon) -
    (noise3D(x, y, z + epsilon) - noise3D(x, y, z - epsilon)) / (2 * epsilon);

  // ∂x/∂z - ∂z/∂x
  curl.y =
    (noise3D(x, y, z + epsilon) - noise3D(x, y, z - epsilon)) / (2 * epsilon) -
    (noise3D(x + epsilon, y, z) - noise3D(x - epsilon, y, z)) / (2 * epsilon);

  // ∂y/∂x - ∂x/∂y
  curl.z =
    (noise3D(x + epsilon, y, z) - noise3D(x - epsilon, y, z)) / (2 * epsilon) -
    (noise3D(x, y + epsilon, z) - noise3D(x, y - epsilon, z)) / (2 * epsilon);

  return curl;
}
```

**パーティクルの更新:**

```typescript
function updateParticles(time: number) {
  const positions = geometry.attributes.position.array as Float32Array;

  for (let i = 0; i < MAX; i++) {
    const i3 = i * 3;
    const x = positions[i3 + 0];
    const y = positions[i3 + 1];
    const z = positions[i3 + 2];

    // Curl Noiseでベクトル場をサンプリング
    const noiseScale = 0.005; // ノイズのスケール
    const velocity = curlNoise(
      x * noiseScale,
      y * noiseScale,
      (z + time * 0.1) * noiseScale
    );

    // 速度を加算
    positions[i3 + 0] += velocity.x * 0.5;
    positions[i3 + 1] += velocity.y * 0.5;
    positions[i3 + 2] += velocity.z * 0.5;

    // 範囲外に出たら反対側にループ
    if (Math.abs(positions[i3 + 0]) > range / 2) positions[i3 + 0] *= -1;
    if (Math.abs(positions[i3 + 1]) > range / 2) positions[i3 + 1] *= -1;
    if (Math.abs(positions[i3 + 2]) > range / 2) positions[i3 + 2] *= -1;
  }

  geometry.attributes.position.needsUpdate = true;
}
```

**Canvas Textureでパーティクルを描画:**

```typescript
// Canvas上で放射状グラデーションを描画
const canvas = document.createElement('canvas');
canvas.width = 128;
canvas.height = 128;
const ctx = canvas.getContext('2d')!;

const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 128, 128);

// テクスチャに変換
const texture = new THREE.CanvasTexture(canvas);

const material = new THREE.PointsMaterial({
  map: texture,
  size: 2,
  transparent: true,
  blending: THREE.AdditiveBlending, // 加算合成で明るく
  depthWrite: false
});

const points = new THREE.Points(geometry, material);
scene.add(points);
```

**ポストプロセス（ブルーム + 残像効果）:**

```typescript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// ブルーム効果
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,  // 強度
  0.4,  // 半径
  0.85  // 閾値
);
composer.addPass(bloomPass);

// 残像効果（モーショントレイル）
const afterimagePass = new AfterimagePass(0.9); // 減衰率
composer.addPass(afterimagePass);
```

**アニメーションループ:**

```typescript
function animate(time: number) {
  requestAnimationFrame(animate);

  updateParticles(time);

  // カメラを回転
  camera.position.x = Math.cos(time * 0.0001) * 150;
  camera.position.z = Math.sin(time * 0.0001) * 150;
  camera.lookAt(0, 0, 0);

  composer.render();
}
animate(0);
```

### Curl Noiseの仕組み

**Curl（回転）の定義:**

ベクトル場のCurlは、その場の回転成分を表す。3Dベクトル場 `F = (P, Q, R)` のCurlは:

```
curl F = (∂R/∂y - ∂Q/∂z, ∂P/∂z - ∂R/∂x, ∂Q/∂x - ∂P/∂y)
```

**数値微分による近似:**

Perlin Noiseなどのノイズ関数から、6点サンプリングで偏微分を近似:

```typescript
// ∂z/∂y の近似
const dz_dy = (noise3D(x, y + ε, z) - noise3D(x, y - ε, z)) / (2 * ε);
```

**発散ゼロの特性:**

Curl（回転）場は常に発散がゼロ（div curl F = 0）なので、パーティクルが集中・拡散せず、流体的な動きになる。

### ユースケース

- **ビジュアルアート**: ジェネラティブアート、インスタレーション
- **UI演出**: ヒーローエリア、ローディングアニメーション
- **データビジュアライゼーション**: 流れの可視化
- **ゲーム演出**: 魔法エフェクト、パーティクルシステム
- **VJ（ビジュアルジョッキー）**: ライブパフォーマンス

### 注意点

**パフォーマンス:**

- パーティクル数は2000-5000程度が推奨
- 10000を超えると重くなる
- モバイルでは1000以下に抑える

```typescript
// パフォーマンス最適化
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
const MAX = isMobile ? 1000 : 2400;
```

**Perlin Noiseライブラリ:**

Three.jsにはPerlin Noiseが含まれていないため、外部ライブラリを使用:

```typescript
import { createNoise3D } from 'simplex-noise';

const noise3D = createNoise3D();
```

**Canvas Textureのメモリ:**

高解像度のCanvas Textureはメモリを消費するため、適切なサイズに:

```typescript
// 128x128 または 256x256 が推奨
const canvas = document.createElement('canvas');
canvas.width = 128;
canvas.height = 128;
```

**ブラウザサポート:**

- WebGL対応の全モダンブラウザ（Chrome, Firefox, Safari, Edge）
- モバイルブラウザも対応（iOS Safari, Chrome Mobile）
- WebGL 1.0で十分（WebGL 2.0は不要）

**Three.jsバージョン:**

- r181で動作確認
- r140以降であれば大きな変更なし

### 実践例

**シンプルなCurl Noise パーティクル:**

```typescript
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';

const noise3D = createNoise3D();

function curlNoise(x: number, y: number, z: number): THREE.Vector3 {
  const eps = 0.01;
  const curl = new THREE.Vector3();

  curl.x = (noise3D(x, y + eps, z) - noise3D(x, y - eps, z)) / (2 * eps) -
           (noise3D(x, y, z + eps) - noise3D(x, y, z - eps)) / (2 * eps);

  curl.y = (noise3D(x, y, z + eps) - noise3D(x, y, z - eps)) / (2 * eps) -
           (noise3D(x + eps, y, z) - noise3D(x - eps, y, z)) / (2 * eps);

  curl.z = (noise3D(x + eps, y, z) - noise3D(x - eps, y, z)) / (2 * eps) -
           (noise3D(x, y + eps, z) - noise3D(x, y - eps, z)) / (2 * eps);

  return curl;
}

// 使用例
const velocity = curlNoise(x * 0.005, y * 0.005, z * 0.005);
particle.position.x += velocity.x * 0.5;
particle.position.y += velocity.y * 0.5;
particle.position.z += velocity.z * 0.5;
```

**色付きパーティクル:**

```typescript
const colors = new Float32Array(MAX * 3);

for (let i = 0; i < MAX; i++) {
  colors[i * 3 + 0] = Math.random(); // R
  colors[i * 3 + 1] = Math.random(); // G
  colors[i * 3 + 2] = Math.random(); // B
}

geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  map: texture,
  size: 2,
  transparent: true,
  vertexColors: true, // 頂点カラーを有効化
  blending: THREE.AdditiveBlending
});
```

**インタラクティブなパーティクル:**

```typescript
let mouse = new THREE.Vector2();

window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

function updateParticles(time: number) {
  // マウス位置を3D空間に変換
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const mousePos = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, mousePos);

  // パーティクルをマウスから遠ざける
  for (let i = 0; i < MAX; i++) {
    const i3 = i * 3;
    const pos = new THREE.Vector3(
      positions[i3 + 0],
      positions[i3 + 1],
      positions[i3 + 2]
    );

    const dist = pos.distanceTo(mousePos);
    if (dist < 20) {
      const dir = pos.clone().sub(mousePos).normalize();
      positions[i3 + 0] += dir.x * 0.5;
      positions[i3 + 1] += dir.y * 0.5;
      positions[i3 + 2] += dir.z * 0.5;
    }
  }
}
```

### 関連技術

- **Perlin Noise**: 自然なランダム性を生成
- **Simplex Noise**: Perlin Noiseの改良版
- **Flow Field**: ベクトル場によるパーティクル制御
- **GPU Particles**: WebGLシェーダーでパーティクル計算
- **UnrealBloomPass**: ポストプロセスでブルーム効果
- **AfterimagePass**: 残像効果（モーショントレイル）

### 参考リンク

- [ICS MEDIA - Three.js Curl Noise パーティクル](https://ics.media/entry/251120/)
- [GitHub - デモソースコード](https://github.com/ics-creative/251120_threejs-particles)
- [simplex-noise](https://www.npmjs.com/package/simplex-noise)
- [Three.js公式サイト](https://threejs.org/)

---
