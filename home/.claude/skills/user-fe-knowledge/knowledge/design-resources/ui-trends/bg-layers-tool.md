---
title: bg.layers - CSS background レイヤー可視化・編集ツール
category: design-resources/ui-trends
tags: [tool, css, background, gradient, debug, visualizer]
source: https://coliss.com/articles/build-websites/operation/css/visualize-and-edit-css-background-layers.html
upstream: https://bg-layers.vercel.app/
repository: https://github.com/vii120/css-bg-layers
created: 2026-05-18
---

# bg.layers

複数の `background-image` レイヤー（gradient の重ね合わせ等）を 1 層ずつ分解して表示・編集できる無料 Web ツール。グラデーション芸や複雑な背景デザインのデバッグ・学習に有効。

- 公式: https://bg-layers.vercel.app/
- GitHub: https://github.com/vii120/css-bg-layers

## できること

- 複数レイヤーの `background-image` / `background-color` / `background-position` を分解表示
- 各レイヤーの表示 / 非表示トグル → 個別の効果を確認
- レイヤー並び替えのライブプレビュー
- CSS 変数（例: `--s: 50px`）を直接編集してリアルタイム反映
- 編集後の CSS をエクスポート

## デモパターン

- 7 層の `conic-gradient` による 3D キューブ
- 5 層の `radial-gradient` の合成
- 4 層の `linear-gradient` でのジグザグパターン

## 使いどころ

- CSS Background Pattern 系の写経・カスタマイズ
- 業務で謎の `background: ...` 多層指定をリバースエンジニアリング
- 学習用に「どのレイヤーがどの見た目に効いているか」を切り分け

## 関連

- [[background-image-animation]]: 多層 background のアニメーション
- [[aether-css-generator]]: Liquid Glass 等エフェクトのジェネレーター

## 参考

- [Coliss 紹介記事（2026-03-31）](https://coliss.com/articles/build-websites/operation/css/visualize-and-edit-css-background-layers.html)
