---
title: UIデザインに役立つ 2025年の最新CSS
category: css
tags: [modern-css, ui-design, text-autospace, text-box, contrast-color, scroll-state, hdr, 2025]
browser_support: Chrome 18.2+, Safari 18.3+, Firefox 段階的対応
created: 2026-01-31
updated: 2026-01-31
---

# UIデザインに役立つ 2025年の最新CSS

> 出典: https://speakerdeck.com/clockmaker/the-latest-css-for-ui-design-2025
> 発表日: 2025年11月29日（MTDDC Meetup Tokyo 2025）
> 発表者: IKEDA Yasunobu (@clockmaker)
> 追加日: 2026-01-31

## 概要

「HTMLとCSSの黄金期」が到来。JavaScriptへの依存を削減し、CSS・HTML単体で高品質なUIを実現できるようになりました。

---

## 1. テキスト関連の最新機能

### text-autospace（自動スペース調整）

**対応ブラウザ**: Chrome 18.4（2025年3月）、Safari 18.3（2025年9月）

日本語と英数字の間に自動でスペースを挿入し、可読性を向上します。

```css
p {
  text-autospace: normal;
}
```

**動作例:**

```
有効化前: これはHTMLの説明です。
有効化後: これは HTML の説明です。
```

**ユースケース:**
- 日本語文書での英単語・数字の視認性向上
- デザインツールでの手動スペース調整不要

**注意点:**
- 日本語フォント（Noto Sans JP等）での表示品質向上に寄与
- Windows版 Noto Sans JP は 2025年4月提供予定

---

### text-box（行高さの余白削減）

**対応ブラウザ**: Chrome 18.2（2024年12月）

行高さの上下余白を削減し、デザインの精密性を向上します。

```css
h1 {
  text-box: trim-both cap alphabetic;
}
```

**パラメータ:**
- `trim-both`: 上下両方をトリミング
- `cap`: キャップハイト（大文字の高さ）を基準
- `alphabetic`: ベースライン（小文字のベース）を基準

**動作:**
- フォントの内在的な余白（行高さの上下）を削除
- ピクセルパーフェクトな配置が可能

**ユースケース:**
- 見出しとコンテンツの間隔を正確に制御
- ボタン内のテキスト中央揃え

---

## 2. アクセシビリティ機能

### contrast-color()（自動コントラスト色選択）

**対応ブラウザ**: Chrome 26.0（2025年9月）

背景色に応じて、最適なテキスト色を自動選択します。

```css
.button {
  background-color: var(--user-color);
  color: contrast-color(var(--user-color));
}
```

**動作:**
- 背景色が暗い → 白いテキスト
- 背景色が明るい → 黒いテキスト
- WCAG コントラスト比を自動確保

**ユースケース:**
- ユーザーがカスタマイズ可能な UI
- ダークモード/ライトモードの自動切り替え
- データビジュアライゼーション（グラフの色）

**実装例:**

```css
:root {
  --brand-color: #3b82f6;
}

.card {
  background-color: var(--brand-color);
  color: contrast-color(var(--brand-color)); /* 自動で白or黒 */
}
```

---

## 3. インタラクション関連

### scroll-state()（スクロール状態の条件指定）

**対応ブラウザ**: Chrome 26.0（2025年9月）

スクロール状態に応じたスタイル指定が可能になります。

```css
/* スクロール可能な場合のヒント表示 */
.container {
  position: relative;
}

.container::after {
  content: '↓';
  opacity: 0;
}

.container:scroll-state(scrollable) ::after {
  opacity: 1;
}
```

**状態:**
- `scrollable`: スクロール可能
- `at-top`: 最上部
- `at-bottom`: 最下部

**ユースケース:**
- スティッキーナビゲーション（スクロール時に表示）
- スクロール可能エリアのヒント表示
- ページ内位置に応じた UI 変更

**実装例（スティッキーヘッダー）:**

