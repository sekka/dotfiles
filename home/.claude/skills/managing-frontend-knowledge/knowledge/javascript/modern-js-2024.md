---
title: 2024年のモダンJavaScriptプラクティス
category: javascript
tags: [javascript, es6, performance, async, best-practices, 2024]
browser_support: iOS Safari 15系以上を基本とする
created: 2025-01-16
updated: 2025-01-16
---

# 2024年のモダンJavaScriptプラクティス

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年5月
> 追加日: 2025-01-16

2024年のWeb制作で推奨されるJavaScriptの書き方をまとめたガイドです。

## 目次

1. [パフォーマンス最適化](#パフォーマンス最適化)
2. [モダン構文（ES6+）](#モダン構文es6)
3. [非同期処理](#非同期処理)

---

## パフォーマンス最適化

### Defer属性

**`<script>`に`defer`属性を付けると非同期でJSファイルがダウンロードされます。**

```html
<head>
  <script src="script.js" defer></script>
  ...
</head>
```

**重要なポイント:**
- `</body>`の手前ではなく`<head>`のできるだけ上のほうで読み込む
- これにより、HTMLのパースと並行してJSファイルのダウンロードが開始される

#### type="module"との併用

`type="module"`属性を指定することで、そのファイル内で定義した変数はグローバル変数として扱われなくなります。

```html
<script src="script.js" defer type="module"></script>
```

**メリット:**
- グローバルスコープの汚染を防ぐ
- ES Modulesの機能（import/export）が使える
- 自動的にstrict modeで実行される

参考:
- https://qiita.com/phanect/items/82c85ea4b8f9c373d684
- https://zenn.dev/kagan/articles/731ca08f45b8c1

---

### DOMContentLoaded

**JSファイルを`<head>`の中で`defer`を付けて読み込む場合、ページ読み込み時の処理には`DOMContentLoaded`イベントを使います。**

```javascript
window.addEventListener('DOMContentLoaded', () => {
  // ここにページ読み込み時の処理を書く
  console.log('DOM構築完了');
});
```

**なぜ必要？**
- `defer`属性があってもDOMの構築完了を待つ必要がある
- DOMContentLoadedは画像などのリソースを待たずに発火する（loadイベントより早い）

---

### Debounce

**スクロールイベントやリサイズイベントは実行される頻度が極端に高いので、Debounceという手法で実行頻度を減らします。**

```javascript
function debounce(func, timeout) {
  let timer;
  timeout = timeout !== undefined ? timeout : 300;
  return () => {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, timeout);
  };
}

// 使用例
const handleResize = debounce(() => {
  console.log('リサイズ処理');
}, 300);

window.addEventListener('resize', handleResize);
```

**Debounceの仕組み:**
- イベントが発火するたびにタイマーをリセット
- 最後のイベント発火から指定時間（デフォルト300ms）経過後に実行

参考: https://www.freecodecamp.org/news/javascript-debounce-example/

---

### Intersection Observer

**Intersection Observerを使うことで、ブラウザに負荷をかけずにスクロールに応じた処理を実装できます。**

```javascript
const animaElements = document.querySelectorAll("[data-scroll-anima]");

const doWhenIntersect = entries => {
  const entriesArray = Array.prototype.slice.call(entries, 0);
  entriesArray.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.dataset.scrollAnima = 'true';
    }
  });
}

const options = {
  root: null, // ビューポートを基準
  rootMargin: '-20% 0px -20% 0px', // 上下20%の位置で検知
  threshold: 0 // 要素が1pxでも見えたら発火
};

const observer = new IntersectionObserver(doWhenIntersect, options);
animaElements.forEach((box) => {
  observer.observe(box);
});
```

**使用ケース:**
- スクロールアニメーション
- 画像の遅延読み込み
- 無限スクロール

参考: https://ics.media/entry/190902/

---

### matchMedia

**ブレイクポイントに応じて処理を実行する場合、`matchMedia`を使って今のブレイクポイントを判定します。**

```javascript
// CSS変数からブレイクポイントを取得
const rootStyles = getComputedStyle(document.documentElement);
const breackpointMd = rootStyles.getPropertyValue('--breackpoint-md');
const mediaQueryList = window.matchMedia(`(max-width: ${breackpointMd})`);

const mediaQueryFunction = (event) => {
  if (event.matches) {
    console.log('768px以下です');
  } else {
    console.log('769px以上です');
  }
};

mediaQueryList.addEventListener('change', mediaQueryFunction);
window.addEventListener('DOMContentLoaded', () => mediaQueryFunction(mediaQueryList));
```

**メリット:**
- CSSとJavaScriptでブレイクポイントの値を共有できる
- リサイズ時にリアルタイムで判定

参考: https://zenn.dev/no4_dev/articles/878f4afbff6668d4e28a-2

---

### 375px未満のレスポンシブ対応

**幅320pxのような小さい端末のレスポンシブ対応はCSSで頑張るのではなく、Viewportで表示倍率を縮小します。**

```javascript
const adjustViewport = () => {
  const triggerWidth = 375;
  const viewport = document.querySelector('meta[name="viewport"]');
  const value = window.outerWidth < triggerWidth
    ? `width=${triggerWidth}, target-densitydpi=device-dpi`
    : 'width=device-width, initial-scale=1';
  viewport.setAttribute('content', value);
}

// 初期実行
adjustViewport();

// リサイズ時にも実行
window.addEventListener('resize', debounce(adjustViewport, 300));
```

**理由:**
- 320px幅の端末は少ないため、CSSメディアクエリで細かく対応するのは非効率
- Viewportの縮小で375px基準のデザインをそのまま使える

参考: https://liginc.co.jp/451892

---

## モダン構文（ES6+）

### テンプレートリテラル

**テンプレートリテラルを使うことで、変数と文字列の結合が楽になります。**

```javascript
// 従来の書き方
const name = '山田';
const age = 30;
const message = '私は' + name + 'です。' + age + '歳です。';

// テンプレートリテラル
const message = `私は${name}です。${age}歳です。`;
```

**メリット:**
- 読みやすい
- 複数行の文字列も簡単に書ける
- 式の埋め込みが可能（`${1 + 1}` など）

---

### 配列操作メソッド

**配列に関するメソッド（`map`、`find`、`some`など）を使うことで記述量が圧倒的に短くなります。**

```javascript
const users = [
  { id: 1, name: '山田' },
  { id: 2, name: '田中' },
  { id: 3, name: '中村' }
];

// 特定の要素を検索
const targetUser = users.find(user => user.id === 2);

// 配列の変換
const names = users.map(user => user.name); // ['山田', '田中', '中村']

// 条件に合うか判定
const hasYamada = users.some(user => user.name === '山田'); // true

// すべてが条件に合うか判定
const allAdult = users.every(user => user.age >= 18);

// フィルタリング
const adults = users.filter(user => user.age >= 18);
```

**よく使うメソッド:**
- `map()`: 配列の各要素を変換
- `find()`: 条件に合う最初の要素を取得
- `some()`: 条件に合う要素が1つ以上あるか
- `every()`: すべての要素が条件に合うか
- `filter()`: 条件に合う要素だけを抽出

---

### スプレッド構文

**スプレッド構文を使うことで、配列やオブジェクトの結合や展開が楽になります。**

```javascript
let arr1 = [1, 2, 3];
let arr2 = [4, 5];

// 配列の結合
let combined = [...arr1, ...arr2]; // [1, 2, 3, 4, 5]

// 配列のコピー（シャローコピー）
let arrCopy = [...arr1]; // [1, 2, 3]

// オブジェクトの結合
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };
const merged = { ...obj1, ...obj2 }; // { a: 1, b: 2, c: 3, d: 4 }

// 関数の引数として展開
const numbers = [1, 5, 3, 9, 2];
const max = Math.max(...numbers); // 9
```

**注意:**
- オブジェクトや配列のコピーは「シャローコピー」（浅いコピー）
- ネストしたオブジェクトは参照が共有される

---

### アロー関数

**ES6で追加されたアロー関数は簡潔な関数定義が可能です。**

```javascript
// 従来の書き方
const add = function(a, b) {
  return a + b;
};

// アロー関数
const add = (a, b) => a + b;

// 複数行の処理
const calculate = (a, b) => {
  const sum = a + b;
  return sum * 2;
};

// 引数が1つの場合は()を省略可能
const double = x => x * 2;
```

**注意点:**
- `this`の扱いが通常の関数と異なる（レキシカルスコープ）
- コンストラクタとして使えない

---

## 非同期処理

### Async / Await

**特定の処理の後に他の処理を実行する場合は Async / await を使います。**

```javascript
async function fetchData() {
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  return data;
}

async function run() {
  try {
    const data = await fetchData();
    console.log('取得したデータ:', data);
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
  }
}

run();
```

**メリット:**
- Promiseのthen/catchチェーンより読みやすい
- 同期処理のように見えるコード
- try/catchでエラーハンドリング

参考: https://qiita.com/soarflat/items/1a9613e023200bbebcb3

---

### Fetch APIとAbortController

**APIなど外部からデータを取得する時はFetchかAxiosを使います。**

```javascript
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

#### 重要: 非同期処理の中断

**非同期処理には中断する処理が必要不可欠です。AbortControllerを使います。**

```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

fetch('https://api.example.com/data', {
  signal: controller.signal
})
  .then(response => {
    clearTimeout(timeoutId);
    return response.json();
  })
  .then(data => {
    console.log('Success:', data);
  })
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('Request timed out');
    } else {
      console.error('Error:', err);
    }
  });
```

**なぜ中断が必要？**
- タイムアウト処理
- ユーザーがページ遷移した場合のクリーンアップ
- 重複リクエストのキャンセル

参考:
- https://zenn.dev/syu/articles/9840082d1a6633#1.インストール方法
- https://developer.mozilla.org/ja/docs/Web/API/AbortController

---

## 著者推奨の優先順位

記事の最後で、著者が「まずはこれだけでも取り入れて」として推奨している項目：

### JavaScript最適化

1. **JSファイルはDeferで読み込み、DOMContentLoadedイベント内で処理**
   - ページの初期表示を高速化

2. **Debounceでスクロールやリサイズのイベント実行回数を間引く**
   - パフォーマンス向上

3. **Intersection Observerを使う**
   - スクロールイベントより効率的

---

## 関連ナレッジ

- [ES6の新機能](./es6-features.md)
- [非同期処理の基礎](./async-patterns.md)
- [パフォーマンス最適化](../cross-cutting/performance/site-performance-optimization.md)
- [Fetch APIの使い方](./fetch-api.md)
