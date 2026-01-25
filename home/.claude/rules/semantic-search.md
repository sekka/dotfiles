# セマンティックコード検索（grepai）

## 概要

grepai は、自然言語での「意味的な検索」を可能にするセマンティックコード検索ツール。
正規表現ではなく、コードの「意図」や「概念」で検索できる。

---

## grepai とは

### 特徴

- **セマンティック検索**: 正規表現ではなく「意味」でコードを検索
- **コールグラフ**: 関数の呼び出し元・呼び出し先をトレース
- **MCP統合**: Claude Code と連携してAIがコードベースを探索
- **プライバシー**: Ollama による 100% ローカル実行

### Ollama との関係

- grepai は Ollama の埋め込みモデル（`nomic-embed-text`）を使用
- コードをベクトル化して類似度検索を実現
- 完全にローカル実行（外部APIへの送信なし）

---

## 既存ツールとの使い分け

### デシジョンツリー

```
検索タスク開始
  ↓
正確なテキストを知っている？
  YES → Grep（高速、正確）
  NO  → 次へ
  ↓
ファイル名・パスを検索？
  YES → Glob（ファイル検索専用）
  NO  → 次へ
  ↓
自然言語での概念検索？
  YES → grepai search（セマンティック検索）
  NO  → 次へ
  ↓
関数の呼び出し関係を調査？
  YES → grepai trace（コールグラフ）
  NO  → Grep で試す
```

### ツール比較表

| 検索内容 | 最適ツール | 理由 |
|----------|------------|------|
| `"function handleError"` | **Grep** | 正確なテキストが分かっている |
| `"*.ts"` ファイル一覧 | **Glob** | ファイル名検索 |
| "エラーハンドリングのコード" | **grepai search** | 概念での検索 |
| "認証ロジック" | **grepai search** | 意味的な検索 |
| "この関数を呼んでいるコード" | **grepai trace callers** | コールグラフ |
| "この関数が呼んでいるコード" | **grepai trace callees** | コールグラフ |

---

## serena と grepai の使い分け

### serena とは

**serena** は、シンボルレベル（クラス、関数、メソッド単位）でコードを操作するMCPツール。
AST（抽象構文木）解析により、構造的な理解と精密な編集を実現する。

**主要機能:**
- `get_symbols_overview`: ファイル内のシンボル一覧を取得
- `find_symbol`: シンボルを検索（name_path パターンマッチング）
- `find_referencing_symbols`: シンボルの参照元を探索
- `replace_symbol_body`: シンボル全体の置き換え（リファクタリング）
- `insert_after_symbol`, `insert_before_symbol`: シンボルの前後に挿入
- `rename_symbol`: シンボルのリネーム

### 比較表

| 観点 | serena | grepai |
|------|--------|--------|
| **検索方式** | AST解析（構造的） | 埋め込みベクトル（意味的） |
| **検索粒度** | シンボル単位 | コード全体 |
| **検索キー** | シンボル名パターン | 自然言語 |
| **主な用途** | リファクタリング、編集 | 概念検索、コールグラフ |
| **参照元検索** | `find_referencing_symbols` | `trace callers` |
| **速度** | 高速（AST） | やや遅い（ベクトル検索） |
| **正確性** | 構造的に正確 | 意味的に柔軟 |

### 使い分けのデシジョンツリー

```
コードベース検索タスク
  ↓
編集・リファクタリングが目的？
  YES → serena（構造的操作）
  NO  → 次へ
  ↓
シンボル名が分かっている？
  YES → serena find_symbol（高速）
  NO  → 次へ
  ↓
自然言語での概念検索？
  YES → grepai search（セマンティック）
  NO  → 次へ
  ↓
参照元を調査？
  YES → serena find_referencing_symbols（構造的）
        または grepai trace callers（コールグラフ）
  NO  → Grep（テキスト検索）
```

### 具体的なユースケース

#### ケース1: "認証ロジックを見たい"

**serena の場合:**

```typescript
// シンボル名が分かっている場合
find_symbol({
  name_path_pattern: "authenticate",
  include_body: true
})
```

**grepai の場合:**

```bash
# 自然言語で概念検索
grepai search "authentication logic"
```

**推奨:** シンボル名が不明なら **grepai**、シンボル名が分かっていれば **serena**

---

#### ケース2: "この関数を呼んでいるコードを探して"

**serena の場合:**

```typescript
// 構造的に参照元を探索
find_referencing_symbols({
  name_path: "MyClass/myMethod",
  relative_path: "src/module.ts"
})
```

**grepai の場合:**

```bash
# コールグラフで呼び出し元を探索
grepai trace callers "myMethod"
```

**推奨:** 両方試して比較。serena は**構造的に正確**、grepai は**視覚的に分かりやすい**

---

#### ケース3: "このクラスをリファクタリングしたい"

**serena の場合:**

```typescript
// シンボル全体を読み込み
find_symbol({
  name_path_pattern: "MyClass",
  include_body: true,
  depth: 1  // メソッド一覧も取得
})

// 編集
replace_symbol_body({
  name_path: "MyClass/oldMethod",
  new_body: "// 新しい実装"
})
```

**grepai の場合:**

```
（編集機能なし）
```

**推奨:** リファクタリングは **serena 専用**

---

#### ケース4: "似たようなエラーハンドリングを探して"

**serena の場合:**

```
（パターンマッチングは可能だが、厳密な一致のみ）
```

**grepai の場合:**

```bash
# 類似コード検索
grepai search "error handling pattern"
```

**推奨:** 類似コード発見は **grepai 専用**

---

### 併用の推奨パターン

