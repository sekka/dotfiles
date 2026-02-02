---
title: Webアクセシビリティ入門 2024
category: cross-cutting/accessibility
tags: [accessibility, a11y, wcag, best-practices, 2024]
browser_support: 全モダンブラウザ対応
created: 2026-01-31
updated: 2026-01-31
---

# Webアクセシビリティ入門 2024

> 出典: https://speakerdeck.com/recruitengineers/webakusesibiriteiru-men-2024
> 執筆日: 2024年
> 追加日: 2026-01-31

リクルートの2024年新人研修資料に基づく、実務的で実践的なWebアクセシビリティガイド。

## アクセシビリティとは

**定義:** accessibility = access（アクセス）+ ability（能力）

**対象者:**
- **障がい者**: 428.7万人（日本国内）
  - 視覚障がい（31万人）
  - 聴覚・言語障がい（34万人）
  - 肢体不自由（193万人）
  - 内部障がい（106万人）
  - 知的障がい（109万人）
  - 精神障がい（419万人）
- **一時的な状況**: メガネ忘れ、電車の揺れ、手が塞がっている
- **高齢者**: 加齢による視力・聴力・運動能力の低下

**なぜ重要なのか:**
- **社会的責任**: 誰もが情報にアクセスできるべき
- **ビジネスメリット**: 428.7万人の潜在顧客
- **SEO向上**: スクリーンリーダー対応 = 検索エンジン対応
- **法的要件**: 米国ADA、EU Accessibility Act等

## コスト対効果の考え方

**実務的アプローチ:**
1. **高コスト対効果**: 基本的な対応から開始
   - セマンティックHTML
   - キーボード操作
   - 適切なコントラスト比
2. **段階的改善**: 完璧を目指さず、継続的に改善
3. **自動化**: ツールで検出可能な57%を優先対応

## 実践的ベストプラクティス

### 1. 視覚的アクセス

#### コントラスト比の確保

**WCAG AA標準:**
- **通常テキスト**: 4.5:1 以上
- **大きいテキスト** (18pt以上 or 14pt太字): 3:1 以上

```css
/* ❌ コントラスト不足 */
.text {
  color: #999999;
  background-color: #ffffff;
  /* コントラスト比: 2.85:1（不合格） */
}

/* ✅ 適切なコントラスト */
.text {
  color: #595959;
  background-color: #ffffff;
  /* コントラスト比: 4.54:1（合格） */
}
```

**チェックツール:**
- Chrome DevTools: Lighthouse
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Figma: Stark プラグイン

#### フォントサイズ

```css
/* ✅ 最小フォントサイズ: 16px */
body {
  font-size: 16px;
  line-height: 1.5;
}

/* 見出しは相対的に大きく */
h1 {
  font-size: 2rem; /* 32px */
}

h2 {
  font-size: 1.5rem; /* 24px */
}
```

### 2. キーボード操作

**全機能がキーボードでアクセス可能であること**

```html
<!-- ✅ ボタン: 自動的にフォーカス可能 -->
<button onclick="doSomething()">クリック</button>

<!-- ❌ div: キーボードでアクセス不可 -->
<div onclick="doSomething()">クリック</div>

<!-- ✅ div にキーボード対応を追加 -->
<div
  role="button"
  tabindex="0"
  onclick="doSomething()"
  onkeydown="if(event.key === 'Enter' || event.key === ' ') doSomething()"
>
  クリック
</div>
```

**Tab順序:**
```html
<!-- ✅ 論理的なTab順序 -->
<nav>
  <a href="#main">メインコンテンツへスキップ</a>
  <a href="/">ホーム</a>
  <a href="/about">会社情報</a>
  <a href="/contact">お問い合わせ</a>
</nav>

<!-- ❌ tabindex で強制的に順序変更（混乱を招く） -->
<a href="/" tabindex="3">ホーム</a>
<a href="/about" tabindex="1">会社情報</a>
```

### 3. フォーカス表示

**視認性の高いフォーカスインジケーター**

```css
/* ❌ フォーカス表示を削除（絶対NG） */
button:focus {
  outline: none;
}

/* ✅ カスタムフォーカス表示 */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

/* より視認性の高いデザイン */
a:focus-visible {
  outline: 3px solid #000;
  outline-offset: 2px;
  background-color: #ffeb3b;
  color: #000;
}
```

