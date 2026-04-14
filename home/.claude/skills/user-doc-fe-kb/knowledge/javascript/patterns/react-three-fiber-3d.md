---
title: React Three Fiber - ReactとThree.jsで始める3D表現
category: javascript/patterns
tags: [react, three.js, 3d, webgl, react-three-fiber]
browser_support: モダンブラウザ（WebGL対応必須）
created: 2025-02-01
updated: 2025-02-01
---

# React Three Fiber - ReactとThree.jsで始める3D表現

## Reactコンポーネントで宣言的に3Dシーンを構築

> 出典: https://ics.media/entry/250410/
> 執筆日: 2025-04-10
> 追加日: 2025-02-01

React Three Fiberは、Three.jsをReactコンポーネントとして扱えるライブラリ。従来のThree.jsと比べて、ボイラープレートコードが不要で、宣言的に3Dシーンを構築できる。

### React Three Fiberの3つの利点

1. **ボイラープレート削減**: Scene、Camera、Rendererの手動設定が不要
2. **コンポーネント化**: 3DオブジェクトをReactコンポーネントとして管理
3. **イベント処理の簡素化**: `onClick`, `onPointerOver` などのReactプロパティで直感的

### セットアップ

```bash
npm install three @types/three @react-three/fiber
```

### 基本的な3Dシーン

```tsx
import { Canvas } from '@react-three/fiber';

function App() {
  return (
    <Canvas>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshNormalMaterial />
      </mesh>
    </Canvas>
  );
}
```

**Three.js（従来）との比較**:

```javascript
// Three.js（従来）
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshNormalMaterial();
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

React Three Fiberでは、これらが全て `<Canvas>` で自動化される。

### Canvasコンポーネントの設定

```tsx
<Canvas
  camera={{ position: [0, 0, 5], fov: 75 }}
  gl={{ antialias: true }}
  shadows
>
  {/* 3Dコンテンツ */}
</Canvas>
```

**主なプロパティ**:
- `camera`: カメラの設定（位置、視野角など）
- `gl`: WebGLRendererの設定
- `shadows`: 影の有効化
- `dpr`: デバイスピクセル比（Retinaディスプレイ対応）

### 照明の追加

```tsx
<Canvas>
  <ambientLight intensity={0.5} /> {/* 環境光 */}
  <directionalLight position={[5, 5, 5]} intensity={1} /> {/* 平行光源 */}

  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="orange" />
  </mesh>
</Canvas>
```

### 3Dモデルの読み込み（useLoader）

```tsx
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Suspense } from 'react';

function Model() {
  const gltf = useLoader(GLTFLoader, '/model.glb');
  return <primitive object={gltf.scene} />;
}

function App() {
  return (
    <Canvas>
      <Suspense fallback={null}>
        <Model />
      </Suspense>
    </Canvas>
  );
}
```

**重要**: `Suspense` で非同期読み込みをラップする。

### インタラクション（イベントハンドリング）

```tsx
function InteractiveSphere() {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  return (
    <mesh
      onClick={() => setClicked(!clicked)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={clicked ? 1.5 : 1}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}
```

**利用可能なイベント**:
- `onClick`, `onDoubleClick`
- `onPointerDown`, `onPointerUp`, `onPointerMove`
- `onPointerOver`, `onPointerOut`
- `onPointerEnter`, `onPointerLeave`
- `onWheel`

### アニメーション（useFrame）

```tsx
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function RotatingBox() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="royalblue" />
    </mesh>
  );
}
```

**useFrame の引数**:
- `state`: シーンの状態（camera, clock など）
- `delta`: 前フレームからの経過時間（秒）

### イージング（滑らかなアニメーション）

```tsx
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function SmoothRotatingBox() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // THREE.MathUtils.damp でイージング
      meshRef.current.rotation.y = THREE.MathUtils.damp(
        meshRef.current.rotation.y,
        Math.sin(state.clock.elapsedTime), // 目標値
        2, // 減衰率（低いほど滑らか）
        delta
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="teal" />
    </mesh>
  );
}
```

### カメラコントロール（@react-three/drei）

```bash
npm install @react-three/drei
```

```tsx
import { OrbitControls } from '@react-three/drei';

<Canvas>
  <OrbitControls
    enablePan={true}
    enableZoom={true}
    enableRotate={true}
    minDistance={2}
    maxDistance={10}
  />
  {/* 3Dコンテンツ */}
</Canvas>
```

### 複数のマテリアル（Drei）

```tsx
import { MeshWobbleMaterial } from '@react-three/drei';

<mesh>
  <sphereGeometry args={[1, 32, 32]} />
  <MeshWobbleMaterial
    color="lightblue"
    speed={2}
    factor={0.5}
  />
</mesh>
```

### パフォーマンス最適化

#### 1. instancedMesh（大量のオブジェクト）

```tsx
import { useMemo } from 'react';
import * as THREE from 'three';

function Instances({ count = 1000 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const positions = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push([
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
      ]);
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (meshRef.current) {
      for (let i = 0; i < count; i++) {
        const matrix = new THREE.Matrix4();
        matrix.setPosition(...positions[i]);
        meshRef.current.setMatrixAt(i, matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color="cyan" />
    </instancedMesh>
  );
}
```

#### 2. Leva（デバッグツール）

```bash
npm install leva
```

```tsx
import { useControls } from 'leva';

function Box() {
  const { scale, color } = useControls({
    scale: { value: 1, min: 0.5, max: 2, step: 0.1 },
    color: '#ff6347',
  });

  return (
    <mesh scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
```

### ブラウザサポート

- ✅ Chrome, Edge, Firefox, Safari（WebGL対応ブラウザ）
- ⚠️ モバイルブラウザ: 性能によってはパフォーマンス低下

### ユースケース

- **商品ビューア**: ECサイトの3D商品表示
- **データ可視化**: 3Dグラフ、地図
- **ゲーム**: ブラウザベースの3Dゲーム
- **バーチャル展示**: オンライン美術館、不動産
- **教育コンテンツ**: インタラクティブな学習素材

### 注意点

- **バンドルサイズ**: Three.js本体が大きい（最適化必須）
- **パフォーマンス**: モバイルでは注意（`dpr` を調整）
- **アクセシビリティ**: 3Dコンテンツには代替テキストを提供

### パフォーマンス最適化のベストプラクティス

```tsx
<Canvas
  dpr={[1, 2]} // Retinaディスプレイで最大2倍
  performance={{ min: 0.5 }} // 最小30fps
  frameloop="demand" // 必要時のみレンダリング
>
  {/* 3Dコンテンツ */}
</Canvas>
```

### 参考資料

- [React Three Fiber 公式ドキュメント](https://docs.pmnd.rs/react-three-fiber)
- [Drei（ヘルパーライブラリ）](https://github.com/pmndrs/drei)
- [Three.js 公式](https://threejs.org/)

---
