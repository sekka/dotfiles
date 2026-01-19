---
title: 2025年の最新CSS機能（UIデザイン向け）
category: css
tags: [modern-css, 2025, safari, chrome, firefox, ui-design, new-features]
browser_support: Safari 17.4+, Chrome 115+, Firefox 110+（機能により異なる）
created: 2026-01-19
updated: 2026-01-19
---

# 2025年の最新CSS機能（UIデザイン向け）

> 出典: https://speakerdeck.com/clockmaker/the-latest-css-for-ui-design-2025
> 発表者: IKEDA Yasunobu (@clockmaker)
> イベント: MTDDC Meetup Tokyo 2025（2025年11月29日）
> 追加日: 2026-01-19

CSS は大きく進化し、以前は Chrome/Edge のみだった機能が主要ブラウザでサポートされ、実践的な UI 実装が可能になりました。「HTML+CSS の黄金時代」が到来しています。

## 概要

2025年は、Safari、Firefox、Chrome の3大ブラウザで多くの最新CSS機能が揃い、JavaScript フレームワークに頼らない複雑なインタラクティブ体験が実現可能になった年です。

### 主なトピック

1. テキスト処理の強化
2. インタラクティブ UI 機能
3. Dialog & Form の改善
4. 高度な CSS 機能（@scope, if(), @function）

---

## 1. テキスト処理機能

### text-autospace

**リリース**: Safari 18.4（2025年3月）、Chrome 123+

**機能**: 日本語とラテン文字の間のスペーシングを自動管理します。

```css
.text {
  text-autospace: normal; /* 自動スペーシング */
}
```

**値**:
- `normal`: 日本語とラテン文字の間に適切なスペースを自動挿入
- `no-autospace`: 自動スペーシングなし

**ユースケース**:
- 日本語と英語が混在する文章
- 見出しやボタンテキスト

**詳細**: [text-autospace の詳細](css/typography/text-autospace.md)

### text-box

**リリース**: Safari 18.2（2025年2月）、Chrome 120+

**機能**: テキストコンテナから余白をトリミングします。

```css
.text {
  text-box: trim-both cap alphabetic;
}
```

**構文**:
```css
text-box: <trim-mode> <edge-top> <edge-bottom>
```

- `<trim-mode>`: `trim-both`, `trim-start`, `trim-end`
- `<edge-top>`: `cap`, `text`, `ex`
- `<edge-bottom>`: `alphabetic`, `text`, `ideographic`

**ユースケース**:
- ボタン内のテキスト
- カード見出し
- padding の視覚的な均等化

**関連**: [ハーフレディング除去](css/typography/half-leading-trim.md)

### contrast-color()

**リリース**: Safari 26.0（2025年9月）、Chrome 130+

**機能**: 読みやすいコントラストのためにテキストカラーを自動選択します。

```css
button {
  background: var(--button-color);
  color: contrast-color(var(--button-color));
}
```

**動作**:
- 背景色に応じて、自動的に黒または白のテキスト色を選択
- WCAG コントラスト比を考慮

**ユースケース**:
- 動的な背景色を持つボタン
- テーマカラーに応じたテキスト
- アクセシビリティ対応

---

## 2. インタラクティブ UI 機能

### scroll-state()

**リリース**: Safari 26.0（2025年9月）、Chrome 130+

**機能**: コンテナ内のスクロール位置に基づいてスタイルを適用します。

```css
.container {
  scroll-state: scrollable;
}

.container:scroll-state(top) {
  /* スクロール位置が最上部 */
  border-top: none;
}

.container:scroll-state(bottom) {
  /* スクロール位置が最下部 */
  border-bottom: none;
}
```

**状態**:
- `top`: 最上部
- `bottom`: 最下部
- `scrollable`: スクロール可能

**ユースケース**:
- スクロールヒント
- スティッキーナビゲーション
- 無限スクロールのインジケーター

**関連**: [スクロールヒントシャドウ](css/animation/scroll-hint-shadow.md)

### interpolate-size

**リリース**: Safari 18.0（2024年9月）、Chrome 129+

**機能**: `auto` と固定値の間で滑らかなトランジションを可能にします。

```css
* {
  interpolate-size: allow-keywords;
}

details {
  transition: height 0.3s ease;
}

details[open] {
  height: auto; /* 滑らかにアニメーション */
}
```

**解決する問題**:
- `height: 0` から `height: auto` へのトランジションが不可能だった
- アコーディオンのアニメーションに JavaScript が必要だった

**ユースケース**:
- アコーディオン / `<details>` 要素
- 動的な高さを持つモーダル
- 折りたたみパネル

### sibling-index()

