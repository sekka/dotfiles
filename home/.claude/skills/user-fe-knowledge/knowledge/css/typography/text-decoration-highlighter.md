---
title: text-decoration で蛍光ペン風アンダーライン
category: css/typography
tags: [text-decoration, underline, highlight, modern-css, 2022]
browser_support: Safari 15.4+、Chrome、Firefox（全主要ブラウザ対応）
created: 2026-01-19
updated: 2026-01-19
---

# text-decoration で蛍光ペン風アンダーライン

> 出典: https://zenn.dev/catnose99/articles/3239ba0d49cda9
> 執筆日: 2022年9月26日
> 追加日: 2026-01-19

`text-decoration` プロパティ群を使って、`linear-gradient` よりも直感的に蛍光ペン風のアンダーラインを実現する方法。Safari 15.4 以降で全主要ブラウザに対応しました。

## 基本的な実装

### 従来の方法（linear-gradient）

```css
/* ❌ 従来の方法: 複雑で制約が多い */
.highlight {
  background: linear-gradient(transparent 60%, rgba(255, 228, 0, 0.4) 60%);
  display: inline;
  box-decoration-break: clone;
}
```

**問題点:**
- `display: inline` が必須
- 位置や太さの調整が直感的でない
- 複数行への対応が複雑

### text-decoration による実装

```css
/* ✅ 推奨: text-decoration でシンプルに */
.highlight {
  text-decoration: underline;
  text-decoration-thickness: 0.5em;
  text-decoration-color: rgba(255, 228, 0, 0.4);
  text-underline-offset: -0.2em;
  text-decoration-skip-ink: none;
}
```

## 重要なプロパティ

### text-decoration-skip-ink: none

**最重要**: この指定により、アンダーラインが文字に重なる部分でも途切れずに表示されます。

```css
/* ❌ デフォルト: 文字の下で線が途切れる */
.underline {
  text-decoration: underline;
  text-decoration-skip-ink: auto; /* デフォルト値 */
}

/* ✅ 蛍光ペン風: 文字の上にも線が表示される */
.highlight {
  text-decoration: underline;
  text-decoration-skip-ink: none; /* 重要 */
}
```

### 各プロパティの役割

| プロパティ | 役割 | 例 |
|-----------|------|-----|
| `text-decoration` | 装飾の種類 | `underline` |
| `text-decoration-thickness` | 線の太さ | `0.5em`, `4px` |
| `text-decoration-color` | 線の色 | `rgba(255, 228, 0, 0.4)` |
| `text-underline-offset` | 線の位置 | `-0.2em`（マイナスで上に移動） |
| `text-decoration-skip-ink` | 文字との重なり | `none`（途切れない） |

## 実践的なバリエーション

### 黄色の蛍光ペン

```css
.highlight-yellow {
  text-decoration: underline;
  text-decoration-thickness: 0.5em;
  text-decoration-color: rgba(255, 228, 0, 0.4);
  text-underline-offset: -0.2em;
  text-decoration-skip-ink: none;
}
```

### ピンクの蛍光ペン

```css
.highlight-pink {
  text-decoration: underline;
  text-decoration-thickness: 0.6em;
  text-decoration-color: rgba(255, 105, 180, 0.3);
  text-underline-offset: -0.25em;
  text-decoration-skip-ink: none;
}
```

### グリーンの蛍光ペン

```css
.highlight-green {
  text-decoration: underline;
  text-decoration-thickness: 0.4em;
  text-decoration-color: rgba(0, 255, 127, 0.3);
  text-underline-offset: -0.15em;
  text-decoration-skip-ink: none;
}
```

## 短縮記法

```css
/* 個別指定 */
.highlight {
  text-decoration: underline;
  text-decoration-thickness: 0.5em;
  text-decoration-color: rgba(255, 228, 0, 0.4);
}

/* 短縮記法 */
.highlight {
  text-decoration: underline rgba(255, 228, 0, 0.4) 0.5em;
}

/* 注意: text-underline-offset と text-decoration-skip-ink は別途指定が必要 */
.highlight {
  text-decoration: underline rgba(255, 228, 0, 0.4) 0.5em;
  text-underline-offset: -0.2em;
  text-decoration-skip-ink: none;
}
```

## ホバーエフェクト

```css
.highlight-link {
  text-decoration: underline;
  text-decoration-thickness: 0em;
  text-decoration-color: rgba(255, 228, 0, 0.4);
  text-underline-offset: -0.2em;
  text-decoration-skip-ink: none;
  transition: text-decoration-thickness 0.3s;
}

.highlight-link:hover {
  text-decoration-thickness: 0.5em;
}
```

## ブラウザサポート

| ブラウザ | 対応バージョン | 備考 |
|---------|--------------|------|
| Safari | 15.4+（2022年3月） | 最後に対応完了 |
| Chrome | 89+（2021年3月） | 早期対応 |
| Firefox | 70+（2019年10月） | 早期対応 |
| Edge | 89+（2021年3月） | Chromium ベース |

**現在の状況**: Safari 15.4 以降の対応により、全主要ブラウザで安心して使用可能。

## linear-gradient との比較

### text-decoration の利点

- ✅ 位置や太さの調整が直感的
- ✅ `display: inline` の制約なし
- ✅ 複数行テキストへの対応が簡単
- ✅ アニメーションが容易
- ✅ アクセシビリティが良好

### linear-gradient の欠点

- ❌ `display: inline` が必須
- ❌ 位置調整が `%` 指定で直感的でない
- ❌ 複数行対応に `box-decoration-break: clone` が必要
- ❌ アニメーションが複雑

## アクセシビリティ考慮

```css
/* ハイコントラストモード対応 */
@media (prefers-contrast: high) {
  .highlight {
    text-decoration-color: rgba(255, 228, 0, 0.8); /* 不透明度を上げる */
  }
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  .highlight {
    text-decoration-color: rgba(255, 228, 0, 0.3); /* 薄めにする */
  }
}
```

## ユースケース

- ブログ記事での強調表示
- 引用文のハイライト
- 検索結果のキーワードマッチ
- リンクのホバーエフェクト
- 編集モードでの変更箇所の可視化

## Tips

### 太さの調整

```css
/* 薄め（0.3em〜0.4em） */
.highlight-thin {
  text-decoration-thickness: 0.3em;
  text-underline-offset: -0.1em;
}

/* 標準（0.5em〜0.6em） */
.highlight-normal {
  text-decoration-thickness: 0.5em;
  text-underline-offset: -0.2em;
}

/* 太め（0.7em〜0.8em） */
.highlight-thick {
  text-decoration-thickness: 0.7em;
  text-underline-offset: -0.3em;
}
```

### カスタムプロパティで管理

```css
:root {
  --highlight-yellow: rgba(255, 228, 0, 0.4);
  --highlight-pink: rgba(255, 105, 180, 0.3);
  --highlight-green: rgba(0, 255, 127, 0.3);
  --highlight-thickness: 0.5em;
  --highlight-offset: -0.2em;
}

.highlight {
  text-decoration: underline;
  text-decoration-thickness: var(--highlight-thickness);
  text-decoration-color: var(--highlight-yellow);
  text-underline-offset: var(--highlight-offset);
  text-decoration-skip-ink: none;
}
```

## 参考リソース

- [MDN: text-decoration](https://developer.mozilla.org/ja/docs/Web/CSS/text-decoration)
- [MDN: text-decoration-skip-ink](https://developer.mozilla.org/ja/docs/Web/CSS/text-decoration-skip-ink)

---
