# statusline モジュール

Claude Code のステータスライン表示を管理するモジュール群。リアルタイムのセッション情報、使用量制限、Git情報、トークン使用率を表示します。

## ディレクトリ構造

```
statusline/
├── index.ts              # Public API entry point
├── colors.ts             # ANSI カラーヘルパー (chalk-based)
├── constants.ts          # 定数定義（設定、TTL値）
├── types.ts              # TypeScript 型定義
├── git.ts                # Git 情報取得
├── tokens.ts             # トークン使用率計算
├── providers.ts          # API データ取得
├── cache.ts              # キャッシング機構
├── config.ts             # ユーザー設定管理
├── utils.ts              # ユーティリティ関数
├── logging.ts            # デバッグログ
├── validation.ts         # バリデーション
└── __tests__/
    └── colors.test.ts    # カラー関数テスト (16 tests)
```

## 🎨 カラーシステム

### 利用可能な色関数

```typescript
import { colors } from "./statusline/index.ts";

colors.gray(text)        // ANSI code 90 (bright black)
colors.cyan(text)        // ANSI code 36
colors.white(text)       // ANSI code 37
colors.dimWhite(text)    // dim style + white
colors.lightGray(text)   // ANSI code 97 (bright white)
colors.yellow(text)      // ANSI code 33
colors.green(text)       // ANSI code 32
colors.red(text)         // ANSI code 91 (bright red)
colors.orange(text)      // ANSI code 208 (256-color mode)
```

### 色レベル制御

色出力は環境変数で制御可能：

```bash
# 色を無効化
NO_COLOR=1 command

# 色レベルを強制指定
FORCE_COLOR=0    # 色なし
FORCE_COLOR=1    # 16色
FORCE_COLOR=2    # 256色
FORCE_COLOR=3    # TrueColor (16M色)
FORCE_COLOR=256  # 256色 (別形式)
FORCE_COLOR=16m  # TrueColor (別形式)
FORCE_COLOR=true # 有効化
```

#### 優先度

1. `NO_COLOR=1` が設定されている → 色なし
2. `FORCE_COLOR` で明示的に指定 → その値に従う
3. TTY 接続 → TrueColor 有効
4. TTY なし (パイプ等) → 色なし

## 🧪 テスト (16 tests)

```bash
bun test ./home/.claude/statusline/__tests__/colors.test.ts
```

テストカバレッジ：
- ANSI コード出力 (3 tests)
- カラー区別 (2 tests)
- 環境変数サポート (3 tests)
- テキスト保持 (3 tests)
- エッジケース (5 tests)

## 🚀 パフォーマンス特性

- **カラー関数**: O(1) - Chalk インスタンス生成は軽量
- **キャッシング**: 5 分間のレスポンスキャッシュ
- **Git 情報**: 非同期取得、5 秒のタイムアウト

## 📝 最適化履歴 (Phase 1-5)

このモジュールは以下のリファクタリングを経ています：

1. ✅ **Phase 1.1**: Chalk キャッシング削除 (30行削減)
2. ✅ **Phase 1.2**: 未使用カラー関数削除 (50行削減)
3. ✅ **Phase 1.3-1.4**: ドキュメント簡潔化 (70行削減)
4. ✅ **Phase 1.5**: ANSI コードを color 関数に統一
5. ✅ **Phase 5**: テスト集約 (30+ → 16 tests)
6. ✅ **Phase 5**: README ドキュメント更新

**合計削減: 150行+のコード短縮、テスト効率化**

## 定数一覧

```typescript
CACHE_TTL_MS = 5 * 60 * 1000        // 5 分
CONFIG_CACHE_TTL = 60 * 1000        // 1 分
GIT_COMMAND_TIMEOUT_MS = 5000        // 5 秒
API_CALL_TIMEOUT_MS = 5000           // 5 秒
FILE_OPERATION_TIMEOUT_MS = 10000    // 10 秒
MAX_FILE_SIZE = 10 * 1024 * 1024     // 10 MB
```
