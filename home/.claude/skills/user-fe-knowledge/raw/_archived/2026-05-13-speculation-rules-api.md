---
url: https://ics.media/entry/260415/
fetched_at: 2026-05-13
title: Speculation Rules APIでウェブサイトのページ遷移を速くする
---

# Speculation Rules API によるページ遷移高速化

**著者：** 株式会社 ICS 楢山 哲弘

## 主要な技術ポイント

### 1. 何ができるか
ユーザーがリンクをクリックする前に、ブラウザーがバックグラウンドでページをプリレンダリング。クリック時点でレンダリング完了済みのため、遷移待ちがほぼ消える。

### 2. 従来手法との違い
- `<link rel="prefetch">`: HTMLのキャッシュのみ、レンダリングなし
- `<link rel="prerender">`: Chrome以外未対応、後に非推奨化
- **Speculation Rules API**: 「本物のプリレンダリング」、標準化された JSON 構文、JavaScript 実行を含む完全なレンダリング

### 3. 効果測定（事例）
- Ray-Ban: モバイル LCP 4.69秒→2.66秒 (43%短縮)、コンバージョン率2倍、離脱率13%削減
- Monrif: デスクトップ LCP 17.9% 改善、エンゲージメント8.9%向上

## コード例

### 基本実装
```html
<script type="speculationrules">
{
  "prerender": [{
    "where": { "href_matches": "/*" },
    "eagerness": "moderate"
  }]
}
</script>
```

### 特定URLのみ対象
```html
<script type="speculationrules">
{
  "prerender": [{
    "urls": ["/products/", "/about/"]
  }]
}
</script>
```

### 副作用のあるURL除外
```html
<script type="speculationrules">
{
  "prerender": [{
    "where": {
      "and": [
        { "href_matches": "/*" },
        { "not": { "href_matches": "/logout" } },
        { "not": { "href_matches": "/cart/add/*" } },
        { "not": { "selector_matches": "[data-no-prerender]" } }
      ]
    },
    "eagerness": "moderate"
  }]
}
</script>
```

### アナリティクス二重計測対策
```javascript
if (document.prerendering) {
  document.addEventListener("prerenderingchange", () => {
    initAnalytics();
  }, { once: true });
} else {
  initAnalytics();
}
```

### 推奨パターン（prefetch + prerender）
```html
<script type="speculationrules">
{
  "prefetch": [{
    "where": { "href_matches": "/*" },
    "eagerness": "eager"
  }],
  "prerender": [{
    "where": { "href_matches": "/*" },
    "eagerness": "moderate"
  }]
}
</script>
```

## eagerness の選び方

| 値 | タイミング | 用途 |
|---|---------|------|
| `immediate` | ルール検出直後 | 遷移先がほぼ決まっているページ |
| `eager` | 比較的早い段階 | prefetch 向き |
| `moderate` | 200ms ホバー or pointerdown | prerender 推奨 |
| `conservative` | ポインターダウン直前 | 副作用リスクがある場合 |

## 同時先読み上限 (Chromium)

| eagerness | Prefetch | Prerender |
|-----------|----------|-----------|
| `immediate` | 50 | 10 |
| `eager`/`moderate`/`conservative` | 2 (FIFO) | 2 (FIFO) |

## 注意点と対処法
1. **副作用URL除外**: ログアウト、カート追加など、GETで副作用が起きるURLは `not` で除外
2. **アナリティクス対策**: `document.prerendering` と `prerenderingchange` イベントでガード
3. **拡張機能**: uBlock Origin 等で無効化される可能性。プログレッシブエンハンスメント前提で

## ブラウザサポート
- **対応**: Chrome・Edge 109+ (2023年1月)、実運用は 121-122 以降推奨
- **未対応**: Firefox、Safari
- **非対応ブラウザでは単に無視される**ため既存サイトに安全に導入可能

## 優位性
1. クリック時点で JavaScript 実行を含むレンダリングが完了済み
2. MPA で効果が特に大きい
3. 標準化された JSON 構文で保守性が高い
