---
title: CSS-onlyで実装する弾けるホバーエフェクト（弓の弦）
category: css/animation
tags: [animation, hover, elastic, shape, sibling-index, sibling-count, linear, @property, 2025]
browser_support: Chrome/Edge 最新版のみ（2025年時点）
created: 2026-04-13
updated: 2026-04-13
---

# CSS-onlyで実装する弾けるホバーエフェクト（弓の弦）

> 出典: https://coliss.com/articles/build-websites/operation/css/css-only-elastic-hover-effect.html
> 執筆日: 2025年
> 追加日: 2026-04-13

カーソルの方向を認識し、弓の弦のように文字が弾けるホバーエフェクト。JavaScriptなしでCSSのみで実装。`shape()`・`sibling-index()`・`sibling-count()`・`linear()` を組み合わせた最先端実装。

## 使用するモダンCSS機能

| 機能 | 役割 |
|------|------|
| `sibling-index()` | 各文字のインデックスを取得 |
| `sibling-count()` | 兄弟要素の総数を取得（中央計算用） |
| `shape()` | 文字の変形パスを定義 |
| `linear()` | 弾性物理を再現するイージング |
| `@property` | アニメーション可能な数値型カスタムプロパティ |

## HTML構造

各文字を `<span>` でラップする（`sibling-index()` で個別制御するため）。

```html
<a href="#" class="elastic-text">
  <span>H</span>
  <span>e</span>
  <span>l</span>
  <span>l</span>
  <span>o</span>
</a>
```

## CSSの基本パターン

```css
/* アニメーション可能なカスタムプロパティを定義 */
@property --elastic {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}

.elastic-text span {
  display: inline-block;

  /* 中央からの距離を計算（弾き幅の決定に使用） */
  --distance: calc(
    abs(sibling-index() - (sibling-count() / 2))
  );

  /* エラスティック効果の制御変数 */
  --h: 1;    /* 弾きの強さ */
  --g: 0.5;  /* 文字間隔 */

  transition: --elastic 0.8s linear(
    /* 弾性物理を再現するlinear()イージング */
    0, 0.6, 1, 1.1, 0.95, 1.02, 1, 0.99, 1
  );
}

.elastic-text:hover span {
  --elastic: 1;
  transform: translateY(
    calc(var(--elastic) * var(--h) * var(--distance) * -10px)
  );
}
```

## パラメータ調整

```css
.elastic-text span {
  --h: 2;    /* 大きく弾く */
  --g: 0.3;  /* 文字間隔を狭める */
}
```

| 変数 | 効果 | 推奨値 |
|------|------|--------|
| `--h` | 弾きの強さ（高いほど大きく動く） | 0.5 〜 3 |
| `--g` | 文字間隔の係数 | 0.2 〜 1 |

## カーソル方向の認識

`sibling-index()` を使って、ホバー開始位置（左右の端）から中央に向かってウェーブが伝播する動きを実現。

```css
.elastic-text span {
  --index: sibling-index();
  --total: sibling-count();
  --center: calc(var(--total) / 2);

  /* 左側: 正方向に動く、右側: 負方向に動く */
  --direction: calc(
    sign(var(--index) - var(--center))
  );
}
```

## ブラウザ対応

- Chrome/Edge: 最新版のみ（`shape()` は実験的）
- Firefox: 未対応（2025年時点）
- Safari: 未対応（2025年時点）

**実用上の注意**: プログレッシブエンハンスメントとして実装し、非対応ブラウザでは通常のホバーにフォールバックさせる。

```css
@supports (sibling-index()) {
  .elastic-text span {
    /* 弾けるアニメーション */
  }
}
```

## ユースケース

- ナビゲーションメニューのホバーエフェクト
- ヒーローセクションのタイトル演出
- クリエイティブなCTA（Call to Action）ボタン
- ポートフォリオサイトのインタラクション

## 関連ナレッジ

- [sibling-index / sibling-count](./sibling-index.md) - スタッガーアニメーションへの応用
- [1文字ずつ変化するテキストアニメーション](./character-by-character-animation.md) - 文字分割の基本パターン
- [@property でアニメーション可能なカスタムプロパティ](../values/css-property-animation.md)
