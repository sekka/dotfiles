---
title: "TensorFlow.js でリアルタイム顔認識"
category: javascript/patterns
tags: [javascript, tensorflow, machine-learning, face-detection, webgl, threejs, webcam]
browser_support: "Modern browsers with WebRTC and WebGL support, iOS 8+ for WebGL"
created: 2026-02-01
updated: 2026-02-01
---

# TensorFlow.js でリアルタイム顔認識

## 概要

TensorFlow.js を使用してブラウザ上でリアルタイムに顔を認識し、フィルターやステッカーを適用する方法。機械学習をクライアントサイドで実行し、プライバシーを保ちながらインタラクティブな体験を提供。

> 出典: [ブラウザ上で可愛いフィルターを実現！TensorFlow.jsを使ったリアルタイム顔認識 - ICS MEDIA](https://ics.media/entry/240709/)
> 執筆日: 2024-07-09
> 追加日: 2026-02-01

**なぜブラウザで機械学習？**
- サーバーへの画像送信不要（プライバシー保護）
- リアルタイム処理が可能
- インストール不要で誰でもアクセス可能

## 必要なライブラリ

### TensorFlow.js

Google が開発した機械学習ライブラリの JavaScript 版。

```bash
npm install @tensorflow/tfjs
```

### Face Detection モデル

顔の検出とキーポイント抽出。

```bash
npm install @tensorflow-models/face-detection
```

**検出内容:**
- 顔の位置（バウンディングボックス）
- 目、鼻、口などのキーポイント
- 顔の向き（2D）

### Face Landmarks Detection モデル

468 個の詳細な顔のランドマークを検出（3D座標付き）。

```bash
npm install @tensorflow-models/face-landmarks-detection
```

**検出内容:**
- 468 個の顔のランドマーク
- 3D 座標（x, y, z）
- 法線ベクトル

### Three.js（3D レンダリング用）

3D ステッカーの配置に使用。

```bash
npm install three
```

## 基本的な実装フロー

### Step 1: Webcam の取得

`getUserMedia` API で webcam の映像を取得。

```javascript
const video = document.createElement('video');

navigator.mediaDevices.getUserMedia({
  video: {
    width: 640,
    height: 480,
    facingMode: 'user' // フロントカメラ
  },
  audio: false
})
.then(stream => {
  video.srcObject = stream;
  video.play();
})
.catch(error => {
  console.error('カメラアクセスエラー:', error);
});
```

### Step 2: Face Detection モデルの読み込み

```javascript
import * as faceDetection from '@tensorflow-models/face-detection';
import '@tensorflow/tfjs-backend-webgl';

// MediaPipe FaceDetector モデルを読み込み
const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
const detectorConfig = {
  runtime: 'mediapipe',
  solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection'
};

const detector = await faceDetection.createDetector(model, detectorConfig);
```

### Step 3: 顔の検出とキーポイント取得

```javascript
async function detectFaces() {
  const faces = await detector.estimateFaces(video);

  if (faces.length > 0) {
    const face = faces[0];

    // バウンディングボックス
    const { xMin, yMin, width, height } = face.box;

    // キーポイント
    const keypoints = face.keypoints;
    const leftEye = keypoints.find(kp => kp.name === 'leftEye');
    const rightEye = keypoints.find(kp => kp.name === 'rightEye');

    // ステッカーの位置と角度を計算
    const position = calculateStickerPosition(leftEye, rightEye);
    drawSticker(position);
  }

  requestAnimationFrame(detectFaces);
}

detectFaces();
```

### Step 4: ステッカーの配置（2D アプローチ）

顔の角度と大きさを計算してステッカーを配置。

```javascript
function calculateStickerPosition(leftEye, rightEye) {
  // 目の中心座標
  const centerX = (leftEye.x + rightEye.x) / 2;
  const centerY = (leftEye.y + rightEye.y) / 2;

  // 目の距離からスケールを計算
  const eyeDistance = Math.sqrt(
    Math.pow(rightEye.x - leftEye.x, 2) +
    Math.pow(rightEye.y - leftEye.y, 2)
  );
  const scale = eyeDistance / 100; // 基準値で割る

  // 顔の角度を計算
  const angle = Math.atan2(
    rightEye.y - leftEye.y,
    rightEye.x - leftEye.x
  );

  return { x: centerX, y: centerY, scale, angle };
}

function drawSticker(position) {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.translate(position.x, position.y);
  ctx.rotate(position.angle);
  ctx.scale(position.scale, position.scale);

  // ステッカー画像を描画
  const stickerImage = document.getElementById('sticker');
  ctx.drawImage(stickerImage, -50, -50, 100, 100);

  ctx.restore();
}
```

## 3D アプローチ（Face Landmarks Detection）

より正確な3D配置のために、468個のランドマークを使用。

### Step 1: Face Landmarks Detection モデルの読み込み

```javascript
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';

const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
const detectorConfig = {
  runtime: 'mediapipe',
  solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
  refineLandmarks: true
};

const detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
```

### Step 2: 3D 座標の取得

```javascript
async function detectFaceLandmarks() {
  const predictions = await detector.estimateFaces(video);

  if (predictions.length > 0) {
    const keypoints = predictions[0].keypoints;

    // 3D 座標（x, y, z）
    keypoints.forEach(point => {
      console.log(point.x, point.y, point.z);
    });

    // 法線ベクトルで顔の向きを取得
    // （実装例は省略）
  }

  requestAnimationFrame(detectFaceLandmarks);
}
```

### Step 3: Three.js での 3D ステッカー配置

```javascript
import * as THREE from 'three';

// Three.js シーンのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ステッカーメッシュの作成
const geometry = new THREE.PlaneGeometry(1, 1);
const texture = new THREE.TextureLoader().load('sticker.png');
const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
const stickerMesh = new THREE.Mesh(geometry, material);
scene.add(stickerMesh);

// 顔のランドマークに基づいて位置を更新
function updateStickerPosition(keypoints) {
  // 鼻の頂点（例: キーポイント 1）
  const nose = keypoints[1];

  // 3D 座標を Three.js の座標系に変換
  stickerMesh.position.set(
    (nose.x / video.width - 0.5) * 10,
    -(nose.y / video.height - 0.5) * 10,
    nose.z * 0.01
  );

  // 法線ベクトルから回転を計算（省略）
}

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

## パフォーマンス最適化

### 1. 検出頻度の調整

毎フレーム検出すると重いので、間引く。

```javascript
let frameCount = 0;

function detectFaces() {
  frameCount++;

  if (frameCount % 2 === 0) { // 2フレームに1回
    detector.estimateFaces(video).then(faces => {
      // 処理
    });
  }

  requestAnimationFrame(detectFaces);
}
```

### 2. WebGL バックエンドの使用

```javascript
import '@tensorflow/tfjs-backend-webgl';
await tf.setBackend('webgl');
```

### 3. 入力解像度の調整

高解像度は精度が上がるが、処理が重くなる。

```javascript
navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 640 }, // 低解像度
    height: { ideal: 480 }
  }
});
```

## ユースケース

- **AR フィルター:** Instagram/Snapchat 風のフィルター
- **仮想試着:** メガネ、帽子、アクセサリーの試着
- **顔認証:** ログイン、本人確認
- **表情分析:** 感情認識、ゲーム操作
- **教育コンテンツ:** 顔の構造を可視化

## 注意点

### プライバシー

- カメラアクセスにはユーザーの許可が必要
- 画像データをサーバーに送信しない（ローカル処理）
- HTTPS 環境が必須（`getUserMedia` の要件）

### パフォーマンス

- モバイルデバイスでは処理が重い場合がある
- WebGL 非対応ブラウザでは動作しない
- バッテリー消費が大きい

### ブラウザサポート

| 機能 | サポート |
|------|---------|
| **WebRTC (getUserMedia)** | 全モダンブラウザ |
| **WebGL** | iOS 8+, Android 5+ |
| **TensorFlow.js** | 全モダンブラウザ |

### ライセンス

- TensorFlow.js: Apache 2.0
- MediaPipe モデル: Apache 2.0

## 完全な実装例

```javascript
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';
import '@tensorflow/tfjs-backend-webgl';

