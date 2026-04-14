---
title: Pa11y CI によるアクセシビリティ自動テスト
category: cross-cutting/accessibility
tags: [a11y, testing, ci-cd, automation, wcag, github-actions]
browser_support: Node.js環境（テストツール）
created: 2025-01-16
updated: 2025-01-16
---

# Pa11y CI によるアクセシビリティ自動テスト

> 出典: https://azukiazusa.dev/blog/pa11y-ci-githubactions/
> 執筆日: 2022年12月
> 追加日: 2025-01-16

## 概要

**Pa11y CI** は、WCAG（Web Content Accessibility Guidelines）に基づいて HTML の自動アクセシビリティ検査を行うツール。GitHub Actions と組み合わせることで、プルリクエスト時に自動的にアクセシビリティ違反を検出し、コード品質を継続的に監視できる。

## セットアップ

### 1. インストール

```bash
npm install --save-dev pa11y-ci
```

または、GitHub Actionsでグローバルインストール：

```bash
npm install -g pa11y-ci
```

### 2. 設定ファイル作成

プロジェクトルートに `.pa11yci.json` を配置：

```json
{
  "urls": [
    "http://localhost:3000",
    "http://localhost:3000/blog",
    "http://localhost:3000/about"
  ]
}
```

## 設定オプション

### 基本的な設定

```json
{
  "urls": [
    "http://localhost:3000",
    {
      "url": "http://localhost:3000/blog/article",
      "ignore": [
        "WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.InputCheckbox.Name"
      ]
    }
  ],
  "defaults": {
    "timeout": 10000,
    "viewport": {
      "width": 1280,
      "height": 1024
    }
  }
}
```

### URL別の設定

各URLに対して個別の設定が可能：

| プロパティ | 説明 | 例 |
|-----------|------|-----|
| `url` | テスト対象のURL | `"http://localhost:3000"` |
| `ignore` | 無視するWCAGルール | `["WCAG2AA.Principle1..."]` |
| `actions` | テスト前のブラウザ操作 | `["click button"]` |
| `timeout` | タイムアウト時間（ミリ秒） | `10000` |

## ブラウザ操作（Actions）

テスト前にブラウザ操作を実行できる。例：ダークモード切り替え、モーダル表示など。

```json
{
  "url": "http://localhost:3000/",
  "actions": [
    "click button[aria-label='ダークモードに切り替える']",
    "wait for button[aria-label='ライトモードに切り替える'] to be visible",
    "set field #search to クエリ",
    "check field #agree"
  ]
}
```

### 利用可能なアクション

| アクション | 構文 | 説明 |
|----------|------|------|
| クリック | `click element <selector>` | 要素をクリック |
| 入力 | `set field <selector> to <value>` | フィールドに値を入力 |
| チェック | `check field <selector>` | チェックボックスをON |
| 表示待機 | `wait for <selector> to be visible` | 要素が表示されるまで待機 |
| 非表示待機 | `wait for <selector> to be hidden` | 要素が非表示になるまで待機 |
| URL待機 | `wait for url to be <url>` | URLが変わるまで待機 |
| パス待機 | `wait for path to be <path>` | パスが変わるまで待機 |

**注意**: セレクタは `querySelector` と同等の構文を使用する。

## GitHub Actions連携

### ワークフロー設定

`.github/workflows/ci.yml`：

```yaml
name: CI
on:
  pull_request:

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: npm

      - name: Install dependencies
        run: npm ci && npm install -g pa11y-ci

      - name: Build
        run: npm run build

      - name: Start server and run pa11y-ci
        run: |
          npm run preview &
          sleep 3
          pa11y-ci
```

### 重要なポイント

1. **起動待機時間**: `sleep 3` でサーバー起動を待つ
   - ローカルサーバーが起動する前にテストが開始されると失敗する
   - プロジェクトに応じて待機時間を調整（3〜10秒程度）

2. **バックグラウンド実行**: `&` でサーバーをバックグラウンドで起動

3. **Node.jsバージョン**: v12以降が必須

## レポート出力

### JSON形式での詳細レポート

```bash
pa11y-ci --json > pa11y-ci-results.json
```

**出力例**:

