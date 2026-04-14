# UI デザイン実用テクニック集

プロのUIデザイナーが実際の製品でテスト・検証した、即実践できるテクニック集。

**出典**: [UI Tips for Landing Pages & Apps by Jim Raptis](https://photoshopvip.net/160552)

---

## 1. ソーシャルログイン配置

### 概要
コンバージョン率を高めるログイン配置手法。

### 実装

```html
<div class="auth-container">
  <!-- ソーシャルログイン: 上部 -->
  <div class="social-auth">
    <button class="social-btn social-btn--google">
      <img src="/icons/google.svg" alt="">
      Continue with Google
    </button>
    <button class="social-btn social-btn--github">
      <img src="/icons/github.svg" alt="">
      Continue with GitHub
    </button>
  </div>

  <!-- 区切り線 -->
  <div class="divider">
    <span>or</span>
  </div>

  <!-- メールログイン: 下部 -->
  <form class="email-auth">
    <input type="email" placeholder="Email address" />
    <input type="password" placeholder="Password" />
    <button type="submit">Sign in</button>
  </form>
</div>
```

```css
.auth-container {
  max-width: 400px;
  padding: 2rem;
}

.social-auth {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  background: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.social-btn:hover {
  background: #f5f5f5;
}

.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e0e0e0;
}

.divider span {
  position: relative;
  padding: 0 1rem;
  background: #fff;
  color: #999;
  font-size: 0.875rem;
}
```

### 適用場面
- ログイン・サインアップページ
- SaaS製品のオンボーディング

### ポイント
- ソーシャルログインを上部に配置（優先度高）
- プライバシー重視ユーザー向けにメール認証も用意

---

## 2. アイコン付きメニュー

### 概要
視覚的にメニューを識別しやすくする手法。

### 実装

```html
<nav class="menu">
  <button class="menu-item">
    <svg class="menu-icon"><!-- アイコン --></svg>
    <span>Edit</span>
  </button>
  <button class="menu-item menu-item--active">
    <svg class="menu-icon"><!-- アイコン --></svg>
    <span>Duplicate</span>
  </button>
  <button class="menu-item menu-item--danger">
    <svg class="menu-icon"><!-- アイコン --></svg>
    <span>Delete</span>
  </button>
</nav>
```

```css
.menu {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  padding: 0.5rem;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item--active {
  background: #e3f2fd;
  color: #1976d2;
}

.menu-item--danger {
  color: #d32f2f;
}

.menu-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}
```

### 適用場面
- ドロップダウンメニュー
- コンテキストメニュー
- ナビゲーションメニュー

### ポイント
- アイコンで視覚的に識別可能に
- アクティブ状態を明示
- 危険な操作（削除等）は色で区別

---

## 3. グーテンベルグの法則（Zパターン）

### 概要
ユーザーの視線は左上から右下へZ字型に移動する原則を活用。

### 実装

```html
<header class="hero">
  <div class="hero-content">
    <!-- 左上: ロゴ -->
    <div class="hero-logo">
      <img src="/logo.svg" alt="Company Logo" />
    </div>

    <!-- 右上: ナビゲーション -->
    <nav class="hero-nav">
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
    </nav>

    <!-- 中央: 見出し・説明 -->
    <div class="hero-text">
      <h1>Your Main Value Proposition</h1>
      <p>Supporting description text</p>
    </div>

    <!-- 右下: CTA -->
    <div class="hero-cta">
      <button class="btn btn--primary">Get Started</button>
      <button class="btn btn--secondary">Learn More</button>
    </div>
  </div>
</header>
```

```css
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  display: grid;
  grid-template-areas:
    "logo nav"
    "text text"
    "cta cta";
  grid-template-columns: 1fr auto;
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
  padding: 2rem;
}

.hero-logo {
  grid-area: logo;
}

.hero-nav {
  grid-area: nav;
  display: flex;
  gap: 2rem;
}

.hero-text {
  grid-area: text;
  text-align: center;
}

.hero-cta {
  grid-area: cta;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
```

### 適用場面
- ランディングページ
- ヒーローセクション

### ポイント
- 視線フローの最後（右下）にCTAを配置
- 自然な視線移動でアクションへ誘導

---

## 4. 明確なボタンコピー

### 概要
"はい/いいえ"ではなく、具体的なアクションを示すボタンテキスト。

### 実装（悪い例）

```html
<dialog class="modal">
  <p>削除してもよろしいですか？</p>
  <div class="modal-actions">
    <button>はい</button>
    <button>いいえ</button>
  </div>
</dialog>
```

### 実装（良い例）

```html
<dialog class="modal">
  <h2 class="modal-title">ファイルを削除</h2>
  <p class="modal-description">
    この操作は取り消せません。本当に削除しますか？
  </p>
  <div class="modal-actions">
    <button class="btn btn--secondary">キャンセル</button>
    <button class="btn btn--danger">削除する</button>
  </div>
</dialog>
```

```css
.modal {
  max-width: 400px;
  padding: 1.5rem;
  border: none;
  border-radius: 0.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.modal-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-description {
  margin: 0 0 1.5rem;
  color: #666;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn--danger {
  background: #d32f2f;
  color: #fff;
}

.btn--danger:hover {
  background: #c62828;
}
```

### 適用場面
- 確認ダイアログ
- 削除・重要な操作の確認

### ポイント
- ボタンテキストでアクションを明示
- 危険な操作は目立たないデザインに
- デフォルトアクション（キャンセル）を優先

---

## 5. 要素の幅を揃える

### 概要
サイズが不揃いな要素を視覚的に整列させる手法。

### 実装

```html
<div class="card-grid">
  <div class="card">
    <img src="/image1.jpg" alt="" />
    <h3>短いタイトル</h3>
  </div>
  <div class="card">
    <img src="/image2.jpg" alt="" />
    <h3>とても長いタイトルのカード</h3>
  </div>
  <div class="card">
    <img src="/image3.jpg" alt="" />
    <h3>中程度の長さ</h3>
  </div>
</div>
```

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card {
  display: flex;
  flex-direction: column;
  /* 重要: すべてのカードを同じ幅に */
  width: 100%;
  padding: 1rem;
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 0.5rem;
}

.card h3 {
  margin: 1rem 0 0;
  /* タイトルの長さに関わらず、カード幅は統一 */
}
```

### 適用場面
- カードレイアウト
- ボタングループ
- フォーム要素

### ポイント
- 最大幅の要素を基準に、他の要素も同じ幅に設定
- グリッドレイアウトで均等配置

---

## 6. 危険なアクションは目立たせない

### 概要
削除など、取り消せない危険なアクションは控えめなスタイルに。

### 実装

```html
<div class="action-group">
  <!-- プライマリアクション: 目立つ -->
  <button class="btn btn--primary">保存する</button>

  <!-- セカンダリアクション: 控えめ -->
  <button class="btn btn--secondary">キャンセル</button>

  <!-- 危険なアクション: さらに控えめ -->
  <button class="btn btn--danger-subtle">削除</button>
</div>
```

```css
.action-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn--primary {
  background: #1976d2;
  color: #fff;
  border: none;
}

.btn--primary:hover {
  background: #1565c0;
}

.btn--secondary {
  background: transparent;
  color: #666;
  border: 1px solid #e0e0e0;
}

.btn--secondary:hover {
  background: #f5f5f5;
}

/* 危険なアクション: テキストボタンで控えめに */
.btn--danger-subtle {
  background: transparent;
  color: #d32f2f;
  border: none;
  font-size: 0.875rem;
}

.btn--danger-subtle:hover {
  background: rgba(211, 47, 47, 0.08);
}
```

### 適用場面
- フォームアクション
- データ削除操作
- モーダルダイアログ

### ポイント
- 複数のスタイル（色、サイズ、タイプ、配置）を組み合わせて差別化
- デフォルトアクションを最も目立たせる
- 危険なアクションは最も控えめに

---

## 7. Above the Fold に CTA 配置

### 概要
スクロールせずに見える範囲（Above the Fold）にCTAを配置。

### 実装

```html
<section class="hero-section">
  <div class="hero-container">
    <h1 class="hero-title">
      スクロールなしで見える<br />
      強力なメッセージ
    </h1>
    <p class="hero-subtitle">
      訪問者の多くはスクロールせずに離脱します
    </p>

    <!-- Above the Fold の CTA -->
    <div class="hero-cta">
      <button class="btn btn--primary btn--large">
        今すぐ始める
      </button>
      <button class="btn btn--secondary btn--large">
        デモを見る
      </button>
    </div>
  </div>
</section>
```

```css
.hero-section {
  /* ビューポート高さいっぱいに */
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  text-align: center;
}

.hero-container {
  max-width: 800px;
  padding: 2rem;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 1rem;
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  opacity: 0.9;
  margin: 0 0 2rem;
}

.hero-cta {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn--large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}
```

### 適用場面
- ランディングページ
- 製品ページ
- SaaS サイト

### ポイント
- ビューポート高さ（100vh）を活用
- CTAは即座に目に入る位置に

---

## 8. 視覚的階層の作り方

### 概要
タイトル・小見出し・本文の階層を明確にする手法。

### 実装

```html
<article class="content">
  <h1 class="content-title">完璧なヘッダー</h1>
  <h2 class="content-subtitle">階層をうまく実現する小技ハック</h2>
  <p class="content-body">
    説明文は読みやすさを重視して、適切な行の高さと
    コントラストを調整します。
  </p>
</article>
```

```css
.content {
  max-width: 65ch; /* 読みやすい文字数 */
  line-height: 1.6;
}

.content-title {
  /* タイプスケール: x1.25 で階層化 */
  font-size: 2.5rem; /* 40px */
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 0.5rem;
  /* 左揃えで読みやすく */
  text-align: left;
}

.content-subtitle {
  /* 40 / 1.25 = 32px */
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 0 0 1rem;
  /* コントラストを低く */
  color: #666;
}

.content-body {
  font-size: 1rem; /* 16px */
  font-weight: 400;
  /* 適切な行の高さ */
  line-height: 1.6;
  margin: 0;
  color: #333;
}
```

### タイプスケール計算

```css
:root {
  --scale-ratio: 1.25;
  --text-base: 1rem; /* 16px */
  --text-lg: calc(var(--text-base) * var(--scale-ratio)); /* 20px */
  --text-xl: calc(var(--text-lg) * var(--scale-ratio)); /* 25px */
  --text-2xl: calc(var(--text-xl) * var(--scale-ratio)); /* 31.25px */
  --text-3xl: calc(var(--text-2xl) * var(--scale-ratio)); /* 39px */
}
```

### 適用場面
- ブログ記事
- ドキュメントページ
- コンテンツセクション

### ポイント
- 一貫したタイプスケール（x1.25）
- フォントウェイトで強調
- 小見出しはコントラストを低く
- 左揃えで読みやすく

---

## 9. テンプレート活用で空状態をアップグレード

### 概要
空の状態でテンプレートを提供し、製品価値を早く体験させる。

### 実装

```html
<div class="empty-state">
  <div class="empty-state-content">
    <svg class="empty-state-icon"><!-- アイコン --></svg>
    <h2 class="empty-state-title">プロジェクトがありません</h2>
    <p class="empty-state-description">
      テンプレートから始めて、すぐに価値を体験しましょう
    </p>

    <!-- テンプレート一覧 -->
    <div class="template-grid">
      <button class="template-card">
        <img src="/templates/marketing.png" alt="" />
        <h3>マーケティングページ</h3>
      </button>
      <button class="template-card">
        <img src="/templates/portfolio.png" alt="" />
        <h3>ポートフォリオ</h3>
      </button>
      <button class="template-card">
        <img src="/templates/blog.png" alt="" />
        <h3>ブログ</h3>
      </button>
    </div>

    <button class="btn btn--secondary">
      ゼロから作成
    </button>
  </div>
</div>
```

```css
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.empty-state-content {
  text-align: center;
  max-width: 800px;
}

.empty-state-icon {
  width: 4rem;
  height: 4rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.empty-state-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.empty-state-description {
  color: #666;
  margin: 0 0 2rem;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.template-card {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 0.75rem;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  border-color: #1976d2;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15);
}

.template-card img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
}

.template-card h3 {
  font-size: 0.9375rem;
  margin: 0;
}
```

### 適用場面
- ダッシュボード（初回）
- プロジェクト管理ツール
- コンテンツ作成ツール

### ポイント
- テンプレートで製品価値を早く体験
- ゼロから作成オプションも提供
- 採用・購入の後押しにつながる

---

## 10. 画面幅いっぱいのテキストを避ける

### 概要
読みやすさを考慮した文字幅の制限。

### 実装（悪い例）

```css
.content {
  /* 画面幅いっぱい = 読みにくい */
  width: 100%;
}
```

### 実装（良い例）

```css
.content {
  /* 文字数で制限（推奨）*/
  max-width: 65ch; /* 1行 65文字 */

  /* またはピクセルで制限 */
  max-width: min(700px, 100%);

  /* 中央揃え */
  margin-inline: auto;
  padding-inline: 1rem;
}
```

### 文字数単位の活用

```css
/* chユニット: 文字幅の倍数 */
.narrow {
  max-width: 45ch; /* 短い文章 */
}

.comfortable {
  max-width: 65ch; /* 最適な読みやすさ */
}

.wide {
  max-width: 80ch; /* 長文記事 */
}
```

### 適用場面
- ブログ記事
- ドキュメント
- ランディングページの本文

### ポイント
- `ch` 単位で文字数ベースの幅制限
- 500px-700px が読みやすい範囲
- レスポンシブに対応（min()関数活用）

---

## 11. カードをクリック可能に

### 概要
カード全体をクリック可能にし、CTAボタンで明示的に誘導。

### 実装

```html
<article class="card">
  <a href="/article/123" class="card-link">
    <img src="/thumbnail.jpg" alt="" class="card-image" />
    <div class="card-content">
      <h3 class="card-title">記事タイトル</h3>
      <p class="card-description">
        カード全体がクリック可能であることを明示します
      </p>
      <span class="card-cta">
        続きを読む
        <svg class="icon-arrow"><!-- → --></svg>
      </span>
    </div>
  </a>
</article>
```

```css
.card {
  position: relative;
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.card-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
}

.card-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.card-description {
  margin: 0 0 1rem;
  color: #666;
  line-height: 1.5;
}

.card-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #1976d2;
  font-weight: 500;
  font-size: 0.9375rem;
}

.card:hover .card-cta {
  gap: 0.75rem; /* ホバー時にアイコンが右へ */
}

.icon-arrow {
  width: 1rem;
  height: 1rem;
  transition: transform 0.3s;
}
```

### 適用場面
- ブログカード
- 製品一覧
- ポートフォリオグリッド

### ポイント
- カード全体を`<a>`で囲む
- CTAボタンでクリック可能を明示
- ホバーエフェクトで視覚的フィードバック

---

## 12. ツールチップのレスポンシブ化

### 概要
モバイルでホバーが使えない問題を解決する手法。

### 実装

```html
<div class="form-field">
  <label for="password">
    パスワード
    <!-- ヘルプアイコン（クリック可能）-->
    <button
      type="button"
      class="help-btn"
      aria-label="パスワードのヘルプ"
      popovertarget="password-help"
    >
      <svg class="icon-help">?</svg>
    </button>
  </label>

  <input type="password" id="password" />

  <!-- Popover API でツールチップ -->
  <div id="password-help" popover class="tooltip">
    8文字以上、大文字・小文字・数字を含む必要があります
  </div>
</div>
```

```css
.form-field {
  position: relative;
  margin-bottom: 1.5rem;
}

label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.help-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: 1px solid #ccc;
  border-radius: 50%;
  background: transparent;
  color: #666;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.help-btn:hover {
  border-color: #1976d2;
  color: #1976d2;
  background: rgba(25, 118, 210, 0.08);
}

