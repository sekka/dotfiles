---
title: "Theatre.js - GUI ベースのアニメーションライブラリ"
category: javascript/animation
tags: [javascript, animation, timeline, three-js, gui, theatre-js]
browser_support: "Modern browsers with localStorage and WebGL support"
created: 2026-02-01
updated: 2026-02-01
---

# Theatre.js - GUI ベースのアニメーションライブラリ

## 概要

Theatre.js は、動画編集アプリのようにGUIからアニメーションの作成と調整を可能にする JavaScript ライブラリ。コードではなくビジュアルなタイムライン編集で、DOM、Canvas、Three.js オブジェクトなどを自由にアニメーション可能。

> 出典: [デザイナーにもお勧め！ CSSもThree.jsもタイムライン編集を可能にするTheatre.jsが凄い - ICS MEDIA](https://ics.media/entry/240827/)
> 執筆日: 2024-08-27
> 追加日: 2026-02-01

**なぜTheatre.jsが革新的か:**
- コードの試行錯誤なしで複雑なアニメーションを作成
- デザイナーでも直感的に操作可能
- ブラウザ上で完結するビジュアルエディタ

## 対応要素

- **DOM要素:** HTML/CSSアニメーション
- **Canvas:** 2D描画アニメーション
- **Three.js:** 3Dオブジェクトアニメーション
- **カスタムオブジェクト:** 任意のJavaScriptオブジェクト

## インストール

```bash
npm install @theatre/core @theatre/studio
```

## 基本的な使い方

### Step 1: Studio と Project の初期化

```javascript
import studio from '@theatre/studio';
import { getProject } from '@theatre/core';

// 開発時のみStudioを起動
if (process.env.NODE_ENV === 'development') {
  studio.initialize();
}

// プロジェクトの作成
const project = getProject('My Project');
```

### Step 2: アニメーション可能なプロパティの定義

```javascript
import { types } from '@theatre/core';

const sheet = project.sheet('Scene');

const box = sheet.object('Box', {
  // 数値プロパティ
  x: types.number(0, { range: [-100, 100] }),
  y: types.number(0, { range: [-100, 100] }),

  // 色プロパティ
  color: types.rgba({ r: 1, g: 0, b: 0, a: 1 }),

  // 複合プロパティ
  transform: {
    position: {
      x: types.number(0),
      y: types.number(0),
      z: types.number(0),
    },
    rotation: {
      x: types.number(0, { range: [0, 360] }),
      y: types.number(0, { range: [0, 360] }),
      z: types.number(0, { range: [0, 360] }),
    },
  },
});
```

**プロパティ型:**
- `types.number()`: 数値
- `types.boolean()`: 真偽値
- `types.string()`: 文字列
- `types.rgba()`: RGBA色
- `types.stringLiteral()`: 選択肢

### Step 3: GUI の変更を反映

```javascript
box.onValuesChange((values) => {
  // DOM要素への反映
  element.style.transform = `translate(${values.x}px, ${values.y}px)`;
  element.style.backgroundColor = `rgba(${values.color.r * 255}, ${values.color.g * 255}, ${values.color.b * 255}, ${values.color.a})`;

  // Three.jsオブジェクトへの反映
  mesh.position.set(
    values.transform.position.x,
    values.transform.position.y,
    values.transform.position.z
  );
  mesh.rotation.set(
    values.transform.rotation.x * Math.PI / 180,
    values.transform.rotation.y * Math.PI / 180,
    values.transform.rotation.z * Math.PI / 180
  );
});
```

### Step 4: アニメーションの再生制御

```javascript
// シート全体を再生
sheet.sequence.play();

// 特定の位置から再生
sheet.sequence.play({ range: [0, 5] }); // 0秒から5秒まで

// 一時停止
sheet.sequence.pause();

// 特定の時間にシーク
sheet.sequence.position = 2.5; // 2.5秒の位置
```

### Step 5: JSON エクスポートと本番環境での使用

開発中はブラウザの localStorage にアニメーションデータが保存される。本番環境では JSON ファイルとしてエクスポート。

```javascript
// 開発環境: JSONをエクスポート
// GUIの「Export」ボタンからダウンロード

// 本番環境: JSONを読み込み
import projectState from './animation-state.json';

const project = getProject('My Project', { state: projectState });

// 本番環境ではStudioを無効化
// studio.initialize() を呼ばない
```

## Three.js との連携例

```javascript
import * as THREE from 'three';
import studio from '@theatre/studio';
import { getProject, types } from '@theatre/core';

// Three.jsシーンのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// メッシュの作成
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Theatre.jsのセットアップ
studio.initialize();
const project = getProject('Three.js Animation');
const sheet = project.sheet('Scene');

const cubeAnimation = sheet.object('Cube', {
  position: {
    x: types.number(0, { range: [-10, 10] }),
    y: types.number(0, { range: [-10, 10] }),
    z: types.number(0, { range: [-10, 10] }),
  },
  rotation: {
    x: types.number(0, { range: [0, 360] }),
    y: types.number(0, { range: [0, 360] }),
    z: types.number(0, { range: [0, 360] }),
  },
  scale: types.number(1, { range: [0.1, 5] }),
});

// アニメーション値をThree.jsに反映
cubeAnimation.onValuesChange((values) => {
  cube.position.set(values.position.x, values.position.y, values.position.z);
  cube.rotation.set(
    values.rotation.x * Math.PI / 180,
    values.rotation.y * Math.PI / 180,
    values.rotation.z * Math.PI / 180
  );
  cube.scale.setScalar(values.scale);
});

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// アニメーション再生
sheet.sequence.play({ iterationCount: Infinity });
```

## ユースケース

- **複雑な3Dアニメーション:** Three.js のメッシュ、カメラ、ライトの制御
- **インタラクティブな演出:** スクロールに連動したアニメーション
- **プロトタイピング:** デザイナーがコードなしでアニメーションを作成
- **教育コンテンツ:** 物理シミュレーションの可視化
- **製品紹介ページ:** 3Dモデルの回転・拡大演出

## 注意点

### ブラウザストレージ

- アニメーションデータは localStorage に保存される
- 開発中はブラウザのストレージをクリアしないよう注意
- 本番環境ではJSONエクスポートが必須

### パフォーマンス

- Three.js との連携時は `requestAnimationFrame` で描画ループを構築
- 大量のオブジェクトをアニメーションする場合は最適化が必要
- 複雑なシーンでは WebGL のパフォーマンス限界に注意

### キーフレームの制約

- **2点のキーフレームが必要:** 開始と終了の2点が必須
- 従来の動画編集ソフトとは異なり、1点のキーフレームは不可

### ライセンス

- Theatre.js は Apache 2.0 ライセンス
- 商用利用可能

## メリットとデメリット

### メリット

- **コード不要:** デザイナーでもアニメーション作成可能
- **リアルタイムプレビュー:** 即座に結果を確認
- **複雑なアニメーション管理:** 複数要素の同期が容易
- **直感的なキーフレーム操作:** ドラッグ&ドロップで編集

### デメリット

- **学習コスト:** 新しいツールの習得が必要
- **ファイルサイズ:** ライブラリのバンドルサイズが増加
- **デバッグ:** GUIで作成したアニメーションのデバッグが難しい場合がある
- **バージョン管理:** JSONファイルの差分管理が煩雑になる可能性

## 代替ライブラリとの比較

| ライブラリ | GUI | Three.js統合 | 学習コスト |
|-----------|-----|-------------|----------|
| **Theatre.js** | ✅ タイムライン | ✅ ネイティブ対応 | 中 |
| **GSAP** | ❌ コードのみ | ⚠️ 別途実装 | 低 |
| **Anime.js** | ❌ コードのみ | ⚠️ 別途実装 | 低 |
| **Lottie** | ✅ After Effects | ❌ 非対応 | 高（AE必要） |

## ブラウザサポート

- **localStorage:** 全モダンブラウザ
- **WebGL:** iOS 8+, Android 5+
- **Three.js r176 対応** (2025年5月時点)

## 関連技術

- **Three.js:** 3D レンダリングライブラリ
- **GSAP:** JavaScript アニメーションライブラリ
- **Lottie:** After Effects アニメーションの再生
- **requestAnimationFrame:** ブラウザのアニメーションAPI

## 参考リンク

- [Theatre.js 公式サイト](https://www.theatrejs.com/)
- [Theatre.js GitHub](https://github.com/theatre-js/theatre)
- [Three.js 公式サイト](https://threejs.org/)
- [記事内のデモ](https://ics.media/entry/240827/) (元記事参照)
