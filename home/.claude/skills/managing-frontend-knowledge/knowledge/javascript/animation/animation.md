---
title: JavaScript アニメーション
category: javascript/animation
tags: [javascript, animation, exponential-smoothing, interpolation]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# JavaScript アニメーション

requestAnimationFrame、数学的補間、物理ベースアニメーションに関するナレッジ集。

---

## テキストタイピングエフェクト

> 出典: https://webdesign.tutsplus.com/how-to-create-an-auto-text-typing-effect-with-vanilla-javascript--cms-108795t
> 執筆日: 2024-08-08
> 追加日: 2026-01-31

バニラJavaScriptを使用した自動テキストタイピング効果。ユーザーの注意を引く視覚効果として、検索バーやヒーローセクションなどに使用される。

### なぜこの方法が良いのか

- **ライブラリ不要**: Vanilla JavaScriptのみで実装可能
- **カスタマイズ性**: タイピング速度、テキストリスト、削除速度を自由に調整
- **軽量**: 外部依存なしで最小限のコード

### コード例

```javascript
/**
 * テキストタイピングエフェクト
 */
class TypeWriter {
  constructor(element, texts, options = {}) {
    this.element = element;
    this.texts = texts;
    this.speed = options.speed || 200;        // タイピング速度（ms）
    this.deleteSpeed = options.deleteSpeed || 100; // 削除速度（ms）
    this.pauseTime = options.pauseTime || 2000;   // 次のテキストまでの待機時間（ms）
    this.showCursor = options.showCursor !== false; // カーソル表示

    this.textIndex = 0;
    this.charIndex = 0;
    this.isTyping = true;
  }

  start() {
    if (this.showCursor) {
      this.element.classList.add('typing-cursor');
    }
    this.type();
  }

  type() {
    const currentText = this.texts[this.textIndex];

    if (this.isTyping) {
      // タイピング中
      if (this.charIndex < currentText.length) {
        this.element.value = currentText.slice(0, this.charIndex + 1);
        this.charIndex++;
        setTimeout(() => this.type(), this.speed);
      } else {
        // タイピング完了、削除モードに切り替え
        this.isTyping = false;
        setTimeout(() => this.type(), this.pauseTime);
      }
    } else {
      // 削除中
      if (this.charIndex > 0) {
        this.element.value = currentText.slice(0, this.charIndex - 1);
        this.charIndex--;
        setTimeout(() => this.type(), this.deleteSpeed);
      } else {
        // 削除完了、次のテキストへ
        this.isTyping = true;
        this.textIndex = (this.textIndex + 1) % this.texts.length;
        setTimeout(() => this.type(), this.speed);
      }
    }
  }
}

// 使用例
const searchInput = document.querySelector('#search');
const texts = [
  'Software Engineer',
  'Data Scientist',
  'Product Designer',
  'DevOps Engineer'
];

const typewriter = new TypeWriter(searchInput, texts, {
  speed: 200,
  deleteSpeed: 100,
  pauseTime: 2000
});

typewriter.start();
```

### CSS（カーソルアニメーション）

```css
/* タイピングカーソル */
.typing-cursor {
  border-right: 2px solid currentColor;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% {
    border-color: transparent;
  }
}

/* 等幅フォント推奨 */
input.typing-cursor {
  font-family: 'DM Mono', 'Courier New', monospace;
}
```

### より高度な実装（HTMLテキスト対応）

```javascript
/**
 * HTML要素のテキストタイピング（input以外にも対応）
 */
class HTMLTypeWriter {
  constructor(element, texts, options = {}) {
    this.element = element;
    this.texts = texts;
    this.speed = options.speed || 100;
    this.deleteSpeed = options.deleteSpeed || 50;
    this.pauseTime = options.pauseTime || 2000;

    this.textIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
  }

  start() {
    this.type();
  }

  type() {
    const currentText = this.texts[this.textIndex];
    const displayText = this.isDeleting
      ? currentText.slice(0, this.charIndex - 1)
      : currentText.slice(0, this.charIndex + 1);

    this.element.textContent = displayText;

    let delta = this.isDeleting ? this.deleteSpeed : this.speed;

    if (!this.isDeleting && this.charIndex === currentText.length) {
      // タイピング完了、削除モードに切り替え
      delta = this.pauseTime;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      // 削除完了、次のテキストへ
      this.isDeleting = false;
      this.textIndex = (this.textIndex + 1) % this.texts.length;
      delta = 500; // 次のテキスト開始前の短い待機
    }

    this.charIndex += this.isDeleting ? -1 : 1;
    setTimeout(() => this.type(), delta);
  }
}

// 使用例（見出しテキスト）
const heading = document.querySelector('h1 .typewriter');
const headingTexts = [
  'Build Faster',
  'Ship Smarter',
  'Scale Better'
];

const headingTypewriter = new HTMLTypeWriter(heading, headingTexts);
headingTypewriter.start();
```

### ユースケース