.tooltip {
  max-width: 280px;
  padding: 0.75rem 1rem;
  background: #333;
  color: #fff;
  font-size: 0.875rem;
  line-height: 1.4;
  border-radius: 0.5rem;
  border: none;
}

.tooltip::backdrop {
  background: transparent;
}
```

### Popover API なしのフォールバック

```html
<div class="form-field">
  <label for="password">
    パスワード
    <button
      type="button"
      class="help-btn"
      onclick="this.nextElementSibling.classList.toggle('tooltip--visible')"
    >
      ?
    </button>
    <div class="tooltip">
      8文字以上、大文字・小文字・数字を含む必要があります
    </div>
  </label>
  <input type="password" id="password" />
</div>
```

```css
.tooltip {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  /* ...他のスタイル */
}

.tooltip--visible {
  display: block;
}

/* デスクトップ: ホバーで表示 */
@media (hover: hover) {
  .help-btn:hover + .tooltip {
    display: block;
  }
}
```

### 適用場面
- フォームヘルプ
- アイコンの説明
- UI要素の補足情報

### ポイント
- モバイル: クリックでツールチップ表示
- デスクトップ: ホバーも対応
- Popover API が最適（フォールバックも用意）

---

## 13. ラベル付きアイコンのサポート

### 概要
アイコンだけでは誤解を招く可能性があるため、テキストラベルを追加。

### 実装

```html
<nav class="icon-nav">
  <button class="icon-btn">
    <svg class="icon"><!-- ホームアイコン --></svg>
    <span class="icon-label">ホーム</span>
  </button>
  <button class="icon-btn">
    <svg class="icon"><!-- 検索アイコン --></svg>
    <span class="icon-label">検索</span>
  </button>
  <button class="icon-btn">
    <svg class="icon"><!-- 通知アイコン --></svg>
    <span class="icon-label">通知</span>
  </button>
  <button class="icon-btn">
    <svg class="icon"><!-- プロフィールアイコン --></svg>
    <span class="icon-label">プロフィール</span>
  </button>