**リリース**: Safari 18.0（2024年6月）、Chrome 128+

**機能**: 要素の位置を取得し、段階的なアニメーションに使用します。

```css
.item {
  animation-delay: calc(sibling-index() * 0.1s);
}
```

**ユースケース**:
- リストアイテムの段階的フェードイン
- カードグリッドのスタガーアニメーション
- メニュー項目の順次表示

### sibling-count()

> 出典: https://ics.media/entry/260116/
> 執筆日: 2026年1月16日
> 追加日: 2026-01-19

**リリース**: Chrome/Edge 138+、Safari 26.2+

**機能**: 兄弟要素の総数（自身を含む）を返します。動的なレイアウト計算に使用できます。

```css
li {
  width: calc(sibling-count() * 100px);
}
```

**構文**:
```css
sibling-count() /* 引数なし */
```

**重要な特性**:
- 自分自身も含めた総数を返す（兄弟要素 + 1）
- 2つの要素なら `2` を返す、3つなら `3` を返す

**高度な使用例: 扇状配置**

`sibling-index()` と組み合わせて、カードを扇状に配置：

```css
li {
  transform:
    translateX(-50%)
    rotate(
      calc(
        (sibling-index() - (sibling-count() + 1) / 2) * 20deg
      )
    )
    translateY(-160px);
}
```

**動作の説明**:
- `(sibling-count() + 1) / 2` で中心位置を計算
- 7枚のカードの場合、中心は4番目（0度回転）
- 外側のカードは中心から等間隔で回転
- カードが削除されても自動的に再配置される

**ユースケース**:
- 動的なリストサイズに応じたレイアウト
- 兄弟要素数に基づくアニメーション
- 自動調整される扇状・円形配置

### HDR（High Dynamic Range）

**リリース**: Safari 26.0（2025年9月）、Chrome 130+

**機能**: HDR/SDR コンテンツの表示を管理します。

```css
.video-container {
  dynamic-range-limit: standard; /* SDR に制限 */
}

.hdr-image {
  dynamic-range-limit: no-limit; /* HDR を許可 */
}
```

**値**:
- `standard`: SDR（標準ダイナミックレンジ）
- `high`: HDR（高ダイナミックレンジ）
- `no-limit`: 制限なし

**ユースケース**:
- HDR ビデオコンテンツ
- 写真ギャラリー
- メディアプレーヤー

---

## 3. Dialog & Form の強化

### dialog closedby

**リリース**: Safari 25.0（2025年3月）、Chrome 127+

**機能**: ダイアログの閉じ方を制御します。

```html
<dialog closedby="any">
  <!-- Esc キーまたは外側クリックで閉じる -->
</dialog>

<dialog closedby="none">
  <!-- 明示的なボタンクリックのみで閉じる -->
</dialog>
```

**値**:
- `any`: Esc キーまたは外側クリックで閉じる
- `closerequest`: Esc キーのみ
- `none`: JavaScript のみで閉じる

**ユースケース**:
- モーダルダイアログ
- 重要な確認ダイアログ
- 複数ステップのウィザード

### dialog command/commandfor

**リリース**: Safari 26.0（2025年10月）、Chrome 132+

**機能**: JavaScript なしでモーダルを操作します。

```html
<button commandfor="my-dialog" command="showModal">
  ダイアログを開く
</button>

<dialog id="my-dialog">
  <p>コンテンツ</p>
  <button commandfor="my-dialog" command="close">
    閉じる
  </button>
</dialog>
```

**command の値**:
- `showModal`: モーダルとして表示
- `show`: 非モーダルとして表示
- `close`: 閉じる

**利点**:
- JavaScript 不要
- アクセシビリティ対応が組み込み
- 宣言的な記述

### select/option のスタイリング

**リリース**: Safari 25.0（2025年3月）、Chrome 127+

**機能**: ドロップダウンメニューの CSS カスタマイズを可能にします。

```css
select {
  appearance: base-select;
  background: white;
  border: 2px solid #ccc;
}

select::option-content {
  padding: 0.5rem;
  color: #333;
}

select::selected-content {
  background: #007bff;
  color: white;
}
```

**疑似要素**:
- `::option-content`: 各オプションのスタイル
- `::selected-content`: 選択されたオプションのスタイル
- `::picker-icon`: ドロップダウンアイコン

**ユースケース**:
- カスタムデザインの選択ボックス
- ブランドに合わせたフォームコントロール
- アクセシビリティを保ったスタイリング

#### `::picker(select)` 疑似要素と `<selectedcontent>` 要素

> 出典: https://ics.media/entry/250307/
> 執筆日: 2025年3月7日
> 追加日: 2026-01-19

