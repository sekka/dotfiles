---
title: HTMLでLottieアニメーションを配置する方法
category: javascript/animation
tags: [Lottie, アニメーション, lottie-player, dotlottie-player, Lottie Interactivity, JSON, Web Components]
browser_support: モダンブラウザ全対応（Web Components サポート必須）
created: 2026-02-01
updated: 2026-02-01
---

# HTMLでLottieアニメーションを配置する方法

## 概要

> 出典: https://ics.media/entry/240403/
> 執筆日: 2024-04-03
> 追加日: 2026-02-01

Lottieアニメーションをウェブページに配置する方法。Web Player（lottie-player, dotlottie-player）を使った簡単な実装から、インタラクティブなアニメーション制御まで。

**Lottieとは:**
- Adobe After Effectsで作成したアニメーションをJSON形式で書き出し
- ウェブ、iOS、Androidで再生可能
- ベクターベースで軽量・スケーラブル

---

## 実装方法の選択

| 方法 | 用途 | 難易度 |
|------|------|--------|
| **lottie-player** | HTML中心、簡単な制御 | ★☆☆ |
| **dotlottie-player** | .lottie形式対応 | ★☆☆ |
| **lottie-web** | JavaScript中心、詳細制御 | ★★★ |

---

## 方法1: lottie-player（推奨: 簡単な実装）

### 基本的な配置

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Lottie Animation</title>
  <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
</head>
<body>
  <lottie-player
    src="./assets/present-anim.json"
    background="transparent"
    speed="1"
    style="width: 300px; height: 300px;"
    loop
    autoplay
  ></lottie-player>
</body>
</html>
```

**属性:**
- `src`: JSONファイルのパス（必須）
- `autoplay`: 自動再生
- `loop`: ループ再生
- `speed`: 再生速度（1 = 通常、0.5 = 半速、2 = 倍速）
- `background`: 背景色（`transparent` で透過）

---

### 再生速度の調整

```html
<lottie-player
  src="./assets/anim.json"
  speed="0.5"
  autoplay
  loop
></lottie-player>
```

**速度の指定:**
- `0.5`: ゆっくり再生（スローモーション）
- `1`: 通常速度
- `2`: 倍速再生

---

### レスポンシブ対応

```html
<lottie-player
  src="./assets/anim.json"
  style="width: 100%; max-width: 500px; height: auto;"
  autoplay
  loop
></lottie-player>
```

```css
lottie-player {
  width: clamp(200px, 50vw, 500px);
  height: auto;
}
```

---

## 方法2: dotlottie-player（.lottie形式対応）

### 基本的な配置

```html
<script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs" type="module"></script>

<dotlottie-player
  src="./assets/animation.lottie"
  autoplay
  loop
  style="width: 320px; height: 320px;"
></dotlottie-player>
```

**.lottie形式のメリット:**
- 複数のアニメーションを1つのファイルに統合可能
- ファイルサイズの圧縮（.jsonより小さい）
- メタデータやテーマ情報を含められる

**注意（2024年6月時点）:**
- `@lottiefiles/dotlottie-player` は非推奨
- `@dotlottie/player-component`（dotlottie-wc）を使用すること

---

## Lottie Interactivity（インタラクティブ制御）

### インストール

```html
<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
<script src="https://unpkg.com/@lottiefiles/lottie-interactivity@latest/dist/lottie-interactivity.min.js"></script>
```

---

### モード1: cursor（マウス位置に応じた再生）

```html
<lottie-player
  id="cursorAnimation"
  src="./assets/anim.json"
  style="width: 400px; height: 400px;"
></lottie-player>

<script>
  LottieInteractivity.create({
    player: '#cursorAnimation',
    mode: 'cursor',
    actions: [
      {
        position: { x: [0, 1], y: [0, 1] },
        type: 'seek',
        frames: [0, 100]
      }
    ]
  });
</script>
```

**動作:**
- マウスのX座標/Y座標に応じてアニメーションのフレームが変化
- ホバー時のインタラクティブ演出に最適

---

### モード2: scroll（スクロール連動）

```html
<lottie-player
  id="scrollAnimation"
  src="./assets/anim.json"
  style="width: 100%; height: 500px;"
></lottie-player>

<script>
  LottieInteractivity.create({
    player: '#scrollAnimation',
    mode: 'scroll',
    actions: [
      {
        visibility: [0, 1],
        type: 'seek',
        frames: [0, 150]
      }
    ]
  });
