---
title: text-box（テキスト上下の余白調整）
category: css/typography
tags: [text-box, typography, line-height, 2025]
browser_support: Chrome 133+, Safari 18.2+
created: 2025-01-16
updated: 2025-01-16
---

# text-box（テキスト上下の余白調整）

> 出典: https://ics.media/entry/250319/
> 執筆日: 2025-03-19
> 追加日: 2025-12-17

テキスト要素の上下に生じる余分なスペース（ハーフ・レディング）を調整するプロパティ。2024年末〜2025年初頭に主要ブラウザでサポート。

## ハーフ・レディングとは

`line-height` 指定時、フォントサイズより行全体が大きくなると余分なスペースが発生。

```
例: font-size: 60px, line-height: 2 の場合
行の高さ: 120px
レディング: 120px - 60px = 60px
ハーフ・レディング: 60px ÷ 2 = 30px（上下それぞれに追加）
```

この余白がデザイン上の「ズレ」の原因になる。

## プロパティ

### text-box-trim: どこをトリムするか

| 値 | 説明 |
|----|------|
| `none` | 初期値（トリムしない） |
| `trim-both` | 上下両方をトリム |
| `trim-start` | 上側のみトリム |
| `trim-end` | 下側のみトリム |

### text-box-edge: トリムの基準線

| 値 | 説明 |
|----|------|
| `text` | フォントのアセンダー/ディセンダーライン基準 |
| `cap` | 英大文字の上限を基準 |
| `alphabetic` | 英小文字の下限（ベースライン）を基準 |
| `ex` | 英小文字 x の高さを基準 |

## ショートハンド構文

```css
/* text-box: <trim値> <上の基準> <下の基準> */
.text {
  text-box: trim-both cap alphabetic;
}

/* 上下同じ基準の場合は1つでOK */
.text {
  text-box: trim-both text;
}
```

## 実用例

### 背景付きラベルのテキスト中央揃え

```css
/* 従来: テキストが数px下にずれる */
.label {
  padding: 8px 16px;
  background: #333;
  color: white;
}

/* text-box使用: 上下均等に配置 */
.label {
  padding: 8px 16px;
  background: #333;
  color: white;
  text-box: trim-both cap alphabetic;
}
```

### アイコン + テキストの垂直中央揃え

```css
.button {
  display: flex;
  align-items: center;
  gap: 8px;
}

.button-text {
  text-box: trim-both cap alphabetic;
}
```

### 見出しの上下余白を詰める

```css
h1 {
  font-size: 3rem;
  line-height: 1.2;
  text-box: trim-both cap alphabetic;
  margin-block: 0;
}
```

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 133+（2025年2月） |
| Safari | 18.2+（2024年12月） |
| Firefox | ❌ 未対応 |

## プログレッシブエンハンスメント

```css
.label {
  padding: 12px 16px; /* フォールバック: 余裕を持たせる */
}

@supports (text-box: trim-both cap alphabetic) {
  .label {
    padding: 8px 16px;
    text-box: trim-both cap alphabetic;
  }
}
```

## 注意点

- **フォントによる差異**: フォントごとにメトリクスが異なるため、見え方が変わる場合がある
- **日本語フォント**: Noto Sans Japanese 等では完全な統一が困難なケースも
- **継承**: 子要素にも影響するため、必要な箇所のみに適用

## ユースケース

- タグ/ラベルのテキスト中央配置
- アイコンとテキストの垂直揃え
- 見出しの余白最適化
- ボタン内テキストの位置調整
- カード内の要素配置

## 関連ナレッジ

- [line-height 設定](./line-height.md)
- [Typography ベストプラクティス](./typography-best-practices.md)
