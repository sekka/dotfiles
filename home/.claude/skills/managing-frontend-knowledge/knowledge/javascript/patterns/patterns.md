---
title: JavaScript パターン
category: javascript/patterns
tags: [javascript, dom, patterns, async, utilities]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# JavaScript パターン

DOM操作、イベントハンドリング、非同期処理、ユーティリティに関するナレッジ集。

---

## ブロックリンク（カードUI）のアクセシブルな実装

> 出典: https://yuheiy.com/2025-04-17-building-better-block-links
> 執筆日: 2025-04-17
> 追加日: 2025-12-17

カードUI全体をクリック可能にしつつ、アクセシビリティの問題を解決するJavaScriptパターン。従来のCSS疑似要素（stretched link）手法の欠点を克服する。

### なぜこの方法が良いのか

**従来の stretched link 手法の問題点:**
- テキスト選択ができない
- 修飾キー（Cmd/Ctrl + クリック）が効かない
- 入れ子リンクの実装が困難

**この手法のメリット:**
- スクリーンリーダーの読み上げが冗長にならない
- テキスト選択が可能
- 修飾キー（新規タブで開く等）が正常に動作
- カード内に別リンクを配置可能

### コード例

```javascript
// @react-aria/utils の openLink を使用（修飾キー対応のため）
import { openLink } from '@react-aria/utils';

for (const card of document.querySelectorAll('.card')) {
  // カード内の主要リンクを取得
  const link = card.querySelector('h3 a');

  card.addEventListener('pointerup', (event) => {
    // カード内の別リンクをクリックした場合は何もしない
    if (event.target.closest('a:any-link')) return;

    // テキスト選択中は何もしない（選択操作を妨げない）
    if (document.getSelection().isCollapsed) {
      // openLink は修飾キーを考慮してリンクを開く
      openLink(link, event);
    }
  });
}
```

```css
.card {
  /* JSが有効な場合のみクリック可能なカーソルを表示 */
  @media (scripting: enabled) {
    cursor: pointer;
  }
}
```

### ユースケース

- ニュース記事カード
- 製品リストのアイテム
- ブログ記事プレビュー
- 検索結果のカード表示
- ダッシュボードのウィジェット

### 注意点

- **`@react-aria/utils` の使用推奨**: 修飾キー（Cmd/Ctrl/Shift + クリック）の挙動を正しく処理するため
- **JS無効環境**: 基本的なリンク機能のみに限定される（プログレッシブエンハンスメント）
- **`pointerup` を使用**: `click` ではなく `pointerup` で早期にイベントを処理
- **テキスト選択の考慮**: `getSelection().isCollapsed` でドラッグ選択を妨げない

### 関連

- アクセシビリティ観点の詳細は `accessibility.md` も参照

---

## 令和の JavaScript パターン

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

### Debounce（連続呼び出しの抑制）

スクロールやリサイズなど高頻度イベントの処理を間引く。

```javascript
function debounce(func, wait = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), wait);
  };
}

// 使用例: リサイズイベント
window.addEventListener(
  "resize",
  debounce(() => {
    console.log("リサイズ処理");
  }, 200)
);

// 使用例: 検索入力
searchInput.addEventListener(
  "input",
  debounce((e) => {
    fetchSearchResults(e.target.value);
  }, 300)
);
```

### Throttle（一定間隔での実行）

```javascript
function throttle(func, limit = 100) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 使用例: スクロールイベント
window.addEventListener(
  "scroll",
  throttle(() => {
    updateScrollProgress();
  }, 100)
);
```

### Intersection Observer（要素の可視性検知）

```javascript
// スクロールアニメーション
const animateElements = document.querySelectorAll("[data-scroll-animate]");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.dataset.scrollAnimate = "visible";
        // 一度だけ発火させる場合は unobserve
        // observer.unobserve(entry.target);
      }
    });
  },
  {
    root: null, // ビューポート基準
    rootMargin: "-20% 0px", // 上下20%内側に入ったら発火
    threshold: 0, // 少しでも見えたら
  }
);

animateElements.forEach((el) => observer.observe(el));
```

```css
[data-scroll-animate] {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s, transform 0.6s;
}

[data-scroll-animate="visible"] {
  opacity: 1;
  transform: translateY(0);
}
```

