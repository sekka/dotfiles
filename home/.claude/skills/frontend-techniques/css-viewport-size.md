# CSS のみでウィンドウサイズを取得する方法

<!-- 出典: https://black-flag.net/css/20250121-8237.html -->

## 概要

JavaScript を使わずに CSS だけで画面幅と高さをリアルタイムに取得するテクニック。
`@property` と三角関数（`tan`, `atan2`）を組み合わせて実現する。

## 実装コード

```css
@property --_w {
  syntax: "<length>";
  inherits: true;
  initial-value: 100vw;
}

@property --_h {
  syntax: "<length>";
  inherits: true;
  initial-value: 100vh;
}

:root {
  --w: tan(atan2(var(--_w), 1px));
  --h: tan(atan2(var(--_h), 1px));
}
```

## 仕組み

1. `@property` で `<length>` 型のカスタムプロパティを定義
2. `initial-value` に `100vw` / `100vh` を設定
3. `atan2()` で長さを角度に変換
4. `tan()` で角度を数値（単位なし）に変換

### なぜ三角関数を使うのか

CSS では `100vw` のような長さの値から単位を取り除いて純粋な数値を得る方法がない。
三角関数を使うことで、長さ → 角度 → 数値 という変換が可能になる。

```
100vw → atan2(100vw, 1px) → 角度 → tan(角度) → 数値
```

## 使用例

### 表示用

```css
body::before {
  content: counter(w) " × " counter(h);
  counter-reset: w var(--w) h var(--h);
}
```

### 計算での利用

```css
.element {
  /* 画面幅の10%を計算 */
  width: calc(var(--w) * 0.1 * 1px);

  /* アスペクト比の計算 */
  --aspect-ratio: calc(var(--w) / var(--h));
}
```

## 特徴

- ブラウザリサイズ時にリアルタイムで値が更新される
- JavaScript 不要で軽量
- CSS 計算で直接使用可能

## ブラウザ対応

| 機能        | Chrome | Firefox | Safari | Edge |
| ----------- | ------ | ------- | ------ | ---- |
| `@property` | 85+    | 128+    | 15.4+  | 85+  |
| 三角関数    | 111+   | 108+    | 15.4+  | 111+ |

## 注意点

- `@property` は比較的新しい機能のため、古いブラウザでは動作しない
- フォールバックが必要な場合は JavaScript との併用を検討

## 関連リンク

- [MDN: @property](https://developer.mozilla.org/ja/docs/Web/CSS/@property)
- [MDN: atan2()](https://developer.mozilla.org/ja/docs/Web/CSS/atan2)
- [Can I use: @property](https://caniuse.com/mdn-css_at-rules_property)
