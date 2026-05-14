---
source_url: https://zenn.dev/chot/articles/bb66d5288edd03
title: ::scroll-marker-group と ::scroll-button を活用して Swiper を使ったカルーセルを置き換える試み
author: Yuki Shibata (chot Inc.)
published: 2026-04-13
captured: 2026-05-13
status: inbox
---

# CSS のみで Swiper 風カルーセルを置き換える試み

## 出典
- URL: https://zenn.dev/chot/articles/bb66d5288edd03
- 著者: Yuki Shibata (chot Inc.)
- 公開: 2026-04-13

## 構成パターン（既存ナレッジ補完点）

### スクロールスナップ
```css
.carousel {
  display: flex;
  gap: 30px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
}

.carousel li {
  flex: 0 0 100%;
  scroll-snap-align: center;
}
```

### スクロールボタン (シンプルな < > content)
```css
.carousel::scroll-button(*) {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
}

.carousel::scroll-button(left) {
  content: '＜';
  color: #007aff;
  left: 8px;
}

.carousel::scroll-button(right) {
  content: '＞';
  right: 8px;
}
```

### scroll-marker-group + tabs キーワード
```css
.carousel {
  scroll-marker-group: after tabs;
}

.carousel::scroll-marker-group {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.carousel li::scroll-marker {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
}

.carousel li::scroll-marker:target-current {
  background-color: #007aff;
}
```

## 既存ナレッジとの差分

既存 `carousel-scroll-marker.md` との差分:
- **`:target-current` 疑似クラス** — 現在地のドット表示
  （既存ファイルでは `:checked` を使用 → これは古い情報の可能性）
- **`scroll-marker-group: after tabs;`** — tabs キーワードでキーボード操作有効化
- **content プロパティの動作** — `::scroll-marker` や `::scroll-button` は content が none では生成されない（`::before` / `::after` と同じ仕様）

## ブラウザサポート

| 機能 | ステータス |
|------|-----------|
| scroll-snap-type | ✅ 全主要ブラウザ |
| ::scroll-button() | ⚠️ Chromium 135+ のみ |
| ::scroll-marker-group | ⚠️ Chromium 135+ のみ |
| ::scroll-marker | ⚠️ Chromium 135+ のみ |

Firefox / Safari は未対応のため、本番投入は現時点では難しい状況。

## 制限事項
- 無限ループ: JS 必要
- マウスドラッグ操作: JS 必要（スマホスワイプは対応）
- 既存ナレッジ通り
