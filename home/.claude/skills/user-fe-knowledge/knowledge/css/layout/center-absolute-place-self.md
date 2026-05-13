---
title: 絶対配置の中央揃え — place-self + inset の3行パターン
category: css/layout
tags: [centering, absolute, place-self, inset, positioning, layout, 2024, 2025]
browser_support: 全主要ブラウザ対応 (Safari 26.3+ 含む)
created: 2026-05-13
updated: 2026-05-13
---

# 絶対配置の中央揃え — `place-self: center; inset: 0;`

> 出典: https://coliss.com/articles/build-websites/operation/css/css-center-absolute-element.html
> 追加日: 2026-05-13

絶対配置要素を中央に置く新定番。`transform: translate(-50%, -50%)` のような負パーセンテージや計算が不要で、**3行で完結**する。

## 推奨パターン（モダン）

```css
.element {
  position: absolute;
  place-self: center;
  inset: 0;
}
```

## 従来パターン（translate）

```css
.legacy {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**従来パターンの課題**:
- 「左上隅を 50% に置いてから 50% 分戻す」という二段操作で直感的でない
- `transform` を他用途（アニメーション）に使いたいときに競合
- サブピクセルでぼやけることがある

## 配置位置のバリエーション

`place-self` で 9 種類すべての位置を制御できる。

```css
.element { position: absolute; inset: 0; }

.center      { place-self: center; }     /* 中央 */
.top-left    { place-self: start; }      /* 左上 */
.top-right   { place-self: start end; }  /* 右上 */
.bottom-left { place-self: end start; }  /* 左下 */
.bottom-right{ place-self: end; }        /* 右下 */

.top-center    { place-self: start center; }
.bottom-center { place-self: end center; }
.left-center   { place-self: center start; }
.right-center  { place-self: center end; }
```

## 仕組み

| プロパティ | 役割 |
|----------|------|
| `position: absolute` | 親の `position: relative` を基準に配置 |
| `inset: 0` | `top: 0; right: 0; bottom: 0; left: 0;` のショートハンド。要素を親いっぱいに広げる |
| `place-self: center` | `align-self: center; justify-self: center;` のショートハンド。広げた領域内で中央に寄せる |

`inset: 0` で「自身の配置可能領域 = 親」を作り、`place-self` でその領域内のどこに収めるかを決める。

## ユースケース

### モーダルのオーバーレイ

```html
<div class="modal-backdrop">
  <div class="modal">モーダル内容</div>
</div>
```

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal {
  position: absolute;
  place-self: center;
  inset: 0;
  width: min(500px, 90vw);
  background: white;
  padding: 2rem;
}
```

### バッジを画像の右上に

```html
<div class="card">
  <img src="photo.jpg" alt="">
  <span class="badge">NEW</span>
</div>
```

```css
.card { position: relative; }

.badge {
  position: absolute;
  place-self: start end;
  inset: 0.5rem;
}
```

### ローディングスピナー

```css
.loading-spinner {
  position: absolute;
  place-self: center;
  inset: 0;
}
```

## なぜ優れているか

1. **シンプルで直感的** — 「中央」と書いてあるので意図が明確
2. **負のパーセンテージ不要** — `-50%` のような不自然な計算がない
3. **transform を消費しない** — アニメーションや他のトランスフォームと競合しない
4. **多機能** — 中央以外の位置も同じパターンで実装できる
5. **サブピクセル問題なし** — `transform` 起因のぼやけが出にくい

## ブラウザサポート

「すべてのブラウザに対応」。Safari 最新版（26.3 以降）でも完全サポート。
- `inset` ショートハンド: Baseline Widely available
- `place-self`: Baseline Widely available

## アンチパターン

```css
/* ❌ place-self だけでは中央にならない（inset が必要） */
.element {
  position: absolute;
  place-self: center;
  /* inset が無いと配置領域がゼロなので動かない */
}
```

```css
/* ❌ inset + margin: auto は古い方法（動くが冗長） */
.element {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 200px;
  height: 100px;
}
```

→ `place-self` の方が意図が明確で、サイズ指定が不要。

## 関連ナレッジ

- [layout-basics](./layout-basics.md)
- [layout-primitives](./layout-primitives.md)
- [dialog-modal-2025](../components/dialog-modal-2025.md)

## 参考リソース

- [coliss: たった3行のCSSで要素を中央に絶対配置する新しい記述方法](https://coliss.com/articles/build-websites/operation/css/css-center-absolute-element.html)
- [MDN: place-self](https://developer.mozilla.org/docs/Web/CSS/place-self)
- [MDN: inset](https://developer.mozilla.org/docs/Web/CSS/inset)