- **検索バー**: プレースホルダーのヒント表示
- **ヒーローセクション**: キャッチコピーのアニメーション
- **プロフィール**: 職業・スキルの自動表示
- **チャットUI**: メッセージの段階的表示
- **通知・アラート**: 重要メッセージの強調表示

### パフォーマンスの考慮事項

```javascript
/**
 * requestAnimationFrame 版（より滑らか）
 */
class SmoothTypeWriter {
  constructor(element, texts, options = {}) {
    this.element = element;
    this.texts = texts;
    this.charsPerSecond = options.charsPerSecond || 10; // 1秒あたりの文字数

    this.textIndex = 0;
    this.progress = 0;
    this.isDeleting = false;
    this.lastTime = 0;
  }

  start() {
    requestAnimationFrame((time) => this.animate(time));
  }

  animate(currentTime) {
    if (!this.lastTime) this.lastTime = currentTime;
    const deltaTime = (currentTime - this.lastTime) / 1000; // 秒に変換
    this.lastTime = currentTime;

    const currentText = this.texts[this.textIndex];
    const charsToAdd = this.charsPerSecond * deltaTime;

    if (this.isDeleting) {
      this.progress -= charsToAdd;
      if (this.progress <= 0) {
        this.progress = 0;
        this.isDeleting = false;
        this.textIndex = (this.textIndex + 1) % this.texts.length;
      }
    } else {
      this.progress += charsToAdd;
      if (this.progress >= currentText.length) {
        this.progress = currentText.length;
        setTimeout(() => {
          this.isDeleting = true;
          this.lastTime = 0;
        }, 2000); // 2秒待機
        return;
      }
    }

    const charIndex = Math.floor(this.progress);
    this.element.textContent = currentText.slice(0, charIndex);

    requestAnimationFrame((time) => this.animate(time));
  }
}
```

### アクセシビリティの考慮

```javascript
// prefers-reduced-motion への対応
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  // アニメーション有効
  const typewriter = new TypeWriter(element, texts);
  typewriter.start();
} else {
  // アニメーション無効、最初のテキストを表示
  element.value = texts[0];
}
```

### 注意点

- **`setTimeout` の精度**: ブラウザによって若干のズレあり
- **バックグラウンドタブ**: タブが非アクティブ時に `setTimeout` が遅延する可能性
- **メモリリーク**: 不要になったらタイマーをクリア
- **モーション配慮**: `prefers-reduced-motion` を尊重

```javascript
// クリーンアップ
class TypeWriter {
  // ...
  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  type() {
    // setTimeout の戻り値を保存
    this.timeoutId = setTimeout(() => this.type(), this.speed);
  }
}
```

---

## GSAPマーキーエフェクト

> 出典: https://webdesign.tutsplus.com/how-to-build-horizontal-marquee-effects-with-gsap--cms-108794t
> 執筆日: 2024-07-23（更新: 2025-01-03）
> 追加日: 2026-01-31

GreenSock（GSAP）を使用した無限ループするマーキーエフェクト。高性能で滑らかなアニメーションを実現し、ホバー停止・逆方向・ビューポート連動などの高度な制御が可能。

### なぜGSAPを使うのか

- **高性能**: 全ブラウザで最適化されたアニメーションエンジン
- **柔軟性**: `ScrollTrigger` や `Draggable` との統合
- **制御性**: 一時停止・再開・速度変更が容易

### 基本的な実装

```javascript
/**
 * 基本的なマーキーエフェクト
 */
window.addEventListener('load', function () {
  horizontalLoop('.marquee-item', {
    repeat: -1,          // 無限ループ
    paddingRight: 40,    // 要素間のギャップ
    speed: 0.5,          // 速度（秒単位）
  });
});
```

```html
<div class="marquee">
  <div class="marquee-item">Logo 1</div>
  <div class="marquee-item">Logo 2</div>
  <div class="marquee-item">Logo 3</div>
  <!-- 自動複製される -->
</div>
```

```css
.marquee {
  display: flex;
  overflow: hidden;
  gap: 40px; /* paddingRight と一致させる */
}

.marquee-item {
  flex-shrink: 0;
}
```

### horizontalLoop 関数（GSAPヘルパー）

