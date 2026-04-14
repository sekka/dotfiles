---
title: :user-invalid と :user-valid 疑似クラス
category: css/selectors
tags: [user-invalid, user-valid, form, validation, ux, 2024]
browser_support: Chrome 119+, Firefox 88+, Safari 16.5+
created: 2026-01-31
updated: 2026-01-31
---

# :user-invalid と :user-valid

> 出典: https://speakerdeck.com/tonkotsuboy_com/lu-ye-sanniwen-ku-2024nian-zui-xin-csstorendotoshi-jian-tekunituku
> 執筆日: 2024-06
> 追加日: 2026-01-31

ユーザーが**実際に入力操作を完了した後**のみ、バリデーション状態を判定する疑似クラス。フォームのUXを大幅に改善する。

## なぜこの方法が良いのか

**従来の :invalid の問題点:**
```html
<input type="email" required>
```

```css
/* ❌ ページ読み込み直後からエラー表示（UX最悪） */
input:invalid {
  border-color: red;
}
```

ユーザーが何も入力していないのに、最初から赤いエラー枠が表示される。

**:user-invalid のメリット:**
- **適切なタイミング**: ユーザーが入力・操作した後のみエラー表示
- **UX向上**: 初期表示でエラーを見せない
- **ネイティブHTML**: JavaScriptなしで実装可能

## 基本的な使い方

```css
/* ✅ ユーザーが操作した後のみエラー表示 */
input:user-invalid {
  border-color: #ef4444;
  background-color: #fef2f2;
}

input:user-valid {
  border-color: #10b981;
  background-color: #f0fdf4;
}
```

## :invalid と :user-invalid の違い

```html
<form>
  <input type="email" required placeholder="メールアドレス">
</form>
```

```css
/* ❌ :invalid - ページ読み込み時から即座にマッチ */
input:invalid {
  border-color: red;
  /* 未入力でも赤枠が表示される */
}

/* ✅ :user-invalid - ユーザーが操作した後のみマッチ */
input:user-invalid {
  border-color: red;
  /* フォーカスを外した後、または送信試行後のみ表示 */
}
```

## トリガー条件

`:user-invalid` がマッチするタイミング:

1. **フォーカスを外した時** (blur)
2. **フォーム送信を試みた時**
3. **ユーザーが値を変更した後**

最初からマッチ**しない**：
- ページ読み込み直後
- フォームがリセットされた直後

## 実践例

### 基本的なフォームバリデーション

```html
<form>
  <label>
    メールアドレス
    <input type="email" name="email" required>
  </label>

  <label>
    年齢（18歳以上）
    <input type="number" name="age" min="18" max="120" required>
  </label>

  <button type="submit">送信</button>
</form>
```

```css
/* 入力欄のデフォルトスタイル */
input {
  border: 2px solid #d1d5db;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: border-color 0.2s, background-color 0.2s;
}

/* ユーザーが操作後、無効な場合 */
input:user-invalid {
  border-color: #ef4444;
  background-color: #fef2f2;
}

/* ユーザーが操作後、有効な場合 */
input:user-valid {
  border-color: #10b981;
  background-color: #f0fdf4;
}

/* フォーカス時 */
input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

### エラーメッセージの表示

```html
<label>
  メールアドレス
  <input type="email" name="email" required>
  <span class="error-message">有効なメールアドレスを入力してください</span>
