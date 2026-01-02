# 実装計画: Claude Code 統計マージの重複カウント修正

## 概要

複数PCで継続的に統計バックアップ・マージを行う際の重複カウント問題を解決します。

**今回の実装:**
- **マージ方式**（メイン実装）: 各マシンのバックアップを定期的にマージ → 安全性が高い

**将来の検討事項:**
- **シンボリックリンク方式**（参考情報）: stats-cache.json を iCloud Drive に配置 → 自動同期、要検証（ユーザーが1週間後に自分で検討）

**前提条件の確認:**
- ✅ バックアップファイルは各マシンで上書き方式（最新のみ保持）→ sync スクリプトの修正不要
- ✅ lodash を導入して実装を簡素化
- ✅ 単一マシンで複数セッション同時実行が既に動作中 → ファイルロック機構あり

## 問題

現在の `merge-claude-stats.ts` は、同じ日付のデータを単純加算するため、以下のシナリオで重複カウントが発生します：

1. **同一マシンの複数世代バックアップ**: Day 1 のバックアップ（2026-01-01のデータ）と Day 2 のバックアップ（2026-01-01〜2026-01-02の累積データ）をマージすると、2026-01-01 が2回カウントされる
2. **マシン再セットアップ**: 同じマシン名で異なる時期のデータが存在する場合も同様

## 解決策

**重複排除キー**: `(date, machineName)` の組み合わせで重複を検出

**選択基準**: 同じ (date, machineName) について `lastComputedDate` が最新のデータのみを使用

**マージ方法**: 重複排除後、異なるマシンのデータは加算

### 動作例

```
File 1 (mba14, lastComputed: 2025-12-31):
  2025-12-30: 10 sessions
  2025-12-31: 5 sessions

File 2 (mba14, lastComputed: 2026-01-02):
  2025-12-31: 5 sessions  ← 重複（同じマシン、同じ日付）
  2026-01-01: 8 sessions
  2026-01-02: 3 sessions

重複排除後:
  2025-12-30: File 1 のデータ（唯一のソース）
  2025-12-31: File 2 のデータ（lastComputedDate が新しい）
  2026-01-01: File 2 のデータ（唯一のソース）
  2026-01-02: File 2 のデータ（唯一のソース）

最終結果:
  2025-12-30: 10 sessions
  2025-12-31: 5 sessions
  2026-01-01: 8 sessions
  2026-01-02: 3 sessions
```

## パッケージ導入

### package.json への追加

```json
{
  "dependencies": {
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@types/lodash": "^4.14.202"
  }
}
```

インストール:
```bash
cd ~/dotfiles/scripts/development
bun add lodash
bun add -d @types/lodash
```

## 修正ファイル

### 1. `/Users/kei/dotfiles/scripts/development/types/claude-stats.ts`

**追加する型定義:**

```typescript
/**
 * ファイル読み込み時に抽出するメタデータ
 */
export interface SourceFileMetadata {
  machineName: string;
  filePath: string;
  lastComputedDate: string;
  firstSessionDate: string;
  stats: StatsCache;
}
```

### 2. `/Users/kei/dotfiles/scripts/development/merge-claude-stats.ts`

#### 2.1 lodash のインポート（ファイル冒頭に追加）

```typescript
import { groupBy as lodashGroupBy } from "lodash";
```

#### 2.2 新規ヘルパー関数（`// Data Merging Functions` セクションの前に追加）