**リリース**: Chrome 134+、Edge 134+（2025年3月）

**機能**: `::picker(select)` 疑似要素でドロップダウンリストの見た目を制御し、`<selectedcontent>` 要素で選択中のオプションを表示します。

```css
/* 有効化 */
select,
::picker(select) {
  appearance: base-select;
}

/* ドロップダウンのスタイリング */
.styled::picker(select) {
  border-color: #cf256d;
  border-radius: 8px;
  margin: 8px 0;
  box-shadow: 4px 4px #ff67b3;
  transition: scale 0.2s;
}
```

**`<selectedcontent>` 要素の使用**:

```html
<select class="city-select">
  <button class="city-select-button">
    <selectedcontent></selectedcontent>
  </button>
  <option value="seoul">Seoul</option>
</select>
```

```css
/* selectedcontent 内の特定コンテンツを非表示 */
selectedcontent .city-small {
  display: none;
}
```

**制限事項**:
- `multiple` または `size` 属性を持つ要素では使用不可
- モバイルとデスクトップで表示領域を考慮した設計が必要

---

## 4. 高度な CSS 機能

### @scope

**リリース**: Safari 17.4（2024年3月）、Chrome 118+

**機能**: スコープ付き CSS ルールで詳細度の問題を削減します。

```css
@scope (.card) {
  h2 {
    font-size: 1.5rem;
    color: #333;
  }

  p {
    color: #666;
  }
}
```

**構文**:
```css
@scope (<scope-root>) to (<scope-limit>) {
  /* ルール */
}
```

**利点**:
- コンポーネント単位のスタイル隔離
- 詳細度の問題を回避
- より予測可能な CSS

**ユースケース**:
- コンポーネントライブラリ
- デザインシステム
- レガシーコードとの共存

### if() 関数

**リリース**: Safari 18.0（2024年9月）、Chrome 129+

**機能**: メディアクエリに基づく条件付き CSS。

```css
.element {
  color: if(media(width <= 768px): red; else: blue);
  font-size: if(media(prefers-reduced-motion): 1rem; else: clamp(1rem, 2vw, 1.5rem));
}
```

**構文**:
```css
if(<condition>: <value-if-true>; else: <value-if-false>)
```

**ユースケース**:
- レスポンシブな値の設定
- アクセシビリティ対応の分岐
- テーマカラーの条件分岐

### @function

**リリース**: Safari 26.0（2025年8月）、Chrome 131+

**機能**: カスタム CSS 関数の定義。

```css
@function --space(--n) returns <length> {
  result: calc(var(--base-space) * var(--n));
}

.element {
  padding: --space(2); /* var(--base-space) * 2 */
  margin: --space(4);  /* var(--base-space) * 4 */
}
```

**構文**:
```css
@function <name>(<parameters>) returns <type> {
  result: <expression>;
}
```

**ユースケース**:
- デザインシステムのスペーシング関数
- カラー計算関数
- タイポグラフィスケール関数

---

## 実践的な UI 実装パターン

### カルーセル / スライダー

**実装**: HTML+CSS のみ、JavaScript ライブラリ不要

```css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
}

.carousel__item {
  flex: 0 0 100%;
  scroll-snap-align: start;
}

/* scroll-state() でインジケーター更新 */
.carousel:scroll-state(scrollable) .indicator {
  opacity: 1;
}
```

### アコーディオン / Details

**実装**: `interpolate-size` で滑らかな高さトランジション

```css
* {
  interpolate-size: allow-keywords;
}

details {
  transition: height 0.3s ease;
}

details[open] {
  height: auto;
}

summary {
  cursor: pointer;
  user-select: none;
}
```

### カスタム Select ドロップダウン

**実装**: ネイティブ `<select>` のスタイリング

```html
<select>
  <option value="1">オプション 1</option>
  <option value="2">オプション 2</option>
  <option value="3">オプション 3</option>
</select>
```

```css
select {
  appearance: base-select;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
}

select::option-content {
  padding: 0.5rem;
  transition: background 0.2s;
}

select::option-content:hover {
  background: #f0f0f0;
}

select::selected-content {
  background: #007bff;
  color: white;
}
```

### ダイアログモーダル

**実装**: 組み込み `closedby` でアクセシビリティ対応

```html
<button commandfor="modal" command="showModal">
  モーダルを開く
</button>

<dialog id="modal" closedby="any">
  <h2>タイトル</h2>
  <p>コンテンツ</p>
  <button commandfor="modal" command="close">
    閉じる
  </button>
</dialog>
```

```css
dialog {
  padding: 2rem;
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
```

---

## ブラウザサポートタイムライン（2025年）

