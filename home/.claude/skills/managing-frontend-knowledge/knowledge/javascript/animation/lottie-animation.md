---
title: Lottieアニメーション
category: javascript/animation
tags: [lottie, svg, animation, after-effects, figma, airbnb]
browser_support: 全モダンブラウザ対応
created: 2026-02-01
updated: 2026-02-01
---

# Lottieアニメーション

> 出典: https://ics.media/entry/230928/ (After Effects編), https://ics.media/entry/230913/ (Figma編)
> 執筆日: 2023-09-28, 2023-09-13
> 追加日: 2026-02-01

Airbnbが開発したベクターアニメーションフォーマット。After EffectsやFigmaで作成したアニメーションをWeb/モバイルで再生できます。

## 概要

**Lottie** は「ベクター画像をアニメーションさせることができる技術・ファイルフォーマット」です。

**主な特徴**:
- ベクターベースで軽量（PNGシーケンスやGIFと比べて大幅に軽い）
- 解像度に依存しない（Retina対応が容易）
- WebGL不要で全ブラウザ動作
- JSON形式で可読性が高い

## ファイルフォーマット

### .json形式（従来）

テキストベースのJSON形式。

**特徴**:
- 可読性が高い
- gzip圧縮で軽量化
- ブラウザで直接読み込み可能

### .lottie形式（DotLottie）

バイナリ形式の新フォーマット。

**特徴**:
- より高い圧縮率
- 複数アニメーションを1ファイルに格納可能
- 画像アセットの埋め込み

## 作成方法

### 1. After Effects編

**ワークフロー**:
1. Adobe Illustratorでベクターイラスト作成
2. After Effectsにインポート
3. アニメーションを追加
4. Bodymovinプラグインでエクスポート

**重要なポイント**:

```
⚠️ レイヤー名は英語にしておくことをオススメ
```

日本語のレイヤー名・プロパティ名は表示に問題が出る場合があります。

**対応プロパティの確認**:

After Effectsの全機能がLottieで使えるわけではありません。公式のサポート表を確認してから作業を開始してください。

- [Lottie対応機能一覧](https://airbnb.io/lottie/#/supported-features)

**よくある問題**:

| 問題 | 原因 | 対処法 |
|------|------|--------|
| グラデーションが消える | Illustratorからのインポート時 | After Effects内でグラデーントを再適用 |
| アニメーションが動かない | 非対応機能を使用 | 対応機能のみ使用する |
| 日本語が文字化け | レイヤー名が日本語 | 英語のレイヤー名に変更 |

**エクスポート方法（Bodymovin）**:

1. After Effectsでコンポジションを選択
2. ウィンドウ > エクステンション > Bodymovin
3. 出力先を選択してエクスポート
4. 生成されたJSONファイルとHTMLデモファイルを確認

### 2. Figma編

**ワークフロー**:
1. Figmaでベクターデザイン作成
2. プロトタイプ機能で「Smart Animate」を設定
3. LottieFilesプラグインでエクスポート

**Smart Animateの設定**:

Figmaのプロトタイプ機能を使用して、フレーム間のアニメーションを自動生成します。

```
フレーム1（開始状態）
  → インタラクション: After Delay (0ms)
  → アニメーション: Smart Animate
  → フレーム2（終了状態）
```

**ループアニメーションの作成**:

最終フレームから最初のフレームに戻る接続を追加します。

```
フレーム2（終了）
  → After Delay (0ms)
  → Smart Animate
  → フレーム1（開始）
```

**エクスポート（LottieFilesプラグイン）**:

1. FigmaでLottieFilesプラグインをインストール
2. アニメーションするフレームを選択
3. プラグインから「Export to Lottie」を実行
4. LottieFilesアカウントにアップロード（無料プランあり）
5. JSONまたはdotLottieファイルをダウンロード

**注意点**:
- 非公開アップロードでもブラウザとモバイルでプレビュー可能
- 無料プランは制限あり（ファイル数、機能など）

## Web実装

### 基本的な実装

```html
<!-- lottie-playerを使用 -->
<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>

<lottie-player
  src="animation.json"
  background="transparent"
  speed="1"
  style="width: 300px; height: 300px;"
  loop
  autoplay
></lottie-player>
```

### JavaScriptでの制御

```javascript
import lottie from 'lottie-web';

const animation = lottie.loadAnimation({
  container: document.getElementById('lottie-container'),
  renderer: 'svg', // 'canvas' または 'html' も可能
  loop: true,
  autoplay: true,
  path: 'animation.json' // JSONファイルのパス
});

// 再生制御
animation.play();
animation.pause();
animation.stop();

// 速度変更
animation.setSpeed(0.5); // 0.5倍速

// 特定フレームに移動
animation.goToAndStop(30, true);
```

## ユースケース

**適している場面**:
- ローディングアニメーション
- アイコンのマイクロインタラクション
- 説明図のアニメーション
- オンボーディング画面
- 成功/エラー通知

**避けるべき場面**:
- 非常に複雑なアニメーション（パフォーマンス低下）
- 大量の画像アセットを含む（ファイルサイズ増大）
- リアルタイムなインタラクション（CSS/JSの方が柔軟）

## パフォーマンス

### レンダラーの選択

| レンダラー | メリット | デメリット |
|-----------|---------|----------|
| `svg` | 高品質、スケーラブル | 複雑なアニメーションで重い |
| `canvas` | 高速、多数の要素に強い | 解像度依存 |
| `html` | DOMベースで柔軟 | パフォーマンス低い |

**推奨**:
- シンプルなアニメーション → `svg`
- 複雑・多数の要素 → `canvas`

### 最適化のコツ

1. **レイヤー数を最小限に**: After Effectsで不要なレイヤーを削除
2. **プリコンポーズ**: 複雑なアニメーションをネスト化
3. **ファイルサイズ確認**: 大きすぎる場合はアニメーション簡略化
4. **遅延読み込み**: 画面に表示されるまで読み込まない

```javascript
// Intersection Observerで遅延読み込み
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const animation = lottie.loadAnimation({
        container: entry.target,
        path: entry.target.dataset.src
      });
      observer.unobserve(entry.target);
    }
  });
});

document.querySelectorAll('.lottie-lazy').forEach((el) => {
  observer.observe(el);
});
```

## ブラウザサポート

- Chrome/Edge: 全バージョン対応
- Firefox: 全バージョン対応
- Safari: 全バージョン対応
- モバイルブラウザ: iOS Safari、Android Chrome対応

**古いブラウザ対応**:
- IE11: 一部制限あり（Polyfill推奨）

## ツール・リソース

### 公式ツール
- [LottieFiles](https://lottiefiles.com/): アニメーション共有・管理プラットフォーム
- [Bodymovin](https://aescripts.com/bodymovin/): After Effects用エクスポートプラグイン
- [lottie-web](https://github.com/airbnb/lottie-web): Web用公式ライブラリ

### コミュニティリソース
- [LottieFiles Marketplace](https://lottiefiles.com/featured): 無料・有料アニメーション
- [Lottie Documentation](https://airbnb.io/lottie/): 公式ドキュメント

## 関連ナレッジ

- [requestAnimationFrame](./animation.md)
- [SVGアニメーション](../../css/animation/svg-animation.md)
- [パフォーマンス最適化](../../cross-cutting/performance/performance-optimization.md)
- [遅延読み込み](../../cross-cutting/performance/lazy-loading.md)
