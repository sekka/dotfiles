---
title: text-autospace（日本語と英語の自動スペーシング）
category: css/typography
tags: [text-autospace, spacing, japanese, latin, multilingual, 2025]
browser_support: Safari 18.4+, Chrome 123+
created: 2026-01-19
updated: 2026-01-19
---

# text-autospace（日本語と英語の自動スペーシング）

> 出典: https://speakerdeck.com/clockmaker/the-latest-css-for-ui-design-2025
> リリース: Safari 18.4（2025年3月）、Chrome 123+
> 追加日: 2026-01-19

日本語（CJK）とラテン文字（英語など）が混在するテキストで、文字間のスペーシングを自動的に管理する CSS プロパティ。従来は手動で半角スペースを入れていた箇所を CSS で自動化できます。

## 基本概念

### 問題点

日本語と英語が混在するテキストでは、読みやすさのために文字間にスペースを入れる慣習があります。

```html
<!-- 従来の手動スペース挿入 -->
<p>この記事は HTML と CSS について解説します。</p>
<!--            ↑    ↑   ↑    ↑ 手動で半角スペースを入れる -->
```

**問題**:
- HTML 内にスペースを手動で入れる必要がある
- 動的コンテンツでの対応が困難
- メンテナンスコストが高い

### 解決策

`text-autospace` プロパティで自動的にスペーシングを挿入します。

```css
.text {
  text-autospace: normal;
}
```

```html
<!-- スペース不要、CSS が自動挿入 -->
<p class="text">この記事はHTMLとCSSについて解説します。</p>
```

## 構文

```css
text-autospace: <value>;
```

### 値

| 値 | 説明 |
|----|------|
| `normal` | CJK とラテン文字の間に自動的にスペースを挿入（デフォルト） |
| `no-autospace` | 自動スペーシングを無効化 |
| `auto` | ブラウザが決定（通常は `normal` と同じ） |

## 実装例

### 基本的な使用

```css
body {
  text-autospace: normal;
}
```

```html
<p>JavaScriptで作られたWebアプリケーション</p>
<!-- 表示: JavaScript で作られた Web アプリケーション -->
```

### 特定の要素で無効化

```css
/* グローバルに有効化 */
body {
  text-autospace: normal;
}

/* コードブロックでは無効化 */
code, pre {
  text-autospace: no-autospace;
}
```

### 見出しでの使用

```css
h1, h2, h3 {
  text-autospace: normal;
}
```

```html
<h1>HTML5とCSS3の基礎</h1>
<!-- 表示: HTML5 と CSS3 の基礎 -->
```

## 実用パターン

### パターン1: サイト全体で有効化

```css
:root {
  text-autospace: normal;
}

/* コードやURL では無効化 */
code,
pre,
kbd,
samp,
.url {
  text-autospace: no-autospace;
}
```

### パターン2: 本文のみ有効化

```css
article p {
  text-autospace: normal;
}
```

### パターン3: 動的コンテンツ

```html
<div class="blog-post">
  <h2 id="title"></h2>
  <div id="content"></div>
</div>
```

```css
.blog-post {
  text-autospace: normal;
}
```

```javascript
// JavaScript で動的にコンテンツを挿入
document.getElementById('title').textContent = 'ReactとVueの比較';
document.getElementById('content').textContent = '...'

// CSS が自動的にスペーシングを処理
```

## ユースケース

### 1. ブログ記事

```css
article {
  text-autospace: normal;
}

article h1,
article h2,
article h3 {
  text-autospace: normal;
}

article p {
  text-autospace: normal;
}
```

### 2. UIコンポーネント

```css
/* ボタンテキスト */
button {
  text-autospace: normal;
}

/* ナビゲーション */
nav a {
  text-autospace: normal;
}

/* カード */
.card__title,
.card__description {
  text-autospace: normal;
}
```

### 3. フォームラベル

```css
label {
  text-autospace: normal;
}
```

```html
<label for="email">Emailアドレス</label>
<!-- 表示: Email アドレス -->
```

### 4. エラーメッセージ

```css
.error-message {
  text-autospace: normal;
}
```

```html
<p class="error-message">HTTPエラーが発生しました</p>
<!-- 表示: HTTP エラーが発生しました -->
```

## 詳細な動作

### スペースが挿入される箇所

**CJK（中国語・日本語・韓国語）とラテン文字の間**:

```html
<!-- スペースが挿入される -->
日本語English
→ 日本語 English

HTML要素
→ HTML 要素

2024年version
→ 2024年 version
```

**CJK と数字の間**:

```html
<!-- ブラウザ実装により異なる可能性 -->
2024年
→ 2024 年（スペースが入る場合もある）
```

### スペースが挿入されない箇所

**句読点の前後**:

