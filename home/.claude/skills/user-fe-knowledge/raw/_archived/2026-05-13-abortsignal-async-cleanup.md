---
url: https://ics.media/entry/260423/
fetched_at: 2026-05-13
title: fetchのキャンセルだけじゃない！ AbortSignalで実現するクリーンなJS非同期処理
---

# AbortSignal で実現するクリーンな JS 非同期処理

**著者：** 松本 ゆき（株式会社 ICS）

## 主要な技術ポイント

### 1. AbortSignal の基本概念
"「非同期処理にキャンセルを伝えるための仕組み」" として、`AbortController` と `AbortSignal` を組み合わせて使用。**単一の signal を複数の非同期処理で共有でき、一括管理が可能**。

### 2. 基本的な使用パターン

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

controller.abort();
```

**重要な注意点：** "一度 `abort()` メソッドでキャンセルしたら元の状態には戻りません"

### 3. addEventListener での活用

```javascript
const controller = new AbortController();
const { signal } = controller;

window.addEventListener(
  "resize",
  () => console.log("リサイズ"),
  { signal }
);

controller.abort(); // リスナーが自動削除
```

利点：`removeEventListener()` で関数参照を保持する必要がなくなる

### 4. レースコンディション対策

```javascript
const tabBodyElement = document.getElementById("tab-body");
let currentController = null;

const changeTab = async tabId => {
  currentController?.abort();
  currentController = new AbortController();
  const { signal } = currentController;

  try {
    tabBodyElement.textContent = "Loading...";
    const response = await fetch(`/contents/${tabId}`, { signal });
    tabBodyElement.textContent = await response.text();
  } catch (err) {
    if (!signal.aborted) throw err;
  }
};
```

**目的：** 高速操作時の古いリクエスト応答による画面の誤表示を防止

### 5. タイムアウト・複合キャンセル

```javascript
const combined = AbortSignal.any([
  currentController.signal,       // 次回呼び出しで中止
  signal,                          // 外部からのキャンセル
  AbortSignal.timeout(5000)        // 5秒でタイムアウト
]);

fetch(`/contents/${tabId}`, { signal: combined });
```

### 6. React コンポーネントでの活用

```javascript
useEffect(() => {
  const controller = new AbortController();
  const signal = controller.signal;

  window.addEventListener("resize", onResize, { signal });
  fetch("/api/data", { signal }).then(setData);

  return () => controller.abort(); // 一括クリーンアップ
}, []);
```

### 7. カスタム Abortable 関数の実装

```javascript
const loadImage = (src, { signal } = {}) => {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();

    const img = new Image();
    const listenerController = new AbortController();
    const listenerSignal = listenerController.signal;

    const onLoad = () => {
      listenerController.abort();
      resolve(img);
    };

    const onAbort = () => {
      listenerController.abort();
      img.src = "";
      reject(signal?.reason ??
        new DOMException("Aborted", "AbortError"));
    };

    signal?.addEventListener("abort", onAbort,
      { signal: listenerSignal });
    img.addEventListener("load", onLoad,
      { signal: listenerSignal });
    img.src = src;
  });
};
```

## ブラウザサポート

| 機能 | ステータス | 対応 |
|------|-----------|------|
| 基本機能 (AbortController, signal in addEventListener/fetch) | Baseline Widely available | 全主要ブラウザ |
| `AbortSignal.any()` | Baseline 2024 Newly available | Safari 17.4+ |
| `AbortSignal.timeout()` | Baseline 2024 Newly available | Safari 17.4+ |

## なぜ優れているか
1. **統一的なキャンセル管理** — 標準APIと同じ signal で一緒に片付けられる
2. **メモリリーク防止** — コンポーネント単位で一括クリーンアップ
3. **可読性向上** — 複数のクリーンアップを `controller.abort()` 一行で実現
4. **拡張性** — 自作関数も同じ仕組みで対応可能
