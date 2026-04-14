---
title: ArrayBuffer - JavaScriptでバイナリデータを扱う
category: javascript/patterns
tags: [arraybuffer, typedarray, binary, webgl, performance]
browser_support: モダンブラウザ全対応（ES2015+）
created: 2025-02-01
updated: 2025-02-01
---

# ArrayBuffer - JavaScriptでバイナリデータを扱う

## バイト単位でメモリ領域を確保するバイナリデータオブジェクト

> 出典: https://ics.media/entry/250408/
> 執筆日: 2025-04-08
> 追加日: 2025-02-01

`ArrayBuffer` は、バイト単位でメモリ領域を確保するバイナリデータオブジェクト。`TypedArray`（型付き配列）の基盤となり、画像・動画・音声などのメディアデータ操作やWebGL、ファイル処理に使用される。

### ArrayBufferとTypedArrayの関係

```
ArrayBuffer（生のバイナリデータ）
    ↓ TypedArrayで解釈
Uint8Array / Float32Array / Int16Array など
```

**重要**: `ArrayBuffer` 自体は読み書きできず、`TypedArray` を通してアクセスする。

### 基本的な作成と読み書き

```javascript
// 8バイトのバッファを確保
const buffer = new ArrayBuffer(8);

// Uint8Arrayビューを作成（1バイト単位）
const uint8View = new Uint8Array(buffer);
uint8View[0] = 255;
uint8View[1] = 128;

// Float64Arrayビューを作成（8バイト単位）
const float64View = new Float64Array(buffer);
console.log(float64View[0]); // Uint8Arrayで書き込んだデータを読み取る
```

### 主要なTypedArray

| TypedArray | 要素サイズ | 範囲 | 用途 |
|-----------|----------|------|------|
| `Uint8Array` | 1バイト | 0 ~ 255 | 画像データ、バイナリファイル |
| `Int8Array` | 1バイト | -128 ~ 127 | 符号付きバイトデータ |
| `Uint16Array` | 2バイト | 0 ~ 65535 | オーディオデータ |
| `Int16Array` | 2バイト | -32768 ~ 32767 | オーディオデータ |
| `Uint32Array` | 4バイト | 0 ~ 4294967295 | 大きな整数 |
| `Float32Array` | 4バイト | ±3.4e38 | WebGL、3D座標 |
| `Float64Array` | 8バイト | ±1.8e308 | 高精度計算 |
| `BigInt64Array` | 8バイト | ±2^63 | 大整数（ES2020） |
| `Float16Array` | 2バイト | ±65504 | AI/深層学習（新標準） |

### 配列（Array）との違い

| 特徴 | Array | TypedArray |
|------|-------|------------|
| 要素の型 | 混在可能 | 特定の数値型のみ |
| サイズ | 可変 | 固定 |
| パフォーマンス | 汎用的 | 高速（メモリ効率） |
| 用途 | 一般的なリスト | バイナリデータ処理 |

### 実践例1: Canvas画像処理

```javascript
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 画像データを取得（Uint8ClampedArray）
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = imageData.data; // Uint8ClampedArray

// グレースケール変換
for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const gray = (r + g + b) / 3;

  data[i] = gray;     // R
  data[i + 1] = gray; // G
  data[i + 2] = gray; // B
  // data[i + 3] はアルファ値（変更なし）
}

// 画像に反映
ctx.putImageData(imageData, 0, 0);
```

### 実践例2: WebGLバッファ

```javascript
const gl = canvas.getContext('webgl');

// 頂点データ（三角形）
const vertices = new Float32Array([
  0.0,  0.5, 0.0,
 -0.5, -0.5, 0.0,
  0.5, -0.5, 0.0
]);

// バッファを作成
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
```

### 実践例3: Fetch APIでバイナリデータ取得

```javascript
// 画像をバイナリで取得
const response = await fetch('image.png');
const arrayBuffer = await response.arrayBuffer();

// Uint8Arrayで解析
const uint8Array = new Uint8Array(arrayBuffer);
console.log('ファイルサイズ:', uint8Array.length);
console.log('最初の4バイト:', uint8Array.slice(0, 4)); // PNGシグネチャ
```

### 実践例4: Web Audio API

