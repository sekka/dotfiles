---
title: CSS linear() でスプリングアニメーション - UI 活用 13 選
category: css/animation
tags: [animation, easing, linear, spring, transition, bouncy]
browser_support: Chrome 113+, Firefox 112+, Safari 17.2+
source: https://ics.media/entry/260402/
created: 2026-05-18
author: 池田泰延（ICS）
---

# CSS `linear()` でスプリングアニメーション

CSS の easing 関数 `linear()` に複数の制御点を渡すことで、`cubic-bezier()` では表現困難だったバネ的なバウンス（オーバーシュート → 収束）を再現できる。

## 基本コード

```css
:root {
  /* 制御点を並べることでスプリング曲線を近似 */
  --ease-spring: linear(0, 0.18, 0.42, 0.72, 0.95, 1.06, 1.04, 1.01, 0.99, 1);
}

.button {
  transition: all 1s var(--ease-spring);
}
```

## スプリングパラメータ

物理ベースで考えると 4 パラメータで調整できる：

| パラメータ | 効果 |
|---|---|
| `mass` | 大きいほど重く、ゆっくり動く |
| `stiffness` | 大きいほど速く収束 |
| `damping` | 大きいほどオーバーシュートを抑制 |
| `velocity` | 初速。大きいほど最初の動きが顕著 |

Anime.js の [Easing Functions Editor](https://animejs.com/easing-editor/spring/default) で可視化しつつ `linear()` 形式に書き出せる。

## ユースケース 13 選

**汎用 UI**
- セグメントボタンの背景移動
- トグルスイッチのノブ移動

**出現・退場 UI**
- トースト通知
- モーダルダイアログ
- ポップオーバー
- フローティングアクションボタン
- アコーディオン
- サイドメニュー
- アクションシート
- 退場モーション

**形状変化 UI**
- 検索フォームのモーフィング
- 送信ボタンの状態変化
- スクロール連動テキストアニメ

## ベストプラクティス

- CSS 変数（`--ease-spring`）として宣言し、プロダクト全体で一貫性を持たせる
- 「新鮮さ」ではなく、操作フィードバック強化を目的に使う
- 強いバウンスは UX を阻害しがちなので、収束時間 1s 前後 + 軽めのオーバーシュートが無難
- アクセシビリティ: `prefers-reduced-motion: reduce` で控えめなイージングへ切り替える

```css
@media (prefers-reduced-motion: reduce) {
  :root { --ease-spring: linear(0, 1); }
}
```

## 関連デザイントレンド

- Apple Fluid Interfaces（2018）
- Material Design 3 Motion Physics System
- Figma などのデザインツールもスプリング設定を採用

## 関連知識

- [[animation-basics]] / [[scroll-driven-animations]]
- [[motion-microinteractions]]: Motion (React) のスプリング
- [[css-2025-interactions]]

## 参考

- [ICS MEDIA: CSS の linear() でスプリングアニメーション活用術 13 選（池田泰延, 2024-04-02）](https://ics.media/entry/260402/)
