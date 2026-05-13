---
source_url: https://yuheiy.com/blog/2026/space-toggle-hack-for-switching-based-on-color-scheme
title: Space Toggleハックを使ってcolor-schemeに応じた値の切り替えを実現する
author: yuheiy
published: 2026-02-21
captured: 2026-05-13
status: inbox
---

# Space Toggle Hack

## 出典
- URL: https://yuheiy.com/blog/2026/space-toggle-hack-for-switching-based-on-color-scheme
- 著者: yuheiy
- 公開: 2026-02-21

## 概要

カスタムプロパティの値として空白文字（`--foo: ;`）または `initial` を設定することで、条件分岐的な動作を実現する手法。`light-dark()` が色のみだったのに対し、**任意のプロパティ値**を切り替えられる。

## 基本メカニズム

```css
--toggler: ;
--red-if-toggler: var(--toggler) red;
background: var(--red-if-toggler, green); /* red が適用される */

--toggler: initial;
--red-if-toggler: var(--toggler) red;
background: var(--red-if-toggler, green); /* green が適用される */
```

- `--toggler` が**空白**: 有効値が出力される
- `--toggler` が `initial`: 無効化されてフォールバック値が優先される

## カラースキーム応用

### 基本構造
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

デフォルトでライトモード値（500）が適用、ダークモードで 300 に切り替わる。

### 手動テーマ切り替え対応
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

## 複数テーマへの拡張: スペーシング設計

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

## 利点
- 色以外のプロパティ値も切り替え可能（light-dark() の制約を回避）
- 複数テーマ対応の拡張性
- 既存 CSS 機能のみで実装可能（広範サポート）

## 限界
- `light-dark()` より冗長
- 複数値切り替え時にコード量が増加
- カスタムプロパティ値の理解が必須

## 元ネタ
- Lightning CSS の色関数実装に着想を得た技法
