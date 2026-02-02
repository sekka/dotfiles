---
title: JavaScript命名テクニック - 基礎編
category: javascript/patterns
tags: [naming, prefix, timeline, hierarchy, best-practices]
created: 2026-02-01
updated: 2026-02-01
---

# JavaScript命名テクニック - 基礎編

> 出典: https://ics.media/entry/220915/
> 執筆日: 2022年9月15日
> 追加日: 2026-02-01

## 概要

変数や関数の命名において、接頭辞や時間軸、階層関係を使った実践的なテクニックを解説します。これらのパターンを活用することで、コードの可読性と保守性が大幅に向上します。

## 1. 接頭辞による意味の明確化

### is/can/has で真偽値を表現

真偽値を返す変数や関数には、状態や能力を明確にする接頭辞を使用します。

```javascript
// is: 状態の判定
const isValid = validateForm(data);
const isVisible = element.style.display !== 'none';
const isLoading = state.status === 'loading';
const isAuthenticated = !!user.token;
const isActive = user.status === 'active';

// can: 可能性・能力
const canEdit = user.role === 'admin' || user.role === 'editor';
const canMove = position.x < maxX && position.y < maxY;
const canDelete = hasPermission('delete') && !isLocked;
const canSubmit = isValid && !isSubmitting;

// has: 所有・存在
const hasChildren = element.children.length > 0;
const hasError = errors.length > 0;
const hasPermission = checkPermission(user, 'admin');
const hasUnsavedChanges = isDirty();
```

**実践例: フォーム検証**

```javascript
function validateLoginForm(formData) {
  const hasEmail = !!formData.email;
  const hasPassword = !!formData.password;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isPasswordLongEnough = formData.password.length >= 8;

  const canSubmit = hasEmail && hasPassword && isEmailValid && isPasswordLongEnough;

  return {
    canSubmit,
    errors: {
      email: hasEmail && !isEmailValid ? 'Invalid email format' : null,
      password: hasPassword && !isPasswordLongEnough ? 'Password too short' : null
    }
  };
}
```

### get/set でアクセサーを表現

```javascript
// シンプルな取得・設定
function getUserName() {
  return user.name;
}

function setUserName(name) {
  user.name = name;
  saveToStorage();
}

// クラスでの使用
class UserProfile {
  #data = {};

  getUserData() {
    return { ...this.#data };
  }

  setUserData(data) {
    this.#data = { ...this.#data, ...data };
    this.save();
  }
}
```

### handle/on でイベント処理を表現

```javascript
// handle: イベントハンドラー
function handleClick(event) {
  event.preventDefault();
  submit();
}

function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  processForm(formData);
}

function handleChange(event) {
  const { name, value } = event.target;
  updateField(name, value);
}

// on: コールバック関数
function onSuccess(data) {
  showNotification('Success!');
  updateUI(data);
}

function onError(error) {
  showErrorMessage(error.message);
  logError(error);
}

// 実践例: フォーム送信
async function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);

  try {
    const response = await submitForm(formData);
    onSubmitSuccess(response);
  } catch (error) {
    onSubmitError(error);
  }
}

function onSubmitSuccess(response) {
  showNotification('Form submitted successfully');
  resetForm();
  redirectTo('/success');
}

function onSubmitError(error) {
  showErrorMessage(error.message);
  enableSubmitButton();
}
```

### create/delete で CRUD 操作を表現

```javascript
// Create
function createUser(userData) {
  const user = {
    id: generateId(),
    ...userData,
    createdAt: new Date()
  };
  database.save(user);
  return user;
}

// Read
function getUser(userId) {
  return database.find(userId);
}

// Update
function updateUser(userId, updates) {
  const user = database.find(userId);
  const updated = { ...user, ...updates, updatedAt: new Date() };
  database.save(updated);
  return updated;
}

// Delete
function deleteUser(userId) {
  database.remove(userId);
}

// 実践例: Todo アプリ
const todoManager = {
  createTodo(title) {
    return {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date()
    };
  },

  deleteTodo(todos, id) {
    return todos.filter(todo => todo.id !== id);
  },

  updateTodo(todos, id, updates) {
    return todos.map(todo =>
      todo.id === id ? { ...todo, ...updates } : todo
    );
  }
};
```

### find/filter/map で配列操作を表現

```javascript
// find: 単一の要素を検索
const foundUser = users.find(user => user.id === targetId);
const foundIndex = users.findIndex(user => user.id === targetId);

// filter: 条件に合う要素を抽出
const activeUsers = users.filter(user => user.isActive);
const adminUsers = users.filter(user => user.role === 'admin');
const recentUsers = users.filter(user => {
  const daysSinceCreated = (Date.now() - user.createdAt) / (1000 * 60 * 60 * 24);
  return daysSinceCreated <= 7;
});

// map: 要素を変換
const userNames = users.map(user => user.name);
const userIds = users.map(user => user.id);

// 実践例: ユーザー検索と絞り込み
function filterActiveAdmins(users) {
  return users.filter(user => user.isActive && user.role === 'admin');
}

function findUserByEmail(users, email) {
  return users.find(user => user.email === email);
}

function mapUsersToOptions(users) {
  return users.map(user => ({
    label: user.name,
    value: user.id
  }));
}
```

