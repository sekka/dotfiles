# CLAUDE.md 自動同期更新 Hook

## 概要

重要なファイルが変更されたときに CLAUDE.md の更新を提案または自動実行する hook。
コード変更とドキュメントの同期を保ち、仕様の鮮度を維持する。

## 着想元

松尾研究所の実践的なAIコーディング管理手法から着想を得た。

> コード変更時に同期してドキュメントとテストも更新する運用。AIに「コード変更だけでなく、ドキュメント更新も任せる」ことで、参照可能な仕様を常に最新に保ちます。

出典: https://zenn.dev/mkj/articles/868e0723efa060

## 機能

### 1. 重要ファイルの変更検出

以下のファイルパターンを監視:

- **Claude Code 設定**
  - `.claude/settings.json`
  - `.claude/keybindings.json`

- **ルールファイル**
  - `.claude/rules/**/*.md`

- **スキル**
  - `.claude/skills/**/skill.json`
  - `.claude/skills/**/prompt.md`
  - `.claude/skills/**/README.md`

- **Hooks**
  - `.claude/hooks/**/*.ts`
  - `.claude/hooks/**/*.js`

- **プロジェクト設定**
  - `package.json`
  - `tsconfig.json`
  - `.gitignore`
  - `README.md`

### 2. 自動提案モード（デフォルト）

重要ファイルが変更されたら、CLAUDE.md の更新を提案:

```
📝 CLAUDE.md 更新の提案

3件の重要なファイル変更を検出しました:

- .claude/settings.json (Edit)
- .claude/skills/implement-with-review/skill.json (Write)
- .claude/hooks/auto-sync-claude-md.ts (Write)

CLAUDE.md を更新して、変更内容を反映させることを推奨します。

実行コマンド:
/claude-md-management:revise-claude-md
```

### 3. 自動同期モード（オプション）

設定を変更すると、自動的に CLAUDE.md を更新:

```typescript
const CONFIG = {
  autoSync: true,  // ← これを true に変更
  // ...
};
```

## 設定

### CONFIG オプション

```typescript
const CONFIG = {
  // 自動実行モード（true: 自動実行、false: 提案のみ）
  autoSync: false,

  // 変更を蓄積する最小間隔（ミリ秒）
  debounceMs: 5000,

  // 変更を蓄積する最大数
  maxChanges: 10,
};
```

#### autoSync

- **false（デフォルト）**: 提案のみ。ユーザーが手動で実行。
- **true**: 自動実行。変更が検出されたら自動的に CLAUDE.md を更新。

#### debounceMs

- 連続した変更を1つにまとめるための待機時間（ミリ秒）
- デフォルト: 5000ms（5秒）
- 短すぎると頻繁に通知、長すぎると遅延

#### maxChanges

- セッション中に保持する変更履歴の最大数
- デフォルト: 10
- この数を超えると古い変更は削除される

## 監視対象ファイルのカスタマイズ

`IMPORTANT_FILE_PATTERNS` を編集して監視対象を追加・削除:

```typescript
const IMPORTANT_FILE_PATTERNS = [
  // 既存のパターン
  '.claude/settings.json',
  '.claude/keybindings.json',

  // カスタムパターンを追加
  'src/**/*.ts',           // すべての TypeScript ファイル
  'tests/**/*.test.ts',    // テストファイル
  'docs/**/*.md',          // ドキュメント
];
```

### グロブパターンのサポート

- `**`: 任意の深さのディレクトリ
- `*`: 任意の文字列（パス区切り文字を除く）

**例:**

- `.claude/rules/**/*.md` → `.claude/rules/tdd-workflow.md`、`.claude/rules/security.md` にマッチ
- `.claude/skills/*/skill.json` → `.claude/skills/implement-with-review/skill.json` にマッチ

## 動作フロー

```
1. ユーザーが Edit/Write ツールでファイルを変更
   ↓
2. onToolCallEnd イベント発火
   ↓
3. 変更されたファイルが重要ファイルか判定
   ↓ YES
4. 変更履歴に追加
   ↓
5. デバウンスチェック（5秒以内の連続変更は無視）
   ↓
6. autoSync が true?
   ↓ YES                    ↓ NO
7a. CLAUDE.md を自動更新   7b. 更新を提案
   ↓                        ↓
8. 完了通知                8. ユーザーが手動実行
```

