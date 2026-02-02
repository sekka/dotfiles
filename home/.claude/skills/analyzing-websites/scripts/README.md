# ウェブサイトクロール用スクリプト

## 概要

このディレクトリには、Playwright MCPを使用したウェブサイトクロール用のスクリプトが含まれています。

## ファイル

### `deep-crawl-template.js`

**用途**: 5階層まで徹底的にクロールし、全内部リンクを発見・検証

**特徴**:
- JavaScript SPAに対応（動的レンダリング後のリンクを取得）
- 未探索ページの検出と報告
- 特定ドメインへのリンク検索
- 階層別統計
- レート制限（1秒/ページ）
- **URL正規化**（末尾スラッシュ、ハッシュの統一）
- **リトライ機構**（最大3回、2秒間隔）
- **階層情報の追跡**（正確な深度計算）

**追加パッケージ**: 不要（Playwright MCP のみ）

**改善版の新機能**:
1. URL正規化により重複リンクを削減
2. ネットワークエラー時の自動リトライ
3. 実際の階層情報を記録（URLパスの`/`の数ではなく、明示的なdepth指定）

---

### `deep-crawl-bfs.js` ⭐ NEW

**用途**: BFS（幅優先探索）による効率的な階層的クローリング

**AUXプロジェクトから得られた知見を統合**:
- **BFS方式**: 階層ごとに処理し、次の階層に進む
- **自動発見**: 開始URLから自動的にリンクを辿る（knownPagesの手動指定が不要）
- **堅牢なURL正規化**: 重複訪問を確実に防止
- **未探索ページの詳細追跡**: どのページからリンクされているか記録
- **レート制限強化**: 1.5秒/ページでサーバー負荷を配慮

**特徴**:
- JavaScript SPAに対応
- 自動リンク発見（開始URLのみ指定すればOK）
- 階層別統計の強化（内部/外部リンク数も集計）
- 特定ドメインへのリンク検索
- リトライ機構（最大3回、2秒間隔）
- 未探索ページをソート（深度順、最大100件）

**使い分け**:
- **既知のページリストがある場合**: `deep-crawl-template.js`
- **トップページから自動的に辿りたい場合**: `deep-crawl-bfs.js` ⭐

**追加パッケージ**: 不要（Playwright MCP のみ）

## 使用方法

### 方法1: BFS版を使う（推奨・シンプル） ⭐

**トップページから自動的にリンクを辿る場合**:

```typescript
// 1. BFS版スクリプトを読み込む
Read({
  file_path: "~/.claude/skills/analyzing-websites/scripts/deep-crawl-bfs.js"
});

// 2. baseUrl と maxDepth を編集
// 例: baseUrl = 'https://example.com', maxDepth = 3

// 3. browser_run_code で実行
mcp__plugin_playwright_playwright__browser_run_code({
  code: "... (編集したコード) ..."
});
```

**メリット**:
- knownPagesの手動指定が不要
- 階層ごとに処理され、進捗が分かりやすい
- 自動的にリンクを発見

---

### 方法2: テンプレート版を使う（既知のページリストがある場合）

```
1. Read でスクリプトを読み込む
2. baseUrl, knownPages を編集（必要に応じて）
3. mcp__plugin_playwright_playwright__browser_run_code で実行
```

**例**:

```typescript
// 1. スクリプトを読み込む
Read({
  file_path: "~/.claude/skills/analyzing-websites/scripts/deep-crawl-template.js"
});

// 2. 内容を編集（baseUrl、knownPages等）

// 3. browser_run_code で実行
mcp__plugin_playwright_playwright__browser_run_code({
  code: "... (編集したコード) ..."
});
```

**メリット**:
- 既知のページを優先的にクロール
- 階層情報を手動で制御可能

---

### 方法3: 既知のページリストから動的生成

```typescript
const knownPages = [
  'https://example.com',
  'https://example.com/about',
  'https://example.com/contact'
];

// テンプレートを読み込み、knownPages を置き換えて実行
```

## 設定項目

### 必須

- `baseUrl`: クロール対象のベースURL
  ```javascript
  const baseUrl = 'https://example.com';
  ```

- `knownPages`: クロール対象ページのリスト（階層情報付き）
  ```javascript
  const knownPages = [
    { url: baseUrl, depth: 0 },
    { url: `${baseUrl}/page1`, depth: 1 },
    { url: `${baseUrl}/page2`, depth: 1 },
    { url: `${baseUrl}/page1/sub`, depth: 2 }
  ];
  ```

  **注意**: 改善版では各ページに`depth`プロパティを指定する必要があります。
  これにより、URLパスの構造に依存しない正確な階層統計が得られます。

