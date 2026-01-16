---
title: shape() 関数（clip-path の新記法）
category: css/visual
tags: [clip-path, shape, visual-effects, 2025]
browser_support: Chrome 135+, Safari 18.4+
created: 2025-01-16
updated: 2025-01-16
---

# shape() 関数（clip-path の新記法）

> 出典: https://ics.media/entry/250703/
> 執筆日: 2025-07-03
> 追加日: 2025-12-17

2025年に追加された `shape()` 関数。従来の `path()` より扱いやすい設計。

## 従来の path() との違い

| 機能 | path() | shape() |
|------|--------|---------|
| 単位 | SVG 座標のみ | px, %, em, rem 等 |
| calc() | ❌ | ✅ |
| CSS 変数 | ❌ | ✅ |
| 構文 | SVG パス文法 | コマンドベース |

## 使用可能なコマンド

| コマンド | 説明 | 例 |
|----------|------|-----|
| `from` | 描画開始点 | `from 0% 0%` |
| `move` | 次のコマンド位置 | `move to 50% 50%` |
| `line` | 直線描画 | `line to 100% 0%` |
| `curve` | ベジェ曲線 | `curve to 100% 100% with 50% 0%` |
| `smooth` | 滑らかな曲線接続 | `smooth to 0% 100%` |
| `arc` | 円弧描画 | `arc to 100% 50% of 50px` |
| `close` | 描画終了（始点に戻る） | `close` |

## 基本構文

```css
.element {
  clip-path: shape(from 0% 0%, line to 100% 0%, line to 100% 100%, close);
}
```

## 角丸な額縁風クリッピング

```css
.frame {
  --radius: 20px;
  --border: 10px;

  clip-path: shape(
    /* 外側の角丸矩形 */
    from var(--radius) 0%,
    line to calc(100% - var(--radius)) 0%,
    arc to 100% var(--radius) of var(--radius),
    line to 100% calc(100% - var(--radius)),
    arc to calc(100% - var(--radius)) 100% of var(--radius),
    line to var(--radius) 100%,
    arc to 0% calc(100% - var(--radius)) of var(--radius),
    line to 0% var(--radius),
    arc to var(--radius) 0% of var(--radius),
    close
  );
}
```

## 波形クリッピング

```css
.wave {
  clip-path: shape(
    from 0% 100%,
    line to 0% 30%,
    curve to 50% 30% with 25% 0%,
    curve to 100% 30% with 75% 60%,
    line to 100% 100%,
    close
  );
}
```

## アニメーション対応

```css
.morph {
  clip-path: shape(from 0% 0%, line to 100% 0%, line to 100% 100%, line to 0% 100%, close);
  transition: clip-path 0.5s ease;
}

.morph:hover {
  clip-path: shape(from 50% 0%, line to 100% 50%, line to 50% 100%, line to 0% 50%, close);
}
```

## CSS 変数との組み合わせ（インタラクティブ）

```css
.spotlight {
  --x: 50%;
  --y: 50%;
  --size: 100px;

  clip-path: shape(
    /* 星型などの複雑な形状を --x, --y を中心に配置 */
    from calc(var(--x) - var(--size)) var(--y),
    line to calc(var(--x) + var(--size)) var(--y),
    /* ... */
    close
  );
}
```

```javascript
// マウス追従
element.addEventListener('mousemove', (e) => {
  const rect = element.getBoundingClientRect();
  element.style.setProperty('--x', `${e.clientX - rect.left}px`);
  element.style.setProperty('--y', `${e.clientY - rect.top}px`);
});
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 135+（2025年4月） |
| Safari | 18.4+（2025年3月） |
| Firefox | Nightly のみ |

## プログレッシブエンハンスメント

```css
/* フォールバック: 基本的な polygon */
.element {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

/* shape() 対応ブラウザのみ */
@supports (clip-path: shape(from 0 0, line to 0 0)) {
  .element {
    clip-path: shape(/* ... */);
  }
}
```

## 関連ナレッジ

- [clip-path 基礎](./clip-path.md)
- [CSS アニメーション](../animation/)
