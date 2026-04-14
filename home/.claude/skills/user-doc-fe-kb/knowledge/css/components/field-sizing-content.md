---
title: field-sizing プロパティ（詳細版）
category: css/components
tags: [field-sizing, forms, auto-resize, textarea, select, input, 2024]
browser_support: Chrome 123+, Edge 123+, Safari 18.2+
created: 2026-01-31
updated: 2026-01-31
---

# field-sizing プロパティ（詳細版）

> 出典: https://ishadeed.com/article/field-sizing/
> 執筆日: 2024年
> 追加日: 2026-01-31

`field-sizing` プロパティは、フォーム要素（textarea、select、input）がコンテンツに応じて自動的にサイズ調整される新しいCSS機能。従来JavaScriptで実装していた自動拡張を、CSS単体で実現できる。

## 基本概念

### デフォルト動作（fixed）

```css
/* デフォルト: 固定サイズ */
textarea {
  field-sizing: fixed; /* 明示的に指定しなくても適用される */
  width: 200px;
  height: 100px;
}
```

- ユーザーがテキストを入力しても、サイズは固定
- スクロールバーが表示される

### コンテンツベースサイズ（content）

```css
/* コンテンツに応じて自動拡張 */
textarea {
  field-sizing: content;
  min-height: 3lh; /* 最小3行 */
  max-height: 10lh; /* 最大10行 */
}
```

- 入力内容に応じて自動的に高さ/幅が調整される
- スクロールバーは表示されない（max値まで）
- JavaScript不要

## 詳細な使用例

### 1. テキストエリアの自動拡張

#### パターンA: 無制限に拡張

```css
textarea {
  field-sizing: content;
  width: 100%;
  min-height: 3lh; /* 行高さ単位 */
}
```

**動作:**
- 初期状態: 3行分の高さ
- テキスト入力: 行数に応じて無制限に拡張
- テキスト削除: 自動的に縮小

#### パターンB: 最大高さ制限付き

```css
textarea {
  field-sizing: content;
  width: 100%;
  min-height: 3lh;
  max-height: 15lh; /* 最大15行まで */
  overflow-y: auto; /* 最大高さ超過時はスクロール */
}
```

**動作:**
- 15行まで: 自動拡張、スクロールバーなし
- 15行超過: スクロールバー表示

#### パターンC: 幅も制約

```css
textarea {
  field-sizing: content;
  min-width: 200px;
  max-width: 600px;
  min-height: 3lh;
  max-height: 10lh;
  resize: none; /* リサイズハンドル非表示 */
}
```

### 2. セレクトボックスの自動幅調整

#### 従来の問題

```html
<select>
  <option>Short</option>
  <option>Very Long Option Text Here</option>
</select>
```

従来は固定幅で、長いオプションが見切れていた。

#### 解決策

```css
select {
  field-sizing: content;
  min-width: 120px; /* 最小幅を確保 */
  max-width: 400px; /* 最大幅を制限 */
}
```

**動作:**
- 選択されたオプションのテキスト長に応じて幅が変化
- 短いオプション: 最小幅120px
- 長いオプション: 最大400pxまで拡張

### 3. input[type="text"] の自動幅調整

```css
input[type="text"] {
  field-sizing: content;
  min-width: 100px;
  max-width: 500px;
  padding: 0.5rem 1rem;
}
```

**動作:**
- 入力内容に応じて幅が変化
- プレースホルダーの長さも考慮される

### 4. チャットUIでの応用

```css
/* チャット入力欄 */
.chat-input {
  field-sizing: content;
  min-height: 2.5lh;
  max-height: 8lh;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  resize: none;
}

/* 送信ボタンをalign-items: flex-endで配置 */
.chat-form {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end; /* テキストエリアが拡張しても下揃え */
}
```

**ユーザー体験:**
- 1行の短いメッセージ: コンパクトな入力欄
- 複数行のメッセージ: 自動的に拡張
- 8行超過: スクロールバー表示

### 5. contenteditable との組み合わせ

```html
<div class="editable" contenteditable="true">
  Edit me
</div>
```

```css
.editable {
  field-sizing: content;
  min-height: 2lh;
  max-height: 20lh;
  overflow-y: auto;
  padding: 1rem;
  border: 1px solid #ccc;
}
```

**注意:**
- `contenteditable` 要素には直接適用できない（2024年時点）
- 将来的にサポートされる可能性あり

## 実践的なパターン

### パターン1: コメントフォーム

```css
.comment-textarea {
  field-sizing: content;
  min-height: 4lh;
  max-height: 20lh;
  width: 100%;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.5;
  resize: none;
  transition: border-color 0.2s;
}

.comment-textarea:focus {
  outline: none;
  border-color: #3b82f6;
}
```

### パターン2: 検索バーの自動拡張

```css
.search-input {
  field-sizing: content;
  min-width: 200px;
  max-width: 600px;
  padding: 0.75rem 1rem;
  border-radius: 24px;
  border: 1px solid #ddd;
  transition: width 0.3s ease;
}
```

### パターン3: タグ入力フィールド

```css
.tag-input {
  field-sizing: content;
  min-width: 80px;
  max-width: 300px;
  padding: 0.25rem 0.5rem;
  border: 1px dashed #aaa;
  border-radius: 4px;
  font-size: 0.875rem;
}
```

## アクセシビリティ考慮事項

### 1. 視覚的フィードバック

```css
textarea {
  field-sizing: content;
  min-height: 3lh;
  max-height: 10lh;
  border: 2px solid #e0e0e0;
}

/* フォーカス時に拡張を示唆 */
textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### 2. ラベルとの関連付け

```html
<label for="message">
  Message
  <span class="hint">(expands as you type)</span>
