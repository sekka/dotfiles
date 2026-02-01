---
title: HTMLの標準機能で作るフォームバリデーション
category: html
tags: [HTML, form, validation, required, pattern, CSS擬似クラス, user-valid, user-invalid, Constraint Validation API]
browser_support: モダンブラウザ全対応（:user-valid/:user-invalid は Chrome 119+, Safari 16.5+）
created: 2026-02-01
updated: 2026-02-01
---

# HTMLの標準機能で作るフォームバリデーション

## 概要

> 出典: https://ics.media/entry/240418/
> 執筆日: 2024-04-19（更新: 2025-08-26）
> 追加日: 2026-02-01

HTMLの標準機能を使ったフォームバリデーションの実装方法。サーバーサイドバリデーションとの組み合わせにより、ユーザー体験とセキュリティを両立する。

**フォームバリデーションとは:**
ユーザーがフォームに入力した値が正しい値かどうかをチェックすること。

**重要:** セキュリティ上、サーバーサイドバリデーションは必須。クライアントサイドは補助的なUX改善として位置づける。

---

## HTML バリデーション属性

### テキスト入力の制御

#### 文字数制限

```html
<label for="username">ユーザー名（3〜20文字）</label>
<input
  type="text"
  id="username"
  name="username"
  minlength="3"
  maxlength="20"
  required
>
```

**属性:**
- `minlength`: 最小文字数
- `maxlength`: 最大文字数
- `required`: 必須入力

---

#### パターンマッチング（正規表現）

```html
<label for="zipcode">郵便番号（ハイフン付き）</label>
<input
  type="text"
  id="zipcode"
  name="zipcode"
  pattern="\d{3}-\d{4}"
  placeholder="123-4567"
  required
>
```

**pattern 属性の使い方:**
- 正規表現で入力形式を指定
- 完全一致のみ（部分一致ではない）
- `title` 属性でエラーメッセージをカスタマイズ可能

**よく使うパターン:**

```html
<!-- 電話番号（ハイフンなし） -->
<input pattern="\d{10,11}">

<!-- メールアドレス（簡易版） -->
<input pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}">

<!-- 英数字のみ -->
<input pattern="[a-zA-Z0-9]+">

<!-- カタカナのみ -->
<input pattern="[\u30A0-\u30FF]+">
```

---

### 専用入力タイプ

#### type="email"

```html
<label for="email">メールアドレス</label>
<input
  type="email"
  id="email"
  name="email"
  required
>
```

**自動バリデーション:**
- `@` の存在チェック
- ドメイン部分の形式チェック
- スマホでメールアドレス用キーボード表示

---

#### type="url"

```html
<label for="website">ウェブサイト</label>
<input
  type="url"
  id="website"
  name="website"
  placeholder="https://example.com"
>
```

**自動バリデーション:**
- プロトコル（http://, https://）の必須チェック
- URL形式の検証

---

#### type="number"

```html
<label for="age">年齢</label>
<input
  type="number"
  id="age"
  name="age"
  min="18"
  max="120"
  step="1"
  required
>
```

**属性:**
- `min`: 最小値
- `max`: 最大値
- `step`: 刻み幅（デフォルト: 1）

**注意:** スピナー（上下ボタン）が表示されるため、大きな数値入力には不向き。

---

#### type="date"

```html
<label for="birthday">生年月日</label>
<input
  type="date"
  id="birthday"
  name="birthday"
  min="1900-01-01"
  max="2024-12-31"
  required
>
```

**自動機能:**
- ブラウザネイティブの日付ピッカー表示
- 日付形式の自動検証
- `min`/`max` で日付範囲を制限

**ブラウザサポート:**
- Chrome, Edge, Safari: ネイティブピッカー
- Firefox: ネイティブピッカー（バージョンによる）

---

### 共通属性

```html
<input
  type="text"
  required        <!-- 必須入力 -->
  readonly        <!-- 読み取り専用 -->
  disabled        <!-- 無効化 -->
  autocomplete="email" <!-- オートコンプリート -->
>
```

---

## CSS 擬似クラスでバリデーション状態を表示

### :valid / :invalid（非推奨: 初期状態で表示）

```css
/* ページ読み込み時から赤枠が表示されてしまう */
input:invalid {
  border-color: red;
}

input:valid {
  border-color: green;
}
```

**問題点:**
- ページ読み込み時に未入力フィールドがエラー表示される
- ユーザーが入力する前からエラーが見える（UX が悪い）

---

### :user-valid / :user-invalid（推奨: ユーザー操作後に表示）

```css
/* ユーザーが入力して離れた後にのみエラー表示 */
input:user-invalid {
  border-color: #dc3545;
  background-color: #fff5f5;
}

input:user-valid {
  border-color: #28a745;
}
```

**メリット:**
- ユーザーが入力して `blur`（フォーカスを外す）した後にのみ適用
- 初期状態でエラーが表示されない（UX 向上）