```javascript
/**
 * GSAP横スクロールループ
 * @see https://gsap.com/docs/v3/HelperFunctions
 */
function horizontalLoop(items, config) {
  items = gsap.utils.toArray(items);
  config = config || {};

  let tl = gsap.timeline({
      repeat: config.repeat,
      paused: config.paused,
      defaults: { ease: "none" },
      onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)
    }),
    length = items.length,
    startX = items[0].offsetLeft,
    times = [],
    widths = [],
    xPercents = [],
    curIndex = 0,
    pixelsPerSecond = (config.speed || 1) * 100,
    snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1),
    totalWidth, curX, distanceToStart, distanceToLoop, item, i;

  gsap.set(items, {
    xPercent: (i, el) => {
      let w = widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
      xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px")) / w * 100 + gsap.getProperty(el, "xPercent"));
      return xPercents[i];
    }
  });

  gsap.set(items, { x: 0 });

  totalWidth = items[length - 1].offsetLeft + xPercents[length - 1] / 100 * widths[length - 1] - startX + items[length - 1].offsetWidth * gsap.getProperty(items[length - 1], "scaleX") + (parseFloat(config.paddingRight) || 0);

  for (i = 0; i < length; i++) {
    item = items[i];
    curX = xPercents[i] / 100 * widths[i];
    distanceToStart = item.offsetLeft + curX - startX;
    distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
    tl.to(item, { xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond }, 0)
      .fromTo(item, { xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100) }, { xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false }, distanceToLoop / pixelsPerSecond)
      .add("label" + i, distanceToStart / pixelsPerSecond);
    times[i] = distanceToStart / pixelsPerSecond;
  }

  return tl;
}
```

### レベル別実装例

#### レベル1: 基本的なマーキー

```javascript
gsap.registerPlugin(ScrollTrigger);

window.addEventListener('load', () => {
  horizontalLoop('.marquee-item', {
    repeat: -1,
    paddingRight: 40,
    speed: 0.5,
  });
});
```

#### レベル2: ホバーで一時停止

```javascript
const marquee = document.querySelector('.marquee');
const tl = horizontalLoop('.marquee-item', {
  repeat: -1,
  paddingRight: 40,
  speed: 0.5,
});

marquee.addEventListener('mouseenter', () => tl.pause());
marquee.addEventListener('mouseleave', () => tl.resume());
```

#### レベル3: 逆方向対応

```html
<div class="marquee" data-reversed="true">
  <!-- items -->
</div>
```

```javascript
document.querySelectorAll('.marquee').forEach(marquee => {
  const reversed = marquee.dataset.reversed === 'true';
  const tl = horizontalLoop(marquee.querySelectorAll('.marquee-item'), {
    repeat: -1,
    paddingRight: 40,
    speed: 0.5,
  });

  if (reversed) {
    tl.reverse();
  }
});
```

#### レベル4: ビューポート連動（ScrollTrigger）

```javascript
gsap.registerPlugin(ScrollTrigger);

const tl = horizontalLoop('.marquee-item', {
  repeat: -1,
  paddingRight: 40,
  speed: 0.5,
  paused: true, // 初期状態は停止
});

ScrollTrigger.create({
  trigger: '.marquee',
  start: 'top bottom',
  end: 'bottom top',
  onEnter: () => tl.play(),
  onLeave: () => tl.pause(),
  onEnterBack: () => tl.play(),
  onLeaveBack: () => tl.pause(),
});
```

#### レベル5: ドラッグ対応（Draggable）

```javascript
gsap.registerPlugin(Draggable, InertiaPlugin);

const tl = horizontalLoop('.marquee-item', {
  repeat: -1,
  paddingRight: 40,
  speed: 0.5,
  paused: true,
});

Draggable.create('.marquee', {
  type: 'x',
  inertia: true,
  onDrag: function() {
    tl.timeScale(this.getVelocity('x') / 100);
  },
  onDragEnd: function() {
    tl.timeScale(1).play();
  }
});
```

### レスポンシブ対応

```javascript
let mm = gsap.matchMedia();

mm.add("(min-width: 768px)", () => {
  // デスクトップ: 速度速め
  horizontalLoop('.marquee-item', {
    repeat: -1,
    speed: 0.5,
  });
});

mm.add("(max-width: 767px)", () => {
  // モバイル: 速度遅め
  horizontalLoop('.marquee-item', {
    repeat: -1,
    speed: 1.0,
  });
});
```

### ユースケース

- **ロゴマーキー**: クライアントロゴの無限スクロール
- **ニュースティッカー**: 最新ニュース・お知らせの表示
- **製品カルーセル**: 製品画像の横スクロール
- **パートナーセクション**: 協賛企業・パートナーのロゴ表示
- **レビュー表示**: ユーザーレビューの横スクロール

### アクセシビリティの考慮事項

```javascript
// prefers-reduced-motion への対応
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  horizontalLoop('.marquee-item', {
    repeat: -1,
    speed: 0.5,
  });
} else {
  // アニメーション無効、静止画像として表示
  gsap.set('.marquee-item', { x: 0 });
}
```

### 注意点

- **テキストの可読性**: 移動するテキストは読みづらいため、重要情報には使用しない
- **速度調整**: 速すぎると読めない、遅すぎると退屈
- **パフォーマンス**: 大量の要素（50個以上）は描画負荷が高い
- **モーション配慮**: `prefers-reduced-motion` を必ず尊重

### ブラウザサポート

GSAP 3.x は全モダンブラウザで対応:
- Chrome 50+
- Firefox 50+
- Safari 10+
- Edge 14+

### CDN経由での導入

```html
<!-- GSAP Core -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<!-- ScrollTrigger -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<!-- Draggable -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/Draggable.min.js"></script>
```

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
