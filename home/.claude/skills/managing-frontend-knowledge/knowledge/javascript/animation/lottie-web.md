---
title: "lottie-web でアニメーション配置とパフォーマンス最適化"
category: javascript/animation
tags: [javascript, lottie, animation, svg, canvas, performance, after-effects]
browser_support: "Chrome 126+, Safari (M1 MacBook Pro で検証済み)"
created: 2026-02-01
updated: 2026-02-01
---

# lottie-web でアニメーション配置とパフォーマンス最適化

## 概要

Lottie は Adobe After Effects で作成したアニメーションを JSON 形式で書き出し、Web やモバイルアプリで再生するライブラリ。lottie-web を使用して JavaScript でアニメーションを配置し、パフォーマンスを最適化する方法を解説。

> 出典: [JSでLottieを配置する方法 - パフォーマンスの最適化方法も紹介！ - ICS MEDIA](https://ics.media/entry/240625/)
> 執筆日: 2024-06-25
> 追加日: 2026-02-01

**なぜ Lottie？**
- After Effects で作成したリッチなアニメーションをそのまま Web で再生
- デザイナーとエンジニアの協業が効率化
- ベクター形式で解像度に依存しない

## インストール

```bash
npm install lottie-web
```

## 基本的な使い方

### Step 1: HTML で配置用の要素を準備

```html
<div id="lottie-container"></div>
```

### Step 2: JavaScript で lottie-web を読み込み

```javascript
import lottie from 'lottie-web';

const container = document.getElementById('lottie-container');

const anim = lottie.loadAnimation({
  container: container,
  path: './assets/animation.json', // JSONファイルのパス
  renderer: 'svg', // 'svg', 'canvas', 'html' のいずれか
  loop: true,
  autoplay: true
});
```

**パラメータ:**
- `container`: アニメーションを配置する DOM 要素
- `path`: Lottie JSON ファイルのパス
- `renderer`: レンダリング方式（`svg`, `canvas`, `html`）
- `loop`: ループ再生の有無
- `autoplay`: 自動再生の有無

### Step 3: アニメーションの操作

```javascript
// 再生
anim.play();

// 一時停止
anim.pause();

// 停止
anim.stop();

// 特定フレームへ移動
anim.goToAndStop(30, true); // 30フレーム目で停止

// 速度変更（1.0がデフォルト）
anim.setSpeed(1.5); // 1.5倍速

// 方向変更（1: 正方向, -1: 逆方向）
anim.setDirection(-1);

// 破棄（メモリ解放）
anim.destroy();
```

### Step 4: イベントリスナーの追加

```javascript
// アニメーション完了時
anim.addEventListener('complete', () => {
  console.log('アニメーション完了');
});

// ループ完了時
anim.addEventListener('loopComplete', () => {
  console.log('1ループ完了');
});

// データ読み込み完了時
anim.addEventListener('DOMLoaded', () => {
  console.log('DOM読み込み完了');
});

// エラー発生時
anim.addEventListener('error', () => {
  console.error('エラー発生');
});
```

## パフォーマンス最適化

### 1. 画面外のアニメーションを停止

画面外で再生中のアニメーションは CPU/GPU リソースを消費し続ける。

**Intersection Observer を使用:**

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      anim.play(); // 画面内に入ったら再生
    } else {
      anim.pause(); // 画面外に出たら停止
    }
  });
}, { threshold: 0.1 });

observer.observe(container);
```

**完全にメモリ解放:**

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      anim.destroy(); // DOM からも削除
    }
  });
});

observer.observe(container);
```

### 2. 複雑な JSON データの最適化

**マスクされた不要パスを削除:**

After Effects でマスクによって隠されているパスは、JSON に含まれていても表示されない。これらを手動で削除することで、ファイルサイズと処理負荷を削減。

**JSON 編集例:**

```json
{
  "layers": [
    {
      "ty": 4,
      "shapes": [
        // 不要なパスを削除
      ]
    }
  ]
}
```

**背景要素の追加:**

アニメーションに背景がない場合、JSON に背景レイヤーを追加することで、ブラウザのレンダリング最適化が効きやすくなる。

### 3. レンダラーの選択: SVG vs Canvas

**検証結果（ICS MEDIA 記事より）:**