### matchMedia（JavaScript でメディアクエリ）

```javascript
// CSS変数からブレークポイントを取得
const styles = getComputedStyle(document.documentElement);
const breakpointMd = styles.getPropertyValue("--breakpoint-md").trim();

const mediaQuery = window.matchMedia(`(max-width: ${breakpointMd})`);

function handleMediaChange(e) {
  if (e.matches) {
    console.log("モバイル表示");
    // モバイル用の処理
  } else {
    console.log("デスクトップ表示");
    // デスクトップ用の処理
  }
}

// 初回実行
handleMediaChange(mediaQuery);

// 変更を監視
mediaQuery.addEventListener("change", handleMediaChange);
```

### 375px 未満のビューポート対応

極端に小さい画面でレイアウト崩れを防ぐ。

```javascript
function adjustViewport() {
  const minWidth = 375;
  const viewport = document.querySelector('meta[name="viewport"]');
  const value =
    window.outerWidth < minWidth
      ? `width=${minWidth}`
      : "width=device-width, initial-scale=1";
  viewport.setAttribute("content", value);
}

// 初回実行 + リサイズ時
adjustViewport();
window.addEventListener("resize", debounce(adjustViewport, 100));
```

### async/await と fetch

```javascript
async function fetchData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

// 使用例
async function loadUserData() {
  try {
    const user = await fetchData("/api/user");
    console.log(user);
  } catch (error) {
    showErrorMessage("データの取得に失敗しました");
  }
}
```

### AbortController（fetch のキャンセル・タイムアウト）

```javascript
async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  }
}

// 複数リクエストの一括キャンセル
const controller = new AbortController();

Promise.all([
  fetch("/api/data1", { signal: controller.signal }),
  fetch("/api/data2", { signal: controller.signal }),
]).catch(() => {});

// すべてのリクエストをキャンセル
controller.abort();
```

### DOMContentLoaded vs load

```javascript
// DOM構築完了時（画像等の読み込みを待たない）
document.addEventListener("DOMContentLoaded", () => {
  // DOM操作、イベント登録など
});

// 全リソース読み込み完了時
window.addEventListener("load", () => {
  // 画像サイズに依存する処理など
});
```

**推奨:** 通常は `DOMContentLoaded` を使用。`defer` 属性付き script なら不要な場合も。

### 配列操作のモダンな書き方

```javascript
const users = [
  { id: 1, name: "Alice", active: true },
  { id: 2, name: "Bob", active: false },
  { id: 3, name: "Carol", active: true },
];

// find - 条件に一致する最初の要素
const bob = users.find((user) => user.id === 2);

// filter - 条件に一致する全要素
const activeUsers = users.filter((user) => user.active);

// some - いずれかが条件を満たすか
const hasInactive = users.some((user) => !user.active);

// every - すべてが条件を満たすか
const allActive = users.every((user) => user.active);

// map - 変換
const names = users.map((user) => user.name);

// includes - 配列に含まれるか
const ids = [1, 2, 3];
ids.includes(2); // true
```

### スプレッド構文

```javascript
// 配列のコピー
const copy = [...original];

// 配列の結合
const combined = [...arr1, ...arr2];

// オブジェクトのコピー・マージ
const newObj = { ...obj1, ...obj2 };

// 関数の引数展開
const numbers = [1, 2, 3];
Math.max(...numbers);
```

### Optional Chaining / Nullish Coalescing

```javascript
// Optional Chaining - 安全なプロパティアクセス
const city = user?.address?.city;
const first = arr?.[0];
const result = obj?.method?.();

// Nullish Coalescing - null/undefined のみデフォルト値
const value = input ?? "default";

// 組み合わせ
const name = user?.profile?.name ?? "Anonymous";
```

---

## CSSStyleSheet（JavaScript でスタイルシート構築）

> 出典: https://azukiazusa.dev/blog/cssstylesheet-to-build-stylesheets-in-javascript/
> 執筆日: 2024-10-26
> 追加日: 2025-12-17

JavaScript で動的にスタイルシートを生成・操作する API。
Web Components や動的スタイリングに有用。

