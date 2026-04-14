---
title: BFCache（Back/Forward Cache）によるパフォーマンス最適化
category: cross-cutting/performance
tags: [bfcache, performance, navigation, pageshow, pagehide, 2023]
browser_support: Chrome 112+, Safari 16+, Firefox（バリエーションあり）
created: 2026-01-19
updated: 2026-01-19
---

# BFCache（Back/Forward Cache）によるパフォーマンス最適化

> 出典: https://techblog.yahoo.co.jp/entry/2023072430429932/
> 執筆日: 2023年7月24日
> 追加日: 2026-01-19

ブラウザの戻る/進むボタンを高速化する BFCache（Back/Forward Cache）の有効化と、Yahoo! JAPAN での実装事例。モバイルで **+2% PV増加、+9% 広告収益増加** を達成しました。

## BFCache とは

**BFCache（Back/Forward Cache）** は、ユーザーが戻る/進むボタンで遷移する際に、ページ全体をメモリにキャッシュして瞬時に復元する仕組み。

### 従来のナビゲーション

```
ページA → ページB → 戻るボタン → ページAを再ロード（遅い）
```

### BFCache を使ったナビゲーション

```
ページA → ページB → 戻るボタン → ページAをキャッシュから復元（瞬時）
```

## BFCache を無効化する要因

以下の条件があると BFCache が無効になります：

### 1. Cache-Control: no-store ヘッダー

```http
# ❌ BFCache が無効化される
Cache-Control: no-store
```

```http
# ✅ BFCache 対応
Cache-Control: max-age=0, private, must-revalidate
```

### 2. unload イベントハンドラー

```javascript
// ❌ BFCache が無効化される
window.addEventListener('unload', () => {
  // 処理
});
```

```javascript
// ✅ pagehide を使用
window.addEventListener('pagehide', () => {
  // 処理
});
```

## BFCache 対応の実装

### 1. イベントハンドラーの置き換え

#### unload → pagehide/pageshow

```javascript
// ❌ 従来の方法
window.addEventListener('unload', () => {
  // ユーザー行動のトラッキング
  sendAnalytics();
});

// ✅ BFCache 対応
window.addEventListener('pagehide', (event) => {
  // event.persisted が true なら BFCache に保存される
  sendAnalytics();
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // BFCache から復元された
    console.log('Restored from BFCache');
  }
});
```

### 2. BFCache 復元の検出

```javascript
// Method 1: pageshow イベント
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    console.log('BFCache からの復元');
    // 状態を更新
    updatePageState();
  }
});

// Method 2: Navigation Timing API
if (performance.getEntriesByType('navigation')[0]) {
  const navEntry = performance.getEntriesByType('navigation')[0];
  if (navEntry.type === 'back_forward') {
    console.log('戻る/進むで遷移');
  }
}
```

### 3. Permissions-Policy ヘッダー

```http
# unload イベントを明示的に禁止
Permissions-Policy: unload=()
```

ブラウザに `unload` イベントの使用を許可しないことを宣言します。

## Yahoo! JAPAN の実装事例

### 実施内容

1. **Cache-Control ヘッダーの修正**
   - `no-store` を削除
   - `max-age=0, private, must-revalidate` に変更

2. **unload イベントの削除**
   - アクセス解析用の `unload` ハンドラーを `pagehide` に置き換え

3. **pageshow/pagehide への移行**
   - ユーザー行動トラッキングを `pagehide` に統一
   - BFCache 復元時の状態更新処理を追加

### 効果測定

| 指標 | モバイル | デスクトップ |
|------|---------|------------|
| PV増加 | **+2%** | - |
| 広告収益増加 | **+9%** | - |

## 実装パターン

### パターン1: シンプルな検出

```javascript
let isBFCacheRestored = false;

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    isBFCacheRestored = true;
    // 状態を更新
    refreshData();
  }
});
```

### パターン2: トラッキング対応