**:focus vs :focus-visible:**
```css
/* :focus - マウスクリックでもフォーカス表示（煩わしい） */
button:focus {
  outline: 2px solid blue;
}

/* :focus-visible - キーボード操作時のみ表示（推奨） */
button:focus-visible {
  outline: 2px solid blue;
}
```

### 4. 適切なAlt属性

```html
<!-- ✅ 意味のある画像: 説明文を記述 -->
<img src="chart.png" alt="2024年売上推移グラフ。前年比120%の成長を示す">

<!-- ✅ 装飾画像: 空文字 -->
<img src="decoration.png" alt="">

<!-- ❌ alt属性なし -->
<img src="chart.png">

<!-- ❌ 無意味なalt -->
<img src="chart.png" alt="画像">
<img src="chart.png" alt="chart.png">

<!-- ✅ リンク画像: リンク先を説明 -->
<a href="/products">
  <img src="products-icon.png" alt="製品一覧ページへ">
</a>

<!-- ✅ 複雑な図: 詳細説明を別途提供 -->
<figure>
  <img src="complex-diagram.png" alt="システムアーキテクチャ図">
  <figcaption>
    <details>
      <summary>詳細説明</summary>
      <p>フロントエンドはReactで実装され...</p>
    </details>
  </figcaption>
</figure>
```

### 5. セマンティックHTML

**見出しの正しい構造化**

```html
<!-- ✅ 正しい見出し階層 -->
<h1>ページタイトル</h1>
  <h2>セクション1</h2>
    <h3>サブセクション1-1</h3>
    <h3>サブセクション1-2</h3>
  <h2>セクション2</h2>

<!-- ❌ 見出しレベルをスキップ -->
<h1>ページタイトル</h1>
  <h3>セクション1</h3> <!-- h2をスキップ -->

<!-- ❌ 見た目だけで見出し -->
<div style="font-size: 24px; font-weight: bold;">見出し</div>
```

**ランドマーク要素の使用**

```html
<body>
  <!-- メインナビゲーション -->
  <nav aria-label="メインナビゲーション">
    <ul>
      <li><a href="/">ホーム</a></li>
      <li><a href="/about">会社情報</a></li>
    </ul>
  </nav>

  <!-- メインコンテンツ -->
  <main id="main">
    <h1>ページタイトル</h1>

    <article>
      <h2>記事タイトル</h2>
      <p>本文...</p>
    </article>

    <aside>
      <h2>関連記事</h2>
      <ul>...</ul>
    </aside>
  </main>

  <!-- フッター -->
  <footer>
    <p>&copy; 2024 Company Name</p>
  </footer>
</body>
```

### 6. フォームのラベル関連付け

```html
<!-- ✅ label要素で関連付け -->
<label for="email">メールアドレス</label>
<input type="email" id="email" name="email" required>

<!-- ✅ label内包（id不要） -->
<label>
  メールアドレス
  <input type="email" name="email" required>
</label>

<!-- ❌ ラベルなし -->
<span>メールアドレス</span>
<input type="email" name="email">

<!-- ✅ エラーメッセージの関連付け -->
<label for="password">パスワード</label>
<input
  type="password"
  id="password"
  aria-describedby="password-error"
  aria-invalid="true"
>
<span id="password-error" role="alert">
  8文字以上で入力してください
</span>

<!-- ✅ グループ化 -->
<fieldset>
  <legend>配送方法</legend>
  <label>
    <input type="radio" name="shipping" value="standard">
    通常配送（無料）
  </label>
  <label>
    <input type="radio" name="shipping" value="express">
    お急ぎ便（500円）
  </label>
</fieldset>
```

### 7. スキップリンク

```html
<!-- ページ最上部 -->
<a href="#main" class="skip-link">メインコンテンツへスキップ</a>

<nav>
  <!-- ナビゲーション -->
</nav>

<main id="main">
  <!-- メインコンテンツ -->
</main>
```

```css
/* フォーカス時のみ表示 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background-color: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
  transition: top 0.2s;
}

.skip-link:focus {
  top: 0;
}
```

## 検証方法

### 自動テストツール（57%を検出可能）

**ブラウザ拡張:**
- **Axe DevTools**: 最も正確（推奨）
- **Lighthouse**: Chrome DevTools 内蔵
- **WAVE**: 視覚的なフィードバック

