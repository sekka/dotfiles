---
title: CSSグラデーションの補間方法
category: css/visual
tags: [gradient, interpolation, color-space, oklab, hsl, linear-gradient]
browser_support: Chrome 111+, Safari 16.2+, Firefox 127+
created: 2026-02-01
updated: 2026-02-01
---

# CSSグラデーションの補間方法

## CSSグラデーション補間方法の指定

> 出典: https://ics.media/entry/250829/
> 執筆日: 2025-08-29
> 追加日: 2026-02-01

同じ2色のグラデーションでも、補間方法（色空間の選択）によって見た目が大きく異なる。CSS Color Module Level 4で導入された新しい補間方法により、知覚的に均一なグラデーションや鮮やかな虹色グラデーションを実現できる。

### コード例

**基本構文:**

```css
.bg {
  background: linear-gradient(in hsl, red, blue);
}
```

**虹色グラデーション（1行で実現）:**

```css
.rainbow {
  background: linear-gradient(90deg in hsl longer hue, red, red);
}
```

**知覚的に均一なグラデーション:**

```css
.smooth {
  background: linear-gradient(in oklab, red, blue);
}
```

**従来のsRGB（デフォルト）:**

```css
.traditional {
  background: linear-gradient(red, blue);
  /* 以下と同等 */
  background: linear-gradient(in srgb, red, blue);
}
```

**放射グラデーション:**

```css
.radial {
  background: radial-gradient(in oklch, yellow, purple);
}
```

**コニカルグラデーション:**

```css
.conic {
  background: conic-gradient(in hsl, red, yellow, lime, aqua, blue, magenta, red);
}
```

### 色空間の選択

| 色空間 | 座標系 | 特徴 | 推奨用途 |
|--------|--------|------|----------|
| **sRGB** | 直交座標 | 従来のデフォルト | 一般的な用途 |
| **Oklab** | 直交座標 | 知覚的に均一 | 自然なグラデーション |
| **HSL** | 極座標 | 色相環を巡る | 鮮やかな虹色効果 |
| **HWB** | 極座標 | 白・黒の混合量 | 色相ベースの調整 |
| **LCH** | 極座標 | 明度・彩度・色相 | 色相環での補間 |
| **OkLCH** | 極座標 | Oklabの極座標版 | 知覚的に均一な色相遷移 |

### 補間アルゴリズムの指定

**shorter hue（デフォルト）:**

```css
.short-hue {
  background: linear-gradient(90deg in hsl shorter hue, red, blue);
  /* 最短経路で色相を補間 */
}
```

**longer hue（長い経路）:**

```css
.long-hue {
  background: linear-gradient(90deg in hsl longer hue, red, blue);
  /* 色相環の長い方の経路で補間 */
}
```

**increasing hue（増加方向）:**

```css
.increasing {
  background: linear-gradient(90deg in hsl increasing hue, red, blue);
}
```

**decreasing hue（減少方向）:**

```css
.decreasing {
  background: linear-gradient(90deg in hsl decreasing hue, red, blue);
}
```

### ユースケース

- **知覚的に均一なグラデーション**: デザインの一貫性が重要な場合（Oklabを使用）
- **虹色グラデーション**: カラフルで鮮やかな表現（HSL longer hueを使用）
- **自然な色遷移**: 写真やイラストの背景（Oklabを使用）
- **テーマカラーの遷移**: ブランドカラー間の滑らかな移行（OkLCHを使用）
- **データビジュアライゼーション**: ヒートマップやカラースケール（Oklabを使用）

### 注意点

**知覚的均一性の重要性:**

- sRGBでは中間色が暗く見えることがある
- Oklabは人間の視覚に合わせて均一な明度を保つ

**色相環の補間:**

- HSLで `longer hue` を使うと、色相環を大きく巡って鮮やかな遷移
- `shorter hue` では最短経路（地味な遷移になることがある）

**単一色ストップ技法:**

```css
/* 同じ色を始点と終点に指定して虹色効果 */
.rainbow {
  background: linear-gradient(90deg in hsl longer hue, red, red);
}
```

この技法は Chrome 135+, Safari 18.4+, Firefox 136+ で対応。

**ブラウザサポート:**

| 機能 | Chrome | Safari | Firefox |
|------|--------|--------|---------|
| 補間方法指定 | 111+ (2023年3月) | 16.2+ (2022年12月) | 127+ (2024年6月) |
| 単一色ストップ | 135+ (2025年4月) | 18.4+ (2025年3月) | 136+ (2025年4月) |

**パフォーマンス:**

- 補間方法の指定はレンダリングパフォーマンスにほとんど影響しない
- ブラウザがネイティブにサポートするため、軽量

**フォールバック:**

```css
/* 古いブラウザ向けフォールバック */
.gradient {
  background: linear-gradient(red, blue); /* フォールバック */
  background: linear-gradient(in oklab, red, blue); /* モダンブラウザ */
}
```

### 実践例

**データビジュアライゼーション用ヒートマップ:**

```css
.heatmap {
  background: linear-gradient(
    90deg in oklab,
    blue 0%,
    cyan 25%,
    green 50%,
    yellow 75%,
    red 100%
  );
}
```

**ブランドカラーの滑らかな遷移:**

```css
.brand-gradient {
  background: linear-gradient(
    135deg in oklch,
    var(--primary-color),
    var(--secondary-color)
  );
}
```

**サンセット効果:**

```css
.sunset {
  background: linear-gradient(
    180deg in hsl longer hue,
    hsl(200, 70%, 50%), /* 青空 */
    hsl(30, 90%, 60%)   /* オレンジ */
  );
}
```

### 関連技術

- **CSS Color Module Level 4**: 新しい色空間とcolor()関数
- **color-mix()関数**: 色の混合
- **relative color syntax**: 相対色指定
- **wide-gamut colors**: Display P3など広色域対応

### 参考リンク

- [ICS MEDIA - CSSグラデーションの補間方法](https://ics.media/entry/250829/)
- [W3C CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/)
- [MDN - linear-gradient()](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient)

---