</label>
<textarea id="message" field-sizing="content"></textarea>
```

```css
.hint {
  font-size: 0.875rem;
  color: #666;
}
```

### 3. 文字数カウンター

```html
<div class="input-wrapper">
  <textarea id="bio" maxlength="500"></textarea>
  <div class="char-count" aria-live="polite">
    <span id="current">0</span> / 500
  </div>
</div>
```

```css
textarea {
  field-sizing: content;
  min-height: 3lh;
  max-height: 8lh;
  width: 100%;
}

.char-count {
  text-align: right;
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
}
```

## パフォーマンス考慮事項

### レイアウトシフト（CLS）への影響

**問題:**
- `field-sizing: content` は入力時にレイアウトが変化する
- Cumulative Layout Shift（CLS）スコアに影響する可能性

**対策:**

```css
/* 最小高さを確保してレイアウトシフトを最小化 */
textarea {
  field-sizing: content;
  min-height: 3lh; /* 初期表示で3行分確保 */
  max-height: 10lh;
}

/* フォームコンテナに min-height を設定 */
.form-container {
  min-height: 200px; /* コンテンツ拡張時のレイアウトシフトを抑制 */
}
```

### リフローの最適化

```css
/* will-change で最適化（必要な場合のみ） */
textarea {
  field-sizing: content;
  will-change: height; /* ブラウザに高さ変化を予告 */
}

/* 不要になったら削除 */
textarea:not(:focus) {
  will-change: auto;
}
```

## ブラウザサポート

| ブラウザ | バージョン | 備考 |
|----------|-----------|------|
| Chrome | 123+ | フル対応 |
| Edge | 123+ | フル対応 |
| Safari | 18.2+ | 2024年12月リリース |
| Firefox | 未対応 | Nightly でテスト中 |
| Opera | 109+ | Chromiumベース |

**プログレッシブエンハンスメント:**

```css
/* フォールバック: 固定サイズ */
textarea {
  height: 100px;
  resize: vertical; /* ユーザーが手動でリサイズ可能 */
}

/* 対応ブラウザ: 自動拡張 */
@supports (field-sizing: content) {
  textarea {
    field-sizing: content;
    min-height: 3lh;
    max-height: 10lh;
    resize: none; /* 自動拡張するのでリサイズ不要 */
  }
}
```

## 従来のJavaScriptソリューションとの比較

### JavaScript版（従来）

```javascript
const textarea = document.querySelector('textarea');

textarea.addEventListener('input', () => {
  // 一旦高さをリセット
  textarea.style.height = 'auto';

  // scrollHeightに合わせて調整
  textarea.style.height = textarea.scrollHeight + 'px';
});

// 初期化時にも実行
textarea.dispatchEvent(new Event('input'));
```

**問題点:**
- JavaScriptが必要
- イベントリスナーのオーバーヘッド
- 初期化処理が必要
- SSR時の動作（hydration前）

### CSS版（field-sizing）

```css
textarea {
  field-sizing: content;
  min-height: 3lh;
  max-height: 10lh;
}
```

**利点:**
- JavaScriptゼロ
- 宣言的
- パフォーマンス最適化済み
- SSR/SSGで即座に動作

## よくある質問

### Q1. resize プロパティとの関係は？

**A:** 併用可能だが、`field-sizing: content` を使う場合は `resize: none` が推奨。

```css
/* 自動拡張 + リサイズハンドル非表示 */
textarea {
  field-sizing: content;
  resize: none;
}

/* 自動拡張 + ユーザーが縦方向にリサイズ可能 */
textarea {
  field-sizing: content;
  resize: vertical;
}
```

### Q2. min-height と max-height は必須？

**A:** 必須ではないが、UX向上のため推奨。

```css
/* 最小値なし: 1行でも極小になる */
textarea {
  field-sizing: content;
}

/* 推奨: 最小値を設定 */
textarea {
  field-sizing: content;
  min-height: 3lh;
}
```

### Q3. lh 単位とは？

**A:** `lh`（line-height）は行高さベースの単位。

```css
textarea {
  font-size: 16px;
  line-height: 1.5; /* 24px */
  min-height: 3lh; /* 3 × 24px = 72px */
}
```

**代替案:**

```css
/* rem単位 */
textarea {
  min-height: 4.5rem; /* 約3行分 */
}

/* px単位 */
textarea {
  min-height: 72px;
}
```

### Q4. 古いブラウザへのフォールバックは？

**A:** `@supports` で段階的拡張を実装。

```css
/* フォールバック */
textarea {
  height: 100px;
  resize: vertical;
}

/* 対応ブラウザ */
@supports (field-sizing: content) {
  textarea {
    field-sizing: content;
    height: auto;
    min-height: 3lh;
    max-height: 10lh;
    resize: none;
  }
}
```

## まとめ

`field-sizing: content` は、フォーム要素の自動サイズ調整を実現する強力なCSS機能。

**採用すべきケース:**
- チャットUI、コメントフォーム
- 検索バー、タグ入力
- 編集可能なコンテンツ

**注意点:**
- Safari 18.2+ で対応（2024年12月以降）
- Firefoxは未対応（2026年1月時点）
- レイアウトシフト対策として min/max 値を設定
- `@supports` でフォールバックを実装

## 関連ナレッジ

- [Forms ベストプラクティス](./forms-best-practices.md)
- [interpolate-size](../animation/interpolate-size.md)
- [lh 単位](../typography/lh-unit.md)
- [line-height の最適化](../typography/line-height-optimization.md)

## 参考資料

- [Ahmad Shadeed: CSS field-sizing](https://ishadeed.com/article/field-sizing/)
- [MDN: field-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing)
- [Can I use: field-sizing](https://caniuse.com/mdn-css_properties_field-sizing)