</nav>
```

```css
.icon-nav {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #666;
}

.icon-label {
  font-size: 0.75rem;
  color: #999; /* 控えめな色 */
  font-weight: 500;
}

/* アクティブ状態 */
.icon-btn.active .icon {
  color: #1976d2;
}

.icon-btn.active .icon-label {
  color: #1976d2;
}
```

### 適用場面
- ナビゲーションバー
- ツールバー
- モバイルメニュー

### ポイント
- アイコンだけでは文化・経験レベルで誤解の恐れ
- テキストラベルで明確化
- 特にモバイルで重要（ホバー不可）

---

## ブラウザサポート

| 機能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| Grid Layout | 57+ | 52+ | 10.1+ | 16+ |
| Flexbox | 29+ | 28+ | 9+ | 12+ |
| CSS Variables | 49+ | 31+ | 9.1+ | 15+ |
| Popover API | 114+ | - | 17+ | 114+ |
| `ch` Unit | 27+ | 1+ | 7+ | 12+ |

---

## まとめ

これらのテクニックは以下の原則に基づいています：

1. **ユーザーを混乱させない**: 明確なコピー、視覚的フィードバック
2. **視覚的階層**: タイプスケール、色、サイズで優先度を表現
3. **アクセシビリティ**: ラベル、コントラスト、クリック可能エリア
4. **レスポンシブ**: モバイル・デスクトップ両対応

**キーワード**: UIデザイン、UX、実用テクニック、視覚的階層、アクセシビリティ
