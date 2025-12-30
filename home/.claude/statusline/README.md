# statusline モジュール

Claude Code のステータスライン表示を管理するモジュール群です。

## ディレクトリ構造

```
statusline/
├── types.ts                    # 型定義
├── constants.ts                # デフォルト設定、定数
├── debug.ts                    # デバッグレベル制御
├── index.ts                    # モジュールエクスポート
├── validation/
│   ├── index.ts                # エクスポート
│   ├── config.ts               # isValidStatuslineConfig()
│   └── limits.ts               # isValidUsageLimits()
├── security/
│   ├── index.ts                # エクスポート
│   ├── validator.ts            # SecurityValidator クラス
│   └── sanitizer.ts            # sanitizeForLogging()
└── error/
    ├── index.ts                # エクスポート
    └── handler.ts              # ErrorCategory enum, 分類関数
```

## モジュール説明

### types.ts
全ての型定義を集約：
- `HookInput` - Claude Code hook 入力型
- `GitStatus` - Git 状態情報型
- `StatuslineConfig` - 設定型
- `UsageLimits` - API 使用制限型
- その他関連型

### constants.ts
グローバル定数：
- `colors` - ANSI カラーヘルパー
- `DEFAULT_CONFIG` - デフォルト設定
- `CACHE_TTL_MS`, `CONFIG_CACHE_TTL` - キャッシュ TTL
- `BINARY_EXTENSIONS` - バイナリファイル拡張子リスト

### debug.ts
デバッグ機能：
- `DebugLevel` 型（"off" | "basic" | "verbose"）
- `validateDebugLevel()` - 環境変数検証
- `DEBUG_LEVEL` - グローバル定数
- `debug()` - デバッグログ関数

### validation/
入力データ検証：
- `isValidStatuslineConfig()` - 設定ファイル検証
- `isValidUsageLimits()` - API レスポンス検証

### security/
セキュリティ機能：
- `SecurityValidator` クラス
  - `validatePath()` - パストトラバーサル防止
  - `validateFileSize()` - ファイルサイズ制限
  - `isBinaryExtension()` - バイナリファイル判定
- `sanitizeForLogging()` - 機密情報マスキング

### error/
統一エラーハンドリング：
- `ErrorCategory` enum - 6つのエラーカテゴリ
- `categorizeError()` - エラー分類関数
- `logCategorizedError()` - エラーログ出力関数

## 使用例

```typescript
import {
  colors,
  DEFAULT_CONFIG,
  SecurityValidator,
  sanitizeForLogging,
  isValidStatuslineConfig,
} from "./statusline/index.ts";

// カラー出力
console.log(colors.cyan("Hello"));

// セキュリティ検証
const isValid = await SecurityValidator.validatePath(cwd, filePath);

// 機密情報マスキング
const safeData = sanitizeForLogging(apiResponse);

// 設定検証
if (isValidStatuslineConfig(userConfig)) {
  // 有効な設定
}
```

## 段階的な使用法

現在、main の `statusline.ts` はそのまま機能します。
新しいモジュールは以下の用途で使用できます：

1. **新機能開発** - statusline の機能拡張時に各モジュールをインポート
2. **テスト** - ユニットテストで個別モジュールをテスト
3. **再利用** - 他のスクリプトから共通機能をインポート

## 今後の拡張

Phase 2 では以下のモジュールを追加予定：
- `git/` - Git 操作（getGitStatus, getDiffStats など）
- `format/` - フォーマット関数（カラー、日付など）
- `cache/` - キャッシュ機能
- `metrics/` - メトリクス計算
- `builder/` - statusline 構築メイン処理
