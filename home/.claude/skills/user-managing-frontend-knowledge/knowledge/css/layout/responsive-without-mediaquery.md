---
title: メディアクエリに依存しないレスポンシブレイアウト
category: css/layout
tags: [responsive, container-query, flexbox, grid, media-query-free, 2025]
browser_support: 全モダンブラウザ対応
created: 2026-01-19
updated: 2026-01-19
---

# メディアクエリに依存しないレスポンシブレイアウト

> 出典: https://css-notes.com/layout/responsive-without-mq/
> 執筆日: 2025年12月20日
> 追加日: 2026-01-19

「ブラウザが自動判断すべきレイアウト決定を、開発者が手動で行っている」という Every Layout の哲学に基づき、メディアクエリを使わずにレスポンシブレイアウトを実現する手法。

## 基本哲学

> "If you find yourself wrestling with CSS layout, you're likely making decisions browsers should make themselves."
> — Every Layout

従来のメディアクエリ方式は、「◯◯px以下なら1カラム」のような**任意のブレークポイント**を開発者が決めていました。しかし、コンテンツやコンテナのサイズに応じて自動調整する方が本質的です。

## 1. Container Query

### 基本コンセプト

**ビューポート幅**ではなく**親コンテナの幅**を基準にすることで、コンポーネントが配置場所に関係なく適切に表示されます。

```css
/* 親要素 */
.container {
  container-type: inline-size;
}

/* 子要素が親の幅に応じて変化 */
@container (width < 600px) {
  .card {
    flex-direction: column;
  }
}

@container (width >= 600px) {
  .card {
    flex-direction: row;
  }
}
```

### メディアクエリとの違い

| 比較項目 | メディアクエリ | Container Query |
|---------|--------------|-----------------|
| 基準 | ビューポート幅 | 親コンテナの幅 |
| 再利用性 | 低い（配置場所に依存） | 高い（どこでも動作） |
| コンポーネント設計 | 困難 | 容易 |

## 2. SideMain レイアウト（Flexbox）

### 基本実装

```css
.side-main {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.side-main > * {
  flex-grow: 999;
  flex-basis: calc((var(--mainW) - 100%) * 999);
}

.side-main > :first-child {
  flex-grow: 1;
  flex-basis: 0%;
}
```

### 動作原理

- `flex-basis: calc((var(--mainW) - 100%) * 999)` がポイント
- コンテナ幅が `--mainW` より小さい → `flex-basis` が負の値 → 1カラムに折り返し
- コンテナ幅が `--mainW` より大きい → `flex-basis` が正の値 → 2カラム維持

### 使用例

```html
<div class="side-main" style="--mainW: 600px">
  <aside>サイドバー</aside>
  <main>メインコンテンツ</main>
</div>
```

**結果**:
- コンテナが 600px 未満 → 縦並び（1カラム）
- コンテナが 600px 以上 → 横並び（2カラム）

## 3. FluidCols レイアウト（Grid）

### 基本実装

```css
.fluid-cols {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(var(--cols), 100%), 1fr)
  );
  gap: 1rem;
}
```

### 動作原理

- `auto-fit`: カラム数を自動調整
- `minmax(min(var(--cols), 100%), 1fr)`:
  - 各カラムの最小幅は `var(--cols)`
  - ただし 100% を超えない（折り返し）
  - 余った空間は `1fr` で均等配分

### 使用例

```html
<div class="fluid-cols" style="--cols: 250px">
  <div>アイテム1</div>
  <div>アイテム2</div>
  <div>アイテム3</div>
  <div>アイテム4</div>
</div>
```

**結果**:
- コンテナが 250px × 4 = 1000px 以上 → 4カラム
- コンテナが 750px〜999px → 3カラム
- コンテナが 500px〜749px → 2カラム
- コンテナが 499px 以下 → 1カラム

## 4. Switcher パターン（Flexbox）

### 基本実装

```css
.switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.switcher > * {
  flex-grow: 1;
  flex-basis: calc((var(--threshold) - 100%) * 9999);
}
```

### 動作原理

- **閾値（threshold）を超えるか否か**で自動切り替え
- `flex-basis` が負の値になると折り返し
- `9999` という大きな係数で急激な切り替えを実現

### 使用例

```html
<div class="switcher" style="--threshold: 500px">
  <div>列1</div>
  <div>列2</div>
</div>
```

**結果**:
- 500px 未満 → 縦並び（1カラム）
- 500px 以上 → 横並び（2カラム）

## 実践的な応用

### カードグリッド

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(300px, 100%), 1fr)
  );
  gap: 2rem;
}
```

### サイドバー付きレイアウト

```css
.layout {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.sidebar {
  flex-grow: 1;
  flex-basis: 0%;
  min-width: 200px;
}

.main {
  flex-grow: 999;
  flex-basis: calc((600px - 100%) * 999);
  min-width: min(100%, 600px);
}
```

## メディアクエリとの使い分け

### メディアクエリが適切な場合

- ページ全体のレイアウト変更（ヘッダー/フッターの構造変更）
- デバイス特有の UI（タッチUI vs マウスUI）
- プリント用スタイル

### Container Query / 自動調整が適切な場合

- コンポーネント単位のレイアウト
- 再利用可能なコンポーネント
- コンテンツ量に応じた調整

## 注意点

### fixed 要素の挙動

```css
.container {
  container-type: inline-size;
}

.fixed-element {
  position: fixed; /* コンテナ内では期待通り動作しない場合がある */
}
```

最近のブラウザでは改善されていますが、`container-type` を持つ要素内の `position: fixed` は、コンテナを基準に配置される可能性があります。

### パフォーマンス

自動調整レイアウトは計算コストが若干高いですが、実用上は問題ありません。大量の要素がある場合は、仮想スクロールなど別の最適化を検討してください。

## ブラウザサポート

| 機能 | Chrome | Firefox | Safari |
|------|--------|---------|--------|
| Container Query | 106+ | 110+ | 16+ |
| Flexbox | ✅ | ✅ | ✅ |
| CSS Grid | ✅ | ✅ | ✅ |
| `min()` / `max()` / `clamp()` | 79+ | 75+ | 13.1+ |

## ユースケース

- ダッシュボードのウィジェット
- ECサイトの商品グリッド
- ブログのカードレイアウト
- サイドバー付きレイアウト
- メディアオブジェクトパターン

## 参考リソース

- [Every Layout](https://every-layout.dev/)
- [MDN: CSS Container Queries](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_container_queries)

---