### 基本的な使い方

```javascript
// スタイルシートを作成
const sheet = new CSSStyleSheet();

// スタイルを設定（同期）
sheet.replaceSync(`
  body {
    background-color: lightblue;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
`);

// ドキュメントに適用
document.adoptedStyleSheets = [sheet];
```

### 複数のスタイルシートを適用

```javascript
const baseStyles = new CSSStyleSheet();
const themeStyles = new CSSStyleSheet();

baseStyles.replaceSync(`/* ベーススタイル */`);
themeStyles.replaceSync(`/* テーマスタイル */`);

// 配列で複数指定
document.adoptedStyleSheets = [baseStyles, themeStyles];

// 既存に追加する場合
document.adoptedStyleSheets = [...document.adoptedStyleSheets, newSheet];
```

### スタイル操作メソッド

```javascript
const sheet = new CSSStyleSheet();

// ルールを追加（インデックス指定可能）
sheet.insertRule("body { margin: 0; }", 0);
sheet.insertRule(".hidden { display: none; }", 1);

// ルールを削除（インデックス指定）
sheet.deleteRule(0);

// 全体を置換（同期）
sheet.replaceSync("body { color: black; }");

// 全体を置換（非同期） - @import 使用時など
await sheet.replace("@import url('external.css');");
```

### Shadow DOM での使用

Web Components でカプセル化されたスタイルを適用。

```javascript
class MyComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    // コンポーネント専用スタイル
    const styles = new CSSStyleSheet();
    styles.replaceSync(`
      :host {
        display: block;
        padding: 16px;
      }
      .title {
        font-size: 1.5rem;
        font-weight: bold;
      }
    `);

    // Shadow DOM に適用
    shadow.adoptedStyleSheets = [styles];

    shadow.innerHTML = `<h1 class="title"><slot></slot></h1>`;
  }
}

customElements.define("my-component", MyComponent);
```

### スタイルシートの共有

複数の Shadow DOM 間でスタイルを共有できる（メモリ効率が良い）。

```javascript
// 共通スタイルを一度だけ作成
const sharedStyles = new CSSStyleSheet();
sharedStyles.replaceSync(`
  * { box-sizing: border-box; }
  .btn { padding: 8px 16px; border-radius: 4px; }
`);

class ComponentA extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sharedStyles]; // 共有
  }
}

class ComponentB extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sharedStyles]; // 同じシートを共有
  }
}
```

### メディアクエリ対応

```javascript
// ダークモード用スタイルシート
const darkModeStyles = new CSSStyleSheet({
  media: "(prefers-color-scheme: dark)",
});

darkModeStyles.replaceSync(`
  body {
    background-color: #1a1a1a;
    color: #f0f0f0;
  }
`);

document.adoptedStyleSheets = [baseStyles, darkModeStyles];
```

### 動的テーマ切り替え

```javascript
const themes = {
  light: new CSSStyleSheet(),
  dark: new CSSStyleSheet(),
};

themes.light.replaceSync(`
  :root {
    --bg-color: #ffffff;
    --text-color: #333333;
  }
`);

themes.dark.replaceSync(`
  :root {
    --bg-color: #1a1a1a;
    --text-color: #f0f0f0;
  }
`);

function setTheme(themeName) {
  document.adoptedStyleSheets = [baseStyles, themes[themeName]];
}

// テーマ切り替え
setTheme("dark");
```

### ユースケース

- **Web Components**: Shadow DOM 内のスタイリング
- **CSS-in-JS**: ランタイムでのスタイル生成
- **テーマ切り替え**: 動的なテーマ変更
- **A/B テスト**: スタイルの動的切り替え
- **ユーザーカスタマイズ**: ユーザー設定に基づくスタイル適用

### ブラウザ対応

| 機能 | Chrome | Firefox | Safari |
|------|--------|---------|--------|
| `CSSStyleSheet()` | 73+ | 101+ | 16.4+ |
| `adoptedStyleSheets` | 73+ | 101+ | 16.4+ |

### 従来手法との比較

```javascript
// ❌ 従来: style 要素を挿入
const style = document.createElement("style");
style.textContent = "body { color: red; }";
document.head.appendChild(style);

// ✅ CSSStyleSheet: より効率的
const sheet = new CSSStyleSheet();
sheet.replaceSync("body { color: red; }");
document.adoptedStyleSheets = [sheet];
```

**CSSStyleSheet のメリット:**
- DOM 操作なし（パフォーマンス向上）
- 複数の Shadow DOM 間でスタイル共有可能
- スタイルの追加・削除が容易
- メモリ効率が良い

---

## 高階関数（Higher-Order Functions）

> 出典: https://code.tutsplus.com/higher-order-functions-in-javascript--cms-107951t
> 執筆日: 2023-11-22
> 追加日: 2026-01-31

別の関数を引数として受け取る、または関数を戻り値として返す関数。コードの再利用性と可読性を向上させる重要な概念。

### なぜ高階関数が良いのか

- **抽象化**: 共通ロジックを隠蔽し、変化する部分のみを関数として渡す
- **再利用性**: 同じパターンを複数の場所で使い回せる
- **可読性**: ループベースの実装より意図が明確
- **関数型プログラミング**: 副作用を抑え、テストしやすいコードを書ける

### 基本パターン1: 関数を引数として受け取る

```javascript
/**
 * 汎用計算関数（高階関数）
 */
function calculate(a, b, operation) {
  return operation(a, b);
}

// 操作関数
function add(x, y) {
  return x + y;
}

function subtract(x, y) {
  return x - y;
}

function multiply(x, y) {
  return x * y;
}

// 使用例
console.log(calculate(10, 5, add));       // 15
console.log(calculate(10, 5, subtract));  // 5
console.log(calculate(10, 5, multiply));  // 50

// アロー関数で簡潔に
console.log(calculate(10, 5, (x, y) => x / y)); // 2
```

### 基本パターン2: 関数を返す

```javascript
/**
 * 関数を生成する高階関数
 */
function createMultiplier(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15

// クロージャを活用したカウンター
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
console.log(counter.getCount()); // 2
```

### 配列メソッド: filter()

条件に基づいて配列要素をフィルタリング。

```javascript
const employees = [
  { name: 'Alice', salary: 50000 },
  { name: 'Bob', salary: 75000 },
  { name: 'Carol', salary: 60000 },
  { name: 'Dave', salary: 80000 }
];

// 給与が70000以上の従業員
const highEarners = employees.filter(emp => emp.salary >= 70000);
console.log(highEarners);
// [{ name: 'Bob', salary: 75000 }, { name: 'Dave', salary: 80000 }]

// 複数条件
const filtered = employees.filter(emp =>
  emp.salary >= 60000 && emp.name.startsWith('C')
);
console.log(filtered);
// [{ name: 'Carol', salary: 60000 }]
```

### 配列メソッド: map()

配列の各要素に変換を適用し、新しい配列を生成。

```javascript
const students = [
  { name: 'Alice', grade: 85 },
  { name: 'Bob', grade: 92 },
  { name: 'Carol', grade: 78 }
];

// 名前のみを抽出
const names = students.map(student => student.name);
console.log(names); // ['Alice', 'Bob', 'Carol']

// グレードを10%増加
const boosted = students.map(student => ({
  ...student,
  grade: Math.min(100, student.grade * 1.1) // 最大100点
}));

// オブジェクト変換
const summary = students.map(s => ({
  student: s.name,
  passed: s.grade >= 80
}));
console.log(summary);
// [
//   { student: 'Alice', passed: true },
//   { student: 'Bob', passed: true },
//   { student: 'Carol', passed: false }
// ]
```

### 配列メソッド: reduce()

配列を単一値に縮約。

```javascript
const numbers = [1, 2, 3, 4, 5];

// 合計
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum); // 15

// 最大値
const max = numbers.reduce((acc, num) => Math.max(acc, num), -Infinity);
console.log(max); // 5

// オブジェクトの集計
const orders = [
  { product: 'Laptop', price: 1200 },
  { product: 'Mouse', price: 25 },
  { product: 'Keyboard', price: 75 }
];

const totalPrice = orders.reduce((total, order) => total + order.price, 0);
console.log(totalPrice); // 1300

// グループ化
const people = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Carol', age: 25 }
];

const groupedByAge = people.reduce((groups, person) => {
  const age = person.age;
  if (!groups[age]) {
    groups[age] = [];
  }
  groups[age].push(person);
  return groups;
}, {});

console.log(groupedByAge);
// {
//   25: [{ name: 'Alice', age: 25 }, { name: 'Carol', age: 25 }],
//   30: [{ name: 'Bob', age: 30 }]
// }
```

### メソッドチェーン

高階関数を連鎖させて複雑な処理を表現。

```javascript
const products = [
  { name: 'Laptop', price: 1200, category: 'Electronics' },
  { name: 'Desk', price: 300, category: 'Furniture' },
  { name: 'Mouse', price: 25, category: 'Electronics' },
  { name: 'Chair', price: 150, category: 'Furniture' }
];

// エレクトロニクス製品の合計金額
const electronicsTotal = products
  .filter(p => p.category === 'Electronics')
  .map(p => p.price)
  .reduce((sum, price) => sum + price, 0);

console.log(electronicsTotal); // 1225

// 価格順にソート → 上位3件の名前を取得
const top3Names = products
  .sort((a, b) => b.price - a.price)
  .slice(0, 3)
  .map(p => p.name);

console.log(top3Names); // ['Laptop', 'Desk', 'Chair']
```

### カスタム高階関数: retry()

失敗時に再試行する関数ラッパー。

```javascript
/**
 * 関数を再試行可能にする高階関数
 */
function retry(fn, maxAttempts = 3, delay = 1000) {
  return async function(...args) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        if (attempt === maxAttempts) {
          throw new Error(`Failed after ${maxAttempts} attempts: ${error.message}`);
        }
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };
}

// 使用例
async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Network error');
  return response.json();
}

const fetchWithRetry = retry(fetchData, 3, 2000);

try {
  const data = await fetchWithRetry('https://api.example.com/data');
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### カスタム高階関数: once()

関数を一度だけ実行する。

```javascript
/**
 * 関数を一度だけ実行可能にする高階関数
 */
function once(fn) {
  let called = false;
  let result;

  return function(...args) {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}

// 使用例: 初期化処理
const initialize = once(() => {
  console.log('Initializing application...');
  return { status: 'initialized' };
});

console.log(initialize()); // "Initializing application..." + { status: 'initialized' }
console.log(initialize()); // { status: 'initialized' }（再実行されない）
```

### カスタム高階関数: memoize()

関数の結果をキャッシュする。

```javascript
/**
 * 関数の結果をメモ化する高階関数
 */
function memoize(fn) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log('Cache hit');
      return cache.get(key);
    }

    console.log('Computing...');
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// 使用例: 重い計算
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const memoizedFib = memoize(fibonacci);

console.log(memoizedFib(40)); // 遅い（初回）
console.log(memoizedFib(40)); // 高速（キャッシュから）
```

### 関数合成（Function Composition）

複数の関数を組み合わせて新しい関数を作成。

```javascript
/**
 * 右から左に関数を合成
 */
function compose(...fns) {
  return function(value) {
    return fns.reduceRight((acc, fn) => fn(acc), value);
  };
}

// 個別の関数
const trim = str => str.trim();
const toLowerCase = str => str.toLowerCase();
const removeSpaces = str => str.replace(/\s+/g, '-');

// 合成
const slugify = compose(removeSpaces, toLowerCase, trim);

console.log(slugify('  Hello World  ')); // 'hello-world'

// パイプ（左から右）
function pipe(...fns) {
  return function(value) {
    return fns.reduce((acc, fn) => fn(acc), value);
  };
}

const slugifyPipe = pipe(trim, toLowerCase, removeSpaces);
console.log(slugifyPipe('  Hello World  ')); // 'hello-world'
```

### ユースケース

- **配列操作**: `filter`, `map`, `reduce` によるデータ変換
- **イベントハンドラー**: 関数を引数として渡す
- **非同期処理**: Promise チェーン、async/await
- **関数ラッパー**: debounce, throttle, retry, memoize
- **カリー化**: 引数の部分適用
- **ミドルウェア**: Express.js のミドルウェアパターン

### ループ vs 高階関数

```javascript
const numbers = [1, 2, 3, 4, 5];

// ❌ ループ（命令的）
const evenNumbersLoop = [];
for (let i = 0; i < numbers.length; i++) {
  if (numbers[i] % 2 === 0) {
    evenNumbersLoop.push(numbers[i] * 2);
  }
}

// ✅ 高階関数（宣言的）
const evenNumbers = numbers
  .filter(n => n % 2 === 0)
  .map(n => n * 2);

console.log(evenNumbers); // [4, 8]
```

**高階関数のメリット:**
- 意図が明確（「何を」するかが分かりやすい）
- 副作用が少ない（元の配列を変更しない）
- チェーン可能（複数の操作を連鎖）
- テストしやすい

### パフォーマンスの考慮

```javascript
// ❌ 非効率（複数回ループ）
const result = numbers
  .filter(n => n > 0)
  .map(n => n * 2)
  .filter(n => n < 100);

// ✅ 効率的（1回のループ）
const resultOptimized = numbers.reduce((acc, n) => {
  if (n > 0) {
    const doubled = n * 2;
    if (doubled < 100) {
      acc.push(doubled);
    }
  }
  return acc;
}, []);
```

**注意:**
- 小さい配列（<1000要素）では可読性優先
- 大きい配列ではパフォーマンス測定して判断
- ホットパス（頻繁に実行される箇所）では最適化

### 注意点

- **不変性**: 元のデータを変更しない（`push` ではなく `concat`, スプレッド構文）
- **純粋関数**: 同じ入力に対して常に同じ出力（副作用なし）
- **過度な抽象化**: シンプルなケースでは直接書く方が分かりやすい
- **パフォーマンス**: 大規模データでは計測して最適化

### 関連ナレッジ

- [debounce/throttle](./patterns.md#debounce（連続呼び出しの抑制）) - 高階関数の実用例
- [async/await](./patterns.md#asyncawait-と-fetch) - 非同期の高階関数

---

---

## Next.js Navigation Guard（ページ遷移防止）

> 出典: https://speakerdeck.com/ypresto/hack-to-prevent-page-navigation-in-next-js
> 執筆日: 2024年
> 追加日: 2026-01-31

Next.jsでページ遷移をキャンセルする機能を実装する3つのハック。BtoB SaaSで「保存していない変更」ダイアログを実現するライブラリ。

### なぜこの方法が必要なのか

Next.jsの公式APIには**ページ遷移キャンセル機能がない**ため、以下のような課題があった：
- フォーム編集中の誤った遷移を防げない
- ブラウザの戻る/進むボタンに対応できない
- App Router・Pages Routerの両方に対応する必要がある

### 3つの実装テクニック

#### Hack #1: Contextを介したRouterの差し替え

Reactの「最も近い親のContext値が使われる」仕組みを活用。

```javascript
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context';

function NavigationGuardProvider({ children }) {
  const router = useRouter();

  // router.push() を監視可能なラッパーで包む
  const wrappedRouter = useMemo(() => ({
    ...router,
    push: async (url) => {
      // ガード処理
      if (hasUnsavedChanges && !confirm('Changes will be lost')) {
        return; // 遷移をキャンセル
      }
      return router.push(url);
    }
  }), [router]);

  return (
    <AppRouterContext.Provider value={wrappedRouter}>
      {children}
    </AppRouterContext.Provider>
  );
}
```

**ポイント:** Next.jsの内部Context（AppRouterContext）を上書きすることで、全てのコンポーネントが包装されたルーターを使用する。

#### Hack #2: stopImmediatePropagation()でイベント制御

ブラウザの戻る/進むボタン（popstate）を制御。

```javascript
useLayoutEffect(() => {
  const handlePopState = (event) => {
    if (hasUnsavedChanges && !confirm('Changes will be lost')) {
      // Next.jsより先に登録することで、Next.jsのリスナーを阻止
      event.stopImmediatePropagation();

      // 履歴を元に戻す
      window.history.pushState(null, '', window.location.href);
    }
  };

  // useLayoutEffectで早期に登録（Next.jsより先）
  window.addEventListener('popstate', handlePopState, { capture: true });

  return () => {
    window.removeEventListener('popstate', handlePopState, { capture: true });
  };
}, [hasUnsavedChanges]);
```

**ポイント:**
- `useLayoutEffect` で同期的に登録（Next.jsより先に実行）
- `stopImmediatePropagation()` で後続のリスナー（Next.js）を阻止
- `capture: true` でキャプチャフェーズで処理

#### Hack #3: history.pushState()をオーバーライド

履歴の位置をトラッキングし、遷移をキャンセルした場合に復元。

```javascript
// stateにindexを自動付与
const originalPushState = window.history.pushState.bind(window.history);
const originalReplaceState = window.history.replaceState.bind(window.history);

let historyIndex = 0;

window.history.pushState = function(state, ...args) {
  historyIndex++;
  return originalPushState({ ...state, __index: historyIndex }, ...args);
};

window.history.replaceState = function(state, ...args) {
  return originalReplaceState({ ...state, __index: historyIndex }, ...args);
};

// 遷移キャンセル時に履歴位置を復元
function restoreHistoryPosition(targetIndex) {
  const currentIndex = window.history.state?.__index || 0;
  const delta = targetIndex - currentIndex;

  if (delta !== 0) {
    window.history.go(delta); // 差分を計算して移動
  }
}
```

**ポイント:** 履歴の各エントリにインデックスを付与し、`history.go(差分)` で正確に復元。

### 使用方法

```javascript
import { NavigationGuardProvider, useNavigationGuard } from 'next-navigation-guard';

function App({ Component, pageProps }) {
  return (
    <NavigationGuardProvider>
      <Component {...pageProps} />
    </NavigationGuardProvider>
  );
}

function EditForm() {
  const [formData, setFormData] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useNavigationGuard({
    enabled: hasUnsavedChanges,
    confirm: () => window.confirm('未保存の変更があります。ページを離れますか？'),
    // または独自ダイアログ
    confirmAsync: async () => {
      return await showCustomDialog();
    }
  });

  return <form>...</form>;
}
```

### ユースケース

- **フォーム編集画面**: 未保存の変更がある場合に警告
- **BtoB SaaS**: ドキュメント編集、設定変更
- **ECサイト**: カート編集中の離脱防止
- **コンテンツ管理**: 記事編集、データ入力

### 注意点

- **Next.jsの内部APIを使用**: バージョンアップで破損する可能性
- **App Router / Pages Router 両対応**: ライブラリが両方に対応
- **外部遷移**: `beforeunload` イベントで別途対応が必要

```javascript
useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = ''; // ブラウザのデフォルトダイアログを表示
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges]);
```

### ブラウザ対応

- 全モダンブラウザ対応（Next.jsが動作する環境）
- `stopImmediatePropagation()` はIE11でも対応

### GitHub

https://github.com/LayerXcom/next-navigation-guard

---

## ゼロランタイムCSS-in-JS（Linaria / Ecsstatic）

> 出典: https://lealog.hateblo.jp/entry/2023/03/24/095644
> 執筆日: 2023-03-24
> 追加日: 2026-01-31

ゼロランタイムオーバーヘッドを実現するCSS-in-JSライブラリの選定と実装パターン。

### なぜゼロランタイムが必要なのか

従来のCSS-in-JS（styled-components、Emotion等）の課題：
- **ランタイムコスト**: JavaScriptでCSSを生成・挿入
- **バンドルサイズ**: ライブラリのランタイムを含む
- **パフォーマンス**: 初回レンダリングが遅い

### 要件定義

理想的なCSS-in-JS:
1. **ゼロランタイム**: ビルド時にCSSファイルを生成
2. **CSSセマンティクス保持**: 疑似クラス、メディアクエリ等が使える
3. **コンポーネントコロケーション**: JSXと同じファイルに記述
4. **非同期ロード**: 必要なCSSのみを読み込み
5. **ツリーシェイキング**: 未使用スタイルを削除
6. **DX**: エディタのサポート

### 比較検討

#### Tailwind CSS（❌不採用）

```jsx
// 冗長なクラス名
<div className="flex items-center justify-between px-4 py-2 bg-blue-500 text-white rounded-lg">
```

**不採用理由:**
- マークアップが冗長
- MPAでの非同期ロードが困難
- 設定のスケールが難しい

#### CSS Modules（❌不採用）

```jsx
// 別ファイルが必要
import styles from './Button.module.css';