### to◯◯ で変換処理を表現

データ形式の変換関数には`to`を接頭辞として使用します。

```javascript
// ケース変換
function toHyphenatedCode(text) {
  return text.toLowerCase().replace(/\s+/g, '-');
}

function toCamelCase(text) {
  return text.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function toSnakeCase(text) {
  return text.replace(/([A-Z])/g, '_$1').toLowerCase();
}

// 型変換
function toString(value) {
  return String(value);
}

function toNumber(value) {
  return Number(value);
}

function toBoolean(value) {
  return Boolean(value);
}

// データ変換
function toJSON(object) {
  return JSON.stringify(object);
}

function toArray(nodeList) {
  return Array.from(nodeList);
}

function toMap(array, keyField = 'id') {
  return new Map(array.map(item => [item[keyField], item]));
}

// 実践例: フォームデータ変換
function toFormData(object) {
  const formData = new FormData();
  Object.entries(object).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}

function toQueryString(params) {
  return new URLSearchParams(params).toString();
}

function toURLSearchParams(object) {
  return new URLSearchParams(object);
}
```

### init で初期化処理を表現

```javascript
// アプリケーション初期化
function initApp() {
  initializeDatabase();
  initializeRouter();
  initializeUI();
  initializeEventListeners();
}

function initTask(config) {
  return {
    id: generateId(),
    status: 'pending',
    createdAt: new Date(),
    ...config
  };
}

// クラスの初期化
class Application {
  init() {
    this.setupEventListeners();
    this.loadInitialData();
    this.renderUI();
  }
}

// 実践例: React コンポーネント
function TodoApp() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    initializeTodos();
  }, []);

  async function initializeTodos() {
    const savedTodos = await loadTodosFromStorage();
    setTodos(savedTodos);
  }

  // ...
}
```

## 2. 時間軸による表現

### current/previous/next で順序を表現

現在・前・次の状態や要素を明確に表現します。

```javascript
// ページネーション
const currentPage = 3;
const previousPage = currentPage - 1;
const nextPage = currentPage + 1;

function navigateToPreviousPage() {
  if (currentPage > 1) {
    goToPage(previousPage);
  }
}

function navigateToNextPage() {
  if (currentPage < totalPages) {
    goToPage(nextPage);
  }
}

// 配列の要素
const currentIndex = array.indexOf(currentItem);
const previousItem = array[currentIndex - 1];
const nextItem = array[currentIndex + 1];

const hasPrevious = currentIndex > 0;
const hasNext = currentIndex < array.length - 1;

// 実践例: スライダー
class Slider {
  #currentSlide = 0;
  #slides = [];

  get currentSlide() {
    return this.#slides[this.#currentSlide];
  }

  get previousSlide() {
    return this.#slides[this.#currentSlide - 1];
  }

  get nextSlide() {
    return this.#slides[this.#currentSlide + 1];
  }

  goToPrevious() {
    if (this.#currentSlide > 0) {
      this.#currentSlide--;
      this.render();
    }
  }

  goToNext() {
    if (this.#currentSlide < this.#slides.length - 1) {
      this.#currentSlide++;
      this.render();
    }
  }
}
```

### before/after で時間軸を表現

処理の前後や時系列を明示します。

```javascript
// Vue.js ライフサイクルフック風
const lifecycle = {
  beforeCreate() {
    console.log('Before creation');
  },

  afterCreate() {
    console.log('After creation');
  },

  beforeMount() {
    console.log('Before mounting');
  },

  afterMount() {
    console.log('After mounting');
  }
};

// イベントハンドラー
function beforeSubmit(form) {
  const isValid = validateForm(form);
  return isValid; // false を返すと送信を中断
}

function afterSubmit(response) {
  showSuccessMessage();
  resetForm();
}

// 変数
function updateUserProfile(updates) {
  const beforeUpdate = { ...state.user };
  const afterUpdate = { ...state.user, ...updates };

  state.user = afterUpdate;
  logChange(beforeUpdate, afterUpdate);
}

// 実践例: データ更新
async function updateData(id, changes) {
  const beforeUpdate = await fetchData(id);

  beforeUpdateValidation(beforeUpdate, changes);

  const afterUpdate = await saveData(id, changes);

  afterUpdateNotification(beforeUpdate, afterUpdate);

  return afterUpdate;
}

function beforeUpdateValidation(oldData, changes) {
  if (!hasPermission(oldData)) {
    throw new Error('Permission denied');
  }
}

function afterUpdateNotification(oldData, newData) {
  const changedFields = getChangedFields(oldData, newData);
  notifySubscribers(changedFields);
}
```