```typescript
/**
 * ファイルメタデータの抽出
 */
function extractFileMetadata(
  statsArray: Array<{ stats: StatsCache; machineName: string; filePath: string }>
): SourceFileMetadata[] {
  return statsArray.map(item => ({
    machineName: item.machineName,
    filePath: item.filePath,
    lastComputedDate: item.stats.lastComputedDate || "1970-01-01",
    firstSessionDate: item.stats.firstSessionDate,
    stats: item.stats,
  }));
}

/**
 * 日次アクティビティの重複を排除
 * 同一マシンの同一日付について、最新の lastComputedDate を持つデータのみを保持
 */
function deduplicateDailyActivity(
  filesWithMetadata: SourceFileMetadata[]
): DailyActivity[] {
  // 全データを展開
  const allDataWithSource: Array<{
    date: string;
    machineName: string;
    lastComputedDate: string;
    data: DailyActivity;
  }> = [];

  for (const file of filesWithMetadata) {
    for (const activity of file.stats.dailyActivity) {
      allDataWithSource.push({
        date: activity.date,
        machineName: file.machineName,
        lastComputedDate: file.lastComputedDate,
        data: activity,
      });
    }
  }

  // (date, machineName) でグループ化し、最新のデータを選択
  const grouped = lodashGroupBy(
    allDataWithSource,
    item => `${item.date}::${item.machineName}`
  );

  const deduplicated: DailyActivity[] = [];
  for (const group of Object.values(grouped)) {
    const latest = group.reduce((prev, current) =>
      current.lastComputedDate > prev.lastComputedDate ? current : prev
    );
    deduplicated.push(latest.data);
  }

  return deduplicated;
}

/**
 * 日次モデルトークンの重複を排除
 */
function deduplicateDailyModelTokens(
  filesWithMetadata: SourceFileMetadata[]
): DailyModelToken[] {
  // 全データを展開
  const allDataWithSource: Array<{
    date: string;
    machineName: string;
    lastComputedDate: string;
    data: DailyModelToken;
  }> = [];

  for (const file of filesWithMetadata) {
    for (const token of file.stats.dailyModelTokens) {
      allDataWithSource.push({
        date: token.date,
        machineName: file.machineName,
        lastComputedDate: file.lastComputedDate,
        data: token,
      });
    }
  }

  // (date, machineName) でグループ化し、最新のデータを選択
  const grouped = lodashGroupBy(
    allDataWithSource,
    item => `${item.date}::${item.machineName}`
  );

  const deduplicated: DailyModelToken[] = [];
  for (const group of Object.values(grouped)) {
    const latest = group.reduce((prev, current) =>
      current.lastComputedDate > prev.lastComputedDate ? current : prev
    );
    deduplicated.push(latest.data);
  }

  return deduplicated;
}
```

#### 2.3 既存関数の修正

**`mergeDailyActivity()` (lines 171-190) を以下に置き換え:**

```typescript
/**
 * 日次アクティビティをマージ（重複排除対応）
 */
function mergeDailyActivity(
  statsArray: Array<{ stats: StatsCache; machineName: string; filePath: string }>
): Map<string, DailyActivity> {
  // Phase 1: メタデータ抽出
  const filesWithMetadata = extractFileMetadata(statsArray);

  // Phase 2: 重複排除（同一マシンの同一日付は最新データのみ）
  const deduplicated = deduplicateDailyActivity(filesWithMetadata);

  // Phase 3: マシン間でマージ（異なるマシンのデータは加算）
  const dailyActivityMap = new Map<string, DailyActivity>();

  for (const activity of deduplicated) {
    const existing = dailyActivityMap.get(activity.date);
    if (existing) {
      // 異なるマシンのデータなので加算
      existing.messageCount += activity.messageCount;
      existing.sessionCount += activity.sessionCount;
      existing.toolCallCount += activity.toolCallCount;
    } else {
      dailyActivityMap.set(activity.date, { ...activity });
    }
  }

  return dailyActivityMap;
}
```

**`mergeDailyModelTokens()` (lines 195-218) を以下に置き換え:**