<button className={styles.button}>Click</button>
```

**不採用理由:**
- コロケーション不可（別`.module.css`ファイル）
- 未使用スタイルのツリーシェイキング不可

#### Linaria / Ecsstatic（✅採用）

```javascript
import { css } from 'ecsstatic'; // または 'linaria'

const buttonStyle = css`
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.5rem;

  &:hover {
    background-color: #2563eb;
  }

  @media (max-width: 768px) {
    padding: 0.375rem 0.75rem;
  }
`;

function Button() {
  return <button className={buttonStyle}>Click</button>;
}
```

**ビルド後:**

```css
/* button.css（自動生成） */
.button_abc123 {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.5rem;
}

.button_abc123:hover {
  background-color: #2563eb;
}

@media (max-width: 768px) {
  .button_abc123 {
    padding: 0.375rem 0.75rem;
  }
}
```

```javascript
// button.js（自動生成）
const buttonStyle = 'button_abc123';
```

### Linaria vs Ecsstatic

| 特徴 | Linaria | Ecsstatic |
|------|---------|-----------|
| **認知度** | 高い | 低い |
| **バンドラー対応** | Webpack, Vite, Rollup | Vite専用 |
| **フットプリント** | やや大きい | 非常に小さい |
| **開発状況** | 安定 | 新しい |

**選定理由（Ecsstatic）:**
- Viteプロジェクトで十分
- 最小限のフットプリント
- シンプルなAPI

### 実装例

#### 基本パターン

```javascript
import { css } from 'ecsstatic';

