---
title: clip-path の polygon() でアイコン作成
category: css/visual
tags: [clip-path, polygon, icons, svg-free, 2026]
browser_support: 全モダンブラウザ対応
created: 2026-01-19
updated: 2026-01-19
---

# clip-path の polygon() でアイコン作成

> 出典: https://css-notes.com/tips/clip-path-icons
> 執筆日: 2026年1月12日
> 追加日: 2026-01-19

CSS の `clip-path: polygon()` を使って、SVG や画像ファイルなしでアイコンを作成する手法。`currentColor` による色の継承と、`font-size` によるスケーラブルなサイズ調整が可能です。

## 基本コンセプト

```css
.icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  background: currentColor;
  clip-path: polygon(/* 座標 */);
}
```

**利点**:
- ✅ SVG ファイル不要
- ✅ `currentColor` で親要素の色を継承
- ✅ `font-size` でサイズ変更可能
- ✅ CSS のみで完結

## 実装パターン

### カスタムプロパティによる調整可能な設計

```css
.icon {
  --inner: 0.25; /* 内側の余白（比率） */
  --stroke: 0.15; /* 線の太さ（比率） */

  display: inline-block;
  width: 1em;
  height: 1em;
  background: currentColor;
}
```

## 6つのアイコンパターン

### 1. Arrow Triangle（三角矢印）

```css
.icon-arrow-triangle {
  clip-path: polygon(
    50% 0%,
    100% 100%,
    0% 100%
  );
}
```

### 2. Plus Icon（プラスアイコン）

```css
.icon-plus {
  --stroke: 0.15;

  clip-path: polygon(
    calc(50% - var(--stroke) / 2) 0%,
    calc(50% + var(--stroke) / 2) 0%,
    calc(50% + var(--stroke) / 2) calc(50% - var(--stroke) / 2),
    100% calc(50% - var(--stroke) / 2),
    100% calc(50% + var(--stroke) / 2),
    calc(50% + var(--stroke) / 2) calc(50% + var(--stroke) / 2),
    calc(50% + var(--stroke) / 2) 100%,
    calc(50% - var(--stroke) / 2) 100%,
    calc(50% - var(--stroke) / 2) calc(50% + var(--stroke) / 2),
    0% calc(50% + var(--stroke) / 2),
    0% calc(50% - var(--stroke) / 2),
    calc(50% - var(--stroke) / 2) calc(50% - var(--stroke) / 2)
  );
}
```

### 3. Minus Icon（マイナスアイコン）

```css
.icon-minus {
  --stroke: 0.15;

  clip-path: polygon(
    0% calc(50% - var(--stroke) / 2),
    100% calc(50% - var(--stroke) / 2),
    100% calc(50% + var(--stroke) / 2),
    0% calc(50% + var(--stroke) / 2)
  );
}
```

### 4. Arrow Caret（山形矢印・シェブロン）

```css
.icon-caret {
  --inner: 0.25;
  --stroke: 0.15;

  clip-path: polygon(
    calc(0% + var(--inner) * 1.5) calc(50% - var(--stroke) / 2),
    50% calc(100% - var(--inner)),
    calc(100% - var(--inner) * 1.5) calc(50% - var(--stroke) / 2),
    calc(100% - var(--inner) * 1.5) calc(50% + var(--stroke) / 2),
    50% calc(100% - var(--inner) - var(--stroke)),
    calc(0% + var(--inner) * 1.5) calc(50% + var(--stroke) / 2)
  );
}
```

**回転での向き変更**:
```css
.icon-caret-up { transform: rotate(180deg); }
.icon-caret-right { transform: rotate(-90deg); }
.icon-caret-left { transform: rotate(90deg); }
```

### 5. X Icon（閉じるアイコン）

```css
.icon-x {
  --inner: 0.25;
  --stroke: 0.15;

  /* L字型を45度回転して×を作成 */
  clip-path: polygon(
    calc(0% + var(--inner)) calc(50% - var(--stroke) / 2),
    50% calc(100% - var(--inner) - var(--stroke) / 2),
    calc(100% - var(--inner)) calc(50% - var(--stroke) / 2),
    calc(100% - var(--inner)) calc(50% + var(--stroke) / 2),
    calc(50% + var(--stroke) / 2) calc(100% - var(--inner)),
    calc(50% + var(--stroke) / 2) calc(100% - var(--inner)),
    calc(100% - var(--inner)) calc(100% - var(--inner)),
    calc(100% - var(--inner)) 100%,
    calc(50% + var(--stroke) / 2) calc(50% + var(--stroke) / 2),
    calc(0% + var(--inner)) 100%,
    calc(0% + var(--inner)) calc(100% - var(--inner)),
    calc(50% - var(--stroke) / 2) calc(50% + var(--stroke) / 2)
  );

  transform: rotate(45deg);
}
```

