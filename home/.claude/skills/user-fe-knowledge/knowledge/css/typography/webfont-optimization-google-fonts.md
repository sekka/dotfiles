---
title: Google Fonts で Webフォント最適化（LINE Seed JP）
category: css/typography
tags: [webfont, performance, google-fonts, font-display, preconnect, unicode-range]
browser_support: すべてのモダンブラウザ
created: 2026-01-31
updated: 2026-01-31
source: https://techblog.lycorp.co.jp/ja/20260123a
---

# Google Fonts で Webフォント最適化

## 概要

Google Fonts に LINE Seed JP フォントが登録され、パフォーマンス最適化の手法が紹介されました。大容量フォント（4ウェイト合計10MB超）を高速に配信するための実践的なテクニックをまとめます。

---

## パフォーマンス最適化手法

### 1. preconnect による接続高速化

Google Fonts のドメインへの事前接続により、100-500ms の高速化が可能です。

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

**効果:**
- DNS ルックアップ時間の削減
- TCP/TLS ハンドシェイク時間の削減
- フォント読み込み開始までの待機時間短縮

### 2. font-display: swap で FOIT 回避

```css
@font-face {
  font-family: 'LINE Seed JP';
  font-display: swap;
  src: url(...) format('woff2');
}
```

**挙動:**
- システムフォントで即座にテキスト表示
- Webフォント読み込み完了後に置き換え
- FOIT（Flash of Invisible Text）を回避

### 3. 必要な weight の厳選

```html
<!-- NG: すべてのウェイトを読み込み（10MB超） -->
<link href="https://fonts.googleapis.com/css2?family=LINE+Seed+JP:wght@100;400;700;900&display=swap" rel="stylesheet">

<!-- OK: 必要なウェイトのみ -->
<link href="https://fonts.googleapis.com/css2?family=LINE+Seed+JP:wght@400;700&display=swap" rel="stylesheet">
```

**推奨:**
- 本文: Regular (400)
- 見出し: Bold (700)
- 最小限の組み合わせで運用

---

## Dynamic Subsetting（自動分割）

Google Fonts は、unicode-range を使用してフォントファイルを自動的に分割配信します。

### unicode-range の仕組み

```css
@font-face {
  font-family: 'LINE Seed JP';
  font-weight: 400;
  src: url(/fonts/LINESeedJP_OTF_Rg.woff2) format('woff2');
  unicode-range: U+3041-3096, U+309D-309F;  /* ひらがな */
}

@font-face {
  font-family: 'LINE Seed JP';
  font-weight: 400;
  src: url(/fonts/LINESeedJP_OTF_Rg_Katakana.woff2) format('woff2');
  unicode-range: U+30A0-30FF;  /* カタカナ */
}

@font-face {
  font-family: 'LINE Seed JP';
  font-weight: 400;
  src: url(/fonts/LINESeedJP_OTF_Rg_Kanji.woff2) format('woff2');
  unicode-range: U+4E00-9FFF;  /* 漢字 */
}
```

**利点:**
- ページで使用されている文字のみダウンロード
- 初期読み込み時間の大幅削減
- ブラウザが自動的に必要なサブセットを判断

---

## text パラメータによる特定文字配信

特定の文字だけを使用する場合、`text` パラメータで配信量を最小化できます。

```html
<!-- ロゴで "LINE" のみ使用 -->
<link href="https://fonts.googleapis.com/css2?family=LINE+Seed+JP&text=LINE&display=swap" rel="stylesheet">
```

**ユースケース:**
- ロゴ表示
- 固定テキストの見出し
- 数字のみの表示（カウンター、価格表示）

**例（数字のみ）:**
```html
<link href="https://fonts.googleapis.com/css2?family=LINE+Seed+JP&text=0123456789&display=swap" rel="stylesheet">
```

---

## Google Fonts への登録プロセス

フォントを Google Fonts に登録するには、以下の条件を満たす必要があります：

1. **オープンライセンス**: OFL（Open Font License）などのオープンソースライセンス
2. **フォント品質**: グリフの品質、メトリクスの正確性
3. **提出プロセス**: GitHub リポジトリ経由で提出
4. **審査期間**: 数週間〜数ヶ月

**LINE Seed JP の場合:**
- ライセンス: SIL Open Font License 1.1
- 提供ウェイト: Thin (100), Regular (400), Bold (700), ExtraBold (900)

---

## 実装例（完全版）

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- 事前接続 -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- フォント読み込み（必要なウェイトのみ） -->
  <link href="https://fonts.googleapis.com/css2?family=LINE+Seed+JP:wght@400;700&display=swap" rel="stylesheet">

  <style>
    body {
      font-family: 'LINE Seed JP', sans-serif;
      font-weight: 400;
    }

    h1, h2, h3 {
      font-weight: 700;
    }
  </style>
</head>
<body>
  <h1>見出し（Bold）</h1>
  <p>本文テキスト（Regular）</p>
</body>
</html>
```

---

## パフォーマンスチェックリスト

実装時に確認すべき項目：

- [ ] preconnect を設定した
- [ ] font-display: swap を使用した
- [ ] 必要最小限のウェイトのみ読み込み
- [ ] unicode-range による自動分割を活用
- [ ] 特定文字のみの場合は text パラメータを使用
- [ ] Lighthouse でフォント読み込み時間を測定
- [ ] WebPageTest で実環境のパフォーマンスを確認

---

## 参考資料

- [Google Fonts 公式サイト](https://fonts.google.com/)
- [LINE Seed JP - Google Fonts](https://fonts.google.com/specimen/LINE+Seed+JP)
- [Web Fonts Best Practices](https://web.dev/font-best-practices/)
- [font-display: swap - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display)

---

## 関連ナレッジ

- [Fluid Type Scale](./fluid-type-scale.md) - レスポンシブタイポグラフィ
- [Core Web Vitals 最適化](../../cross-cutting/performance/lcp-optimization.md) - LCP 改善
- [パフォーマンス最適化](../../cross-cutting/performance/) - 全般的な最適化手法