### latest/last/first で時系列を表現

```javascript
// latest: 最新のもの (時間的に新しい)
const latestEntry = entries.sort((a, b) => b.createdAt - a.createdAt)[0];
const latestVersion = '2.0.0';
const latestUpdate = updates[updates.length - 1];

// last: 最後のもの (順序的に末尾)
const lastItem = array[array.length - 1];
const lastCharacter = string.slice(-1);
const lastName = fullName.split(' ').pop();

// first: 最初のもの (順序的に先頭)
const firstElement = array[0];
const firstName = fullName.split(' ')[0];
const firstCharacter = string[0];

// 実践例: ブログ記事管理
function getBlogPosts(posts) {
  const sortedByDate = [...posts].sort((a, b) =>
    new Date(b.publishedAt) - new Date(a.publishedAt)
  );

  return {
    latestPost: sortedByDate[0],
    firstPost: posts[0], // 配列の最初の要素
    lastPost: posts[posts.length - 1] // 配列の最後の要素
  };
}

// 実践例: コメントスレッド
function getThreadInfo(comments) {
  const sortedComments = [...comments].sort((a, b) =>
    new Date(a.createdAt) - new Date(b.createdAt)
  );

  return {
    firstComment: sortedComments[0], // 最初のコメント
    latestComment: sortedComments[sortedComments.length - 1], // 最新のコメント
    lastComment: comments[comments.length - 1] // 配列の最後
  };
}
```

## 3. 階層関係による表現

### parent/child で階層を表現

```javascript
// DOM 要素の階層
const parentElement = document.querySelector('.parent');
const childElements = parentElement.querySelectorAll('.child');

// データ構造の階層
const parentData = {
  id: 1,
  name: 'Parent',
  children: [
    { id: 2, parentId: 1, name: 'Child 1' },
    { id: 3, parentId: 1, name: 'Child 2' }
  ]
};

// その他の階層表現
const rootNode = tree.root;
const leafNodes = tree.getLeaves();

// 実践例: ツリー構造のナビゲーション
class TreeNode {
  constructor(data) {
    this.data = data;
    this.parent = null;
    this.children = [];
  }

  addChild(childNode) {
    childNode.parent = this;
    this.children.push(childNode);
  }

  getRoot() {
    let current = this;
    while (current.parent) {
      current = current.parent;
    }
    return current;
  }

  isLeaf() {
    return this.children.length === 0;
  }

  isRoot() {
    return this.parent === null;
  }
}

// 実践例: ファイルシステム
const fileSystem = {
  rootDirectory: '/',

  getParentDirectory(path) {
    return path.split('/').slice(0, -1).join('/') || '/';
  },

  getChildDirectories(parentPath) {
    return directories.filter(dir =>
      this.getParentDirectory(dir) === parentPath
    );
  }
};
```

### owner/owned で所有関係を表現

```javascript
// ユーザーとコンテンツの所有関係
const owner = users.find(user => user.id === post.ownerId);
const ownedPosts = posts.filter(post => post.ownerId === currentUser.id);

// 実践例: 権限チェック
function canEdit(user, post) {
  const isOwner = post.ownerId === user.id;
  const isAdmin = user.role === 'admin';

  return isOwner || isAdmin;
}

function getOwnedResources(userId) {
  return {
    ownedPosts: posts.filter(p => p.ownerId === userId),
    ownedComments: comments.filter(c => c.ownerId === userId),
    ownedProjects: projects.filter(p => p.ownerId === userId)
  };
}
```

## まとめ

命名における接頭辞、時間軸、階層関係の表現は、コードの意図を明確に伝える重要な手段です。

**接頭辞の使い分け:**
- `is/can/has`: 真偽値
- `get/set`: アクセサー
- `handle/on`: イベント処理
- `create/delete`: CRUD操作
- `find/filter/map`: 配列操作
- `to◯◯`: 変換処理
- `init`: 初期化

**時間軸の表現:**
- `current/previous/next`: 順序関係
- `before/after`: 処理の前後
- `latest/last/first`: 時系列

**階層関係の表現:**
- `parent/child`: 親子関係
- `root/leaf`: ツリー構造
- `owner/owned`: 所有関係

これらのパターンを適切に組み合わせることで、自己文書化されたコードを書くことができます。

## ブラウザサポート

記載されている JavaScript の命名テクニックは、言語の文法ではなく慣習であるため、すべてのブラウザで使用可能です。

## 関連リソース

- [naming-conventions.md](./naming-conventions.md) - JavaScript命名規則の基礎
- [naming-advanced.md](./naming-advanced.md) - 上級命名テクニック

## 出典

- [わかりやすいコードを書くための9つの命名テクニック【JavaScript】](https://ics.media/entry/220915/)
