---
title: Anchor Positioning
category: css/components
tags: [anchor, positioning, popover, tooltip, 2024, 2026]
browser_support: Chrome 125+, Firefox 147+, Safari 26.0+
created: 2025-01-16
updated: 2026-01-31
---

# Anchor Positioning

> 出典: https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> 執筆日: 2024年
> 追加日: 2025-12-17

要素を他の要素に相対的に配置する宣言的方法。ポップオーバーやツールチップに最適。

## 基本的な使い方

```css
/* アンカー要素 */
.anchor {
  anchor-name: --my-anchor;
}

/* 配置される要素 */
.tooltip {
  position: fixed;
  position-anchor: --my-anchor;
  position-area: block-end;  /* アンカーの下に配置 */
}
```

## position-area の値

| 値 | 配置 |
|----|------|
| `block-start` | 上 |
| `block-end` | 下 |
| `inline-start` | 左 |
| `inline-end` | 右 |
| `center` | 中央 |

## ユースケース

### ツールチップ

```css
.button {
  anchor-name: --button;
}

.tooltip {
  position: fixed;
  position-anchor: --button;
  position-area: block-start; /* ボタンの上 */
  margin-bottom: 8px;
}
```

### ドロップダウンメニュー

```css
.menu-button {
  anchor-name: --menu;
}

.dropdown {
  position: fixed;
  position-anchor: --menu;
  position-area: block-end inline-start; /* 左下 */
  margin-top: 4px;
}
```

### コンテキストメニュー

```css
.trigger {
  anchor-name: --context;
}

.context-menu {
  position: fixed;
  position-anchor: --context;
  position-area: inline-end block-start; /* 右上 */
}
```

## 従来の方法との比較

```javascript
// 従来: JavaScript が必要
const button = document.querySelector('.button');
const tooltip = document.querySelector('.tooltip');

const rect = button.getBoundingClientRect();
tooltip.style.top = `${rect.bottom + 8}px`;
tooltip.style.left = `${rect.left}px`;
```

```css
/* Anchor Positioning: CSS のみ */
.button {
  anchor-name: --button;
}

.tooltip {
  position: fixed;
  position-anchor: --button;
  position-area: block-end;
  margin-top: 8px;
}
```

## anchor-scope プロパティ

> 出典: https://shimotsuki.wwwxyz.jp/20260127-2013
> 執筆日: 2026年1月27日
> 追加日: 2026-01-31

**機能**: 同一のアンカー名を複数要素で使用する際のスコープを定義します。

**重要**: 同一のアンカー名を複数要素に割り当てる場合、`anchor-scope` は必須です。

```css
& > li {
  anchor-name: --item;
  anchor-scope: --item;  /* 必須 */
}
```

**ユースケース**:
- 繰り返しリスト構造でのアンカー名の再利用
- ネストメニューのプルダウン実装
- 動的に生成される要素のアンカー管理

## position-try-fallbacks プロパティ

> 出典: https://shimotsuki.wwwxyz.jp/20260127-2013
> 執筆日: 2026年1月27日
> 追加日: 2026-01-31

**機能**: 初期位置が表示領域外になった場合の代替配置位置を指定します。

```css
.dropdown-menu {
  position: fixed;
  position-anchor: --item;
  position-area: inline-end span-block-start;
  position-try-fallbacks:
    block-end span-inline-end,
    block-end span-inline-start,
    span-block-end inline-end,
    span-block-end inline-start;
}
```

**解説**:
- 上記の例では、5つの配置候補を設定
- 表示領域外にはみ出す場合、自動的に次の候補位置へフォールバック
- ビューポート境界での自動調整に有効

**実用例: レスポンシブドロップダウン**

```css
.menu-item {
  anchor-name: --menu-item;
  anchor-scope: --menu-item;
}

.submenu {
  position: fixed;
  position-anchor: --menu-item;
  position-area: inline-end span-block-start;
  position-try-fallbacks:
    block-end span-inline-end,
    block-end span-inline-start;
  max-inline-size: min(320px, 100dvi * 3 / 4); /* ビューポート幅の75%以内 */
  overflow-block: auto; /* スクロール対応 */
}
```

## プルダウンメニューの実装例

> 出典: https://shimotsuki.wwwxyz.jp/20260127-2013
> 執筆日: 2026年1月27日
> 追加日: 2026-01-31

**重要な仕様**:
- `position: fixed` を使用する（`absolute` ではない）
- `anchor-scope` は同一アンカー名使用時に必須

