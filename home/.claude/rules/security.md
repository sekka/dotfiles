# セキュリティ原則

## 概要

セキュリティは後から追加するものではなく、設計段階から組み込むべき要素である。
機密情報の保護、セキュアコーディング、外部ツール使用時の注意事項をまとめる。

---

## 機密情報の扱い

### 定義: 機密情報とは

以下の情報を**機密情報**として扱う：

- **環境変数**
  - `.env`ファイルの内容
  - `process.env`の値
  - システム環境変数

- **認証情報**
  - APIキー、アクセストークン
  - パスワード、ハッシュ
  - OAuth クライアントシークレット
  - JWT秘密鍵

- **個人情報・顧客データ**
  - 氏名、メールアドレス、電話番号
  - クレジットカード情報
  - 住所、生年月日
  - その他のPII（Personally Identifiable Information）

- **システム情報**
  - 社内システムのURL、IPアドレス
  - データベース接続文字列
  - 内部ネットワーク構成
  - サーバー情報

- **プロプライエタリな情報**
  - 社内ライブラリのソースコード
  - ビジネスロジック
  - アルゴリズムの実装
  - 独自の設定ファイル

---

## 外部ツール使用時の注意

### Context7 / DeepWiki

#### 送信してはいけない情報

**IMPORTANT:** 以下の情報を問い合わせに含めない：

- 環境変数の値
- APIキー
- 社内システムのURL
- プロプライエタリなコード
- 顧客データ

#### 安全な使い方

**OK:**

```
質問: "Next.jsでISRを実装する方法"
```

**NG:**

```
質問: "社内認証ライブラリ`@company/auth`でJWT検証する方法"
→ 社内ライブラリ名は伏せる
```

**代替案:**

```
質問: "カスタム認証ライブラリでJWT検証する一般的な方法"
→ 一般化して質問
```

#### 公開情報のみを問い合わせ対象とする

- プライベートリポジトリの情報は送信しない
- 公開OSSライブラリのみ対象

### WebFetch

#### 認証が必要なサイトは使えない

**使用不可:**

- Google Docs（認証必要）
- Confluence（社内Wiki）
- Jira（プロジェクト管理）
- GitHub（プライベートリポジトリ）

**使用可:**

- npm trends（公開データ）
- Moiva.io（公開データ）
- MDN（公開ドキュメント）
- Stack Overflow（公開Q&A）

#### URLに機密情報が含まれていないか確認

**OK:**

```
URL: https://npmtrends.com/react-vs-vue
```

**NG:**

```
URL: https://company.atlassian.net/browse/TICKET-123?token=secret
→ URLにトークンが含まれている
```

**NG:**

```
URL: https://api.example.com/users/12345
→ 顧客データにアクセスするURL
```

---

## セキュアコーディング原則

### OWASP Top 10 対策

#### 1. インジェクション攻撃

**脆弱性:**

```javascript
// NG: SQLインジェクション
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.query(query);
```

**対策:**