</label>
```

```css
/* エラーメッセージはデフォルトで非表示 */
.error-message {
  display: none;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* :user-invalid の時のみ表示 */
input:user-invalid + .error-message {
  display: block;
}

/* アニメーション付き */
input:user-invalid + .error-message {
  display: block;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### アイコン表示

```html
<div class="input-wrapper">
  <input type="email" name="email" required>
  <svg class="icon icon-error">...</svg>
  <svg class="icon icon-success">...</svg>
</div>
```

```css
.input-wrapper {
  position: relative;
}

.icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  display: none;
}

/* エラーアイコン */
input:user-invalid ~ .icon-error {
  display: block;
  color: #ef4444;
}

/* 成功アイコン */
input:user-valid ~ .icon-success {
  display: block;
  color: #10b981;
}
```

### フォーム全体の状態

```html
<form>
  <input type="text" name="username" required>
  <input type="email" name="email" required>
  <input type="password" name="password" required minlength="8">
  <button type="submit">送信</button>
</form>
```

```css
/* フォームにエラーがある場合、送信ボタンを無効化風に */
form:has(:user-invalid) button[type="submit"] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 全てのフィールドが有効な場合、送信ボタンを強調 */
form:has(input:required):not(:has(:user-invalid)) button[type="submit"] {
  background-color: #10b981;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}
```

### パスワード強度インジケーター

```html
<label>
  パスワード（8文字以上）
  <input type="password" name="password" required minlength="8" pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$">
  <div class="strength-indicator">
    <span class="strength-bar"></span>
  </div>
</label>
```

```css
.strength-indicator {
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.strength-bar {
  display: block;
  height: 100%;
  width: 0;
  background-color: #ef4444;
  transition: width 0.3s, background-color 0.3s;
}

/* 無効（弱い） */
input[type="password"]:user-invalid ~ .strength-indicator .strength-bar {
  width: 33%;
  background-color: #ef4444;
}

/* 有効（強い） */
input[type="password"]:user-valid ~ .strength-indicator .strength-bar {
  width: 100%;
  background-color: #10b981;
}
```

## :has() との組み合わせ

```css
/* フォームにエラーがある場合、警告を表示 */
form:has(:user-invalid)::before {
  content: '⚠️ 入力内容を確認してください';
  display: block;
  padding: 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  color: #991b1b;
  margin-bottom: 1rem;
}
```

## JavaScript なしでのリアルタイムバリデーション

```html
<label>
  メールアドレス
  <input type="email" name="email" required>
  <span class="hint">例: user@example.com</span>
</label>
```

```css
/* ヒントはデフォルトで表示 */
.hint {
  font-size: 0.875rem;
  color: #6b7280;
}

/* 有効な入力後はヒントを非表示 */
input:user-valid + .hint {
  display: none;
}

/* 無効な入力後はエラーメッセージに変更 */
input:user-invalid + .hint {
  color: #ef4444;
}

input:user-invalid + .hint::before {
  content: '⚠️ ';
}
```

## ユースケース

- **問い合わせフォーム**: 入力後のバリデーション
- **ログインフォーム**: メール・パスワード検証
- **会員登録**: リアルタイム入力チェック
- **設定変更**: フォーム送信前の確認
- **検索フォーム**: クエリの妥当性確認

## ブラウザ対応

| ブラウザ | :user-invalid | :user-valid |
|----------|---------------|-------------|
| Chrome/Edge | 119+ | 119+ |
| Firefox | 88+ | 88+ |
| Safari | 16.5+ | 16.5+ |

## フォールバック（JavaScript）

```javascript
// 古いブラウザ向けフォールバック
if (!CSS.supports('selector(:user-invalid)')) {
  document.querySelectorAll('input, textarea, select').forEach(input => {
    let userInteracted = false;

    input.addEventListener('blur', () => {
      userInteracted = true;
      updateValidationState();
    });

    input.addEventListener('input', () => {
      if (userInteracted) {
        updateValidationState();
      }
    });

    function updateValidationState() {
      if (input.validity.valid) {
        input.classList.add('user-valid');
        input.classList.remove('user-invalid');
      } else {
        input.classList.add('user-invalid');
        input.classList.remove('user-valid');
      }
    }
  });
}
```

```css
/* ポリフィル用クラス */
input.user-invalid {
  border-color: #ef4444;
}

input.user-valid {
  border-color: #10b981;
}
```

## 注意点

- **:invalid との併用**: 意図しない動作を避けるため、`:user-invalid` を優先
- **送信時のバリデーション**: サーバー側検証も必須（クライアント側は補助）
- **アクセシビリティ**: `aria-invalid` 属性も併用推奨

```html
<input
  type="email"
  required
  aria-describedby="email-error"
  aria-invalid="false"
>
<span id="email-error" role="alert"></span>
```

## 従来手法との比較

| 手法 | メリット | デメリット |
|------|---------|-----------|
| **:invalid のみ** | シンプル | 初期表示で即エラー（UX悪い） |
| **JavaScript バリデーション** | 細かい制御可能 | コード量多い、保守コスト高 |
| **:user-invalid** | UX良好、コード最小 | 新しいブラウザのみ |

## 関連ナレッジ

- [:has() セレクタ](./has-selector.md) - フォーム全体の状態判定
- [フォームアクセシビリティ](../../cross-cutting/accessibility/form-accessibility.md)
- [HTML フォーム要素](../../html/forms/form-elements.md)
