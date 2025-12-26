---
description: REST/GraphQL APIの設計と OpenAPI 仕様の作成を支援します。エンドポイント設計、エラー処理、セキュリティ対策を含む包括的なAPI仕様を提供します。新規API設計、API仕様の標準化、インターフェース設計が必要な場合に使用してください。
---

# API設計とドキュメント

## 概要

REST/GraphQL APIの設計からドキュメント作成までを体系的に支援するスキルです。

## 実行フロー

### Step 1: 要件分析

#### 情報収集

- データモデルとビジネス要件の理解
- 利用者（クライアント）のニーズ把握
- セキュリティ・パフォーマンス要件の確認
- 既存システムとの統合要件

#### 技術選定

- **REST vs GraphQL**: ユースケースに応じた選択
- 認証方式: OAuth2、JWT、APIキー
- バージョニング戦略: URLパス、ヘッダー、クエリパラメータ
- レート制限とキャッシュ戦略

### Step 2: API設計

#### RESTful API設計

**リソース指向URL:**

```
# CRUD操作
GET    /api/v1/users          # ユーザー一覧
POST   /api/v1/users          # ユーザー作成
GET    /api/v1/users/{id}     # ユーザー取得
PUT    /api/v1/users/{id}     # ユーザー更新（全体）
PATCH  /api/v1/users/{id}     # ユーザー更新（部分）
DELETE /api/v1/users/{id}     # ユーザー削除

# ネストリソース
GET    /api/v1/users/{id}/orders    # ユーザーの注文一覧

# フィルタ・ページネーション
GET    /api/v1/users?role=admin&page=2&limit=20
```

**HTTPステータスコード:**

| コード | 用途                 | 使用例                     |
| ------ | -------------------- | -------------------------- |
| 200    | 成功（データあり）   | GET成功                    |
| 201    | 作成成功             | POST成功                   |
| 204    | 成功（データなし）   | DELETE成功                 |
| 400    | リクエスト不正       | パラメータエラー           |
| 401    | 認証エラー           | トークン無効               |
| 403    | 権限エラー           | アクセス権限なし           |
| 404    | リソース未発見       | 存在しないID               |
| 422    | バリデーションエラー | 入力値が不正               |
| 429    | レート制限           | リクエスト制限超過         |
| 500    | サーバーエラー       | 内部エラー                 |

**エラーレスポンス形式:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です",
    "details": [
      {
        "field": "email",
        "message": "有効なメールアドレスを入力してください",
        "code": "INVALID_EMAIL"
      }
    ],
    "request_id": "abc123"
  }
}
```

#### GraphQL API設計

**スキーマ定義:**

```graphql
type User {
  id: ID!
  email: String!
  name: String
  createdAt: DateTime!
  orders: [Order!]!
}

type Query {
  user(id: ID!): User
  users(filter: UserFilter, limit: Int, offset: Int): [User!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}
```

### Step 3: 認証・認可設計

#### OAuth 2.0 フロー

- **Authorization Code**: Webアプリ向け
- **PKCE**: モバイル/SPA向け
- **Client Credentials**: サーバー間通信

#### JWT構造

```json
{
  "header": { "alg": "RS256", "typ": "JWT" },
  "payload": {
    "sub": "user_id_123",
    "iat": 1234567890,
    "exp": 1234567890,
    "scope": ["read", "write"]
  }
}
```

### Step 4: ドキュメント作成

#### OpenAPI/Swagger仕様

```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0

paths:
  /users:
    get:
      summary: ユーザー一覧取得
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: 成功
```

### Step 5: バージョニング戦略

#### URL パスによるバージョニング（推奨）

```
https://api.example.com/v1/users
https://api.example.com/v2/users
```

### Step 6: レビューとフィードバック

- [ ] API設計のレビュー（一貫性、RESTful原則）
- [ ] セキュリティレビュー
- [ ] パフォーマンス要件の確認
- [ ] ドキュメントの正確性確認

## 出力成果物

1. **API設計書**: エンドポイント一覧、データモデル、認証方式
2. **OpenAPI/Swagger仕様**: 機械可読なAPI定義
3. **GraphQLスキーマ**: 型定義とリゾルバ構成
4. **APIリファレンス**: 全エンドポイントの詳細ドキュメント
5. **認証ガイド**: 認証フローと実装例
6. **クイックスタート**: 最初のAPI呼び出しまでの手順

## ベストプラクティス

1. **一貫性**: 命名規則、エラーレスポンス形式の統一
2. **セキュリティ**: HTTPS必須、適切な認証・認可、レート制限
3. **パフォーマンス**: ページネーション、キャッシュの活用
4. **開発者体験**: 明確なドキュメント、わかりやすいエラーメッセージ
5. **バージョニング**: 破壊的変更の明示、十分な移行期間

## 関連ファイル

- [TEMPLATES.md](./TEMPLATES.md) - OpenAPI/ドキュメントテンプレート
- [EXAMPLES.md](./EXAMPLES.md) - 実装例集
