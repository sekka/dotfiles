---
title: hgroup要素による主題と副題のマークアップ
category: html
tags: [hgroup, heading, subheading, semantic, accessibility, 2023]
browser_support: 全モダンブラウザ
created: 2026-01-19
updated: 2026-01-19
---

# hgroup要素による主題と副題のマークアップ

> 出典: https://www.tak-dcxi.com/article/use-hgroup-for-marking-up-the-main-heading-and-subheading
> 執筆日: 2025年
> 追加日: 2026-01-19

HTMLで主題と副題を適切にマークアップする方法。`hgroup`要素の歴史的背景と現在の正しい使い方を解説します。

## hgroup要素の変遷

- **2009年** - HTML5に導入
- **2013年** - HTML仕様から削除
- **2022年** - 仕様が大幅に改定され復活
- **2023年8月** - `role`が「generic」から「group」に変更され、セマンティック意味を獲得

アウトラインアルゴリズムの廃止に伴い、`hgroup`は実用的な要素になりました。

## 推奨されるマークアップ

```html
<hgroup>
  <h1>主題のテキスト</h1>
  <p>副題のテキスト</p>
</hgroup>
```

**ポイント**:
- 主題は見出し要素（`h1`〜`h6`）
- 副題は`p`要素を使用
- 複数の見出し要素を含めることは**現在の仕様では違反**

## 実装例

### ブログタイトルとサブタイトル

```html
<header>
  <hgroup>
    <h1>Web技術ブログ</h1>
    <p>フロントエンド開発の最新情報</p>
  </hgroup>
</header>
```

### 記事見出しと説明文

```html
<article>
  <hgroup>
    <h2>CSS Gridの基礎</h2>
    <p>レイアウトを自在に操るための完全ガイド</p>
  </hgroup>
  <p>記事本文...</p>
</article>
```

### 日本語と英語の併記

```html
<hgroup>
  <h1>ユーザビリティ</h1>
  <p lang="en" translate="no">Usability</p>
</hgroup>
```

**ポイント**:
- `translate="no"` で機械翻訳を防ぐ
- `lang` 属性で言語を明示

### 副題を前後に配置

```html
<hgroup>
  <p>第1章</p>
  <h2>HTMLの基礎</h2>
  <p>Webページの構造を理解する</p>
</hgroup>
```

## 非推奨な方法

### ❌ h1内にspanで副題を含める

```html
<!-- 非推奨 -->
<h1>
  主題のテキスト
  <span class="subtitle">副題のテキスト</span>
</h1>
```

**問題点**:
- 主題と副題をスタイリングでしか区別できない
- セマンティックに分離されていない

### ❌ 複数の見出し要素をhgroup内に入れる

```html
<!-- 非推奨（現在の仕様では違反） -->
<hgroup>
  <h1>主題</h1>
  <h2>副題</h2>
</hgroup>
```

**問題点**:
- 2022年の仕様改定で複数の見出しは禁止
- 副題には`p`要素を使用する

### ❌ small要素の使用

```html
<!-- 非推奨 -->
<h1>
  主題
  <small>副題</small>
</h1>
```

**問題点**:
- HTML仕様で「副題には`hgroup`を使用すること」と明記
- `small`は細目や注釈用

### ❌ role="doc-subtitle"の使用

```html
<!-- 非推奨 -->
<hgroup>
  <h1>主題</h1>
  <p role="doc-subtitle">副題</p>
</hgroup>
```

**問題点**:
- Voice Overで「heading level 2」と誤って読み上げられる
- 不要なARIAロールの追加

### ❌ content:attr()で疑似要素から出力

```html
<h1 data-subtitle="副題">主題</h1>
```

```css
h1::after {
  content: attr(data-subtitle);
}
```

**問題点**:
- 疑似要素のコンテンツはスクリーンリーダーで読み上げられない場合がある
- HTMLに含めるべき

## 他の方法との比較

### 見出し内に副題を含める方法

```html
<h1>
  主題
  <span class="subtitle">副題</span>
</h1>
```

**利点**:
- 副題も見出しジャンプで認識される

**欠点**:
- スタイリングでしか主題と副題を区別できない
- セマンティックな分離がない

### hgroupを使う方法（推奨）

```html
<hgroup>
  <h1>主題</h1>
  <p>副題</p>
</hgroup>
```

**利点**:
- 主題と副題が明確に区別される
- セマンティックなマークアップ
- スクリーンリーダー対応

**欠点**:
- 副題は見出しジャンプの対象外

## スタイリング例

```css
hgroup {
  margin-block-end: 2rem;
}

hgroup h1 {
  margin-block-end: 0.5rem;
  font-size: 2rem;
  font-weight: bold;
}

hgroup p {
  font-size: 1.2rem;
  color: var(--text-secondary);
  font-weight: normal;
}
```

## アクセシビリティ考慮事項

### 1. aria-hiddenの慎重な使用

視覚的に表示されているテキストは読み上げられるべきです。

```html
<!-- ❌ 非推奨 -->
<hgroup>
  <h1>主題</h1>
  <p aria-hidden="true">副題</p>
</hgroup>

<!-- ✅ 推奨 -->
<hgroup>
  <h1>主題</h1>
  <p>副題</p>
</hgroup>
```

### 2. translate属性の活用

機械翻訳を防ぎたい場合に使用します。

```html
<hgroup>
  <h1>会社名</h1>
  <p translate="no">Company Name Inc.</p>
</hgroup>
```

### 3. 言語の明示

複数言語を併記する場合、`lang`属性で明示します。

```html
<hgroup>
  <h1 lang="ja">東京</h1>
  <p lang="en">Tokyo</p>
</hgroup>
```

## 支援技術の対応

現代的なブラウザとスクリーンリーダーでは適切にサポートされています：

- **JAWS** - hgroupを「group」として認識
- **NVDA** - hgroupの内容を適切に読み上げ
- **Voice Over** - hgroupを「group」として認識

ただし、`role="doc-subtitle"`は避けるべきです（誤った読み上げの原因）。

## ブラウザ対応

| ブラウザ | 対応状況 |
|---------|---------|
| Chrome | ○ |
| Edge | ○ |
| Firefox | ○ |
| Safari | ○ |

全モダンブラウザで対応しています。

## ユースケース

- ブログタイトルとサブタイトル
- 記事見出しと説明文
- 同じ意味の日本語+英語表記
- 章番号と章タイトルの組み合わせ
- イベント名と日程の併記

## 関連ナレッジ

- [モダンHTML](./modern-html.md)
- [セマンティックHTML](../cross-cutting/html-css-techniques.md)
- [WAI-ARIA基礎](../cross-cutting/accessibility/wai-aria-basics.md)

## 参考リンク

- [WHATWG HTML Standard: hgroup](https://html.spec.whatwg.org/multipage/sections.html#the-hgroup-element)
- [MDN: <hgroup>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/hgroup)
- [HTML 5.2: The hgroup element](https://www.w3.org/TR/html52/sections.html#the-hgroup-element)