```html
<!-- 句読点の前後にはスペースを入れない -->
これは、HTMLです。
→ これは、HTML です。（「、」の後にはスペースなし）
```

**括弧内**:

```html
<!-- 括弧内部では通常通り -->
(HTMLとCSS)
→ (HTML と CSS)
```

## ブラウザサポート

| ブラウザ | バージョン | リリース日 |
|---------|----------|----------|
| Safari | 18.4+ | 2025年3月 |
| Chrome | 123+ | 2025年3月 |
| Edge | 123+ | 2025年3月（Chromium ベース） |
| Firefox | 未対応 | 検討中 |

### フォールバック

```css
/* フォールバック: 手動スペース */
.text {
  /* Firefox など未対応ブラウザ用に HTML 内にスペースを残す */
}

/* 対応ブラウザ */
@supports (text-autospace: normal) {
  .text {
    text-autospace: normal;
  }
}
```

### 機能検出

```javascript
if (CSS.supports('text-autospace', 'normal')) {
  console.log('text-autospace をサポートしています');
  // HTML からスペースを削除するなどの処理
}
```

## 注意点とベストプラクティス

### 1. パフォーマンス

`text-autospace` は計算コストが若干かかるため、大量のテキストがある場合は必要な要素のみに適用します。

```css
/* ❌ すべての要素に適用（過剰） */
* {
  text-autospace: normal;
}

/* ✅ 必要な要素のみ */
article,
.content,
.description {
  text-autospace: normal;
}
```

### 2. コードブロックでの無効化

プログラミングコードでは自動スペーシングが不要なため、明示的に無効化します。

```css
code,
pre,
kbd,
samp {
  text-autospace: no-autospace;
}
```

### 3. 既存コンテンツとの互換性

既存の HTML に手動スペースが含まれている場合、二重にスペースが入る可能性があります。

```html
<!-- 既存コンテンツ（手動スペースあり） -->
<p>この記事は HTML と CSS について解説します。</p>

<!-- text-autospace: normal を適用すると -->
<!-- 表示: この記事は HTML  と CSS  について解説します。 -->
<!--                     ↑↑     ↑↑ 二重スペース -->
```

**対策**:
- 新規コンテンツから適用
- 既存コンテンツは段階的に手動スペースを削除

### 4. 言語指定との組み合わせ

```html
<html lang="ja">
<head>
  <style>
    :lang(ja) {
      text-autospace: normal;
    }
  </style>
</head>
<body>
  <p>日本語とEnglishの混在</p>
</body>
</html>
```

## 比較：手動 vs 自動

| 項目 | 手動スペース | text-autospace |
|------|-------------|----------------|
| HTML の可読性 | 低い（スペースが散在） | 高い（クリーン） |
| メンテナンス | 困難 | 容易 |
| 動的コンテンツ | 対応困難 | 自動対応 |
| ブラウザサポート | 全ブラウザ | Safari 18.4+, Chrome 123+ |
| パフォーマンス | 影響なし | 若干のコスト |

## 実装チェックリスト

- [ ] サイト全体または特定セクションで `text-autospace: normal` を適用
- [ ] コードブロック（`<code>`, `<pre>`）で `text-autospace: no-autospace` を設定
- [ ] 既存の手動スペースとの競合を確認
- [ ] 未対応ブラウザ（Firefox）でのフォールバックを検討
- [ ] パフォーマンステスト（大量テキストの場合）

## 関連機能

### letter-spacing との違い

```css
/* letter-spacing: すべての文字間 */
.text {
  letter-spacing: 0.05em;
}

/* text-autospace: CJK とラテン文字の間のみ */
.text {
  text-autospace: normal;
}
```

### word-spacing との違い

```css
/* word-spacing: 単語間（スペース区切り） */
.text {
  word-spacing: 0.5em;
}

/* text-autospace: CJK/ラテン文字の境界 */
.text {
  text-autospace: normal;
}
```

## まとめ

### 利点

✅ HTML がクリーンになる（手動スペース不要）
✅ 動的コンテンツに自動対応
✅ メンテナンス性向上
✅ 一貫したスペーシング

### 制限

❌ Firefox 未対応（2026年1月時点）
❌ 若干のパフォーマンスコスト
❌ 既存コンテンツとの互換性に注意

### 推奨される使い方

2025年3月以降、Safari と Chrome で利用可能になったため、新規プロジェクトでは積極的に採用を推奨します。既存プロジェクトでは、Firefox のサポート状況を見ながら段階的に導入するのが良いでしょう。

## 参考リソース

- [CSS Text Module Level 4: text-autospace](https://drafts.csswg.org/css-text-4/#text-autospace-property)
- [MDN: text-autospace](https://developer.mozilla.org/en-US/docs/Web/CSS/text-autospace)
- [Can I use: text-autospace](https://caniuse.com/mdn-css_properties_text-autospace)

---