### 6. Checkmark（チェックマーク）

```css
.icon-check {
  --inner: 0.25;
  --stroke: 0.15;

  /* L字型を45度回転してチェックマークに */
  clip-path: polygon(
    calc(0% + var(--inner)) calc(50% - var(--stroke) / 2),
    calc(0% + var(--inner)) calc(50% + var(--stroke) / 2),
    calc(50% - var(--stroke) / 2) calc(100% - var(--inner)),
    calc(100% - var(--inner)) 0%,
    100% 0%,
    calc(50% + var(--stroke) / 2) calc(100% - var(--inner))
  );

  transform: rotate(-45deg);
}
```

## 実践的な使用例

### ボタン内のアイコン

```html
<button>
  <span class="icon icon-plus"></span>
  追加
</button>
```

```css
.icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  background: currentColor;
  vertical-align: -0.125em; /* テキストとの垂直位置調整 */
}

button {
  font-size: 16px;
  color: #fff;
}
```

### アイコンのサイズ変更

```css
/* 小さいアイコン */
.icon-sm {
  font-size: 0.75em;
}

/* 大きいアイコン */
.icon-lg {
  font-size: 1.5em;
}

/* 巨大なアイコン */
.icon-xl {
  font-size: 3em;
}
```

### ホバーエフェクト

```css
.icon-button {
  transition: transform 0.2s;
}

.icon-button:hover {
  transform: scale(1.2);
}
```

## カスタマイズ

### 線の太さを変更

```css
.icon-plus-thick {
  --stroke: 0.25; /* 太め */
}

.icon-plus-thin {
  --stroke: 0.1; /* 細め */
}
```

### 余白を変更

```css
.icon-caret-compact {
  --inner: 0.1; /* 余白を小さく */
}

.icon-caret-spacious {
  --inner: 0.4; /* 余白を大きく */
}
```

## アニメーション

### 回転アニメーション

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.icon-loading {
  animation: spin 1s linear infinite;
}
```

### フェードイン

```css
.icon-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
```

## アクセシビリティ

### スクリーンリーダー対応

```html
<!-- 装飾的なアイコン -->
<span class="icon icon-check" aria-hidden="true"></span>

<!-- 意味のあるアイコン -->
<span class="icon icon-check" role="img" aria-label="完了"></span>
```

### ボタン内での使用

```html
<button aria-label="閉じる">
  <span class="icon icon-x" aria-hidden="true"></span>
</button>
```

## 利点と制限

### 利点

- ✅ HTTP リクエスト削減（画像ファイル不要）
- ✅ スケーラブル（ベクター形式）
- ✅ CSS で完全に制御可能
- ✅ カラー変更が容易（`currentColor`）
- ✅ パフォーマンスが良好

### 制限

- ❌ 複雑な形状は実装が困難
- ❌ 多色アイコンは不可
- ❌ グラデーション未対応
- ❌ 座標計算が複雑

### SVG との使い分け

| 条件 | 推奨 |
|------|------|
| シンプルな形状 | `clip-path` |
| 複雑な形状 | SVG |
| 多色 | SVG |
| グラデーション | SVG |
| アニメーション | どちらでも可 |

## ブラウザサポート

| ブラウザ | 対応状況 |
|---------|---------|
| Chrome | 55+ (2016年12月) |
| Firefox | 54+ (2017年6月) |
| Safari | 9.1+ (2016年3月) |
| Edge | 79+ (2020年1月) |

**現在**: 全モダンブラウザで安心して使用可能。

## ユースケース

- UI コントロール（閉じる、開く、追加、削除）
- ナビゲーションアイコン（矢印、メニュー）
- ステータスインジケーター（チェック、エラー）
- ローディングスピナー
- ソート方向インジケーター

## 参考リソース

- [MDN: clip-path](https://developer.mozilla.org/ja/docs/Web/CSS/clip-path)
- [Clippy - CSS clip-path maker](https://bennettfeely.com/clippy/)

---
