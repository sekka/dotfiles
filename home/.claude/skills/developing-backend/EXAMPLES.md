# バックエンド実装 実装例

## 認証・認可の実装パターン

### JWT トークン生成（Node.js/Express）

```javascript
const jwt = require('jsonwebtoken');

// トークン生成
function generateToken(userId) {
  return jwt.sign(
    { userId, role: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// トークン検証ミドルウェア
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// 使用例
app.post('/login', (req, res) => {
  // 認証処理...
  const token = generateToken(user.id);
  res.json({ token });
});

app.get('/profile', verifyToken, (req, res) => {
  res.json({ userId: req.user.userId });
});
```

## キャッシング戦略

### Redis キャッシュ実装（Node.js）

```javascript
const redis = require('redis');
const client = redis.createClient();

async function getUser(userId) {
  // キャッシュを確認
  const cached = await client.get(`user:${userId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // キャッシュミス時、データベースから取得
  const user = await db.users.findById(userId);

  // 24時間でキャッシュ期限切れ
  await client.setEx(
    `user:${userId}`,
    24 * 60 * 60,
    JSON.stringify(user)
  );

  return user;
}
```

### キャッシュ無効化パターン

```javascript
async function updateUser(userId, updates) {
  // データベースを更新
  const user = await db.users.update(userId, updates);

  // キャッシュを無効化
  await client.del(`user:${userId}`);

  return user;
}
```

## 入力検証パターン（Zod）

```javascript
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
  name: z.string().min(1, 'Name is required')
});

async function createUser(req, res) {
  try {
    const validated = createUserSchema.parse(req.body);
    const user = await db.users.create(validated);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }
    throw error;
  }
}
```

## エラーハンドリング パターン

### カスタムエラークラス

```javascript
class APIError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// 使用例
function validateUser(user) {
  if (!user.email) {
    throw new APIError(400, 'VALIDATION_ERROR', 'Email is required');
  }
}

// グローバルエラーハンドラー
app.use((error, req, res, next) => {
  if (error instanceof APIError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message
      }
    });
  }

  // 予期しないエラー
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});
```

## パフォーマンス最適化

### N+1 問題の解決（Eager Loading）

```javascript
// ❌ N+1 問題：各ユーザーに対してクエリが実行される
async function getUsersWithPosts() {
  const users = await db.users.find();
  for (const user of users) {
    user.posts = await db.posts.find({ userId: user.id });
  }
  return users;
}

// ✓ Eager Loading：単一クエリで関連データを取得
async function getUsersWithPosts() {
  return await db.users.find()
    .populate('posts');
}
```

### コネクションプーリング

```javascript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,           // 最大接続数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// クエリ実行
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
```

## テスト戦略

### API エンドポイントのユニットテスト（Jest）

```javascript
describe('User API', () => {
  describe('POST /users', () => {
    it('should create a user with valid data', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123',
          name: 'Test User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@example.com');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123',
          name: 'Test User'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

## セキュリティ対策

### CORS 設定

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### レート制限

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15分
  max: 100,                   // 最大100リクエスト
  message: 'Too many requests'
});

app.use('/api/', limiter);
```

### SQL インジェクション対策

```javascript
// ❌ 危険：直接クエリに埋め込み
const result = await db.query(
  `SELECT * FROM users WHERE id = ${userId}`
);

// ✓ 安全：パラメータ化クエリ
const result = await db.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);
```
