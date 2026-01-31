# git worktree 自動検出 Hook

## 概要

セッション開始時に git worktree を検出し、専用設定を読み込む hook。
worktree ごとに異なる Claude Code 設定を適用できるようにする。

## 着想元

松尾研究所の実践的なAIコーディング管理手法から着想を得た。

> 複数ウィンドウを常設し、モジュール単位でAIとのコンテキストを分離。1人開発でも「並列化」することで、調査・設計・実装を同時進行できます。

出典: https://zenn.dev/mkj/articles/868e0723efa060

## 機能

### 1. worktree の自動検出

セッション開始時に現在のディレクトリが worktree かどうかを判定。

**判定方法:**
- `.git` が通常のディレクトリではなくファイルの場合、worktree

### 2. worktree 専用設定の読み込み

`.worktree-config.json` ファイルを読み込み、worktree 固有の設定を適用。

**設定例:**

```json
{
  "branch": "feature-auth",
  "purpose": "ユーザー認証機能の実装",
  "created": "2026-01-31T12:00:00Z",
  "claudeConfig": {
    "model": "sonnet",
    "autoSync": true
  }
}
```

### 3. ウェルカムメッセージの表示

worktree 検出時にウェルカムメッセージを表示。

**出力例:**

```
📁 git worktree を検出しました

ブランチ: feature-auth
目的: ユーザー認証機能の実装
作成日: 2026/01/31
  - モデル: sonnet
  - 自動同期: ON
```

## 設定ファイル: .worktree-config.json

### 基本構造

```json
{
  "branch": "ブランチ名（必須）",
  "purpose": "worktree の目的（任意）",
  "created": "作成日時（ISO 8601形式）",
  "claudeConfig": {
    "model": "sonnet | opus | haiku",
    "autoSync": true | false,
    "カスタム設定": "..."
  }
}
```

### 例: 機能開発用 worktree

```json
{
  "branch": "feature-payment",
  "purpose": "決済機能の実装",
  "created": "2026-01-31T12:00:00Z",
  "claudeConfig": {
    "model": "sonnet",
    "autoSync": true
  }
}
```

### 例: バグ修正用 worktree

```json
{
  "branch": "bugfix-login",
  "purpose": "ログイン時のセッション切れバグ修正",
  "created": "2026-01-31T14:00:00Z",
  "claudeConfig": {
    "model": "haiku",
    "autoSync": false
  }
}
```

### 例: 調査用 worktree

```json
{
  "branch": "research-graphql",
  "purpose": "GraphQL 導入の技術調査",
  "created": "2026-01-31T16:00:00Z",
  "claudeConfig": {
    "model": "opus",
    "autoSync": false
  }
}
```

## 動作フロー

```
1. Claude Code セッション開始
   ↓
2. onSessionStart イベント発火
   ↓
3. 現在のディレクトリが worktree か判定
   ↓ YES                      ↓ NO
4. .worktree-config.json 読み込み   終了
   ↓ 存在する              ↓ 存在しない
5. 設定を適用            デフォルトメッセージ
   ↓                        ↓
6. ウェルカムメッセージ表示
```

## 設定の適用

### model の適用

```typescript
if (config.claudeConfig?.model) {
  // Claude Code のモデルを切り替え
  // （実装は Claude Code の仕様に依存）
}
```

### autoSync の適用

```typescript
if (config.claudeConfig?.autoSync !== undefined) {
  // CLAUDE.md 自動同期の有効/無効を切り替え
  // （auto-sync-claude-md.ts の CONFIG と連携）
}
```

## 使用例

### 例1: worktree 作成時に設定ファイルも作成

```bash
# worktree を作成
/worktree-manager create feature-auth

# 新しいターミナル
cd ~/dotfiles-feature-auth

# 設定ファイルを作成
cat > .worktree-config.json << EOF
{
  "branch": "feature-auth",
  "purpose": "ユーザー認証機能の実装",
  "created": "$(date -Iseconds)",
  "claudeConfig": {
    "model": "sonnet",
    "autoSync": true
  }
}
EOF

# Claude Code を起動
claude

# → hook が設定を検出して適用
```

### 例2: 既存の worktree に設定を追加

```bash
# 既存の worktree に移動
cd ~/dotfiles-feature-payment

# 設定ファイルを作成
echo '{
  "branch": "feature-payment",
  "purpose": "決済機能の実装",
  "created": "2026-01-31T12:00:00Z",
  "claudeConfig": {
    "model": "sonnet",
    "autoSync": true
  }
}' > .worktree-config.json

# Claude Code を再起動
claude

# → hook が設定を検出して適用
```

## メリット

### 1. worktree ごとの設定管理

- 各 worktree で異なるモデルを使用
- タスクに応じた設定の最適化

### 2. 作業目的の明確化

- worktree の目的を記録
- 作業の見通しが良くなる

### 3. 設定の再利用

- 同じタイプのタスクで設定を共有
- 設定のテンプレート化

## 制約事項

- 設定ファイルは各 worktree ごとに必要
- `.worktree-config.json` を `.gitignore` に追加推奨（worktree 固有の情報のため）

## .gitignore への追加

```bash
# .worktree-config.json を無視
echo ".worktree-config.json" >> .gitignore
```

## トラブルシューティング

### Q1: 設定が適用されない

**A:** `.worktree-config.json` の JSON 形式を確認。

```bash
# JSON の検証
cat .worktree-config.json | jq .
```

### Q2: ウェルカムメッセージが表示されない

**A:** worktree かどうかを確認。

```bash
# .git がファイルかディレクトリか確認
ls -la .git
```

### Q3: 設定を削除したい

**A:** `.worktree-config.json` を削除。

```bash
rm .worktree-config.json
```

## 今後の拡張案

### 1. 設定のバリデーション

```typescript
function validateConfig(config: any): config is WorktreeConfig {
  // 必須フィールドのチェック
  // 型の検証
}
```

### 2. 設定のマージ

```typescript
// グローバル設定と worktree 設定をマージ
const finalConfig = {
  ...globalConfig,
  ...worktreeConfig,
};
```

### 3. 設定のテンプレート

```bash
# テンプレートから設定を生成
/worktree-manager create feature-c --template=backend
# → backend 用の設定が自動生成
```

## 参考資料

- [Git worktree 公式ドキュメント](https://git-scm.com/docs/git-worktree)
- [松尾研究所の実践的なAIコーディング管理手法](https://zenn.dev/mkj/articles/868e0723efa060)

## ライセンス

MIT License

## バージョン履歴

- v1.0.0 (2026-01-31): 初版リリース
  - worktree の自動検出
  - worktree 専用設定の読み込み
  - ウェルカムメッセージの表示