```typescript
/**
 * 日次モデル別トークンをマージ（重複排除対応）
 */
function mergeDailyModelTokens(
  statsArray: Array<{ stats: StatsCache; machineName: string; filePath: string }>
): Map<string, DailyModelToken> {
  // Phase 1: メタデータ抽出
  const filesWithMetadata = extractFileMetadata(statsArray);

  // Phase 2: 重複排除
  const deduplicated = deduplicateDailyModelTokens(filesWithMetadata);

  // Phase 3: マシン間でマージ
  const dailyModelTokenMap = new Map<string, DailyModelToken>();

  for (const token of deduplicated) {
    const existing = dailyModelTokenMap.get(token.date);
    if (existing) {
      // 同じモデルのトークンを足す、新しいモデルは追加
      for (const [modelId, count] of Object.entries(token.tokensByModel)) {
        existing.tokensByModel[modelId] = (existing.tokensByModel[modelId] || 0) + count;
      }
    } else {
      dailyModelTokenMap.set(token.date, {
        ...token,
        tokensByModel: { ...token.tokensByModel },
      });
    }
  }

  return dailyModelTokenMap;
}
```

**`mergeModelUsage()` (lines 223-247) を以下に置き換え:**

```typescript
/**
 * モデル別使用量をマージ（マシン単位で重複排除）
 */
function mergeModelUsage(
  statsArray: Array<{ stats: StatsCache; machineName: string; filePath: string }>
): Map<string, ModelUsage> {
  // Phase 1: メタデータ抽出
  const filesWithMetadata = extractFileMetadata(statsArray);

  // Phase 2: マシンごとにグループ化し、最新のファイルのみ選択
  const machineGroups = lodashGroupBy(filesWithMetadata, file => file.machineName);

  const deduplicatedFiles: SourceFileMetadata[] = [];
  for (const files of Object.values(machineGroups)) {
    const latest = files.reduce((prev, current) =>
      current.lastComputedDate > prev.lastComputedDate ? current : prev
    );
    deduplicatedFiles.push(latest);
  }

  // Phase 3: 異なるマシン間でマージ
  const modelUsageMap = new Map<string, ModelUsage>();

  for (const file of deduplicatedFiles) {
    for (const [modelId, usage] of Object.entries(file.stats.modelUsage)) {
      const existing = modelUsageMap.get(modelId);
      if (existing) {
        existing.inputTokens += usage.inputTokens;
        existing.outputTokens += usage.outputTokens;
        existing.cacheReadInputTokens += usage.cacheReadInputTokens;
        existing.cacheCreationInputTokens += usage.cacheCreationInputTokens;
        existing.webSearchRequests += usage.webSearchRequests;
        existing.costUSD += usage.costUSD;
        existing.contextWindow = Math.max(existing.contextWindow, usage.contextWindow);
      } else {
        modelUsageMap.set(modelId, { ...usage });
      }
    }
  }

  return modelUsageMap;
}
```

**`mergeHourCounts()` (lines 252-264) を以下に置き換え:**

```typescript
/**
 * 時間別カウントをマージ（マシン単位で重複排除）
 */
function mergeHourCounts(
  statsArray: Array<{ stats: StatsCache; machineName: string; filePath: string }>
): Map<string, number> {
  // Phase 1: メタデータ抽出
  const filesWithMetadata = extractFileMetadata(statsArray);

  // Phase 2: マシンごとにグループ化し、最新のファイルのみ選択
  const machineGroups = lodashGroupBy(filesWithMetadata, file => file.machineName);

  const deduplicatedFiles: SourceFileMetadata[] = [];
  for (const files of Object.values(machineGroups)) {
    const latest = files.reduce((prev, current) =>
      current.lastComputedDate > prev.lastComputedDate ? current : prev
    );
    deduplicatedFiles.push(latest);
  }

  // Phase 3: 異なるマシン間でマージ
  const hourCountsMap = new Map<string, number>();

  for (const file of deduplicatedFiles) {
    for (const [hour, count] of Object.entries(file.stats.hourCounts)) {
      hourCountsMap.set(hour, (hourCountsMap.get(hour) || 0) + count);
    }
  }

  return hourCountsMap;
}
```

**`calculateAggregatedTotals()` (lines 299-315) を以下に置き換え:**

