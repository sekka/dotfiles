---
title: JavaScript命名規則とベストプラクティス
category: javascript/patterns
tags: [naming, conventions, code-quality, best-practices, readability]
created: 2026-01-19
updated: 2026-01-19
---

# JavaScript命名規則とベストプラクティス

> 出典: https://ics.media/entry/220915/
> 執筆日: 2022年9月15日
> 追加日: 2026-01-19

## 概要

わかりやすいコードを書くための命名テクニックを、定番のコード規約とライブラリの命名パターンから学びます。「プログラマーはコードを書く時間より読む時間が長い」とされ、適切な命名は開発効率とバグ防止に直結します。

## わかりにくい命名の3つの問題

### 1. 省略表現の使用

一般的でない略語は避けるべきです。

```javascript
// ❌ 悪い例
const btn = document.querySelector('.button');
const msg = 'Hello';
const cnt = 0;

// ✅ 良い例
const button = document.querySelector('.button');
const message = 'Hello';
const count = 0;
```

### 2. 隠れた意図

名前から予測できない処理を含んではいけません。

```javascript
// ❌ 悪い例: データ取得だけでなく表示もしている
function getUserData() {
  const data = api.fetch();
  renderUI(data); // 隠れた処理
  return data;
}

// ✅ 良い例: 責任を分離
function getUserData() {
  return api.fetch();
}

function displayUserData() {
  const data = getUserData();
  renderUI(data);
}
```

### 3. 曖昧な動作

関数が何をするか不明確な命名は避けます。

```javascript
// ❌ 悪い例
function handle() { /* ... */ }
function process() { /* ... */ }

// ✅ 良い例
function handleClick() { /* ... */ }
function processPayment() { /* ... */ }
```

## 基本的な記法

### ローワーキャメルケース (lowerCamelCase)

変数名と関数名に使用します。

```javascript
const userName = 'John';
const itemCount = 10;
function calculateTotal() { /* ... */ }
```

### アッパーキャメルケース (UpperCamelCase)

クラス名に使用します。

```javascript
class UserProfile { /* ... */ }
class ShoppingCart { /* ... */ }
```

### 大文字スネークケース (UPPER_SNAKE_CASE)

定数に使用します。

```javascript
const MAX_RETRY_COUNT = 3;
const API_ENDPOINT = 'https://api.example.com';
const DEFAULT_TIMEOUT = 5000;
```

## 実践的な9つの命名テクニック

### 1. 動詞の変化で状態を表現

過去分詞形で「~された状態」を表現します。

```javascript
// 選択された状態
const selectedItem = items.find(item => item.isSelected);

// 保留中の状態
const pendingRequests = requests.filter(req => req.status === 'pending');

// 無効化された状態
const disabledButtons = buttons.filter(btn => btn.disabled);

// その他の例
const loadedImages = [...];
const completedTasks = [...];
const validatedForms = [...];
```

### 2. is/can/has で真偽値を表現

真偽値を返す変数や関数には接頭辞を使用します。

```javascript
// is: 状態の判定
const isValid = validateForm(data);
const isVisible = element.style.display !== 'none';
const isLoading = state.status === 'loading';

// can: 可能性・能力
const canEdit = user.role === 'admin';
const canMove = position.x < maxX;

// has: 所有・存在
const hasChildren = element.children.length > 0;
const hasError = errors.length > 0;
const hasPermission = checkPermission(user);
```

### 3. current/previous/next で順序を表現

時系列や順序関係を明確にします。

```javascript
const currentPage = 3;
const previousPage = 2;
const nextPage = 4;

const currentIndex = array.indexOf(currentItem);
const previousItem = array[currentIndex - 1];
const nextItem = array[currentIndex + 1];
```

### 4. before/after で時間軸を表現

処理の前後や時系列を明示します。

```javascript
// Vue.jsライフサイクルフック
beforeCreate() { /* ... */ }
afterMount() { /* ... */ }

// イベントハンドラー
function beforeSubmit(form) { /* ... */ }
function afterSubmit(response) { /* ... */ }

// 変数
const beforeUpdate = { ...state };
const afterUpdate = { ...state, newValue };
```