```javascript
window.addEventListener('pagehide', (event) => {
  // BFCache に保存される場合でもトラッキング
  if (event.persisted) {
    // BFCache に保存される
    trackPageExit('bfcache');
  } else {
    // 完全なページ離脱
    trackPageExit('unload');
  }
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // BFCache から復元
    trackPageView('bfcache_restored');
  }
});
```

### パターン3: 状態の同期

```javascript
// BFCache 復元時にデータを再取得
window.addEventListener('pageshow', async (event) => {
  if (event.persisted) {
    // 最新データを取得
    const latestData = await fetchLatestData();
    updateUI(latestData);

    // フォーム状態の復元
    restoreFormState();
  }
});

// ページ離脱時に状態を保存
window.addEventListener('pagehide', () => {
  saveFormState();
});
```

## 注意点とベストプラクティス

### 1. WebSocket の処理

```javascript
let socket;

window.addEventListener('pagehide', () => {
  // BFCache 前に WebSocket を閉じる
  if (socket) {
    socket.close();
  }
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // BFCache 復元後に再接続
    socket = new WebSocket('wss://example.com');
  }
});
```

### 2. タイマーの処理

```javascript
let intervalId;

function startTimer() {
  intervalId = setInterval(() => {
    // 処理
  }, 1000);
}

function stopTimer() {
  clearInterval(intervalId);
}

window.addEventListener('pagehide', stopTimer);
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    startTimer();
  }
});
```

### 3. IndexedDB や LocalStorage

```javascript
window.addEventListener('pageshow', async (event) => {
  if (event.persisted) {
    // キャッシュされたデータが古い可能性
    const cachedTimestamp = localStorage.getItem('dataTimestamp');
    const now = Date.now();

    if (now - cachedTimestamp > 60000) { // 1分以上経過
      // データを再取得
      await refreshData();
    }
  }
});
```

## デバッグとテスト

### Chrome DevTools での確認

1. **Application タブ** → **Back/forward cache** セクション
2. BFCache が無効化されている理由を確認
3. テストボタンで BFCache の動作を検証

### パフォーマンス測定

```javascript
// Navigation Timing API で測定
const navEntry = performance.getEntriesByType('navigation')[0];

console.log('Navigation Type:', navEntry.type);
// "navigate" | "reload" | "back_forward" | "prerender"

if (navEntry.type === 'back_forward') {
  console.log('BFCache かどうか:', navEntry.transferSize === 0);
  // transferSize が 0 なら BFCache から復元
}
```

## ブラウザサポート

| ブラウザ | 対応状況 | 備考 |
|---------|---------|------|
| Chrome | 112+ (2023年4月) | Android Chrome でも対応 |
| Safari | 16+ (2022年9月) | iOS Safari も対応 |
| Firefox | 110+ (2023年2月) | 実装に若干の差異あり |
| Edge | 112+ (2023年4月) | Chromium ベース |

## よくある問題と解決策

### 問題: フォームデータが古い

```javascript
// ✅ BFCache 復元時にフォームを検証
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    const form = document.querySelector('form');
    if (form) {
      // サーバーでセッションが有効か確認
      validateSession().then(isValid => {
        if (!isValid) {
          // セッション切れの場合は再ログイン促す
          showLoginPrompt();
        }
      });
    }
  }
});
```

### 問題: リアルタイムデータが更新されない

```javascript
// ✅ BFCache 復元時にデータを強制更新
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // 最新のリアルタイムデータを取得
    refreshRealTimeData();
  }
});
```

## ユースケース

- ニュースサイト（記事の一覧 ⇔ 詳細を高速に往復）
- ECサイト（商品一覧 ⇔ 商品詳細）
- SNS（タイムライン ⇔ 投稿詳細）
- 検索結果ページ（結果 ⇔ 詳細ページ）

## 参考リソース

- [web.dev: Back/forward cache](https://web.dev/bfcache/)
- [MDN: Page Lifecycle API](https://developer.mozilla.org/ja/docs/Web/API/Page_Visibility_API)
- [Chrome DevTools: BFCache testing](https://developer.chrome.com/docs/devtools/application/back-forward-cache/)

---