const container = css`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const title = css`
  font-size: 2rem;
  font-weight: bold;
  color: #1a202c;

  & > span {
    color: #3b82f6;
  }
`;

function Page() {
  return (
    <div className={container}>
      <h1 className={title}>
        Welcome to <span>Ecsstatic</span>
      </h1>
    </div>
  );
}
```

#### 動的スタイル（CSS変数）

```javascript
import { css } from 'ecsstatic';

const button = css`
  background-color: var(--btn-bg);
  color: var(--btn-color);
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
`;

function Button({ variant = 'primary' }) {
  const colors = {
    primary: { '--btn-bg': '#3b82f6', '--btn-color': 'white' },
    secondary: { '--btn-bg': '#6b7280', '--btn-color': 'white' },
  };

  return (
    <button className={button} style={colors[variant]}>
      Click
    </button>
  );
}
```

#### メディアクエリ

```javascript
const responsive = css`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;
```

### エディタサポート

#### VSCode

```json
// settings.json
{
  "editor.quickSuggestions": {
    "strings": true // テンプレートリテラル内で補完を有効化
  }
}
```

拡張機能: **vscode-styled-components** をインストール

#### NeoVim

TreeSitterで構文ハイライト + TypeScript LSP設定

### トレードオフ

**メリット:**
- ゼロランタイムオーバーヘッド
- CSSセマンティクス完全対応
- コロケーション可能
- ツリーシェイキング対応

**デメリット:**
- **型安全性なし**: テンプレートリテラル内は文字列（コンパイル時検証なし）
- **エディタサポート**: オブジェクト形式（styled-componentsのcss prop）より劣る
- **ビルド必須**: 開発時もビルドステップが必要

### ユースケース

- **パフォーマンス重視**: Core Web Vitalsを改善したい
- **MPAアプリケーション**: ページごとにCSSを分割ロード
- **ゼロJS環境**: JavaScriptなしでもスタイルを適用
- **コンポーネントライブラリ**: 配布時にランタイムを含めたくない

### 参考リンク

- [Linaria](https://github.com/callstack/linaria)
- [Ecsstatic](https://github.com/atlassian-labs/ecsstatic)
- [CSS-in-JS パフォーマンス比較](https://pustelto.com/blog/css-vs-css-in-js-perf/)

---

## 関連ナレッジ

- [JavaScript アニメーション](../animation/animation.md) - 指数平滑法など
- [パフォーマンス最適化](../../cross-cutting/performance/performance-optimization.md) - defer, lazy load など
