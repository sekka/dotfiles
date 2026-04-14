---
title: Three.jsポストプロセス（WebGPU）
category: javascript/patterns
tags: [threejs, webgpu, post-processing, shaders, tsl, effects]
browser_support: WebGPU環境（WebGLフォールバック）
created: 2026-02-01
updated: 2026-02-01
---

# Three.jsポストプロセス（WebGPU）

## Three.jsのポストプロセスで映える3D表現

> 出典: https://ics.media/entry/251113/
> 執筆日: 2025-11-13
> 追加日: 2026-02-01

ポストプロセスとは、レンダリングされた画像や映像に後からエフェクトを加える処理。Three.jsのWebGPU実装では、TSL（Three.js Shading Language）を使って簡単に視覚効果を追加できる。

### コード例

**基本セットアップ:**

```typescript
import * as THREE from 'three';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';
import PostProcessing from 'three/addons/renderers/common/PostProcessing.js';
import { pass } from 'three/tsl';

const renderer = new WebGPURenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// PostProcessingインスタンス作成
const postProcessing = new PostProcessing(renderer);

// scenePassを作成
const scenePass = pass(scene, camera);

// エフェクトを適用
postProcessing.outputNode = scenePass;

// アニメーションループ
function animate() {
  postProcessing.render();
  requestAnimationFrame(animate);
}
animate();
```

**ブルームエフェクト:**

```typescript
import { bloom } from 'three/tsl';

const scenePass = pass(scene, camera);
const bloomPass = bloom(scenePass, 1.0, 0.5, 0.85);

postProcessing.outputNode = bloomPass;
```

**ドットスクリーン（ハーフトーン効果）:**

```typescript
import { dotScreen } from 'three/tsl';

const scenePass = pass(scene, camera);
const dotScreenPass = dotScreen(scenePass);

postProcessing.outputNode = dotScreenPass;
```

**色収差（Chromatic Aberration）+ 被写界深度（Depth of Field）:**

```typescript
import { rgbShift, dof } from 'three/tsl';

const scenePass = pass(scene, camera);

// 色収差
const rgbShiftPass = rgbShift(scenePass, 0.01);

// 被写界深度
const dofPass = dof(rgbShiftPass, camera, 5.0, 0.5);

postProcessing.outputNode = dofPass;
```

**ピクセル化（Pixelation）:**

```typescript
import { pixelation } from 'three/tsl';

const scenePass = pass(scene, camera);
const pixelationPass = pixelation(scenePass, 4); // ピクセルサイズ

postProcessing.outputNode = pixelationPass;
```

**セピア + フィルム + ガウスブラー:**

```typescript
import { sepia, film, gaussianBlur } from 'three/tsl';

const scenePass = pass(scene, camera);

// エフェクトをチェーン
const sepiaPass = sepia(scenePass, 0.7);
const filmPass = film(sepiaPass, 0.5, 0.5);
const blurPass = gaussianBlur(filmPass, 2);

postProcessing.outputNode = blurPass;
```

**カスタムエフェクト（TSL）:**

```typescript
import { Fn, uniform, texture, vec2, vec4 } from 'three/tsl';

const customEffect = Fn(() => {
  const uv = vec2(gl_FragCoord.xy / resolution);
  const color = texture(scenePass.getTextureNode(), uv);

  // グレースケール変換
  const gray = (color.r + color.g + color.b) / 3.0;

  return vec4(vec3(gray), 1.0);
});

postProcessing.outputNode = customEffect();
```

### 実装ワークフロー

**5ステップの基本フロー:**

1. **PostProcessingインスタンス作成:**
   ```typescript
   const postProcessing = new PostProcessing(renderer);
   ```

2. **scenePass作成:**
   ```typescript
   const scenePass = pass(scene, camera);
   ```

3. **テクスチャノード取得とエフェクト適用:**
   ```typescript
   const textureNode = scenePass.getTextureNode();
   const effectPass = bloom(textureNode, 1.0, 0.5, 0.85);
   ```

4. **outputNode設定:**
   ```typescript
   postProcessing.outputNode = effectPass;
   ```

5. **アニメーションループで render():**
   ```typescript
   function animate() {
     postProcessing.render();
     requestAnimationFrame(animate);
   }
   ```

### 主要なエフェクト一覧

