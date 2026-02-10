# git worktree 管理スキル

## 概要

git worktree を管理し、複数タスクの並列開発を可能にするスキル。
ブランチごとに独立した作業環境を作成し、コンテキストを完全に分離する。

## 着想元

松尾研究所の実践的なAIコーディング管理手法から着想を得た。

> 複数ウィンドウを常設し、モジュール単位でAIとのコンテキストを分離。1人開発でも「並列化」することで、調査・設計・実装を同時進行できます。

出典: https://zenn.dev/mkj/articles/868e0723efa060

## 特徴

- **完全なコンテキスト分離**: ブランチごとに独立した作業環境
- **ブランチ切り替え不要**: `git checkout` なしで作業可能
- **複数タスクの同時進行**: 調査・設計・実装を並列実行
- **作業状態の保持**: 各 worktree で作業状態が保持される

## 使い方

### 基本的な使用法

```bash
# worktree を作成
/worktree-manager create feature-a

# 一覧表示
/worktree-manager list

# 切り替え（パスを表示）
/worktree-manager switch feature-a

# 削除
/worktree-manager delete feature-a

# 状態確認
/worktree-manager status
```

## コマンド詳細

### 1. create - worktree の作成

```bash
/worktree-manager create <branch-name> [<path>]
```

**例:**

```bash
# デフォルトパスに作成
/worktree-manager create feature-auth

# カスタムパスを指定
/worktree-manager create feature-auth ../my-feature-auth
```

**出力:**

```
✅ worktree を作成しました

パス: /Users/kei/dotfiles-feature-auth
ブランチ: feature-auth

次のステップ:
1. 新しいターミナルウィンドウを開く
2. cd /Users/kei/dotfiles-feature-auth
3. claude
```

### 2. list - worktree の一覧表示

```bash
/worktree-manager list
```

**出力:**

```
📁 git worktree 一覧

/Users/kei/dotfiles                 29a3f9f [master]
/Users/kei/dotfiles-feature-a       abc1234 [feature-a]
/Users/kei/dotfiles-feature-b       def5678 [feature-b]

合計: 3 worktrees
```

### 3. switch - worktree の切り替え

```bash
/worktree-manager switch <branch-name>
```

**出力:**

```
📍 worktree へ移動

パス: /Users/kei/dotfiles-feature-a
ブランチ: feature-a

新しいターミナルで以下を実行:
cd /Users/kei/dotfiles-feature-a
claude
```

### 4. delete - worktree の削除

```bash
/worktree-manager delete <branch-name>
```

**確認プロンプト:**

```
⚠️ worktree を削除しますか？

パス: /Users/kei/dotfiles-feature-a
ブランチ: feature-a
未コミットの変更: なし

この操作は元に戻せません。
```

### 5. status - 状態確認

```bash
/worktree-manager status
```

**出力:**

```
📊 現在の worktree 状態

パス: /Users/kei/dotfiles-feature-a
ブランチ: feature-a
コミット: abc1234 "feat: 新機能を追加"

変更されたファイル: 3
ステージ済み: 1
未ステージ: 2

他の worktrees:
- /Users/kei/dotfiles (master)
- /Users/kei/dotfiles-feature-b (feature-b)
```

## ユースケース

### ケース1: 機能開発と調査を並列実行

**シナリオ:** 新機能を実装しながら、別のブランチで技術調査を行う。

```bash
# ターミナル1: メインブランチで調査
cd ~/dotfiles
claude
# 技術調査を実施

# ターミナル2: 機能開発
/worktree-manager create feature-new-auth
cd ~/dotfiles-feature-new-auth
claude
# 実装開始
```

### ケース2: レビューと実装を並列実行

**シナリオ:** レビュー対応と新機能開発を並列で行う。

```bash
# ターミナル1: feature-a でレビュー対応
cd ~/dotfiles-feature-a
claude
/reviewing-with-claude

# ターミナル2: feature-b で新機能開発
cd ~/dotfiles-feature-b
claude
/implement-with-review "新機能を実装"
```

