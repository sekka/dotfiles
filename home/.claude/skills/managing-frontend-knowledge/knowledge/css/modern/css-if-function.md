---
title: CSS if() 関数
category: css/modern
tags: [css, conditional, if-function, container-style-query, media-query]
browser_support: Chrome/Edge 137+ (2025年5月)
created: 2026-02-01
updated: 2026-02-01
---

# CSS if() 関数

## CSS if() 関数

> 出典: https://ics.media/entry/250919/
> 執筆日: 2025-09-19
> 追加日: 2026-02-01

CSS if() 関数は、条件分岐をCSSで実現する新機能。Container Style Query（`style()`構文）、Media Query（`media()`構文）、Feature Detection（`supports()`構文）などの条件と組み合わせて、プロパティ値を動的に切り替えることができる。

### コード例

**基本構文:**

```css
.element {
  background-color: if(
    style(--color: primary): red;
    else: blue;
  );
}
```

**コンポーネントバリアント管理:**

```css
button {
  background: if(
    style(--variant: primary): blue;
    style(--variant: secondary): gray;
    else: transparent;
  );
}
```

**グローバル状態管理（メディアクエリ）:**

```css
.container {
  padding: if(
    media(width >= 768px): 2rem;
    else: 1rem;
  );
}
```

**CSSアニメーション:**

```css
@keyframes slide {
  from {
    translate: if(
      style(--direction: left): -100% 0;
      style(--direction: right): 100% 0;
      else: 0 -100%;
    );
  }
  to {
    translate: 0 0;
  }
}
```

**コンポーネント間通信:**

```css
/* 親要素 */
.parent {
  --state: active;
}

/* 子要素 */
.child {
  opacity: if(
    style(--state: active): 1;
    else: 0.5;
  );
}
```

**ドラッグ&ドロップ状態の伝播:**

```css
:root:has(.dragging) {
  --is-dragging: true;
}

.drop-zone {
  border-color: if(
    style(--is-dragging: true): blue;
    else: gray;
  );
}
```

### ユースケース

- **コンポーネントバリアント管理**: ボタンやカードのスタイル切り替え
- **レスポンシブデザイン**: ウィンドウサイズに応じたスタイル分岐
- **テーマ切り替え**: ダークモード/ライトモード対応
- **状態管理**: ホバー、アクティブ、ドラッグ中などの状態表現
- **アニメーション**: 方向やパターンを動的に変更
- **コンポーネント間通信**: ラッパー要素なしで親子間スタイル伝播

### 注意点

**諸刃の剣（Double-Edged Sword）:**

- 強力だが、CSS変数のスコープ管理を怠ると混乱したCSSになる
- 無秩序な使用は可読性を損なう
- グローバルな状態管理には慎重さが必要

**推奨事項:**

- CSS変数の命名規則を統一する（例: `--state-*`、`--variant-*`）
- スコープを明確に定義する（コンポーネント単位で閉じる）
- ドキュメント化を徹底する（使用箇所をコメントで記載）

**ブラウザサポート:**

- Chrome/Edge: 137+ (2025年5月リリース)
- Safari: 未対応（2026年2月時点）
- Firefox: 未対応（2026年2月時点）

### 関連技術

- **Container Style Query**: `style()` 構文でCSS変数の値を条件判定
- **Media Query**: `media()` 構文でビューポート幅などを条件判定
- **Feature Detection**: `supports()` 構文でブラウザ機能サポートを条件判定
- **`:has()` 擬似クラス**: 子要素の存在で親要素をスタイリング

### 参考リンク

- [ICS MEDIA - CSS if()関数](https://ics.media/entry/250919/)
- [Container Style Query guide](https://ics.media/entry/240723/)
- [has() pseudo-class](https://ics.media/entry/240808/)

---