| エフェクト | 関数 | 説明 | パラメータ |
|-----------|------|------|-----------|
| **Bloom** | `bloom()` | 明るい部分を発光 | 強度、半径、閾値 |
| **Dot Screen** | `dotScreen()` | ハーフトーン効果 | ドットサイズ、角度 |
| **RGB Shift** | `rgbShift()` | 色収差（色ずれ） | シフト量 |
| **Depth of Field** | `dof()` | 被写界深度（ボケ） | フォーカス距離、ボケ量 |
| **Pixelation** | `pixelation()` | ピクセル化 | ピクセルサイズ |
| **Sepia** | `sepia()` | セピア調 | 強度 |
| **Film** | `film()` | フィルムグレイン | ノイズ量、スキャンライン |
| **Gaussian Blur** | `gaussianBlur()` | ガウスぼかし | ブラー半径 |
| **Sobel** | `sobel()` | エッジ検出 | - |
| **FXAA** | `fxaa()` | アンチエイリアス | - |

### ユースケース

- **ゲーム演出**: ブルーム、被写界深度、モーションブラー
- **レトロ風表現**: ドットスクリーン、ピクセル化、CRTエフェクト
- **アート作品**: カスタムシェーダーでユニークな視覚効果
- **ビジュアライゼーション**: ポストプロセスで強調表現
- **UI/UX**: フォーカスエフェクト、トランジション

### 注意点

**パフォーマンス:**

- エフェクトを重ねすぎると重くなる
- フルスクリーンエフェクトは全ピクセルに適用されるため負荷高
- モバイルでは軽量エフェクトのみ推奨

**ブラウザサポート:**

- **WebGPU**: Chrome 113+, Edge 113+（2023年5月）
- **WebGLフォールバック**: WebGL環境では別のアプローチ（EffectComposer）

**Three.jsバージョン:**

- WebGPU対応版（r150以降）
- TSL対応が必須

**レスポンシブ対応:**

```typescript
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  // PostProcessingも更新
  postProcessing.setSize(width, height);
});
```

**WebGL版との違い:**

WebGL版では `EffectComposer` と個別のPassクラスを使用:

```typescript
// WebGL版（従来）
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(...));
```

WebGPU版はよりシンプル:

```typescript
// WebGPU版（新）
const postProcessing = new PostProcessing(renderer);
postProcessing.outputNode = bloom(scenePass, ...);
```

### 実践例

**グローエフェクト（発光オブジェクト）:**

```typescript
import { bloom } from 'three/tsl';

const scenePass = pass(scene, camera);
const bloomPass = bloom(
  scenePass,
  1.5,   // 強度
  0.4,   // 半径
  0.85   // 閾値（この明度以上が発光）
);

postProcessing.outputNode = bloomPass;
```

**レトロゲーム風:**

```typescript
import { pixelation, dotScreen } from 'three/tsl';

const scenePass = pass(scene, camera);
const pixelPass = pixelation(scenePass, 8);
const dotPass = dotScreen(pixelPass);

postProcessing.outputNode = dotPass;
```

**映画風（シネマティック）:**

```typescript
import { dof, film, sepia } from 'three/tsl';

const scenePass = pass(scene, camera);
const dofPass = dof(scenePass, camera, 10.0, 1.0);
const filmPass = film(dofPass, 0.3, 0.5);
const sepiaPass = sepia(filmPass, 0.3);

postProcessing.outputNode = sepiaPass;
```

**カスタムグレースケール:**

```typescript
import { Fn, texture, vec2, vec3, vec4 } from 'three/tsl';

const grayscaleEffect = Fn(() => {
  const uv = vec2(gl_FragCoord.xy / resolution);
  const color = texture(scenePass.getTextureNode(), uv);

  // 輝度計算（知覚的な重み付け）
  const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;

  return vec4(vec3(luminance), 1.0);
});

postProcessing.outputNode = grayscaleEffect();
```

### 関連技術

- **WebGPU**: 次世代GPU API
- **TSL**: Three.js Shading Language
- **GLSL**: OpenGL Shading Language（WebGL版で使用）
- **React Three Fiber**: Reactベースのラッパー
- **EffectComposer**: WebGL版のポストプロセス

### 参考リンク

- [ICS MEDIA - Three.jsポストプロセス](https://ics.media/entry/251113/)
- [Three.js公式 - WebGPU](https://threejs.org/docs/#api/en/renderers/WebGPURenderer)
- [Three.js Examples](https://threejs.org/examples/)
- [WindLand（事例研究）](https://windland.vercel.app/)

---
