---
title: JavaScript命名テクニック - 上級編
category: javascript/patterns
tags: [naming, state, conditions, safety, best-practices]
created: 2026-02-01
updated: 2026-02-01
---

# JavaScript命名テクニック - 上級編

> 出典: https://ics.media/entry/220915/
> 執筆日: 2022年9月15日
> 追加日: 2026-02-01

## 概要

状態変化、条件、危険性の警告など、より複雑な概念を命名で表現する上級テクニックを解説します。これらのパターンを活用することで、コードの安全性と保守性を高めることができます。

## 1. 状態変化の表現

### 動詞の変化で状態を表現

過去分詞形で「~された状態」を表現します。

```javascript
// 選択された状態
const selectedItem = items.find(item => item.isSelected);
const selectedItems = items.filter(item => item.isSelected);

// 保留中の状態
const pendingRequests = requests.filter(req => req.status === 'pending');
const pendingTasks = tasks.filter(task => !task.completed);

// 無効化された状態
const disabledButtons = buttons.filter(btn => btn.disabled);
const disabledFeatures = features.filter(f => !f.enabled);

// その他の状態
const loadedImages = images.filter(img => img.complete);
const completedTasks = tasks.filter(task => task.status === 'completed');
const validatedForms = forms.filter(form => form.checkValidity());
const sortedArray = [...array].sort((a, b) => a - b);
const filteredData = data.filter(item => item.active);
```

**実践例: UI状態管理**

```javascript
class UIStateManager {
  #state = {
    selectedItems: new Set(),
    loadedModules: new Map(),
    disabledActions: new Set()
  };

  getSelectedItems() {
    return Array.from(this.#state.selectedItems);
  }

  getLoadedModules() {
    return Array.from(this.#state.loadedModules.values());
  }

  isActionDisabled(actionName) {
    return this.#state.disabledActions.has(actionName);
  }
}

// 使用例
const uiState = new UIStateManager();
const selectedItems = uiState.getSelectedItems();
const loadedModules = uiState.getLoadedModules();
```

### -ing 形で進行中の状態を表現

現在進行形で「~している」状態を表現します。

```javascript
// ローディング状態
const isLoading = state.status === 'loading';
const loadingMessage = 'Please wait...';

// 処理中の状態
const isProcessing = state.status === 'processing';
const processingTasks = tasks.filter(t => t.status === 'processing');

// 送信中の状態
const isSubmitting = form.status === 'submitting';
const submittingForms = forms.filter(f => f.isSubmitting);

// 実践例: 非同期処理の状態管理
class AsyncStateManager {
  #state = {
    loading: false,
    processing: false,
    submitting: false
  };

  startLoading() {
    this.#state.loading = true;
  }

  stopLoading() {
    this.#state.loading = false;
  }

  isLoading() {
    return this.#state.loading;
  }

  isProcessing() {
    return this.#state.processing;
  }

  isSubmitting() {
    return this.#state.submitting;
  }

  // 複合的な状態チェック
  isBusy() {
    return this.isLoading() || this.isProcessing() || this.isSubmitting();
  }
}
```

### enabled/disabled で有効・無効を表現

```javascript
// UI要素の有効・無効
const enabledButtons = buttons.filter(btn => !btn.disabled);
const disabledInputs = inputs.filter(input => input.disabled);

// 機能フラグ
const enabledFeatures = features.filter(f => f.enabled);
const disabledFeatures = features.filter(f => !f.enabled);

// 実践例: 機能フラグ管理
class FeatureFlags {
  #flags = {
    betaFeatures: false,
    experimentalUI: false,
    advancedMode: false
  };

  isEnabled(featureName) {
    return this.#flags[featureName] ?? false;
  }

  isDisabled(featureName) {
    return !this.isEnabled(featureName);
  }

  enable(featureName) {
    this.#flags[featureName] = true;
  }

  disable(featureName) {
    this.#flags[featureName] = false;
  }

  getEnabledFeatures() {
    return Object.entries(this.#flags)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name);
  }

  getDisabledFeatures() {
    return Object.entries(this.#flags)
      .filter(([_, enabled]) => !enabled)
      .map(([name]) => name);
  }
}
```

