---
title: ビューポート単位の比較（vh, dvh, lvh, svh）
category: css/values
tags: [viewport, units, mobile, responsive, dvh, svh]
browser_support: 90%以上（svhが最も推奨）
created: 2026-01-31
updated: 2026-01-31
---

## ビューポート単位の比較

> 出典: https://webdesign.tutsplus.com/learn-these-viewport-relative-css-units-100vh-100dvh-100lvh-100svh--cms-108537t
> 執筆日: 2024-03-05（更新: 2024-09-16）
> 追加日: 2026-01-31

モバイルブラウザのアドレスバーの動的な展開・縮小を考慮したビューポート単位の使い分け。

### 4つのビューポート単位

| 単位 | 正式名称 | 説明 |
|------|---------|------|
| **vh** | Viewport Height | 従来のビューポート高さ（非推奨） |
| **dvh** | Dynamic Viewport Height | 動的ビューポート高さ |
| **lvh** | Large Viewport Height | 大きなビューポート高さ |
| **svh** | Small Viewport Height | 小さなビューポート高さ（**推奨**） |

### 各単位の動作比較

| 単位 | デスクトップ | モバイル初期表示 | スクロール時（アドレスバー縮小） | 推奨度 |
|------|------------|---------------|----------------------------|--------|
| **vh** | 適切に機能 | 完全に見えない | アドレスバー縮小後に表示 | ❌ 非推奨 |
| **dvh** | 同等 | 全体表示 | スクロール時に高さ変更 | △ 特定用途 |
| **lvh** | 同等 | 完全に見えない | vh同様 | ❌ 非推奨 |
| **svh** | 同等 | 常に全体表示 | 常に可視 | ✅ **推奨** |

### モバイルでの問題

モバイルブラウザのアドレスバーが動的に展開・縮小するため、ビューポートの高さが変化します。

```
初期表示（アドレスバー展開）
┌─────────────────┐
│   アドレスバー   │ ← 展開状態
├─────────────────┤
│                 │
│   コンテンツ    │ ← vh: はみ出して見えない
│                 │ ← svh: 常に見える
│                 │
└─────────────────┘

スクロール後（アドレスバー縮小）
┌─────────────────┐
│                 │
│                 │
│   コンテンツ    │ ← vh: 見えるようになる
│                 │ ← svh: 常に見える
│                 │
└─────────────────┘
│   ナビゲーション │ ← 縮小状態
```

### 推奨: svh を使用

**100svh** はアドレスバーが展開している状態を基準とするため、常にコンテンツが見えます。

```css
.hero {
  height: 100svh; /* 推奨 */
}
```

### フォールバック付き実装

非対応ブラウザのためのフォールバック。

```css
.hero {
  height: 100vh; /* フォールバック */
  height: 100svh; /* 対応ブラウザ */
}
```

### 実践例1: フルスクリーンヒーロー

```css
.hero {
  /* 常に全画面表示（アドレスバー展開時も見える） */
  height: 100vh; /* フォールバック */
  height: 100svh; /* モバイル対応 */

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
```

### 実践例2: CTA配置

```css
.page-container {
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
}

.cta-button {
  /* ページ下部に固定（常に見える） */
  margin-top: auto;
  padding: 16px;
}
```

### 実践例3: モーダル全画面

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh; /* フォールバック */
  height: 100svh; /* モバイル対応 */

  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### dvh の使用場面（特殊ケース）

**dvh** はスクロールに応じて高さが変化します。これが望ましい場合のみ使用。

```css
/* スクロールでサイズ変化するヘッダー */
.dynamic-header {
  height: 10dvh;
  transition: height 0.3s;
}
```

**注意**: ほとんどの場合は **svh** を使用すべきです。

### lvh の使用（非推奨）

**lvh** は vh と同じ挙動で、モバイルでコンテンツが見えなくなります。

```css
/* ❌ 非推奨: モバイルで見えない */
.hero {
  height: 100lvh;
}
```

### vw（幅）は問題なし

ビューポート幅（vw）はアドレスバーの影響を受けません。

```css
/* 幅は vw で問題なし */
.container {
  width: 100vw;
  max-width: 1200px;
}
```

### dvw, lvw, svw も存在

幅方向にも対応する単位がありますが、実用性は低いです。

```css
.element {
  width: 100svw; /* Small Viewport Width */
}
```

### ブラウザサポート

- **90%以上のブラウザでサポート**（2024年時点）
- Chrome 108+
- Firefox 101+
- Safari 15.4+
- Edge 108+

### calc() との組み合わせ

```css
.section {
  /* ヘッダー分を引いた高さ */
  height: calc(100svh - 60px);
}

.full-viewport {
  /* 複数セクションの合計を100svhに */
  height: calc(100svh / 3);
}
```

### Grid/Flexbox との組み合わせ

```css
.app-layout {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  min-height: 100svh;
}

.main-content {
  /* 残りの高さを自動で占める */
  overflow-y: auto;
}
```

### デバッグ方法

開発者ツールでビューポート単位を確認。

```css
/* 開発時の可視化 */
[data-debug] .hero {
  outline: 2px solid red;
  position: relative;
}

[data-debug] .hero::after {
  content: 'svh: ' attr(data-height);
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  font-size: 12px;
}
```

### よくある間違い

#### 間違い: 固定pxでの高さ指定

```css
/* ❌ デバイスサイズに対応しない */
.hero {
  height: 800px;
}
```

#### 正しい: svh での高さ指定

```css
/* ✅ デバイスサイズに自動対応 */
.hero {
  height: 100vh;
  height: 100svh;
}
```

### パフォーマンス

- **svh**: リサイズ不要（固定値）→ パフォーマンス良好
- **dvh**: スクロール時に再計算 → 若干のオーバーヘッド

### ベストプラクティス

1. **デフォルトは svh**
   - モバイルで常に見える
   - パフォーマンス良好

2. **フォールバックを必ず記述**
   ```css
   height: 100vh; /* フォールバック */
   height: 100svh; /* モダンブラウザ */
   ```

3. **dvh は特殊ケースのみ**
   - スクロールで高さを変えたい場合のみ

4. **lvh は使用しない**
   - vh と同じ問題がある

### チェックリスト

- [ ] モバイルでの表示確認
- [ ] アドレスバー展開時の表示確認
- [ ] スクロール時の挙動確認
- [ ] フォールバック（vh）を記述
- [ ] svh を優先的に使用
- [ ] dvh は必要な場合のみ使用
- [ ] lvh は使用しない

### 関連ナレッジ

- [レスポンシブデザイン基礎](../../cross-cutting/responsive/basics.md)
- [モバイルファーストCSS](../../cross-cutting/responsive/mobile-first.md)
- [calc() 関数](./calc-extended.md)
- [CSS単位の使い分け](./css-units-guide.md)

---
