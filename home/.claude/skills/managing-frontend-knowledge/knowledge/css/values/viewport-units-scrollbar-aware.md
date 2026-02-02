---
title: 100vw スクロールバー問題の解決（Chrome 145+）
category: css/values
tags: [viewport-units, vw, scrollbar, scrollbar-gutter, layout]
browser_support: Chrome 145+、他のブラウザも段階的にサポート予定
created: 2026-01-31
updated: 2026-01-31
source: https://coliss.com/articles/build-websites/operation/css/using-100vw-is-now-scrollbar-aware.html
---

# 100vw スクロールバー問題の解決

## 概要

Chrome 145 以降、`100vw` がスクロールバーの幅を自動認識するようになりました。長年の問題だった「水平スクロールバーの不要な表示」が解決されます。

---

## 従来の問題点

### 問題の詳細

`100vw` を使用すると、ビューポート幅全体が参照されるため、垂直スクロールバーが存在する場合にオーバーフローが発生していました。

```css
/* 従来の問題 */
.container {
  width: 100vw;  /* スクロールバーを含むビューポート幅 */
}
```

**結果:**
- コンテンツ幅 + スクロールバー幅 = 100vw を超える
- 不要な水平スクロールバーが表示される
- 特に Windows やmacOS のクラシックスクロールバーで顕著

### 従来の回避策

```css
/* 回避策1: calc() による手動計算 */
.container {
  width: calc(100vw - var(--scrollbar-width));
}

/* 回避策2: overflow-y: scroll で常にスクロールバーを表示 */
html {
  overflow-y: scroll;
}

/* 回避策3: scrollbar-gutter でスペース確保 */
html {
  scrollbar-gutter: stable;
}
```

**問題点:**
- JavaScript でスクロールバー幅を計算する必要
- 常にスクロールバーが表示される
- プラットフォームごとに異なる幅に対応困難

---

## Chrome 145 での変更内容

### 自動認識の仕組み

Chrome 145 以降、`html` 要素にスクロールバーが常時表示されているか、スペースが確保されている場合、ビューポート単位（`vw`、`vh`）が**自動的にスクロールバーの幅を差し引いて計算**されます。

```css
/* Chrome 145+ では自動的にスクロールバー幅を考慮 */
.container {
  width: 100vw;  /* スクロールバーを除いた表示領域幅 */
}
```

**動作条件:**
- `html` 要素にスクロールバーが常時表示されている
- または、`scrollbar-gutter: stable` でスペースが確保されている

---

## scrollbar-gutter の推奨設定

### 推奨される実装

```css
html {
  scrollbar-gutter: stable;
}
```

**理由:**
- `overflow-y: scroll` より推奨される
- 不要な場合でも常にスクロールバーを表示してしまう問題を回避
- スペースのみを確保し、視覚的なノイズを削減

### overflow-y: scroll との比較

| プロパティ | スクロールバー表示 | スペース確保 | 推奨度 |
|-----------|------------------|-------------|-------|
| `overflow-y: scroll` | 常に表示 | ○ | △ |
| `scrollbar-gutter: stable` | 必要時のみ | ○ | ◎ |

---

## ブラウザサポート状況

### 現在のサポート

- **Chrome 145+**: サポート済み
- **Firefox**: 未サポート（実装予定）
- **Safari**: 未サポート（実装予定）
- **Edge**: Chrome ベースのため 145+ でサポート

### CSS Working Group での決議

CSSワーキンググループで議決済みのため、他のブラウザも段階的にサポート予定です。

---

## 既存サイトへの影響

### 互換性調査の結果

既存サイトでの `calc(100vw - var(--scrollbar-width))` 使用率は全体の **2.68%** に留まり、変更による影響は限定的と判断されました。

### マイグレーション

**既存の回避策を使用している場合:**

```css
/* 古い実装（削除可能） */
.container {
  width: calc(100vw - var(--scrollbar-width));
}

/* 新しい実装（Chrome 145+） */
.container {
  width: 100vw;
}
```

**段階的な移行:**

```css
html {
  scrollbar-gutter: stable;
}

.container {
  width: 100vw;

  /* フォールバック（Chrome 144以前） */
  @supports not (width: 100vw) {
    width: calc(100vw - 15px); /* 仮のスクロールバー幅 */
  }
}
```

---

## 実装例

### 基本的な実装

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    html {
      scrollbar-gutter: stable;
    }

    .full-width {
      width: 100vw;
      background: linear-gradient(to right, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      color: white;
    }

    .content {
      max-width: 1200px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="full-width">
    <div class="content">
      <h1>100vw はスクロールバー幅を自動認識</h1>
      <p>Chrome 145 以降では水平スクロールバーが不要に表示されません。</p>
    </div>
  </div>

  <!-- ページに十分な高さを持たせてスクロールバーを表示 -->
  <div style="height: 200vh;"></div>
</body>
</html>
```

### レスポンシブデザインとの組み合わせ

```css
html {
  scrollbar-gutter: stable;
}

.hero {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.full-bleed {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
}
```

---

## よくある質問

### Q1: すべてのビューポート単位に適用されますか？

はい、`vw`、`vh`、`vmin`、`vmax` すべてに適用されます。

### Q2: macOS のオーバーレイスクロールバーは？

オーバーレイスクロールバー（透明なスクロールバー）は幅を持たないため、自動認識の対象外です。

### Q3: 古いブラウザへのフォールバックは必要？

Chrome 144 以前や他のブラウザでは、`scrollbar-gutter: stable` が最も安全なフォールバックです。

### Q4: JavaScript で幅を計算する必要はなくなりましたか？

Chrome 145+ では不要になりましたが、他のブラウザのサポート状況に応じて段階的に移行してください。

---

## パフォーマンスへの影響

### レイアウトシフトの削減

スクロールバーによる予期しないレイアウトシフト（CLS）を削減できます。

```css
html {
  scrollbar-gutter: stable;
}
```

**効果:**
- ページ読み込み時のレイアウトシフト削減
- スクロールバー表示/非表示による要素の移動防止
- CLS スコアの改善

---

## 参考資料

- [CSS Working Group Issue - 100vw scrollbar awareness](https://github.com/w3c/csswg-drafts/issues/9026)
- [scrollbar-gutter - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-gutter)
- [Viewport units - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths)

---

## 関連ナレッジ

- [Container Queries](../selectors/container-queries.md) - レスポンシブデザイン
- [CLS 最適化](../../cross-cutting/performance/cls-optimization.md) - レイアウトシフト対策
- [モダンCSS値](./README.md) - clamp、min、max など