```css
header {
  position: sticky;
  top: 0;
  background: transparent;
  transition: background 0.3s;
}

body:scroll-state(scrolled) header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

---

### interpolate-size（auto へのアニメーション）

**対応ブラウザ**: Chrome 129（2024年9月）

`height: 0` から `height: auto` へのアニメーションを実現します。

```css
:root {
  interpolate-size: allow-keywords;
}

.accordion-content {
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease;
}

.accordion.is-open .accordion-content {
  height: auto; /* アニメーション可能 */
}
```

**ユースケース:**
- アコーディオンメニュー
- ドロップダウン
- 詳細表示の展開

**従来の問題:**
```css
/* ❌ 従来は動作しない */
.element {
  height: 0;
  transition: height 0.3s;
}

.element.open {
  height: auto; /* アニメーションしない */
}
```

**解決:**
```css
/* ✅ 新しい方法 */
:root {
  interpolate-size: allow-keywords;
}
```

---

### sibling-index()（要素のインデックス取得）

**対応ブラウザ**: Chrome 130（2024年6月）

要素のインデックスを取得し、遅延アニメーションを実装します。

```css
.list-item {
  animation: fadeIn 0.3s ease;
  animation-delay: calc(sibling-index() * 0.1s);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**動作:**
- 1番目の要素: 0s遅延
- 2番目の要素: 0.1s遅延
- 3番目の要素: 0.2s遅延

**ユースケース:**
- リストアイテムの段階的表示
- カード一覧のフェードイン
- ナビゲーションメニューの遅延表示

---

## 4. ビジュアル機能

### HDR（High Dynamic Range）

**対応ブラウザ**: Chrome 26.0（2025年9月）

HDR 対応ディスプレイでの高品質な色表現を実現します。

```css
/* SDR（標準）に制限 */
img {
  dynamic-range-limit: standard;
}

/* HDR 本来の性能を活用 */
img.hdr-image {
  dynamic-range-limit: no-limit;
}
```

**動作:**
- `standard`: SDR 環境と同等の色域に制限
- `no-limit`: HDR ディスプレイの本来性能を活用

**ユースケース:**
- HDR 画像・動画のネイティブ表示
- より鮮やかな色表現
- 暗部・明部の階調表現向上

**注意点:**
- HDR と SDR の切り替えが必須（環境に応じた分岐）
- 全てのコンテンツを HDR にすると、SDR 環境で見劣りする可能性

---

## 5. HTML/CSS UI 機能

### View Transitions API

**対応ブラウザ**:
- SPA: Chrome 18.0（2024年9月）
- MPA: Chrome 18.2（2024年12月）

ページ遷移時のスムーズなアニメーションを実装します。

```css
/* ページ遷移アニメーション */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.5s;
}
```

```javascript
// JavaScript での制御（SPA）
document.startViewTransition(() => {
  // DOM 更新処理
  updateContent();
});
```

**ユースケース:**
- ページ遷移時のフェード
- 要素の位置移動アニメーション
- クロスフェード効果

---

### dialog要素の拡張

#### closedby 属性（モーダルの閉じやすさ調整）

**対応ブラウザ**: Chrome 134（2025年3月）

```html
<!-- ESC キーでのみ閉じる -->
<dialog closedby="closerequest">
  モーダル内容
</dialog>

<!-- 背景クリックでも閉じる -->
<dialog closedby="any">
  モーダル内容
</dialog>
```

**値:**
- `closerequest`: ESC キーのみ
- `any`: ESC + 背景クリック
- `none`: JavaScript 必須

---

#### command/commandfor 属性

**対応ブラウザ**: Chrome 135（2025年4月）

JavaScript なしで dialog を制御します。

```html
<button command="show-modal" commandfor="my-dialog">
  モーダルを開く
</button>

<dialog id="my-dialog">
  <h2>モーダルタイトル</h2>
  <p>内容...</p>
  <button command="close" commandfor="my-dialog">
    閉じる
  </button>
</dialog>
```

**command の種類:**
- `show-modal`: モーダル表示
- `show`: 非モーダル表示
- `close`: 閉じる

---

### Scroll-driven Animations

スクロール位置に応じたアニメーション制御。

```css
.parallax {
  animation: parallax-effect linear;
  animation-timeline: scroll();
}

@keyframes parallax-effect {
  from { transform: translateY(0); }
  to { transform: translateY(-100px); }
}
```

**ユースケース:**
- パララックス効果
- スクロールに連動した要素の表示/非表示
- プログレスバー

---

## 6. 次世代CSS機能（実装予定）

### @scope（CSSスコープ管理）

**対応ブラウザ**: Chrome 17.4（2024年3月）、Firefox 2025年予定

```css
@scope (.card) {
  h2 {
    font-size: 1.5rem;
  }

  p {
    color: #333;
  }
}
```

**利点:**
- CSS の副作用削減
- コンポーネント単位のスタイル管理

---

### if()関数（条件分岐）

**対応ブラウザ**: Chrome 129（2024年9月）予定

```css
.button {
  padding: if(
    style(--compact),
    0.5rem 1rem,
    1rem 2rem
  );
}
```

**ユースケース:**
- CSS 変数の値に応じた分岐
- メディアクエリやコンテナクエリを値として使用

---

### @function（カスタムCSS関数）

**対応ブラウザ**: Chrome 139（2025年8月）予定

```css
@function --space(--n) {
  result: calc(var(--base-space) * var(--n));
}

.card {
  padding: --space(2); /* 自動計算 */
  margin: --space(1);
}
```

**利点:**
- 複雑な計算をカプセル化
- 再利用可能なロジック

---

## 7. 実装ケーススタディ

### CSS Carousel（JavaScriptライブラリ不要）

```html
<div class="carousel">
  <div class="carousel-track">
    <div class="carousel-item">アイテム1</div>
    <div class="carousel-item">アイテム2</div>
    <div class="carousel-item">アイテム3</div>
  </div>
</div>
```

```css
.carousel-track {
  display: flex;
  scroll-snap-type: x mandatory;
  overflow-x: scroll;
  gap: 1rem;
}

.carousel-item {
  scroll-snap-align: start;
  flex: 0 0 100%;
}

/* スクロール状態の視覚化 */
.carousel:scroll-state(at-start) .prev-button {
  opacity: 0.3;
}

.carousel:scroll-state(at-end) .next-button {
  opacity: 0.3;
}
```

---

### Custom Select（深いカスタマイズ）

```css
select::option-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

select::selected-content {
  font-weight: bold;
  color: var(--primary-color);
}
```

**疑似要素:**
- `::option-content`: 各オプションのスタイル
- `::selected-content`: 選択中のオプション

---

## まとめ

### 2025年の主要トレンド

1. **JavaScriptへの依存削減**: HTML・CSSで多くが実現可能に
2. **アクセシビリティの自動化**: `contrast-color()` 等
3. **デザインの精密性向上**: `text-box`、`interpolate-size`
4. **インタラクション強化**: `scroll-state()`、View Transitions
5. **次世代機能の登場**: `@scope`、`if()`、`@function`

### ブラウザ対応の現状

主要ブラウザ（Chrome、Safari）で段階的に実装が進行中。Firefox も追従予定。

### 推奨事項

- 新機能は段階的に採用
- Polyfill やフォールバックを適切に設定
- プログレッシブエンハンスメントの考え方を維持

---

## 参考資料

- [MDN: text-autospace](https://developer.mozilla.org/en-US/docs/Web/CSS/text-autospace)
- [MDN: text-box](https://developer.mozilla.org/en-US/docs/Web/CSS/text-box)
- [MDN: View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [Chrome Platform Status](https://chromestatus.com/)

---

## 関連ナレッジ

- [モダンCSS 2025](./modern-css-2025.md)
- [View Transitions API](../javascript/web-apis/view-transitions.md)
- [Scroll-driven Animations](./animation/scroll-driven.md)
- [dialog要素](./components/dialog-modal-2025.md)