```typescript
/**
 * 集計統計を計算（日次データから再計算）
 */
function calculateAggregatedTotals(
  statsArray: Array<{ stats: StatsCache; machineName: string; filePath: string }>,
  dailyActivityMap: Map<string, DailyActivity>
): {
  totalSessions: number;
  totalMessages: number;
  totalToolCalls: number;
} {
  // 日次データから再計算することで、重複の影響を排除
  let totalSessions = 0;
  let totalMessages = 0;
  let totalToolCalls = 0;

  for (const activity of dailyActivityMap.values()) {
    totalMessages += activity.messageCount;
    totalSessions += activity.sessionCount;
    totalToolCalls += activity.toolCallCount;
  }

  return { totalSessions, totalMessages, totalToolCalls };
}
```

#### 2.4 verbose モードでの情報出力（オプション）

`main()` 関数の「// マージ」セクション（line 880 付近）の直前に追加：

```typescript
// 重複排除の詳細レポート（verbose モード）
if (cliArgs.verbose) {
  Logger.debug("\n=== Deduplication Report ===");

  const filesWithMetadata = extractFileMetadata(statsArray);
  const machineGroups = lodashGroupBy(filesWithMetadata, f => f.machineName);

  for (const [machineName, files] of Object.entries(machineGroups)) {
    if (files.length > 1) {
      Logger.debug(`\nMachine: ${machineName}`);
      Logger.debug(`  Found ${files.length} backup generations`);

      for (const file of files) {
        Logger.debug(`    - ${file.filePath}`);
        Logger.debug(`      lastComputedDate: ${file.lastComputedDate}`);
      }

      const latest = files.reduce((prev, current) =>
        current.lastComputedDate > prev.lastComputedDate ? current : prev
      );
      Logger.debug(`  Selected: ${latest.filePath} (most recent)`);
    }
  }

  Logger.debug("\n=== End Deduplication Report ===\n");
}
```

## `/stats` コマンドでマージ結果を参照する方法（運用）

今回の修正は `merge-claude-stats.ts` のみです。`/stats` コマンドは Claude Code の組み込みコマンドで、`~/.claude/stats-cache.json` を直接参照します。

**マージ結果を `/stats` で参照したい場合の運用方法:**

```bash
# 1. マージを実行（stats-cache 形式で出力）
bun ~/dotfiles/scripts/development/merge-claude-stats.ts \
  --auto-discover-icloud \
  --format stats-cache \
  --output ~/.claude/stats-cache-merged.json

# 2. 元の stats-cache.json をバックアップ（オプション）
cp ~/.claude/stats-cache.json ~/.claude/stats-cache.json.backup

# 3. マージ結果で上書き
cp ~/.claude/stats-cache-merged.json ~/.claude/stats-cache.json

# 4. これで /stats コマンドで全マシン合算の統計が表示される
```

**注意:**
- マージ結果で上書きすると、単一マシンの統計が失われます
- 必要に応じてバックアップを取ってください
- この運用は自動化せず、必要なときに手動で実行することを推奨

## 実装の優先順位

### Phase 1: 環境準備（必須）
1. lodash のインストール

### Phase 2: コア機能（必須）
2. 型定義の追加（`types/claude-stats.ts`）
3. lodash のインポート
4. ヘルパー関数の実装（`extractFileMetadata`, 重複排除関数）
5. 既存関数の修正（5つのマージ関数）

### Phase 3: ユーザー体験（推奨）
6. verbose モードでの重複排除レポート

## テスト方法

### 手動テスト

```bash
# verbose モードで実行
bun ~/dotfiles/scripts/development/merge-claude-stats.ts \
  --auto-discover-icloud \
  --verbose \
  --format markdown \
  --output ~/test-merged.md
```

期待される結果:
- 同一マシンの複数ファイルが検出された場合、最新のデータのみ使用される旨のログが出力
- 異なるマシンのデータは加算される
- 重複カウントが発生しない

### エッジケースの確認

1. **同一マシン、複数世代**: iCloud に同じマシンの複数バックアップを配置してマージ
2. **マシン再セットアップ**: 同じマシン名、異なる時期のデータをマージ
3. **lastComputedDate 欠損**: `lastComputedDate` が空のファイルを含めてマージ

