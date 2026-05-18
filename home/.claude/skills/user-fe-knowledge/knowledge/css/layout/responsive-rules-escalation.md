---
title: CSS Responsive Rules - レスポンシブ実装のエスカレーション原則
category: css/layout
tags: [responsive, container-query, clamp, media-query, methodology, guidelines]
browser_support: モダンブラウザ
source: https://gist.github.com/tak-dcxi/acd985cd8b7486a807f1c240731cc7e0
created: 2026-05-18
author: tak-dcxi
---

# CSS Responsive Rules

tak-dcxi 氏によるレスポンシブ実装の判断基準ガイドライン。**「CSS はブラウザへの提案であり厳密な命令ではない」** という原則から、不要なブレイクポイントとコード量を最小化することを目的とする。

## エスカレーション順序

下から順に試し、必要な場合のみ次のレイヤーに上がる：

| 優先度 | 手段 | 用途 |
|---|---|---|
| 1 | Static（固定） | アイコン、バッジなど本質的に固定サイズの要素 |
| 2 | Intrinsic（内在） | `flexbox` / `grid` / `clamp()` による自然な適応 |
| 3 | Container Queries | 親要素サイズに基づく切り替え（コンポーネント単位） |
| 4 | Media Queries | ページ全体のマクロレイアウト変更のみ |

「sp / tablet / pc」のようなデバイス分類のメディアクエリは禁止。サイズ基準で必要な閾値だけを設定する。

## 禁止事項

- **`vw` / `vh` の使用** → 代わりに `svi` / `dvi` / `lvi` / `svb` / `dvb` / `lvb` を使う（モバイルのアドレスバー伸縮に対応）
- **メディアクエリ条件内での `var()` 使用**（仕様上未サポートに近い）
- **デバイスカテゴリ前提のブレイクポイント**（sp/tablet/pc 等の分類）

## 推奨パターン

### Container Queries（dashed ident 必須）

```css
:scope {
  container: --cards / inline-size;
}

@container --cards (inline-size >= calc(420 / 16 * 1rem)) {
  /* レイアウト変更 */
}
```

### Fluid サイジング（clamp）

```css
font-size: clamp(
  14 / 16 * 1rem,
  0.00455 * 100svi + 12.18 / 16 * 1rem,
  18 / 16 * 1rem
);
```

`100svi` を使うのが要。`vw` だとモバイルでスクロールバー込みになるなどの問題が起きる。

## 使いどころ

- 複数の親コンテキストに置かれる再利用コンポーネント → Container Queries
- ページ全体のグリッド構成切替 → Media Queries（最後の手段）
- フォントサイズ / spacing → `clamp()` で連続的に
- 厳密なデザインシステム運用

## 関連知識

- [[fluid-typography-clamp]]: clamp() のフルイドタイポグラフィ
- [[container-style-queries]]: Container Queries の応用
- [[outdated-techniques]]: 古い CSS との比較

## 参考

- [tak-dcxi: CSS Responsive Rules（Gist, 2026-04-30 最終更新）](https://gist.github.com/tak-dcxi/acd985cd8b7486a807f1c240731cc7e0)
