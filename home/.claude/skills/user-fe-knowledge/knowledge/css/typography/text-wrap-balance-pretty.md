---
title: text-wrap balance / pretty — 美しい行折り返しの自動制御
category: css/typography
tags: [text-wrap, balance, pretty, typography, heading, orphan, widow, line-break, 2024, 2026]
browser_support: balance Chrome 114+ (2023-05), Firefox 121+ (2023-12), Safari 17.5+ (2024-05) / pretty Chrome 117+, Safari 17.5+, Firefox 未対応
created: 2026-05-13
updated: 2026-05-13
---

# text-wrap: balance / pretty — 美しい行折り返しの自動制御

> 出典: https://zenn.dev/seekseep/articles/css-new-features-catch-up-2026 — よこやまたく (公開 2026-04-28)
> 追加日: 2026-05-13

テキストの折り返しを「美しい行配置」になるようブラウザが自動調整する CSS プロパティ。見出しの行バランスや段落末尾の孤立行（orphan / widow）問題を JavaScript なしで解決できる。

## 概要

`text-wrap` プロパティに 4 つの値がある:

| 値 | 用途 | 特性 |
|----|------|------|
| `wrap` | デフォルト | 標準の折り返し（速度優先） |
| `nowrap` | 折り返し禁止 | `white-space: nowrap` 相当 |
| `balance` | **見出し向け** | 全行の幅をできるだけ均等に |
| `pretty` | **段落向け** | 最終行の孤立を避け美しい末尾に |

## text-wrap: balance — 見出しの行バランス

複数行になる見出しで、各行の長さを均等化する。Webデザインで「最終行に単語1つだけ残る」アンバランスを防ぐ。

### Before / After

```
❌ wrap (デフォルト):
これは長めの見出しテキストの
例

✅ balance:
これは長めの見出し
テキストの例
```

### 基本的な使い方

```css
h1, h2, h3 {
  text-wrap: balance;
}
```

### 注意点: 行数上限

仕様上、`balance` が効くのは **6 行程度まで**。長文の段落には適さない（パフォーマンス保護のため）。見出しやカード見出し、CTA 文言など短いテキストに使う。

```css
/* 見出し */
.hero-heading {
  font-size: clamp(2rem, 5vw, 4rem);
  text-wrap: balance;
  max-width: 30ch;
}

/* カード見出し */
.card-title {
  text-wrap: balance;
}
```

## text-wrap: pretty — 段落の末尾を整える

段落の最終行に単語が 1〜2 個しか残らない「orphan」現象を防ぐ。前後の行から単語を引き寄せ、自然な行末配置にする。

### Before / After

```
❌ wrap:
これは長い段落テキストで、最後の行に
たった一つの
単語

✅ pretty:
これは長い段落テキストで、
最後の行にたった一つの単語
```

### 基本的な使い方

```css
p {
  text-wrap: pretty;
}
```

### 段落向け推奨パターン

```css
article p {
  text-wrap: pretty;
  hyphens: auto;
  line-height: 1.7;
}
```

## balance vs pretty の使い分け

| 場面 | 推奨値 | 理由 |
|------|--------|------|
| 見出し（短文・6 行以下） | `balance` | 全行の幅を均等化 |
| 本文段落（長文） | `pretty` | 末尾の孤立行のみ防止、本文全体を再計算しない |
| ボタン・CTA・ラベル | `balance` | 短文の見栄え重視 |
| カード説明文 | `pretty` | 長さがまちまちでも末尾だけ整う |

## 実践例

### 見出しと段落の使い分け

```css
:root {
  --content-width: 65ch;
}

article {
  max-width: var(--content-width);
}

article h1,
article h2,
article h3 {
  text-wrap: balance;
}

article p {
  text-wrap: pretty;
}
```

### ヒーローセクション

```html
<section class="hero">
  <h1>ここに長めのキャッチコピーが入ります</h1>
  <p class="lead">サブコピーやリードテキスト。1〜3行程度。</p>
  <a href="#" class="cta">今すぐ始める</a>
</section>
```

```css
.hero h1 {
  font-size: clamp(2.5rem, 6vw, 5rem);
  text-wrap: balance;
  max-width: 20ch;
  margin-inline: auto;
}

.hero .lead {
  text-wrap: pretty;
  max-width: 50ch;
  margin-inline: auto;
}

.hero .cta {
  text-wrap: nowrap;
}
```

