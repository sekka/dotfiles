---
title: クリエイティブコーディング向け数値ユーティリティ
category: javascript/animation
tags: [creative-coding, generative-art, p5js, math, lerp, interpolation, random]
browser_support: モダンブラウザ全般
created: 2026-04-13
updated: 2026-04-13
---

# クリエイティブコーディング向け数値ユーティリティ

## recursiveRandom — 再帰的乱数で自然な確率分布を生成（p5.js）

> 出典: https://x.com/takawo/status/1528911817115783169 / https://gist.github.com/takawo/94e54399ff5ffa868c28efebb61e086a
> 投稿日: 2022-05-24
> 追加日: 2026-04-13

複数回の `random()` を乗算することで、均一な分布ではなく「中心に寄りやすく、端は出にくい」自然な確率分布を生成する手法。
ジェネラティブアートで放射状パターンや点群を描く際に使うと、機械的に見えず有機的な密度になる。

### コア実装（p5.js）

```javascript
function recursiveRandom(count, bool = true) {
  let n = 1;
  while (count > 0) {
    n *= random(); // p5.js の random() = [0, 1)
    count--;
  }
  // bool=true → 1-n（0〜1 に収束。1に近い値が多い）
  // bool=false → 1+n（1〜2 に収束。1に近い値が多い）
  return bool ? 1 - n : 1 + n;
}
```

### 実装例：放射状点群パターン（800×800 キャンバス）

```javascript
function setup() {
  createCanvas(800, 800);
  angleMode(DEGREES);
}

function draw() {
  background((95 / 100) * 255);
  push();
  translate(width / 2, height / 2);
  let ratio = 0.01;
  let angle_num = 10; // 放射方向の分割数

  for (let i = 0; i < 10000; i++) {
    let bool = random() > 0.5;

    // angle_num方向にスナップしつつ、recursiveRandomで微妙にぶれさせる
    let angle =
      (int(random(angle_num)) * 360) / angle_num +
      ((recursiveRandom(3, bool) - 0.5) * 360) / angle_num / 2;

    // 距離もrecursiveRandomで生成 → 中心付近に密集
    let n = recursiveRandom(random(0, 5), bool);
    let r = 200 * n;

    let x = cos(angle) * r * (bool ? 1 - ratio : 1 + ratio);
    let y = sin(angle) * r * (bool ? 1 - ratio : 1 + ratio);

    // nが0.5に近いほど太く、端（0 or 1付近）ほど細い
    strokeWeight(2 - abs(n - 1) * 2);
    point(x, y);
  }
  pop();
  noLoop(); // 1フレームのみ描画
}
```

### count の効果

| count | 分布の特徴 |
|-------|-----------|
| 0 | 均一分布（通常の random()と同じ） |
| 1 | 中心寄り（やや三角分布に近い） |
| 2 | より強く中心寄り |
| 3+ | 急激に中心付近への集中が強まる |

### ユースケース
- 放射状・星形のジェネラティブアート
- パーティクルの密度分布コントロール（中心に密集させたいとき）
- 「ランダムだけど有機的に見える」配置が必要な場面
- bool で内向き・外向きを対称に生成

---

## Num — アニメーション向け数値ユーティリティクラス（TypeScript）

> 出典: https://x.com/alumican_net/status/1453343483075313668 / https://github.com/alumican/alumican.js/blob/master/src/alumican/alm/util/Num.ts
> 投稿日: 2021-10-27
> 追加日: 2026-04-13

alumican（岡田雪也）による TypeScript 製の数値ユーティリティクラス。
インタラクティブコンテンツ・ジェネラティブアートで頻出する操作をまとめたもの。
そのまま移植して使える。

### コード全文

