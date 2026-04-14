---
title: アクセシブルなドロワーメニュー
category: css/components
tags: [drawer, menu, hamburger, accessibility, popover, dialog]
browser_support: Chrome 114+, Safari 17+
created: 2025-01-16
updated: 2025-01-16
---

# アクセシブルなドロワーメニュー

> 出典: https://shimotsuki.wwwxyz.jp/20250927-1923
> 執筆日: 2025年9月
> 追加日: 2025-01-16

HTMLとCSSだけでアクセシビリティに配慮したドロワーメニューを実装。JavaScriptなしで動作する2つの方法を解説。

## 方式1: チェックボックス版

### HTML構造

```html
<header class="_header">
  <h1 class="_header_title"><a href="#">Site name</a></h1>
  <p class="_header_ctrl">
    <input type="checkbox" id="header_toggle" aria-controls="header_menu" />
    <label for="header_toggle">Display menu</label>
  </p>
  <nav id="header_menu" class="_header_menu">
    <ul>
      <li><a href="#">About</a></li>
      <li><a href="#">Service</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
    <div class="_header_remote-ctrl" aria-hidden="true">
      <label for="header_toggle"></label>
    </div>
  </nav>
</header>
```

### アクセシビリティのポイント

- `aria-controls`でチェックボックスがメニューを制御することを明示
- `aria-hidden="true"`で重複するラベルをスクリーンリーダーから隠蔽
- 1つの`label`要素に開閉両方の役割を割り当て

### CSS実装

```css
@media not ((any-hover: hover) and (pointer: fine) and (width > 40rem)) {
  ._header_ctrl input {
    appearance: none;
    backdrop-filter: blur(4px);
    background: color-mix(in srgb, transparent, #000 50%);
    position: fixed;
    inset-block: 0 100%;
    inset-inline: 0;
    transition: inset-block 0s calc(1s / 4), opacity calc(1s / 4);
    z-index: 1e5;
  }

  ._header_menu {
    --inline-size: min(20rem, 100%);
    position: fixed;
    inset-inline: auto calc(var(--inline-size) * -1);
    transition: inset calc(1s / 4);
  }

  /* チェックボックス:checked時に開く */
  ._header:has(#header_toggle:checked, #header_menu:focus-within) {
    ._header_menu {
      inset-inline: auto 0;
    }
  }
}
```

### 特徴

- ドロワー内にフォーカスがあれば開くという柔軟なUX
- `:has()`と`:focus-within`でフォーカス管理

---

## 方式2: Popover/Dialog版

### HTML構造

```html
<header class="_header">
  <nav class="_header_menu">
    <!-- 大画面用のメニュー -->
  </nav>

  <p class="_header_dialog-show">
    <button type="button"
            popovertarget="header-dialog"
            popovertargetaction="show">
      Open menu
    </button>
  </p>

  <dialog class="_header-dialog" id="header-dialog" popover="auto">
    <nav class="_header-dialog_menu">
      <ul>
        <li><a href="#">About</a></li>
        <li><a href="#">Service</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
    <p class="_header-dialog_hide">
      <button type="button"
              popovertarget="header-dialog"
              popovertargetaction="hide">
        Close menu
      </button>
    </p>
  </dialog>
</header>
```

### CSS実装

```css
._header-dialog {
  --inline-size: min(20rem, 100%);
  position: fixed;
  inset-block: 0;
  inset-inline: auto 0;
  border: none;
  padding: 2rem;
  transition: display calc(1s / 4) allow-discrete,
              inset calc(1s / 4);
}

._header-dialog::backdrop {
  background: color-mix(in srgb, transparent, #000 50%);
  backdrop-filter: blur(8px);
}

._header-dialog:popover-open {
  display: flex;
  inset-inline: auto 0;
}

@starting-style {
  ._header-dialog:popover-open {
    inset-inline: auto calc(var(--inline-size) * -1);
  }
}

/* スクロール抑制 */
:root:has(#header-dialog:popover-open) {
  overflow: hidden;
  pointer-events: none;
}
```

### 特徴

- `popover`属性で標準的なポップオーバー動作
- `@starting-style`でスライドインアニメーション
- 背景のスクロール抑制を自動管理

---

## アクセシビリティ比較

| 項目 | チェックボックス版 | Dialog版 |
|------|------------------|---------|
| **スクリーンリーダー対応** | `aria-controls`で関連付け | `dialog`要素の標準機能 |
| **Tab キー移動** | `:focus-within`で管理 | 自動的にトラップ |
| **フォーカス管理** | 手動で`pointer-events`制御 | 標準で実装 |
| **セマンティクス** | `label`でハック的実装 | `button`で直感的 |

---

## ブラウザ対応

### チェックボックス版

| ブラウザ | 対応状況 |
|----------|---------|
| Chrome/Edge | ✅ 完全対応 |
| Firefox | ✅ 完全対応 |
| Safari | ✅ 完全対応 |

### Dialog版（Popover API）

| ブラウザ | 対応状況 |
|----------|---------|
| Chrome | 114+ |
| Edge | 114+ |
| Safari | 17.0+ |
| Firefox | `allow-discrete` 未対応（閉じるアニメーション制約） |

**注意**: Firefoxでは`transition`の`allow-discrete`が未対応のため、閉じるアニメーションが動作しません。

---

## メリット・デメリット

### チェックボックス版

**メリット:**
- 高いブラウザ互換性
- コンテンツ重複なし（SEO有利）
- タッチデバイスとデスクトップを1つのHTMLで対応

**デメリット:**
- CSSが複雑化（メンテナンス性低下）
- フォーム部品の転用（セマンティクス的に不自然）
- アクセシビリティ設定が煩雑

### Dialog版

**メリット:**
- スクリーンリーダーの読み上げが自然
- Tab操作がしやすい
- メンテナンス性が高い
- セマンティックなマークアップ

**デメリット:**
- コンテンツ重複が必須（SEO的に不利）
- ブラウザ対応が限定的
- Firefoxでアニメーション制約

---

## 推奨事項

- **CMSテンプレート**: Dialog版（メンテナンス性重視）
- **ブラウザ対応重視**: チェックボックス版
- **モダンブラウザ限定**: Dialog版が理想的

---

## 関連ナレッジ

- [Popover API](../../html/popover-api.md)
- [dialog要素](../../html/dialog-element.md)
- [WAI-ARIA の基礎](../../cross-cutting/accessibility/wai-aria-basics.md)
- [CSS論理プロパティ](../properties/logical-properties.md)
