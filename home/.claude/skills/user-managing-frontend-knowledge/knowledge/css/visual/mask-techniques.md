---
title: CSS mask プロパティ実践テクニック
category: css/visual
tags: [mask, mask-image, mask-position, mask-composite, animation, steps, svg, visual-effects]
browser_support: 全モダンブラウザ対応（-webkit- プレフィックスが必要な場合あり）
created: 2026-04-13
updated: 2026-04-13
---

# CSS mask プロパティ実践テクニック

> 出典: https://zenn.dev/chot/articles/b85ffe33a12f95
> 執筆日: 不明
> 追加日: 2026-04-13

デザインツールのマスク機能を CSS で再現するための実践パターン集。
`mask-image` / `mask-position` / `mask-composite` / `steps()` を組み合わせることで、
JavaScript なしで複雑なビジュアル表現が可能。

## 関連プロパティ一覧

| プロパティ | 説明 |
|-----------|------|
| `mask-image` | マスク画像を指定（SVG, グラデーション, PNG など） |
| `mask-mode` | 輝度マスク or アルファマスク |
| `mask-repeat` | 繰り返し方法 |
| `mask-position` | 配置位置 |
| `mask-size` | マスク画像のサイズ |
| `mask-composite` | 複数マスクの合成方法（→ 詳細は [mask-composite.md](./mask-composite.md)） |

## パターン 1：形状の反転（くり抜きの逆）

「この形状の外側だけ表示したい」場合、`mask-composite: exclude` で複数マスクを合成する。

```css
.inverse-mask {
  mask-image:
    linear-gradient(#000, #000),   /* ベース：全体 */
    url("shape.svg");               /* くり抜く形状 */
  mask-repeat: no-repeat;
  mask-size: 100% 100%, auto;
  mask-composite: exclude;          /* 重なり部分を除外 → 形状を反転 */
}
```

### SVG のアスペクト比問題

SVG をマスクとして使う際、アスペクト比がずれる場合は `preserveAspectRatio="none"` を設定する。

```svg
<svg viewBox="0 0 100 100" preserveAspectRatio="none" ...>
  ...
</svg>
```

## パターン 2：複雑なセクション境界

グラデーション背景を持つセクションの複雑な境界形状も、
複数の `mask-image` を組み合わせることで実現できる。

```css
.complex-section {
  mask-image:
    url("border-shape-top.svg"),
    linear-gradient(#000, #000),
    url("border-shape-bottom.svg");
  mask-repeat: no-repeat;
  mask-position:
    top center,
    center center,
    bottom center;
  mask-size:
    100% 80px,
    100% calc(100% - 160px),
    100% 80px;
}
```

## パターン 3：フレームアニメーション（`mask-position` + `steps()`）

動画のシーン切り替え演出など、フレームを横に並べた画像を
`mask-position` アニメーションでコマ送りする手法。

### 仕組み

1. フレーム画像をスプライト状に横並びで連結（Figma のオートレイアウトなどで作成）
2. `mask-position` を左から右へアニメーション
3. `steps(N)` でコマ数を指定し、滑らかではなくパラパラ漫画的な切り替えを実現

```css
.frame-transition {
  --size: 100vw;   /* 1フレームの幅 */
  --step: 8;       /* 総フレーム数 */

  mask-image: url("frames-sprite.png");
  mask-size: calc(var(--size) * var(--step)) 100%;
  mask-position: 0 0;

  animation: maskTransition 0.6s steps(8) forwards;
}

@keyframes maskTransition {
  0%   { mask-position: 0 0; }
  100% { mask-position: calc(var(--size) * var(--step) * -1) 0; }
}
```

### 注意点

- 単純な `mask-image` の差し替えはちらつき（FOUC 的な現象）が起きやすい
- `mask-position` のアニメーションの方が安定している
- スプライト画像の作成には After Effects（PNG シーケンス出力）や Figma が使える

## ブラウザサポート

| ブラウザ | サポート状況 |
|---------|-------------|
| Chrome / Edge | ✅ |
| Firefox | ✅ |
| Safari | ✅（`-webkit-mask-*` プレフィックスが必要な場合あり） |

```css
/* クロスブラウザ対応 */
.element {
  -webkit-mask-image: url("mask.svg");
  mask-image: url("mask.svg");
}
```

## ユースケース

- デザインツールの「マスク」をそのまま CSS で再現したい
- セクション境界に複雑な形状（波形、斜め切り、SVG 形状など）を使いたい
- 動画風のシーン切り替えアニメーションを CSS のみで実装したい
- 画像の一部を特定の形にくり抜いて表示したい（逆も然り）

## 関連ナレッジ

- [mask-composite（マスクの合成）](./mask-composite.md)
- [clip-path](./clip-path.md)
- [CSS Filter](./filter.md)

---