## 下位互換性

- 出力形式は変更なし（`StatsCache`, `MergedStats` の型定義は不変）
- 既存のツール（`ccusage`, `cc-wrapped`）への影響なし
- デフォルトで重複排除を有効化（旧動作への切り替えフラグは不要）

## 注意事項

### エラーハンドリング

- `lastComputedDate` が欠損している場合は `"1970-01-01"` として扱う（最も古い日付として処理）
- 各関数で適切な型チェックを実施
- Zod バリデーションでランタイムエラーを防止

### パフォーマンス

- `groupBy()` は O(n) の複雑度
- 想定される最大ファイル数: 10マシン × 100ファイル/マシン = 1000ファイル → 十分高速
- メモリ使用量: 各ファイル約3KB × 1000 = 3MB → 問題なし

## 実装後の確認

- [ ] lodash がインストールされている
- [ ] lodash のインポートが追加されている
- [ ] 型定義が追加されている
- [ ] ヘルパー関数が実装されている（lodash.groupBy を使用）
- [ ] 5つのマージ関数が修正されている
- [ ] verbose モードで重複排除レポートが表示される
- [ ] 手動テストで重複カウントが発生しない
- [ ] 既存の出力形式との互換性が保たれている

## 補足: バックアップファイルの運用

**現在の仕様（変更なし）:**
- `sync-claude-stats-to-icloud.ts` は各マシンで `stats-{machineName}.json` を**上書き保存**
- 過去のバックアップは保持されない（最新のみ）
- これにより、iCloud には各マシンの最新データのみが存在

**重複排除の動作:**
- 各マシンの最新データのみが存在するため、同一マシンの複数世代バックアップによる重複は**実質的に発生しない**
- ただし、手動でファイルをコピーした場合や、複数マシンが誤って同じファイル名を使った場合に備えて、重複排除ロジックを実装

**まとめ:**
- sync スクリプトの修正は不要
- merge スクリプトの重複排除で、あらゆるシナリオに対応可能

---

# 追加実装: iCloud Drive シンボリックリンク方式（実験的）

## 概要

`~/.claude/stats-cache.json` から iCloud Drive 上の共有ファイルへシンボリックリンクを貼ることで、全マシンで統計を自動共有します。

## メリット

1. ✅ **自動同期**: バックアップ・マージ作業が不要
2. ✅ **リアルタイム**: ほぼリアルタイムで全マシンの統計を共有
3. ✅ **シンプル**: セットアップスクリプト実行のみ

## リスク

1. ⚠️ **iCloud の同期遅延**: 数秒〜数分のラグあり
2. ⚠️ **ファイルロックの挙動**: 異なるマシン間ではロックが機能しない可能性
3. ⚠️ **競合発生**: 同時書き込み時に `(conflicted copy)` ファイルが生成される可能性
4. ⚠️ **データ破損**: 同期中の不完全な状態でファイルを読み取る可能性

## 実装内容

### 1. セットアップスクリプト: `setup-icloud-symlink.ts`

**ファイルパス**: `/Users/kei/dotfiles/scripts/development/setup-icloud-symlink.ts`