### カードリスト

```css
.card {
  display: grid;
  gap: 0.5rem;
}

.card-title {
  text-wrap: balance;
  font-weight: bold;
}

.card-description {
  text-wrap: pretty;
  color: #555;
}
```

## パフォーマンス特性

| 値 | 計算コスト |
|----|-----------|
| `wrap` | 軽量（標準） |
| `nowrap` | 軽量 |
| `balance` | やや重い（複数回試行） |
| `pretty` | 中程度（末尾のみ再計算） |

- `balance` は全行を再評価するため、長い段落に当てるとリフローコストが高い → 6 行制限の理由
- 本文には `pretty` を推奨（必要なところだけ最適化）

## ブラウザサポート

### text-wrap: balance

| ブラウザ | バージョン | 対応時期 |
|----------|-----------|----------|
| Chrome | 114+ | 2023年5月 |
| Edge | 114+ | 2023年5月 |
| Firefox | 121+ | 2023年12月 |
| Safari | 17.5+ | 2024年5月 |

→ **Baseline Newly Available**

### text-wrap: pretty

| ブラウザ | バージョン | 対応時期 |
|----------|-----------|----------|
| Chrome | 117+ | 2023年9月 |
| Edge | 117+ | 2023年9月 |
| Safari | 17.5+ | 2024年5月 |
| Firefox | 未対応 | 検討中 |

→ pretty は Firefox 未対応。フォールバックは通常の `wrap` でデグレード安全。

## フォールバック戦略

未対応ブラウザでは値が無視され、通常の `wrap` 動作になる。CSS 的に安全に劣化するため、特別なフォールバックは不要。

```css
/* 段階的強化 */
.heading {
  /* 全ブラウザのベース */
  line-height: 1.3;
  max-width: 30ch;
}

@supports (text-wrap: balance) {
  .heading {
    text-wrap: balance;
  }
}
```

## 従来の方法との比較

### JavaScript（従来）

```javascript
// Adobe の balance-text、wrap-text などのライブラリ
import balanceText from 'balance-text';
balanceText('.heading');
```

→ DOM 操作・追加スクリプト・ロード時間が必要。

### CSS のみ（推奨）

```css
.heading {
  text-wrap: balance;
}
```

→ 1 行で完結。ブラウザネイティブ最適化。

## アクセシビリティ

- 読み手の認知負荷が軽減（不自然な行末で目が滑らない）
- 翻訳テキストでもブラウザが言語を考慮してバランス計算
- スクリーンリーダーへの影響なし（視覚的整形のみ）

## アンチパターン

```css
/* ❌ 本文全体に balance を当てる（パフォーマンスコスト大、6行超で無効） */
article p {
  text-wrap: balance;
}

/* ✅ 段落は pretty、見出しは balance */
article p {
  text-wrap: pretty;
}
article h2 {
  text-wrap: balance;
}
```

```css
/* ❌ 1行で済む見出しに balance（意味なし、計算コストだけかかる） */
.short-button-label {
  text-wrap: balance;
}

/* ✅ 折り返さない場合は nowrap か無指定 */
.short-button-label {
  text-wrap: nowrap;
}
```

## なぜ優れているか

1. **CSS 1 行で完結** — JavaScript / ライブラリ不要
2. **言語非依存** — 日本語・英語・多バイト文字を区別せず動作
3. **デザイン品質向上** — タイポグラフィの「最後の仕上げ」を自動化
4. **デグレード安全** — 未対応ブラウザでも通常の折り返しになるだけ

## 関連ナレッジ

- [日本語テキストの折り返し制御](./word-wrap-japanese.md) — line-break, auto-phrase, BudouX
- [Fluid Type Scale](./fluid-type-scale.md) — clamp() による可変フォントサイズ
- [Modern CSS 2024](../modern-css-2024.md)

## 参考リソース

- [Zenn: 最近のCSS、全然追えてなかった。ここ1〜2年で使えるようになった機能10選](https://zenn.dev/seekseep/articles/css-new-features-catch-up-2026)
- [MDN: text-wrap](https://developer.mozilla.org/docs/Web/CSS/text-wrap)
- [Chrome Developers: text-wrap: balance](https://developer.chrome.com/blog/css-text-wrap-balance)