### 5. latest/last/first で時系列を表現

最新・最後・最初の要素を表現します。

```javascript
// latest: 最新のもの (時間的に新しい)
const latestEntry = entries[0];
const latestVersion = '2.0.0';

// last: 最後のもの (順序的に末尾)
const lastItem = array[array.length - 1];
const lastCharacter = string.slice(-1);

// first: 最初のもの (順序的に先頭)
const firstElement = array[0];
const firstName = fullName.split(' ')[0];
```

### 6. parent/child で階層関係を表現

親子関係や階層構造を明示します。

```javascript
const parentElement = document.querySelector('.parent');
const childElements = parentElement.querySelectorAll('.child');

const parentData = {
  id: 1,
  children: [
    { id: 2, parentId: 1 },
    { id: 3, parentId: 1 }
  ]
};

// その他の階層表現
const rootNode = tree.root;
const leafNodes = tree.getLeaves();
```

### 7. 複数形で配列を表現

配列やリストは複数形で表現します。

```javascript
// ✅ 良い例: 複数形
const users = ['Alice', 'Bob', 'Charlie'];
const items = [1, 2, 3, 4, 5];
const buttons = document.querySelectorAll('button');

// ❌ 悪い例: 単数形
const user = ['Alice', 'Bob', 'Charlie'];
const item = [1, 2, 3, 4, 5];

// 単数形と組み合わせる
users.forEach(user => {
  console.log(user);
});
```

### 8. to◯◯ で変換処理を表現

データ形式の変換関数には`to`を接頭辞として使用します。

```javascript
// ケース変換
function toHyphenatedCode(text) {
  return text.toLowerCase().replace(/\s+/g, '-');
}

function toCamelCase(text) {
  return text.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

// 型変換
function toString(value) {
  return String(value);
}

function toNumber(value) {
  return Number(value);
}

// データ変換
function toJSON(object) {
  return JSON.stringify(object);
}

function toArray(nodeList) {
  return Array.from(nodeList);
}
```

### 9. init で初期化処理を表現

初期化処理には`init`を接頭辞として使用します。

```javascript
function initApp() {
  initializeDatabase();
  initializeRouter();
  initializeUI();
}

function initTask(config) {
  return {
    id: generateId(),
    status: 'pending',
    ...config
  };
}

// クラスの初期化
class Application {
  init() {
    this.setupEventListeners();
    this.loadInitialData();
  }
}
```

## 補足テクニック

### get/set で取得・設定を表現

```javascript
function getUserName() {
  return user.name;
}

function setUserName(name) {
  user.name = name;
}
```

### handle で イベントハンドラーを表現

```javascript
function handleClick(event) { /* ... */ }
function handleSubmit(event) { /* ... */ }
function handleChange(event) { /* ... */ }
```

### on で イベントリスナーを表現

```javascript
element.onClick = () => { /* ... */ };
element.onChange = () => { /* ... */ };

// またはコールバック関数
function onSuccess(data) { /* ... */ }
function onError(error) { /* ... */ }
```

### create/delete で生成・削除を表現

```javascript
function createUser(userData) { /* ... */ }
function deleteUser(userId) { /* ... */ }
```

### find/filter/map で配列操作を表現

```javascript
const foundUser = users.find(user => user.id === targetId);
const activeUsers = users.filter(user => user.isActive);
const userNames = users.map(user => user.name);
```

## まとめ

適切な命名は、コードの可読性と保守性を大きく向上させます。以下のポイントを意識しましょう:

1. 一般的でない略語を避ける
2. 関数名から処理内容が予測できるようにする
3. 真偽値には is/can/has を使う
4. 時系列や順序関係を明確にする (current/previous/next, before/after)
5. 配列は複数形で表現する
6. 変換処理には to を接頭辞として使う
7. 初期化処理には init を接頭辞として使う

これらのテクニックを活用することで、チーム開発でもメンテナンスしやすいコードが書けるようになります。
