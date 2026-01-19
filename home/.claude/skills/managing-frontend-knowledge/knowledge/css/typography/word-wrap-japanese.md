---
title: 日本語テキストの折り返し制御
category: css/typography
tags: [word-break, overflow-wrap, line-break, auto-phrase, japanese, budoux, text-wrapping]
browser_support: overflow-wrap:anywhere (Chrome 80+, Firefox 65+, Safari 15.4+), auto-phrase (Chrome 119+, Edge 119+)
created: 2026-01-19
updated: 2026-01-19
---

# 日本語テキストの折り返し制御

> 出典: https://ics.media/entry/241105/
> 執筆日: 2024年11月6日
> 追加日: 2026-01-19

> 出典: https://ics.media/entry/240411/
> 執筆日: 2024年4月11日（2026年1月8日更新）
> 追加日: 2026-01-19

## 概要

日本語テキストのWeb表示において、適切な位置で改行を制御する技術をまとめました。レスポンシブデザインでは画面サイズにより予測できない改行が発生するため、文節単位での折り返しやURLの長文対応など、複数のアプローチが必要です。

## 基本推奨設定

まず、body要素に以下のCSSを適用することで、長いURLや英単語によるレイアウト崩れを防ぎます。

```css
body {
  overflow-wrap: anywhere;
  word-break: normal;
  line-break: strict;
}
```

### 各プロパティの役割

#### 1. overflow-wrap: anywhere

テキストがコンテナ幅を超える際、どこでも折り返しを許可します。

```css
.container {
  overflow-wrap: anywhere; /* 推奨 */
  /* word-wrap: break-word; 古い書き方（非推奨） */
}
```

**ブラウザサポート:**
- Chrome 80+ (2020年)
- Firefox 65+ (2019年)
- Safari 15.4+ (2022年)

#### 2. word-break: normal

単語の分割ルールを指定します。一般用途では`normal`が推奨されます。

```css
.text {
  word-break: normal; /* 推奨 */
  /* word-break: break-all; すべての文字間で分割可能 */
  /* word-break: keep-all; CJK文字も単語として扱う */
}
```

#### 3. line-break: strict

日本語タイポグラフィの禁則処理ルールを管理します。

```css
.japanese-text {
  line-break: strict; /* 厳密な禁則処理 */
}
```

**ブラウザサポート:**
- Chrome 25+ (2013年)
- Safari 8+ (2014年)

#### 4. hyphens: auto (オプション)

対応ブラウザでは自動ハイフネーションを有効化します。

```css
.english-text {
  hyphens: auto;
}
```

## 文節での折り返し制御

### 方法1: `<br />` タグ + メディアクエリ

デバイスサイズごとに強制改行を挿入する方法です。

```html
<p>
  CSSで文節の折り返しを！<br class="sp" />
  br・wbrとauto-phraseの活用術
</p>

<style>
  .sp {
    display: none;
  }

  @media (max-width: 768px) {
    .sp {
      display: block;
    }
  }
</style>
```

### 方法2: `<wbr />` タグ + CSS組み合わせ

条件付き改行候補地点を指定する方法です。

```html
<p class="text">
  CSSで文節の折り返しを！<wbr />
  br・wbrとauto-phraseの活用術
</p>

<style>
  .text {
    word-break: keep-all;
    overflow-wrap: anywhere;
  }
</style>
```

### 方法3: display: inline-block

フレーズをグループ化して内部での改行を防ぎます。

```html
<p>
  <span class="phrase">CSSで文節の折り返しを！</span>
  <span class="phrase">br・wbrとauto-phraseの活用術</span>
</p>

<style>
  .phrase {
    display: inline-block;
  }
</style>
```

### 方法4: word-break: auto-phrase (最新)

機械学習を使用した自動的な文節折り返しを実現します。

```html
<html lang="ja">
  <style>
    .example {
      word-break: auto-phrase;
    }
  </style>
  <p class="example">
    CSSで文節の折り返しを！br・wbrとauto-phraseの活用術
  </p>
</html>
```

**重要:** `lang="ja"` 属性が必須です。

**ブラウザサポート:**
- Chrome 119+ (2023年10月)
- Edge 119+ (2023年10月)
- Safari Technology Preview 206+ (Feature Flagsで有効化)

### 方法5: BudouX (クロスブラウザ対応)

JavaScriptライブラリを使用した、全ブラウザ対応のソリューションです。

```html
<script type="module">
  import { loadDefaultJapaneseParser } from 'https://cdn.jsdelivr.net/npm/budoux/+esm';

  const parser = loadDefaultJapaneseParser();
  const element = document.querySelector('.budoux-text');
  parser.applyElement(element);
</script>

<p class="budoux-text">
  CSSで文節の折り返しを！br・wbrとauto-phraseの活用術
</p>
```

BudouXは、Chrome/Edge/Firefox/Safariなど全モダンブラウザで動作します。

## ベストプラクティス

1. **基本設定を適用:** body要素に`overflow-wrap: anywhere`、`word-break: normal`、`line-break: strict`を設定
2. **長いURL対策:** 上記の基本設定により自動的に対応
3. **文節折り返し:** 対応ブラウザでは`word-break: auto-phrase`、それ以外はBudouXを使用
4. **デバイス固有の改行:** `<br />`とメディアクエリの組み合わせ
5. **条件付き改行:** `<wbr />`タグで候補地点を指定

## 注意事項

- `word-wrap`は古い書き方のため、`overflow-wrap`を使用してください
- `word-break: auto-phrase`は`lang="ja"`属性がないと動作しません
- Safari等の未対応ブラウザでは、BudouXによるフォールバックを検討してください
- 禁則処理は`line-break: strict`により厳密に適用されます

## 参考リンク

- [word-break - MDN](https://developer.mozilla.org/ja/docs/Web/CSS/word-break)
- [overflow-wrap - MDN](https://developer.mozilla.org/ja/docs/Web/CSS/overflow-wrap)
- [BudouX - GitHub](https://github.com/google/budoux)