```typescript
export class Num {

  // --- マッピング ---

  /** 値を範囲 [srcA, srcB] から [dstA, dstB] にマッピング（デフォルトでclamp付き） */
  static map(value: number, srcA: number, srcB: number, dstA: number, dstB: number, clamp = true): number {
    if (srcA === srcB) return dstA;
    if (clamp) {
      if (srcA < srcB) {
        if (value < srcA) value = srcA;
        else if (value > srcB) value = srcB;
      } else {
        if (value < srcB) value = srcB;
        else if (value > srcA) value = srcA;
      }
    }
    return (value - srcA) * (dstB - dstA) / (srcB - srcA) + dstA;
  }

  /** イージング関数を通してマッピング（clamp込み） */
  static ease(value: number, srcA: number, srcB: number, dstA: number, dstB: number, easing: (t: number) => number): number {
    if (srcA === srcB) return dstA;
    if (srcA < srcB) {
      if (value < srcA) value = srcA;
      else if (value > srcB) value = srcB;
      return easing((value - srcA) / (srcB - srcA)) * (dstB - dstA) + dstA;
    } else {
      if (value < srcB) value = srcB;
      else if (value > srcA) value = srcA;
      return easing((value - srcB) / (srcA - srcB)) * (dstB - dstA) + dstA;
    }
  }

  // --- clamp ---

  /** 値を [min, max] に丸める */
  static clamp(value: number, min: number, max: number): number {
    return value < min ? min : (value > max ? max : value);
  }

  /** 符号を保ったまま絶対値を [minAbs, maxAbs] に丸める */
  static clampAbs(value: number, minAbs: number, maxAbs: number): number {
    if (value > 0) {
      return value < minAbs ? minAbs : (value > maxAbs ? maxAbs : value);
    } else {
      const abs = Math.abs(value);
      return -(abs < minAbs ? minAbs : (abs > maxAbs ? maxAbs : abs));
    }
  }

  // --- 補間 ---

  /** 線形補間: t=0 → a、t=1 → b（デフォルトでclamp付き） */
  static lerp(t: number, a: number, b: number, clamp = true): number {
    if (clamp) {
      if (t < 0) t = 0;
      else if (t > 1) t = 1;
    }
    return a * (1 - t) + b * t;
  }

  // --- 乱数 ---

  /** 小数乱数 [min, max) */
  static random(min = 0, max = 1): number {
    return min + (max - min) * Math.random();
  }

  /** 整数乱数 [min, max] */
  static randomInt(min = 0, max = 1): number {
    return Math.floor(Num.random(min, max + 1));
  }

  /** 正負両方向に同じ範囲で乱数を返す（符号はランダム） */
  static randomAbs(min = 0, max = 1): number {
    return Num.random(min, max) * Num.randomSign();
  }

  /** +1 か -1 をランダムに返す */
  static randomSign(): number {
    return Math.random() < 0.5 ? 1 : -1;
  }

  // --- 幾何 ---

  /** 2点間の距離（squared=trueで2乗値、sqrtを省いて高速化） */
  static dist(x1: number, y1: number, x2: number, y2: number, squared = false): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return squared ? dx * dx + dy * dy : Math.sqrt(dx * dx + dy * dy);
  }

  // --- 角度変換 ---

  static radToDeg(radian: number): number { return radian * (180 / Math.PI); }
  static degToRad(degree: number): number { return degree * (Math.PI / 180); }

  /** 2つの角度間の最短回転角度を返す（-π〜π） */
  static turn(from: number, to: number, radian = true): number {
    return radian
      ? (to - from + Math.PI * 3) % (Math.PI * 2) - Math.PI
      : (to - from + 540) % 360 - 180;
  }

  // --- 定数 ---
  static readonly PI2 = Math.PI * 2;
  static readonly PI3 = Math.PI * 3;
  static readonly PI_2 = Math.PI / 2;
  static readonly PI_3 = Math.PI / 3;
  static readonly PI_4 = Math.PI / 4;
  static readonly PI_6 = Math.PI / 6;
}
```

### 各メソッドのユースケース

| メソッド | 典型的なユースケース |
|---------|------------------|
| `map()` | スクロール量→アニメーション進行度、マウス座標→色や角度 |
| `ease()` | カーソル追従にイージングをかけてなめらかに |
| `clamp()` | スクロール進行度を 0〜1 に収める |
| `clampAbs()` | 速度ベクトルの上限設定（正負対称に） |
| `lerp()` | フレームごとに目標値へ少しずつ近づける（慣性・追従効果） |
| `randomAbs()` | ±方向にランダムなオフセットを加える |
| `randomSign()` | パーティクルの左右・上下振り分け |
| `dist()` | マウスとの近接判定（`squared=true` で高速化） |
| `turn()` | キャラクターや矢印が最短経路で向きを変えるアニメーション |

### 特徴
- `map()` は clamp をデフォルトで有効にしているため、範囲外入力でも安全
- `lerp()` の引数順が `(t, a, b)` — t が最初（GLSL や一部ライブラリと同じ）
- `dist(squared=true)` は `Math.sqrt` を省略でき、単純比較なら2倍以上高速
- `turn()` は角度ラップアラウンド問題を自動解決（359°→1° が +2° になる）

---