```javascript
// OK: プリペアドステートメント
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

#### 2. 認証の不備

**脆弱性:**

```javascript
// NG: パスワードをそのまま保存
user.password = password;
```

**対策:**

```javascript
// OK: bcryptでハッシュ化
const bcrypt = require('bcrypt');
const saltRounds = 10;
user.password = await bcrypt.hash(password, saltRounds);
```

#### 3. 機密データの露出

**脆弱性:**

```javascript
// NG: ログにトークンを出力
console.log('Token:', token);
```

**対策:**

```javascript
// OK: トークンをマスク
console.log('Token:', token.slice(0, 4) + '****');
```

#### 4. XML外部エンティティ（XXE）

**脆弱性:**

```javascript
// NG: 外部エンティティを許可
const parser = new DOMParser();
parser.parseFromString(xmlString, 'text/xml');
```

**対策:**

```javascript
// OK: 外部エンティティを無効化
const parser = new DOMParser();
parser.setFeature('http://xml.org/sax/features/external-general-entities', false);
```

#### 5. アクセス制御の不備

**脆弱性:**

```javascript
// NG: ユーザーIDをクライアントから受け取る
app.get('/api/user/:userId', (req, res) => {
  const user = db.getUser(req.params.userId);
  res.json(user);
});
```

**対策:**

```javascript
// OK: セッションからユーザーIDを取得
app.get('/api/user/me', (req, res) => {
  const userId = req.session.userId;
  const user = db.getUser(userId);
  res.json(user);
});
```

#### 6. セキュリティ設定のミス

**脆弱性:**

```javascript
// NG: CORSを全開放
app.use(cors({ origin: '*' }));
```

**対策:**

```javascript
// OK: 特定のオリジンのみ許可
app.use(cors({
  origin: ['https://example.com', 'https://app.example.com']
}));
```

#### 7. XSS（クロスサイトスクリプティング）

**脆弱性:**

```javascript
// NG: ユーザー入力をそのまま表示
element.innerHTML = userInput;
```

**対策:**

```javascript
// OK: エスケープして表示
element.textContent = userInput;
```

#### 8. 安全でないデシリアライゼーション

**脆弱性:**

```javascript
// NG: evalを使用
eval(userInput);
```

**対策:**

```javascript
// OK: JSON.parseを使用（安全なデータのみ）
JSON.parse(userInput);
```

#### 9. 既知の脆弱性を持つコンポーネント

**脆弱性:**

```json
// NG: 古いバージョンを使用
{
  "dependencies": {
    "express": "3.0.0"
  }
}
```

**対策:**

```bash
# OK: npm auditで脆弱性チェック
npm audit
npm audit fix
```

#### 10. ログとモニタリングの不足

**脆弱性:**

```javascript
// NG: エラーを握りつぶす
try {
  riskyOperation();
} catch (e) {
  // 何もしない
}
```

**対策:**

```javascript
// OK: エラーをログに記録
try {
  riskyOperation();
} catch (e) {
  logger.error('Operation failed', { error: e.message, stack: e.stack });
  throw e;
}
```

---

## 送信前チェックリスト

外部ツール（Context7、DeepWiki、WebFetch）を使用する前に、以下を確認：

- [ ] APIキー・トークンが含まれていない
- [ ] 顧客データが含まれていない
- [ ] 社内システムのURLが含まれていない
- [ ] プロプライエタリなコードが含まれていない
- [ ] 環境変数の値が含まれていない
- [ ] パスワードやハッシュが含まれていない
- [ ] 個人情報（PII）が含まれていない

---

## deny設定とhookの役割

### deny設定（設定ファイルでの制限）

`~/.claude/settings.json` でファイルアクセスを制限：

```json
{
  "deny": [
    ".env*",
    "*.key",
    "*.pem",
    "secrets/*"
  ]
}
```

**目的:**

- Claude Codeが機密ファイルを誤って読み込むのを防ぐ
- 静的な保護層

### hooks（動的な検証）

hookでBashコマンドやファイル操作を監視：

```typescript
// hook例: .envファイルへのアクセスを検出
onToolCallStart(event) {
  if (event.tool === 'Read' && event.file_path?.includes('.env')) {
    return {
      approved: false,
      reason: '.envファイルへのアクセスは禁止されています'
    };
  }
}
```

**目的:**

- 実行時の動的な検証
- 危険なコマンド（`rm -rf`）の検出
- 機密情報の露出を防ぐ

### 2層防御

```
deny設定（静的） + hooks（動的） = 多層防御
```

---

## セキュリティレビューの実施

### レビュータイミング

以下の場合は、必ずセキュリティレビューを実施：

- 認証・認可機能の実装
- 決済処理の実装
- ユーザー入力を扱うコード
- 外部APIとの連携
- ファイルアップロード機能

### レビュー方法

1. **/reviewing-with-claude でセキュリティチェック**
   - 軽微な変更でも実施

2. **/reviewing-parallel で包括レビュー**
   - セキュリティクリティカルな機能では必須

3. **OWASP Top 10 チェックリスト**
   - 各項目を手動で確認

---

## セキュリティツール

### npm audit

```bash
# 脆弱性スキャン
npm audit

# 自動修正
npm audit fix

# 強制修正（破壊的変更含む）
npm audit fix --force
```

### ESLint セキュリティプラグイン

```bash
npm install --save-dev eslint-plugin-security
```

```json
// .eslintrc.json
{
  "plugins": ["security"],
  "extends": ["plugin:security/recommended"]
}
```

### Snyk

```bash
# インストール
npm install -g snyk

# スキャン
snyk test

# 自動修正
snyk fix
```

---

## インシデント対応

### 機密情報が漏洩した場合

#### Step 1: 影響範囲の特定

- どの機密情報が漏洩したか
- いつ漏洩したか
- 誰がアクセス可能か

#### Step 2: 即座に無効化

- APIキーをローテーション
- パスワードを変更
- トークンを失効

#### Step 3: ログ確認

- アクセスログを確認
- 不正利用の痕跡を調査

#### Step 4: 報告

- セキュリティ責任者に報告
- 必要に応じて顧客に通知

#### Step 5: 再発防止

- deny設定を追加
- hookを実装
- チームに周知

---

## 参考資料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [CWE（Common Weakness Enumeration）](https://cwe.mitre.org/)

---

## チェックリスト

コミット前に確認：

- [ ] `.env` ファイルをコミットしていない
- [ ] ハードコードされたAPIキーがない
- [ ] パスワードをハッシュ化している
- [ ] ユーザー入力をエスケープしている
- [ ] SQLインジェクション対策済み
- [ ] XSS対策済み
- [ ] CSRF対策済み
- [ ] ログに機密情報を出力していない
- [ ] `npm audit` でエラーがない
- [ ] セキュリティレビューを実施した