```json
{
  "total": 15,
  "passes": 13,
  "errors": 2,
  "results": {
    "http://localhost:3000": {
      "errors": [
        {
          "code": "WCAG2AA.Principle1.Guideline1_3.1_3_1.H49.I",
          "type": "error",
          "message": "Semantic markup should be used to mark emphasised or special text",
          "context": "<i class=\"icon\"></i>",
          "selector": "html > body > header > nav > i"
        }
      ]
    }
  }
}
```

**出力フィールド**:
- `code`: WCAGルールコード（`ignore`配列に使用）
- `type`: エラーレベル（error, warning, notice）
- `message`: エラーメッセージ
- `context`: 問題のあるHTML
- `selector`: CSSセレクタ

### ignore 対象の特定

JSON出力から `code` を抽出して `.pa11yci.json` の `ignore` に追加：

```json
{
  "url": "http://localhost:3000",
  "ignore": [
    "WCAG2AA.Principle1.Guideline1_3.1_3_1.H49.I"
  ]
}
```

## 実践的な使い方

### 1. 段階的な導入

既存プロジェクトに導入する場合、すべてのエラーを一度に修正するのは困難。以下のアプローチを推奨：

```json
{
  "urls": [
    {
      "url": "http://localhost:3000",
      "ignore": [
        // 既知の問題を一時的に無視
        "WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail",
        "WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.Button.Name"
      ]
    }
  ]
}
```

その後、段階的に `ignore` リストを削減していく。

### 2. 重要なページから開始

全ページをテストするのではなく、重要なページから開始：

```json
{
  "urls": [
    "http://localhost:3000",           // トップページ
    "http://localhost:3000/signup",    // サインアップ
    "http://localhost:3000/pricing"    // 価格ページ
  ]
}
```

### 3. CI/CDでのエラーハンドリング

```yaml
- name: pa11y-ci
  run: pa11y-ci
  continue-on-error: true  # 最初は警告として扱う
```

導入初期は `continue-on-error: true` で警告扱いにし、徐々に厳格化。

## よくある問題と対処法

### 1. タイムアウトエラー

**問題**: ページの読み込みが遅くテストがタイムアウトする

**解決策**:
```json
{
  "defaults": {
    "timeout": 30000
  }
}
```

### 2. 動的コンテンツのテスト

**問題**: JavaScriptで動的に生成されるコンテンツが検出されない

**解決策**: `wait for` アクションで要素を待機
```json
{
  "actions": [
    "wait for .content to be visible"
  ]
}
```

### 3. 認証が必要なページ

**問題**: ログインが必要なページをテストできない

**解決策**: ローカルストレージやクッキーの設定（開発用認証バイパス推奨）

### 4. 誤検知の除外

**問題**: サードパーティライブラリの問題が検出される

**解決策**: 該当するルールを `ignore` に追加
```json
{
  "ignore": [
    "WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.*"
  ]
}
```

ワイルドカード `*` で複数ルールをまとめて除外可能。

## ベストプラクティス

### 1. テストとドキュメントの併用

自動テストは完璧ではない。スクリーンリーダーなどの実際のツールでもテストする。

### 2. エラー修正の優先順位

| レベル | 優先度 | 対応 |
|--------|--------|------|
| error | 高 | 即座に修正 |
| warning | 中 | 計画的に修正 |
| notice | 低 | 余裕があれば修正 |

### 3. チーム教育

CI失敗時に「なぜこのルールが重要か」を共有する文化を作る。

### 4. 定期的なレビュー

`ignore` リストを定期的に見直し、修正可能なものから対応する。

## 他のツールとの比較

| ツール | 特徴 | pa11y-ciとの違い |
|--------|------|------------------|
| **axe-core** | より詳細なレポート | 実行速度が遅い |
| **Lighthouse CI** | パフォーマンス+a11y | セットアップが複雑 |
| **pa11y-ci** | シンプル、軽量 | カスタマイズ性は低め |

複数ツールの併用も効果的。

## 参考リンク

- [Pa11y CI 公式ドキュメント](https://github.com/pa11y/pa11y-ci)
- [WCAG 2.1 達成基準](https://waic.jp/translations/WCAG21/)
- [GitHub Actions ドキュメント](https://docs.github.com/ja/actions)

---