### オプション

- `maxDepth`: 最大階層深度（デフォルト: 5）
  ```javascript
  const maxDepth = 3;
  ```

- `targetDomain`: 探したい外部ドメイン（なければ `null`）
  ```javascript
  const targetDomain = 'partner.example.com';
  // または
  const targetDomain = null;
  ```

## 出力形式

### `summary`

```json
{
  "totalVisited": 27,
  "totalInternalLinks": 33,
  "targetDomainLinksFound": 0,
  "unexploredPages": 0
}
```

### `results`

各ページの詳細:

```json
[
  {
    "url": "https://example.com",
    "totalLinks": 27,
    "internalLinks": 26,
    "externalLinks": 1,
    "hasTargetDomain": false
  }
]
```

### `targetDomainLinks`

ターゲットドメインへのリンク（`targetDomain` を指定した場合）:

```json
[
  {
    "foundOn": "https://example.com/page1",
    "targetUrl": "https://partner.example.com/resource",
    "linkText": "詳細はこちら"
  }
]
```

### `unexplored`

未探索ページ（改善版では`wouldBeDepth`を含む）:

```json
[
  {
    "targetUrl": "https://example.com/deep-page",
    "wouldBeDepth": 3,
    "linkedFrom": [
      {
        "from": "https://example.com/page1",
        "linkText": "もっと見る"
      }
    ]
  }
]
```

**`wouldBeDepth`**: このページを訪問した場合の想定階層（リンク元の最小階層 + 1）

### `allInternalLinks`

発見した全内部リンク:

```json
[
  "https://example.com/",
  "https://example.com/about",
  "https://example.com/contact"
]
```

### `depthStats`

階層別統計（改善版では`internalLinks`も含む）:

```json
{
  "0": { "visited": 1, "totalLinks": 26, "internalLinks": 25 },
  "1": { "visited": 6, "totalLinks": 152, "internalLinks": 140 },
  "2": { "visited": 20, "totalLinks": 340, "internalLinks": 0 }
}
```

**`internalLinks`**: その階層で発見された内部リンクの総数

## パフォーマンス

- **速度**: 約1秒/ページ（レート制限あり）
- **メモリ**: 軽量（ページごとにクリーンアップ）
- **コンテキスト消費**: 約2,000トークン（スクリプト読み込み）

## 既知の制限

1. **JavaScript必須サイト**: 動的レンダリング後のリンクのみ取得
2. **認証ページ**: 認証が必要なページはクロール不可
3. **robots.txt**: 尊重しない（手動で除外が必要）
4. **レート制限**: 1秒/ページ固定（変更は手動編集が必要）

## トラブルシューティング

### リンクが0件になる

**原因**: サイトがJavaScriptで動的にレンダリングしている

**解決策**: このスクリプトはPlaywright MCPを使用しているため、通常は問題なし。`waitUntil: 'domcontentloaded'` を `'networkidle'` に変更してみる。

### タイムアウトエラー

**原因**: ページの読み込みが遅い

**解決策**: `timeout: 15000` を増やす（例: `30000`）

### 未探索ページが多い

**原因**: `knownPages` に含まれていないページが多い

**解決策**:
1. 出力の `allInternalLinks` を確認
2. 新しいページを `knownPages` に追加
3. 再実行

### 重複URLが多い（改善版で解決済み）

**原因**: 末尾スラッシュやハッシュの違いで同じページが複数回カウントされる

**解決策**: 改善版ではURL正規化により自動的に統一されます。

### ネットワークエラーでクロール失敗（改善版で解決済み）

**原因**: 一時的なネットワーク問題

**解決策**: 改善版では最大3回自動リトライします（2秒間隔）。

## カスタマイズ例

### クロール速度を上げる

```javascript
// レート制限を短縮
await page.waitForTimeout(500); // 1000 → 500
```

### より多くのリンク元を記録

```javascript
// 最初の5つ → 10個
linkedFrom: sources.slice(0, 10)
```

### 特定のパスを除外

```javascript
// 内部リンクフィルタに追加
const internalLinks = links.filter(l =>
  l.href.startsWith(baseUrl) &&
  !l.href.includes('/admin/') && // 追加
  !l.href.startsWith('javascript:') &&
  !l.href.startsWith('mailto:') &&
  !l.href.startsWith('tel:')
);
```

## 関連ファイル

- `../SKILL.md` - スキル全体のドキュメント
- `../TEMPLATES.md` - 出力テンプレート