```typescript
#!/usr/bin/env bun

/**
 * iCloud Drive シンボリックリンク方式のセットアップ
 *
 * 使用方法:
 *   bun ~/dotfiles/scripts/development/setup-icloud-symlink.ts
 */

import { existsSync, symlinkSync, renameSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const ICLOUD_DIR = join(homedir(), "Library/Mobile Documents/com~apple~CloudDocs/ClaudeCodeStats");
const STATS_CACHE_LOCAL = join(homedir(), ".claude/stats-cache.json");
const STATS_CACHE_ICLOUD = join(ICLOUD_DIR, "stats-cache-shared.json");

async function setup(): Promise<void> {
  console.log("🔗 Setting up iCloud Drive symlink for stats-cache.json...\n");

  // 1. iCloud ディレクトリの作成
  if (!existsSync(ICLOUD_DIR)) {
    mkdirSync(ICLOUD_DIR, { recursive: true });
    console.log(`✅ Created iCloud directory: ${ICLOUD_DIR}`);
  }

  // 2. ローカルの stats-cache.json をバックアップ
  if (existsSync(STATS_CACHE_LOCAL)) {
    const backupPath = `${STATS_CACHE_LOCAL}.backup-${Date.now()}`;
    renameSync(STATS_CACHE_LOCAL, backupPath);
    console.log(`✅ Backed up local stats-cache.json to: ${backupPath}`);

    // 3. バックアップを iCloud にコピー（初期データとして）
    if (!existsSync(STATS_CACHE_ICLOUD)) {
      const backupFile = Bun.file(backupPath);
      const backupContent = await backupFile.json();
      await Bun.write(STATS_CACHE_ICLOUD, JSON.stringify(backupContent, null, 2));
      console.log(`✅ Copied initial data to iCloud: ${STATS_CACHE_ICLOUD}`);
    }
  } else {
    // 4. iCloud に空のファイルを作成
    if (!existsSync(STATS_CACHE_ICLOUD)) {
      const emptyStats = {
        version: 1,
        lastComputedDate: new Date().toISOString().split('T')[0],
        dailyActivity: [],
        dailyModelTokens: [],
        modelUsage: {},
        totalSessions: 0,
        totalMessages: 0,
        longestSession: {
          messageCount: 0,
          duration: 0,
          timestamp: new Date().toISOString()
        },
        firstSessionDate: new Date().toISOString(),
        hourCounts: {}
      };
      await Bun.write(STATS_CACHE_ICLOUD, JSON.stringify(emptyStats, null, 2));
      console.log(`✅ Created initial stats file in iCloud: ${STATS_CACHE_ICLOUD}`);
    }
  }

  // 5. シンボリックリンクを作成
  if (existsSync(STATS_CACHE_LOCAL)) {
    console.error(`❌ ${STATS_CACHE_LOCAL} already exists. Please remove it first.`);
    process.exit(1);
  }

  symlinkSync(STATS_CACHE_ICLOUD, STATS_CACHE_LOCAL);
  console.log(`✅ Created symlink: ${STATS_CACHE_LOCAL} -> ${STATS_CACHE_ICLOUD}`);

  console.log("\n✨ Setup complete!");
  console.log("\n⚠️  Important notes:");
  console.log("   - All machines sharing this symlink will update the same file");
  console.log("   - iCloud sync may have delays (seconds to minutes)");
  console.log("   - If conflicts occur, run the conflict resolver script");
  console.log("   - To revert, run: bun ~/dotfiles/scripts/development/revert-icloud-symlink.ts");
}

if (import.meta.main) {
  setup().catch(console.error);
}
```

### 2. 復元スクリプト: `revert-icloud-symlink.ts`

**ファイルパス**: `/Users/kei/dotfiles/scripts/development/revert-icloud-symlink.ts`