</script>
```

**動作:**
- ページスクロールに応じてアニメーションが進行
- 画面に入ったら開始、離れたら停止

**visibility の範囲:**
- `[0, 1]`: 要素が画面に入った瞬間（0）から完全に通過（1）まで
- `[0.2, 0.8]`: 画面の20%〜80%の範囲で再生

---

### モード3: chain（連続セグメント再生）

```html
<lottie-player
  id="chainAnimation"
  src="./assets/anim.json"
  style="width: 400px; height: 400px;"
></lottie-player>

<script>
  LottieInteractivity.create({
    player: '#chainAnimation',
    mode: 'chain',
    actions: [
      {
        state: 'autoplay',
        transition: 'onComplete',
        frames: [0, 50]
      },
      {
        state: 'autoplay',
        transition: 'onComplete',
        frames: [51, 100]
      },
      {
        state: 'autoplay',
        frames: [101, 150]
      }
    ]
  });
</script>
```

**動作:**
- セグメントごとにアニメーションを再生
- 前のセグメント完了後に次のセグメントを再生（`onComplete`）
- ストーリー性のあるアニメーションに最適

---

## JavaScript での詳細制御（lottie-web）

### インストール

```bash
npm install lottie-web
```

### 基本的な使い方

```html
<div id="lottie-container" style="width: 400px; height: 400px;"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
<script>
  const animation = lottie.loadAnimation({
    container: document.getElementById('lottie-container'),
    renderer: 'svg', // 'svg', 'canvas', 'html' から選択
    loop: true,
    autoplay: true,
    path: './assets/anim.json'
  });
</script>
```

**renderer の選択:**
- `svg`: 高品質、スケーラブル（推奨）
- `canvas`: 複雑なアニメーションで高パフォーマンス
- `html`: レガシー、あまり使われない

---

### 再生制御

```javascript
const animation = lottie.loadAnimation({
  container: document.getElementById('lottie-container'),
  path: './assets/anim.json',
  autoplay: false
});

// 再生
animation.play();

// 一時停止
animation.pause();

// 停止（最初のフレームに戻る）
animation.stop();

// 特定フレームに移動
animation.goToAndStop(50, true); // フレーム50で停止
animation.goToAndPlay(30, true); // フレーム30から再生

// 速度変更
animation.setSpeed(0.5); // 半速
animation.setSpeed(2);   // 倍速

// 方向変更
animation.setDirection(1);  // 順方向
animation.setDirection(-1); // 逆方向
```

---

### イベントリスナー

```javascript
const animation = lottie.loadAnimation({
  container: document.getElementById('lottie-container'),
  path: './assets/anim.json'
});

// アニメーション完了時
animation.addEventListener('complete', () => {
  console.log('アニメーション完了');
});

// ループ完了時
animation.addEventListener('loopComplete', () => {
  console.log('1ループ完了');
});

// データ読み込み完了時
animation.addEventListener('data_ready', () => {
  console.log('データ読み込み完了');
});

// DOM読み込み完了時
animation.addEventListener('DOMLoaded', () => {
  console.log('DOM読み込み完了');
});
```

---

### ユーザー操作による制御

```javascript
const animation = lottie.loadAnimation({
  container: document.getElementById('lottie-container'),
  path: './assets/anim.json',
  autoplay: false,
  loop: false
});

// ボタンで再生
document.getElementById('playBtn').addEventListener('click', () => {
  animation.play();
});

// ホバーで再生、離れたら停止
const container = document.getElementById('lottie-container');

container.addEventListener('mouseenter', () => {
  animation.play();
});

container.addEventListener('mouseleave', () => {
  animation.pause();
});
```

---

## ユースケース

### ローディングアニメーション

```html
<lottie-player
  id="loading"
  src="./assets/loading.json"
  background="transparent"
  speed="1"
  style="width: 100px; height: 100px;"
  loop
  autoplay
></lottie-player>
```

```javascript
// データ取得中に表示
document.getElementById('loading').style.display = 'block';

fetch('/api/data')
  .then(response => response.json())
  .then(data => {
    // ローディング非表示
    document.getElementById('loading').style.display = 'none';
  });
```

---

### ヒーローセクションのアニメーション

```html
<section class="hero">
  <lottie-player
    src="./assets/hero-anim.json"
    background="transparent"
    speed="1"
    style="width: 100%; max-width: 800px; height: auto;"
    autoplay
  ></lottie-player>
  <h1>Welcome to Our Site</h1>
</section>
```

---

### スクロール連動アニメーション

```html
<div style="height: 150vh;">
  <lottie-player
    id="scrollAnim"
    src="./assets/scroll-anim.json"
    style="width: 100%; height: 100vh; position: sticky; top: 0;"
  ></lottie-player>
