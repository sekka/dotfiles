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

## 関連ナレッジ

- [JavaScript アニメーション](../animation/animation.md) - 指数平滑法など
- [パフォーマンス最適化](../../cross-cutting/performance/performance-optimization.md) - defer, lazy load など
