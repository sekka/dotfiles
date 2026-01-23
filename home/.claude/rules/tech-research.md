# 技術調査のガイドライン

## 概要

実装やデバッグ中にエラーや不明点が発生した場合、適切なツールを使って自発的に調査を行う。
効率的な調査のために、情報源の優先順位とセキュリティ原則を守ること。

---

## 基本フロー（デシジョンツリー）

```
エラー・不明点が発生
  ↓
公式ドキュメントが必要？
  YES → Context7 / Claude Code Guide
  NO  → 次へ
  ↓
CHANGELOG・既知の問題を調査？
  YES → DeepWiki
  NO  → 次へ
  ↓
パッケージ比較・トレンド調査？
  YES → WebFetch (npm trends, Moiva.io)
  NO  → 次へ
  ↓
5つ以上のライブラリを詳細比較？
  YES → /evaluating-tools スキル
  NO  → Context7 で深掘り
```

---

## 各ツールの使い分け

### 1. 公式ドキュメント優先

#### Context7

**用途:**

- ライブラリ公式ドキュメント
- API仕様
- ベストプラクティス
- 実装例

**使用例:**

```
質問: "Next.js 14でApp Routerを使ったデータフェッチ方法"
→ Context7で/vercel/next.jsを検索
```

**メリット:**

- 公式の最新情報
- 信頼性が高い
- サンプルコードが豊富

**注意:**

- バージョン指定が可能（例: `/vercel/next.js/v14.3.0`）
- 1つの質問で3回まで呼び出し可能

#### Claude Code Guide

**用途:**

- Claude Code自身の機能・仕様調査（自己参照的な質問）
- hooks、skills、MCPサーバーの使い方
- 設定ファイルの書き方

**使用例:**

```
質問: "hookでtool_callをキャッチする方法"
→ Claude Code Guideで検索
```

### 2. 補足情報

#### DeepWiki

**用途:**

- CHANGELOG（バージョン間の変更点）
- 既知の問題（GitHub Issues）
- 内部実装の理解
- マイグレーションガイド

**使用例:**

```
質問: "React 18から19への破壊的変更は？"
→ DeepWikiでfacebook/reactを検索
```

**メリット:**

- GitHubリポジトリ全体をインデックス化
- issueやdiscussionも検索可能

**注意:**

- プライベートリポジトリには使えない
- リポジトリ名は`owner/repo`形式（例: `facebook/react`）

#### WebFetch

**用途:**

- npm trends（ダウンロード数推移）
- Moiva.io（パッケージ比較）
- ブログ記事・最新技術動向

**使用例:**

```
質問: "Zodとyupどちらがトレンド？"
→ WebFetchで npm trends を検索
```

**メリット:**

- リアルタイムの市場動向
- コミュニティの評価

**注意:**

- 認証が必要なサイト（Google Docs、Confluence、Jira、GitHub）は使えない
- 公開URLのみ対応

### 3. 複雑な比較

#### /evaluating-tools スキル

**用途:**

- 5つ以上のライブラリを詳細比較
- PoC計画
- 意思決定フレームワーク

**使用例:**

```
質問: "React向けフォームライブラリ10個を比較したい"
→ /evaluating-tools スキルを起動
```

**メリット:**

- 多角的な評価軸
- 構造化された比較レポート

---

## ユースケース別の調査方法

### ケース1: エラーメッセージの解決

```
1. エラーメッセージをコピー
2. Context7でライブラリ名+エラーメッセージで検索
3. 見つからなければDeepWikiでissue検索
4. それでもダメならWebFetchでStack Overflow検索
```

### ケース2: 新しいライブラリの導入

```
1. Context7で公式ドキュメント確認
2. WebFetchでnpm trendsでトレンド確認
3. DeepWikiでGitHub issuesで既知の問題確認
4. 複数候補があれば/evaluating-toolsで比較
```

### ケース3: バージョンアップ

```
1. DeepWikiでCHANGELOG確認
2. Context7でマイグレーションガイド確認
3. WebFetchで実際の移行事例を検索
```

### ケース4: Claude Code自身の使い方

```
1. Claude Code Guideで機能仕様確認
2. 見つからなければContext7で関連ドキュメント検索
3. それでもダメならAskUserQuestionでユーザーに確認
```

---

## セキュリティ原則

### 機密情報の扱い

**IMPORTANT:** 以下の情報を外部ツールに送信禁止：

- 環境変数（`.env`ファイルの内容）
- APIキー、アクセストークン
- パスワード、認証情報
- 顧客データ、個人情報
- 社内システムのURL、IPアドレス
- プロプライエタリなコード

### 外部ツール使用時の注意

#### Context7 / DeepWiki

- **公開情報のみを問い合わせ対象**とする
- プライベートリポジトリの情報は送信しない
- 社内ライブラリ名は伏せる

**OK:**

```
質問: "Next.jsでISRを実装する方法"
```

**NG:**

```
質問: "社内の認証ライブラリ`@company/auth`でJWT検証する方法"
```

#### WebFetch

- **認証が必要なサイトは使えない**
- URLに機密情報（トークン、セッションID）が含まれていないか確認

**OK:**

```
URL: https://npmtrends.com/react-vs-vue
```

**NG:**

```
URL: https://company.atlassian.net/browse/TICKET-123?token=secret
```

### 送信前チェックリスト

- [ ] APIキー・トークンが含まれていない
- [ ] 顧客データが含まれていない
- [ ] 社内システムのURLが含まれていない
- [ ] プロプライエタリなコードが含まれていない
- [ ] 環境変数の値が含まれていない

---

## 調査の記録

重要な調査結果は、後で参照できるようにメモリに保存する：

```typescript
// Serena の write_memory を使用
write_memory({
  memory_file_name: "nextjs-isr-implementation.md",
  content: `
# Next.js ISR実装メモ

## 調査日
2026-01-23

## 参考資料
- Context7: /vercel/next.js
- 出典: https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration

## 実装方法
...
`
});
```

---

## トラブルシューティング

### Context7で見つからない場合

1. ライブラリ名のスペルミスを確認
2. バージョン指定を外してみる（`/org/project`のみ）
3. 別の表現で質問を言い換える

### 呼び出し制限に達した場合

- **1つの質問で各ツールは3回まで**
- 3回で見つからない場合は、現在の情報で判断する
- または、調査戦略を変更する（別のツールを使う）

---

## 参考資料

- [Context7公式サイト](https://context7.com/)
- [DeepWiki公式サイト](https://deepwiki.ai/)
- [npm trends](https://npmtrends.com/)
- [Moiva.io](https://moiva.io/)