| レンダラー | GPU メモリ | CPU 使用率 |
|-----------|-----------|-----------|
| **SVG** | 176-572 MB | 48-80% |
| **Canvas** | 1.3 MB | 39-60% |

**結論:**
- **Canvas レンダラー**は GPU メモリを大幅に削減
- CPU 使用率も若干低下
- 複雑なアニメーションでは Canvas を推奨

**Canvas レンダラーの使用:**

```javascript
const anim = lottie.loadAnimation({
  container: container,
  path: './assets/animation.json',
  renderer: 'canvas', // SVG から Canvas に変更
  loop: true,
  autoplay: true
});
```

### 4. アニメーションの複雑さを減らす

After Effects での作成時に以下を意識:

- レイヤー数を減らす
- パスの頂点数を減らす
- エフェクトを最小限に
- マスクの使用を控える

## 実装例: スクロール連動アニメーション

```javascript
import lottie from 'lottie-web';

const container = document.getElementById('lottie-container');

const anim = lottie.loadAnimation({
  container: container,
  path: './assets/scroll-animation.json',
  renderer: 'canvas',
  loop: false,
  autoplay: false
});

// 総フレーム数を取得
const totalFrames = anim.totalFrames;

// スクロール位置に応じてフレームを更新
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = scrollTop / docHeight;

  const frame = Math.floor(scrollPercent * totalFrames);
  anim.goToAndStop(frame, true);
});
```

## 実装例: ホバーで再生

```javascript
const anim = lottie.loadAnimation({
  container: container,
  path: './assets/hover-animation.json',
  renderer: 'svg',
  loop: false,
  autoplay: false
});

container.addEventListener('mouseenter', () => {
  anim.play();
});

container.addEventListener('mouseleave', () => {
  anim.stop();
});
```

## 実装例: クリックで逆再生

```javascript
let isPlaying = false;

const anim = lottie.loadAnimation({
  container: container,
  path: './assets/toggle-animation.json',
  renderer: 'svg',
  loop: false,
  autoplay: false
});

container.addEventListener('click', () => {
  if (isPlaying) {
    anim.setDirection(-1); // 逆再生
    anim.play();
  } else {
    anim.setDirection(1); // 正方向
    anim.play();
  }
  isPlaying = !isPlaying;
});
```

## ユースケース

- **ローディングアニメーション:** スピナー、プログレスバー
- **アイコンアニメーション:** ホバー、クリック時の演出
- **スクロール演出:** パララックス、ストーリーテリング
- **インタラクティブUI:** ボタン、トグル、スライダー
- **イラスト演出:** キャラクターアニメーション

## 注意点

### ファイルサイズ

- 複雑なアニメーションは JSON ファイルが肥大化
- gzip 圧縮を有効化
- 不要なレイヤーやパスを削除

### ブラウザサポート

- SVG レンダラー: 全モダンブラウザ
- Canvas レンダラー: 全モダンブラウザ
- HTML レンダラー: 限定的（非推奨）

### パフォーマンス

- モバイルデバイスでは処理が重い場合がある
- 複数のアニメーションを同時再生すると負荷が高まる
- 画面外では必ず停止または破棄

### After Effects との互換性

- 全ての After Effects 機能が対応しているわけではない
- Bodymovin プラグインの対応機能を確認
- プレビューして検証が必須

## 代替ライブラリ

| ライブラリ | 特徴 | ファイルサイズ |
|-----------|------|--------------|
| **lottie-web** | フル機能、SVG/Canvas | 約 140KB (gzip) |
| **lottie-light** | 軽量版、機能制限あり | 約 50KB (gzip) |
| **@lottiefiles/lottie-player** | Web Components 版 | 約 60KB (gzip) |

## 関連技術

- **Adobe After Effects:** アニメーション作成ツール
- **Bodymovin:** After Effects から JSON 書き出しプラグイン
- **Intersection Observer API:** 画面内判定
- **Canvas API:** Canvas レンダリング
- **SVG:** ベクター形式

## 参考リンク

- [lottie-web GitHub](https://github.com/airbnb/lottie-web)
- [LottieFiles](https://lottiefiles.com/) (無料アニメーション素材)
- [Bodymovin プラグイン](https://aescripts.com/bodymovin/)
- [Intersection Observer API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Canvas API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