**HTML 例:**

```html
<div class="form-group">
  <label for="email">メールアドレス</label>
  <input
    type="email"
    id="email"
    name="email"
    required
  >
  <p class="error-message">正しいメールアドレスを入力してください</p>
</div>
```

```css
.form-group {
  position: relative;
}

.error-message {
  display: none;
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* エラー時のみメッセージ表示 */
input:user-invalid + .error-message {
  display: block;
}
```

**ブラウザサポート:**
- Chrome 119+
- Safari 16.5+
- Firefox 88+（`-moz-ui-invalid` として実験的サポート）

**フォールバック（古いブラウザ対応）:**

```css
/* モダンブラウザ */
@supports selector(:user-invalid) {
  input:user-invalid {
    border-color: #dc3545;
  }
}

/* 古いブラウザ: JavaScriptで.errorクラスを付与 */
input.error {
  border-color: #dc3545;
}
```

---

## JavaScript: Constraint Validation API

### 基本的な検証

```javascript
const input = document.getElementById('email');

// バリデーション状態をチェック
if (input.checkValidity()) {
  console.log('入力は有効です');
} else {
  console.log('入力は無効です');
  console.log('エラーメッセージ:', input.validationMessage);
}
```

**checkValidity():**
- `true`: 入力が有効
- `false`: 入力が無効

**validationMessage:**
- ブラウザが生成したエラーメッセージ

---

### カスタムバリデーションメッセージ

```javascript
const zipcode = document.getElementById('zipcode');

zipcode.addEventListener('input', () => {
  if (zipcode.validity.patternMismatch) {
    zipcode.setCustomValidity('郵便番号は「123-4567」の形式で入力してください');
  } else {
    zipcode.setCustomValidity(''); // エラーをクリア
  }
});
```

**setCustomValidity():**
- 引数が空文字列 → バリデーション通過
- 引数が文字列 → バリデーション失敗（その文字列がエラーメッセージ）

---

### validity プロパティ

```javascript
const input = document.getElementById('username');

console.log(input.validity);
/*
ValidityState {
  valueMissing: false,    // required 違反
  typeMismatch: false,    // type 違反
  patternMismatch: false, // pattern 違反
  tooLong: false,         // maxlength 違反
  tooShort: false,        // minlength 違反
  rangeUnderflow: false,  // min 違反
  rangeOverflow: false,   // max 違反
  stepMismatch: false,    // step 違反
  badInput: false,        // 不正な入力
  customError: false,     // setCustomValidity() によるエラー
  valid: true             // 全体の有効性
}
*/
```

**個別エラーの判定:**

```javascript
if (input.validity.valueMissing) {
  // 必須項目が未入力
  showError('この項目は必須です');
} else if (input.validity.tooShort) {
  // 最小文字数未満
  showError(`最低${input.minLength}文字必要です`);
} else if (input.validity.patternMismatch) {
  // パターン不一致
  showError('形式が正しくありません');
}
```

---

### 送信ボタンの無効化（CSS のみ）

```css
/* フォーム内に1つでも無効な入力があれば送信ボタンを無効化 */
form:has(:invalid) button[type="submit"] {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}
```

**:has() 擬似クラス:**
- フォーム内に `:invalid` な要素が存在するか判定
- JavaScript 不要でボタンを無効化

**ブラウザサポート:**
- Chrome 105+
- Safari 15.4+
- Firefox 121+

---

### 送信ボタンの無効化（JavaScript）

```javascript
const form = document.getElementById('myForm');
const submitBtn = form.querySelector('button[type="submit"]');

// 入力値が変わるたびにチェック
form.addEventListener('input', () => {
  submitBtn.disabled = !form.checkValidity();
});

// 初期状態も確認
submitBtn.disabled = !form.checkValidity();
```

---

### フォーム送信時の検証

```javascript
const form = document.getElementById('myForm');

form.addEventListener('submit', (e) => {
  if (!form.checkValidity()) {
    e.preventDefault(); // 送信を中断

    // 最初の無効な入力にフォーカス
    const firstInvalid = form.querySelector(':invalid');
    firstInvalid?.focus();

    // エラーメッセージ表示
    alert('入力内容に誤りがあります');
  }
});
```

---

## UX のベストプラクティス

### 1. 入力要件を事前に表示

```html
<label for="password">パスワード</label>
<p class="input-hint">8文字以上、英字と数字を含む</p>
<input
  type="password"
  id="password"
  name="password"
  pattern="(?=.*[a-zA-Z])(?=.*\d).{8,}"
  required
>
```

**理由:**
- ユーザーが送信前にエラーを防げる
- 入力のストレス軽減

---

### 2. エラーは入力後に表示

```css
/* 良い例: ユーザー操作後のみエラー表示 */
input:user-invalid {
  border-color: red;
}

/* 悪い例: 初期状態からエラー表示 */
input:invalid {
  border-color: red;
}
```