## 2. 条件による表現

### should/must で必要性を表現

```javascript
// should: 推奨される、すべき
const shouldUpdate = version < latestVersion;
const shouldNotify = hasUnreadMessages;
const shouldValidate = formData.hasChanged;

// must: 必須、しなければならない
const mustAuthenticate = !user.isAuthenticated;
const mustAgreeToTerms = !user.hasAgreedToTerms;
const mustVerifyEmail = !user.emailVerified;

// 実践例: バリデーションルール
class ValidationRules {
  shouldShowWarning(value) {
    return value.length > 50 && value.length < 100;
  }

  mustNotBeEmpty(value) {
    return value.trim().length > 0;
  }

  mustMatchPattern(value, pattern) {
    return pattern.test(value);
  }

  shouldRecommendStrongPassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*]/.test(password);

    const score = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars]
      .filter(Boolean).length;

    return score < 4;
  }
}

// 使用例
const rules = new ValidationRules();

if (!rules.mustNotBeEmpty(input.value)) {
  showError('This field is required');
}

if (rules.shouldShowWarning(input.value)) {
  showWarning('Input is getting long');
}

if (rules.shouldRecommendStrongPassword(password)) {
  showHint('Consider using special characters for stronger password');
}
```

### allow/deny で許可・拒否を表現

```javascript
// 許可リスト
const allowedOrigins = ['https://example.com', 'https://app.example.com'];
const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
const allowedFileTypes = ['.jpg', '.png', '.gif'];

// 拒否リスト
const deniedUsers = ['banned-user-1', 'banned-user-2'];
const deniedIPs = ['192.168.1.100', '10.0.0.50'];

// 実践例: アクセス制御
class AccessControl {
  #allowedRoles = new Set(['admin', 'editor', 'viewer']);
  #deniedUsers = new Set();

  isAllowed(user, action) {
    if (this.isDenied(user)) {
      return false;
    }

    return this.#allowedRoles.has(user.role);
  }

  isDenied(user) {
    return this.#deniedUsers.has(user.id);
  }

  allowUser(userId) {
    this.#deniedUsers.delete(userId);
  }

  denyUser(userId) {
    this.#deniedUsers.add(userId);
  }
}

// CORS設定例
function isOriginAllowed(origin) {
  const allowedOrigins = ['https://example.com', 'https://app.example.com'];
  return allowedOrigins.includes(origin);
}

function isMethodAllowed(method) {
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
  return allowedMethods.includes(method);
}
```

### min/max で範囲を表現

```javascript
// 最小値・最大値
const minLength = 8;
const maxLength = 100;
const minAge = 18;
const maxAge = 120;

const minPrice = 0;
const maxPrice = 10000;

// 実践例: バリデーション
class RangeValidator {
  constructor(min, max) {
    this.min = min;
    this.max = max;
  }

  isValid(value) {
    return value >= this.min && value <= this.max;
  }

  isAboveMin(value) {
    return value >= this.min;
  }

  isBelowMax(value) {
    return value <= this.max;
  }

  clamp(value) {
    return Math.max(this.min, Math.min(this.max, value));
  }
}

// 使用例
const passwordValidator = new RangeValidator(8, 100);

if (!passwordValidator.isAboveMin(password.length)) {
  showError(`Password must be at least ${passwordValidator.min} characters`);
}

if (!passwordValidator.isBelowMax(password.length)) {
  showError(`Password must be no more than ${passwordValidator.max} characters`);
}

// スライダーの値を範囲内に収める
const slider = {
  minValue: 0,
  maxValue: 100,
  currentValue: 50,

  setValue(value) {
    this.currentValue = Math.max(
      this.minValue,
      Math.min(this.maxValue, value)
    );
  }
};
```

