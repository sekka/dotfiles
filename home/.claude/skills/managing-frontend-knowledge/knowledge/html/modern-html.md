---
title: モダン HTML 要素
category: html
tags: [dialog, details, search, picture, semantic-html]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# モダン HTML 要素

セマンティックHTML、インタラクティブ要素、フォーム関連のナレッジ集。

---

## 令和の HTML 要素

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

モダンブラウザで使える便利な HTML 要素のまとめ。

### dialog 要素（モーダル）

JavaScript なしでモーダルの基本機能を実現。

**dialog要素の利点:**
- **アクセシビリティ**: フォーカストラップや適切なARIA属性が自動的に設定される
- **自動的な最前面表示**: `z-index`を使わなくても最上位に表示される
- **標準化された閉じ方**: Escキーやバックドロップクリックに対応
- **フォームとの統合**: `method="dialog"`で簡単にフォーム送信と連携

参考: [dialog要素を使用したモーダルウィンドウの実装例](https://www.tak-dcxi.com/article/implementation-example-of-a-modal-created-using-the-dialog-element)

```html
<dialog id="modal">
  <div>モーダルのコンテンツ</div>
  <form method="dialog">
    <button>閉じる</button>
  </form>
</dialog>

<button onclick="document.getElementById('modal').showModal()">
  モーダルを開く
</button>
```

```css
/* 背景のオーバーレイ */
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

/* 開閉アニメーション */
dialog {
  opacity: 0;
  transition: opacity 0.3s;
}

dialog[open] {
  opacity: 1;
}
```

```javascript
const dialog = document.getElementById("modal");

// モーダルを開く
dialog.showModal();

// モーダルを閉じる
dialog.close();

// 閉じたときのイベント
dialog.addEventListener("close", () => {
  console.log("モーダルが閉じられました");
});
```

**ブラウザ対応:** Chrome 37+, Firefox 98+, Safari 15.4+

**注意:** iOS Safari 15.3以下はサポート外のため、プロジェクトの要件を確認してから使用してください。

#### command / commandfor 属性による制御

> 出典（追加情報）: https://ics.media/entry/250904/
> https://shimotsuki.wwwxyz.jp/20251227-2003

JavaScript不要でdialogを制御できる新しい属性。

```html
<!-- モーダルダイアログ（JavaScript不要） -->
<button command="show-modal" commandfor="my-dialog">開く</button>
<dialog id="my-dialog">
  <p>モーダルの内容</p>
  <button command="close" commandfor="my-dialog">閉じる</button>
</dialog>

<!-- 非モーダルダイアログ -->
<button command="show-dialog" commandfor="nonmodal">開く</button>
<dialog id="nonmodal">
  <p>非モーダルの内容</p>
  <button command="close" commandfor="nonmodal">閉じる</button>
</dialog>
```

**command属性の値:**
- `show-modal`: モーダルとして開く
- `show-dialog`: 非モーダルとして開く
- `close`: ダイアログを閉じる

#### closedby 属性

ダイアログの閉じ方を制御。

```html
<!-- 任意の方法で閉じる（デフォルト） -->
<dialog closedby="any">...</dialog>

<!-- 明示的な操作のみで閉じる -->
<dialog closedby="closerequest">...</dialog>

<!-- プログラムでのみ閉じる -->
<dialog closedby="none">...</dialog>
```

**値の説明:**
- `any`: Escキー、外側クリック、closeメソッドすべて有効
- `closerequest`: Escキーまたはcloseメソッドのみ
- `none`: closeメソッドのみ

#### popover との違い

| 特性 | dialog（モーダル） | popover |
|------|------------------|---------|
| 外部操作 | 無効化 | 可能 |
| 閉じ方 | 特定操作のみ | 外側クリックで自動 |
| 背景 | `::backdrop` | なし |
| フォーカストラップ | あり | なし |
| 用途 | 重要な操作 | 補助情報 |

**使い分け:**
- **モーダル**: ユーザーの注意が必要な場合（確認ダイアログなど）
- **非モーダル**: 情報表示しつつ他の操作も可能にする
- **popover**: 軽量な情報表示（ツールチップなど）

#### イベント

```javascript
const dialog = document.querySelector('dialog');

// ダイアログが閉じられた時
dialog.addEventListener('close', () => {
  console.log('閉じられました');
});

// ダイアログを閉じる要求が発生した時（キャンセル可能）
dialog.addEventListener('cancel', (event) => {
  if (shouldPreventClose) {
    event.preventDefault();
  }
});
```

#### CSSセレクタ

```css
/* モーダル状態を選択 */
dialog:modal {
  /* モーダルとして表示中のスタイル */
}

/* open属性による選択 */
dialog[open] {
  /* 開いている状態のスタイル */
}

/* 背景オーバーレイ */
dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
```

#### 完全な実装例

```html
<button command="show-modal" commandfor="confirm-dialog">
  削除する
</button>

<dialog id="confirm-dialog" closedby="closerequest">
  <h2>確認</h2>
  <p>本当に削除しますか？この操作は取り消せません。</p>
  <div class="dialog-actions">
    <button command="close" commandfor="confirm-dialog">
      キャンセル
    </button>
    <button class="danger" id="confirm-button">
      削除する
    </button>
  </div>
</dialog>
```

```css
dialog {
  border: none;
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.danger {
  background: #dc3545;
  color: white;
}
```

```javascript
// 削除確認後の処理
document.getElementById('confirm-button').addEventListener('click', () => {
  performDelete();
  document.getElementById('confirm-dialog').close();
});
```

### details / summary 要素（アコーディオン）

JavaScript なしでアコーディオンを実装。

```html
<details>
  <summary>よくある質問</summary>
  <p>回答の内容がここに入ります。</p>
</details>

<!-- デフォルトで開いた状態 -->
<details open>
  <summary>開いた状態で表示</summary>
  <p>内容</p>
</details>
```

```css
/* マーカーのカスタマイズ */
summary {
  list-style: none;
  cursor: pointer;
}

summary::marker {
  display: none;
}

summary::before {
  content: "▶";
  margin-right: 0.5em;
  transition: transform 0.2s;
}

details[open] summary::before {
  transform: rotate(90deg);
}

/* アニメーション（grid trick） */
details > *:not(summary) {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s;
}

details[open] > *:not(summary) {
  grid-template-rows: 1fr;
}
```

**ブラウザ対応:** 全モダンブラウザ対応

### hgroup 要素（見出しグループ）

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5

見出しに複数の要素（主題+副題）がある場合は `<hgroup>` でグルーピングします。

```html
<hgroup>
  <h2>DX支援事業</h2>
  <p>経営課題をDXで解決</p>
</hgroup>
```

**メリット:**
- セマンティックに主題と副題の関係を表現できる
- スクリーンリーダーが見出しグループとして認識する
- CSSでスタイリングしやすくなる

参考: [主見出しと副見出しのマークアップにはhgroupを使う](https://www.tak-dcxi.com/article/use-hgroup-for-marking-up-the-main-heading-and-subheading)

**ブラウザ対応:** 全モダンブラウザ対応

### dl 要素（記述リスト）

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5

`<dl>` の直下には `<div>` を置き、その直下に `<dt>` と `<dd>` を置くことでスタイリングがしやすくなります。最新のWHATWGの仕様では `<dl>` の直下に `<div>` を置けるようになっています。

```html
<!-- divあり: スタイリングしやすい -->
<dl>
  <div>
    <dt>クラウドコンピューティング</dt>
    <dd>インターネット経由でコンピューターの資源を提供する...</dd>
  </div>
  <div>
    <dt>API</dt>
    <dd>Application Programming Interfaceの略で、ソフトウェア間で...</dd>
  </div>
</dl>

<!-- divなし: 従来の書き方（仕様的には問題なし） -->
<dl>
  <dt>クラウドコンピューティング</dt>
  <dd>インターネット経由でコンピューターの資源を提供する...</dd>
  <dt>API</dt>
  <dd>Application Programming Interfaceの略で、ソフトウェア間で...</dd>
</dl>
```

**CSSスタイリング例:**

```css
/* divを使うと、項目ごとにスタイリングしやすい */
dl > div {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

dt {
  font-weight: bold;
}

dd {
  margin: 0;
}
```

**ブラウザ対応:** 全モダンブラウザ対応

### search 要素（検索ランドマーク）

検索フォームやフィルター機能のセマンティックなラッパー。スクリーンリーダーが検索領域として認識する。

```html
<search>
  <form action="/search" method="get">
    <label for="query">サイト内を検索</label>
    <input type="search" name="q" id="query" placeholder="キーワードを入力" />
    <button type="submit">検索</button>
  </form>
</search>
```

**用途:**
- サイト内検索フォーム
- 商品フィルタリング機能
- 絞り込み検索UI

`<div role="search">` の代替として使用可能。スクリーンリーダーに「検索フォーム」であることを明示的に伝えられます。

参考: [HTML仕様にsearch要素が追加された](https://azukiazusa.dev/blog/the-search-element-has-been-added-to-the-html-specification/)

**ブラウザ対応:** Chrome 118+, Firefox 118+, Safari 17+

**注意:** iOS Safari 16.7以下はサポート外のため、プロジェクトの要件を確認してから使用してください。

### picture 要素（レスポンシブ画像）

> 出典（追加情報）: https://catnose.me/learning/html/picture/

CSSやJavaScriptを使わずにレスポンシブな画像切り替えを実現。

#### 基本構造

```html
<picture>
  <source srcset="image-url" media="(min-width: 800px)" />
  <source srcset="image-url" media="(min-width: 500px)" />
  <img src="fallback-url" alt="説明" />
</picture>
```

#### 2つの主要な用途

**1. 画面幅に応じた画像の切り替え**

```html
<picture>
  <!-- 1200px以上: デスクトップ用高解像度画像 -->
  <source srcset="desktop-large.jpg" media="(min-width: 1200px)" />

  <!-- 768px以上: タブレット用画像 -->
  <source srcset="tablet.jpg" media="(min-width: 768px)" />

  <!-- 500px以上: スマートフォン横向き用 -->
  <source srcset="mobile-landscape.jpg" media="(min-width: 500px)" />

  <!-- フォールバック: スマートフォン縦向き用 */
  <img src="mobile-portrait.jpg" alt="レスポンシブ画像" />
</picture>
```

**2. 画像フォーマットのフォールバック**

```html
<picture>
  <!-- AVIF対応ブラウザ用（最も軽量） -->
  <source srcset="image.avif" type="image/avif" />

  <!-- WebP対応ブラウザ用 -->
  <source srcset="image.webp" type="image/webp" />

  <!-- フォールバック（JPEG/PNG） -->
  <img src="image.jpg" alt="画像" />
</picture>
```

#### 評価順序

**重要:** `<source>` 要素は**上から順に評価**される。最初にマッチした条件の画像が使用される。

```html
<picture>
  <!-- ❌ 悪い例: 小さい条件を先に書くと、大きい画面でも小さい画像が選ばれる -->
  <source srcset="small.jpg" media="(min-width: 500px)" />
  <source srcset="large.jpg" media="(min-width: 1200px)" />

  <!-- ✅ 良い例: 大きい条件から順に書く -->
  <source srcset="large.jpg" media="(min-width: 1200px)" />
  <source srcset="small.jpg" media="(min-width: 500px)" />

  <img src="fallback.jpg" alt="画像" />
</picture>
```

#### 属性の説明

**srcset（必須）**
- 画像のURL
- カンマ区切りで複数指定可能（解像度対応）

```html
<source
  srcset="image-1x.jpg 1x, image-2x.jpg 2x"
  media="(min-width: 768px)"
/>
```

**media（オプション）**
- CSSメディアクエリと同じ構文
- レスポンシブ画像切り替えに使用

```html
<source srcset="wide.jpg" media="(min-width: 1024px)" />
<source srcset="narrow.jpg" media="(max-width: 767px)" />
```

**type（オプション）**
- MIMEタイプ
- 画像フォーマットのフォールバックに使用

```html
<source srcset="image.avif" type="image/avif" />
<source srcset="image.webp" type="image/webp" />
```

**width / height（推奨）**
- CLS（Cumulative Layout Shift）対策
- `<img>` に指定するのと同じ効果

```html
<source srcset="large.jpg" media="(min-width: 768px)" width="1200" height="800" />
```

#### img 要素は必須

```html
<picture>
  <source srcset="image.webp" type="image/webp" />
  <!-- img 要素は必須 -->
  <img src="image.jpg" alt="必須の代替テキスト" />
</picture>
```

**理由:**
1. **フォールバック**: すべての `<source>` がマッチしない場合
2. **アクセシビリティ**: `alt` 属性で代替テキストを提供
3. **SEO**: 検索エンジンが画像を認識

#### CSSとの併用

```html
<picture>
  <source srcset="wide.jpg" media="(min-width: 768px)" />
  <img src="narrow.jpg" alt="画像" class="responsive-image" />
</picture>
```

```css
/* pictureではなくimgにスタイルを適用 */
.responsive-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}
```

**注意:** CSSメディアクエリで画像を切り替えることも可能だが、`<picture>` を使う方が効率的（不要な画像をダウンロードしない）。

```css
/* 非推奨: すべての画像をダウンロードしてしまう */
.hero {
  background-image: url('small.jpg');
}

@media (min-width: 768px) {
  .hero {
    background-image: url('large.jpg'); /* small.jpgもダウンロード済み */
  }
}
```

#### 実践例

**アートディレクション（構図を変える）**

```html
<picture>
  <!-- デスクトップ: 横長の画像 -->
  <source srcset="landscape.jpg" media="(min-width: 768px)" />

  <!-- モバイル: 縦長の画像（主要な被写体をクロップ） -->
  <img src="portrait.jpg" alt="レスポンシブアートディレクション" />
</picture>
```

**高解像度ディスプレイ対応**

```html
<picture>
  <source
    srcset="image-1x.webp 1x, image-2x.webp 2x"
    type="image/webp"
  />
  <source
    srcset="image-1x.jpg 1x, image-2x.jpg 2x"
    type="image/jpeg"
  />
  <img src="image-1x.jpg" alt="高解像度対応画像" />
</picture>
```

**ダークモード対応**

```html
<picture>
  <!-- ダークモード用 -->
  <source srcset="dark.jpg" media="(prefers-color-scheme: dark)" />

  <!-- ライトモード用（デフォルト） -->
  <img src="light.jpg" alt="ダークモード対応画像" />
</picture>
```

#### loading / decoding 属性との併用

```html
<picture>
  <source srcset="large.webp" type="image/webp" />
  <img
    src="large.jpg"
    alt="画像"
    loading="lazy"
    decoding="async"
    width="1200"
    height="800"
  />
</picture>
```

**ポイント:**
- `loading` と `decoding` は `<img>` 要素に指定
- `width` と `height` は CLS 対策のため必須

#### ブラウザ対応

全モダンブラウザで対応済み（HTML5機能）。

**画像フォーマットのサポート:**
- **WebP**: Chrome, Firefox, Safari 14+, Edge
- **AVIF**: Chrome 85+, Firefox 93+, Safari 16+

#### パフォーマンスのベストプラクティス

```html
<picture>
  <!-- 最新フォーマットから順に -->
  <source srcset="image.avif" type="image/avif" />
  <source srcset="image.webp" type="image/webp" />

  <!-- フォールバック + 最適化 -->
  <img
    src="image.jpg"
    alt="最適化された画像"
    width="1200"
    height="800"
    loading="lazy"
    decoding="async"
  />
</picture>
```

**チェックリスト:**
- [ ] AVIFを最優先で指定
- [ ] WebPをフォールバックに
- [ ] JPEGを最終フォールバックに
- [ ] width/height を指定（CLS対策）
- [ ] loading="lazy" を追加（ファーストビュー外）
- [ ] decoding="async" を追加（必要に応じて）

#### 関連ナレッジ

- [loading 属性](./loading-attribute.md)
- [decoding 属性](#decoding-属性)
- [object-fit](../../css/layout/object-fit.md)

### button 要素の適切な使用

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5

`<button>` はフォーム送信ボタンだけでなく、フォーム以外の部分でも使えます。

#### type 属性

```html
<!-- フォーム送信（デフォルト） -->
<button type="submit">送信</button>

<!-- フォーム送信しない -->
<button type="button" id="js-trigger">クリック</button>

<!-- フォームリセット -->
<button type="reset">リセット</button>
```

**重要:** `type` を省略すると `submit` になります。JS でクリックイベントを処理する場合は `type="button"` を必ず明示してください。

#### button要素を使うべき理由

「要素をクリックした時に特定の処理を実行する」場合、クリック対象の要素は `<button>` か `<a>` を使います。`<div>` や `<p>` を使うと以下のデメリットが生じます：

```html
<!-- ✅ 正しい: button要素を使う -->
<button type="button" id="js-trigger-button">ボタン</button>

<!-- ❌ 間違い: divやpを使う -->
<p id="js-trigger-button">ボタン</p>
```

**divやpを使った場合の問題:**
- ブラウザによってはクリックやタップが反応しない
- フォーカスが当たらない（キーボード操作不可）
- スクリーンリーダーがボタンとして認識しない
- `:hover`、`:focus`、`:active` などの疑似クラスが期待通り動作しない

### input の新しい type

```html
<!-- 日付 -->
<input type="date" />
<input type="datetime-local" />
<input type="time" />

<!-- 数値 -->
<input type="number" min="0" max="100" step="1" />
<input type="range" min="0" max="100" />

<!-- その他 -->
<input type="color" />
<input type="search" />
<input type="tel" />
<input type="url" />
```

### loading 属性

```html
<!-- 画像の遅延読み込み -->
<img src="image.jpg" alt="" width="600" height="400" loading="lazy" />

<!-- iframe の遅延読み込み -->
<iframe src="https://example.com" loading="lazy" width="560" height="315"></iframe>
```

**重要:**
- `width` と `height` は CLS 対策のため必須
- ファーストビューの画像には使わない（LCP 悪化）
- 詳細は [パフォーマンス最適化](../cross-cutting/performance/performance-optimization.md) を参照

### decoding 属性

> 出典（詳細情報）: https://zenn.dev/ixkaito/articles/deep-dive-into-decoding
> 執筆日: 2023年7月
> 検証環境: Chrome 115

画像のデコード方法をブラウザに示唆する属性。

#### 基本的な使い方

```html
<!-- 同期デコード -->
<img src="image.jpg" alt="" decoding="sync" />

<!-- 非同期デコード -->
<img src="image.jpg" alt="" decoding="async" />

<!-- 自動（デフォルト） -->
<img src="image.jpg" alt="" decoding="auto" />
```

#### loading 属性との違い

| 属性 | 制御対象 | 説明 |
|------|---------|------|
| `loading` | ダウンロード時期 | 画像を即座に取得するか、遅延させるか |
| `decoding` | デコード方法 | 画像をどのようにデコードするか |

```html
<!-- loading: ダウンロードのタイミングを制御 -->
<img src="image.jpg" loading="lazy" />

<!-- decoding: デコードの方法を制御 -->
<img src="image.jpg" decoding="async" />

<!-- 併用可能 -->
<img src="image.jpg" loading="lazy" decoding="async" />
```

#### 各値の動作

**sync（同期）**
- デコードが完了するまで、画像表示を待機
- 他のコンテンツのレンダリングには影響しない（よくある誤解）

**async（非同期）**
- デコードを非同期で実行
- 他のコンテンツのレンダリングをブロックしない
- FP（First Paint）、FCP（First Contentful Paint）への影響を最小化

**auto（デフォルト）**
- ブラウザが最適な方法を自動選択
- ほとんどの場合、これで十分

#### パフォーマンス特性

**検証結果（Chrome 115）:**

| 状況 | sync | async | 差異 |
|------|------|-------|------|
| キャッシュなし | 顕著な差なし | 顕著な差なし | ダウンロードがボトルネック |
| キャッシュあり | FP/FCP/LCPがデコード依存 | FP/FCP/LCPがデコード非依存 | asyncが有利 |

**重要な発見:**
- ダウンロードされた画像がすべてデコードされるわけではない
- ビューポート近くの画像のみがデコードされる
- キャッシュされた画像では`async`の効果が顕著

#### 使用推奨

```html
<!-- ファーストビューの重要な画像: sync -->
<img src="hero.jpg" alt="" decoding="sync" fetchpriority="high" />

<!-- スクロールで表示される画像: async -->
<img src="content.jpg" alt="" decoding="async" loading="lazy" />

<!-- 通常はautoで十分 -->
<img src="image.jpg" alt="" decoding="auto" />
```

#### よくある誤解

**誤解1:** `decoding="sync"` はページレンダリングをブロックする
- **実際:** 画像表示のみを待機、他のコンテンツは表示される

**誤解2:** `async` はダウンロードを非同期化する
- **実際:** デコードを非同期化、ダウンロードは `loading` 属性で制御

**誤解3:** `async` を使えば必ず高速化する
- **実際:** キャッシュされた画像や、デコードがボトルネックの場合に効果あり

#### 推奨戦略

```html
<!-- 基本方針: autoに任せる -->
<img src="image.jpg" alt="" />

<!-- 明示的な制御が必要な場合のみ指定 -->
<img src="important.jpg" alt="" decoding="sync" fetchpriority="high" />
<img src="lazy-image.jpg" alt="" decoding="async" loading="lazy" />
```

**著者の結論（記事より）:**
- 基本的に `decoding="auto"` で問題ない
- 必要に応じて明示的に選択
- ブラウザの実装変更に注意

#### ブラウザ対応

全モダンブラウザで対応済み。ただし、実装の詳細はブラウザにより異なる可能性あり。

#### 注意事項

- 過度な最適化は不要（autoで十分なケースが多い）
- パフォーマンス計測をせずに盲目的に`async`を使わない
- ブラウザの最適化は日々進化しているため、定期的な検証が推奨される

### fetchpriority 属性

> 出典: https://zenn.dev/dinii/articles/16b3e71b580b6c

リソースの取得優先度を明示的に指定。LCP（Largest Contentful Paint）の最適化に有効。

```html
<!-- 重要な画像を優先的に読み込む -->
<img src="hero.jpg" alt="" fetchpriority="high" />

<!-- 優先度を下げる -->
<img src="thumbnail.jpg" alt="" fetchpriority="low" />

<!-- デフォルト（省略時） -->
<img src="normal.jpg" alt="" fetchpriority="auto" />
```

**ユースケース:**
- ファーストビューの大きな画像（ヒーロー画像）に `high` を指定
- スクロールしないと見えない画像に `low` を指定
- 重要度の高いスクリプトやスタイルシートに適用可能

```html
<link rel="stylesheet" href="critical.css" fetchpriority="high" />
<script src="analytics.js" fetchpriority="low" async></script>
```

**ブラウザ対応:** Chrome 101+, Edge 101+, Safari 17.2+

### blocking 属性

> 出典: https://zenn.dev/dinii/articles/16b3e71b580b6c

レンダリングのブロック動作を制御。

```html
<!-- レンダリングをブロックする -->
<link rel="stylesheet" href="critical.css" blocking="render" />

<!-- ブロックしない（非同期読み込み） -->
<script src="app.js" blocking="none"></script>
```

**注意:** デフォルトでは `<link rel="stylesheet">` と `<script>` はレンダリングをブロックするため、意図的に制御したい場合に使用。

### inputmode 属性

> 出典: https://zenn.dev/dinii/articles/16b3e71b580b6c

仮想キーボードの種類を最適化。モバイルUX改善に有効。

```html
<!-- 数値入力 -->
<input type="text" inputmode="numeric" />

<!-- 電話番号 -->
<input type="text" inputmode="tel" />

<!-- メールアドレス -->
<input type="text" inputmode="email" />

<!-- URL -->
<input type="text" inputmode="url" />

<!-- 検索 -->
<input type="text" inputmode="search" />

<!-- 小数点を含む数値 -->
<input type="text" inputmode="decimal" />
```

**`type="number"` との違い:**
- `type="number"` はスピンボタン（増減ボタン）が表示される
- `inputmode="numeric"` は見た目は通常のテキストフィールドだが、キーボードは数値用

**ブラウザ対応:** 全モダンブラウザ対応（iOS Safari 12.2+）

### enterkeyhint 属性

> 出典: https://zenn.dev/dinii/articles/16b3e71b580b6c

仮想キーボードのEnterキーの表示を最適化。

```html
<!-- 次のフィールドへ -->
<input type="text" enterkeyhint="next" />

<!-- 完了 -->
<input type="text" enterkeyhint="done" />

<!-- 移動 -->
<input type="url" enterkeyhint="go" />

<!-- 検索 -->
<input type="search" enterkeyhint="search" />

<!-- 送信 -->
<input type="text" enterkeyhint="send" />

<!-- 前のフィールドへ -->
<input type="text" enterkeyhint="previous" />
```

**ユースケース:**
- フォームの最後のフィールドに `done`
- 検索ボックスに `search`
- チャット送信に `send`
- URL入力に `go`

**ブラウザ対応:** Chrome 77+, Safari 13.7+

### inert 属性

> 出典: https://zenn.dev/dinii/articles/16b3e71b580b6c

要素とその子要素を完全に無効化（操作不可、フォーカス不可、スクリーンリーダー非表示）。

```html
<div inert>
  <!-- この中の全要素が無効化される -->
  <button>クリックできない</button>
  <input type="text" />
</div>
```

**ユースケース:**
- モーダル表示時に背景コンテンツを無効化
- ローディング中の操作を防ぐ
- サイドバーの開閉時の制御

```javascript
// モーダルを開く
const modal = document.getElementById('modal');
const mainContent = document.getElementById('main');

modal.showModal();
mainContent.inert = true; // 背景を無効化

// モーダルを閉じる
modal.close();
mainContent.inert = false;
```

**`disabled` との違い:**
- `disabled` はフォーム要素のみ
- `inert` はあらゆる要素に適用可能で、子孫要素すべてが対象

**ブラウザ対応:** Chrome 102+, Firefox 112+, Safari 15.5+

### Popover API

> 出典: https://zenn.dev/dinii/articles/16b3e71b580b6c

JavaScript最小限でポップオーバーを実装。トップレイヤーで表示されるため、z-index競合を回避。

```html
<button popovertarget="my-popover">ポップオーバーを開く</button>

<div id="my-popover" popover>
  <p>ポップオーバーの内容</p>
  <button popovertarget="my-popover" popovertargetaction="hide">
    閉じる
  </button>
</div>
```

**自動と手動の制御:**

```html
<!-- 自動: 外側クリックで自動的に閉じる（デフォルト） -->
<div popover="auto">...</div>

<!-- 手動: 明示的に閉じる必要がある -->
<div popover="manual">...</div>
```

**JavaScript API:**

```javascript
const popover = document.getElementById('my-popover');

// 開く
popover.showPopover();

// 閉じる
popover.hidePopover();

// トグル
popover.togglePopover();

// イベントリスナー
popover.addEventListener('beforetoggle', (e) => {
  console.log('開閉前:', e.newState); // 'open' or 'closed'
});
```

**CSS でのスタイリング:**

```css
[popover] {
  /* デフォルトは display: none */
  border: 1px solid #ccc;
  padding: 1em;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 開いた状態 */
[popover]:popover-open {
  /* アニメーション可能 */
  animation: fadeIn 0.2s;
}

/* 背景（::backdrop は使えない） */
/* トップレイヤーだが backdrop なし */
```

**ブラウザ対応:** Chrome 114+, Edge 114+, Safari 17+

### rel 属性の SEO 値

> 出典: https://zenn.dev/dinii/articles/16b3e71b580b6c

リンクの性質を検索エンジンに伝える。

```html
<!-- スポンサーリンク -->
<a href="https://sponsor.example.com" rel="sponsored">
  スポンサー
</a>

<!-- ユーザー生成コンテンツ（UGC） -->
<a href="https://user-post.example.com" rel="ugc">
  ユーザーの投稿
</a>

<!-- SEO評価を渡さない -->
<a href="https://untrusted.example.com" rel="nofollow">
  リンク先
</a>

<!-- 複数指定可能 -->
<a href="https://example.com" rel="sponsored nofollow">
  広告リンク
</a>
```

**値の意味:**

| 値 | 意味 | 用途 |
|----|------|------|
| `sponsored` | 広告・スポンサーリンク | アフィリエイト、広告 |
| `ugc` | ユーザー生成コンテンツ | コメント欄、フォーラム投稿 |
| `nofollow` | リンク先を推薦しない | 信頼できないコンテンツ |

**SEO への影響:**
- Googleは `sponsored`/`ugc`/`nofollow` を区別して評価
- 適切に使用することでペナルティを回避
- `nofollow` は古い記法だが、依然として有効

---

## パフォーマンスとベストプラクティス

### rel="preload" によるリソースの優先読み込み

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5

優先的に読み込みたいリソースがある場合は `<link>` の `rel="preload"` を使います。ファーストビューの画像や動画の表示が遅い時に、優先的に読み込むと改善する可能性があります。

```html
<link rel="preload" href="mv.webp" as="image" type="image/webp" />
```

**用途:**
- ファーストビューの画像
- ファーストビューの動画
- Webフォント
- 重要なCSSファイル

**as 属性の値:**
- `image`: 画像
- `video`: 動画
- `font`: フォント（`crossorigin`属性も必要）
- `style`: スタイルシート
- `script`: JavaScript

```html
<!-- Webフォント -->
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin />

<!-- 重要なCSS -->
<link rel="preload" href="critical.css" as="style" />

<!-- 重要なJavaScript -->
<link rel="preload" href="main.js" as="script" />
```

参考:
- [MDN: rel="preload"](https://developer.mozilla.org/ja/docs/Web/HTML/Attributes/rel/preload)
- [画像をプリロードする](https://zenn.dev/hrbrain/articles/7f1d1d45f027c7#画像をプリロードする)

**注意:** 過度な使用はかえってパフォーマンスを悪化させるため、本当に必要なリソースにのみ使用してください。

### CDNの使用は非推奨

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5

CDN（Contents Delivery Network）でプラグインなどの外部ファイルを読み込むのは非推奨です。

```html
<!-- ❌ 非推奨: CDNから読み込み -->
<script src="https://cdn.jsdelivr.net/..."></script>

<!-- ✅ 推奨: ローカルファイルを使用 -->
<script src="/js/bundle.js"></script>
```

**CDNを避けるべき理由:**
- CDNのサーバーに障害が発生したら動かなくなる
- CDNの提供自体が終了したらプラグインが動かなくなる
- セキュリティリスク（第三者によるコード改ざんの可能性）
- プライバシーの問題（ユーザーのアクセス情報が第三者に送信される）

**推奨される方法:**
1. **NPMを使える環境**: NPMで依存関係を管理
2. **NPMを使えない環境**: ファイルをダウンロードして同プロジェクト内に配置

### インラインSVGの最適な管理方法

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5

SVGの色をCSS側で変えたい時は、SVGを `<symbol>` に変換して別ファイルに保存し、それを `<use>` で呼び出します。こうすることでSVGの記述量が少なくなるのでHTMLの可読性が高まります。

```html
<div class="icon">
  <svg>
    <use xlink:href="img/arrow.svg#arrow"></use>
  </svg>
</div>
```

**img/arrow.svg:**
```xml
<svg xmlns="http://www.w3.org/2000/svg">
  <symbol id="arrow" viewBox="0 0 24 24">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
  </symbol>
</svg>
```

**最適化のポイント:**
- `<svg>` の `width`、`height`、`fill` 属性を削除する（CSSで扱いやすくなる）
- 複数のSVGを1つのファイルにまとめる（スプライト化）
- CSSで色やサイズを自由に変更できる

```css
.icon svg {
  width: 24px;
  height: 24px;
  fill: currentColor; /* 親要素のcolorを継承 */
}

.icon:hover svg {
  fill: blue;
}
```

**従来の方法との比較:**

```html
<!-- ❌ 非効率: SVGコードをそのまま埋め込み -->
<div class="icon">
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="red"/>
  </svg>
</div>

<!-- ✅ 効率的: use要素で参照 -->
<div class="icon">
  <svg>
    <use xlink:href="img/arrow.svg#arrow"></use>
  </svg>
</div>
```

**メリット:**
- HTMLの可読性が向上
- 同じSVGを複数箇所で再利用可能
- CSSでスタイリングしやすい
- ファイルサイズの削減（同じSVGを何度も書かない）

---