---

### 3. 具体的なエラーメッセージ

```javascript
// 悪い例: 一般的すぎる
input.setCustomValidity('入力エラー');

// 良い例: 具体的
if (input.validity.tooShort) {
  input.setCustomValidity(`最低${input.minLength}文字必要です（現在${input.value.length}文字）`);
}
```

---

### 4. リアルタイムフィードバック

```javascript
const password = document.getElementById('password');
const strengthMeter = document.getElementById('strength-meter');

password.addEventListener('input', () => {
  const value = password.value;
  let strength = 0;

  if (value.length >= 8) strength++;
  if (/[a-z]/.test(value)) strength++;
  if (/[A-Z]/.test(value)) strength++;
  if (/\d/.test(value)) strength++;
  if (/[@$!%*?&]/.test(value)) strength++;

  strengthMeter.textContent = ['弱い', '普通', '強い', '非常に強い', '最強'][strength - 1];
  strengthMeter.className = `strength-${strength}`;
});
```

---

## フォーム送信の基本

```html
<form action="/api/submit" method="post">
  <input type="text" name="username" required>
  <button type="submit">送信</button>
</form>
```

**属性:**
- `action`: 送信先URL
- `method`: HTTPメソッド（`get` または `post`）
  - `get`: URL パラメータとして送信（検索フォームなど）
  - `post`: リクエストボディとして送信（ログイン、登録など）

---

## ユースケース

### 会員登録フォーム

```html
<form id="registerForm" novalidate>
  <div class="form-group">
    <label for="username">ユーザー名（3〜20文字）</label>
    <input
      type="text"
      id="username"
      name="username"
      minlength="3"
      maxlength="20"
      required
    >
  </div>

  <div class="form-group">
    <label for="email">メールアドレス</label>
    <input
      type="email"
      id="email"
      name="email"
      required
    >
  </div>

  <div class="form-group">
    <label for="password">パスワード（8文字以上）</label>
    <input
      type="password"
      id="password"
      name="password"
      minlength="8"
      pattern="(?=.*[a-zA-Z])(?=.*\d).{8,}"
      title="英字と数字を含む8文字以上"
      required
    >
  </div>

  <button type="submit">登録</button>
</form>
```

**novalidate 属性:**
- ブラウザのデフォルトバリデーションを無効化
- JavaScript で完全制御したい場合に使用

---

### お問い合わせフォーム

```html
<form action="/contact" method="post">
  <label for="name">お名前</label>
  <input type="text" id="name" name="name" required>

  <label for="email">メールアドレス</label>
  <input type="email" id="email" name="email" required>

  <label for="message">お問い合わせ内容</label>
  <textarea
    id="message"
    name="message"
    minlength="10"
    maxlength="1000"
    required
  ></textarea>

  <button type="submit">送信</button>
</form>
```

---

## 注意点

### サーバーサイドバリデーションは必須

クライアントサイドのバリデーションは簡単に無効化できるため、セキュリティ上の保護にはならない。

```javascript
// ブラウザの開発者ツールで簡単に無効化可能
document.querySelector('input').removeAttribute('required');
```

**必ず両方実装:**
1. クライアントサイド: UX 向上（即座のフィードバック）
2. サーバーサイド: セキュリティ（最終的な検証）

---

### パスワードの検証

パスワードの強度チェックは複雑なため、専用ライブラリの使用を推奨：

- [zxcvbn](https://github.com/dropbox/zxcvbn) - Dropbox製パスワード強度チェッカー

---

## ブラウザサポート

| 機能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| required, pattern など基本属性 | ✓ | ✓ | ✓ | ✓ |
| type="email", type="url" | ✓ | ✓ | ✓ | ✓ |
| type="date" | ✓ | ✓ | ✓ | ✓ |
| :user-valid / :user-invalid | 119+ | 88+ | 16.5+ | 119+ |
| :has() | 105+ | 121+ | 15.4+ | 105+ |
| Constraint Validation API | ✓ | ✓ | ✓ | ✓ |

---

## 関連リソース

- [MDN: クライアントサイドのフォーム検証](https://developer.mozilla.org/ja/docs/Learn/Forms/Form_validation)
- [MDN: Constraint Validation API](https://developer.mozilla.org/ja/docs/Web/API/Constraint_validation)
- [MDN: :user-valid](https://developer.mozilla.org/ja/docs/Web/CSS/:user-valid)
- [MDN: :user-invalid](https://developer.mozilla.org/ja/docs/Web/CSS/:user-invalid)
- [HTML Standard: Form Validation](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api)

---

## 関連ナレッジ

- `css/selectors/has-selector.md` - :has() 擬似クラスの詳細
- `cross-cutting/accessibility/form-accessibility.md` - フォームのアクセシビリティ
