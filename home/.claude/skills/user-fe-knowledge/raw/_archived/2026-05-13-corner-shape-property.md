---
url: https://ics.media/entry/260226/
fetched_at: 2026-05-13
title: 角の形を自在に変える！ CSS corner-shapeプロパティ入門
---

# CSS corner-shape プロパティ入門

**著者:** 岩間 日菜（株式会社 ICS）

## 問題解決の意義
従来、角の形状変更には複数手法が必要：
- 丸くする: `border-radius`
- 斜めに切る: 疑似要素や `clip-path`
- 内側にえぐる: SVG や CSS Masking

`corner-shape` プロパティは「`border-radius` で確保した角の領域に対して処理方法を指定するだけで、同様の表現を直感的に実装」できる。

## 主な特徴
- `border-radius` と組み合わせることが必須
- `border-radius` 値が 0 では視覚的変化なし
- 半径が大きいほど個性が強く出現

## コード例

```css
/* 基本 */
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

## 指定可能な値

| 値 | 効果 |
|-----|------|
| `round` | 通常の丸みのある角 |
| `bevel` | 直線的に切り落とした形 |
| `scoop` | 内側にえぐった形 |
| `notch` | 四角く欠けた形 |
| `square` | 直角 |
| `squircle` | 円と正方形の中間の滑らかな曲線 |
| `superellipse()` | 曲率を数値で指定（1 に近いほど円に近い） |

## ブラウザサポート
- Chrome・Edge 139（2025年8月）以上

## 優れている理由
従来の `clip-path` では「角の大きさや形状を変更するたびに座標を再計算する必要があり、調整が複雑になりがち」。`corner-shape` は意図が直感的で、色や大きさの変更やアニメーションも容易。