## 使用例

### 例1: スキル追加時の自動提案

```bash
# 新しいスキルを追加
/claude/skills/new-skill/skill.json を Write

# → Hook が検出
📝 CLAUDE.md 更新の提案

1件の重要なファイル変更を検出しました:
- .claude/skills/new-skill/skill.json (Write)

実行コマンド:
/claude-md-management:revise-claude-md
```

### 例2: 設定変更時の自動同期

```bash
# autoSync を true に設定
CONFIG.autoSync = true;

# settings.json を変更
.claude/settings.json を Edit

# → Hook が自動実行
✅ CLAUDE.md を自動更新しました

変更内容:
- .claude/settings.json (Edit)

更新されたファイル: .claude/CLAUDE.md
```

### 例3: 複数ファイルの一括変更

```bash
# 複数のファイルを変更
.claude/rules/tdd-workflow.md を Edit
.claude/skills/implement-with-review/prompt.md を Edit
package.json を Edit

# 5秒以内の変更は1つにまとめられる

# → Hook が検出
📝 CLAUDE.md 更新の提案

3件の重要なファイル変更を検出しました:
- .claude/rules/tdd-workflow.md (Edit)
- .claude/skills/implement-with-review/prompt.md (Edit)
- package.json (Edit)
```

## メリット

### 1. 仕様の鮮度維持

- コード変更とドキュメントの同期
- 「ドキュメントが古い」問題を解消

### 2. AI の精度向上

- CLAUDE.md が常に最新
- AI が正確な情報を参照できる

### 3. レビュー負荷の軽減

- ドキュメント更新忘れを防止
- レビュー時に「ドキュメントは？」と聞かれない

### 4. チーム全体の効率化

- 新メンバーのオンボーディング高速化
- 仕様の共有が容易

## トラブルシューティング

### Q1: 通知が多すぎる

**A:** `debounceMs` を長く設定するか、`IMPORTANT_FILE_PATTERNS` を絞る。

```typescript
const CONFIG = {
  debounceMs: 10000,  // 10秒に延長
};
```

### Q2: 特定のファイルを無視したい

**A:** `IMPORTANT_FILE_PATTERNS` から該当パターンを削除。

```typescript
// 削除例
// 'package.json',  // ← コメントアウト
```

### Q3: CLAUDE.md が見つからない

**A:** `CLAUDE_MD_PATHS` に正しいパスを追加。

```typescript
const CLAUDE_MD_PATHS = [
  '.claude/CLAUDE.md',
  'CLAUDE.md',
  'docs/CLAUDE.md',  // ← カスタムパスを追加
];
```

### Q4: autoSync で更新されない

**A:** スキル `/claude-md-management:revise-claude-md` が存在するか確認。

```bash
# スキル一覧で確認
/help
```

## 制約事項

- セッション中のみ変更履歴を保持（再起動で消える）
- 最大 `CONFIG.maxChanges` 件まで履歴を保持
- CLAUDE.md 自体の変更は監視しない（無限ループ防止）

## 今後の拡張案

### 1. 変更内容の自動分類

```typescript
// 変更タイプを自動判定
{
  type: 'skill' | 'hook' | 'rule' | 'config',
  impact: 'high' | 'medium' | 'low',
}
```

### 2. 変更内容の自動要約

```typescript
// AI による変更の要約
summarizeChanges() {
  // Task ツールで要約生成
  return Task({
    subagent_type: 'general-purpose',
    prompt: '以下の変更を要約してください...',
  });
}
```

### 3. Git コミット連携

```typescript
// コミット前に CLAUDE.md を自動更新
onBeforeCommit: async () => {
  if (changeHistory.length > 0) {
    await autoSyncClaudeMd();
  }
};
```

## 参考資料

- [松尾研究所の実践的なAIコーディング管理手法](https://zenn.dev/mkj/articles/868e0723efa060)
- `/claude-md-management:revise-claude-md` スキル
- Claude Code Hooks ドキュメント

## ライセンス

MIT License

## バージョン履歴

- v1.0.0 (2026-01-31): 初版リリース
  - 基本的な変更検出機能
  - 自動提案モード
  - 自動同期モード（オプション）