</div>

<script>
  LottieInteractivity.create({
    player: '#scrollAnim',
    mode: 'scroll',
    actions: [
      {
        visibility: [0, 1],
        type: 'seek',
        frames: [0, 300]
      }
    ]
  });
</script>
```

---

### ボタンホバーエフェクト

```html
<button id="animBtn" style="position: relative; padding: 1rem 2rem;">
  <lottie-player
    id="btnAnim"
    src="./assets/hover-anim.json"
    style="width: 50px; height: 50px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;"
  ></lottie-player>
  <span>Click Me</span>
</button>

<script>
  const btnAnim = document.getElementById('btnAnim');
  const animation = btnAnim.getLottie();

  document.getElementById('animBtn').addEventListener('mouseenter', () => {
    animation.play();
  });

  document.getElementById('animBtn').addEventListener('mouseleave', () => {
    animation.stop();
  });
</script>
```

---

## パフォーマンス最適化

### ファイルサイズの削減

1. **不要なレイヤーを削除**
   - After Effectsで非表示レイヤーを削除

2. **.lottie形式を使用**
   - JSONより圧縮率が高い

3. **BodyMovin設定でエクスポート最適化**
   - 不要なメタデータを除外
   - 小数点精度を調整

---

### 遅延読み込み

```html
<lottie-player
  id="lazyAnim"
  data-src="./assets/anim.json"
  style="width: 400px; height: 400px;"
></lottie-player>

<script>
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const player = entry.target;
        player.setAttribute('src', player.dataset.src);
        observer.unobserve(player);
      }
    });
  });

  observer.observe(document.getElementById('lazyAnim'));
</script>
```

関連: `javascript/web-apis/intersection-observer.md`

---

### レンダラーの選択

複雑なアニメーションでは `canvas` レンダラーを使用：

```javascript
const animation = lottie.loadAnimation({
  container: document.getElementById('lottie-container'),
  renderer: 'canvas', // SVGより高速（複雑なアニメーション向け）
  path: './assets/complex-anim.json'
});
```

---

## 注意点

### アクセシビリティ

アニメーションは装飾であり、重要な情報は代替テキストで提供：

```html
<div role="img" aria-label="プレゼントボックスが開くアニメーション">
  <lottie-player
    src="./assets/present-anim.json"
    autoplay
    loop
  ></lottie-player>
</div>
```

### モーション軽減対応

```css
@media (prefers-reduced-motion: reduce) {
  lottie-player {
    display: none;
  }
}
```

```javascript
// JavaScriptでの対応
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // アニメーションを無効化
  animation.setSpeed(0);
  animation.goToAndStop(0, true);
}
```

関連: `cross-cutting/accessibility/motion-accessibility.md`

---

### ファイルパスの注意

```html
<!-- 相対パス -->
<lottie-player src="./assets/anim.json"></lottie-player>

<!-- 絶対パス -->
<lottie-player src="/assets/anim.json"></lottie-player>

<!-- CDN -->
<lottie-player src="https://cdn.example.com/anim.json"></lottie-player>
```

**CORS エラーに注意:**
外部ドメインからJSONを読み込む場合は、サーバー側でCORS設定が必要。

---

## ブラウザサポート

| 機能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| lottie-player | ✓ | ✓ | ✓ | ✓ |
| dotlottie-player | ✓ | ✓ | ✓ | ✓ |
| lottie-web | ✓ | ✓ | ✓ | ✓ |
| Lottie Interactivity | ✓ | ✓ | ✓ | ✓ |

**Web Components サポート:**
- Chrome 54+
- Firefox 63+
- Safari 10.1+
- Edge 79+

---

## 関連リソース

- [LottieFiles公式サイト](https://lottiefiles.com/)
- [lottie-player GitHub](https://github.com/LottieFiles/lottie-player)
- [dotlottie-player GitHub](https://github.com/dotlottie/player-component)
- [lottie-web GitHub](https://github.com/airbnb/lottie-web)
- [Lottie Interactivity GitHub](https://github.com/LottieFiles/lottie-interactivity)
- [After Effects Bodymovin プラグイン](https://exchange.adobe.com/creativecloud.details.12557.html)

---

## 関連ナレッジ

- `javascript/animation/animation.md` - JavaScriptアニメーション基礎
- `javascript/web-apis/intersection-observer.md` - 遅延読み込み
- `cross-cutting/accessibility/motion-accessibility.md` - モーション軽減対応
- `cross-cutting/performance/lazy-loading.md` - パフォーマンス最適化