```javascript
const audioContext = new AudioContext();

// オーディオファイルを取得
const response = await fetch('audio.mp3');
const arrayBuffer = await response.arrayBuffer();

// デコード
const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

// Float32Arrayで波形データにアクセス
const channelData = audioBuffer.getChannelData(0); // Float32Array
console.log('サンプル数:', channelData.length);
```

### 実践例5: Web Workers

```javascript
// メインスレッド
const worker = new Worker('worker.js');
const buffer = new ArrayBuffer(1024);
const uint8Array = new Uint8Array(buffer);
uint8Array[0] = 42;

// バッファを転送（ゼロコピー）
worker.postMessage({ buffer }, [buffer]);
// この時点でメインスレッドからbufferにアクセス不可
```

```javascript
// worker.js
self.addEventListener('message', (event) => {
  const buffer = event.data.buffer;
  const uint8Array = new Uint8Array(buffer);
  console.log(uint8Array[0]); // 42
});
```

### バッファのコピー

```javascript
const buffer1 = new ArrayBuffer(8);
const view1 = new Uint8Array(buffer1);
view1[0] = 100;

// 新しいバッファにコピー
const buffer2 = buffer1.slice(0); // 全体をコピー
const view2 = new Uint8Array(buffer2);
console.log(view2[0]); // 100

// 元のバッファを変更しても影響なし
view1[0] = 200;
console.log(view2[0]); // 100（変わらない）
```

### DataView（エンディアン制御）

異なるバイトオーダーでデータを読み書き：

```javascript
const buffer = new ArrayBuffer(4);
const dataView = new DataView(buffer);

// ビッグエンディアンで書き込み
dataView.setUint32(0, 0x12345678, false);

// リトルエンディアンで読み取り
const value = dataView.getUint32(0, true);
console.log(value.toString(16)); // 78563412
```

### Float16Array（新標準）

AI・深層学習向けの16ビット浮動小数点数：

```javascript
// Chrome 117+ で対応
const float16 = new Float16Array([1.5, -2.5, 3.14]);
console.log(float16[0]); // 1.5
```

### パフォーマンス比較

```javascript
// 通常の配列
const arr = new Array(1000000);
for (let i = 0; i < arr.length; i++) {
  arr[i] = i;
}

// TypedArray（約2倍高速）
const typedArr = new Uint32Array(1000000);
for (let i = 0; i < typedArr.length; i++) {
  typedArr[i] = i;
}
```

### メモリ効率

```javascript
// 通常の配列（要素ごとに型情報を保持）
const arr = [1, 2, 3, 4]; // 約64バイト以上

// Uint8Array（1要素1バイト）
const uint8 = new Uint8Array([1, 2, 3, 4]); // 4バイト
```

### ブラウザサポート

- ✅ `ArrayBuffer`, `TypedArray`: 全モダンブラウザ（ES2015）
- ✅ `BigInt64Array`: Chrome 67+, Edge 79+, Firefox 68+, Safari 15+（ES2020）
- ✅ `Float16Array`: Chrome 117+, Edge 117+（2023年9月〜、Safari/Firefox 未対応）

### ユースケース

- **画像処理**: Canvas操作、フィルタ適用
- **オーディオ処理**: 波形編集、エフェクト
- **WebGL**: 3Dグラフィックス、ゲーム
- **ファイル操作**: バイナリファイルの読み書き
- **ネットワーク**: WebSocketでのバイナリ通信
- **データ圧縮**: ZIP、PNG、JPEGの解析
- **暗号化**: バイナリデータの暗号化・復号化

### 注意点

- **エンディアン**: プラットフォーム依存（通常はリトルエンディアン）
- **境界チェック**: 範囲外アクセスはエラー
- **メモリリーク**: 大きなバッファの解放忘れに注意

```javascript
// 範囲外アクセス
const buffer = new ArrayBuffer(4);
const view = new Uint8Array(buffer);
view[10] = 100; // エラーは出ないが、書き込まれない
console.log(view[10]); // undefined
```

### 参考資料

- [ArrayBuffer - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)
- [TypedArray - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
- [Float16Array - TC39 Proposal](https://github.com/tc39/proposal-float16array)

---