### ケース3: 複数のバグ修正

**シナリオ:** 複数のバグを並列で修正する。

```bash
# worktree を作成
/worktree-manager create bugfix-login
/worktree-manager create bugfix-payment
/worktree-manager create bugfix-notification

# 各ターミナルで並列に修正
# ターミナル1: bugfix-login
# ターミナル2: bugfix-payment
# ターミナル3: bugfix-notification
```

## メリット

### 1. コンテキストの完全分離

- ブランチごとに独立した作業環境
- 他のブランチの変更に影響されない
- Claude Code の会話履歴も分離

### 2. ブランチ切り替え不要

- `git checkout` による作業状態の喪失がない
- ファイルエディタの状態が保持される
- コンパイル結果も保持される

### 3. 複数タスクの同時進行

- 調査・設計・実装を並列実行
- 待ち時間（ビルド、テスト）の有効活用
- 開発速度の向上

### 4. 作業の中断・再開が容易

- 各 worktree で作業状態が保持される
- すぐに再開できる
- タスク切り替えのコストが低い

## 注意事項

### 1. ディスク使用量

各 worktree はフルチェックアウトなので、ディスク使用量が増加する。

**目安:**
- dotfiles (50MB) → 3 worktrees で 150MB

### 2. 同じブランチを複数 worktree で使用不可

```bash
# エラー
/worktree-manager create feature-a
/worktree-manager create feature-a  # 同じブランチは使えない
```

### 3. メインリポジトリは残す

メインリポジトリ（`~/dotfiles`）は削除せず、worktree 管理用として残す。

### 4. Claude Code セッションは手動で移動

スキルはパスを表示するだけ。実際の移動はユーザーが手動で行う。

```bash
# スキルが表示するパス
cd /Users/kei/dotfiles-feature-a
claude
```

## worktree 専用設定

### .worktree-config.json

各 worktree に固有の設定を保存:

```json
{
  "branch": "feature-a",
  "purpose": "ユーザー認証機能の実装",
  "created": "2026-01-31T12:00:00Z",
  "claudeConfig": {
    "model": "sonnet"
  }
}
```

### hook での自動読み込み

```typescript
// home/.claude/hooks/auto-detect-worktree.ts

export default {
  onSessionStart: async () => {
    const worktreeConfig = await loadWorktreeConfig();
    if (worktreeConfig) {
      applyWorktreeConfig(worktreeConfig);
      return {
        message: `📁 worktree を検出: ${worktreeConfig.branch}`,
      };
    }
  }
};
```

## トラブルシューティング

### Q1: worktree が削除できない

**A:** 強制削除を試す

```bash
git worktree remove --force /path/to/worktree
```

### Q2: worktree の一覧が表示されない

**A:** git コマンドを直接実行

```bash
git worktree list
```

### Q3: ブランチが見つからない

**A:** リモートブランチを取得

```bash
git fetch origin
/worktree-manager create feature-a
```

### Q4: ディスク使用量が増えすぎる

**A:** 不要な worktree を削除

```bash
/worktree-manager list
/worktree-manager delete old-feature
```

## 今後の拡張案

### 1. worktree のアーカイブ

```bash
# 使用頻度の低い worktree をアーカイブ
/worktree-manager archive feature-old
```

### 2. worktree 間のファイル同期

```bash
# 特定のファイルを他の worktree にコピー
/worktree-manager sync .env feature-a feature-b
```

### 3. worktree のテンプレート

```bash
# テンプレートから worktree を作成
/worktree-manager create feature-c --template=backend
```

## 参考資料

- [Git worktree 公式ドキュメント](https://git-scm.com/docs/git-worktree)
- [松尾研究所の実践的なAIコーディング管理手法](https://zenn.dev/mkj/articles/868e0723efa060)

## ライセンス

MIT License

## バージョン履歴

- v1.0.0 (2026-01-31): 初版リリース
  - worktree の作成・削除・一覧・切り替え機能
  - worktree 専用設定の管理
  - hook での自動検出