**Step 1: grepai で概念検索**

```bash
grepai search "user registration flow"
→ 関連ファイルを発見
```

**Step 2: serena でシンボル一覧取得**

```typescript
get_symbols_overview({
  relative_path: "src/auth/register.ts"
})
→ 関数・クラス構造を把握
```

**Step 3: serena で詳細読み込み**

```typescript
find_symbol({
  name_path_pattern: "registerUser",
  include_body: true
})
→ 実装の詳細を確認
```

**Step 4: grepai でコールグラフ確認**

```bash
grepai trace callers "registerUser"
→ 呼び出し元を可視化
```

---

## grepai の使用場面

### 1. 自然言語での概念検索

ユーザーが曖昧な表現で質問した場合、grepai で意味的に検索する。

**トリガーキーワード:**
- "〜のコードを探して"
- "〜のロジックはどこ？"
- "〜の実装を見たい"
- "〜に関連するコード"

**例:**

```
ユーザー: "ユーザー認証のロジックを見たい"

→ grepai search "user authentication logic"
```

**避けるべきケース:**

```
ユーザー: "handleLogin 関数を探して"

→ Grep で検索（関数名が明確なので正規表現の方が速い）
```

### 2. コールグラフ（関数の呼び出し関係）

関数がどこから呼ばれているか、何を呼んでいるかを調査する。

**トリガーキーワード:**
- "この関数を呼んでいるコード"
- "呼び出し元を探して"
- "この関数が使っている関数"
- "依存関係を調べて"

**例:**

```
ユーザー: "saveUser 関数を呼んでいるコードを探して"

→ grepai trace callers "saveUser"
```

```
ユーザー: "handleRequest 関数が呼んでいる関数を調べて"

→ grepai trace callees "handleRequest"
```

### 3. 類似コードの発見

似たようなパターンや実装を探す。

**トリガーキーワード:**
- "似たようなコード"
- "同じパターン"
- "参考になる実装"

**例:**

```
ユーザー: "フォームバリデーションの実装例を探して"

→ grepai search "form validation implementation"
```

---

## 使い方

### 基本コマンド

#### 初期化（プロジェクト単位）

```bash
cd /path/to/project
grepai init
grepai watch  # バックグラウンドでインデックス化
```

#### セマンティック検索

```bash
grepai search "user authentication logic"
grepai search "error handling"
grepai search "database connection"

# エイリアス
gais "error handling"
```

#### コールグラフ

```bash
# 呼び出し元を探索
grepai trace callers "functionName"
gait callers "functionName"

# 呼び出し先を探索
grepai trace callees "functionName"
gait callees "functionName"
```

---

## 実践例

### シナリオ1: 曖昧な質問への対応

**質問:** "認証まわりのコードを見たい"

**判断:**
- トリガーキーワード: "認証まわり"（曖昧）
- 正確なテキストは不明 → grepai

**実行:**

```typescript
// grepai search "authentication code"
// 結果: auth.ts, login.ts, middleware/auth.ts が見つかる
```

**回答:**

```
認証関連のコードは以下のファイルに実装されています：

- `auth.ts:23`: ユーザー認証ロジック
- `login.ts:45`: ログイン処理
- `middleware/auth.ts:12`: 認証ミドルウェア
```

---

### シナリオ2: 関数の呼び出し元調査

**質問:** "deleteUser 関数はどこから呼ばれている？"

**判断:**
- トリガーキーワード: "どこから呼ばれている"
- コールグラフ → grepai trace

**実行:**

```bash
grepai trace callers "deleteUser"
```

**回答:**

```
`deleteUser` は以下の箇所から呼ばれています：

- `admin/users.ts:89`: 管理画面からの削除
- `api/users.ts:123`: REST API エンドポイント
- `cleanup.ts:45`: 定期クリーンアップ処理
```

---

### シナリオ3: 正確なテキスト検索（Grepを使うべき）

**質問:** "handleError 関数の定義を探して"

**判断:**
- 関数名が明確 → Grep の方が速い
- grepai は使わない

**実行:**

```bash
rg "function handleError" --type ts
```

---

## 注意事項

### .grepai/ ディレクトリの管理

grepai は `.grepai/` ディレクトリにインデックスを作成する。

**対応:**
- `.gitignore_global` に `.grepai/` を追加済み
- プロジェクト固有の `.gitignore` にも追加推奨

### Ollama の起動

grepai は Ollama に依存している。

**事前準備:**

```bash
# Ollama を起動（バックグラウンド）
ollama serve &

# モデルのダウンロード（初回のみ）
ollama pull nomic-embed-text
```

**起動確認:**

```bash
ollama list
# nomic-embed-text が表示されればOK
```

### パフォーマンス

- **初回インデックス作成**: プロジェクトサイズに依存（数分〜数十分）
- **検索速度**: Grep より遅いが、意味的な検索が可能
- **推奨**: 大規模プロジェクト（10万行以上）で真価を発揮

---

## トラブルシューティング

### grepai が見つからない

```bash
# インストール確認
which grepai

# インストール
curl -sSL https://raw.githubusercontent.com/yoanbernabeu/grepai/main/install.sh | sh
```

### Ollama が起動していない

```bash
# Ollama を起動
ollama serve &

# プロセス確認
ps aux | grep ollama
```

### インデックスが古い

```bash
# 再インデックス
cd /path/to/project
grepai watch
```

---

## 参考資料

- [grepai 公式リポジトリ](https://github.com/yoanbernabeu/grepai)
- [Ollama 公式サイト](https://ollama.ai/)
- [nomic-embed-text モデル](https://ollama.ai/library/nomic-embed-text)
