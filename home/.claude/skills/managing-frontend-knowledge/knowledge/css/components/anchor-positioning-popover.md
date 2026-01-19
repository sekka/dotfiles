---
title: Anchor Positioning と Popover API の統合
category: css/components
tags: [anchor, positioning, popover, integration, ui-components, 2026]
browser_support: Chrome 125+, Edge 125+, Safari 26.0+, Firefox 147+ (全ブラウザ対応)
created: 2026-01-19
updated: 2026-01-19
---

# Anchor Positioning と Popover API の統合

> 出典: https://zenn.dev/ubie_dev/articles/anchor-positioning-popover
> 執筆日: 2026-01-13
> 追加日: 2026-01-19

2026年1月13日のFirefox 147リリースにより、CSS Anchor Positioningが全ブラウザで対応されました。Popover APIと組み合わせることで、**HTML・CSSのみでポップオーバーUIを完全に実装**できるようになりました。

## 統合の利点

従来のポップオーバー実装では以下が必要でした：
- 複雑なJavaScript
- リサイズ・スクロールイベントの監視
- 位置計算とDOM操作

この2つのAPIの統合により、開発効率が大幅に向上し、サブメニューやドロップダウンメニューといった頻出UIの実装が簡潔になります。

## Popover APIの基礎

Popover APIは、JavaScriptなしでポップオーバー表示を制御します。

### 基本的な属性

```html
<button popovertarget="my-menu" popovertargetaction="toggle">
  メニューを開く
</button>

<div id="my-menu" popover>
  <ul>
    <li>項目1</li>
    <li>項目2</li>
  </ul>
</div>
```

- **popover属性**：要素をポップオーバーとして宣言
- **popovertarget属性**：開閉ボタンがトリガーするポップオーバーのID指定
- **popovertargetaction属性**：toggle/show/hideを指定

### 自動的に実装される機能

- ESCキーでの閉鎖
- 背景クリックでの閉鎖
- フォーカス管理

## Anchor Positioningとの統合

### 実装の3ステップ

**ステップ1：アンカー要素を定義**

```css
.button {
  anchor-name: --my-anchor;
}
```

**ステップ2：ポップオーバーと紐付け**

```css
.popover {
  position-anchor: --my-anchor;
}
```

**ステップ3：位置を指定**

2つの方法が利用可能です：

#### anchor()関数による指定

特定の位置を基準に配置します。

```css
.popover {
  top: anchor(bottom);
  right: anchor(right);
  margin-top: 8px;
}
```

anchor()関数で指定できる値：
- `top` / `bottom` / `left` / `right`
- `center`

#### position-areaによる指定

アンカー周囲のエリアを指定します。

```css
.popover {
  position-area: block-end;
}
```

position-areaの値：
- `block-start` / `block-end` - 上/下
- `inline-start` / `inline-end` - 左/右
- 組み合わせ可能: `block-end inline-start` - 左下

## 実装パターン

### ドロップダウンメニュー（右端揃え）

```html
<button class="user-icon" popovertarget="user-menu">
  <img src="avatar.png" alt="ユーザー">
</button>

<nav id="user-menu" popover class="dropdown-menu">
  <a href="/profile">プロフィール</a>
  <a href="/settings">設定</a>
  <a href="/logout">ログアウト</a>
</nav>
```

```css
.user-icon {
  anchor-name: --user-icon;
}

.dropdown-menu {
  position-anchor: --user-icon;
  top: anchor(bottom);
  right: anchor(right);
  margin-top: 8px;
}
```

**ポイント**: 右端揃えが必要な場合、`position-area: block-end inline-end`ではなく、`anchor()`関数を使用してください。

### サブメニュー（横並び）

```css
.menu-item {
  anchor-name: --menu-item;
}

.submenu {
  position-anchor: --menu-item;
  position-area: inline-end block-start;
}
```

## 画面端対応：position-try-fallbacks

表示がはみ出す際の代替位置を指定します。

```css
.popover {
  position-area: block-end;
  position-try-fallbacks: flip-block;
}
```

### fallbacksの種類

- `flip-block` - 上下を反転
- `flip-inline` - 左右を反転
- `flip-block, flip-inline` - 上下→左右の順に試行

### 複雑な例

```css
.popover {
  position-area: block-end inline-start;
  position-try-fallbacks:
    flip-block,
    flip-inline,
    block-start inline-end;
}
```

## calc()との組み合わせ

アンカー位置に余白を加えられます。

```css
.popover {
  top: calc(anchor(bottom) + 8px);
  left: calc(anchor(left) - 4px);
}
```

## 実装時の注意点

### 1. popovertarget属性の制限

`popovertarget`属性は以下の要素でのみ機能します：
- `<button>`要素
- `<input type="button">`

**動作しない例**：

```html
<!-- ❌ a要素では動作しない -->
<a href="#" popovertarget="menu">開く</a>
```

**回避策**：

```html
<!-- ✅ buttonを使用 -->
<button popovertarget="menu">開く</button>
```

### 2. 位置指定の選択

右端揃えや細かい位置調整が必要な場合：
- `position-area`より`anchor()`関数を優先
- `calc()`で余白を調整

### 3. z-indexの管理

Popover APIは自動的に最前面に表示しますが、複数のポップオーバーがある場合は`z-index`を明示的に指定することを検討してください。

## ブラウザ対応

| ブラウザ | 対応バージョン | リリース日 |
|---------|---------------|----------|
| Chrome | 125以降 | 2024年5月 |
| Edge | 125以降 | 2024年5月 |
| Safari | 26.0以降 | 2025年9月 |
| Firefox | 147以降 | 2026年1月 |

**全ブラウザで利用可能（2026年1月以降）**

## Polyfill

Anchor Positioningの Polyfill:
```html
<script src="https://unpkg.com/@oddbird/css-anchor-positioning"></script>
```

Popover APIの Polyfill:
```html
<script src="https://unpkg.com/@oddbird/popover-polyfill"></script>
```

## 関連ナレッジ

- [Anchor Positioning](./anchor-positioning.md) - 単体の詳細解説
- [Popover API](./popover-api.md) - 単体の詳細解説
- [Drawer Menu](./drawer-menu.md) - サイドメニューの実装

## 参考リンク

- [MDN: Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [MDN: CSS Anchor Positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)
- [Firefox 147 リリースノート](https://www.mozilla.org/en-US/firefox/147.0/releasenotes/)
