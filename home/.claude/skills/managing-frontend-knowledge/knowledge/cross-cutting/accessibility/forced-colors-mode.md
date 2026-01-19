---
title: 強制カラーモード（Forced Colors Mode）対応
category: cross-cutting/accessibility
tags: [forced-colors, high-contrast, accessibility, windows, a11y, 2025]
browser_support: Chrome, Edge, Firefox (Windows)
created: 2026-01-19
updated: 2026-01-19
---

# 強制カラーモード（Forced Colors Mode）対応

> 出典: https://www.tak-dcxi.com/article/background-to-foreground-with-fallback
> 執筆日: 2025年
> 追加日: 2026-01-19

**強制カラーモード（Forced Colors Mode）**下でのCSS実装上の課題と対策。背景色を前景色として利用する際の`background-color`プロパティが、強制カラーモード環境で意図しない上書きされることによる可視性の問題を解決します。

## 強制カラーモードとは

ユーザーが設定したシステムカラーで、Webページの色を強制的に上書きする機能です。

### 利用環境

- **Windowsハイコントラストモード**
- **Edge 130+のページカラー設定**
- **Firefox 138+のコントラスト制御**

### 利用者統計

- Windowsユーザーの約4%
- 低視力ユーザーの約50%
- **訪問者の約2-5%**が対応を必要とする環境で閲覧

## 影響を受けるプロパティ

強制カラーモードが有効な場合、以下のプロパティが自動的に上書きされます：

| プロパティ | 動作 |
|-----------|------|
| `color` | システムカラーで上書き |
| `background-color` | システムカラーで上書き |
| `border-color` | システムカラーで上書き |
| `box-shadow` | `none`に強制 |
| `text-shadow` | `none`に強制 |
| `background-image` | URLベース以外は削除 |

## 問題となるケース

### アイコンの表示

マスク画像やSVGアイコンで`background-color`を使用している場合、意図しない色に上書きされます。

```css
/* ❌ 問題：強制カラーモードで意図しない色になる */
.icon {
  background-color: currentColor;
  mask-image: url('icon.svg');
}
```

## 推奨される実装パターン

### カスタムプロパティを使用した対応

```css
:root {
  --background-current: currentColor;
}

@media (forced-colors: active) {
  :root {
    --background-current: CanvasText;
  }

  :any-link {
    --background-current: LinkText;
  }

  button:enabled {
    --background-current: ButtonText;
  }

  :disabled {
    --background-current: GrayText;
  }
}

.icon {
  background-color: var(--background-current);
  mask-image: url('icon.svg');
}
```

**ポイント**:
- 通常時は`currentColor`を使用
- 強制カラーモード時は適切なシステムカラーに切り替え
- 要素の状態に応じたシステムカラーを指定

## システムカラー一覧

強制カラーモードで使用できるシステムカラー：

| システムカラー | 説明 |
|--------------|------|
| `Canvas` | 背景色 |
| `CanvasText` | テキスト色 |
| `LinkText` | リンク色 |
| `VisitedText` | 訪問済みリンク色 |
| `ActiveText` | アクティブリンク色 |
| `ButtonFace` | ボタン背景色 |
| `ButtonText` | ボタンテキスト色 |
| `ButtonBorder` | ボタン枠線色 |
| `Field` | 入力欄背景色 |
| `FieldText` | 入力欄テキスト色 |
| `Highlight` | 選択背景色 |
| `HighlightText` | 選択テキスト色 |
| `GrayText` | 無効テキスト色 |

## 実装時の注意点

### 1. 装飾的枠線

装飾的な枠線には`transparent`を使用します。

```css
.card {
  border: 1px solid transparent;
}

@media (forced-colors: active) {
  .card {
    border-color: CanvasText;
  }
}
```

### 2. SVG内の色指定

SVG内の`fill`と`stroke`にもシステムカラーをフォールバックします。

```css
@media (forced-colors: active) {
  svg {
    fill: CanvasText;
    stroke: CanvasText;
  }
}
```

### 3. 画像の背景環境適応

`filter`を使用して背景環境に適応させます。

```css
@media (forced-colors: active) {
  img {
    filter: contrast(1.1);
  }
}
```

### 4. forced-colors-adjust プロパティ

特定の要素で強制カラーモードを無効化できます（慎重に使用）。

```css
.logo {
  forced-colors-adjust: none;
}
```

## 特に重要な対応箇所

強制カラーモード対応が特に重要な要素：

- **チェックボックス** - カスタムチェックマークの可視性
- **ラジオボタン** - 選択状態の視認性
- **アイコンリンク** - ナビゲーションアイコンの表示
- **カスタムボタン** - 操作可能な要素の識別
- **トグルスイッチ** - オン/オフ状態の明確化

## 実装例：アイコンボタン

```css
.icon-button {
  --icon-color: currentColor;
}

@media (forced-colors: active) {
  .icon-button {
    --icon-color: ButtonText;
  }

  .icon-button:disabled {
    --icon-color: GrayText;
  }
}

.icon-button::before {
  content: '';
  background-color: var(--icon-color);
  mask-image: url('icon.svg');
}
```

## 実装例：カスタムチェックボックス

```html
<label class="checkbox">
  <input type="checkbox">
  <span class="checkbox-icon"></span>
  チェック項目
</label>
```

```css
.checkbox-icon {
  --check-color: white;
  --bg-color: var(--primary-color);
}

@media (forced-colors: active) {
  .checkbox-icon {
    --check-color: FieldText;
    --bg-color: Field;
    border: 1px solid FieldText;
  }

  input:checked + .checkbox-icon {
    --check-color: HighlightText;
    --bg-color: Highlight;
  }
}

.checkbox-icon::after {
  content: '✓';
  color: var(--check-color);
  background-color: var(--bg-color);
}
```

## テスト方法

### Windows

1. 設定 > アクセシビリティ > ハイコントラスト
2. ハイコントラストをオンにする

### Edge

1. edge://settings/appearance
2. 「ページカラー」を「ハイコントラスト」に設定

### Firefox

1. about:preferences#colors
2. 「コントラスト」を調整

### Chrome DevTools

1. DevToolsを開く
2. Rendering > Emulate CSS media feature forced-colors: active

## ブラウザ対応

| ブラウザ | 対応状況 |
|---------|---------|
| Chrome | ○（Windows） |
| Edge | ○（Windows） |
| Firefox | ○（Windows） |
| Safari | 未対応 |

**注意**: 強制カラーモードは主にWindowsプラットフォームで使用されます。

## 関連ナレッジ

- [WCAG準拠のアクセシビリティ](./wai-aria-basics.md)
- [視覚的に隠すテクニック](./visually-hidden.md)
- [クリックターゲット領域](./click-target-areas.md)

## 参考リンク

- [MDN: forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors)
- [WCAG: 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)
- [Windows High Contrast Mode](https://learn.microsoft.com/en-us/windows/uwp/design/accessibility/high-contrast-themes)
