---
title: Space Toggle Hack — カスタムプロパティで任意の値を条件分岐
category: css/theming
tags: [custom-properties, color-scheme, theming, space-toggle, light-dark, 2026]
browser_support: 全モダンブラウザ（カスタムプロパティのみ使用）
created: 2026-05-13
updated: 2026-05-13
---

# Space Toggle Hack — カスタムプロパティで任意の値を条件分岐

> 出典: https://yuheiy.com/blog/2026/space-toggle-hack-for-switching-based-on-color-scheme — yuheiy (公開 2026-02-21)
> 追加日: 2026-05-13

カスタムプロパティの値として**空白文字**（`--foo: ;`）または `initial` を設定することで、条件分岐的な動作を実現する手法。`light-dark()` が色のみだったのに対し、**任意のプロパティ値**を切り替えられる。元ネタは Lightning CSS の色関数実装。

## 基本メカニズム

```css
--toggler: ;
--red-if-toggler: var(--toggler) red;
background: var(--red-if-toggler, green); /* red が適用される */

--toggler: initial;
--red-if-toggler: var(--toggler) red;
background: var(--red-if-toggler, green); /* green が適用される */
```

- `--toggler` が**空白**: 有効値が出力され、`red` が適用される
- `--toggler` が `initial`: `var()` 全体が無効化され、フォールバック値の `green` が優先される

### 仕組みの解説

CSS の `var()` 関数は、参照先カスタムプロパティが「有効な値」を持つ場合にその値で展開され、`initial`（または未定義）の場合はフォールバック値を使う仕様。これを利用して **0 or 1 のスイッチ**として機能させる。

## カラースキーム応用

### 基本構造（自動切り替え）

```css
:root {
  --light: initial;
  --dark: ;
  color-scheme: light dark;

  @media (prefers-color-scheme: dark) {
    --light: ;
    --dark: initial;
  }
}

#element {
  font-weight: var(--light, 500) var(--dark, 300);
}
```

- ライトモード時: `var(--light, 500)` → `initial` なので `500`、`var(--dark, 300)` → 空白なので無効、結果 `500`
- ダークモード時: `var(--light, 500)` → 空白なので無効、`var(--dark, 300)` → `initial` なので `300`

### 手動テーマ切り替え対応

`data-theme` 属性で `prefers-color-scheme` を上書き可能にする。

```css
:root {
  --light: initial;
  --dark: ;
  color-scheme: light dark;

  @media (prefers-color-scheme: dark) {
    --light: ;
    --dark: initial;
  }
}

:root[data-theme='light'] {
  --light: initial;
  --dark: ;
  color-scheme: light;
}

:root[data-theme='dark'] {
  --light: ;
  --dark: initial;
  color-scheme: dark;
}

button {
  background: var(--light, #aaa) var(--dark, #444);
}
```

## light-dark() との比較

| 機能 | light-dark() | Space Toggle Hack |
|------|--------------|-------------------|
| 切り替え対象 | 色のみ | **任意のプロパティ値** |
| 構文の簡潔さ | 簡潔（1 関数） | 冗長（カスタムプロパティ準備が必要） |
| ブラウザサポート | Chrome 123+, Safari 17.5+, Firefox 120+ | 全モダンブラウザ（より広範） |
| 拡張性 | 2 値のみ | **3 値以上対応可** |

→ 色だけなら `light-dark()` が簡潔。色以外（font-weight, spacing, content など）や 3 値以上は Space Toggle が有効。

## 複数テーマへの拡張: スペーシング設計

3 つ以上のテーマ・サイズに対応する場合の典型パターン。

```css
:root {
  --is-size-base: initial;
  --is-size-compact: ;
  --is-size-comfortable: ;

  &[data-size='compact'] {
    --is-size-base: ;
    --is-size-compact: initial;
    --is-size-comfortable: ;
  }

  &[data-size='comfortable'] {
    --is-size-base: ;
    --is-size-compact: ;
    --is-size-comfortable: initial;
  }
}

:root {
  --space-050: var(--is-size-base, 2px) var(--is-size-compact, 1px)
               var(--is-size-comfortable, 4px);
  --space-100: var(--is-size-base, 4px) var(--is-size-compact, 2px)
               var(--is-size-comfortable, 8px);
}
```