**CI/CD統合:**
```bash
# pa11y-ci でアクセシビリティテスト
npm install --save-dev pa11y-ci

# .pa11yci.json
{
  "defaults": {
    "standard": "WCAG2AA",
    "runners": ["axe"]
  },
  "urls": [
    "http://localhost:3000/",
    "http://localhost:3000/about"
  ]
}

# テスト実行
npx pa11y-ci
```

### 手動テスト

**キーボードナビゲーション:**
1. Tabキーで全要素に到達可能か
2. フォーカス表示が明確か
3. Enter/Spaceでボタン・リンクが動作するか
4. Escでモーダルが閉じるか

**スクリーンリーダーテスト:**
- **macOS**: VoiceOver（Cmd + F5）
- **Windows**: NVDA（無料）
- **iOS**: VoiceOver（設定 > アクセシビリティ）
- **Android**: TalkBack

**基本操作:**
| OS | 読み上げ開始 | 次の要素 | クリック |
|----|------------|---------|---------|
| macOS VoiceOver | Cmd+F5 | VO+→ | VO+Space |
| NVDA | Ctrl+Alt+N | ↓ | Enter |

### テストコードでの役割ベースセレクタ

```javascript
import { render, screen } from '@testing-library/react';

test('ボタンがアクセシブル', () => {
  render(<button>送信</button>);

  // ✅ 役割ベース（アクセシビリティツリーを使用）
  const button = screen.getByRole('button', { name: '送信' });
  expect(button).toBeInTheDocument();

  // ❌ クラス名ベース（実装詳細に依存）
  const buttonBad = screen.getByClassName('submit-btn');
});

test('フォームラベルが関連付けられている', () => {
  render(
    <>
      <label htmlFor="email">メールアドレス</label>
      <input id="email" type="email" />
    </>
  );

  // ✅ ラベルテキストで取得（関連付けを検証）
  const input = screen.getByLabelText('メールアドレス');
  expect(input).toBeInTheDocument();
});
```

## 段階的改善の優先順位

### 1. 高優先度（すぐに実施）

- ✅ セマンティックHTML（`<button>`, `<nav>`, `<main>`等）
- ✅ キーボード操作対応
- ✅ フォーカス表示
- ✅ Alt属性（画像）
- ✅ フォームラベル関連付け
- ✅ コントラスト比 AA標準

### 2. 中優先度（段階的に実施）

- スキップリンク
- ARIA属性の適切な使用
- ライブリージョン（`aria-live`）
- エラーメッセージの関連付け
- 動画字幕

### 3. 低優先度（余裕があれば実施）

- コントラスト比 AAA標準（7:1）
- 音声説明
- 手話翻訳
- 平易な言葉（Plain Language）

## よくある誤解

### 誤解1: 「障がい者向けの特別対応」

❌ **誤**: アクセシビリティは障がい者だけのもの

✅ **正**: 全ユーザーのUX向上
- キーボード操作 → パワーユーザーも恩恵
- セマンティックHTML → SEO向上
- 明確なラベル → 全員が理解しやすい

### 誤解2: 「見た目が悪くなる」

❌ **誤**: アクセシビリティとデザインは対立する

✅ **正**: 両立可能
- カスタムフォーカス表示で美しく
- 高コントラスト = モダンデザイン
- セマンティックHTML = クリーンなコード

### 誤解3: 「コストが高い」

❌ **誤**: アクセシビリティ対応は高コスト

✅ **正**: 後から修正する方が高コスト
- 設計段階から考慮 → 追加コストほぼゼロ
- 後から対応 → 大幅な修正が必要

## チェックリスト

実装前に確認:

- [ ] キーボードだけで全機能を操作できる
- [ ] フォーカス表示が明確
- [ ] 画像に適切なalt属性
- [ ] フォームにlabel関連付け
- [ ] 見出し（h1-h6）が正しい階層
- [ ] コントラスト比 4.5:1以上
- [ ] ボタン・リンクが意味のあるテキスト
- [ ] スクリーンリーダーで読み上げ確認
- [ ] 自動テスト（Axe、Lighthouse）合格

## 参考リンク

- [WCAG 2.1 日本語訳](https://waic.jp/docs/WCAG21/)
- [Axe DevTools](https://www.deque.com/axe/devtools/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [pa11y-ci](https://github.com/pa11y/pa11y-ci)

## 関連ナレッジ

- [WAI-ARIA 基礎](./wai-aria-basics.md)
- [フォーカス管理](./focus-management.md)
- [スクリーンリーダー対応](./screen-reader-support.md)
