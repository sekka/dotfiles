---
title: corner-shape プロパティ
category: css/visual
tags: [corner-shape, squircle, border-radius, rounded-corners, bevel, scoop, notch, 2025, 2026]
browser_support: Safari 18.2+ (2024-12), Chrome/Edge 139+ (2025-08)
created: 2026-01-31
updated: 2026-05-13
---

# corner-shape プロパティ

> 出典:
> - https://gihyo.jp/article/2026/01/misskey-22 (執筆 2026-01-26)
> - https://ics.media/entry/260226/ — ICS 岩間 日菜「角の形を自在に変える！」
>
> 追加日: 2026-01-31 / 更新: 2026-05-13

角の形状を定義する CSS プロパティ。`border-radius` で確保した角の領域に対して「どう処理するか」を指定するだけで、丸み・斜め切り・えぐり・切り欠きなどの形状を直感的に実装できる。

## 概要

`border-radius` と組み合わせて使う。`border-radius: 0` では視覚的変化なし。半径が大きいほど個性が強く出る。

## 基本的な使い方

```css
button {
  border-radius: 12px;
  corner-shape: bevel;
}

/* 部分指定 */
.label {
  border-radius: 12px;
  corner-left-shape: bevel;
  corner-right-shape: round;
}
```

部分指定プロパティ:
- `corner-top-shape` / `corner-bottom-shape`
- `corner-left-shape` / `corner-right-shape`
- `corner-top-left-shape` / `corner-top-right-shape` ...

## 指定可能な値

| 値 | 効果 | 用途例 |
|-----|------|--------|
| `round` | 通常の丸み（円弧。デフォルト） | 標準ボタン、カード |
| `bevel` | 直線的に切り落とした形 | チケット、タグ |
| `scoop` | 内側にえぐった形 | 装飾的なバッジ |
| `notch` | 四角く欠けた形 | クーポン、リボン |
| `square` | 直角（角を保つ） | 角丸の打ち消し |
| `squircle` | 円と正方形の中間の滑らかな曲線（iOS 風） | アプリアイコン、カード |
| `superellipse(<n>)` | 曲率を数値で指定（1 に近いほど円、∞ に近いほど四角） | 任意の曲率 |

### Squircle

「Square + Circle」の造語。円弧より直線部が長く、角だけ滑らかに曲がる形状。Apple のデザイン言語で多用される。

```css
.app-icon {
  width: 80px;
  height: 80px;
  border-radius: 18px;
  corner-shape: squircle;
}
```

## ユースケース

### カード UI

```css
.card {
  width: 300px;
  height: 200px;
  border-radius: 24px;
  corner-shape: squircle;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### iOS 風アイコングリッド

```html
<div class="app-grid">
  <div class="app-icon">📱</div>
  <div class="app-icon">⚙️</div>
  <div class="app-icon">📷</div>
</div>
```

```css
.app-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  corner-shape: squircle;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: grid;
  place-items: center;
  font-size: 32px;
}
```

### チケット（bevel + notch ハイブリッド）

```css
.ticket {
  border-radius: 16px;
  corner-top-left-shape: bevel;
  corner-top-right-shape: bevel;
}
```

### モダンカードデザイン

```css
.product-card {
  border-radius: 32px;
  corner-shape: squircle;
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
```

## 従来の方法との比較

### SVG / clip-path（従来）

```css
/* 複雑な path 座標が必要、サイズ変更時に再計算 */
.squircle-fallback {
  clip-path: path('M 0,20 C 0,5 5,0 20,0 L 80,0 C 95,0 100,5 100,20 ...');
}
```

### corner-shape（推奨）

```css
.squircle-modern {
  border-radius: 20px;
  corner-shape: squircle;
}
```

**優れている理由**: 角の大きさや形状を変更するたびの座標再計算が不要。色やサイズの変更、アニメーションも容易。

## ブラウザサポート

| ブラウザ | バージョン | リリース日 |
|----------|-----------|----------|
| Safari | 18.2+ | 2024年12月 |
| Chrome | 139+ | 2025年8月 |
| Edge | 139+ | 2025年8月 |
| Firefox | 未対応 | 検討中 |

## フォールバック

```css
.element {
  border-radius: 20px;
}

@supports (corner-shape: squircle) {
  .element {
    corner-shape: squircle;
  }
}
```

## アクセシビリティ

`corner-shape` は視覚的な装飾のみ。アクセシビリティへの影響なし。

## パフォーマンス

`border-radius` と同様、GPU アクセラレーションが効く。大量要素での使用も問題少ない。

## デザインシステムへの統合

```css
:root {
  --corner-radius-sm: 8px;
  --corner-radius-md: 16px;
  --corner-radius-lg: 24px;
  --corner-shape: squircle;
}

.card {
  border-radius: var(--corner-radius-lg);
  corner-shape: var(--corner-shape);
}
```

## 関連ナレッジ

- [border-radius](./border-radius.md)
- [clip-path](./clip-path.md)
- [shape()](./shape-function.md)
- [Apple Human Interface Guidelines](../../human-interface-guidelines/README.md)

## 参考リソース

- [ICS: 角の形を自在に変える！](https://ics.media/entry/260226/)
- [CSS Backgrounds and Borders Level 4: corner-shape](https://drafts.csswg.org/css-backgrounds-4/#corner-shaping)
- [Figma: Squircle plugin](https://www.figma.com/community/plugin/763070852025980606/Squircle)
