# git worktree 管理スキル

## 目的

git worktree を管理し、複数タスクの並列開発を可能にする。
コンテキストを完全に分離し、ブランチ切り替えなしで複数のタスクを同時進行する。

---

## 着想元

松尾研究所の実践的なAIコーディング管理手法から着想を得た。

> 複数ウィンドウを常設し、モジュール単位でAIとのコンテキストを分離。1人開発でも「並列化」することで、調査・設計・実装を同時進行できます。

出典: https://zenn.dev/mkj/articles/868e0723efa060

---

## コマンド

### 1. worktree の作成

```bash
/worktree-manager create <branch-name> [<path>]
```

**例:**

```bash
# feature-a ブランチの worktree を作成
/worktree-manager create feature-a

# カスタムパスを指定
/worktree-manager create feature-b ../dotfiles-feature-b
```

**動作:**

1. 新しいブランチを作成（存在しない場合）
2. worktree を指定パスに作成
3. 初期セットアップを実行

**デフォルトパス:** `../{リポジトリ名}-{ブランチ名}`

### 2. worktree の一覧表示

```bash
/worktree-manager list
```

**出力例:**

```
📁 git worktree 一覧

/Users/kei/dotfiles                 29a3f9f [master]
/Users/kei/dotfiles-feature-a       abc1234 [feature-a]
/Users/kei/dotfiles-feature-b       def5678 [feature-b]

合計: 3 worktrees
```

### 3. worktree の切り替え

```bash
/worktree-manager switch <branch-name>
```

**例:**

```bash
# feature-a の worktree に切り替え
/worktree-manager switch feature-a
```

**動作:**

1. 指定されたブランチの worktree パスを検索
2. パスを表示
3. ユーザーに移動を促す

**注意:** Claude Code セッション自体は移動しないため、ユーザーが手動で移動する必要がある。

### 4. worktree の削除

```bash
/worktree-manager delete <branch-name>
```

**例:**

```bash
# feature-a の worktree を削除
/worktree-manager delete feature-a
```

**動作:**

1. 未コミットの変更がないか確認
2. ユーザーに確認を求める
3. worktree を削除
4. ブランチも削除するか確認

### 5. worktree の状態確認

```bash
/worktree-manager status
```

**出力例:**

```
📊 現在の worktree 状態

パス: /Users/kei/dotfiles-feature-a
ブランチ: feature-a
コミット: abc1234 "feat: 新機能を追加"

変更されたファイル: 3
ステージ済み: 1
未ステージ: 2

次の worktree:
- /Users/kei/dotfiles (master)
- /Users/kei/dotfiles-feature-b (feature-b)
```

---

## 実装詳細

### Step 1: ユーザーの意図を確認

コマンドとパラメータを解析:

```typescript
const command = parseCommand(userInput);

switch (command.action) {
  case 'create':
    await createWorktree(command.branchName, command.path);
    break;
  case 'list':
    await listWorktrees();
    break;
  case 'switch':
    await switchWorktree(command.branchName);
    break;
  case 'delete':
    await deleteWorktree(command.branchName);
    break;
  case 'status':
    await showStatus();
    break;
  default:
    showHelp();
}
```

### Step 2: git worktree コマンドを実行

Bash ツールを使用して git コマンドを実行:

```bash
# worktree 作成
git worktree add <path> -b <branch-name>

# worktree 一覧
git worktree list

# worktree 削除
git worktree remove <path>

# worktree の状態確認
git status
```

### Step 3: 結果をユーザーに報告

見やすい形式で出力:

```markdown
✅ worktree を作成しました

パス: /Users/kei/dotfiles-feature-a
ブランチ: feature-a

次のステップ:
1. 新しいターミナルウィンドウを開く
2. 以下のコマンドで移動:
   cd /Users/kei/dotfiles-feature-a
3. Claude Code を起動:
   claude
```

---

## worktree 専用設定

各 worktree に固有の設定を管理:

### .worktree-config.json

```json
{
  "branch": "feature-a",
  "purpose": "新機能の実装",
  "created": "2026-01-31T12:00:00Z",
  "claudeConfig": {
    "model": "sonnet"
  }
}
```

### 設定の読み込み

worktree に入った際に自動読み込み（hook 連携）:

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

---

## ユースケース

### ケース1: 機能開発と調査を並列実行

```bash
# メインブランチで調査
cd ~/dotfiles
claude

# 別ウィンドウで機能開発
/worktree-manager create feature-new-auth
# 新しいターミナル
cd ~/dotfiles-feature-new-auth
claude
# 実装開始
```

### ケース2: レビューと実装を並列実行

```bash
# feature-a でレビュー対応
cd ~/dotfiles-feature-a
claude

# feature-b で新機能開発
cd ~/dotfiles-feature-b
claude
```

### ケース3: 複数のバグ修正

```bash
/worktree-manager create bugfix-login
/worktree-manager create bugfix-payment
/worktree-manager create bugfix-notification

# 各 worktree で並列に修正
```

---

## メリット

### 1. コンテキストの完全分離

- ブランチごとに独立した作業環境
- 他のブランチの変更に影響されない

### 2. ブランチ切り替え不要

- `git checkout` なしで作業可能
- ファイルの状態が保持される

### 3. 複数タスクの同時進行

- 調査・設計・実装を並列実行
- 待ち時間の削減

### 4. 作業の中断・再開が容易

- 各 worktree で作業状態が保持される
- すぐに再開できる

---

## 注意事項

### 1. ディスク使用量

各 worktree はフルチェックアウトなので、ディスク使用量が増加する。

### 2. 同じブランチを複数 worktree で使用不可

```bash
# エラー
/worktree-manager create feature-a
/worktree-manager create feature-a  # 同じブランチは使えない
```

### 3. メインリポジトリは残す

メインリポジトリ（`~/dotfiles`）は削除せず、worktree 管理用として残す。

### 4. Claude Code セッションは手動で移動

スキルはパスを表示するだけ。実際の移動はユーザーが行う。

---

## トラブルシューティング

### Q1: worktree が削除できない

```bash
# 強制削除
git worktree remove --force <path>
```

### Q2: worktree の一覧が表示されない

```bash
# git worktree list を直接実行
git worktree list
```

### Q3: ブランチが見つからない

```bash
# リモートブランチを取得
git fetch origin
/worktree-manager create feature-a
```

---

## 参考資料

- [Git worktree 公式ドキュメント](https://git-scm.com/docs/git-worktree)
- [松尾研究所の実践的なAIコーディング管理手法](https://zenn.dev/mkj/articles/868e0723efa060)
