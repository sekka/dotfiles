---
title: Aether CSS - Liquid Glass / Glassmorphism / Neumorphism ジェネレーター
category: design-resources/ui-trends
tags: [tool, generator, glassmorphism, liquid-glass, neumorphism, css]
source: https://coliss.com/articles/build-websites/operation/css/liquid-glass-css-generator.html
upstream: https://aethercss.lovable.app/
created: 2026-05-18
---

# Aether CSS

CSS で Liquid Glass / Glassmorphism / Neumorphism の各エフェクトを生成できるブラウザ上のコードジェネレーター。プリセット選択 → ライブプレビュー → HTML/CSS コードのコピーで完結する。

- 公式: https://aethercss.lovable.app/
- 無料、ログイン不要

## 提供カテゴリ

| カテゴリ | プリセット数 | 概要 |
|---|---|---|
| Liquid Glass | 12 | iOS 26 系の流動的なガラスエフェクト（Liquid Crystal, Fluid Amber, Ice Ripple, Mercury Drop 等） |
| Glassmorphism | 12 | 半透明＋ぼかしの古典的ガラス効果 |
| Neumorphism | 8 | 凹凸シャドウによる柔らかい立体感 |

## 機能

- プリセット切替で即プレビュー
- 背景画像のシャッフル / アップロード
- テキスト表示・非表示の切替
- 「Advanced」モードでガラス表面 / ノイズ / シャドウなどを細かく調整
- 「Code」タブで HTML + CSS を一括取得

## 使いどころ

- プロトタイプ初期のエフェクト探索
- DESIGN.md に登録するエフェクト候補の評価
- 既存 [[liquid-glass]] トレンドの実装サンプル取得

## 注意

- 生成 CSS は `backdrop-filter` / 多層シャドウ前提のため、パフォーマンスを実機で確認する（[[backdrop-filter-performance]] 参照）
- Glassmorphism は背景コントラストに依存するため、アクセシビリティ（文字可読性）を別途検証

## 関連

- [[liquid-glass]]: Apple Liquid Glass デザイントレンドの解説
- [[glassmorphism-tips]] / [[backdrop-filter]] 系のナレッジ

## 参考

- [Coliss 記事（2026-02-24）](https://coliss.com/articles/build-websites/operation/css/liquid-glass-css-generator.html)