async function main() {
  // WebGL バックエンドを使用
  await tf.setBackend('webgl');

  // ビデオ要素を作成
  const video = document.createElement('video');
  video.width = 640;
  video.height = 480;

  // カメラアクセス
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480, facingMode: 'user' },
    audio: false
  });
  video.srcObject = stream;
  await video.play();

  // Canvas 要素
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 640;
  canvas.height = 480;

  // 検出器を作成
  const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
  const detector = await faceDetection.createDetector(model, {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection'
  });

  // ステッカー画像
  const sticker = new Image();
  sticker.src = 'sticker.png';

  // 検出ループ
  async function detect() {
    // ビデオフレームを Canvas に描画
    ctx.drawImage(video, 0, 0, 640, 480);

    // 顔を検出
    const faces = await detector.estimateFaces(video);

    faces.forEach(face => {
      const keypoints = face.keypoints;
      const leftEye = keypoints.find(kp => kp.name === 'leftEye');
      const rightEye = keypoints.find(kp => kp.name === 'rightEye');

      if (leftEye && rightEye) {
        // ステッカー位置を計算
        const centerX = (leftEye.x + rightEye.x) / 2;
        const centerY = (leftEye.y + rightEye.y) / 2;
        const eyeDistance = Math.sqrt(
          Math.pow(rightEye.x - leftEye.x, 2) +
          Math.pow(rightEye.y - leftEye.y, 2)
        );
        const scale = eyeDistance / 100;
        const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

        // ステッカーを描画
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.scale(scale, scale);
        ctx.drawImage(sticker, -50, -50, 100, 100);
        ctx.restore();
      }
    });

    requestAnimationFrame(detect);
  }

  detect();
}

main();
```

## 関連技術

- **TensorFlow.js:** ブラウザ上での機械学習
- **MediaPipe:** Google の機械学習フレームワーク
- **WebRTC (getUserMedia):** カメラアクセス API
- **WebGL:** GPU アクセラレーション
- **Three.js:** 3D レンダリング
- **Canvas API:** 2D 描画

## 参考リンク

- [TensorFlow.js 公式サイト](https://www.tensorflow.org/js)
- [Face Detection モデル](https://github.com/tensorflow/tfjs-models/tree/master/face-detection)
- [Face Landmarks Detection モデル](https://github.com/tensorflow/tfjs-models/tree/master/face-landmarks-detection)
- [MediaPipe Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh.html)
- [getUserMedia API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Three.js 公式サイト](https://threejs.org/)