```typescript
#!/usr/bin/env bun

/**
 * iCloud Drive シンボリックリンクを解除し、ローカルファイルに戻す
 */

import { existsSync, unlinkSync, copyFileSync, lstatSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const STATS_CACHE_LOCAL = join(homedir(), ".claude/stats-cache.json");
const STATS_CACHE_ICLOUD = join(homedir(), "Library/Mobile Documents/com~apple~CloudDocs/ClaudeCodeStats/stats-cache-shared.json");

async function revert(): Promise<void> {
  console.log("🔙 Reverting iCloud symlink to local file...\n");

  // 1. シンボリックリンクかチェック
  if (!existsSync(STATS_CACHE_LOCAL)) {
    console.error(`❌ ${STATS_CACHE_LOCAL} does not exist`);
    process.exit(1);
  }

  const stats = lstatSync(STATS_CACHE_LOCAL);
  if (!stats.isSymbolicLink()) {
    console.error(`❌ ${STATS_CACHE_LOCAL} is not a symlink`);
    console.error("   Already using local file. No action needed.");
    process.exit(1);
  }

  // 2. iCloud のファイルをコピー
  if (existsSync(STATS_CACHE_ICLOUD)) {
    const tempPath = `${STATS_CACHE_LOCAL}.temp`;
    copyFileSync(STATS_CACHE_ICLOUD, tempPath);
    console.log(`✅ Copied iCloud file to temp: ${tempPath}`);

    // 3. シンボリックリンクを削除
    unlinkSync(STATS_CACHE_LOCAL);
    console.log(`✅ Removed symlink: ${STATS_CACHE_LOCAL}`);

    // 4. 一時ファイルをリネーム
    const { rename } = await import("node:fs/promises");
    await rename(tempPath, STATS_CACHE_LOCAL);
    console.log(`✅ Created local file: ${STATS_CACHE_LOCAL}`);
  } else {
    console.error(`❌ iCloud file not found: ${STATS_CACHE_ICLOUD}`);
    console.error("   Cannot restore data. Please restore from backup.");
    process.exit(1);
  }

  console.log("\n✨ Revert complete!");
  console.log("   You are now using a local stats-cache.json file.");
}

if (import.meta.main) {
  revert().catch(console.error);
}
```

### 3. 競合解決スクリプト: `resolve-icloud-conflicts.ts`

**ファイルパス**: `/Users/kei/dotfiles/scripts/development/resolve-icloud-conflicts.ts`

```typescript
#!/usr/bin/env bun

/**
 * iCloud の競合ファイルを検出し、マージする
 *
 * 使用方法:
 *   bun ~/dotfiles/scripts/development/resolve-icloud-conflicts.ts
 */

import { existsSync, readdirSync, renameSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const ICLOUD_DIR = join(homedir(), "Library/Mobile Documents/com~apple~CloudDocs/ClaudeCodeStats");

async function resolveConflicts(): Promise<void> {
  console.log("🔍 Checking for iCloud conflicted copies...\n");

  if (!existsSync(ICLOUD_DIR)) {
    console.error(`❌ iCloud directory not found: ${ICLOUD_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(ICLOUD_DIR);
  const conflictedFiles = files.filter(f => f.includes("conflicted copy"));

  if (conflictedFiles.length === 0) {
    console.log("✅ No conflicts found. All good!");
    return;
  }

  console.log(`⚠️  Found ${conflictedFiles.length} conflicted file(s):`);
  for (const file of conflictedFiles) {
    console.log(`   - ${file}`);
  }

  console.log("\n🔄 Merging conflicted files...");

  // stats-cache-shared.json とすべての競合ファイルを収集
  const mainFile = join(ICLOUD_DIR, "stats-cache-shared.json");
  const filesToMerge = [
    { path: mainFile, machineName: "main" }
  ];

  for (const file of conflictedFiles) {
    filesToMerge.push({
      path: join(ICLOUD_DIR, file),
      machineName: file.replace("stats-cache-shared ", "").replace(" (conflicted copy).json", "")
    });
  }

  // merge-claude-stats.ts を使ってマージ
  console.log("   Calling merge-claude-stats.ts...");

  const mergeScript = join(homedir(), "dotfiles/scripts/development/merge-claude-stats.ts");
  const inputArgs = filesToMerge.flatMap(f => ["--input", f.path, "--machine-name", f.machineName]);

  const proc = Bun.spawn([
    "bun",
    mergeScript,
    ...inputArgs,
    "--format", "stats-cache",
    "--output", mainFile + ".merged"
  ]);

  await proc.exited;

  if (proc.exitCode !== 0) {
    console.error("❌ Merge failed");
    process.exit(1);
  }

  // マージ結果で元のファイルを上書き
  const { rename } = await import("node:fs/promises");
  await rename(mainFile + ".merged", mainFile);
  console.log(`✅ Merged and updated: ${mainFile}`);

  // 競合ファイルをアーカイブ
  const archiveDir = join(ICLOUD_DIR, "conflicts-archive");
  if (!existsSync(archiveDir)) {
    const { mkdirSync } = await import("node:fs");
    mkdirSync(archiveDir, { recursive: true });
  }

  for (const file of conflictedFiles) {
    const oldPath = join(ICLOUD_DIR, file);
    const newPath = join(archiveDir, `${Date.now()}-${file}`);
    renameSync(oldPath, newPath);
    console.log(`✅ Archived: ${file} -> conflicts-archive/`);
  }

  console.log("\n✨ Conflict resolution complete!");
}

