---
title: interpolate-size と calc-size() による height:auto のアニメーション
category: css/animation
tags: [animation, interpolate-size, calc-size, height, auto, accordion]
browser_support: Chrome 129+, Edge 129+（Safari/Firefox 未対応 2025年7月時点）
created: 2025-02-01
updated: 2025-02-01
---

# interpolate-size と calc-size() による height:auto のアニメーション

## キーワード値（auto）と数値間のアニメーションを可能に

> 出典: https://ics.media/entry/250627/
> 執筆日: 2025-07-01
> 追加日: 2025-02-01

従来、`height: 0` から `height: auto` へのアニメーションはJavaScriptや回避策が必要だった。`interpolate-size` プロパティと `calc-size()` 関数により、CSSのみで実現可能になった。

### interpolate-size プロパティ

**役割**: キーワード値（`auto`, `min-content`, `max-content` など）と数値間のアニメーションを許可

```css
:root {
  interpolate-size: allow-keywords;
}
```

**対応キーワード**:
- `auto`
- `min-content`
- `max-content`
- `fit-content`
- `content`

### 基本的な実装例

#### 1. テキスト量に応じたボタン幅アニメーション

```css
:root {
  interpolate-size: allow-keywords;
}

.button {
  width: 200px;
  transition: width 0.3s ease;
}

.button:hover {
  width: auto; /* テキスト幅に合わせて拡張 */
}
```

#### 2. アコーディオンコンポーネント（::details-content）

```css
:root {
  interpolate-size: allow-keywords;
}

details {
  border: 1px solid #ccc;
}

details::details-content {
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease, padding 0.3s ease;
}

details[open]::details-content {
  height: auto;
  padding: 1rem;
}
```

**HTML**:
```html
<details>
  <summary>詳細を表示</summary>
  <div>
    ここに展開されるコンテンツ
  </div>
</details>
```

### calc-size() 関数

**役割**: キーワード値に対して数学的演算を実行

```css
.element {
  width: calc-size(auto, size + 100px);
  /* autoの幅 + 100px */
}
```

**構文**: `calc-size(<basis>, <calculation>)`
- `<basis>`: 基準となるキーワード値（`auto`, `min-content` など）
- `<calculation>`: `size` キーワードを使った計算式

#### メニューアニメーション例

```css
:root {
  interpolate-size: allow-keywords;
}

.menu {
  width: 60px;
  transition: width 0.3s ease;
  overflow: hidden;
}

.menu:hover {
  width: calc-size(min-content, size + 14px);
  /* min-content の幅 + 余白14px */
}
```

```html
<nav class="menu">
  <a href="#">ホーム</a>
  <a href="#">サービス</a>
  <a href="#">お問い合わせ</a>
</nav>
```

### 実践パターン

#### 3. カードの高さアニメーション

```css
:root {
  interpolate-size: allow-keywords;
}

.card {
  height: 200px;
  overflow: hidden;
  transition: height 0.4s ease;
}

.card.expanded {
  height: auto; /* コンテンツ全体を表示 */
}
```

#### 4. モーダルの滑らかな開閉

```css
:root {
  interpolate-size: allow-keywords;
}

dialog {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

dialog[open] {
  max-height: auto;
}
```

### calc-size() の高度な使用例

```css
.responsive-sidebar {
  width: calc-size(
    fit-content,
    clamp(200px, size, 400px)
  );
  /* fit-contentを基準に、最小200px・最大400px */
}
```

### アニメーションの組み合わせ

```css
:root {
  interpolate-size: allow-keywords;
}

.expandable {
  height: 0;
  padding: 0;
  opacity: 0;
  transition:
    height 0.3s ease,
    padding 0.3s ease,
    opacity 0.3s ease 0.1s; /* 遅延開始 */
}

.expandable.open {
  height: auto;
  padding: 1rem;
  opacity: 1;
}
```

### ブラウザサポート

**対応状況**（2025年7月時点）:
- ✅ Chrome 129+（2024年9月〜）
- ✅ Edge 129+（2024年9月〜）
- ❌ Safari（未対応）
- ❌ Firefox（未対応）

### フォールバック対応

```css
/* フォールバック: max-heightで代替 */
.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.accordion-content.open {
  max-height: 500px; /* 十分大きな値 */
}

/* 対応ブラウザ向け */
@supports (interpolate-size: allow-keywords) {
  :root {
    interpolate-size: allow-keywords;
  }

  .accordion-content {
    height: 0;
    max-height: none;
  }

  .accordion-content.open {
    height: auto;
  }
}
```

### ユースケース

- **アコーディオン**: FAQ、メニュー、詳細セクション
- **レスポンシブボタン**: テキスト量に応じた幅調整
- **カード展開**: 要約→全文表示の切り替え
- **モーダル**: 滑らかな開閉アニメーション
- **サイドバー**: 折りたたみ可能なナビゲーション

### 注意点

- **パフォーマンス**: 大量の要素で同時アニメーションは避ける
- **レイアウトシフト**: `content-visibility: auto` との併用で最適化
- **アクセシビリティ**: `prefers-reduced-motion` への配慮

```css
@media (prefers-reduced-motion: reduce) {
  .expandable {
    transition: none;
  }
}
```

### 参考資料

- [interpolate-size - CSS Working Group Draft](https://drafts.csswg.org/css-values-5/#interpolate-size)
- [calc-size() - CSS Values and Units Module](https://drafts.csswg.org/css-values-5/#calc-size)

---