| 時期 | 主な機能 | ブラウザ |
|------|---------|---------|
| **1月** | 複数機能が Safari/Firefox に到達 | Safari, Firefox |
| **3月-4月** | `text-autospace`, `dialog closedby`, `select` styling | Chrome, Safari, Firefox |
| **9月** | `scroll-state()`, `contrast-color()`, HDR | Chrome, Safari |
| **12月** | `@scope` 完全実装 | 全ブラウザ |

### 詳細なブラウザサポート

| 機能 | Safari | Chrome | Firefox |
|------|--------|--------|---------|
| `text-autospace` | 18.4+ (2025/03) | 123+ (2025/03) | 検討中 |
| `text-box` | 18.2+ (2025/02) | 120+ (2024/11) | 検討中 |
| `contrast-color()` | 26.0+ (2025/09) | 130+ (2025/09) | 検討中 |
| `scroll-state()` | 26.0+ (2025/09) | 130+ (2025/09) | 検討中 |
| `interpolate-size` | 18.0+ (2024/09) | 129+ (2024/09) | 検討中 |
| `sibling-index()` | 18.0+ (2024/06) | 128+ (2024/06) | 検討中 |
| `dialog closedby` | 25.0+ (2025/03) | 127+ (2025/03) | ✅ |
| `command/commandfor` | 26.0+ (2025/10) | 132+ (2025/10) | 検討中 |
| `select` styling | 25.0+ (2025/03) | 127+ (2025/03) | 検討中 |
| `@scope` | 17.4+ (2024/03) | 118+ (2023/10) | 検討中 |
| `if()` | 18.0+ (2024/09) | 129+ (2024/09) | 検討中 |
| `@function` | 26.0+ (2025/08) | 131+ (2025/08) | 検討中 |

---

## 重要なポイント

### 1. JavaScript からの移行

多くの UI パターンが JavaScript なしで実装可能になりました：

- カルーセル → CSS scroll-snap + scroll-state()
- アコーディオン → `<details>` + interpolate-size
- モーダル → `<dialog>` + command/commandfor
- カスタム Select → ネイティブ `<select>` + CSS

### 2. パフォーマンスの向上

CSS ネイティブ実装により：
- JavaScript バンドルサイズの削減
- ブラウザ最適化の恩恵
- より高速なレンダリング

### 3. アクセシビリティの改善

ネイティブ HTML 要素の使用により：
- スクリーンリーダー対応が組み込み
- キーボードナビゲーションが自動
- ARIA 属性が不要

### 4. メンテナンス性の向上

- 宣言的な記述
- ブラウザの仕様に準拠
- 長期的な互換性

---

## 移行ガイドライン

### JavaScript ライブラリから CSS への移行

#### Before（JavaScript）

```javascript
// カルーセルライブラリ
import Swiper from 'swiper';

new Swiper('.carousel', {
  slidesPerView: 1,
  navigation: true,
  pagination: true,
});
```

#### After（CSS）

```css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.carousel__item {
  flex: 0 0 100%;
  scroll-snap-align: start;
}
```

### プログレッシブエンハンスメント

```css
/* 基本スタイル */
details summary {
  cursor: pointer;
}

/* 機能サポート時 */
@supports (interpolate-size: allow-keywords) {
  * {
    interpolate-size: allow-keywords;
  }

  details {
    transition: height 0.3s ease;
  }
}
```

---

## まとめ

### キーメッセージ

> "The HTML+CSS golden age" for web UI development has arrived

**2025年は HTML+CSS の黄金時代** です。以前は JavaScript フレームワークが必要だった複雑なインタラクティブ体験が、ネイティブ機能で実現可能になりました。

### 推奨アクション

1. **既存プロジェクトの見直し**: JavaScript で実装している UI を CSS で置き換えられないか検討
2. **新規プロジェクト**: ネイティブ HTML+CSS を優先、必要な場合のみ JavaScript
3. **段階的な移行**: プログレッシブエンハンスメントで段階的に新機能を導入
4. **継続的な学習**: ブラウザサポート状況を追跡し、新機能を積極的に採用

---

## 関連ナレッジ

- [@scope によるスコープ付きCSS](css/selectors/scope.md)
- [ハーフレディング除去](css/typography/half-leading-trim.md)
- [スクロールヒントシャドウ](css/animation/scroll-hint-shadow.md)
- [Dialog & Modal 実装（2025年版）](css/components/dialog-modal-2025.md)

## 参考リソース

- [Speakerdeck: UIデザインに役立つ 2025年の最新CSS](https://speakerdeck.com/clockmaker/the-latest-css-for-ui-design-2025)
- [Can I use](https://caniuse.com/)
- [MDN Web Docs](https://developer.mozilla.org/)

---
