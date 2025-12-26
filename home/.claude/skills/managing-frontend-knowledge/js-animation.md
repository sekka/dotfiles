# JavaScript アニメーション

requestAnimationFrame、数学的補間、物理ベースアニメーションに関するナレッジ集。

---

## 指数平滑法（Exponential Smoothing）

> 出典: https://gigazine.net/news/20240427-animation-trick/
> 原典: https://lisyarus.github.io/blog/posts/exponential-smoothing.html
> 執筆日: 2024-04-27
> 追加日: 2025-12-17

カメラ移動、UI要素、音量調整など、あらゆるアニメーションに使える汎用的な補間手法。
シンプルな数式で自然な動きを実現し、割り込みにも強い。

### なぜこの方法が良いのか

| 手法 | 問題点 |
|------|--------|
| 即座に移動 | 変化が見えずユーザーが状況を把握しにくい |
| 線形アニメーション | 機械的で不自然、開始・終了が硬い |
| イージング関数（cubic等） | 中断時の状態管理が複雑、方向転換で歪む |
| **指数平滑法** | シンプル、堅牢、中断に強い |

### コア数式

```javascript
// 基本形
position += (target - position) * (1 - Math.exp(-speed * dt));

// lerp を使った表現
position = lerp(position, target, 1 - Math.exp(-speed * dt));
```

- `position`: 現在位置
- `target`: 目標位置
- `speed`: 速度パラメータ（5〜50程度）
- `dt`: 前フレームからの経過時間（秒）

### コード例

```javascript
/**
 * 指数平滑法によるアニメーション
 * @param {number} current - 現在値
 * @param {number} target - 目標値
 * @param {number} speed - 速度（大きいほど速い）
 * @param {number} dt - 経過時間（秒）
 * @returns {number} 新しい現在値
 */
function exponentialSmooth(current, target, speed, dt) {
  return current + (target - current) * (1 - Math.exp(-speed * dt));
}

// 使用例: requestAnimationFrame でのアニメーション
let position = { x: 0, y: 0 };
let target = { x: 100, y: 100 };
let lastTime = performance.now();

function animate(currentTime) {
  const dt = (currentTime - lastTime) / 1000; // ミリ秒を秒に変換
  lastTime = currentTime;

  const speed = 10; // 速度パラメータ

  position.x = exponentialSmooth(position.x, target.x, speed, dt);
  position.y = exponentialSmooth(position.y, target.y, speed, dt);

  // 描画処理
  element.style.transform = `translate(${position.x}px, ${position.y}px)`;

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

### 2D/3D ベクトル対応

```javascript
// 2D ベクトル用
function smoothVector2D(current, target, speed, dt) {
  const factor = 1 - Math.exp(-speed * dt);
  return {
    x: current.x + (target.x - current.x) * factor,
    y: current.y + (target.y - current.y) * factor,
  };
}

// 汎用版（任意の数値プロパティに対応）
function smoothObject(current, target, speed, dt) {
  const factor = 1 - Math.exp(-speed * dt);
  const result = {};
  for (const key in target) {
    if (typeof target[key] === "number") {
      result[key] = current[key] + (target[key] - current[key]) * factor;
    }
  }
  return result;
}
```

### speed パラメータの目安

| 用途 | speed値 | 特徴 |
|------|---------|------|
| ゆっくりしたカメラ追従 | 2〜5 | 滑らかで落ち着いた動き |
| 通常のUI要素 | 8〜15 | 自然なレスポンス |
| 素早い反応が必要 | 20〜50 | 即座に追従、ほぼ瞬時 |

`1/speed` は位置が目標に対して約63%（1 - 1/e）近づくまでの時間（秒）。

### ユースケース

- **カメラ追従**: プレイヤーを滑らかに追いかけるカメラ
- **マウス追従**: カーソルに遅れてついてくる要素
- **スクロール位置**: スムーズスクロールの実装
- **音量調整**: 急激な変化を避けたフェード
- **UIの値表示**: カウンターの数値アニメーション
- **ドラッグ&ドロップ**: 離した後の慣性移動

### 主な利点

1. **状態管理が最小限**: 現在位置と目標位置のみ保持すれば良い
2. **フレームレート非依存**: `dt` を使うことで可変フレームレートに対応
3. **割り込み対応**: アニメーション中に目標が変わっても自然に追従
4. **オーバーシュートなし**: 目標を超えて振動することがない
5. **実装がシンプル**: 1行の数式で完結

### 注意点

- `speed` が大きすぎると線形アニメーションに近づき、指数平滑法の利点が薄れる
- `dt` が非常に大きい場合（例: タブがバックグラウンドにあった後）は、
  一気に目標に到達するため問題なし
- 完全に目標に到達することはない（漸近的に近づく）ため、
  十分近づいたら snap する処理を入れることもある

```javascript
// 十分近づいたら完了とみなす
const EPSILON = 0.01;
if (Math.abs(target - position) < EPSILON) {
  position = target; // snap to target
}
```

### 従来手法との比較

```javascript
// ❌ 線形補間（一定速度）- 硬い動き
position += speed * dt;

// ❌ イージング関数 - 中断時の処理が複雑
const t = elapsedTime / duration;
const eased = t * t * (3 - 2 * t); // smoothstep
position = start + (end - start) * eased;

// ✅ 指数平滑法 - シンプルで堅牢
position += (target - position) * (1 - Math.exp(-speed * dt));
```

---