- `data-size` 属性で 3 つのサイズモードを切り替え
- 各 `--space-*` トークンは、有効になっているモードのフォールバック値のみが採用される
- Slack のような UI 密度切り替えに応用可能

## 他のユースケース

### 1. フォントウェイトの切り替え

```css
:root {
  --light: initial;
  --dark: ;

  @media (prefers-color-scheme: dark) {
    --light: ;
    --dark: initial;
  }
}

body {
  /* ダークモードでは細めのウェイトに */
  font-weight: var(--light, 500) var(--dark, 300);
}
```

### 2. レイアウトの切り替え

```css
.card {
  display: var(--is-mobile, block) var(--is-desktop, flex);
  gap: var(--is-desktop, 1rem);
}

@media (min-width: 768px) {
  :root {
    --is-mobile: ;
    --is-desktop: initial;
  }
}
```

### 3. コンテンツの切り替え

```css
:root {
  --is-loading: ;
  --is-loaded: initial;

  &[data-state='loading'] {
    --is-loading: initial;
    --is-loaded: ;
  }
}

.status::before {
  content: var(--is-loading, '読込中…') var(--is-loaded, '完了');
}
```

## 利点

1. **色以外のプロパティ値も切り替え可能** — `light-dark()` の制約を回避
2. **複数テーマ対応の拡張性** — 3 値以上の切り替えに対応
3. **既存 CSS 機能のみで実装可能** — 広範なブラウザサポート
4. **DOM 操作なしで切り替え** — JavaScript 不要

## 限界

1. **`light-dark()` より冗長** — カスタムプロパティの事前準備が必要
2. **複数値切り替え時にコード量が増加** — N 個のモードで N×トークン数の宣言
3. **カスタムプロパティ値の理解が必須** — 空白文字と `initial` の挙動を理解する必要
4. **デバッグが難しい** — 空白文字は視認しづらい（コメントで明示推奨）

## ベストプラクティス

### 命名規則

トグルプロパティは `--is-*` プレフィックスで意図を明示。

```css
/* ✅ 推奨 */
--is-dark: initial;
--is-light: ;

/* ❌ わかりにくい */
--dark: initial;
--light: ;
```

### コメントで空白を明示

```css
:root {
  --is-light: initial;
  --is-dark: ; /* 空白文字（有効値）*/
}
```

### フォールバック値を意味のある単位で

```css
/* ✅ 推奨: 意味のあるフォールバック */
color: var(--is-light, #000) var(--is-dark, #fff);

/* ❌ 非推奨: 空のフォールバック（無効値になる） */
color: var(--is-light) var(--is-dark);
```

## アンチパターン

```css
/* ❌ 同時に両方有効にしてしまう */
:root {
  --is-light: ;
  --is-dark: ;
}
body {
  /* 両方有効になり、最後の値が適用される（意図しない動作） */
  color: var(--is-light, white) var(--is-dark, black);
}

/* ✅ 排他的に切り替える */
:root {
  --is-light: initial;
  --is-dark: ;
}
@media (prefers-color-scheme: dark) {
  :root {
    --is-light: ;
    --is-dark: initial;
  }
}
```

## 関連技術

- [light-dark() 関数](./light-dark-function.md) — 色のみの簡潔な切り替え
- [カスタムプロパティ](../values/custom-properties.md)
- [color-scheme プロパティ](./color-scheme.md)

## 参考リソース

- [yuheiy: Space Toggleハックを使ってcolor-schemeに応じた値の切り替えを実現する](https://yuheiy.com/blog/2026/space-toggle-hack-for-switching-based-on-color-scheme)
- [Lightning CSS](https://lightningcss.dev/) — 元ネタの色関数実装
