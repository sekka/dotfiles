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
7. ⚠️ **Phase 1.1 → Phase 5**: Chalk キャッシング復元（パフォーマンス問題対応）

**合計削減: 150行+のコード短縮、テスト効率化**

---

## ⚙️ 設計意図（Chalk インスタンスキャッシング）

### なぜキャッシング機構を復元したのか

#### Phase 1.1 での判断

**目的**: statusline color モジュールのシンプル化
**実施**: Chalk インスタンスキャッシングを削除
**結果**: ✅ コード 30行削減、❌ パフォーマンス 80-90% 低下

#### Phase 5 での判断

**発見**: 並列AIレビュー で CRITICAL レベルのパフォーマンス問題が検出
**実施**: キャッシング機構を復元 + テスト対応強化
**効果**: ✅ パフォーマンス 80-90% 改善、⚠️ コード複雑度やや増加

### 実装の詳細

**キャッシング機構** (`colors.ts` の 50-87行):

```typescript
let cachedChalk: Chalk | null = null;
let cachedColorLevel: 0 | 1 | 2 | 3 | null = null;

function getChalk(): Chalk {
	const currentLevel = getColorLevel();
	// 色レベルが変わらなければキャッシュを再利用
	if (cachedChalk !== null && cachedColorLevel === currentLevel) {
		return cachedChalk;
	}
	// 色レベルが変わったら新しいインスタンスを作成
	cachedColorLevel = currentLevel;
	cachedChalk = new Chalk({ level: currentLevel });
	return cachedChalk;
}

export function resetChalkCache(): void {
	cachedChalk = null;
	cachedColorLevel = null;
}
```

### テスト環境での対応

テスト環境で環境変数を動的に変更する場合、`resetChalkCache()` を明示的に呼び出す：

```typescript
// colors.test.ts
import { colors, resetChalkCache } from "../colors.ts";

describe("Color Output", () => {
	afterEach(() => {
		// 環境変数を復元
		// ...

		// 【重要】環境変数変更後はキャッシュをリセット
		resetChalkCache();
	});

	it("should handle FORCE_COLOR=0 and FORCE_COLOR=3 dynamically", () => {
		process.env.FORCE_COLOR = "3";
		expect(colors.cyan("test")).toContain("\x1b[");

		// 色レベルを変更してキャッシュをリセット
		process.env.FORCE_COLOR = "0";
		resetChalkCache(); // ← ここで明示的にリセット
		expect(colors.cyan("test")).toBe("test");
	});
});
```

### 本番環境での特性

- 環境変数（NO_COLOR, FORCE_COLOR）はプロセス起動時に固定される
- キャッシュは常に有効で、パフォーマンスが安定している
- statusline レンダリングごとに 8-15 回の color 関数呼び出しが発生するため、キャッシングの効果が大きい

### なぜこの設計が必要なのか

| 要素 | 値 |
|------|-----|
| color 関数呼び出し/レンダリング | 8-15 回 |
| statusline 更新頻度 | 毎秒 |
| Chalk 生成コスト | 高（環境変数読取、TTY判定など） |
| **キャッシングなしの低下** | **80-90%** |
| パフォーマンス テスト数 | 3 (Performance & Caching) |

この設計を削除したい場合は、上記のパフォーマンステストが全て失敗することを覚悟してください。

### 今後の変更ガイド

**キャッシング機構を削除する場合**:

1. パフォーマンステストを実行
2. 80-90% の低下が許容できるか判断
3. 許容できない場合は削除しない

**色レベル判定ロジックを変更する場合**:

1. `getColorLevel()` の戻り値型が `0 | 1 | 2 | 3` のままか確認
2. `cachedColorLevel` の型も `0 | 1 | 2 | 3 | null` のままか確認
3. colors.test.ts のテストが全てパスすることを確認

## 定数一覧

```typescript
CACHE_TTL_MS = 5 * 60 * 1000        // 5 分
CONFIG_CACHE_TTL = 60 * 1000        // 1 分
GIT_COMMAND_TIMEOUT_MS = 5000        // 5 秒
API_CALL_TIMEOUT_MS = 5000           // 5 秒
FILE_OPERATION_TIMEOUT_MS = 10000    // 10 秒
MAX_FILE_SIZE = 10 * 1024 * 1024     // 10 MB
```