## 3. 危険性の警告

### unsafe/safe で安全性を表現

```javascript
// 危険な操作
function unsafeDeleteAll() {
  // 確認なしで全削除（危険）
  database.deleteAll();
}

// 安全な操作
function safeDeleteAll() {
  // 確認後に削除
  if (confirm('Are you sure you want to delete all data?')) {
    database.deleteAll();
  }
}

// HTMLの挿入
function unsafeSetHTML(element, html) {
  // XSSのリスクあり
  element.innerHTML = html;
}

function safeSetHTML(element, html) {
  // サニタイズ済み
  const sanitized = DOMPurify.sanitize(html);
  element.innerHTML = sanitized;
}

// 実践例: ユーザー入力の処理
class HTMLRenderer {
  // 危険: エスケープなし
  unsafeRender(html) {
    return html;
  }

  // 安全: エスケープ済み
  safeRender(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 信頼できるHTMLのみ許可
  renderTrustedHTML(trustedHTML) {
    // 信頼できるソースからのHTMLのみ
    if (typeof trustedHTML !== 'string') {
      throw new Error('Invalid HTML');
    }
    return trustedHTML;
  }
}
```

### raw/escaped でエスケープ状態を表現

```javascript
// エスケープされていない生データ
const rawInput = userInput;
const rawHTML = '<script>alert("XSS")</script>';
const rawSQL = `SELECT * FROM users WHERE id = ${userId}`;

// エスケープ済みデータ
const escapedInput = escapeHTML(userInput);
const escapedHTML = DOMPurify.sanitize(rawHTML);
const escapedSQL = db.escape(userId);

// 実践例: SQLクエリビルダー
class QueryBuilder {
  #rawQuery = '';
  #escapedValues = [];

  // 危険: 生のSQLを許可（内部使用のみ）
  unsafeRaw(sql) {
    this.#rawQuery = sql;
    return this;
  }

  // 安全: プリペアドステートメント
  where(column, value) {
    const escapedColumn = this.escapeIdentifier(column);
    this.#escapedValues.push(value);
    this.#rawQuery += ` WHERE ${escapedColumn} = ?`;
    return this;
  }

  escapeIdentifier(identifier) {
    // カラム名のエスケープ
    return `\`${identifier.replace(/`/g, '``')}\``;
  }

  build() {
    return {
      sql: this.#rawQuery,
      values: this.#escapedValues
    };
  }
}

// 使用例
const query = new QueryBuilder()
  .where('username', userInput)
  .build();

// 安全に実行
db.query(query.sql, query.values);
```

### temp/permanent で一時性を表現

```javascript
// 一時的なデータ
const tempFile = '/tmp/upload-' + Date.now();
const tempCache = new Map();
const tempStorage = sessionStorage; // セッション終了で削除

// 永続的なデータ
const permanentFile = '/data/user-' + userId;
const permanentCache = new Map(); // アプリ終了まで保持
const permanentStorage = localStorage; // ブラウザに永続化

// 実践例: キャッシュ管理
class CacheManager {
  #tempCache = new Map();
  #permanentCache = new Map();

  setTemp(key, value, ttl = 60000) {
    this.#tempCache.set(key, value);

    // TTL後に自動削除
    setTimeout(() => {
      this.#tempCache.delete(key);
    }, ttl);
  }

  setPermanent(key, value) {
    this.#permanentCache.set(key, value);
    this.saveToPermanentStorage(key, value);
  }

  getTemp(key) {
    return this.#tempCache.get(key);
  }

  getPermanent(key) {
    return this.#permanentCache.get(key) ??
      this.loadFromPermanentStorage(key);
  }

  clearTemp() {
    this.#tempCache.clear();
  }

  clearPermanent() {
    this.#permanentCache.clear();
    this.clearPermanentStorage();
  }

  saveToPermanentStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  loadFromPermanentStorage(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  clearPermanentStorage() {
    localStorage.clear();
  }
}

// 使用例
const cache = new CacheManager();

// 一時的にキャッシュ（60秒後に削除）
cache.setTemp('api-response', data, 60000);

// 永続的にキャッシュ
cache.setPermanent('user-settings', settings);
```

### deprecated/legacy で非推奨を表現

```javascript
// 非推奨の関数
/** @deprecated Use newFunction() instead */
function deprecatedFunction() {
  console.warn('This function is deprecated. Use newFunction() instead.');
  // 古い実装
}

// 新しい関数
function newFunction() {
  // 新しい実装
}

// レガシーコード
function legacyAuthentication() {
  // 古い認証方式（後方互換性のため残す）
}

// 実践例: API移行
class API {
  /**
   * @deprecated Use fetchUserData() instead
   * This method will be removed in v3.0
   */
  getUserData(userId) {
    console.warn(
      'getUserData() is deprecated. Use fetchUserData() instead.'
    );
    return this.legacyGetUserData(userId);
  }

  // 新しいメソッド
  async fetchUserData(userId) {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }

  // レガシー実装（内部でのみ使用）
  legacyGetUserData(userId) {
    // 古いXHR実装
    const xhr = new XMLHttpRequest();
    // ...
  }
}

// 使用例
const api = new API();

// 非推奨の呼び出し（警告が出る）
api.getUserData(123);

// 推奨される呼び出し
api.fetchUserData(123);
```

## 4. 複合的な命名パターン

### 状態 + 条件 + 危険性の組み合わせ

```javascript
// 複合的な命名例
class FormValidator {
  // 状態
  #isValidating = false;
  #isSubmitting = false;

  // 条件
  #mustValidate = true;
  #shouldShowErrors = false;

  // 危険性
  #hasUnsavedChanges = false;

  // 状態チェック
  canSubmit() {
    return !this.#isValidating &&
           !this.#isSubmitting &&
           !this.#hasUnsavedChanges;
  }

  // 複合条件
  shouldWarnBeforeLeaving() {
    return this.#hasUnsavedChanges && this.#mustValidate;
  }

  // 安全な送信
  async safeSubmit(formData) {
    if (!this.canSubmit()) {
      throw new Error('Cannot submit at this time');
    }

    this.#isSubmitting = true;
    try {
      const result = await this.submitForm(formData);
      this.#hasUnsavedChanges = false;
      return result;
    } finally {
      this.#isSubmitting = false;
    }
  }

  // 危険な送信（確認なし）
  async unsafeSubmit(formData) {
    console.warn('Submitting without validation');
    return this.submitForm(formData);
  }
}
```

## まとめ

上級命名テクニックを活用することで、コードの安全性と意図をより明確に表現できます。

**状態変化の表現:**
- 過去分詞形: `selected`, `loaded`, `disabled`
- 進行形: `loading`, `processing`, `submitting`
- `enabled/disabled`: 有効・無効

**条件の表現:**
- `should/must`: 推奨・必須
- `allow/deny`: 許可・拒否
- `min/max`: 範囲

**危険性の警告:**
- `unsafe/safe`: 安全性
- `raw/escaped`: エスケープ状態
- `temp/permanent`: 一時性
- `deprecated/legacy`: 非推奨

これらのパターンを適切に組み合わせることで、コードレビュアーや将来の自分が理解しやすいコードを書くことができます。

## ブラウザサポート

記載されている JavaScript の命名テクニックは、言語の文法ではなく慣習であるため、すべてのブラウザで使用可能です。

## 関連リソース

- [naming-conventions.md](./naming-conventions.md) - JavaScript命名規則の基礎
- [naming-basics.md](./naming-basics.md) - 基礎命名テクニック

## 出典

- [わかりやすいコードを書くための9つの命名テクニック【JavaScript】](https://ics.media/entry/220915/)
