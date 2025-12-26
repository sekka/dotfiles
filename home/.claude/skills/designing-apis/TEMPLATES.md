# APIデザイン テンプレート

## OpenAPI 仕様テンプレート（基本構造）

```yaml
openapi: 3.1.0
info:
  title: Your API Name
  version: 1.0.0
  description: Brief description of API purpose

servers:
  - url: https://api.example.com/v1
    description: Production server

paths:
  /resource:
    get:
      summary: List resources
      operationId: listResources
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Resource'
        '400':
          description: Bad request
        '500':
          description: Server error

    post:
      summary: Create resource
      operationId: createResource
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateResourceInput'
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Resource'
        '400':
          description: Validation error

components:
  schemas:
    Resource:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
          minLength: 1
        createdAt:
          type: string
          format: date-time

    CreateResourceInput:
      type: object
      required:
        - name
      properties:
        name:
          type: string
```

## エラーレスポンス標準形式

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
}
```

## RESTful エンドポイント命名パターン

| 操作 | メソッド | エンドポイント | 説明 |
|------|---------|---------------|------|
| 一覧取得 | GET | `/resources` | すべてのリソースを取得 |
| 詳細取得 | GET | `/resources/{id}` | 特定のリソースを取得 |
| 作成 | POST | `/resources` | 新しいリソースを作成 |
| 更新（全置換） | PUT | `/resources/{id}` | リソース全体を置換 |
| 更新（部分） | PATCH | `/resources/{id}` | リソースの一部を更新 |
| 削除 | DELETE | `/resources/{id}` | リソースを削除 |

## 一般的な HTTP ステータスコード マッピング

| コード | 用途 | 説明 |
|-------|------|------|
| 200 | GET, PUT, PATCH | 成功 |
| 201 | POST | 作成成功 |
| 204 | DELETE | 削除成功（レスポンスボディなし） |
| 400 | 入力エラー | バリデーションエラー |
| 401 | 認証エラー | 認証が必要 |
| 403 | 認可エラー | 権限がない |
| 404 | 見つからない | リソースが存在しない |
| 429 | レート制限 | リクエスト数が多すぎる |
| 500 | サーバーエラー | 予期しないエラー |

## API バージョニング戦略

### オプション1：URLパス指定

```
GET /v1/resources    # バージョン1
GET /v2/resources    # バージョン2
```

### オプション2：ヘッダ指定

```
GET /resources
Accept: application/vnd.api.v2+json
```

## 認証スキーム例

### Bearer Token

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### API Key

```
X-API-Key: sk_live_xxxxxxxxxxxxx
```

### OAuth 2.0

```
Authorization: Bearer access_token_value
```