```html
<nav>
  <ul class="nav-menu">
    <li class="nav-item">
      <a href="#">親ページ</a>
      <ul class="submenu">
        <li><a href="#">子ページ1</a></li>
        <li><a href="#">子ページ2</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

```css
/* 親メニューアイテム */
.nav-menu > li {
  anchor-name: --item;
  anchor-scope: --item;
}

/* サブメニュー */
.submenu {
  position: fixed; /* 必須 */
  position-anchor: --item;
  position-area: inline-end span-block-start; /* 右側に展開 */
  position-try-fallbacks:
    block-end span-inline-end,
    block-end span-inline-start,
    span-block-end inline-end,
    span-block-end inline-start;

  /* 表示制御 */
  display: none;
  max-inline-size: min(320px, 100dvi * 3 / 4);
  overflow-block: auto;
}

/* ホバー時に表示（フォーカス外は非表示） */
.nav-item:not(:focus-within):hover .submenu {
  display: block;
}
```

**実装のポイント**:
- `:not(:focus-within):hover` の組み合わせで表示制御
- `max-inline-size` でビューポート境界を考慮
- `overflow-block: auto` でコンテンツがはみ出す場合にスクロール対応

## パフォーマンス上の注意点

> 出典: https://shimotsuki.wwwxyz.jp/20260127-2013
> 執筆日: 2026年1月27日
> 追加日: 2026-01-31

**重要な警告**: アンカー位置指定要素の計算は高負荷処理です。

**避けるべきパターン**:
- ✗ 複数層の深いネスト構造でのアンカーポジショニング
- ✗ プルダウンメニューのさらなる入れ子構造

**実際の問題報告**:
- テスト時にブラウザのクラッシュが報告されている
- 特に深いネスト構造での使用に注意

**推奨アプローチ**:
- 1～2層程度のネストに留める
- 複雑な階層構造には別の実装方法を検討
- パフォーマンステストを実施してから本番採用

**ブラウザ間の挙動差異**:
- ブラウザごとに挙動が異なる部分が多々ある
- クロスブラウザテストを十分に実施すること

## anchor-size() 関数

> 出典: https://ics.media/entry/251215/
> 執筆日: 2025年12月15日
> 追加日: 2026-01-19

**機能**: アンカー要素の寸法に基づいて相対的なサイズ指定を可能にします。

```css
.style {
  position: absolute;
  width: anchor-size(width);
  height: anchor-size(height);
}
```

**構文**:
```css
anchor-size(<size-reference>)
```

**指定可能な値**:
- `width`: アンカー要素の幅
- `height`: アンカー要素の高さ
- `inline`: インライン方向のサイズ
- `block`: ブロック方向のサイズ

**実用例: スケーリングツールチップ**

```css
/* アンカー要素（アニメーションでスケールするアイコン） */
.heart-icon {
  position: absolute;
  animation: pulse-heart 10s ease-in-out infinite;
  anchor-name: --tooltip-anchor;
}

/* ツールチップ（アイコンのサイズに追従） */
.tooltip {
  position: absolute;
  width: calc(anchor-size(width) * 4);
  height: calc(anchor-size(width) * 2.5);
  position-anchor: --tooltip-anchor;
}
```

**ユースケース**:
- アンカー要素に追従する装飾要素
- リサイズやアニメーションの変化に自動対応するUI
- JavaScript不要な自動サイズ同期

**ブラウザサポート**:
- Chrome/Edge: 125+（2024年5月）
- Safari: 26.0+（2025年9月）
- Firefox: 147+（2026年1月）

## ブラウザ対応

| ブラウザ | バージョン | 備考 |
|----------|-----------|------|
| Chrome/Edge | 125+ | anchor-size() 対応 |
| Firefox | 147+ | 2026年1月対応 |
| Safari | 26.0+ | 2025年9月対応 |

## Polyfill

Anchor Positioning は Polyfill が提供されています:
```html
<script src="https://unpkg.com/@oddbird/css-anchor-positioning"></script>
```

## 関連ナレッジ

- [Chrome 143 の新機能](../modern/chrome-143-features.md) - @container anchored(fallback) でフォールバック検出
- [Chrome 144 の新機能](../modern/chrome-144-features.md) - transform 適用後のアンカー接続
- [Anchor Positioning と Popover API の統合](./anchor-positioning-popover.md) - 実践的な組み合わせパターン
- [Popover API](./popover-api.md)
- [Tooltip パターン](../../cross-cutting/design-patterns/tooltip.md)
