---
title: AbortSignal でクリーンな非同期処理
category: javascript/patterns
tags: [abort, abortcontroller, abortsignal, async, cleanup, fetch, event-listener, react, 2024]
browser_support: 基本機能 Baseline Widely available / AbortSignal.any() & timeout() Safari 17.4+
created: 2026-05-13
updated: 2026-05-13
---

# AbortSignal で実現するクリーンな JS 非同期処理

> 出典: https://ics.media/entry/260423/ — ICS 松本 ゆき
> 追加日: 2026-05-13

`AbortController` と `AbortSignal` は「非同期処理にキャンセルを伝えるための仕組み」。fetch のキャンセルだけでなく、**1つの signal で複数の非同期処理 / イベントリスナーを一括管理**できる強力なクリーンアップパターン。

## 1. 基本の使い方

```javascript
const controller = new AbortController();
const { signal } = controller;

fetch("/api/data", { signal })
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => {
    if (signal.aborted) {
      console.log("キャンセルされました");
    }
  });

controller.abort(); // → fetch が AbortError でリジェクトされる
```

**注意**: 一度 `abort()` した signal は元に戻らない。再利用するなら新しい `AbortController` を作る。

## 2. addEventListener での自動クリーンアップ

```javascript
const controller = new AbortController();
const { signal } = controller;

window.addEventListener(
  "resize",
  () => console.log("リサイズ"),
  { signal }
);

controller.abort(); // → リスナーが自動削除
```

**利点**: `removeEventListener()` のために関数参照を保持する必要がなくなる。

## 3. レースコンディション対策

タブ切り替えなど高速操作で、古いリクエストの応答が後から届いて画面が誤表示される問題を防ぐ。

```javascript
const tabBodyElement = document.getElementById("tab-body");
let currentController = null;

const changeTab = async tabId => {
  // 前のリクエストをキャンセル
  currentController?.abort();
  currentController = new AbortController();
  const { signal } = currentController;

  try {
    tabBodyElement.textContent = "Loading...";
    const response = await fetch(`/contents/${tabId}`, { signal });
    tabBodyElement.textContent = await response.text();
  } catch (err) {
    if (!signal.aborted) throw err; // 本物のエラーだけ再 throw
  }
};
```

## 4. 複合キャンセル（AbortSignal.any）

複数の理由（外部キャンセル / タイムアウト / 次回呼び出し）のどれかが発火すれば中止する signal を合成できる。

```javascript
const combined = AbortSignal.any([
  currentController.signal,        // 次回呼び出しで中止
  externalSignal,                   // 外部からのキャンセル
  AbortSignal.timeout(5000)         // 5秒でタイムアウト
]);

fetch(`/contents/${tabId}`, { signal: combined });
```

### AbortSignal.timeout(ms)

タイムアウト専用のショートカット。指定ミリ秒経過で自動的に abort される。

```javascript
fetch("/api/slow", { signal: AbortSignal.timeout(3000) })
  .catch(err => {
    if (err.name === "TimeoutError") {
      console.log("タイムアウト");
    }
  });
```

## 5. React useEffect での活用

複数のリスナーと fetch を 1 つの signal で管理し、アンマウント時に `controller.abort()` 一行で全部片付ける。

```javascript
useEffect(() => {
  const controller = new AbortController();
  const { signal } = controller;

  window.addEventListener("resize", onResize, { signal });
  document.addEventListener("scroll", onScroll, { signal });

  fetch("/api/data", { signal })
    .then(res => res.json())
    .then(setData)
    .catch(err => {
      if (!signal.aborted) console.error(err);
    });

  return () => controller.abort(); // 全リスナー + fetch を一括クリーンアップ
}, []);
```

## 6. カスタム Abortable 関数

`signal` を受け取る独自関数を作れば、標準 API と同じ仕組みで統一できる。

```javascript
const loadImage = (src, { signal } = {}) => {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted(); // 既に abort 済みなら即座に reject

    const img = new Image();
    const listenerController = new AbortController();
    const listenerSignal = listenerController.signal;

    const onLoad = () => {
      listenerController.abort();
      resolve(img);
    };

    const onAbort = () => {
      listenerController.abort();
      img.src = ""; // 読み込み中断
      reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
    };

    signal?.addEventListener("abort", onAbort, { signal: listenerSignal });
    img.addEventListener("load", onLoad, { signal: listenerSignal });
    img.src = src;
  });
};

// 使用例
const ctrl = new AbortController();
loadImage("/hero.jpg", { signal: ctrl.signal })
  .then(img => document.body.append(img))
  .catch(err => console.log("中止:", err.message));
```

## ブラウザサポート

| 機能 | ステータス | 対応 |
|------|-----------|------|
| 基本（`AbortController`、`signal` in fetch / addEventListener） | Baseline Widely available | 全主要ブラウザ |
| `AbortSignal.any()` | Baseline 2024 Newly available | Safari 17.4+ |
| `AbortSignal.timeout()` | Baseline 2024 Newly available | Safari 17.4+ |
| `signal.throwIfAborted()` | Baseline 2024 | Safari 17.4+ |

## なぜ優れているか

1. **統一的なキャンセル管理** — 標準 API と自作関数を同じ signal で一緒に片付けられる
2. **メモリリーク防止** — コンポーネント / スコープ単位で確実にクリーンアップ
3. **可読性向上** — 複数のクリーンアップを `controller.abort()` 一行で
4. **拡張性** — 自作関数も同じインターフェースで対応可能
5. **`removeEventListener` 不要** — 関数参照を保持しなくても削除できる

## アンチパターン

```javascript
// ❌ signal を使い回そうとする
const controller = new AbortController();
fetch(url1, { signal: controller.signal });
controller.abort();
fetch(url2, { signal: controller.signal }); // 即座にエラー
```

→ abort 済みの signal は使えない。リクエストごとに新しい `AbortController` を作る。

```javascript
// ❌ AbortError を握りつぶす
.catch(err => {
  console.error(err); // 本物のエラーまで握りつぶす
});
```

→ `if (signal.aborted)` または `err.name === "AbortError"` で分岐する。

## 関連ナレッジ

- [patterns.md](./patterns.md) — JS パターン総合
- [naming-conventions.md](./naming-conventions.md)

## 参考リソース

- [ICS: fetch のキャンセルだけじゃない！ AbortSignal で実現するクリーンな JS 非同期処理](https://ics.media/entry/260423/)
- [MDN: AbortController](https://developer.mozilla.org/docs/Web/API/AbortController)
- [MDN: AbortSignal.any()](https://developer.mozilla.org/docs/Web/API/AbortSignal/any_static)
