---
title: フォームオートコンプリートのスタイリング
category: css/components
tags: [autofill, form, input, pseudo-class, browser-override]
browser_support: Chrome, Safari, Edge (WebKit系)
created: 2025-01-16
updated: 2025-01-16
---

# フォームオートコンプリートのスタイリング

> 出典: https://zenn.dev/localer/articles/b7d9aba4ca4db8
> 執筆日: 不明
> 追加日: 2025-01-16

## 問題

パスワードマネージャーなどでフォーム自動補完時、ブラウザが独自スタイルを強制適用し、背景色や文字色が意図しない見た目になる。

**一般的な症状:**
- 青や黄色の背景色が強制される
- `color`プロパティで文字色を変更できない
- デザインシステムと不整合になる

## 解決策

`:autofill` 擬似クラスと特殊なテクニックを組み合わせて対処する。

### 基本的な実装

```css
input:autofill,
input:autofill:hover,
input:autofill:focus,
input:autofill:active {
  /* 極端に長い遷移で背景色変化を実質無効化 */
  transition: background-color 5000s ease-in-out 0s;

  /* WebKit系で文字色を制御（colorは効かない） */
  -webkit-text-fill-color: #000 !important;

  /* キャレット色を明示 */
  caret-color: #000;

  /* 背景を透明化 */
  background-color: transparent !important;
}
```

### ダークモード対応

```css
@media (prefers-color-scheme: light) {
  input:autofill,
  input:autofill:hover,
  input:autofill:focus,
  input:autofill:active {
    -webkit-text-fill-color: #000 !important;
    caret-color: #000;
  }
}

@media (prefers-color-scheme: dark) {
  input:autofill,
  input:autofill:hover,
  input:autofill:focus,
  input:autofill:active {
    -webkit-text-fill-color: #fff !important;
    caret-color: #fff;
  }
}
```

### CSS変数を使った実装

```css
:root {
  --input-text-color: #000;
}

@media (prefers-color-scheme: dark) {
  :root {
    --input-text-color: #fff;
  }
}

input:autofill,
input:autofill:hover,
input:autofill:focus,
input:autofill:active {
  transition: background-color 5000s ease-in-out 0s;
  -webkit-text-fill-color: var(--input-text-color) !important;
  caret-color: var(--input-text-color);
  background-color: transparent !important;
}
```

## 各プロパティの役割

| プロパティ | 役割 | なぜ必要か |
|-----------|------|-----------|
| `transition: background-color 5000s` | ブラウザの強制背景色を「遅延」 | 変更を極端に遅らせることで視覚的影響を排除 |
| `-webkit-text-fill-color` | 文字色を制御 | `color`プロパティでは機能しない。WebKit系専用 |
| `caret-color` | キャレット（カーソル）の色 | 指定なしだと文字色と異なる色になる可能性 |
| `background-color: transparent !important` | 背景の強制上書き | ブラウザの`!important`指定に対抗 |

## 重要なポイント

### 1. すべての状態を個別に指定

```css
/* ❌ これだけでは不十分 */
input:autofill {
  /* スタイル */
}

/* ✅ すべての状態を列挙 */
input:autofill,
input:autofill:hover,
input:autofill:focus,
input:autofill:active {
  /* スタイル */
}
```

`:hover`、`:focus`、`:active`を個別に指定しないと、状態遷移時にブラウザのデフォルトスタイルが再適用される。

### 2. `!important` が必要な理由

多くのブラウザのユーザーエージェントスタイルシートでは、`:autofill`スタイル定義に`!important`を使用している。そのため、こちらも`!important`で対抗する必要がある。

### 3. transition の長さについて

```css
/* ❌ 短すぎる */
transition: background-color 3s;

/* ✅ 実用上問題ない長さ */
transition: background-color 5000s;
```

数秒～数十秒程度では効果なし。ユーザー操作中に変化しない十分な長さを設定する。5000秒（約83分）であれば実用上問題にならない。

### 4. `-webkit-text-fill-color` の必要性

```css
/* ❌ color では効かない */
input:autofill {
  color: #000 !important; /* 無視される */
}

/* ✅ -webkit-text-fill-color を使用 */
input:autofill {
  -webkit-text-fill-color: #000 !important;
}
```

WebKit系ブラウザでは、`color`プロパティがオートコンプリート時に無視される。`-webkit-text-fill-color`を使う必要がある。

## ブラウザサポート

| ブラウザ | サポート状況 |
|---------|-------------|
| Chrome | ✅ 対応 |
| Safari | ✅ 対応 |
| Edge | ✅ 対応（Chromium版） |
| Firefox | ⚠️ 部分対応（`:autofill`は対応、`-webkit-text-fill-color`は非対応） |

Firefox では`-moz-`プレフィックス版の代替手段が必要になる場合がある。

## 実用例

### デザインシステムとの統合

```css
/* デザインシステムの変数 */
:root {
  --color-text-primary: #1a1a1a;
  --color-text-on-dark: #ffffff;
  --color-bg-input: transparent;
}

[data-theme="dark"] {
  --color-text-primary: #ffffff;
}

/* オートコンプリート対応 */
input:autofill,
input:autofill:hover,
input:autofill:focus,
input:autofill:active {
  transition: background-color 5000s ease-in-out 0s;
  -webkit-text-fill-color: var(--color-text-primary) !important;
  caret-color: var(--color-text-primary);
  background-color: var(--color-bg-input) !important;
}
```

### テキストエリアにも適用

```css
input:autofill,
textarea:autofill,
input:autofill:hover,
textarea:autofill:hover,
input:autofill:focus,
textarea:autofill:focus,
input:autofill:active,
textarea:autofill:active {
  transition: background-color 5000s ease-in-out 0s;
  -webkit-text-fill-color: var(--input-text-color) !important;
  caret-color: var(--input-text-color);
  background-color: transparent !important;
}
```

## 注意点

- **Firefox対応**: `-webkit-text-fill-color`が効かない場合があるため、Firefoxでテスト推奨
- **パフォーマンス**: 5000秒のtransitionは実質的にパフォーマンスに影響しない（変化しないため）
- **アクセシビリティ**: オートコンプリートされたことをユーザーに視覚的に伝える手段として、ブラウザのデフォルトスタイルには意味がある。完全に消す場合は代替手段を検討

## 関連リソース

- [MDN: :autofill](https://developer.mozilla.org/ja/docs/Web/CSS/:autofill)
- [-webkit-text-fill-color](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-text-fill-color)

---