if (import.meta.main) {
  resolveConflicts().catch(console.error);
}
```

## テスト計画

### Phase 1: 単一マシンでの動作確認

```bash
# 1. セットアップ
bun ~/dotfiles/scripts/development/setup-icloud-symlink.ts

# 2. Claude Code を使用（複数セッション同時実行）
# → stats-cache.json が正しく更新されるか確認

# 3. iCloud の同期を確認
ls -lh ~/Library/Mobile\ Documents/com~apple~CloudDocs/ClaudeCodeStats/

# 4. 復元テスト
bun ~/dotfiles/scripts/development/revert-icloud-symlink.ts
```

### Phase 2: 2台のマシンでの同時書き込みテスト

```bash
# Machine A と Machine B で同時に:
# 1. セットアップ
bun ~/dotfiles/scripts/development/setup-icloud-symlink.ts

# 2. Claude Code を同時使用

# 3. 競合の発生を確認
ls ~/Library/Mobile\ Documents/com~apple~CloudDocs/ClaudeCodeStats/

# 4. 競合が発生した場合
bun ~/dotfiles/scripts/development/resolve-icloud-conflicts.ts
```

### Phase 3: 長期運用テスト

- 1週間程度、シンボリックリンク方式で運用
- 競合の発生頻度を記録
- データ破損が発生しないか確認

## 運用ガイドライン

### シンボリックリンク方式を使うべき場合

✅ **推奨**:
- 複数マシンでの作業頻度が高い（毎日）
- リアルタイムでの統計共有が重要
- 競合発生時に手動で解決する準備がある

❌ **非推奨**:
- データの完全性が最優先
- 自動化された運用が必要
- 競合解決の手間を避けたい

### マージ方式を使うべき場合

✅ **推奨**:
- 安全性・信頼性が最優先
- 定期的なマージ作業が許容できる
- データ破損のリスクを最小化したい

### 併用パターン

- **平常時**: シンボリックリンク方式で自動共有
- **競合発生時**: マージ方式で復旧
- **重要なタイミング**: マージ方式でバックアップ取得

## 実装の優先順位

### 今回の実装範囲（マージ方式のみ）

#### Phase 1: 環境準備
1. lodash のインストール

#### Phase 2: コア機能実装
2. 型定義の追加（`types/claude-stats.ts`）
3. lodash のインポート（`merge-claude-stats.ts`）
4. ヘルパー関数の実装（`extractFileMetadata`, 重複排除関数）
5. 既存関数の修正（5つのマージ関数）

#### Phase 3: ユーザー体験向上
6. verbose モードでの重複排除レポート

#### Phase 4: テスト
7. 手動テスト（重複カウントの確認）
8. 既存出力形式との互換性確認

### 将来の検討事項（シンボリックリンク方式）

**注意**: 以下はユーザーが1週間後に自分で検討・実装する内容です。今回は実装しません。

- セットアップスクリプトの実装
- 復元スクリプトの実装
- 競合解決スクリプトの実装
- 単一マシンでの動作テスト
- 2台のマシンでの同時書き込みテスト
- 長期運用テスト（1週間）

## 最終的な成果物

### 今回実装するもの

1. **マージ方式** (必須):
   - `merge-claude-stats.ts` (修正)
   - `types/claude-stats.ts` (型追加)
   - lodash パッケージ追加

### 将来の参考情報（プランのみ記載）

2. **シンボリックリンク方式** (参考):
   - セットアップ・復元・競合解決スクリプトの設計
   - 運用ガイドライン
   - テスト計画

   → ユーザーが1週間後に自分で実装を検討
